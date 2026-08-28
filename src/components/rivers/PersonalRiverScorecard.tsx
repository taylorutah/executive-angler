"use client";

import { useState, useEffect } from "react";
import { Sparkles, Lock, Fish, Ruler, MapPin, Sunrise, Calendar, Wrench, Feather, TrendingUp } from "@/icons";
import type { PersonalRiverScorecard } from "@/app/api/insights/personal-river/[riverId]/route";
import { useAuth } from "@/lib/auth-context";
import { fetchOnce } from "./fetch-once";

interface Props {
  riverId: string;
  riverName: string;
}

type LoadState = "loading" | "failed" | "ready";

export default function PersonalRiverScorecardCard({ riverId, riverName }: Props) {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<PersonalRiverScorecard | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    // Owner-scoped insights — never requested without a session.
    if (authLoading || !user) return;
    let cancelled = false;
    fetchOnce(`/api/insights/personal-river/${riverId}`).then(async (res) => {
      if (cancelled) return;
      if (!res.ok) return setLoadState("failed");
      const json = (await res.json()) as PersonalRiverScorecard;
      setData(json);
      setLoadState("ready");
    }).catch(() => setLoadState("failed"));
    return () => { cancelled = true; };
  }, [riverId, user, authLoading]);

  if (!user) return null;

  if (loadState === "loading") return null;

  if (loadState === "failed") return null;

  // Signed in, with data
  if (!data || data.totalSessions === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-[var(--accent)]" />
          <h3 className="font-heading text-base font-semibold text-[var(--text-1)]">
            Your River Scorecard
          </h3>
        </div>
        <p className="text-xs text-[var(--text-2)]">
          No sessions logged on {riverName} yet. Once you fish here, your
          personal patterns appear in this card.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-[var(--accent)]" />
        <h3 className="font-heading text-base font-semibold text-[var(--text-1)]">
          Your River Scorecard
        </h3>
      </div>
      <p className="text-xs text-[var(--text-3)] mb-4">
        From your private journal — visible only to you.
      </p>

      {/* Top stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <Stat icon={<Calendar className="h-3.5 w-3.5 text-[var(--accent)]" />} label="Sessions" value={String(data.totalSessions)} />
        <Stat icon={<Fish className="h-3.5 w-3.5 text-[var(--accent)]" />} label="Avg/trip" value={data.avgFishPerSession != null ? String(data.avgFishPerSession) : "—"} />
        <Stat icon={<TrendingUp className="h-3.5 w-3.5 text-[var(--accent)]" />} label="Total fish" value={String(data.totalFish)} />
        <Stat icon={<Ruler className="h-3.5 w-3.5 text-[var(--accent)]" />} label="Biggest" value={data.biggestFishInches != null ? `${data.biggestFishInches}"` : "—"} />
      </div>

      {/* Detail rows — only render rows that have data */}
      <div className="space-y-2">
        {data.topFlyName && (
          <Row icon={<Feather className="h-3.5 w-3.5 text-[var(--accent)]" />} label="Your top fly" value={data.topFlyName} />
        )}
        {data.bestSection && (
          <Row
            icon={<MapPin className="h-3.5 w-3.5 text-[var(--accent)]" />}
            label="Best section"
            value={`${data.bestSection.section} (avg ${data.bestSection.avgFish} on ${data.bestSection.sessionCount} trip${data.bestSection.sessionCount === 1 ? "" : "s"})`}
          />
        )}
        {data.bestTimeOfDay && (
          <Row
            icon={<Sunrise className="h-3.5 w-3.5 text-[var(--accent)]" />}
            label="Best time"
            value={`${data.bestTimeOfDay.label} — avg ${data.bestTimeOfDay.avgFish}`}
          />
        )}
        {data.bestMonth && (
          <Row
            icon={<Calendar className="h-3.5 w-3.5 text-[var(--accent)]" />}
            label="Best month"
            value={`${data.bestMonth.month} — avg ${data.bestMonth.avgFish}`}
          />
        )}
        {data.topGear && (data.topGear.rodBrand || data.topGear.leader || data.topGear.tippet) && (
          <Row
            icon={<Wrench className="h-3.5 w-3.5 text-[var(--accent)]" />}
            label="Your gear"
            value={[data.topGear.rodBrand, data.topGear.leader, data.topGear.tippet].filter(Boolean).join(" · ")}
          />
        )}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-[var(--text-3)] mt-4 pt-3 border-t border-[var(--border)]">
        <Lock className="h-3.5 w-3.5" /> Owner-only data. Never broadcast to other anglers.
      </p>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-start gap-0.5 px-3 py-2 bg-[var(--paper-deep)] rounded-[var(--radius-md)]">
      <div className="flex items-center gap-1">{icon}<span className="num text-base font-semibold text-[var(--text-1)]">{value}</span></div>
      <span className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--text-3)]">{label}</span>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[var(--paper-deep)] rounded-[var(--radius-md)]">
      {icon}
      <span className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--text-3)] w-20 flex-shrink-0">{label}</span>
      <span className="text-sm text-[var(--text-1)] truncate">{value}</span>
    </div>
  );
}
