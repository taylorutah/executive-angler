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

  // All public sessions for this river
  const { data: sessions } = await supabase
    .from("fishing_sessions")
    .select("id, date, total_fish, notes, water_temp_f, water_clarity, weather")
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
    } satisfies RiverIntel);
  }

  const sessionIds = sessions.map((s) => s.id);

  // Catches + fly patterns for all sessions
  const { data: catches } = await supabase
    .from("catches")
    .select(`
      id,
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
    .select("id, user_id, angler_profiles(username)")
    .in("id", sessionIds.slice(0, 20));

  const profileMap = new Map<string, string | null>();
  (profiles || []).forEach((p) => {
    const ap = p.angler_profiles as unknown as { username: string } | null;
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
  } satisfies RiverIntel);
}
