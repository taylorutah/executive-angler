import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface FlyReport {
  flyName: string;
  catchCount: number;
  sizes: string[];
  species: string[];
}

export interface SpeciesBreakdown {
  species: string;
  count: number;
  avgLengthInches: number | null;
  maxLengthInches: number | null;
}

export interface TripReport {
  sessionId: string;
  date: string;
  notes: string;
  totalFish: number;
  waterTemp: number | null;
  waterClarity: string | null;
  weather: string | null;
  username: string | null;
}

export interface GearStats {
  topRodBrand: string | null;
  topLeader: string | null;
  topTippet: string | null;
}

export interface TimeOfDayStat {
  period: "morning" | "midday" | "afternoon" | "evening";
  label: string;
  avgFish: number;
  sessionCount: number;
}

export interface MonthStat {
  month: string;
  avgFish: number;
  sessionCount: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl: string | null;
}

export interface SectionBreakdown {
  section: string;
  sessionCount: number;
  avgFish: number | null;
  topFly: string | null;
}

export interface RiverLeaderboard {
  riverChampion: (LeaderboardEntry & { sessionCount: number }) | null;
  biggestFish: (LeaderboardEntry & { lengthInches: number; species: string | null; sessionDate: string }) | null;
  hotHand: (LeaderboardEntry & { fishCount: number; sessionDate: string }) | null;
}

export interface RiverIntel {
  riverId: string;
  // Activity
  totalSessions: number;
  sessions30d: number;
  sessions7d: number;
  totalFishRecorded: number;
  avgFishPerSession: number | null;
  lastSessionDate: string | null;
  // What's working
  topFlies: FlyReport[];
  speciesBreakdown: SpeciesBreakdown[];
  avgLengthInches: number | null;
  maxLengthInches: number | null;
  // Conditions
  avgWaterTempF: number | null;
  recentWaterTemps: { date: string; temp: number }[];
  waterClarity: { clarity: string; count: number }[];
  // Trip reports
  recentReports: TripReport[];
  totalReports: number;
  // Section breakdown
  sections: SectionBreakdown[];
  // PRO stats
  gearStats: GearStats | null;
  bestTimeOfDay: TimeOfDayStat | null;
  bestMonth: MonthStat | null;
  leaderboard: RiverLeaderboard | null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ riverId: string }> }
) {
  const { riverId } = await params;
  const supabase = await createClient();

  const now = new Date();
  const ago30 = new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];
  const ago7 = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];

  const ago90 = new Date(now.getTime() - 90 * 86400000).toISOString().split("T")[0];

  // All public sessions for this river
  const { data: sessions } = await supabase
    .from("fishing_sessions")
    .select("id, date, total_fish, notes, water_temp_f, water_clarity, weather, user_id, gear_rod_id, gear_leader_id, gear_tippet_id, created_at, section")
    .eq("river_id", riverId)
    .eq("privacy", "public")
    .order("date", { ascending: false });

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({
      riverId,
      totalSessions: 0,
      sessions30d: 0,
      sessions7d: 0,
      totalFishRecorded: 0,
      avgFishPerSession: null,
      lastSessionDate: null,
      topFlies: [],
      speciesBreakdown: [],
      avgLengthInches: null,
      maxLengthInches: null,
      avgWaterTempF: null,
      recentWaterTemps: [],
      waterClarity: [],
      recentReports: [],
      totalReports: 0,
      sections: [],
      gearStats: null,
      bestTimeOfDay: null,
      bestMonth: null,
      leaderboard: null,
    } satisfies RiverIntel);
  }

  const sessionIds = sessions.map((s) => s.id);

  // Catches + fly patterns for all sessions
  const { data: catches } = await supabase
    .from("catches")
    .select(`
      id,
      session_id,
      species,
      length_inches,
      fly_size,
      fly_name,
      fly_pattern_id,
      fly_patterns(name, type)
    `)
    .in("session_id", sessionIds);

  // Session angler profiles for trip reports
  const { data: profiles } = await supabase
    .from("fishing_sessions")
    .select("id, user_id, profiles(username)")
    .in("id", sessionIds.slice(0, 20));

  const profileMap = new Map<string, string | null>();
  (profiles || []).forEach((p) => {
    const ap = p.profiles as unknown as { username: string } | null;
    profileMap.set(p.id, ap?.username ?? null);
  });

  // ── Activity stats ───────────────────────────────────────────────────────
  const totalSessions = sessions.length;
  const sessions30d = sessions.filter((s) => s.date >= ago30).length;
  const sessions7d = sessions.filter((s) => s.date >= ago7).length;
  const fishCounts = sessions.map((s) => s.total_fish ?? 0);
  const totalFishRecorded = fishCounts.reduce((a, b) => a + b, 0);
  const sessionsWithFish = sessions.filter((s) => (s.total_fish ?? 0) > 0);
  const avgFishPerSession =
    sessionsWithFish.length > 0
      ? Math.round(
          (sessionsWithFish.reduce((a, s) => a + (s.total_fish ?? 0), 0) /
            sessionsWithFish.length) *
            10
        ) / 10
      : null;
  const lastSessionDate = sessions[0]?.date ?? null;

  // ── Fly analysis ─────────────────────────────────────────────────────────
  const flyMap = new Map<string, { count: number; sizes: Set<string>; species: Set<string> }>();

  (catches || []).forEach((c) => {
    const fp = c.fly_patterns as unknown as { name: string } | null;
    const name = fp?.name ?? c.fly_name ?? null;
    if (!name) return;
    const entry = flyMap.get(name) ?? { count: 0, sizes: new Set(), species: new Set() };
    entry.count++;
    if (c.fly_size) entry.sizes.add(c.fly_size);
    if (c.species) entry.species.add(c.species);
    flyMap.set(name, entry);
  });

  const topFlies: FlyReport[] = Array.from(flyMap.entries())
    .map(([flyName, d]) => ({
      flyName,
      catchCount: d.count,
      sizes: Array.from(d.sizes).sort(),
      species: Array.from(d.species),
    }))
    .sort((a, b) => b.catchCount - a.catchCount)
    .slice(0, 6);

  // ── Species breakdown ────────────────────────────────────────────────────
  const speciesMap = new Map<string, { lengths: number[] }>();
  (catches || []).forEach((c) => {
    if (!c.species) return;
    const key = c.species.trim();
    const entry = speciesMap.get(key) ?? { lengths: [] };
    if (c.length_inches) entry.lengths.push(Number(c.length_inches));
    speciesMap.set(key, entry);
  });

  const totalCatches = (catches || []).filter((c) => c.species).length;
  const speciesBreakdown: SpeciesBreakdown[] = Array.from(speciesMap.entries())
    .map(([species, { lengths }]) => ({
      species,
      count: speciesMap.get(species)!.lengths.length || 1,
      avgLengthInches:
        lengths.length > 0
          ? Math.round((lengths.reduce((a, b) => a + b, 0) / lengths.length) * 10) / 10
          : null,
      maxLengthInches: lengths.length > 0 ? Math.max(...lengths) : null,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Re-count species properly
  const speciesCountMap = new Map<string, number>();
  (catches || []).forEach((c) => {
    if (!c.species) return;
    speciesCountMap.set(c.species.trim(), (speciesCountMap.get(c.species.trim()) ?? 0) + 1);
  });
  speciesBreakdown.forEach((s) => {
    s.count = speciesCountMap.get(s.species) ?? s.count;
  });

  const allLengths = (catches || [])
    .filter((c) => c.length_inches)
    .map((c) => Number(c.length_inches));
  const avgLengthInches =
    allLengths.length > 0
      ? Math.round((allLengths.reduce((a, b) => a + b, 0) / allLengths.length) * 10) / 10
      : null;
  const maxLengthInches = allLengths.length > 0 ? Math.max(...allLengths) : null;

  // ── Conditions ───────────────────────────────────────────────────────────
  const temps = sessions
    .filter((s) => s.water_temp_f != null)
    .map((s) => ({ date: s.date, temp: Number(s.water_temp_f) }));

  const avgWaterTempF =
    temps.length > 0
      ? Math.round(
          (temps.reduce((a, t) => a + t.temp, 0) / temps.length) * 10
        ) / 10
      : null;

  const recentWaterTemps = temps.slice(0, 10);

  const clarityMap = new Map<string, number>();
  sessions.forEach((s) => {
    if (s.water_clarity) {
      clarityMap.set(s.water_clarity, (clarityMap.get(s.water_clarity) ?? 0) + 1);
    }
  });
  const waterClarity = Array.from(clarityMap.entries())
    .map(([clarity, count]) => ({ clarity, count }))
    .sort((a, b) => b.count - a.count);

  // ── Trip reports (sessions with notes) ───────────────────────────────────
  const sessionsWithNotes = sessions
    .filter((s) => s.notes && s.notes.trim().length > 20)
    .slice(0, 10);

  const recentReports: TripReport[] = sessionsWithNotes.slice(0, 5).map((s) => ({
    sessionId: s.id,
    date: s.date,
    notes: s.notes!.trim(),
    totalFish: s.total_fish ?? 0,
    waterTemp: s.water_temp_f ? Number(s.water_temp_f) : null,
    waterClarity: s.water_clarity ?? null,
    weather: s.weather && s.weather.trim() ? s.weather.trim() : null,
    username: profileMap.get(s.id) ?? null,
  }));

  // ── Section breakdown ────────────────────────────────────────────────────
  const sectionMap = new Map<string, { fish: number; count: number; sessionIds: string[] }>();
  (sessions || []).forEach((s) => {
    if (!s.section) return;
    const entry = sectionMap.get(s.section) ?? { fish: 0, count: 0, sessionIds: [] };
    entry.fish += s.total_fish ?? 0;
    entry.count++;
    entry.sessionIds.push(s.id);
    sectionMap.set(s.section, entry);
  });

  // For top fly per section, use the catches we already have
  const catchesBySession = new Map<string, typeof catches>();
  (catches || []).forEach((c) => {
    const list = catchesBySession.get(c.session_id) ?? [];
    list.push(c);
    catchesBySession.set(c.session_id, list);
  });

  const sections: SectionBreakdown[] = Array.from(sectionMap.entries())
    .map(([section, { fish, count, sessionIds }]) => {
      // Top fly for this section
      const flyCount = new Map<string, number>();
      sessionIds.forEach((sid) => {
        (catchesBySession.get(sid) || []).forEach((c) => {
          const fp = c.fly_patterns as unknown as { name: string } | null;
          const name = fp?.name ?? c.fly_name ?? null;
          if (name) flyCount.set(name, (flyCount.get(name) ?? 0) + 1);
        });
      });
      const topFly = flyCount.size > 0
        ? [...flyCount.entries()].sort((a, b) => b[1] - a[1])[0][0]
        : null;
      return {
        section,
        sessionCount: count,
        avgFish: count > 0 ? Math.round((fish / count) * 10) / 10 : null,
        topFly,
      };
    })
    .sort((a, b) => b.sessionCount - a.sessionCount);

  // ── Gear stats (PRO) ─────────────────────────────────────────────────────
  const rodIds = (sessions || []).map((s) => s.gear_rod_id).filter(Boolean) as string[];
  const leaderIds = (sessions || []).map((s) => s.gear_leader_id).filter(Boolean) as string[];
  const tippetIds = (sessions || []).map((s) => s.gear_tippet_id).filter(Boolean) as string[];

  let gearStats: GearStats | null = null;

  if (rodIds.length > 0 || leaderIds.length > 0 || tippetIds.length > 0) {
    const allGearIds = [...new Set([...rodIds, ...leaderIds, ...tippetIds])];
    const { data: gearItems } = await supabase
      .from("gear_items")
      .select("id, type, maker, name")
      .in("id", allGearIds);

    const gearById = new Map((gearItems || []).map((g) => [g.id, g]));

    const topOf = (ids: string[], field: "maker" | "name") => {
      const counts = new Map<string, number>();
      ids.forEach((id) => {
        const item = gearById.get(id);
        const val = item?.[field];
        if (val) counts.set(val, (counts.get(val) ?? 0) + 1);
      });
      return counts.size > 0
        ? [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
        : null;
    };

    gearStats = {
      topRodBrand: topOf(rodIds, "maker"),
      topLeader: topOf(leaderIds, "name"),
      topTippet: topOf(tippetIds, "name"),
    };

    if (!gearStats.topRodBrand && !gearStats.topLeader && !gearStats.topTippet) {
      gearStats = null;
    }
  }

  // ── Best time of day (PRO) ────────────────────────────────────────────────
  // Uses catches.time_caught (ISO timestamp) joined to sessions on this river
  const { data: timedCatches } = await supabase
    .from("catches")
    .select("session_id, time_caught")
    .in("session_id", sessionIds)
    .not("time_caught", "is", null);

  let bestTimeOfDay: TimeOfDayStat | null = null;

  if ((timedCatches || []).length > 0) {
    const periodMap = new Map<string, { catches: number; sessions: Set<string> }>();
    const periods = [
      { key: "morning" as const, label: "Morning (5–9am)", min: 5, max: 9 },
      { key: "midday" as const, label: "Midday (10am–12pm)", min: 10, max: 12 },
      { key: "afternoon" as const, label: "Afternoon (1–5pm)", min: 13, max: 17 },
      { key: "evening" as const, label: "Evening (5–8pm)", min: 17, max: 20 },
    ];

    (timedCatches || []).forEach((c) => {
      try {
        const h = new Date(c.time_caught).getUTCHours();
        const p = periods.find((p) => h >= p.min && h < p.max);
        if (!p) return;
        const entry = periodMap.get(p.key) ?? { catches: 0, sessions: new Set() };
        entry.catches++;
        entry.sessions.add(c.session_id);
        periodMap.set(p.key, entry);
      } catch { /* skip invalid timestamps */ }
    });

    let bestPeriod: TimeOfDayStat | null = null;
    for (const [key, val] of periodMap.entries()) {
      const p = periods.find((x) => x.key === key)!;
      const avg = val.sessions.size > 0 ? Math.round((val.catches / val.sessions.size) * 10) / 10 : 0;
      if (!bestPeriod || avg > bestPeriod.avgFish) {
        bestPeriod = { period: key as TimeOfDayStat["period"], label: p.label, avgFish: avg, sessionCount: val.sessions.size };
      }
    }
    bestTimeOfDay = bestPeriod;
  }

  // ── Best month (PRO) ─────────────────────────────────────────────────────
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthMap = new Map<number, { fish: number; count: number }>();
  (sessions || []).forEach((s) => {
    if (!s.date) return;
    const m = parseInt(s.date.split("-")[1], 10) - 1;
    const entry = monthMap.get(m) ?? { fish: 0, count: 0 };
    entry.fish += s.total_fish ?? 0;
    entry.count++;
    monthMap.set(m, entry);
  });

  let bestMonth: MonthStat | null = null;
  for (const [m, { fish, count }] of monthMap.entries()) {
    if (count < 2) continue;
    const avg = Math.round((fish / count) * 10) / 10;
    if (!bestMonth || avg > bestMonth.avgFish) {
      bestMonth = { month: MONTHS[m], avgFish: avg, sessionCount: count };
    }
  }

  // ── Leaderboard (PRO) ────────────────────────────────────────────────────
  let leaderboard: RiverLeaderboard | null = null;

  // Fetch angler profiles for all unique users on this river
  const uniqueUserIds = [...new Set((sessions || []).map((s) => s.user_id).filter(Boolean))] as string[];

  if (uniqueUserIds.length > 0) {
    const { data: anglerProfiles } = await supabase
      .from("profiles")
      .select("user_id, username, avatar_url")
      .in("user_id", uniqueUserIds);

    const profileById = new Map((anglerProfiles || []).map((p) => [p.user_id, p]));

    // River champion: most sessions in last 90 days
    const championCounts = new Map<string, number>();
    (sessions || []).filter((s) => s.date >= ago90).forEach((s) => {
      if (s.user_id) championCounts.set(s.user_id, (championCounts.get(s.user_id) ?? 0) + 1);
    });
    let riverChampion: RiverLeaderboard["riverChampion"] = null;
    if (championCounts.size > 0) {
      const [topUid, topCount] = [...championCounts.entries()].sort((a, b) => b[1] - a[1])[0];
      const prof = profileById.get(topUid);
      riverChampion = {
        userId: topUid,
        username: prof?.username ?? "Angler",
        avatarUrl: prof?.avatar_url ?? null,
        sessionCount: topCount,
      };
    }

    // Biggest fish: max catch length on this river
    let biggestFish: RiverLeaderboard["biggestFish"] = null;
    if ((catches || []).length > 0) {
      const sessionUserMap = new Map((sessions || []).map((s) => [s.id, s]));
      const withLength = (catches || []).filter((c) => c.length_inches != null);
      if (withLength.length > 0) {
        const best = withLength.sort((a, b) => Number(b.length_inches) - Number(a.length_inches))[0];
        const sess = sessionUserMap.get(best.session_id);
        if (sess?.user_id) {
          const prof = profileById.get(sess.user_id);
          biggestFish = {
            userId: sess.user_id,
            username: prof?.username ?? "Angler",
            avatarUrl: prof?.avatar_url ?? null,
            lengthInches: Number(best.length_inches),
            species: best.species ?? null,
            sessionDate: sess.date,
          };
        }
      }
    }

    // Hot hand: max total_fish in single session
    let hotHand: RiverLeaderboard["hotHand"] = null;
    const fishySessions = (sessions || []).filter((s) => (s.total_fish ?? 0) > 0);
    if (fishySessions.length > 0) {
      const best = fishySessions.sort((a, b) => (b.total_fish ?? 0) - (a.total_fish ?? 0))[0];
      if (best.user_id) {
        const prof = profileById.get(best.user_id);
        hotHand = {
          userId: best.user_id,
          username: prof?.username ?? "Angler",
          avatarUrl: prof?.avatar_url ?? null,
          fishCount: best.total_fish ?? 0,
          sessionDate: best.date,
        };
      }
    }

    if (riverChampion || biggestFish || hotHand) {
      leaderboard = { riverChampion, biggestFish, hotHand };
    }
  }

  return NextResponse.json({
    riverId,
    totalSessions,
    sessions30d,
    sessions7d,
    totalFishRecorded,
    avgFishPerSession,
    lastSessionDate,
    topFlies,
    speciesBreakdown,
    avgLengthInches,
    maxLengthInches,
    avgWaterTempF,
    recentWaterTemps,
    waterClarity,
    recentReports,
    totalReports: sessionsWithNotes.length,
    sections,
    gearStats,
    bestTimeOfDay,
    bestMonth,
    leaderboard,
  } satisfies RiverIntel);
}
