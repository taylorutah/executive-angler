"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface RiverActivityStats {
  totalSessions: number;
  sessionsLast7d: number;
  totalFish: number;
  avgFishPerSession: number | null;
  lastSessionDate: string | null;
  recentWaterTemp: number | null;
  isLive: boolean;
  isLoading: boolean;
}

const EMPTY_STATS: Omit<RiverActivityStats, "isLoading"> = {
  totalSessions: 0,
  sessionsLast7d: 0,
  totalFish: 0,
  avgFishPerSession: null,
  lastSessionDate: null,
  recentWaterTemp: null,
  isLive: false,
};

export function useRiverActivity(riverId: string): RiverActivityStats {
  const [stats, setStats] = useState<Omit<RiverActivityStats, "isLoading">>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("river_activity_stats")
      .select("*")
      .eq("river_id", riverId)
      .maybeSingle();

    if (error) {
      console.error("[useRiverActivity] fetch error:", error.message);
      setIsLoading(false);
      return;
    }

    if (!data) {
      setStats(EMPTY_STATS);
      setIsLoading(false);
      return;
    }

    setStats({
      totalSessions: data.total_sessions ?? 0,
      sessionsLast7d: data.sessions_last_7d ?? 0,
      totalFish: data.total_fish ?? 0,
      avgFishPerSession: data.avg_fish_per_session ?? null,
      lastSessionDate: data.last_session_date ?? null,
      recentWaterTemp: data.recent_water_temp ?? null,
      isLive: data.is_live ?? false,
    });
    setIsLoading(false);
  }, [riverId]);

  useEffect(() => {
    // Initial fetch
    fetchStats();

    // Subscribe to realtime changes on public fishing_sessions for this river
    const supabase = createClient();

    const channel = supabase
      .channel(`river-activity-${riverId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "fishing_sessions",
          filter: `river_id=eq.${riverId}`,
        },
        (payload) => {
          // Only refetch for public sessions
          if (payload.new && payload.new.privacy === "public") {
            fetchStats();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "fishing_sessions",
          filter: `river_id=eq.${riverId}`,
        },
        (payload) => {
          if (payload.new && payload.new.privacy === "public") {
            fetchStats();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [riverId, fetchStats]);

  return { ...stats, isLoading };
}
