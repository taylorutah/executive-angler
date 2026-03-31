import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkPremium } from "@/lib/admin";

/**
 * GET /api/insights/river-conditions?riverId=xxx
 *
 * Returns the user's personal catch data correlated with USGS flow data
 * for a specific river. Premium-gated.
 *
 * Response shape:
 * {
 *   catches: { date, flow_cfs, water_temp_f, fish_count, biggest_fish, top_fly, species[] }[],
 *   bestWindow: { flow_min, flow_max, temp_min, temp_max, best_fly, best_species, avg_fish, session_count },
 *   hatchCorrelation: { fly_name, months[], pct_of_catches, avg_fish_per_session }[]
 * }
 */
export async function GET(request: NextRequest) {
  const riverId = request.nextUrl.searchParams.get("riverId");
  if (!riverId) {
    return NextResponse.json({ error: "riverId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isPremium = await checkPremium(supabase, user.id, user.email);
  if (!isPremium) {
    return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  // Fetch all user sessions on this river
  const { data: sessions } = await supabase
    .from("fishing_sessions")
    .select("id, date, water_temp_f, total_fish, weather, water_clarity")
    .eq("user_id", user.id)
    .eq("river_id", riverId)
    .order("date", { ascending: true });

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ catches: [], bestWindow: null, hatchCorrelation: [] });
  }

  const sessionIds = sessions.map((s) => s.id);

  // Fetch all catches for these sessions
  const { data: catches } = await supabase
    .from("fishing_catches")
    .select("id, session_id, species, length_inches, fly_name, fly_size, time_caught")
    .in("session_id", sessionIds);

  const catchesBySession = new Map<string, typeof catches>();
  for (const c of catches || []) {
    const arr = catchesBySession.get(c.session_id) || [];
    arr.push(c);
    catchesBySession.set(c.session_id, arr);
  }

  // Fetch USGS historical flow data for this river to correlate with session dates
  // We'll try to get the river's gauge info
  const { data: river } = await supabase
    .from("rivers")
    .select("usgs_gauge_id")
    .eq("id", riverId)
    .maybeSingle();

  let gaugeId: string | null = null;
  if (river?.usgs_gauge_id) {
    const raw = river.usgs_gauge_id.trim();
    if (raw.startsWith("[")) {
      try {
        const parsed = JSON.parse(raw);
        gaugeId = parsed[0]?.site_id || null;
      } catch { /* ignore */ }
    } else {
      gaugeId = raw;
    }
  }

  // Build flow lookup from USGS daily values if gauge available
  const flowByDate = new Map<string, number>();
  if (gaugeId && sessions.length > 0) {
    const startDate = sessions[0].date;
    const endDate = sessions[sessions.length - 1].date;
    try {
      const url = `https://waterservices.usgs.gov/nwis/dv/?format=json&sites=${gaugeId}&parameterCd=00060&startDT=${startDate}&endDT=${endDate}&statCd=00003`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (res.ok) {
        const data = await res.json();
        const ts = data?.value?.timeSeries?.[0];
        const values = ts?.values?.[0]?.value || [];
        for (const v of values) {
          if (v.value && v.value !== "-999999") {
            flowByDate.set(v.dateTime.split("T")[0], Math.round(parseFloat(v.value)));
          }
        }
      }
    } catch {
      // Silently skip flow correlation if USGS unavailable
    }
  }

  // Build per-session correlation data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionData: any[] = sessions.map((s) => {
    const sc = catchesBySession.get(s.id) || [];
    const speciesSet = new Set(sc.map((c) => c.species).filter(Boolean));
    const biggest = sc.reduce((max, c) => (c.length_inches || 0) > (max || 0) ? c.length_inches : max, 0 as number | null);
    const flyFreq = new Map<string, number>();
    for (const c of sc) {
      if (c.fly_name) flyFreq.set(c.fly_name, (flyFreq.get(c.fly_name) || 0) + 1);
    }
    let topFly: string | null = null;
    let topFlyCount = 0;
    for (const [fly, count] of flyFreq) {
      if (count > topFlyCount) { topFly = fly; topFlyCount = count; }
    }

    return {
      date: s.date,
      flow_cfs: flowByDate.get(s.date) || null,
      water_temp_f: s.water_temp_f || null,
      fish_count: s.total_fish || sc.length,
      biggest_fish: biggest || null,
      top_fly: topFly,
      species: Array.from(speciesSet),
      weather: s.weather || null,
      clarity: s.water_clarity || null,
    };
  });

  // Calculate "Best Window" — optimal conditions based on catch rate
  const sessionsWithFlow = sessionData.filter((s) => s.flow_cfs !== null);
  const sessionsWithTemp = sessionData.filter((s) => s.water_temp_f !== null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bestWindow: any = null;
  if (sessionData.length >= 3) {
    // Sort sessions by fish_count to find top quartile
    const sorted = [...sessionData].sort((a, b) => b.fish_count - a.fish_count);
    const topCount = Math.max(1, Math.ceil(sorted.length * 0.33));
    const topSessions = sorted.slice(0, topCount);

    const topFlows = topSessions.map((s) => s.flow_cfs).filter((f): f is number => f !== null);
    const topTemps = topSessions.map((s) => s.water_temp_f).filter((t): t is number => t !== null);

    // Fly effectiveness across all sessions
    const flyTotalFish = new Map<string, number>();
    const flySessionCount = new Map<string, number>();
    for (const s of sessionData) {
      if (s.top_fly) {
        flyTotalFish.set(s.top_fly, (flyTotalFish.get(s.top_fly) || 0) + s.fish_count);
        flySessionCount.set(s.top_fly, (flySessionCount.get(s.top_fly) || 0) + 1);
      }
    }
    let bestFly: string | null = null;
    let bestFlyAvg = 0;
    for (const [fly, total] of flyTotalFish) {
      const count = flySessionCount.get(fly) || 1;
      const avg = total / count;
      if (avg > bestFlyAvg) { bestFly = fly; bestFlyAvg = avg; }
    }

    // Most common species in top sessions
    const speciesFreq = new Map<string, number>();
    for (const s of topSessions) {
      for (const sp of s.species) {
        speciesFreq.set(sp, (speciesFreq.get(sp) || 0) + 1);
      }
    }
    let bestSpecies: string | null = null;
    let bestSpeciesCount = 0;
    for (const [sp, count] of speciesFreq) {
      if (count > bestSpeciesCount) { bestSpecies = sp; bestSpeciesCount = count; }
    }

    bestWindow = {
      flow_min: topFlows.length > 0 ? Math.min(...topFlows) : null,
      flow_max: topFlows.length > 0 ? Math.max(...topFlows) : null,
      temp_min: topTemps.length > 0 ? Math.min(...topTemps) : null,
      temp_max: topTemps.length > 0 ? Math.max(...topTemps) : null,
      best_fly: bestFly,
      best_species: bestSpecies,
      avg_fish: Math.round(topSessions.reduce((s, t) => s + t.fish_count, 0) / topSessions.length * 10) / 10,
      session_count: sessionData.length,
      sessions_with_flow: sessionsWithFlow.length,
      sessions_with_temp: sessionsWithTemp.length,
    };
  }

  // Hatch correlation — fly patterns by month
  const flyMonthData = new Map<string, { months: Set<string>; totalFish: number; sessions: number }>();
  for (const s of sessionData) {
    if (!s.top_fly || !s.date) continue;
    const month = new Date(s.date + "T12:00:00").toLocaleDateString("en-US", { month: "long" });
    const entry = flyMonthData.get(s.top_fly) || { months: new Set(), totalFish: 0, sessions: 0 };
    entry.months.add(month);
    entry.totalFish += s.fish_count;
    entry.sessions += 1;
    flyMonthData.set(s.top_fly, entry);
  }

  const totalCatches = sessionData.reduce((s, t) => s + t.fish_count, 0);
  const hatchCorrelation = Array.from(flyMonthData.entries())
    .map(([fly, data]) => ({
      fly_name: fly,
      months: Array.from(data.months),
      pct_of_catches: totalCatches > 0 ? Math.round((data.totalFish / totalCatches) * 100) : 0,
      avg_fish_per_session: Math.round((data.totalFish / data.sessions) * 10) / 10,
    }))
    .sort((a, b) => b.pct_of_catches - a.pct_of_catches)
    .slice(0, 10);

  return NextResponse.json(
    { catches: sessionData, bestWindow, hatchCorrelation },
    { headers: { "Cache-Control": "private, max-age=300" } }
  );
}
