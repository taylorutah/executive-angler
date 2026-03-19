"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Fish, Radio, Clock } from "lucide-react";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

/* ── Types ─────────────────────────────────────────────────────────── */

interface SessionRow {
  id: string;
  user_id: string;
  river_id: string | null;
  river_name: string | null;
  section: string | null;
  total_fish: number;
  date: string;
  privacy: string;
  created_at: string;
  ended_at: string | null;
}

interface LiveEvent {
  id: string;
  kind: "started" | "completed" | "updated";
  riverName: string;
  section: string | null;
  totalFish: number;
  date: string;
  timestamp: number; // Date.now() when we received it
}

/* ── Helpers ───────────────────────────────────────────────────────── */

function relativeTime(ms: number): string {
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

/* ── Component ─────────────────────────────────────────────────────── */

interface RiverRealtimeActivityProps {
  riverId: string;
  riverName: string;
}

export default function RiverRealtimeActivity({
  riverId,
  riverName,
}: RiverRealtimeActivityProps) {
  const [activeCount, setActiveCount] = useState<number>(0);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [now, setNow] = useState(Date.now());
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Tick every 30s so "just now" / "2m ago" stays fresh
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const pushEvent = useCallback((evt: LiveEvent) => {
    setEvents((prev) => {
      // Deduplicate by session id — keep the latest
      const filtered = prev.filter((e) => e.id !== evt.id);
      return [evt, ...filtered].slice(0, 8);
    });
  }, []);

  /* ── Bootstrap: fetch current active sessions + recent completions ── */
  useEffect(() => {
    const supabase = createClient();

    async function bootstrap() {
      // Active sessions on this river right now (ended_at IS NULL)
      const { data: active } = await supabase
        .from("fishing_sessions")
        .select("id, river_name, section, total_fish, date, created_at, ended_at")
        .eq("river_id", riverId)
        .eq("privacy", "public")
        .is("ended_at", null)
        .order("created_at", { ascending: false });

      setActiveCount(active?.length ?? 0);

      // Seed the feed with the 5 most recent completed public sessions
      const { data: recent } = await supabase
        .from("fishing_sessions")
        .select("id, river_name, section, total_fish, date, created_at, ended_at")
        .eq("river_id", riverId)
        .eq("privacy", "public")
        .not("ended_at", "is", null)
        .order("ended_at", { ascending: false })
        .limit(5);

      if (recent && recent.length > 0) {
        const seed: LiveEvent[] = recent.map((s) => ({
          id: s.id,
          kind: "completed" as const,
          riverName: s.river_name ?? riverName,
          section: s.section,
          totalFish: s.total_fish ?? 0,
          date: s.date,
          timestamp: new Date(s.ended_at!).getTime(),
        }));
        setEvents(seed);
      }
    }

    bootstrap();
  }, [riverId, riverName]);

  /* ── Realtime subscription ──────────────────────────────────────── */
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`river-realtime-${riverId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "fishing_sessions",
          filter: `river_id=eq.${riverId}`,
        },
        (payload: RealtimePostgresChangesPayload<SessionRow>) => {
          const row = payload.new as SessionRow | undefined;
          if (!row || row.privacy !== "public") return;

          setActiveCount((c) => c + 1);
          pushEvent({
            id: row.id,
            kind: "started",
            riverName: row.river_name ?? riverName,
            section: row.section,
            totalFish: row.total_fish ?? 0,
            date: row.date,
            timestamp: Date.now(),
          });
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
        (payload: RealtimePostgresChangesPayload<SessionRow>) => {
          const row = payload.new as SessionRow | undefined;
          const old = payload.old as Partial<SessionRow> | undefined;
          if (!row || row.privacy !== "public") return;

          // Session just ended
          if (row.ended_at && !old?.ended_at) {
            setActiveCount((c) => Math.max(0, c - 1));
            pushEvent({
              id: row.id,
              kind: "completed",
              riverName: row.river_name ?? riverName,
              section: row.section,
              totalFish: row.total_fish ?? 0,
              date: row.date,
              timestamp: Date.now(),
            });
          } else {
            // Mid-session update (new catch logged, etc.)
            pushEvent({
              id: row.id,
              kind: "updated",
              riverName: row.river_name ?? riverName,
              section: row.section,
              totalFish: row.total_fish ?? 0,
              date: row.date,
              timestamp: Date.now(),
            });
          }
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [riverId, riverName, pushEvent]);

  /* ── Render ─────────────────────────────────────────────────────── */

  // Nothing to show and nobody is active — hide the widget entirely
  if (activeCount === 0 && events.length === 0 && !connected) return null;

  return (
    <div className="bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden">
      {/* ── Header bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#21262D]">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-[#0BA5C7]" />
          <h3 className="font-heading text-sm font-semibold text-[#F0F6FC]">
            Live Activity
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {connected && (
            <span className="flex items-center gap-1.5 text-[10px] text-[#0BA5C7] font-medium">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0BA5C7] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0BA5C7]" />
              </span>
              Connected
            </span>
          )}
        </div>
      </div>

      {/* ── Active anglers banner ──────────────────────────────────── */}
      {activeCount > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 bg-[#0BA5C7]/10 border-b border-[#21262D]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-sm text-[#F0F6FC]">
            <span className="font-mono font-bold text-[#E8923A]">
              {activeCount}
            </span>{" "}
            angler{activeCount !== 1 ? "s" : ""} on the water now
          </span>
        </div>
      )}

      {/* ── Event feed ─────────────────────────────────────────────── */}
      {events.length > 0 && (
        <ul className="divide-y divide-[#21262D]">
          {events.map((evt) => (
            <li
              key={`${evt.id}-${evt.kind}`}
              className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-[#0D1117]/40"
            >
              {/* Icon */}
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  evt.kind === "started"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : evt.kind === "completed"
                      ? "bg-[#E8923A]/20 text-[#E8923A]"
                      : "bg-[#0BA5C7]/20 text-[#0BA5C7]"
                }`}
              >
                {evt.kind === "started" ? (
                  <Radio className="h-3.5 w-3.5" />
                ) : evt.kind === "completed" ? (
                  <Fish className="h-3.5 w-3.5" />
                ) : (
                  <Fish className="h-3.5 w-3.5" />
                )}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#F0F6FC]">
                  {evt.kind === "started" && "Session started"}
                  {evt.kind === "completed" && (
                    <>
                      Session completed
                      {evt.totalFish > 0 && (
                        <>
                          {" "}&mdash;{" "}
                          <span className="font-mono font-semibold text-[#E8923A]">
                            {evt.totalFish}
                          </span>{" "}
                          fish
                        </>
                      )}
                    </>
                  )}
                  {evt.kind === "updated" && (
                    <>
                      Catch logged
                      {evt.totalFish > 0 && (
                        <>
                          {" "}&mdash;{" "}
                          <span className="font-mono font-semibold text-[#0BA5C7]">
                            {evt.totalFish}
                          </span>{" "}
                          fish so far
                        </>
                      )}
                    </>
                  )}
                </p>
                {evt.section && (
                  <p className="text-[10px] text-[#8B949E] truncate">
                    {evt.section}
                  </p>
                )}
              </div>

              {/* Timestamp */}
              <span className="flex items-center gap-1 shrink-0 text-[10px] text-[#484F58]">
                <Clock className="h-3 w-3" />
                {relativeTime(now - evt.timestamp)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* ── Empty state ────────────────────────────────────────────── */}
      {events.length === 0 && activeCount === 0 && connected && (
        <div className="px-5 py-6 text-center">
          <p className="text-xs text-[#484F58]">
            Listening for activity on {riverName}...
          </p>
        </div>
      )}
    </div>
  );
}
