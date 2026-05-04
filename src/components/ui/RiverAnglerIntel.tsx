"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Feather, Lock } from "lucide-react";
import type { RiverFlyPulse } from "@/app/api/intel/river/[riverId]/route";

interface RiverAnglerIntelProps {
  riverId: string;
  riverName: string;
}

function FlyPulseSkeleton() {
  return (
    <div className="animate-pulse bg-[#161B22] rounded-xl border border-[#21262D] p-5 space-y-3">
      <div className="h-4 w-40 bg-[#21262D] rounded" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-5 bg-[#0D1117] rounded" />
      ))}
    </div>
  );
}

export default function RiverAnglerIntel({ riverId, riverName }: RiverAnglerIntelProps) {
  const [pulse, setPulse] = useState<RiverFlyPulse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/intel/river/${riverId}`)
      .then((r) => r.json())
      .then((d) => {
        setPulse(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [riverId]);

  if (loading) return <FlyPulseSkeleton />;

  const flies = pulse?.topFlies ?? [];
  const hasFlies = flies.length > 0;

  return (
    <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="h-4 w-4 text-[#E8923A]" />
        <h3 className="font-heading text-base font-semibold text-[#F0F6FC]">
          Recent Fly Choices
        </h3>
        <span className="ml-auto text-[10px] text-[#6E7681] uppercase tracking-wider">
          Last 60 days
        </span>
      </div>
      <p className="text-[11px] text-[#6E7681] mb-4">
        Patterns anglers have been tying on for {riverName} — a real-time
        hatch chart, no fish counts attached.
      </p>

      {/* Fly list */}
      {hasFlies ? (
        <div className="space-y-2">
          {flies.map((fly, i) => (
            <div
              key={`${fly.flyName}-${i}`}
              className="flex items-center gap-3 px-3 py-2 bg-[#0D1117] rounded-lg border border-[#21262D]"
            >
              <Feather className="h-3.5 w-3.5 text-[#E8923A] flex-shrink-0" />
              <span className="text-sm font-medium text-[#F0F6FC] flex-1 min-w-0 truncate">
                {fly.flyName}
              </span>
              {fly.sizes.length > 0 && (
                <span className="text-[11px] text-[#A8B2BD] font-['IBM_Plex_Mono']">
                  {fly.sizes.map((s) => `#${s.replace(/^#/, "")}`).join(", ")}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0D1117] rounded-lg border border-[#21262D] border-dashed p-5 text-center">
          <Feather className="h-7 w-7 text-[#6E7681] mx-auto mb-2" />
          <p className="text-xs text-[#A8B2BD]">
            No recent fly logs from anglers on {riverName}.
          </p>
          <p className="text-[10px] text-[#6E7681] mt-1">
            Pulse refreshes as anglers log catches and tag flies.
          </p>
        </div>
      )}

      {/* Privacy footer — wear the ethic on the page */}
      <div className="flex items-start gap-2 mt-4 pt-4 border-t border-[#21262D]">
        <Lock className="h-3 w-3 text-[#6E7681] mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-[#6E7681] leading-relaxed">
          We never publish fish counts, GPS, or trip reports. Locations and
          catches stay between each angler and the river.
        </p>
      </div>
    </div>
  );
}
