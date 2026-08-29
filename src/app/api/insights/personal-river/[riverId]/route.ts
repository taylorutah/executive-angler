import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildFlyLogEvents,
  collectReferencedFlyIds,
  computeTopFly,
} from "@/lib/insights/top-fly";

/**
 * Personal River Scorecard — owner-only stats for THIS river. Replaces
 * the old public "RiverAnglerIntel advanced stats" with the same shapes,
 * but filtered to the signed-in user's own sessions and catches.
 *
 * Status codes:
 *   401 → not signed in (UI shows nothing)
 *   200 → full stats for the signed-in user
 */

export interface PersonalRiverScorecard {
  riverId: string;
  totalSessions: number;
  sessions30d: number;
  totalFish: number;
  avgFishPerSession: number | null;
  biggestFishInches: number | null;
  topFlyName: string | null;
  bestSection: { section: string; sessionCount: number; avgFish: number } | null;
  bestTimeOfDay: { period: "morning" | "midday" | "afternoon" | "evening"; label: string; avgFish: number } | null;
  bestMonth: { month: string; avgFish: number } | null;
  topGear: { rodBrand: string | null; leader: string | null; tippet: string | null } | null;
  lastSessionDate: string | null;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const PERIODS = [
  { key: "morning" as const, label: "Morning (5–9am)", min: 5, max: 9 },
  { key: "midday" as const, label: "Midday (10am–12pm)", min: 10, max: 12 },
  { key: "afternoon" as const, label: "Afternoon (1–5pm)", min: 13, max: 17 },
  { key: "evening" as const, label: "Evening (5–8pm)", min: 17, max: 20 },
];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ riverId: string }> }
) {
  const { riverId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ago30 = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const { data: sessions } = await supabase
    .from("fishing_sessions")
    .select("id, date, total_fish, section, gear_rod_id, gear_leader_id, gear_tippet_id")
    .eq("user_id", user.id)
    .eq("river_id", riverId)
    .order("date", { ascending: false });

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({
      riverId,
      totalSessions: 0,
      sessions30d: 0,
      totalFish: 0,
      avgFishPerSession: null,
      biggestFishInches: null,
      topFlyName: null,
      bestSection: null,
      bestTimeOfDay: null,
      bestMonth: null,
      topGear: null,
      lastSessionDate: null,
    } satisfies PersonalRiverScorecard);
  }

  const sessionIds = sessions.map((s) => s.id);

  const { data: catches } = await supabase
    .from("catches")
    .select("session_id, length_inches, fly_size, fly_name, fly_pattern_id, canonical_fly_id, time_caught, quantities")
    .in("session_id", sessionIds);

  const { data: rigs } = await supabase
    .from("session_rigs")
    .select("session_id, fly_name, fly_pattern_id")
    .in("session_id", sessionIds);

  // Top-line stats
  const totalFish = sessions.reduce((a, s) => a + (s.total_fish ?? 0), 0);
  const sessionsWithFish = sessions.filter((s) => (s.total_fish ?? 0) > 0);
  const avgFishPerSession =
    sessionsWithFish.length > 0
      ? Math.round((sessionsWithFish.reduce((a, s) => a + (s.total_fish ?? 0), 0) / sessionsWithFish.length) * 10) / 10
      : null;

  // Biggest fish
  const lengths = (catches || [])
    .filter((c) => c.length_inches != null)
    .map((c) => Number(c.length_inches));
  const biggestFishInches = lengths.length > 0 ? Math.round(Math.max(...lengths) * 10) / 10 : null;

  const flyRefs = [...(catches || []), ...(rigs || [])];
  const referencedFlyIds = collectReferencedFlyIds(flyRefs);
  const { data: rawFlies } = referencedFlyIds.length > 0
    ? await supabase
        .from("flies")
        .select("id, name")
        .in("id", referencedFlyIds)
        .is("deleted_at", null)
    : { data: [] };
  const flyNameById = new Map(
    (rawFlies ?? []).map((f) => [f.id as string, f.name as string]),
  );
  const sessionDateById = new Map(sessions.map((s) => [s.id as string, s.date as string]));
  const topFly = computeTopFly(
    buildFlyLogEvents({
      catches: catches || [],
      rigs: rigs || [],
      sessionDateById,
      flyNameById,
    }),
  );
  const topFlyName = topFly?.name ?? null;

  // Best section
  const sectionMap = new Map<string, { fish: number; count: number }>();
  sessions.forEach((s) => {
    if (!s.section) return;
    const e = sectionMap.get(s.section) ?? { fish: 0, count: 0 };
    e.fish += s.total_fish ?? 0;
    e.count++;
    sectionMap.set(s.section, e);
  });
  let bestSection: PersonalRiverScorecard["bestSection"] = null;
  for (const [section, { fish, count }] of sectionMap.entries()) {
    const avg = count > 0 ? Math.round((fish / count) * 10) / 10 : 0;
    if (!bestSection || avg > bestSection.avgFish) {
      bestSection = { section, sessionCount: count, avgFish: avg };
    }
  }

  // Best time of day
  const periodMap = new Map<string, { catches: number; sessions: Set<string> }>();
  (catches || []).forEach((c) => {
    if (!c.time_caught) return;
    try {
      const h = new Date(c.time_caught).getUTCHours();
      const p = PERIODS.find((p) => h >= p.min && h < p.max);
      if (!p) return;
      const e = periodMap.get(p.key) ?? { catches: 0, sessions: new Set() };
      e.catches++;
      e.sessions.add(c.session_id);
      periodMap.set(p.key, e);
    } catch { /* skip */ }
  });
  let bestTimeOfDay: PersonalRiverScorecard["bestTimeOfDay"] = null;
  for (const [key, val] of periodMap.entries()) {
    const p = PERIODS.find((x) => x.key === key)!;
    const avg = val.sessions.size > 0 ? Math.round((val.catches / val.sessions.size) * 10) / 10 : 0;
    if (!bestTimeOfDay || avg > bestTimeOfDay.avgFish) {
      bestTimeOfDay = { period: key as "morning" | "midday" | "afternoon" | "evening", label: p.label, avgFish: avg };
    }
  }

  // Best month
  const monthMap = new Map<number, { fish: number; count: number }>();
  sessions.forEach((s) => {
    if (!s.date) return;
    const m = parseInt(s.date.split("-")[1], 10) - 1;
    const e = monthMap.get(m) ?? { fish: 0, count: 0 };
    e.fish += s.total_fish ?? 0;
    e.count++;
    monthMap.set(m, e);
  });
  let bestMonth: PersonalRiverScorecard["bestMonth"] = null;
  for (const [m, { fish, count }] of monthMap.entries()) {
    if (count < 2) continue;
    const avg = Math.round((fish / count) * 10) / 10;
    if (!bestMonth || avg > bestMonth.avgFish) {
      bestMonth = { month: MONTHS[m], avgFish: avg };
    }
  }

  // Top gear (most-used rod brand / leader / tippet on this river)
  const rodIds = sessions.map((s) => s.gear_rod_id).filter(Boolean) as string[];
  const leaderIds = sessions.map((s) => s.gear_leader_id).filter(Boolean) as string[];
  const tippetIds = sessions.map((s) => s.gear_tippet_id).filter(Boolean) as string[];

  let topGear: PersonalRiverScorecard["topGear"] = null;
  if (rodIds.length > 0 || leaderIds.length > 0 || tippetIds.length > 0) {
    const allIds = [...new Set([...rodIds, ...leaderIds, ...tippetIds])];
    const { data: gear } = await supabase
      .from("gear_items")
      .select("id, type, maker, name")
      .in("id", allIds);
    const byId = new Map((gear || []).map((g) => [g.id, g]));
    const topOf = (ids: string[], field: "maker" | "name") => {
      const counts = new Map<string, number>();
      ids.forEach((id) => {
        const item = byId.get(id);
        const val = item?.[field];
        if (val) counts.set(val, (counts.get(val) ?? 0) + 1);
      });
      return counts.size > 0 ? [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0] : null;
    };
    topGear = {
      rodBrand: topOf(rodIds, "maker"),
      leader: topOf(leaderIds, "name"),
      tippet: topOf(tippetIds, "name"),
    };
    if (!topGear.rodBrand && !topGear.leader && !topGear.tippet) topGear = null;
  }

  return NextResponse.json({
    riverId,
    totalSessions: sessions.length,
    sessions30d: sessions.filter((s) => s.date >= ago30).length,
    totalFish,
    avgFishPerSession,
    biggestFishInches,
    topFlyName,
    bestSection,
    bestTimeOfDay,
    bestMonth,
    topGear,
    lastSessionDate: sessions[0]?.date ?? null,
  } satisfies PersonalRiverScorecard);
}
