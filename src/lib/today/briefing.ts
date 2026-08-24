import { createClient } from "@/lib/supabase/server";
import { getArticlesByRiver, getFeaturedArticles, getRiversByIds } from "@/lib/db";
import { listMyConfigurationsWithFly } from "@/lib/db/fly-model";
import type { Article, HatchMonth, River } from "@/types/entities";

export type UnfinishedItem = {
  id: string;
  kind: "open" | "no-notes" | "missing-fly";
  href: string;
  label: string;
};

export type WatchedRiver = {
  id: string;
  slug: string;
  name: string;
  flowNow: number | null;
  lastFishedOn: string | null;
  lastFishedFlow: number | null;
  flowVsLast: number | null;
  bestFlowMin: number | null;
  bestFlowMax: number | null;
  inBestBand: boolean | null;
};

export type ForecastDay = {
  date: string;
  weekday: string;
  precipPct: number;
  windMph: number;
};

export type WorthGoing = {
  riverName: string;
  riverSlug: string;
  sentence: string;
  days: ForecastDay[];
  pickDate: string | null;
};

export type TieNextItem = {
  name: string;
  href: string;
  reason: string;
};

export type DeskNote = {
  title: string;
  slug: string;
  excerpt: string;
};

export type Briefing = {
  displayName: string | null;
  unfinished: UnfinishedItem[];
  water: WatchedRiver[];
  worthGoing: WorthGoing | null;
  tieNext: TieNextItem[];
  desk: DeskNote[];
  emptyWatchlist: boolean;
};

type GaugeConfig = { site_id: string; name?: string; section?: string };

function parseGauges(raw: unknown): GaugeConfig[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    const t = raw.trim();
    if (t.startsWith("[")) {
      try {
        return JSON.parse(t) as GaugeConfig[];
      } catch {
        return [];
      }
    }
    if (t) return [{ site_id: t }];
    return [];
  }
  if (Array.isArray(raw)) return raw as GaugeConfig[];
  return [];
}

function siteIdFor(river: River): string | null {
  const gauges = parseGauges(river.usgsGaugeId);
  return gauges[0]?.site_id ?? null;
}

async function fetchCurrentFlows(siteIds: string[]): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  const unique = [...new Set(siteIds.filter(Boolean))];
  if (unique.length === 0) return out;
  try {
    const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${unique.join(",")}&parameterCd=00060&siteStatus=all`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 900 } });
    if (!res.ok) return out;
    const data = (await res.json()) as {
      value?: { timeSeries?: Array<{ sourceInfo?: { siteCode?: { value: string }[] }; values?: Array<{ value?: Array<{ value: string }> }> }> };
    };
    for (const ts of data.value?.timeSeries ?? []) {
      const site = ts.sourceInfo?.siteCode?.[0]?.value;
      const raw = ts.values?.[0]?.value?.[0]?.value;
      if (!site || !raw || raw === "-999999") continue;
      const n = Number(raw);
      if (Number.isFinite(n)) out.set(site, Math.round(n));
    }
  } catch {
    /* USGS optional */
  }
  return out;
}

async function fetchDailyFlow(siteId: string, date: string): Promise<number | null> {
  try {
    const url = `https://waterservices.usgs.gov/nwis/dv/?format=json&sites=${siteId}&parameterCd=00060&startDT=${date}&endDT=${date}&statCd=00003`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      value?: { timeSeries?: Array<{ values?: Array<{ value?: Array<{ value: string }> }> }> };
    };
    const raw = data.value?.timeSeries?.[0]?.values?.[0]?.value?.[0]?.value;
    if (!raw || raw === "-999999") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.round(n) : null;
  } catch {
    return null;
  }
}

async function fetchFiveDay(lat: number, lng: number): Promise<ForecastDay[]> {
  if (!lat || !lng) return [];
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_probability_max,wind_speed_10m_max&wind_speed_unit=mph&forecast_days=5&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      daily?: { time?: string[]; precipitation_probability_max?: number[]; wind_speed_10m_max?: number[] };
    };
    const times = data.daily?.time ?? [];
    return times.map((date, i) => {
      const d = new Date(`${date}T12:00:00`);
      return {
        date,
        weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
        precipPct: Math.round(data.daily?.precipitation_probability_max?.[i] ?? 0),
        windMph: Math.round(data.daily?.wind_speed_10m_max?.[i] ?? 0),
      };
    });
  } catch {
    return [];
  }
}

function currentMonthName(): string {
  return new Date().toLocaleDateString("en-US", { month: "long" }).toLowerCase();
}

function monthMatches(entry: string, target: string): boolean {
  const a = entry.trim().toLowerCase();
  return a === target || a.startsWith(target.slice(0, 3)) || target.startsWith(a.slice(0, 3));
}

function hatchesThisMonth(chart: HatchMonth[] | undefined): string[] {
  if (!chart?.length) return [];
  const month = currentMonthName();
  const row = chart.find((m) => monthMatches(m.month, month));
  return (row?.hatches ?? []).map((h) => h.pattern).filter(Boolean);
}

function cfs(n: number): string {
  return `${n.toLocaleString("en-US")} cfs`;
}

export async function loadBriefing(): Promise<Briefing | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username")
    .eq("user_id", user.id)
    .maybeSingle();

  const [{ data: favs }, { data: sessions }, { data: catches }, tieNextCfgs] = await Promise.all([
    supabase
      .from("user_favorites")
      .select("entity_id")
      .eq("user_id", user.id)
      .eq("entity_type", "river")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("fishing_sessions")
      .select("id, date, river_id, river_name, notes, total_fish")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(80),
    supabase
      .from("catches")
      .select("id, session_id, fly_name, fly_pattern_id, canonical_fly_id")
      .eq("user_id", user.id)
      .limit(400),
    listMyConfigurationsWithFly({ tieNextOnly: true }),
  ]);

  const sessionList = sessions ?? [];
  const catchList = catches ?? [];
  const today = new Date().toISOString().slice(0, 10);

  const unfinished: UnfinishedItem[] = [];
  for (const s of sessionList) {
    if (s.date === today) {
      unfinished.push({
        id: `open-${s.id}`,
        kind: "open",
        href: `/journal/${s.id}`,
        label: `Open session on ${s.river_name || "the water"}`,
      });
    } else if (!s.notes || !String(s.notes).trim()) {
      unfinished.push({
        id: `notes-${s.id}`,
        kind: "no-notes",
        href: `/journal/${s.id}`,
        label: `${s.river_name || "A session"} on ${s.date} has no notes`,
      });
    }
    if (unfinished.length >= 4) break;
  }
  const sessionsById = new Map(sessionList.map((s) => [s.id, s]));
  for (const c of catchList) {
    const hasFly = Boolean(c.fly_name?.trim() || c.fly_pattern_id || c.canonical_fly_id);
    if (hasFly) continue;
    const s = sessionsById.get(c.session_id);
    unfinished.push({
      id: `fly-${c.id}`,
      kind: "missing-fly",
      href: s ? `/journal/${s.id}` : "/journal",
      label: `A catch${s?.river_name ? ` on ${s.river_name}` : ""} is missing a fly`,
    });
    if (unfinished.filter((u) => u.kind === "missing-fly").length >= 2) break;
  }

  const watchedIds = (favs ?? []).map((f) => f.entity_id as string);
  const rivers = await getRiversByIds(watchedIds);
  const riverById = new Map(rivers.map((r) => [r.id, r]));
  const orderedRivers = watchedIds
    .map((id) => riverById.get(id))
    .filter((r): r is River => Boolean(r))
    .slice(0, 6);

  const siteIds = orderedRivers.map(siteIdFor).filter((id): id is string => Boolean(id));
  const currentFlows = await fetchCurrentFlows(siteIds);

  const water: WatchedRiver[] = [];
  for (const river of orderedRivers) {
    const site = siteIdFor(river);
    const flowNow = site ? currentFlows.get(site) ?? null : null;
    const mine = sessionList.filter((s) => s.river_id === river.id);
    const last = mine[0] ?? null;
    const lastFishedFlow = last && site ? await fetchDailyFlow(site, last.date) : null;
    const scored = mine
      .map((s) => ({ s, fish: s.total_fish || 0 }))
      .sort((a, b) => b.fish - a.fish)
      .slice(0, 3);
    const bestFlows = site
      ? (
          await Promise.all(scored.map((row) => fetchDailyFlow(site, row.s.date)))
        ).filter((f): f is number => f != null)
      : [];
    const bestFlowMin = bestFlows.length ? Math.min(...bestFlows) : null;
    const bestFlowMax = bestFlows.length ? Math.max(...bestFlows) : null;
    const inBestBand =
      flowNow != null && bestFlowMin != null && bestFlowMax != null
        ? flowNow >= bestFlowMin && flowNow <= bestFlowMax
        : null;
    water.push({
      id: river.id,
      slug: river.slug,
      name: river.name,
      flowNow,
      lastFishedOn: last?.date ?? null,
      lastFishedFlow,
      flowVsLast: flowNow != null && lastFishedFlow != null ? flowNow - lastFishedFlow : null,
      bestFlowMin,
      bestFlowMax,
      inBestBand,
    });
  }

  let worthGoing: WorthGoing | null = null;
  const top = orderedRivers[0];
  const topWater = water[0];
  if (top) {
    const days = await fetchFiveDay(top.latitude, top.longitude);
    if (days.length > 0) {
      const pick = [...days].sort((a, b) => a.precipPct - b.precipPct || a.windMph - b.windMph)[0];
      const parts: string[] = [];
      parts.push(`${pick.weekday} is the driest of the next five on ${top.name}.`);
      if (topWater?.flowNow != null && topWater.flowVsLast != null && topWater.lastFishedOn) {
        const dir = topWater.flowVsLast === 0 ? "the same as" : topWater.flowVsLast > 0 ? `${cfs(topWater.flowVsLast)} above` : `${cfs(Math.abs(topWater.flowVsLast))} below`;
        parts.push(`Flow is ${cfs(topWater.flowNow)}, ${dir} the last day you fished it.`);
      } else if (topWater?.flowNow != null) {
        parts.push(`Flow now is ${cfs(topWater.flowNow)}.`);
      }
      if (topWater?.inBestBand === true && topWater.bestFlowMin != null && topWater.bestFlowMax != null) {
        parts.push(`That sits inside the ${cfs(topWater.bestFlowMin)}–${cfs(topWater.bestFlowMax)} band your better days happened in.`);
      } else if (topWater?.inBestBand === false && topWater.bestFlowMin != null && topWater.bestFlowMax != null) {
        parts.push(`Your better days were ${cfs(topWater.bestFlowMin)}–${cfs(topWater.bestFlowMax)}.`);
      }
      worthGoing = {
        riverName: top.name,
        riverSlug: top.slug,
        sentence: parts.join(" "),
        days,
        pickDate: pick.date,
      };
    }
  }

  const hatchPatterns = new Set(orderedRivers.flatMap((r) => hatchesThisMonth(r.hatchChart)));
  const tieNext: TieNextItem[] = [];
  const seenFly = new Set<string>();
  for (const c of tieNextCfgs) {
    if (tieNext.length >= 3) break;
    if (seenFly.has(c.fly.id)) continue;
    const onHand = (c.tied_count || 0) + (c.bought_count || 0);
    const short = c.tie_next_status === "wanted" || c.tie_next_status === "at_vise" || onHand < (c.target_count || 1);
    if (!short && !c.is_tie_next) continue;
    seenFly.add(c.fly.id);
    const hatchHit = [...hatchPatterns].find((p) => p.toLowerCase() === c.fly.name.toLowerCase());
    tieNext.push({
      name: c.fly.name,
      href: `/flies/${c.fly.slug}`,
      reason: hatchHit
        ? `Hatching on water you watch · ${onHand} on hand`
        : c.tie_next_status === "at_vise"
          ? "On the vise"
          : `Short for water you fish · ${onHand} on hand`,
    });
  }

  const deskArticles: Article[] = [];
  const seenArticle = new Set<string>();
  for (const river of orderedRivers) {
    const related = await getArticlesByRiver(river.id);
    for (const a of related) {
      if (seenArticle.has(a.id)) continue;
      seenArticle.add(a.id);
      deskArticles.push(a);
      if (deskArticles.length >= 2) break;
    }
    if (deskArticles.length >= 2) break;
  }
  if (deskArticles.length < 2) {
    for (const a of await getFeaturedArticles()) {
      if (seenArticle.has(a.id)) continue;
      deskArticles.push(a);
      if (deskArticles.length >= 2) break;
    }
  }

  return {
    displayName: (profile?.display_name as string | null) || (profile?.username as string | null) || null,
    unfinished: unfinished.slice(0, 5),
    water,
    worthGoing,
    tieNext,
    desk: deskArticles.map((a) => ({
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
    })),
    emptyWatchlist: orderedRivers.length === 0,
  };
}
