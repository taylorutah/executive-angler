"use client";

import Link from "next/link";
import {
  Wrench, Lightbulb, Feather, Leaf, Package, BarChart3, BookOpen, Upload, Trophy, Flame,
} from "lucide-react";
import { ButtonTile } from "@/components/ui/Button";

interface Stats {
  totalFish: number;
  totalSessions: number;
  monthFish: number;
  biggestFish: number;
  speciesCount: number;
  weeklyStreak: number;
}

interface Props {
  stats: Stats;
  flyCount: number;
  gearCount: number;
  tieNextCount: number;
  milestoneCount: number;
}

/**
 * Thin almanac-style bezel: a single line of mono stats that links to the journal,
 * sitting above a row of quick-launch tiles. River cards above this stay the hero.
 */
export default function CompactStatsRow({ stats, flyCount, gearCount, tieNextCount, milestoneCount }: Props) {
  return (
    <div className="rounded-xl bg-[#161B22] border border-[#21262D] px-4 py-3 flex flex-col gap-3">
      {/* Thin stat bezel — single mono line, sits quietly under the river cards */}
      <Link
        href="/journal"
        className="group inline-flex flex-wrap items-baseline gap-x-3 gap-y-0.5 font-mono text-[12px] text-[#6E7681] hover:text-[#A8B2BD] transition-colors tabular-nums"
      >
        <span>
          <span className="text-[#F0F6FC] font-semibold">{stats.totalFish}</span>{" "}
          <span className="lowercase">fish</span>
        </span>
        <span className="text-[#3a4150]">·</span>
        <span>
          <span className="text-[#F0F6FC] font-semibold">{stats.totalSessions}</span>{" "}
          <span className="lowercase">sessions</span>
        </span>
        {stats.monthFish > 0 && (
          <>
            <span className="text-[#3a4150]">·</span>
            <span>
              <span className="text-[#E8923A] font-semibold">{stats.monthFish}</span>{" "}
              <span className="lowercase">this month</span>
            </span>
          </>
        )}
        {stats.biggestFish > 0 && (
          <>
            <span className="text-[#3a4150]">·</span>
            <span>
              <span className="text-[#F0F6FC] font-semibold">{stats.biggestFish}&quot;</span>{" "}
              <span className="lowercase">pb</span>
            </span>
          </>
        )}
        {stats.speciesCount > 0 && (
          <>
            <span className="text-[#3a4150]">·</span>
            <span>
              <span className="text-[#F0F6FC] font-semibold">{stats.speciesCount}</span>{" "}
              <span className="lowercase">species</span>
            </span>
          </>
        )}
        {stats.weeklyStreak > 0 && (
          <>
            <span className="text-[#3a4150]">·</span>
            <span className="inline-flex items-baseline gap-1 text-orange-400">
              <Flame className="h-3 w-3 self-center" />
              <span className="font-semibold">{stats.weeklyStreak}</span>
              <span className="text-[10px] lowercase opacity-80">wk</span>
            </span>
          </>
        )}
      </Link>

      {/* Quick-launch tiles */}
      <div className="flex items-stretch gap-2 overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
        <ButtonTile href="/flies?tab=workbench" icon={Wrench} iconColor="#E8923A" label="Workbench" badge={tieNextCount} size="sm" />
        <ButtonTile href="/dashboard/insights" icon={Lightbulb} iconColor="#C4B5FD" label="Insights" size="sm" />
        <ButtonTile href="/flies" icon={Feather} iconColor="#7BD9C2" label="Fly Box" badge={flyCount} size="sm" />
        <ButtonTile href="/dashboard/hatch-reports" icon={Leaf} iconColor="#90EE90" label="Hatches" size="sm" />
        <ButtonTile href="/gear" icon={Package} iconColor="#A8B2BD" label="Gear" badge={gearCount} size="sm" />
        <ButtonTile href="/dashboard/analytics" icon={BarChart3} iconColor="#0BA5C7" label="Analytics" size="sm" />
        <ButtonTile href="/dashboard/export" icon={BookOpen} iconColor="#A8B2BD" label="Export" size="sm" />
        <ButtonTile href="/journal/import" icon={Upload} iconColor="#A8B2BD" label="Import" size="sm" />
        <ButtonTile href="/journal/trophy-wall" icon={Trophy} iconColor="#FFD479" label="Awards" badge={milestoneCount} size="sm" />
      </div>
    </div>
  );
}
