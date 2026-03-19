"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Fish, MapPin, TrendingUp, Heart, Users,
  ChevronRight, BookOpen, Compass, Star, Activity
} from "lucide-react";

interface DashboardProps {
  user: { id: string; email: string };
  profile: { username: string | null; display_name: string | null; avatar_url: string | null; home_location: string | null } | null;
  mySessions: Array<{ id: string; date: string; river_name: string | null; total_fish: number | null; notes: string | null; privacy: string }>;
  favRivers: Array<{ id: string; name: string; slug: string; hero_image_url: string; primary_species: string[] }>;
  favDests: Array<{ id: string; name: string; slug: string; hero_image_url: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  followingFeed: Array<{ id: string; date: string; river_name: string | null; total_fish: number | null; notes: string | null; privacy: string; user_id: string; profiles: any }>;
  exploreFeed: Array<{ id: string; date: string; river_name: string | null; total_fish: number | null; notes: string | null; user_id: string; profiles: any }>;
  riverIntel: Record<string, { lastDate: string | null; sessions30d: number; topFly: string | null }>;
  totalFavorites: number;
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
  user, profile, mySessions, favRivers, favDests, followingFeed, exploreFeed, riverIntel, totalFavorites
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

        {/* Followed Rivers */}
        {favRivers.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-[#E8923A]" />
                <h2 className="font-heading text-xl font-bold text-[#F0F6FC]">Your Rivers</h2>
              </div>
              <Link href="/rivers" className="text-sm text-[#8B949E] hover:text-[#E8923A] transition-colors">
                Explore all &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favRivers.map((river) => {
                const intel = riverIntel[river.id];
                return (
                  <Link
                    key={river.id}
                    href={`/rivers/${river.slug}`}
                    className="group block bg-[#161B22] rounded-xl overflow-hidden border border-[#21262D] hover:border-[#E8923A] transition-all"
                  >
                    <div className="relative h-36">
                      <Image
                        src={river.hero_image_url}
                        alt={river.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                        <h3 className="font-heading font-bold text-white text-sm leading-tight">{river.name}</h3>
                        {intel && intel.sessions30d > 0 && (
                          <span className="flex items-center gap-1 bg-[#00B4D8]/20 text-[#00B4D8] text-[10px] font-mono px-2 py-0.5 rounded-full">
                            <Activity className="h-2.5 w-2.5" /> {intel.sessions30d} trips
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between text-xs text-[#8B949E]">
                        <span>{(river.primary_species || []).slice(0, 2).join(", ")}</span>
                        {intel?.lastDate ? (
                          <span className="font-mono text-[10px]">Last: {timeAgo(intel.lastDate)}</span>
                        ) : (
                          <span className="text-[#484F58] text-[10px]">No reports yet</span>
                        )}
                      </div>
                      <span
                        className="mt-2 text-[10px] text-[#E8923A] hover:underline flex items-center gap-1"
                      >
                        <TrendingUp className="h-3 w-3" /> View Angler Intel
                      </span>
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
