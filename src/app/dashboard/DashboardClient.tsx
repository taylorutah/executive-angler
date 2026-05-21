"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Fish, MapPin, TrendingUp,
  ChevronRight, BookOpen, Compass, Star,
  Feather, Package, Trophy, Target, Flame,
  BarChart3, Leaf, Ruler, Calendar, Plus, Lightbulb, Sparkles, Wrench,
  Upload
} from "lucide-react";
import type { RiverStats } from "@/types/awards";
import HelpHint from "@/components/ui/HelpHint";
import MyFliesWidget, { type MyFliesItem } from "@/components/dashboard/MyFliesWidget";

const AWARDS_VISIBLE = process.env.NEXT_PUBLIC_FEATURE_AWARDS_VISIBLE === "true";

interface DashboardProps {
  user: { id: string; email: string };
  profile: { username: string | null; display_name: string | null; avatar_url: string | null; home_location: string | null } | null;
  mySessions: Array<{ id: string; date: string; river_name: string | null; total_fish: number | null; notes: string | null; broadcast_presence: boolean }>;
  favRivers: Array<{ id: string; name: string; slug: string; hero_image_url: string; primary_species: string[] }>;
  favDests: Array<{ id: string; name: string; slug: string; hero_image_url: string }>;
  tieNextItems: MyFliesItem[];
  favoriteItems: MyFliesItem[];
  totalFavorites: number;
  flyCount: number;
  gearCount: number;
  isPremium: boolean;
  riverStats: RiverStats[];
  riverSlugMap: Record<string, string>;
  enhancedStats: {
    totalSessions: number;
    totalFish: number;
    biggestFish: number;
    avgFishPerSession: number;
    speciesCount: number;
    favoriteRiver: string;
    monthSessions: number;
    monthFish: number;
    weeklyStreak: number;
  };
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr + "T12:00:00");
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function formatDate(d: string): string {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ─── Hero Stats — lead number + supporting strip + context bar ─── */
function StatsCard({ es }: { es: DashboardProps["enhancedStats"] }) {
  return (
    <div className="rounded-2xl p-px bg-gradient-to-br from-[#E8923A]/40 via-[#E8923A]/10 to-[#0BA5C7]/25 shadow-lg shadow-[#E8923A]/5">
      <div className="rounded-[15px] overflow-hidden bg-[#161B22]">
        {/* Lead — one big number that carries the story */}
        <div className="px-6 sm:px-8 pt-7 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-[#6E7681] tracking-[0.18em] uppercase mb-1">All-Time</p>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[64px] sm:text-[80px] leading-none font-bold text-[#F0F6FC] tabular-nums tracking-tight">
                  {es.totalFish}
                </span>
                <span className="font-mono text-xl text-[#A8B2BD] mb-1">fish</span>
              </div>
              <p className="text-sm text-[#A8B2BD] mt-2">
                across <span className="text-[#F0F6FC] font-medium">{es.totalSessions}</span> sessions
                {es.monthSessions > 0 && (
                  <>
                    {" · "}
                    <span className="text-[#E8923A] font-medium">
                      {es.monthFish} this month
                    </span>
                  </>
                )}
              </p>
            </div>
            {es.weeklyStreak > 0 && (
              <div className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-orange-400/10 border border-orange-400/30 px-2.5 py-1">
                <Flame className="h-3.5 w-3.5 text-orange-400" />
                <span className="font-mono text-sm font-bold text-orange-400">{es.weeklyStreak}</span>
                <span className="text-[10px] font-bold tracking-wider text-orange-300/80">WK STREAK</span>
              </div>
            )}
          </div>
        </div>

        {/* Supporting strip — 4 secondary numbers, not competing with the hero */}
        <div className="grid grid-cols-4 divide-x divide-[#21262D] border-t border-[#21262D]">
          <SupportStat icon={<Ruler className="h-3 w-3" />} value={es.biggestFish > 0 ? `${es.biggestFish}"` : "—"} label="Biggest" />
          <SupportStat icon={<BarChart3 className="h-3 w-3" />} value={String(es.avgFishPerSession)} label="Avg / session" />
          <SupportStat icon={<Leaf className="h-3 w-3" />} value={String(es.speciesCount)} label="Species" />
          <SupportStat icon={<Calendar className="h-3 w-3" />} value={String(es.monthSessions)} label="This month" />
        </div>

        {/* Context bar — home water */}
        {es.favoriteRiver && (
          <div className="flex items-center justify-between px-5 sm:px-8 py-3 border-t border-[#21262D] bg-[#0D1117]/40">
            <div className="flex items-center gap-2 text-[#A8B2BD]">
              <MapPin className="h-3.5 w-3.5 text-[#E8923A]/70" />
              <span className="text-[11px] font-bold tracking-[0.12em] uppercase">Home Water</span>
            </div>
            <span className="font-mono text-sm font-semibold text-[#F0F6FC] truncate max-w-[260px]">{es.favoriteRiver}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SupportStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-3 px-2 gap-0.5">
      <div className="flex items-baseline gap-1.5">
        <span className="text-[#E8923A]/50">{icon}</span>
        <span className="font-mono text-lg sm:text-xl font-semibold text-[#F0F6FC] tabular-nums">{value}</span>
      </div>
      <span className="text-[10px] text-[#6E7681] tracking-wide">{label}</span>
    </div>
  );
}

/* ─── Main Component ─── */

export default function DashboardClient({
  user, profile, mySessions, favRivers, favDests, tieNextItems, favoriteItems, totalFavorites, flyCount, gearCount, isPremium, riverStats, riverSlugMap, enhancedStats
}: DashboardProps) {
  const displayName = profile?.display_name || profile?.username || user.email.split("@")[0];
  const es = enhancedStats;
  const [showAllRivers, setShowAllRivers] = useState(false);

  return (
    <div className="min-h-screen bg-[#0D1117]">

      {/* ─── Dashboard Header ─── */}
      <div className="bg-[#161B22] border-b border-[#21262D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
          {/* Welcome + actions — stacks on mobile */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#F0F6FC]">
                  Welcome back, {displayName}
                </h1>
                {profile?.home_location && (
                  <p className="text-sm text-[#A8B2BD] flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" /> {profile.home_location}
                  </p>
                )}
              </div>
              {/* Desktop: buttons inline */}
              <div className="hidden sm:flex gap-2 shrink-0">
                <Link
                  href="/contribute"
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#161B22] border border-[#21262D] text-[#F0F6FC] text-sm font-medium rounded-lg hover:border-[#E8923A] hover:text-[#E8923A] transition-colors"
                >
                  <Plus className="h-4 w-4" /> Contribute
                </Link>
                <Link
                  href="/feedback"
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#161B22] border border-[#21262D] text-[#F0F6FC] text-sm font-medium rounded-lg hover:border-[#0BA5C7] hover:text-[#0BA5C7] transition-colors"
                >
                  <Lightbulb className="h-4 w-4" /> Ideas
                </Link>
                <Link
                  href="/journal"
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#E8923A] text-white text-sm font-medium rounded-lg hover:bg-[#F0A65A] transition-colors"
                >
                  <BookOpen className="h-4 w-4" /> My Journal
                </Link>
              </div>
            </div>
            {/* Mobile: full-width button row below name */}
            <div className="flex sm:hidden gap-2 mt-4">
              <Link
                href="/journal"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#E8923A] text-white text-sm font-semibold rounded-lg"
              >
                <BookOpen className="h-4 w-4" /> Journal
              </Link>
              <Link
                href="/contribute"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#161B22] border border-[#21262D] text-[#F0F6FC] text-sm font-medium rounded-lg"
              >
                <Plus className="h-4 w-4" /> Add
              </Link>
              <Link
                href="/feedback"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#161B22] border border-[#21262D] text-[#F0F6FC] text-sm font-medium rounded-lg"
              >
                <Lightbulb className="h-4 w-4" /> Ideas
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Desktop: 2-column layout — Main | Sidebar */}
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">

          {/* ─── Left Column (main) ─── */}
          <div className="space-y-8">

            {/* Stats Card — sized to match action grid width */}
            <StatsCard es={es} />

            {/* MOBILE-ONLY: My Flies (Tie Next + Favorites) — replaces old Recent Activity */}
            <div className="lg:hidden">
              <MyFliesWidget tieNext={tieNextItems} favorites={favoriteItems} />
            </div>

            {/* Upgrade Banner (free users only) */}
            {!isPremium && (
              <Link
                href="/pricing"
                className="group flex items-center gap-4 p-4 bg-gradient-to-r from-[#E8923A]/10 via-[#E8923A]/5 to-[#0BA5C7]/10 rounded-xl border border-[#E8923A]/20 hover:border-[#E8923A]/40 transition-all"
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#E8923A]/15 shrink-0">
                  <Sparkles className="h-5 w-5 text-[#E8923A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">See <em>your</em> patterns &mdash; Pro $2.99/mo</h3>
                  <p className="text-[11px] text-[#A8B2BD] truncate">Per-river scorecard, personal insights, Best Window — your data, never crowdsourced</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#6E7681] group-hover:text-[#E8923A] transition-colors shrink-0" />
              </Link>
            )}

            {/* Action Grid — uniform tiles, Workbench gets emphasis via orange border (not size) */}
            <section>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* Workbench — primary action, distinguished by orange border */}
                <Link
                  href="/flies?tab=workbench"
                  className="group p-4 bg-[#161B22] rounded-2xl border-2 border-[#E8923A]/40 hover:border-[#E8923A] transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#E8923A]/15">
                      <Wrench className="h-4 w-4 text-[#E8923A]" />
                    </div>
                    {tieNextItems.length > 0 && (
                      <span className="font-mono text-sm font-bold text-[#F0F6FC] tabular-nums">{tieNextItems.length}</span>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">Workbench</h3>
                    <p className="text-[11px] text-[#A8B2BD] mt-0.5">
                      {tieNextItems.length > 0
                        ? `${tieNextItems.length} on the queue`
                        : "Match inventory"}
                    </p>
                  </div>
                </Link>

                {/* Insights */}
                <Link
                  href="/dashboard/insights"
                  className="group p-4 bg-[#161B22] rounded-2xl border border-[#21262D] hover:border-[#A855F7] transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#A855F7]/15">
                      <Lightbulb className="h-4 w-4 text-[#A855F7]" />
                    </div>
                    {!isPremium && (
                      <span className="text-[8px] font-bold tracking-wider text-[#E8923A] bg-[#E8923A]/10 px-1.5 py-0.5 rounded">PRO</span>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-[#F0F6FC] group-hover:text-[#A855F7] transition-colors">Insights</h3>
                    <p className="text-[11px] text-[#A8B2BD] mt-0.5">Patterns in your data</p>
                  </div>
                </Link>

                {/* Fly Box */}
                <Link
                  href="/flies"
                  className="group p-4 bg-[#161B22] rounded-2xl border border-[#21262D] hover:border-[#2EA44F] transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#2EA44F]/15">
                      <Feather className="h-4 w-4 text-[#2EA44F]" />
                    </div>
                    {flyCount > 0 && (
                      <span className="font-mono text-sm font-bold text-[#F0F6FC] tabular-nums">{flyCount}</span>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-[#F0F6FC] group-hover:text-[#2EA44F] transition-colors">Fly Box</h3>
                    <p className="text-[11px] text-[#A8B2BD] mt-0.5">{flyCount > 0 ? "Saved patterns" : "Start your collection"}</p>
                  </div>
                </Link>

                {/* Hatch Reports */}
                <Link
                  href="/dashboard/hatch-reports"
                  className="group p-4 bg-[#161B22] rounded-2xl border border-[#21262D] hover:border-[#14B8A6] transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#14B8A6]/15">
                      <Leaf className="h-4 w-4 text-[#14B8A6]" />
                    </div>
                    {!isPremium && (
                      <span className="text-[8px] font-bold tracking-wider text-[#E8923A] bg-[#E8923A]/10 px-1.5 py-0.5 rounded">PRO</span>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-[#F0F6FC] group-hover:text-[#14B8A6] transition-colors">Hatch Reports</h3>
                    <p className="text-[11px] text-[#A8B2BD] mt-0.5">What&apos;s hatching</p>
                  </div>
                </Link>

                {/* Gear Locker */}
                <Link
                  href="/account/gear"
                  className="group p-4 bg-[#161B22] rounded-2xl border border-[#21262D] hover:border-[#A8B2BD] transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#A8B2BD]/15">
                      <Package className="h-4 w-4 text-[#A8B2BD]" />
                    </div>
                    {gearCount > 0 && (
                      <span className="font-mono text-sm font-bold text-[#F0F6FC] tabular-nums">{gearCount}</span>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-[#F0F6FC] group-hover:text-[#A8B2BD] transition-colors">Gear Locker</h3>
                    <p className="text-[11px] text-[#A8B2BD] mt-0.5">Rods, reels &amp; more</p>
                  </div>
                </Link>
              </div>

              {/* Row 3 — secondary utilities (smaller, muted) */}
              {/* Secondary utilities — smaller, denser row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                <Link
                  href="/dashboard/analytics"
                  className="group flex items-center gap-2 p-2.5 bg-[#0D1117] rounded-lg border border-[#21262D]/60 hover:border-[#E8923A]/60 transition-all"
                >
                  <BarChart3 className="h-4 w-4 text-[#E8923A] shrink-0" />
                  <span className="text-xs font-medium text-[#A8B2BD] group-hover:text-[#F0F6FC] transition-colors truncate">Analytics</span>
                  {!isPremium && (
                    <span className="ml-auto text-[8px] font-bold tracking-wider text-[#E8923A] bg-[#E8923A]/10 px-1.5 py-0.5 rounded shrink-0">PRO</span>
                  )}
                </Link>

                <Link
                  href="/dashboard/export"
                  className="group flex items-center gap-2 p-2.5 bg-[#0D1117] rounded-lg border border-[#21262D]/60 hover:border-[#0BA5C7]/60 transition-all"
                >
                  <BookOpen className="h-4 w-4 text-[#0BA5C7] shrink-0" />
                  <span className="text-xs font-medium text-[#A8B2BD] group-hover:text-[#F0F6FC] transition-colors truncate">Export</span>
                </Link>

                <Link
                  href="/journal/import"
                  className="group flex items-center gap-2 p-2.5 bg-[#0D1117] rounded-lg border border-[#21262D]/60 hover:border-[#2EA44F]/60 transition-all"
                >
                  <Upload className="h-4 w-4 text-[#2EA44F] shrink-0" />
                  <span className="text-xs font-medium text-[#A8B2BD] group-hover:text-[#F0F6FC] transition-colors truncate">Import</span>
                </Link>

                {AWARDS_VISIBLE && (
                <Link
                  href="/journal/stats"
                  className="group flex items-center gap-2 p-2.5 bg-[#0D1117] rounded-lg border border-[#21262D]/60 hover:border-[#FFD700]/60 transition-all"
                >
                  <Trophy className="h-4 w-4 text-[#FFD700] shrink-0" />
                  <span className="text-xs font-medium text-[#A8B2BD] group-hover:text-[#F0F6FC] transition-colors truncate">
                    Milestones
                  </span>
                  <span className="ml-auto text-[10px] text-[#6E7681] shrink-0">
                    {riverStats.reduce((sum, rs) => sum + rs.awards.length, 0)}
                  </span>
                </Link>
                )}
              </div>
            </section>

            {/* Your Rivers */}
            {riverStats.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-5 w-5 text-[#E8923A]" />
                    <h2 className="font-serif text-xl text-[#F0F6FC]">Your Rivers</h2>
                    <HelpHint label="About Your Rivers">
                      <p className="text-[#F0F6FC] font-semibold">One card per river you&apos;ve logged sessions on.</p>
                      <p>Shows your session count, total fish, and biggest catch on each — so you can see where you&apos;re actually putting in the reps.</p>
                      {AWARDS_VISIBLE && <p className="text-[#6E7681] text-xs">Milestone badges unlock as you log more sessions and hit personal bests.</p>}
                    </HelpHint>
                  </div>
                  <Link href="/journal/stats" className="text-sm text-[#A8B2BD] hover:text-[#E8923A] transition-colors">
                    Full stats &rarr;
                  </Link>
                </div>
                <div className="space-y-3">
                  {(showAllRivers ? riverStats : riverStats.slice(0, 3)).map((rs) => {
                    const riverSlug = rs.river_slug
                      ?? (rs.river_id ? riverSlugMap[rs.river_id] : undefined)
                      ?? favRivers.find((r) => r.name === rs.river_name)?.slug;
                    const riverHref = riverSlug ? `/rivers/${riverSlug}` : `/rivers`;
                    return (
                      <div
                        key={rs.river_name}
                        className="bg-[#161B22] rounded-xl border border-[#21262D] p-5 hover:border-[#E8923A]/40 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <Link href={riverHref} className="font-serif text-lg text-[#F0F6FC] hover:text-[#E8923A] transition-colors">
                              {rs.river_name}
                            </Link>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#A8B2BD] mt-1">
                              <span className="whitespace-nowrap">{rs.total_sessions} session{rs.total_sessions !== 1 ? "s" : ""}</span>
                              <span className="text-[#21262D]">·</span>
                              <span className="whitespace-nowrap">{rs.total_fish} fish</span>
                              <span className="text-[#21262D]">·</span>
                              <span className="whitespace-nowrap">Last {timeAgo(rs.last_session)}</span>
                            </div>
                          </div>
                          {AWARDS_VISIBLE && isPremium && rs.awards.length > 0 && (
                            <div className="hidden sm:flex gap-1.5 shrink-0">
                              {rs.awards.slice(0, 4).map((a) => {
                                const EMOJI_MAP: Record<string, string> = {
                                  first_timer: "🪝", sessions_10: "🪝",
                                  regular: "🎣", sessions_50: "🎣",
                                  veteran: "🥾", sessions_100: "🥾",
                                  legend: "👑", sessions_500: "👑",
                                  centurion: "💯", catches_100: "💯",
                                  master_angler: "🐋", catches_1000: "🐋",
                                  consistent_producer: "🔥", catches_500: "🔥",
                                  species_hunter: "🦎", species_5: "🦎",
                                  species_15: "🌊", species_30: "🏔️",
                                  rivers_5: "🗺️", rivers_15: "🧭", rivers_30: "🌍",
                                  streak_4: "⚡", streak_12: "💎",
                                };
                                const emoji = EMOJI_MAP[a.award_key] || a.metadata.badge_icon || "🏆";
                                return (
                                  <span key={a.award_key} className="w-8 h-8 rounded-full bg-[#0D1117] border-2 flex items-center justify-center" style={{ borderColor: a.metadata.badge_color || "#E8923A" }} title={`${a.metadata.display_name}: ${a.metadata.description}`}>
                                    <span className="text-sm leading-none">{emoji}</span>
                                  </span>
                                );
                              })}
                              {rs.awards.length > 4 && (
                                <span className="w-8 h-8 rounded-full bg-[#21262D] flex items-center justify-center text-[10px] text-[#A8B2BD]">
                                  +{rs.awards.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <StatTile icon={<TrendingUp className="h-3 w-3 text-[#E8923A]" />} label="Avg/Session" value={rs.avg_fish_per_session.toFixed(1)} />
                          <StatTile icon={<Trophy className="h-3 w-3 text-[#FFD700]" />} label="Best Session" value={String(rs.best_session_fish_count)} />
                          <div className="bg-[#0D1117] rounded-lg p-3 border border-[#21262D]">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Fish className="h-3 w-3 text-[#0BA5C7]" />
                              <span className="text-[10px] text-[#A8B2BD] uppercase tracking-wide">Species</span>
                            </div>
                            <p className="font-mono text-lg font-bold text-[#F0F6FC]">{rs.species_caught.length}</p>
                            {rs.species_caught.length > 0 && (
                              <p className="text-[10px] text-[#A8B2BD] mt-0.5 truncate">{rs.species_caught.slice(0, 3).join(", ")}</p>
                            )}
                          </div>
                          <div className="bg-[#0D1117] rounded-lg p-3 border border-[#21262D]">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Target className="h-3 w-3 text-[#0BA5C7]" />
                              <span className="text-[10px] text-[#A8B2BD] uppercase tracking-wide">{rs.biggest_fish ? "Biggest" : "Top Fly"}</span>
                            </div>
                            {rs.biggest_fish ? (
                              <p className="font-mono text-lg font-bold text-[#F0F6FC]">
                                {rs.biggest_fish}<span className="text-sm text-[#A8B2BD] ml-0.5">in</span>
                              </p>
                            ) : rs.favorite_fly ? (
                              <p className="text-sm font-semibold text-[#F0F6FC] truncate">{rs.favorite_fly}</p>
                            ) : (
                              <p className="text-sm text-[#6E7681]">&mdash;</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#21262D]">
                          {rs.favorite_fly && rs.biggest_fish ? (
                            <span className="text-xs text-[#A8B2BD]"><span className="text-[#6E7681]">Top fly:</span> {rs.favorite_fly}</span>
                          ) : <span />}
                          <Link href={riverHref} className="text-xs text-[#E8923A] hover:underline flex items-center gap-1">
                            View river <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                  {riverStats.length > 3 && (
                    <button
                      onClick={() => setShowAllRivers(!showAllRivers)}
                      className="w-full py-2.5 text-sm text-[#A8B2BD] hover:text-[#E8923A] bg-[#161B22] rounded-xl border border-[#21262D] hover:border-[#E8923A]/40 transition-colors"
                    >
                      {showAllRivers ? "Show fewer" : `Show all ${riverStats.length} rivers`}
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* My Recent Sessions */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#E8923A]" />
                  <h2 className="font-serif text-xl text-[#F0F6FC]">Recent Sessions</h2>
                </div>
                <Link href="/journal" className="text-sm text-[#A8B2BD] hover:text-[#E8923A] transition-colors">
                  Full journal &rarr;
                </Link>
              </div>
              {mySessions.length === 0 ? (
                <div className="bg-[#161B22] rounded-xl border border-[#21262D] border-dashed p-10 text-center">
                  <Fish className="h-10 w-10 text-[#6E7681] mx-auto mb-3" />
                  <p className="text-[#A8B2BD] mb-3">No sessions logged yet.</p>
                  <p className="text-sm text-[#6E7681] mb-4">Download the app to start logging sessions.</p>
                  <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8923A] text-white text-sm font-medium rounded-lg hover:bg-[#F0A65A] transition-colors">
                    Get the App
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {mySessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/journal/${session.id}`}
                      className="flex items-center gap-4 p-4 bg-[#161B22] rounded-xl border border-[#21262D] hover:border-[#E8923A] transition-colors group"
                    >
                      <div className="text-center shrink-0 w-12">
                        <p className="font-mono text-lg font-bold text-[#E8923A]">{session.total_fish ?? 0}</p>
                        <p className="text-[9px] text-[#6E7681] uppercase">fish</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#F0F6FC] truncate">{session.river_name ?? "Unknown River"}</p>
                        <p className="text-xs text-[#A8B2BD]">{formatDate(session.date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Lock pill when this session isn't broadcast to the
                            feed. Default state (broadcast_presence=false) is
                            "private" per the 2026-05-04 privacy overhaul. */}
                        {session.broadcast_presence !== true && (
                          <span className="text-[10px] bg-[#21262D] text-[#6E7681] px-1.5 py-0.5 rounded">Private</span>
                        )}
                        <ChevronRight className="h-4 w-4 text-[#6E7681] group-hover:text-[#E8923A] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ─── Right Column (sidebar) ─── */}
          <div className="space-y-8 mt-8 lg:mt-0">

            {/* DESKTOP-ONLY: My Flies (mobile version is in left column above) */}
            <div className="hidden lg:block">
              <MyFliesWidget tieNext={tieNextItems} favorites={favoriteItems} />
            </div>

            {/* Followed Rivers */}
            {favRivers.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-[#E8923A]" />
                    <h2 className="font-serif text-lg text-[#F0F6FC]">Favorite Rivers</h2>
                  </div>
                  <Link href="/rivers" className="text-xs text-[#A8B2BD] hover:text-[#E8923A] transition-colors">
                    All &rarr;
                  </Link>
                </div>
                <div className="space-y-2">
                  {favRivers.map((river) => (
                    <Link key={river.id} href={`/rivers/${river.slug}`} className="group block">
                      <div className="relative h-24 rounded-lg overflow-hidden border border-[#21262D] group-hover:border-[#E8923A] transition-all">
                        <Image src={river.hero_image_url} alt={river.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="340px" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-3 right-3">
                          <p className="text-white text-xs font-bold">{river.name}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Followed Destinations */}
            {favDests.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-[#E8923A]" />
                    <h2 className="font-serif text-lg text-[#F0F6FC]">Destinations</h2>
                  </div>
                  <Link href="/destinations" className="text-xs text-[#A8B2BD] hover:text-[#E8923A] transition-colors">
                    All &rarr;
                  </Link>
                </div>
                <div className="space-y-2">
                  {favDests.map((dest) => (
                    <Link key={dest.id} href={`/destinations/${dest.slug}`} className="group block">
                      <div className="relative h-20 rounded-lg overflow-hidden border border-[#21262D] group-hover:border-[#E8923A] transition-all">
                        <Image src={dest.hero_image_url} alt={dest.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="340px" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <p className="absolute bottom-2 left-3 right-3 text-white text-xs font-bold">{dest.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Empty state CTA */}
        {favRivers.length === 0 && favDests.length === 0 && (
          <section className="bg-[#161B22] rounded-xl border border-[#21262D] p-8 text-center mt-8">
            <Star className="h-10 w-10 text-[#E8923A] mx-auto mb-3" />
            <h3 className="font-serif text-lg text-[#F0F6FC] mb-2">Personalize Your Dashboard</h3>
            <p className="text-sm text-[#A8B2BD] mb-6 max-w-md mx-auto">
              Favorite rivers and destinations so they show up here for quick access.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/rivers" className="px-4 py-2 bg-[#E8923A] text-white text-sm font-medium rounded-lg hover:bg-[#F0A65A] transition-colors">
                Explore Rivers
              </Link>
              <Link href="/destinations" className="px-4 py-2 border border-[#21262D] text-[#A8B2BD] text-sm font-medium rounded-lg hover:border-[#E8923A] hover:text-[#E8923A] transition-colors">
                Browse Destinations
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ─── Reusable stat tile for river cards ─── */
function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[#0D1117] rounded-lg p-3 border border-[#21262D]">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-[#A8B2BD] uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-mono text-lg font-bold text-[#F0F6FC]">{value}</p>
    </div>
  );
}
