import { createStaticClient } from "@/lib/supabase/static";

export interface RiverActivityStats {
  river_id: string;
  total_sessions: number;
  sessions_last_30d: number;
  sessions_last_7d: number;
  total_fish_recorded: number;
  avg_fish_per_session: number | null;
  last_session_date: string | null;
  total_catches: number;
}

/**
 * Compute aggregate activity stats for a river directly from fishing_sessions + catches.
 * No SQL view required — works via REST API filters.
 * Returns null if no sessions exist for this river yet.
 */
export async function getRiverActivityStats(
  riverId: string
): Promise<RiverActivityStats | null> {
  const supabase = createStaticClient();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // Fetch all sessions for this river
  const { data: sessions, error } = await supabase
    .from("fishing_sessions")
    .select("id, date, total_fish")
    .eq("river_id", riverId);

  if (error || !sessions || sessions.length === 0) {
    return null;
  }

  // Compute stats
  const total_sessions = sessions.length;
  const sessions_last_30d = sessions.filter((s) => s.date >= thirtyDaysAgo).length;
  const sessions_last_7d = sessions.filter((s) => s.date >= sevenDaysAgo).length;

  const fishCounts = sessions.map((s) => s.total_fish ?? 0);
  const total_fish_recorded = fishCounts.reduce((a, b) => a + b, 0);

  const sessionsWithFish = sessions.filter((s) => (s.total_fish ?? 0) > 0);
  const avg_fish_per_session =
    sessionsWithFish.length > 0
      ? Math.round(
          (sessionsWithFish.reduce((a, s) => a + (s.total_fish ?? 0), 0) /
            sessionsWithFish.length) *
            10
        ) / 10
      : null;

  const dates = sessions.map((s) => s.date).filter(Boolean).sort();
  const last_session_date = dates.length > 0 ? dates[dates.length - 1] : null;

  // Count catches linked to these sessions
  const sessionIds = sessions.map((s) => s.id);
  const { count: total_catches } = await supabase
    .from("catches")
    .select("id", { count: "exact", head: true })
    .in("session_id", sessionIds);

  return {
    river_id: riverId,
    total_sessions,
    sessions_last_30d,
    sessions_last_7d,
    total_fish_recorded,
    avg_fish_per_session,
    last_session_date,
    total_catches: total_catches ?? 0,
  };
}
