"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Fish, MapPin, TrendingUp, Heart, Users,
  ChevronRight, BookOpen, Compass, Star,
  Feather, Package, Trophy, Target, Flame,
  BarChart3, Leaf, Ruler, Calendar, Plus, Lightbulb
} from "lucide-react";
import type { RiverStats } from "@/types/awards";

interface DashboardProps {
  user: { id: string; email: string };
  profile: { username: string | null; display_name: string | null; avatar_url: string | null; home_location: string | null } | null;
  mySessions: Array<{ id: string; date: string; river_name: string | null; total_fish: number | null; notes: string | null; privacy: string }>;
  favRivers: Array<{ id: string; name: string; slug: string; hero_image_url: string; primary_species: string[] }>;
  favDests: Array<{ id: string; name: string; slug: string; hero_image_url: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  followingFeed: Array<{ id: string; date: string; river_name: string | null; total_fish: number | null; notes: string | null; privacy: string; user_id: string; profiles: any }>;
  suggestedAnglers: Array<{ user_id: string; username: string | null; display_name: string | null; avatar_url: string | null }>;
  exploreFeed: Array<{ id: string; date: string; river_name: string | null; total_fish: number | null; notes: string | null; user_id: string; profiles: any }>;
  riverIntel: Record<string, { lastDate: string | null; sessions30d: number; topFly: string | null }>;
  totalFavorites: number;
  flyCount: number;
  gearCount: number;
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

/* ─── Stats Card (matches iOS HomeStatsCard exactly) ─── */
function StatsCard({ es }: { es: DashboardProps["enhancedStats"] }) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#E8923A]/25 bg-[#161B22] shadow-lg shadow-[#E8923A]/5 ea-stats-card">

      {/* Hero row — Sessions · Total Fish · Biggest */}
      <div className="grid grid-cols-3 divide-x divide-[#21262D]">
        <HeroStat icon={<Calendar className="h-3.5 w-3.5 text-[#E8923A]/60" />} value={String(es.totalSessions)} label="SESSIONS" />
        <HeroStat icon={<Fish className="h-3.5 w-3.5 text-[#E8923A]/60" />} value={String(es.totalFish)} label="TOTAL FISH" />
        <div className="flex flex-col items-center justify-center py-4">
          <div className="flex items-baseline gap-1">
            <Ruler className="h-3.5 w-3.5 text-[#E8923A]/60 self-center" />
            <span className="font-mono text-3xl font-semibold text-[#F0F6FC] ml-1">
              {es.biggestFish > 0 ? es.biggestFish : "—"}
            </span>
            {es.biggestFish > 0 && (
              <span className="font-mono text-base text-[#A8B2BD]">in</span>
            )}
          </div>
          <span className="text-[9px] font-bold text-[#A8B2BD] tracking-[0.1em] mt-1">BIGGEST</span>
        </div>
      </div>

      <Divider />

      {/* Secondary row — Avg/Session · Species · Wk Streak */}
      <div className="grid grid-cols-3 divide-x divide-[#21262D]">
        <SecondaryStat icon={<BarChart3 className="h-3 w-3 text-[#E8923A]/50" />} value={String(es.avgFishPerSession)} label="AVG / SESSION" />
        <SecondaryStat icon={<Leaf className="h-3 w-3 text-[#E8923A]/50" />} value={String(es.speciesCount)} label="SPECIES" />
        <div className="flex flex-col items-center justify-center py-3">
          <div className="flex items-center gap-1">
            <Flame className={`h-3 w-3 ${es.weeklyStreak > 0 ? "text-orange-400" : "text-[#E8923A]/50"}`} />
            <span className="font-mono text-xl font-semibold text-[#F0F6FC]">{es.weeklyStreak}</span>
          </div>
          <span className="text-[8px] font-bold text-[#A8B2BD] tracking-[0.08em] mt-0.5">WK STREAK</span>
        </div>
      </div>

      <Divider />

      {/* Bottom bar — This Month + Home Water side by side on desktop, stacked on mobile */}
      <div className="lg:grid lg:grid-cols-2 lg:divide-x lg:divide-[#21262D]">
        {/* This Month */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <Flame className="h-3 w-3 text-[#E8923A]" />
            <span className="text-[10px] font-bold text-[#A8B2BD] tracking-[0.1em]">THIS MONTH</span>
          </div>
          <div className="flex items-center gap-4">
            <MonthPill value={es.monthSessions} label="sessions" />
            <MonthPill value={es.monthFish} label="fish" />
          </div>
        </div>

        <div className="block lg:hidden"><Divider /></div>

        {/* Home Water */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-[#E8923A]/60" />
            <span className="text-[10px] font-bold text-[#A8B2BD] tracking-[0.08em]">HOME WATER</span>
          </div>
          <span className="font-mono text-sm font-semibold text-[#F0F6FC] truncate max-w-[200px]">{es.favoriteRiver}</span>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="font-mono text-3xl font-semibold text-[#F0F6FC]">{value}</span>
      </div>
      <span className="text-[9px] font-bold text-[#A8B2BD] tracking-[0.1em] mt-1">{label}</span>
    </div>
  );
}

function SecondaryStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-3">
      <div className="flex items-center gap-1">
        {icon}
        <span className="font-mono text-xl font-semibold text-[#F0F6FC]">{value}</span>
      </div>
      <span className="text-[8px] font-bold text-[#A8B2BD] tracking-[0.08em] mt-0.5">{label}</span>
    </div>
  );
}

function MonthPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-sm font-semibold text-[#F0F6FC]">{value}</span>
      <span className="text-[10px] text-[#A8B2BD]">{label}</span>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[#21262D] mx-4" />;
}

/* ─── Main Component ─── */

export default function DashboardClient({
  user, profile, mySessions, favRivers, favDests, followingFeed, suggestedAnglers, exploreFeed, riverIntel, totalFavorites, flyCount, gearCount, riverStats, riverSlugMap, enhancedStats
}: DashboardProps) {
  const displayName = profile?.display_name || profile?.username || user.email.split("@")[0];
  const es = enhancedStats;

  return (
    <div className="min-h-screen bg-[#0D1117]">

      {/* ─── Dashboard Header ─── */}
      <div className="bg-[#161B22] border-b border-[#21262D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          {/* Welcome + actions — stacks on mobile */}
          <div className="mb-6">
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

          {/* Stats Card */}
          <StatsCard es={es} />
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Desktop: 2-column layout — Main | Sidebar */}
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">

          {/* ─── Left Column (main) ─── */}
          <div className="space-y-8">

            {/* Quick Actions Grid — matches iOS Dashboard */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/dashboard/analytics"
                className="group p-4 bg-[#161B22] rounded-xl border border-[#21262D] hover:border-[#E8923A] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <BarChart3 className="h-5 w-5 text-[#E8923A]" />
                  <span className="text-[8px] font-bold tracking-wider text-[#E8923A] bg-[#E8923A]/10 px-1.5 py-0.5 rounded">PRO</span>
                </div>
                <h3 className="text-sm font-bold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">Analytics</h3>
                <p className="text-[11px] text-[#A8B2BD] mt-0.5">Trends & stats</p>
              </Link>

              <Link
                href="/dashboard/export"
                className="group p-4 bg-[#161B22] rounded-xl border border-[#21262D] hover:border-[#0BA5C7] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <BookOpen className="h-5 w-5 text-[#0BA5C7]" />
                  <span className="text-[8px] font-bold tracking-wider text-[#E8923A] bg-[#E8923A]/10 px-1.5 py-0.5 rounded">PRO</span>
                </div>
                <h3 className="text-sm font-bold text-[#F0F6FC] group-hover:text-[#0BA5C7] transition-colors">Export</h3>
                <p className="text-[11px] text-[#A8B2BD] mt-0.5">CSV & PDF</p>
              </Link>

              <Link
                href="/journal/flies"
                className="group p-4 bg-[#161B22] rounded-xl border border-[#21262D] hover:border-[#2EA44F] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <Feather className="h-5 w-5 text-[#2EA44F]" />
                </div>
                <h3 className="text-sm font-bold text-[#F0F6FC] group-hover:text-[#2EA44F] transition-colors">Fly Box</h3>
                <p className="text-[11px] text-[#A8B2BD] mt-0.5">{flyCount > 0 ? `${flyCount} patterns` : "Your patterns"}</p>
              </Link>

              <Link
                href="/journal/stats"
                className="group p-4 bg-[#161B22] rounded-xl border border-[#21262D] hover:border-[#FFD700] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <Trophy className="h-5 w-5 text-[#FFD700]" />
                </div>
                <h3 className="text-sm font-bold text-[#F0F6FC] group-hover:text-[#FFD700] transition-colors">Achievements</h3>
                <p className="text-[11px] text-[#A8B2BD] mt-0.5">{riverStats.reduce((sum, rs) => sum + rs.awards.length, 0)} earned</p>
              </Link>
            </section>

            {/* Your Rivers */}
            {riverStats.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#E8923A]" />
                    <h2 className="font-serif text-xl text-[#F0F6FC]">Your Rivers</h2>
                  </div>
                  <Link href="/journal/stats" className="text-sm text-[#A8B2BD] hover:text-[#E8923A] transition-colors">
                    Full stats &rarr;
                  </Link>
                </div>
                <div className="space-y-3">
                  {riverStats.map((rs) => {
                    const riverSlug = rs.river_id ? riverSlugMap[rs.river_id] : favRivers.find((r) => r.name === rs.river_name)?.slug;
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
                            <div className="flex items-center gap-3 text-xs text-[#A8B2BD] mt-1">
                              <span>{rs.total_sessions} session{rs.total_sessions !== 1 ? "s" : ""}</span>
                              <span className="text-[#21262D]">|</span>
                              <span>{rs.total_fish} fish</span>
                              <span className="text-[#21262D]">|</span>
                              <span>Last: {timeAgo(rs.last_session)}</span>
                            </div>
                          </div>
                          {rs.awards.length > 0 && (
                            <div className="flex gap-1.5 shrink-0">
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
                        {session.privacy === "private" && (
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

            {/* Following Feed */}
            {followingFeed.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#E8923A]" />
                    <h2 className="font-serif text-lg text-[#F0F6FC]">Following</h2>
                  </div>
                  <Link href="/anglers" className="text-xs text-[#A8B2BD] hover:text-[#E8923A] transition-colors">
                    Find anglers &rarr;
                  </Link>
                </div>
                <div className="space-y-2">
                  {followingFeed.slice(0, 6).map((session) => {
                    const ap = session.profiles as { username: string | null; avatar_url: string | null } | null;
                    return (
                      <Link
                        key={session.id}
                        href={`/journal/${session.id}`}
                        className="flex items-start gap-3 p-3 bg-[#161B22] rounded-lg border border-[#21262D] hover:border-[#E8923A]/50 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#E8923A]/10 flex items-center justify-center shrink-0 text-xs font-bold text-[#E8923A]">
                          {String(ap?.username?.charAt(0) ?? "A").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-medium text-[#F0F6FC]">{ap?.username ?? "Angler"}</span>
                            <span className="text-[#6E7681]">&middot;</span>
                            <span className="text-[#E8923A] truncate">{session.river_name ?? "river"}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {session.total_fish != null && session.total_fish > 0 && (
                              <span className="text-[10px] text-[#00B4D8] font-mono">{session.total_fish} fish</span>
                            )}
                            <span className="text-[10px] text-[#6E7681]">{timeAgo(session.date)}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Explore Feed */}
            {exploreFeed.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-[#0BA5C7]" />
                    <h2 className="font-serif text-lg text-[#F0F6FC]">Explore</h2>
                  </div>
                  <Link href="/feed" className="text-xs text-[#A8B2BD] hover:text-[#0BA5C7] transition-colors">
                    See all &rarr;
                  </Link>
                </div>
                <div className="space-y-2">
                  {exploreFeed.slice(0, 6).map((session) => {
                    const ep = session.profiles as { username: string | null; avatar_url: string | null; display_name: string | null } | null;
                    return (
                      <Link
                        key={session.id}
                        href={`/journal/${session.id}`}
                        className="flex items-start gap-3 p-3 bg-[#161B22] rounded-lg border border-[#21262D] hover:border-[#0BA5C7]/40 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#0BA5C7]/10 flex items-center justify-center shrink-0 text-xs font-bold text-[#0BA5C7]">
                          {String(ep?.username?.charAt(0) ?? "A").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-medium text-[#F0F6FC]">@{ep?.username ?? "angler"}</span>
                            <span className="text-[#6E7681]">&middot;</span>
                            <span className="text-[#0BA5C7] truncate">{session.river_name ?? "river"}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {session.total_fish != null && session.total_fish > 0 && (
                              <span className="text-[10px] text-[#E8923A] font-mono">{session.total_fish} fish</span>
                            )}
                            <span className="text-[10px] text-[#6E7681]">{timeAgo(session.date)}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Suggested Anglers */}
            {suggestedAnglers.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#E8923A]" />
                    <h2 className="font-serif text-lg text-[#F0F6FC]">Suggested</h2>
                  </div>
                </div>
                <div className="space-y-2">
                  {suggestedAnglers.map((angler) => (
                    <Link
                      key={angler.user_id}
                      href={`/anglers/${angler.username}`}
                      className="flex items-center gap-3 p-3 bg-[#161B22] rounded-lg border border-[#21262D] hover:border-[#E8923A]/50 transition-colors"
                    >
                      {angler.avatar_url ? (
                        <Image src={angler.avatar_url} alt={angler.display_name || angler.username || "Angler"} width={32} height={32} className="rounded-full object-cover w-8 h-8" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#E8923A]/10 flex items-center justify-center text-xs font-bold text-[#E8923A]">
                          {String(angler.username?.charAt(0) ?? angler.display_name?.charAt(0) ?? "A").toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#F0F6FC] truncate">{angler.display_name || angler.username}</p>
                        {angler.username && <p className="text-[10px] text-[#A8B2BD]">@{angler.username}</p>}
                      </div>
                      <span className="text-[10px] font-medium border border-[#E8923A]/40 text-[#E8923A] px-2 py-0.5 rounded hover:bg-[#E8923A]/10 transition-colors shrink-0">
                        Follow
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Followed Rivers */}
            {favRivers.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-[#E8923A]" />
                    <h2 className="font-serif text-lg text-[#F0F6FC]">Followed Rivers</h2>
                  </div>
                  <Link href="/rivers" className="text-xs text-[#A8B2BD] hover:text-[#E8923A] transition-colors">
                    All &rarr;
                  </Link>
                </div>
                <div className="space-y-2">
                  {favRivers.map((river) => {
                    const intel = riverIntel[river.id];
                    return (
                      <Link key={river.id} href={`/rivers/${river.slug}`} className="group block">
                        <div className="relative h-24 rounded-lg overflow-hidden border border-[#21262D] group-hover:border-[#E8923A] transition-all">
                          <Image src={river.hero_image_url} alt={river.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="340px" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-3 right-3">
                            <p className="text-white text-xs font-bold">{river.name}</p>
                            {intel && intel.sessions30d > 0 && (
                              <p className="text-[10px] text-[#00B4D8] font-mono mt-0.5">{intel.sessions30d} trips (30d)</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
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
        {favRivers.length === 0 && favDests.length === 0 && followingFeed.length === 0 && (
          <section className="bg-[#161B22] rounded-xl border border-[#21262D] p-8 text-center mt-8">
            <Star className="h-10 w-10 text-[#E8923A] mx-auto mb-3" />
            <h3 className="font-serif text-lg text-[#F0F6FC] mb-2">Personalize Your Dashboard</h3>
            <p className="text-sm text-[#A8B2BD] mb-6 max-w-md mx-auto">
              Favorite rivers and destinations to see live Angler Intel here. Follow other anglers to see their sessions in your feed.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/rivers" className="px-4 py-2 bg-[#E8923A] text-white text-sm font-medium rounded-lg hover:bg-[#F0A65A] transition-colors">
                Explore Rivers
              </Link>
              <Link href="/anglers" className="px-4 py-2 border border-[#21262D] text-[#A8B2BD] text-sm font-medium rounded-lg hover:border-[#E8923A] hover:text-[#E8923A] transition-colors">
                Find Anglers
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
