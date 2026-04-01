import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkPremium } from "@/lib/admin";

// =============================================
// Types
// =============================================

interface SessionRow {
  id: string;
  date: string;
  river_name: string | null;
  total_fish: number | null;
  weather: string | null;
  water_temp_f: number | null;
  water_clarity: string | null;
  weather_condition: string | null;
}

interface CatchRow {
  id: string;
  session_id: string;
  species: string | null;
  length_inches: number | null;
  fly_pattern_id: string | null;
  fly_size: string | null;
  time_caught: string | null;
  quantities: number | null;
}

interface FlyRow {
  id: string;
  name: string;
  type: string | null;
}

// =============================================
// Response shape
// =============================================

export interface FlyEffectivenessItem {
  flyName: string;
  flyType: string | null;
  totalCatches: number;
  sessionsUsed: number;
  fishPerSession: number;
}

export interface TimeOfDayBucket {
  slot: string;
  catches: number;
  pct: number;
}

export interface WeatherBucket {
  condition: string;
  avgFishPerSession: number;
  sessionCount: number;
}

export interface RiverBucket {
  river: string;
  avgFishPerSession: number;
  sessionCount: number;
  totalFish: number;
}

export interface SpeciesBucket {
  species: string;
  count: number;
  pct: number;
}

export interface MonthlyTrendPoint {
  month: string; // "2026-03"
  label: string; // "Mar 2026"
  fish: number;
  sessions: number;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
}

export interface InsightsPayload {
  flyEffectiveness: FlyEffectivenessItem[];
  bestTimeOfDay: TimeOfDayBucket[];
  weatherCorrelation: WeatherBucket[];
  bestRivers: RiverBucket[];
  speciesBreakdown: SpeciesBucket[];
  monthlyTrends: MonthlyTrendPoint[];
  streakStats: StreakStats;
  totalSessions: number;
  totalCatches: number;
}

// =============================================
// GET /api/journal/insights
// =============================================

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isPremium = await checkPremium(supabase, user.id, user.email);
  if (!isPremium) {
    return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  // Fetch user data in parallel
  const [sessionsRes, catchesRes, fliesRes] = await Promise.all([
    supabase
      .from("fishing_sessions")
      .select(
        "id, date, river_name, total_fish, weather, water_temp_f, water_clarity, weather_condition"
      )
      .eq("user_id", user.id)
      .order("date", { ascending: true }),
    supabase
      .from("catches")
      .select(
        "id, session_id, species, length_inches, fly_pattern_id, fly_size, time_caught, quantities"
      )
      .eq("user_id", user.id),
    supabase
      .from("fly_patterns")
      .select("id, name, type")
      .eq("user_id", user.id),
  ]);

  const sessions: SessionRow[] = sessionsRes.data || [];
  const catches: CatchRow[] = catchesRes.data || [];
  const flies: FlyRow[] = fliesRes.data || [];

  const flyMap = new Map(flies.map((f) => [f.id, f]));

  // Build a session-id -> session lookup
  const sessionMap = new Map(sessions.map((s) => [s.id, s]));

  // -----------------------------------------------
  // a. Fly Effectiveness — top 5 by fish-per-session
  // -----------------------------------------------
  const flyAgg: Record<
    string,
    { name: string; type: string | null; catches: number; sessionIds: Set<string> }
  > = {};

  for (const c of catches) {
    const flyId = c.fly_pattern_id;
    if (!flyId) continue;
    const fly = flyMap.get(flyId);
    if (!fly) continue;
    const key = flyId;
    if (!flyAgg[key]) {
      flyAgg[key] = { name: fly.name, type: fly.type, catches: 0, sessionIds: new Set() };
    }
    flyAgg[key].catches += c.quantities || 1;
    flyAgg[key].sessionIds.add(c.session_id);
  }

  const flyEffectiveness: FlyEffectivenessItem[] = Object.values(flyAgg)
    .map((f) => ({
      flyName: f.name,
      flyType: f.type,
      totalCatches: f.catches,
      sessionsUsed: f.sessionIds.size,
      fishPerSession: f.catches / f.sessionIds.size,
    }))
    .sort((a, b) => b.fishPerSession - a.fishPerSession)
    .slice(0, 5);

  // -----------------------------------------------
  // b. Best Time of Day
  // -----------------------------------------------
  const timeBuckets: Record<string, number> = {
    Morning: 0,
    Midday: 0,
    Afternoon: 0,
    Evening: 0,
  };

  for (const c of catches) {
    if (!c.time_caught) continue;
    const match = c.time_caught.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
    if (!match) continue;
    let hour = parseInt(match[1], 10);
    const ampm = match[3]?.toUpperCase();
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    const qty = c.quantities || 1;
    if (hour < 11) timeBuckets.Morning += qty;
    else if (hour < 14) timeBuckets.Midday += qty;
    else if (hour < 17) timeBuckets.Afternoon += qty;
    else timeBuckets.Evening += qty;
  }

  const totalTimeCatches = Object.values(timeBuckets).reduce((s, v) => s + v, 0);
  const bestTimeOfDay: TimeOfDayBucket[] = Object.entries(timeBuckets)
    .map(([slot, count]) => ({
      slot,
      catches: count,
      pct: totalTimeCatches > 0 ? Math.round((count / totalTimeCatches) * 100) : 0,
    }))
    .sort((a, b) => b.catches - a.catches);

  // -----------------------------------------------
  // c. Weather Correlation
  // -----------------------------------------------
  const weatherAgg: Record<string, { totalFish: number; count: number }> = {};

  for (const s of sessions) {
    const raw = s.weather_condition || s.weather;
    if (!raw) continue;
    const lower = raw.toLowerCase();
    const condition = lower.includes("cloud") || lower.includes("overcast")
      ? "Cloudy"
      : lower.includes("rain") || lower.includes("drizzle")
        ? "Rain"
        : lower.includes("sun") || lower.includes("clear")
          ? "Sunny"
          : lower.includes("snow")
            ? "Snow"
            : "Other";
    if (!weatherAgg[condition]) weatherAgg[condition] = { totalFish: 0, count: 0 };
    weatherAgg[condition].totalFish += s.total_fish || 0;
    weatherAgg[condition].count++;
  }

  const weatherCorrelation: WeatherBucket[] = Object.entries(weatherAgg)
    .filter(([k]) => k !== "Other")
    .map(([condition, d]) => ({
      condition,
      avgFishPerSession: d.count > 0 ? parseFloat((d.totalFish / d.count).toFixed(1)) : 0,
      sessionCount: d.count,
    }))
    .sort((a, b) => b.avgFishPerSession - a.avgFishPerSession);

  // -----------------------------------------------
  // d. Best Rivers (min 2 sessions)
  // -----------------------------------------------
  const riverAgg: Record<string, { totalFish: number; count: number }> = {};
  for (const s of sessions) {
    const river = s.river_name || "Unknown";
    if (!riverAgg[river]) riverAgg[river] = { totalFish: 0, count: 0 };
    riverAgg[river].totalFish += s.total_fish || 0;
    riverAgg[river].count++;
  }

  const bestRivers: RiverBucket[] = Object.entries(riverAgg)
    .filter(([, d]) => d.count >= 2)
    .map(([river, d]) => ({
      river,
      avgFishPerSession: parseFloat((d.totalFish / d.count).toFixed(1)),
      sessionCount: d.count,
      totalFish: d.totalFish,
    }))
    .sort((a, b) => b.avgFishPerSession - a.avgFishPerSession)
    .slice(0, 5);

  // -----------------------------------------------
  // e. Species Breakdown
  // -----------------------------------------------
  const speciesAgg: Record<string, number> = {};
  for (const c of catches) {
    const sp = c.species || "Unknown";
    speciesAgg[sp] = (speciesAgg[sp] || 0) + (c.quantities || 1);
  }

  const totalSpeciesCatches = Object.values(speciesAgg).reduce((s, v) => s + v, 0);
  const speciesBreakdown: SpeciesBucket[] = Object.entries(speciesAgg)
    .map(([species, count]) => ({
      species,
      count,
      pct: totalSpeciesCatches > 0 ? Math.round((count / totalSpeciesCatches) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // -----------------------------------------------
  // f. Monthly Trends (last 12 months)
  // -----------------------------------------------
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  const monthlyAgg: Record<string, { fish: number; sessions: number }> = {};

  // Pre-fill all 12 months
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyAgg[key] = { fish: 0, sessions: 0 };
  }

  for (const s of sessions) {
    const d = new Date(s.date + "T00:00:00");
    if (d < twelveMonthsAgo) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyAgg[key]) {
      monthlyAgg[key].fish += s.total_fish || 0;
      monthlyAgg[key].sessions++;
    }
  }

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const monthlyTrends: MonthlyTrendPoint[] = Object.entries(monthlyAgg)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => {
      const [y, m] = month.split("-");
      return {
        month,
        label: `${monthNames[parseInt(m, 10) - 1]} ${y}`,
        fish: d.fish,
        sessions: d.sessions,
      };
    });

  // -----------------------------------------------
  // g. Streak Stats
  // -----------------------------------------------
  // sessions already sorted ascending by date
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (const s of sessions) {
    if ((s.total_fish || 0) >= 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Current streak is the tail end
  currentStreak = 0;
  for (let i = sessions.length - 1; i >= 0; i--) {
    if ((sessions[i].total_fish || 0) >= 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  const streakStats: StreakStats = { currentStreak, longestStreak };

  // -----------------------------------------------
  // Build response
  // -----------------------------------------------
  const payload: InsightsPayload = {
    flyEffectiveness,
    bestTimeOfDay,
    weatherCorrelation,
    bestRivers,
    speciesBreakdown,
    monthlyTrends,
    streakStats,
    totalSessions: sessions.length,
    totalCatches: catches.reduce((s, c) => s + (c.quantities || 1), 0),
  };

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "private, max-age=300" },
  });
}
