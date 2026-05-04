"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Lock, Fish, Ruler, MapPin, Sunrise, Calendar, Wrench, Feather, TrendingUp } from "lucide-react";
import type { PersonalRiverScorecard } from "@/app/api/insights/personal-river/[riverId]/route";

interface Props {
  riverId: string;
  riverName: string;
}

type AuthState = "loading" | "none" | "free" | "premium";

export default function PersonalRiverScorecardCard({ riverId, riverName }: Props) {
  const [data, setData] = useState<PersonalRiverScorecard | null>(null);
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/insights/personal-river/${riverId}`).then(async (res) => {
      if (cancelled) return;
      if (res.status === 401) return setAuthState("none");
      if (res.status === 403) return setAuthState("free");
      if (!res.ok) return setAuthState("none");
      const json = (await res.json()) as PersonalRiverScorecard;
      setData(json);
      setAuthState("premium");
    }).catch(() => setAuthState("none"));
    return () => { cancelled = true; };
  }, [riverId]);

  if (authState === "loading") {
    return (
      <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5 animate-pulse h-48" />
    );
  }

  if (authState === "none") {
    // Anonymous — render nothing; the unauth experience for the river
    // page already shows static intel. Personal stats only matter when
    // logged in.
    return null;
  }

  if (authState === "free") {
    return (
      <div className="rounded-xl p-px bg-gradient-to-br from-[#E8923A]/40 via-[#E8923A]/10 to-[#0BA5C7]/30">
        <div className="bg-[#161B22] rounded-[11px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-[#E8923A]" />
            <h3 className="font-heading text-base font-semibold text-[#F0F6FC]">
              Your River Scorecard
            </h3>
            <span className="ml-auto text-[9px] font-bold tracking-wider text-[#E8923A] bg-[#E8923A]/10 px-1.5 py-0.5 rounded">
              PRO
            </span>
          </div>
          <p className="text-sm text-[#A8B2BD] mb-4 leading-relaxed">
            Your sessions, your biggest fish, your best section, your top fly,
            your best time of day, your best month, your gear — all for{" "}
            {riverName}. Pro turns your private journal into a per-river edge.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8923A] text-white text-sm font-semibold rounded-lg hover:bg-[#F0A65A] transition-colors"
          >
            Upgrade to Pro — $2.99/mo
          </Link>
          <p className="flex items-center gap-1.5 text-[10px] text-[#6E7681] mt-3">
            <Lock className="h-3 w-3" /> Your data, your patterns. Never crowdsourced from others.
          </p>
        </div>
      </div>
    );
  }

  // Premium with data
  if (!data || data.totalSessions === 0) {
    return (
      <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-[#E8923A]" />
          <h3 className="font-heading text-base font-semibold text-[#F0F6FC]">
            Your River Scorecard
          </h3>
        </div>
        <p className="text-xs text-[#A8B2BD]">
          No sessions logged on {riverName} yet. Once you fish here, your
          personal patterns appear in this card.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-px bg-gradient-to-br from-[#E8923A]/30 via-transparent to-[#0BA5C7]/30">
      <div className="bg-[#161B22] rounded-[11px] p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-[#E8923A]" />
          <h3 className="font-heading text-base font-semibold text-[#F0F6FC]">
            Your River Scorecard
          </h3>
          <span className="ml-auto text-[9px] font-bold tracking-wider text-[#E8923A] bg-[#E8923A]/10 px-1.5 py-0.5 rounded">
            PRO
          </span>
        </div>
        <p className="text-[11px] text-[#6E7681] mb-4">
          From your private journal — visible only to you.
        </p>

        {/* Top stat row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <Stat icon={<Calendar className="h-3 w-3 text-[#E8923A]" />} label="Sessions" value={String(data.totalSessions)} />
          <Stat icon={<Fish className="h-3 w-3 text-[#E8923A]" />} label="Avg/trip" value={data.avgFishPerSession != null ? String(data.avgFishPerSession) : "—"} />
          <Stat icon={<TrendingUp className="h-3 w-3 text-[#E8923A]" />} label="Total fish" value={String(data.totalFish)} />
          <Stat icon={<Ruler className="h-3 w-3 text-[#E8923A]" />} label="Biggest" value={data.biggestFishInches != null ? `${data.biggestFishInches}"` : "—"} />
        </div>

        {/* Detail rows — only render rows that have data */}
        <div className="space-y-2">
          {data.topFlyName && (
            <Row icon={<Feather className="h-3.5 w-3.5 text-[#E8923A]/70" />} label="Your top fly" value={data.topFlyName} />
          )}
          {data.bestSection && (
            <Row
              icon={<MapPin className="h-3.5 w-3.5 text-[#E8923A]/70" />}
              label="Best section"
              value={`${data.bestSection.section} (avg ${data.bestSection.avgFish} on ${data.bestSection.sessionCount} trip${data.bestSection.sessionCount === 1 ? "" : "s"})`}
            />
          )}
          {data.bestTimeOfDay && (
            <Row
              icon={<Sunrise className="h-3.5 w-3.5 text-[#E8923A]/70" />}
              label="Best time"
              value={`${data.bestTimeOfDay.label} — avg ${data.bestTimeOfDay.avgFish}`}
            />
          )}
          {data.bestMonth && (
            <Row
              icon={<Calendar className="h-3.5 w-3.5 text-[#E8923A]/70" />}
              label="Best month"
              value={`${data.bestMonth.month} — avg ${data.bestMonth.avgFish}`}
            />
          )}
          {data.topGear && (data.topGear.rodBrand || data.topGear.leader || data.topGear.tippet) && (
            <Row
              icon={<Wrench className="h-3.5 w-3.5 text-[#E8923A]/70" />}
              label="Your gear"
              value={[data.topGear.rodBrand, data.topGear.leader, data.topGear.tippet].filter(Boolean).join(" · ")}
            />
          )}
        </div>

        <p className="flex items-center gap-1.5 text-[10px] text-[#6E7681] mt-4 pt-3 border-t border-[#21262D]">
          <Lock className="h-3 w-3" /> Owner-only data. Never broadcast to other anglers.
        </p>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-start gap-0.5 px-3 py-2 bg-[#0D1117] rounded-lg border border-[#21262D]">
      <div className="flex items-center gap-1">{icon}<span className="font-mono text-base font-bold text-[#F0F6FC]">{value}</span></div>
      <span className="text-[9px] uppercase tracking-wider text-[#6E7681]">{label}</span>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#0D1117] rounded-lg border border-[#21262D]">
      {icon}
      <span className="text-[10px] uppercase tracking-wider text-[#6E7681] w-20 flex-shrink-0">{label}</span>
      <span className="text-sm text-[#F0F6FC] truncate">{value}</span>
    </div>
  );
}
