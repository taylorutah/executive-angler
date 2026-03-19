"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Fish, MapPin, TrendingUp, Heart, Users,
  ChevronRight, BookOpen, Compass, Star, Activity,
  Feather, Package, Trophy, Target, Award
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

export default function DashboardClient({
  user, profile, mySessions, favRivers, favDests, followingFeed, suggestedAnglers, exploreFeed, riverIntel, totalFavorites, flyCount, gearCount, riverStats
}: DashboardProps) {
  const displayName = profile?.display_name || profile?.username || user.email.split("@")[0];
  const totalFish = mySessions.reduce((a, s) => a + (s.total_fish ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {/* Header */}
      <div className="bg-[#161B22] border-b border-[#21262D]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-[#F0F6FC]">
                Welcome back, {displayName}
              </h1>
              {profile?.home_location && (
                <p className="text-sm text-[#8B949E] flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5" /> {profile.home_location}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/journal"
                className="flex items-center gap-2 px-4 py-2 bg-[#E8923A] text-white text-sm font-medium rounded-lg hover:bg-[#F0A65A] transition-colors"
              >
                <BookOpen className="h-4 w-4" /> My Journal
              </Link>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-[#0D1117] rounded-xl p-3 border border-[#21262D]">
              <p className="text-[10px] text-[#484F58] uppercase tracking-widest">Sessions</p>
              <p className="font-mono text-2xl font-bold text-[#E8923A] mt-0.5">{mySessions.length}</p>
            </div>
            <div className="bg-[#0D1117] rounded-xl p-3 border border-[#21262D]">
              <p className="text-[10px] text-[#484F58] uppercase tracking-widest">Fish Caught</p>
              <p className="font-mono text-2xl font-bold text-[#E8923A] mt-0.5">{totalFish}</p>
            </div>
            <div className="bg-[#0D1117] rounded-xl p-3 border border-[#21262D]">
              <p className="text-[10px] text-[#484F58] uppercase tracking-widest">Favorites</p>
              <p className="font-mono text-2xl font-bold text-[#E8923A] mt-0.5">{totalFavorites}</p>
            </div>
            <div className="bg-[#0D1117] rounded-xl p-3 border border-[#21262D] hidden sm:block">
              <p className="text-[10px] text-[#484F58] uppercase tracking-widest">Last Session</p>
              <p className="font-mono text-lg font-bold text-[#E8923A] mt-0.5 leading-tight">
                {mySessions[0] ? timeAgo(mySessions[0].date) : "\u2014"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">

        {/* Fly Box & Gear Box */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fly Box */}
            <Link
              href="/journal/flies"
              className="group relative flex items-center gap-5 p-6 bg-[#161B22] rounded-xl border border-[#21262D] hover:border-[#E8923A] transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E8923A]/5 to-transparent rounded-bl-full" />
              <div className="w-14 h-14 rounded-2xl bg-[#E8923A]/10 flex items-center justify-center shrink-0">
                <Feather className="h-7 w-7 text-[#E8923A]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-lg font-bold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">My Fly Box</h3>
                <p className="text-sm text-[#8B949E] mt-0.5">
                  {flyCount > 0 ? `${flyCount} pattern${flyCount !== 1 ? "s" : ""}` : "Add your first pattern"}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-[#484F58] group-hover:text-[#E8923A] transition-colors shrink-0" />
            </Link>

            {/* Gear Box */}
            <Link
              href="/account/gear"
              className="group relative flex items-center gap-5 p-6 bg-[#161B22] rounded-xl border border-[#21262D] hover:border-[#E8923A] transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#0BA5C7]/5 to-transparent rounded-bl-full" />
              <div className="w-14 h-14 rounded-2xl bg-[#0BA5C7]/10 flex items-center justify-center shrink-0">
                <Package className="h-7 w-7 text-[#0BA5C7]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-lg font-bold text-[#F0F6FC] group-hover:text-[#0BA5C7] transition-colors">Gear Box</h3>
                <p className="text-sm text-[#8B949E] mt-0.5">
                  {gearCount > 0 ? `${gearCount} item${gearCount !== 1 ? "s" : ""}` : "Add your gear"}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-[#484F58] group-hover:text-[#0BA5C7] transition-colors shrink-0" />
            </Link>
          </div>
        </section>

        {/* Your Rivers — with full stats */}
        {riverStats.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#E8923A]" />
                <h2 className="font-heading text-xl font-bold text-[#F0F6FC]">Your Rivers</h2>
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
                    {/* River header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Link href={riverHref} className="font-heading text-lg font-bold text-[#F0F6FC] hover:text-[#E8923A] transition-colors">
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
                      {/* Award badges */}
                      {rs.awards.length > 0 && (
                        <div className="flex gap-1.5 shrink-0">
                          {rs.awards.slice(0, 4).map((a) => (
                            <span
                              key={a.award_key}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                              style={{ backgroundColor: `${a.metadata.badge_color}20` }}
                              title={`${a.metadata.display_name}: ${a.metadata.description}`}
                            >
                              {a.metadata.badge_icon}
                            </span>
                          ))}
                          {rs.awards.length > 4 && (
                            <span className="w-8 h-8 rounded-full bg-[#21262D] flex items-center justify-center text-[10px] text-[#8B949E]">
                              +{rs.awards.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-[#0D1117] rounded-lg p-3 border border-[#21262D]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="h-3 w-3 text-[#E8923A]" />
                          <span className="text-[10px] text-[#484F58] uppercase tracking-wide">Avg/Session</span>
                        </div>
                        <p className="font-mono text-lg font-bold text-[#F0F6FC]">{rs.avg_fish_per_session.toFixed(1)}</p>
                      </div>
                      <div className="bg-[#0D1117] rounded-lg p-3 border border-[#21262D]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Trophy className="h-3 w-3 text-[#FFD700]" />
                          <span className="text-[10px] text-[#484F58] uppercase tracking-wide">Best Session</span>
                        </div>
                        <p className="font-mono text-lg font-bold text-[#F0F6FC]">{rs.best_session_fish_count}</p>
                      </div>
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
                          <p className="font-mono text-lg font-bold text-[#F0F6FC]">{rs.biggest_fish}&quot;</p>
                        ) : rs.favorite_fly ? (
                          <p className="text-sm font-semibold text-[#F0F6FC] truncate">{rs.favorite_fly}</p>
                        ) : (
                          <p className="text-sm text-[#484F58]">&mdash;</p>
                        )}
                      </div>
                    </div>

                    {/* Favorite fly + link row */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#21262D]">
                      {rs.favorite_fly && rs.biggest_fish ? (
                        <span className="text-xs text-[#8B949E]">
                          <span className="text-[#484F58]">Top fly:</span> {rs.favorite_fly}
                        </span>
                      ) : (
                        <span />
                      )}
                      <Link
                        href={riverHref}
                        className="text-xs text-[#E8923A] hover:underline flex items-center gap-1"
                      >
                        View river <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Following Feed */}
        {followingFeed.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#E8923A]" />
                <h2 className="font-heading text-xl font-bold text-[#F0F6FC]">Following Feed</h2>
              </div>
              <Link href="/anglers" className="text-sm text-[#8B949E] hover:text-[#E8923A] transition-colors">
                Find anglers &rarr;
              </Link>
            </div>
            <div className="space-y-3">
              {followingFeed.map((session) => {
                const ap = session.profiles as { username: string | null; avatar_url: string | null } | null;
                return (
                  <Link
                    key={session.id}
                    href={`/journal/${session.id}`}
                    className="flex items-start gap-4 p-4 bg-[#161B22] rounded-xl border border-[#21262D] hover:border-[#E8923A] transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#E8923A]/10 flex items-center justify-center shrink-0 text-sm font-bold text-[#E8923A]">
                      {String(ap?.username?.charAt(0) ?? "A").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#F0F6FC]">{ap?.username ?? "Angler"}</span>
                        <span className="text-xs text-[#484F58]">fished</span>
                        <span className="text-sm font-medium text-[#E8923A]">{session.river_name ?? "a river"}</span>
                        <span className="text-xs text-[#484F58] ml-auto">{timeAgo(session.date)}</span>
                      </div>
                      {session.total_fish != null && session.total_fish > 0 && (
                        <p className="text-xs text-[#00B4D8] font-mono mt-1">{session.total_fish} fish</p>
                      )}
                      {session.notes && (
                        <p className="text-xs text-[#8B949E] mt-1 line-clamp-2">{session.notes}</p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#484F58] group-hover:text-[#E8923A] transition-colors shrink-0 mt-1" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Suggested Anglers */}
        {suggestedAnglers.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#E8923A]" />
                <h2 className="font-heading text-xl font-bold text-[#F0F6FC]">Suggested Anglers</h2>
              </div>
              <Link href="/anglers" className="text-sm text-[#8B949E] hover:text-[#E8923A] transition-colors">
                Find anglers &rarr;
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {suggestedAnglers.map((angler) => (
                <Link
                  key={angler.user_id}
                  href={`/anglers/${angler.username}`}
                  className="group block shrink-0 min-w-[160px] bg-[#161B22] border border-[#21262D] rounded-xl p-4 hover:border-[#E8923A] transition-colors"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    {angler.avatar_url ? (
                      <Image
                        src={angler.avatar_url}
                        alt={angler.display_name || angler.username || "Angler"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#E8923A]/10 flex items-center justify-center text-sm font-bold text-[#E8923A]">
                        {String(angler.username?.charAt(0) ?? angler.display_name?.charAt(0) ?? "A").toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 w-full">
                      <p className="text-sm font-medium text-[#F0F6FC] truncate">
                        {angler.display_name || angler.username}
                      </p>
                      {angler.username && (
                        <p className="text-xs text-[#8B949E] truncate">@{angler.username}</p>
                      )}
                    </div>
                    <span className="mt-1 px-3 py-1 text-xs font-medium border border-[#E8923A] text-[#E8923A] rounded-lg hover:bg-[#E8923A]/10 transition-colors">
                      Follow
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Community Explore Feed */}
        {exploreFeed.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-[#0BA5C7]" />
                <h2 className="font-heading text-xl font-bold text-[#F0F6FC]">Explore</h2>
              </div>
              <Link href="/feed" className="text-sm text-[#8B949E] hover:text-[#0BA5C7] transition-colors">
                See all &rarr;
              </Link>
            </div>
            <div className="space-y-3">
              {exploreFeed.map((session) => {
                const ep = session.profiles as { username: string | null; avatar_url: string | null; display_name: string | null } | null;
                return (
                  <Link
                    key={session.id}
                    href={`/journal/${session.id}`}
                    className="flex items-start gap-4 p-4 bg-[#161B22] rounded-xl border border-[#21262D] hover:border-[#0BA5C7] transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0BA5C7]/10 flex items-center justify-center shrink-0 text-sm font-bold text-[#0BA5C7]">
                      {String(ep?.username?.charAt(0) ?? "A").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#F0F6FC]">@{ep?.username ?? "angler"}</span>
                        <span className="text-xs text-[#484F58]">fished</span>
                        <span className="text-sm font-medium text-[#0BA5C7]">{session.river_name ?? "a river"}</span>
                        <span className="text-xs text-[#484F58] ml-auto">{timeAgo(session.date)}</span>
                      </div>
                      {session.total_fish != null && session.total_fish > 0 && (
                        <p className="text-xs text-[#E8923A] font-mono mt-1">{session.total_fish} fish</p>
                      )}
                      {session.notes && (
                        <p className="text-xs text-[#8B949E] mt-1 line-clamp-2">{session.notes}</p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#484F58] group-hover:text-[#0BA5C7] transition-colors shrink-0 mt-1" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Followed Rivers (image cards for favorited rivers) */}
        {favRivers.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-[#E8923A]" />
                <h2 className="font-heading text-xl font-bold text-[#F0F6FC]">Followed Rivers</h2>
              </div>
              <Link href="/rivers" className="text-sm text-[#8B949E] hover:text-[#E8923A] transition-colors">
                Explore all &rarr;
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {favRivers.map((river) => {
                const intel = riverIntel[river.id];
                return (
                  <Link
                    key={river.id}
                    href={`/rivers/${river.slug}`}
                    className="group block shrink-0 w-56"
                  >
                    <div className="relative h-32 rounded-xl overflow-hidden border border-[#21262D] group-hover:border-[#E8923A] transition-all">
                      <Image
                        src={river.hero_image_url}
                        alt={river.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="224px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-bold leading-tight">{river.name}</p>
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-[#E8923A]" />
                <h2 className="font-heading text-xl font-bold text-[#F0F6FC]">Your Destinations</h2>
              </div>
              <Link href="/destinations" className="text-sm text-[#8B949E] hover:text-[#E8923A] transition-colors">
                Explore all &rarr;
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {favDests.map((dest) => (
                <Link
                  key={dest.id}
                  href={`/destinations/${dest.slug}`}
                  className="group block shrink-0 w-48"
                >
                  <div className="relative h-28 rounded-xl overflow-hidden border border-[#21262D] group-hover:border-[#E8923A] transition-all">
                    <Image
                      src={dest.hero_image_url}
                      alt={dest.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="192px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-bold leading-tight">{dest.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* My Recent Sessions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#E8923A]" />
              <h2 className="font-heading text-xl font-bold text-[#F0F6FC]">My Recent Sessions</h2>
            </div>
            <Link href="/journal" className="text-sm text-[#8B949E] hover:text-[#E8923A] transition-colors">
              Full journal &rarr;
            </Link>
          </div>

          {mySessions.length === 0 ? (
            <div className="bg-[#161B22] rounded-xl border border-[#21262D] border-dashed p-10 text-center">
              <Fish className="h-10 w-10 text-[#484F58] mx-auto mb-3" />
              <p className="text-[#8B949E] mb-3">No sessions logged yet.</p>
              <p className="text-sm text-[#484F58] mb-4">Download the app to start logging your sessions.</p>
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

        {/* Empty state CTA if no favorites */}
        {favRivers.length === 0 && favDests.length === 0 && followingFeed.length === 0 && (
          <section className="bg-[#161B22] rounded-xl border border-[#21262D] p-8 text-center">
            <Star className="h-10 w-10 text-[#E8923A] mx-auto mb-3" />
            <h3 className="font-heading text-lg font-bold text-[#F0F6FC] mb-2">Personalize Your Dashboard</h3>
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
