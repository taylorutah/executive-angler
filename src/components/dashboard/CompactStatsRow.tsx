"use client";

import Link from "next/link";
import {
  Wrench, Lightbulb, Feather, Leaf, Package, BarChart3, BookOpen, Upload, Trophy, Flame,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

interface Tile {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  accent?: string;
}

export default function CompactStatsRow({ stats, flyCount, gearCount, tieNextCount, milestoneCount }: Props) {
  const tiles: Tile[] = [
    { href: "/dashboard/workbench", label: "Workbench", icon: Wrench, badge: tieNextCount, accent: "text-[#E8923A]" },
    { href: "/dashboard/insights", label: "Insights", icon: Lightbulb, accent: "text-[#C4B5FD]" },
    { href: "/flies", label: "Fly Box", icon: Feather, badge: flyCount, accent: "text-[#7BD9C2]" },
    { href: "/hatches", label: "Hatch Reports", icon: Leaf, accent: "text-[#90EE90]" },
    { href: "/gear", label: "Gear Locker", icon: Package, badge: gearCount, accent: "text-[#A8B2BD]" },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, accent: "text-[#0BA5C7]" },
    { href: "/dashboard/export", label: "Export", icon: BookOpen, accent: "text-[#A8B2BD]" },
    { href: "/dashboard/import", label: "Import", icon: Upload, accent: "text-[#A8B2BD]" },
    { href: "/dashboard/milestones", label: "Milestones", icon: Trophy, badge: milestoneCount, accent: "text-[#FFD479]" },
  ];

  return (
    <div className="rounded-xl bg-[#161B22] border border-[#21262D] px-4 py-3 flex flex-col md:flex-row md:items-center gap-3">
      {/* Micro-hero line */}
      <div className="font-mono text-sm text-[#A8B2BD] tabular-nums flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0 flex-1">
        <span><span className="text-[#F0F6FC] font-bold">{stats.totalFish}</span> fish</span>
        <span className="text-[#6E7681]">·</span>
        <span><span className="text-[#F0F6FC]">{stats.totalSessions}</span> sessions</span>
        {stats.monthFish > 0 && (
          <>
            <span className="text-[#6E7681]">·</span>
            <span className="text-[#E8923A]">{stats.monthFish} this month</span>
          </>
        )}
        {stats.biggestFish > 0 && (
          <>
            <span className="text-[#6E7681]">·</span>
            <span><span className="text-[#F0F6FC]">{stats.biggestFish}&quot;</span> PB</span>
          </>
        )}
        {stats.speciesCount > 0 && (
          <>
            <span className="text-[#6E7681]">·</span>
            <span><span className="text-[#F0F6FC]">{stats.speciesCount}</span> species</span>
          </>
        )}
        {stats.weeklyStreak > 0 && (
          <>
            <span className="text-[#6E7681]">·</span>
            <span className="inline-flex items-center gap-1 text-orange-400">
              <Flame className="h-3 w-3" />
              <span className="font-bold">{stats.weeklyStreak}</span>
              <span className="text-[10px] opacity-80">wk</span>
            </span>
          </>
        )}
      </div>

      {/* Icon row */}
      <div className="flex items-center gap-1 overflow-x-auto md:overflow-visible -mx-1 px-1 md:mx-0 md:px-0">
        {tiles.map(({ href, label, icon: Icon, badge, accent }) => (
          <Link
            key={href}
            href={href}
            title={label}
            aria-label={label}
            className="relative shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-lg border border-[#21262D] hover:border-[#E8923A]/60 hover:bg-[#21262D] transition group"
          >
            <Icon className={`h-4 w-4 ${accent ?? "text-[#A8B2BD]"} group-hover:text-[#F0F6FC]`} />
            {badge != null && badge > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#E8923A] text-[#0D1117] text-[10px] font-bold leading-4 text-center">
                {badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
