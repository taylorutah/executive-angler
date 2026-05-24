"use client";

import {
  Wrench, Lightbulb, Feather, Leaf, Package, BarChart3, BookOpen, Upload, Trophy, Flame,
} from "lucide-react";
import { ButtonTile, StatPill } from "@/components/ui/Button";

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

export default function CompactStatsRow({ stats, flyCount, gearCount, tieNextCount, milestoneCount }: Props) {
  return (
    <div className="rounded-xl bg-[#161B22] border border-[#21262D] px-4 py-4 flex flex-col gap-3">
      {/* Row 1 — stat pills */}
      <div className="flex flex-wrap items-center gap-2">
        <StatPill href="/journal" value={stats.totalFish} label="fish" />
        <StatPill href="/journal" value={stats.totalSessions} label="sessions" />
        {stats.monthFish > 0 && (
          <StatPill href="/journal" value={stats.monthFish} label="this month" accent="copper" />
        )}
        {stats.biggestFish > 0 && (
          <StatPill href="/journal/trophy-wall" value={`${stats.biggestFish}"`} label="PB" accent="white" />
        )}
        {stats.speciesCount > 0 && (
          <StatPill href="/journal/trophy-wall" value={stats.speciesCount} label="species" accent="white" />
        )}
        {stats.weeklyStreak > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161B22] border border-orange-500/40 font-mono text-[12px]">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-orange-400 font-bold">{stats.weeklyStreak}</span>
            <span className="text-[#A8B2BD] text-[11px] lowercase">wk streak</span>
          </div>
        )}
      </div>

      {/* Row 2 — quick-launch tiles */}
      <div className="flex items-stretch gap-2 overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
        <ButtonTile href="/dashboard/workbench" icon={Wrench} iconColor="#E8923A" label="Workbench" badge={tieNextCount} size="sm" />
        <ButtonTile href="/dashboard/insights" icon={Lightbulb} iconColor="#C4B5FD" label="Insights" size="sm" />
        <ButtonTile href="/flies" icon={Feather} iconColor="#7BD9C2" label="Fly Box" badge={flyCount} size="sm" />
        <ButtonTile href="/hatches" icon={Leaf} iconColor="#90EE90" label="Hatches" size="sm" />
        <ButtonTile href="/gear" icon={Package} iconColor="#A8B2BD" label="Gear" badge={gearCount} size="sm" />
        <ButtonTile href="/dashboard/analytics" icon={BarChart3} iconColor="#0BA5C7" label="Analytics" size="sm" />
        <ButtonTile href="/dashboard/export" icon={BookOpen} iconColor="#A8B2BD" label="Export" size="sm" />
        <ButtonTile href="/dashboard/import" icon={Upload} iconColor="#A8B2BD" label="Import" size="sm" />
        <ButtonTile href="/dashboard/milestones" icon={Trophy} iconColor="#FFD479" label="Awards" badge={milestoneCount} size="sm" />
      </div>
    </div>
  );
}
