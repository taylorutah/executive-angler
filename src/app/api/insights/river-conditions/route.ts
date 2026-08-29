import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildFlyLogEvents,
  collectReferencedFlyIds,
  computeTopFly,
  flyIdentity,
} from "@/lib/insights/top-fly";

/**
 * GET /api/insights/river-conditions?riverId=xxx
 *
 * Returns the user's personal catch data correlated with USGS flow data
 * for a specific river.
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

  // Fetch all catches for these sessions. Pull fly_pattern_id so we can
  // group by canonical fly identity (rename-safe) instead of the
  // denormalized fly_name snapshot — which leaves "Walt's Worm" /
  // "Walt's Worm (dropper)" / "Walt's Worm (hare's mask...)" looking
  // like three different flies in the rollup.
  const { data: catches } = await supabase
    .from("catches")
    .select("id, session_id, species, length_inches, fly_name, fly_pattern_id, canonical_fly_id, fly_size, time_caught, quantities")
    .in("session_id", sessionIds);

  const { data: rigs } = await supabase
    .from("session_rigs")
    .select("session_id, fly_name, fly_pattern_id")
    .in("session_id", sessionIds);

  // Resolve live fly names by FK (web canonical picks set canonical_fly_id;
  // iOS/Android + web personal picks set fly_pattern_id). Both reference the
  // unified `flies` table post Phase A. The live row is authoritative — a
  // renamed pattern surfaces under its current name across every catch.
  const referencedFlyIds = collectReferencedFlyIds([
    ...(catches ?? []),
    ...(rigs ?? []),
  ]);
  const { data: rawFlies } = referencedFlyIds.length > 0
    ? await supabase
        .from("flies")
        .select("id, name")
        .in("id", referencedFlyIds)
        .is("deleted_at", null)
    : { data: [] };
  const flyNameById = new Map(
    (rawFlies ?? []).map((f) => [f.id as string, f.name as string])
  );

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

  // Build per-session correlation data. `top_fly` (winner per session by
  // catch count) is kept for the Best Window card — but the all-fly
  // performance rollup below uses every catch, not just the per-session
  // winner.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionData: any[] = sessions.map((s) => {
    const sc = catchesBySession.get(s.id) || [];
    const speciesSet = new Set(sc.map((c) => c.species).filter(Boolean));
    const biggest = sc.reduce((max, c) => (c.length_inches || 0) > (max || 0) ? c.length_inches : max, 0 as number | null);
    const flyFreq = new Map<string, { displayName: string; count: number }>();
    for (const c of sc) {
      const identity = flyIdentity(c, flyNameById);
      if (!identity) continue;
      const entry = flyFreq.get(identity.key) || { displayName: identity.displayName, count: 0 };
      entry.count += 1;
      flyFreq.set(identity.key, entry);
    }
    let topFly: string | null = null;
    let topFlyCount = 0;
    for (const { displayName, count } of flyFreq.values()) {
      if (count > topFlyCount) { topFly = displayName; topFlyCount = count; }
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
  const sessionDateById = new Map(sessions.map((s) => [s.id as string, s.date as string]));
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

    const bestFly =
      computeTopFly(
        buildFlyLogEvents({
          catches: catches || [],
          rigs: rigs || [],
          sessionDateById,
          flyNameById,
        }),
      )?.name ?? null;

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

  // Fly performance — aggregate over every catch, not just the per-session
  // winner. Group by canonical fly identity (live fly id when present,
  // normalized fly_name otherwise) so renames and trailing parenthetical
  // notes don't fragment the rollup. Counts are real catches, not session
  // totals.
  const flyAgg = new Map<
    string,
    { displayName: string; catches: number; sessions: Set<string>; months: Set<string>; lastDate: string | null }
  >();
  let totalAttributedCatches = 0;
  for (const c of catches ?? []) {
    const ident = flyIdentity(c, flyNameById);
    if (!ident) continue;
    const sessionDate = sessionDateById.get(c.session_id);
    if (!sessionDate) continue;
    const month = new Date(sessionDate + "T12:00:00").toLocaleDateString("en-US", { month: "long" });
    const entry = flyAgg.get(ident.key) || {
      displayName: ident.displayName,
      catches: 0,
      sessions: new Set<string>(),
      months: new Set<string>(),
      lastDate: null,
    };
    entry.catches += 1;
    entry.sessions.add(c.session_id);
    entry.months.add(month);
    if (!entry.lastDate || sessionDate > entry.lastDate) entry.lastDate = sessionDate;
    flyAgg.set(ident.key, entry);
    totalAttributedCatches += 1;
  }

  const hatchCorrelation = Array.from(flyAgg.values())
    .map((data) => ({
      fly_name: data.displayName,
      months: Array.from(data.months),
      pct_of_catches:
        totalAttributedCatches > 0
          ? Math.round((data.catches / totalAttributedCatches) * 100)
          : 0,
      catch_count: data.catches,
      session_count: data.sessions.size,
      last_caught: data.lastDate,
      // Kept for backwards-compat with the existing client. Now reports
      // actual catches per session this fly was used (not session.total_fish).
      avg_fish_per_session:
        data.sessions.size > 0
          ? Math.round((data.catches / data.sessions.size) * 10) / 10
          : 0,
    }))
    .sort((a, b) => b.catch_count - a.catch_count)
    .slice(0, 10);

  return NextResponse.json(
    { catches: sessionData, bestWindow, hatchCorrelation },
    { headers: { "Cache-Control": "private, max-age=300" } }
  );
}
