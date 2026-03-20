"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Fish, MapPin, TrendingUp, Heart, Users,
  ChevronRight, BookOpen, Compass, Star,
  Feather, Package, Trophy, Target, Flame,
  BarChart3, Leaf, Ruler, Calendar
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
    <div className="rounded-xl overflow-hidden border border-[#E8923A]/25 bg-[#161B22] shadow-lg shadow-[#E8923A]/5"
      style={{ background: "linear-gradient(135deg, rgba(232,146,58,0.04) 0%, #161B22 40%, #0D1117 100%)" }}>

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
              <span className="font-mono text-base text-[#8B949E]">in</span>
            )}
          </div>
          <span className="text-[9px] font-bold text-[#8B949E] tracking-[0.1em] mt-1">BIGGEST</span>
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
          <span className="text-[8px] font-bold text-[#8B949E] tracking-[0.08em] mt-0.5">WK STREAK</span>
        </div>
      </div>

      <Divider />

      {/* Bottom bar — This Month + Home Water side by side on desktop, stacked on mobile */}
      <div className="lg:grid lg:grid-cols-2 lg:divide-x lg:divide-[#21262D]">
        {/* This Month */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <Flame className="h-3 w-3 text-[#E8923A]" />
            <span className="text-[10px] font-bold text-[#8B949E] tracking-[0.1em]">THIS MONTH</span>
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
            <span className="text-[10px] font-bold text-[#8B949E] tracking-[0.08em]">HOME WATER</span>
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
      <span className="text-[9px] font-bold text-[#8B949E] tracking-[0.1em] mt-1">{label}</span>
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
      <span className="text-[8px] font-bold text-[#8B949E] tracking-[0.08em] mt-0.5">{label}</span>
    </div>
  );
}

function MonthPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-sm font-semibold text-[#F0F6FC]">{value}</span>
      <span className="text-[10px] text-[#8B949E]">{label}</span>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[#21262D] mx-4" />;
}

/* ─── Main Component ─── */

export default function DashboardClient({
  user, profile, mySessions, favRivers, favDests, followingFeed, suggestedAnglers, exploreFeed, riverIntel, totalFavorites, flyCount, gearCount, riverStats, enhancedStats
}: DashboardProps) {
  const displayName = profile?.display_name || profile?.username || user.email.split("@")[0];
  const es = enhancedStats;

  return (
    <div className="min-h-screen bg-[#0D1117]">

      {/* ─── Dashboard Header ─── */}
      <div className="bg-[#161B22] border-b border-[#21262D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          {/* Welcome + action */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#F0F6FC]">
                Welcome back, {displayName}
              </h1>
              {profile?.home_location && (
                <p className="text-sm text-[#8B949E] flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5" /> {profile.home_location}
                </p>
              )}
            </div>
            <Link
              href="/journal"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#E8923A] text-white text-sm font-medium rounded-lg hover:bg-[#F0A65A] transition-colors shrink-0"
            >
              <BookOpen className="h-4 w-4" /> My Journal
            </Link>
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

            {/* Quick Links: Fly Box + Gear Box */}
            <section className="grid grid-cols-2 gap-4">
              <Link
                href="/journal/flies"
                className="group relative flex items-center gap-4 p-5 bg-[#161B22] rounded-xl border border-[#21262D] hover:border-[#E8923A] transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#E8923A]/5 to-transparent rounded-bl-full" />
                <div className="w-12 h-12 rounded-xl bg-[#E8923A]/10 flex items-center justify-center shrink-0">
                  <Feather className="h-6 w-6 text-[#E8923A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">My Fly Box</h3>
                  <p className="text-sm text-[#8B949E]">{flyCount > 0 ? `${flyCount} pattern${flyCount !== 1 ? "s" : ""}` : "Add your first"}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#484F58] group-hover:text-[#E8923A] transition-colors shrink-0" />
              </Link>

              <Link
                href="/account/gear"
                className="group relative flex items-center gap-4 p-5 bg-[#161B22] rounded-xl border border-[#21262D] hover:border-[#0BA5C7] transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#0BA5C7]/5 to-transparent rounded-bl-full" />
                <div className="w-12 h-12 rounded-xl bg-[#0BA5C7]/10 flex items-center justify-center shrink-0">
                  <Package className="h-6 w-6 text-[#0BA5C7]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-[#F0F6FC] group-hover:text-[#0BA5C7] transition-colors">Gear Box</h3>
                  <p className="text-sm text-[#8B949E]">{gearCount > 0 ? `${gearCount} item${gearCount !== 1 ? "s" : ""}` : "Add your gear"}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#484F58] group-hover:text-[#0BA5C7] transition-colors shrink-0" />
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
                  <Link href="/journal/stats" className="text-sm text-[#8B949E] hover:text-[#E8923A] transition-colors">
                    Full stats &rarr;
                  </Link>
                </div>
                <div className="space-y-3">
                  {riverStats.map((rs) => {
                    const riverSlug = favRivers.find((r) => r.name === rs.river_name)?.slug;
                    const riverHref = riverSlug ? `/rivers/${riverSlug}` : `/journal/stats`;
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
                            <div className="flex items-center gap-3 text-xs text-[#8B949E] mt-1">
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
                                const badgeSrc: Record<string, string> = {
                                  first_timer: "/badges/sessions_10.svg",
                                  regular: "/badges/sessions_50.svg",
                                  veteran: "/badges/sessions_100.svg",
                                  legend: "/badges/sessions_500.svg",
                                  centurion: "/badges/catches_100.svg",
                                  master_angler: "/badges/catches_1000.svg",
                                  consistent_producer: "/badges/catches_500.svg",
                                  species_hunter: "/badges/species_5.svg",
                                };
                                const src = badgeSrc[a.award_key];
                                return (
                                  <span key={a.award_key} className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center" title={`${a.metadata.display_name}: ${a.metadata.description}`}>
                                    {src ? (
                                      <Image src={src} alt={a.metadata.display_name || a.award_key} width={32} height={32} className="w-full h-full" />
                                    ) : (
                                      <span className="text-sm" style={{ backgroundColor: `${a.metadata.badge_color}20` }}>{a.metadata.badge_icon}</span>
                                    )}
                                  </span>
                                );
                              })}
                              {rs.awards.length > 4 && (
                                <span className="w-8 h-8 rounded-full bg-[#21262D] flex items-center justify-center text-[10px] text-[#8B949E]">
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
                              <span className="text-[10px] text-[#484F58] uppercase tracking-wide">Species</span>
                            </div>
                            <p className="font-mono text-lg font-bold text-[#F0F6FC]">{rs.species_caught.length}</p>
                            {rs.species_caught.length > 0 && (
                              <p className="text-[10px] text-[#8B949E] mt-0.5 truncate">{rs.species_caught.slice(0, 3).join(", ")}</p>
                            )}
                          </div>
                          <div className="bg-[#0D1117] rounded-lg p-3 border border-[#21262D]">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Target className="h-3 w-3 text-[#0BA5C7]" />
                              <span className="text-[10px] text-[#484F58] uppercase tracking-wide">{rs.biggest_fish ? "Biggest" : "Top Fly"}</span>
                            </div>
                            {rs.biggest_fish ? (
                              <p className="font-mono text-lg font-bold text-[#F0F6FC]">
                                {rs.biggest_fish}<span className="text-sm text-[#8B949E] ml-0.5">in</span>
                              </p>
                            ) : rs.favorite_fly ? (
                              <p className="text-sm font-semibold text-[#F0F6FC] truncate">{rs.favorite_fly}</p>
                            ) : (
                              <p className="text-sm text-[#484F58]">&mdash;</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#21262D]">
                          {rs.favorite_fly && rs.biggest_fish ? (
                            <span className="text-xs text-[#8B949E]"><span className="text-[#484F58]">Top fly:</span> {rs.favorite_fly}</span>
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
                <Link href="/journal" className="text-sm text-[#8B949E] hover:text-[#E8923A] transition-colors">
                  Full journal &rarr;
                </Link>
              </div>
              {mySessions.length === 0 ? (
                <div className="bg-[#161B22] rounded-xl border border-[#21262D] border-dashed p-10 text-center">
                  <Fish className="h-10 w-10 text-[#484F58] mx-auto mb-3" />
                  <p className="text-[#8B949E] mb-3">No sessions logged yet.</p>
                  <p className="text-sm text-[#484F58] mb-4">Download the app to start logging sessions.</p>
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
                        <p className="text-[9px] text-[#484F58] uppercase">fish</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#F0F6FC] truncate">{session.river_name ?? "Unknown River"}</p>
                        <p className="text-xs text-[#8B949E]">{formatDate(session.date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.privacy === "private" && (
                          <span className="text-[10px] bg-[#21262D] text-[#484F58] px-1.5 py-0.5 rounded">Private</span>
                        )}
                        <ChevronRight className="h-4 w-4 text-[#484F58] group-hover:text-[#E8923A] transition-colors" />
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
                  <Link href="/anglers" className="text-xs text-[#8B949E] hover:text-[#E8923A] transition-colors">
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
                            <span className="text-[#484F58]">&middot;</span>
                            <span className="text-[#E8923A] truncate">{session.river_name ?? "river"}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {session.total_fish != null && session.total_fish > 0 && (
                              <span className="text-[10px] text-[#00B4D8] font-mono">{session.total_fish} fish</span>
                            )}
                            <span className="text-[10px] text-[#484F58]">{timeAgo(session.date)}</span>
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
                  <Link href="/feed" className="text-xs text-[#8B949E] hover:text-[#0BA5C7] transition-colors">
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
                            <span className="text-[#484F58]">&middot;</span>
                            <span className="text-[#0BA5C7] truncate">{session.river_name ?? "river"}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {session.total_fish != null && session.total_fish > 0 && (
                              <span className="text-[10px] text-[#E8923A] font-mono">{session.total_fish} fish</span>
                            )}
                            <span className="text-[10px] text-[#484F58]">{timeAgo(session.date)}</span>
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
                        {angler.username && <p className="text-[10px] text-[#8B949E]">@{angler.username}</p>}
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
                  <Link href="/rivers" className="text-xs text-[#8B949E] hover:text-[#E8923A] transition-colors">
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
                  <Link href="/destinations" className="text-xs text-[#8B949E] hover:text-[#E8923A] transition-colors">
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
            <p className="text-sm text-[#8B949E] mb-6 max-w-md mx-auto">
              Favorite rivers and destinations to see live Angler Intel here. Follow other anglers to see their sessions in your feed.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/rivers" className="px-4 py-2 bg-[#E8923A] text-white text-sm font-medium rounded-lg hover:bg-[#F0A65A] transition-colors">
                Explore Rivers
              </Link>
              <Link href="/anglers" className="px-4 py-2 border border-[#21262D] text-[#8B949E] text-sm font-medium rounded-lg hover:border-[#E8923A] hover:text-[#E8923A] transition-colors">
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
        <span className="text-[10px] text-[#484F58] uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-mono text-lg font-bold text-[#F0F6FC]">{value}</p>
    </div>
  );
}
