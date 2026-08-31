import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listMyFavoriteSections } from "@/lib/db/favorite-sections";
import { listMyConfigurationsWithFly } from "@/lib/db/fly-model";
import { getFeaturedArticles, getArticlesByRiver } from "@/lib/db/articles";
import {
  buildFiveDayOutlook,
  deriveBestWindow,
} from "@/lib/today/worth-window";
import {
  PARAM_DISCHARGE,
  fetchLatest,
  latestBySiteParam,
} from "@/lib/usgs/client";
import TodayBriefing, { type TodayBriefingData } from "./TodayBriefing";
import TodaySignedOut from "./TodaySignedOut";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Today",
  description: "A briefing for the day — your water, what to tie, what to read.",
  robots: { index: false, follow: false },
};

async function liveCfs(siteIds: string[]): Promise<Map<string, { cfs: number; observedAt: string }>> {
  const out = new Map<string, { cfs: number; observedAt: string }>();
  const ids = siteIds.filter(Boolean);
  if (ids.length === 0) return out;
  try {
    const grouped = latestBySiteParam(await fetchLatest(ids, [PARAM_DISCHARGE]));
    for (const [siteId, byParam] of grouped) {
      const discharge = byParam.get(PARAM_DISCHARGE);
      if (!discharge) continue;
      out.set(siteId, { cfs: discharge.value, observedAt: discharge.dateTime });
    }
  } catch {
    return out;
  }
  return out;
}

async function fiveDayWeather(lat: number, lng: number) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&daily=temperature_2m_max,weather_code&temperature_unit=fahrenheit&timezone=America%2FDenver&forecast_days=5`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()) as {
      daily?: {
        time: string[];
        temperature_2m_max?: (number | null)[];
        weather_code?: (number | null)[];
      };
    };
  } catch {
    return null;
  }
}

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <TodaySignedOut />;
  }

  const [favoriteSections, tieNext, openSessions, bareCatches, sessionCount] = await Promise.all([
    listMyFavoriteSections(),
    listMyConfigurationsWithFly({ tieNextOnly: true }),
    supabase
      .from("fishing_sessions")
      .select("id, date, river_name, notes, total_fish")
      .eq("user_id", user.id)
      .or("notes.is.null,notes.eq.")
      .order("date", { ascending: false })
      .limit(3)
      .then(({ data }) => data ?? []),
    supabase
      .from("catches")
      .select("id, session_id, species, fly_name")
      .eq("user_id", user.id)
      .or("fly_name.is.null,fly_name.eq.")
      .limit(5)
      .then(({ data }) => data ?? []),
    supabase
      .from("fishing_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => count ?? 0),
  ]);

  const watched = favoriteSections.slice(0, 6);
  const riverIds = watched.map((s) => s.river_id);
  const gauges = await liveCfs(watched.map((s) => s.usgs_site_id));

  const [lastSessions, riverCoords] = await Promise.all([
    riverIds.length > 0
      ? supabase
          .from("fishing_sessions")
          .select("river_id, date, river_flow_cfs, total_fish")
          .eq("user_id", user.id)
          .in("river_id", riverIds)
          .order("date", { ascending: false })
          .then(({ data }) => data ?? [])
      : Promise.resolve([]),
    riverIds.length > 0
      ? supabase
          .from("rivers")
          .select("id, latitude, longitude")
          .in("id", riverIds)
          .then(({ data }) => data ?? [])
      : Promise.resolve([]),
  ]);

  const lastByRiver = new Map<
    string,
    { date: string; river_flow_cfs: number | null; total_fish: number | null }
  >();
  for (const row of lastSessions) {
    if (!lastByRiver.has(row.river_id)) {
      lastByRiver.set(row.river_id, {
        date: row.date,
        river_flow_cfs: row.river_flow_cfs,
        total_fish: row.total_fish,
      });
    }
  }

  const coordByRiver = new Map(
    riverCoords.map((r) => [r.id, { lat: r.latitude, lng: r.longitude }]),
  );

  const top = watched[0] ?? null;
  let worthDays: TodayBriefingData["worthGoing"] = null;

  if (top) {
    const coords = coordByRiver.get(top.river_id);
    const weather = coords ? await fiveDayWeather(coords.lat, coords.lng) : null;
    const topSessions = lastSessions.filter((s) => s.river_id === top.river_id);
    const best = deriveBestWindow(
      topSessions.map((s) => ({
        river_flow_cfs: s.river_flow_cfs,
        total_fish: s.total_fish,
      })),
    );
    const currentCfs = gauges.get(top.usgs_site_id)?.cfs ?? null;
    const days = buildFiveDayOutlook(
      weather?.daily ?? null,
      best,
      currentCfs,
      top.river_name,
    );

    worthDays = {
      name: top.river_name,
      slug: top.river_slug,
      cfs: currentCfs,
      days,
    };
  }

  const riverNotes = top ? await getArticlesByRiver(top.river_id) : [];
  const featured = await getFeaturedArticles();
  const desk = (riverNotes.length > 0 ? riverNotes : featured).slice(0, 2);

  const sessionFish = new Map(
    openSessions.map((s) => [s.id, s.total_fish as number | null]),
  );

  const unfinished: TodayBriefingData["unfinished"] = [
    ...openSessions.map((s) => ({
      kind: "notes" as const,
      href: `/journal/${s.id}`,
      label: s.river_name ? `${s.river_name} — no notes` : "Session with no notes",
      date: s.date as string,
      fishCount: sessionFish.get(s.id) ?? null,
    })),
    ...bareCatches.map((c) => ({
      kind: "fly" as const,
      href: `/journal/${c.session_id}`,
      label: c.species ? `${c.species} — fly missing` : "Catch with no fly",
      date: "",
      fishCount: null,
    })),
  ].slice(0, 4);

  const data: TodayBriefingData = {
    sessionCount,
    unfinished,
    water: watched.map((s) => {
      const live = gauges.get(s.usgs_site_id);
      const last = lastByRiver.get(s.river_id);
      return {
        name: s.river_name,
        section: s.section_name,
        slug: s.river_slug,
        cfs: live?.cfs ?? null,
        href: `/rivers/${s.river_slug}`,
        lastCfs: last?.river_flow_cfs ?? null,
        lastFishedDate: last?.date ?? null,
      };
    }),
    worthGoing: worthDays,
    tieNext: tieNext
      .filter((c) => c.tie_next_status === "wanted" || c.tie_next_status === "at_vise")
      .slice(0, 3)
      .map((c) => ({
        name: c.fly.name,
        href: `/flies/${c.fly.slug}`,
        status: c.tie_next_status ?? "wanted",
      })),
    desk: desk.map((a) => ({
      title: a.title,
      href: `/articles/${a.slug}`,
      excerpt: a.excerpt,
    })),
  };

  return <TodayBriefing data={data} />;
}
