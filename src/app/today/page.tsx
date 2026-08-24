import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { POST_LOGIN_PATH } from "@/lib/auth-paths";
import { listMyFavoriteSections } from "@/lib/db/favorite-sections";
import { listMyConfigurationsWithFly } from "@/lib/db/fly-model";
import { getFeaturedArticles, getArticlesByRiver } from "@/lib/db/articles";
import TodayBriefing, { type TodayBriefingData } from "./TodayBriefing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Today",
  description: "A briefing for the day — your water, what to tie, what to read.",
  robots: { index: false, follow: false },
};

const PARAM_DISCHARGE = "00060";

async function liveCfs(siteIds: string[]): Promise<Map<string, { cfs: number; observedAt: string }>> {
  const out = new Map<string, { cfs: number; observedAt: string }>();
  const ids = siteIds.filter(Boolean);
  if (ids.length === 0) return out;
  const url =
    `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${ids.join(",")}` +
    `&parameterCd=${PARAM_DISCHARGE}&siteStatus=all`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return out;
    const data = (await res.json()) as {
      value?: {
        timeSeries?: Array<{
          sourceInfo?: { siteCode?: Array<{ value?: string }> };
          variable?: { variableCode?: Array<{ value?: string }> };
          values?: Array<{ value?: Array<{ value?: string; dateTime?: string }> }>;
        }>;
      };
    };
    for (const series of data.value?.timeSeries ?? []) {
      const code = series.variable?.variableCode?.[0]?.value;
      if (code !== PARAM_DISCHARGE) continue;
      const siteId = series.sourceInfo?.siteCode?.[0]?.value;
      const point = series.values?.[0]?.value?.[0];
      if (!siteId || !point?.value) continue;
      const cfs = Number(point.value);
      if (!Number.isFinite(cfs)) continue;
      out.set(siteId, { cfs, observedAt: point.dateTime ?? "" });
    }
  } catch {
    return out;
  }
  return out;
}

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=${POST_LOGIN_PATH}`);

  const [favoriteSections, tieNext, openSessions, bareCatches] = await Promise.all([
    listMyFavoriteSections(),
    listMyConfigurationsWithFly({ tieNextOnly: true }),
    supabase
      .from("fishing_sessions")
      .select("id, date, river_name, notes")
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
  ]);

  const watched = favoriteSections.slice(0, 6);
  const gauges = await liveCfs(watched.map((s) => s.usgs_site_id));

  const lastOnTop = watched[0]
    ? await supabase
        .from("fishing_sessions")
        .select("date, river_name")
        .eq("user_id", user.id)
        .eq("river_id", watched[0].river_id)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => data ?? null)
    : null;

  const riverNotes = watched[0]
    ? await getArticlesByRiver(watched[0].river_id)
    : [];
  const featured = await getFeaturedArticles();
  const desk = (riverNotes.length > 0 ? riverNotes : featured).slice(0, 2);

  const unfinished = [
    ...openSessions.map((s) => ({
      kind: "notes" as const,
      href: `/journal/${s.id}`,
      label: s.river_name ? `${s.river_name} — no notes` : "Session with no notes",
      date: s.date as string,
    })),
    ...bareCatches.map((c) => ({
      kind: "fly" as const,
      href: `/journal/${c.session_id}`,
      label: c.species ? `${c.species} — fly missing` : "Catch with no fly",
      date: "",
    })),
  ].slice(0, 4);

  const data: TodayBriefingData = {
    unfinished,
    water: watched.map((s) => {
      const live = gauges.get(s.usgs_site_id);
      return {
        name: s.river_name,
        section: s.section_name,
        slug: s.river_slug,
        cfs: live?.cfs ?? null,
        href: `/rivers/${s.river_slug}`,
      };
    }),
    worthGoing: watched[0]
      ? {
          name: watched[0].river_name,
          slug: watched[0].river_slug,
          cfs: gauges.get(watched[0].usgs_site_id)?.cfs ?? null,
          lastFished: lastOnTop?.date ?? null,
        }
      : null,
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
