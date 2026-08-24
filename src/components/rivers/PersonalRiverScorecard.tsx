"use client";

import { useState, useEffect } from "react";
import { Sparkles, Lock, Fish, Ruler, MapPin, Sunrise, Calendar, Wrench, Feather, TrendingUp } from "lucide-react";
import type { PersonalRiverScorecard } from "@/app/api/insights/personal-river/[riverId]/route";
import { useAuth } from "@/lib/auth-context";
import { fetchOnce } from "./fetch-once";
import SignedOutInsight from "./SignedOutInsight";

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

  if (!authLoading && !user) {
    return (
      <SignedOutInsight
        icon={<Sparkles className="h-4 w-4 text-[var(--action)]" />}
        title="Your River Scorecard"
        description={`Sign in and this card keeps your running record on ${riverName} — sessions fished, fish per trip, your biggest, your top fly, and the section and time of day that produce for you. It stays private to you.`}
      />
    );
  }

  if (authLoading || loadState === "loading") {
    return (
      <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-5 animate-pulse h-48" />
    );
  }

  if (loadState === "failed") return null;

  // Signed in, with data
  if (!data || data.totalSessions === 0) {
    return (
      <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-[var(--action)]" />
          <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
            Your River Scorecard
          </h3>
        </div>
        <p className="text-xs text-[var(--text-body)]">
          No sessions logged on {riverName} yet. Once you fish here, your
          personal patterns appear in this card.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-px bg-gradient-to-br from-[var(--action)]/30 via-transparent to-[var(--signal-live)]/30">
      <div className="bg-[var(--surface-raised)] rounded-[11px] p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-[var(--action)]" />
          <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
            Your River Scorecard
          </h3>
        </div>
        <p className="text-[11px] text-[var(--text-meta)] mb-4">
          From your private journal — visible only to you.
        </p>

        {/* Top stat row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <Stat icon={<Calendar className="h-3 w-3 text-[var(--action)]" />} label="Sessions" value={String(data.totalSessions)} />
          <Stat icon={<Fish className="h-3 w-3 text-[var(--action)]" />} label="Avg/trip" value={data.avgFishPerSession != null ? String(data.avgFishPerSession) : "—"} />
          <Stat icon={<TrendingUp className="h-3 w-3 text-[var(--action)]" />} label="Total fish" value={String(data.totalFish)} />
          <Stat icon={<Ruler className="h-3 w-3 text-[var(--action)]" />} label="Biggest" value={data.biggestFishInches != null ? `${data.biggestFishInches}"` : "—"} />
        </div>

        {/* Detail rows — only render rows that have data */}
        <div className="space-y-2">
          {data.topFlyName && (
            <Row icon={<Feather className="h-3.5 w-3.5 text-[var(--action)]/70" />} label="Your top fly" value={data.topFlyName} />
          )}
          {data.bestSection && (
            <Row
              icon={<MapPin className="h-3.5 w-3.5 text-[var(--action)]/70" />}
              label="Best section"
              value={`${data.bestSection.section} (avg ${data.bestSection.avgFish} on ${data.bestSection.sessionCount} trip${data.bestSection.sessionCount === 1 ? "" : "s"})`}
            />
          )}
          {data.bestTimeOfDay && (
            <Row
              icon={<Sunrise className="h-3.5 w-3.5 text-[var(--action)]/70" />}
              label="Best time"
              value={`${data.bestTimeOfDay.label} — avg ${data.bestTimeOfDay.avgFish}`}
            />
          )}
          {data.bestMonth && (
            <Row
              icon={<Calendar className="h-3.5 w-3.5 text-[var(--action)]/70" />}
              label="Best month"
              value={`${data.bestMonth.month} — avg ${data.bestMonth.avgFish}`}
            />
          )}
          {data.topGear && (data.topGear.rodBrand || data.topGear.leader || data.topGear.tippet) && (
            <Row
              icon={<Wrench className="h-3.5 w-3.5 text-[var(--action)]/70" />}
              label="Your gear"
              value={[data.topGear.rodBrand, data.topGear.leader, data.topGear.tippet].filter(Boolean).join(" · ")}
            />
          )}
        </div>

        <p className="flex items-center gap-1.5 text-[10px] text-[var(--text-meta)] mt-4 pt-3 border-t border-[var(--border-rule)]">
          <Lock className="h-3 w-3" /> Owner-only data. Never broadcast to other anglers.
        </p>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-start gap-0.5 px-3 py-2 bg-[var(--surface-page)] rounded-lg border border-[var(--border-rule)]">
      <div className="flex items-center gap-1">{icon}<span className="font-mono text-base font-bold text-[var(--text-primary)]">{value}</span></div>
      <span className="text-[9px] uppercase tracking-wider text-[var(--text-meta)]">{label}</span>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-page)] rounded-lg border border-[var(--border-rule)]">
      {icon}
      <span className="text-[10px] uppercase tracking-wider text-[var(--text-meta)] w-20 flex-shrink-0">{label}</span>
      <span className="text-sm text-[var(--text-primary)] truncate">{value}</span>
    </div>
  );
}
