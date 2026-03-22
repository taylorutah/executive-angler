"use client";

import { useRiverActivity } from "@/hooks/useRiverActivity";

interface RiverActivityPulseProps {
  riverId: string;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr + "T12:00:00");
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export default function RiverActivityPulse({ riverId }: RiverActivityPulseProps) {
  const {
    sessionsLast7d,
    totalFish,
    lastSessionDate,
    recentWaterTemp,
    isLive,
    isLoading,
    totalSessions,
  } = useRiverActivity(riverId);

  // Don't render anything while loading or if there's no data at all
  if (isLoading) return null;
  if (totalSessions === 0) return null;

  return (
    <div className="bg-[#161B22] rounded-lg border border-[#21262D] px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {/* Live indicator */}
      {isLive && (
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#00B4D8]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00B4D8] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00B4D8]" />
          </span>
          Live
        </span>
      )}

      {/* Weekly activity */}
      <span className="text-xs text-[#F0F6FC]">
        <span className="font-mono font-semibold text-[#E8923A]">{sessionsLast7d}</span>
        {" "}session{sessionsLast7d !== 1 ? "s" : ""} this week
        {totalFish > 0 && (
          <>
            {" "}&middot;{" "}
            <span className="font-mono font-semibold text-[#E8923A]">{totalFish}</span>
            {" "}fish reported
          </>
        )}
      </span>

      {/* Last fished */}
      {lastSessionDate && (
        <span className="text-xs text-[#A8B2BD]">
          Last fished: {timeAgo(lastSessionDate)}
        </span>
      )}

      {/* Water temp */}
      {recentWaterTemp != null && (
        <span className="text-xs text-[#A8B2BD]">
          Water temp: <span className="font-mono text-[#F0F6FC]">{recentWaterTemp}&deg;F</span>
        </span>
      )}
    </div>
  );
}
