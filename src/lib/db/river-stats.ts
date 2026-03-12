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
 * Fetch aggregate activity stats for a river from the river_activity_stats view.
 * Returns null if no sessions exist for the river yet.
 */
export async function getRiverActivityStats(
  riverId: string
): Promise<RiverActivityStats | null> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("river_activity_stats")
    .select("*")
    .eq("river_id", riverId)
    .maybeSingle();

  if (error) {
    // View may not exist yet — fail silently so pages still render
    console.warn("[getRiverActivityStats] query error:", error.message);
    return null;
  }

  return data as RiverActivityStats | null;
}
