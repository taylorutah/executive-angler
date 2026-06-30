"use client";

import Link from "next/link";
import {
  Fish, MapPin, ChevronRight, BookOpen, Plus, Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { RiverStats } from "@/types/awards";
import MyFliesWidget, { type MyFliesItem } from "@/components/dashboard/MyFliesWidget";
import RiverSectionsGrid, {
  type FavoriteSectionDTO,
  type YourRiverDTO,
} from "@/components/dashboard/RiverSectionsGrid";
import CompactStatsRow from "@/components/dashboard/CompactStatsRow";
import type { GaugeChoice } from "@/components/dashboard/RiverSectionCard";

interface DashboardProps {
  user: { id: string; email: string };
  profile: { username: string | null; display_name: string | null; avatar_url: string | null; home_location: string | null } | null;
  mySessions: Array<{ id: string; date: string; river_name: string | null; total_fish: number | null; notes: string | null; broadcast_presence: boolean }>;
  tieNextItems: MyFliesItem[];
  favoriteItems: MyFliesItem[];
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
  favoriteSections: FavoriteSectionDTO[];
  yourRivers: YourRiverDTO[];
  riversForPicker: Array<{ id: string; name: string; slug: string; gauges: GaugeChoice[] }>;
}

function formatDate(d: string): string {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DashboardClient({
  user, profile, mySessions, tieNextItems, favoriteItems, flyCount, gearCount,
  riverStats, enhancedStats, favoriteSections, yourRivers, riversForPicker,
}: DashboardProps) {
  const displayName = profile?.display_name || profile?.username || user.email.split("@")[0];
  const milestoneCount = riverStats.reduce((sum, rs) => sum + rs.awards.length, 0);

  return (
    <div className="min-h-screen bg-[#0D1117]">

      {/* ─── Header ─── */}
      <div className="bg-[#161B22] border-b border-[#21262D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
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
            <div className="hidden sm:flex gap-1.5 shrink-0">
              <Button href="/contribute" variant="ghost" size="sm" icon={Plus}>Contribute</Button>
              <Button href="/feedback" variant="ghost" size="sm" icon={Lightbulb}>Ideas</Button>
            </div>
          </div>
          <div className="flex sm:hidden gap-2 mt-4">
            <Button href="/contribute" variant="ghost" size="sm" icon={Plus} fullWidth>Contribute</Button>
            <Button href="/feedback" variant="ghost" size="sm" icon={Lightbulb} fullWidth>Ideas</Button>
          </div>
        </div>
      </div>

      {/* ─── Main ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">

          {/* Left col */}
          <div className="space-y-6">

            {/* Zone A — Favorite River Sections (top of page) */}
            <RiverSectionsGrid
              initialFavorites={favoriteSections}
              yourRivers={yourRivers}
              allRiversForPicker={riversForPicker}
            />

            {/* Zone B — Compact stats + quick actions */}
            <CompactStatsRow
              stats={{
                totalFish: enhancedStats.totalFish,
                totalSessions: enhancedStats.totalSessions,
                monthFish: enhancedStats.monthFish,
                biggestFish: enhancedStats.biggestFish,
                speciesCount: enhancedStats.speciesCount,
                weeklyStreak: enhancedStats.weeklyStreak,
              }}
              flyCount={flyCount}
              gearCount={gearCount}
              tieNextCount={tieNextItems.length}
              milestoneCount={milestoneCount}
            />

            {/* Mobile-only flies widget */}
            <div className="lg:hidden">
              <MyFliesWidget tieNext={tieNextItems} favorites={favoriteItems} />
            </div>

            {/* Recent sessions */}
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

          {/* Right col (desktop) */}
          <div className="space-y-8 mt-8 lg:mt-0">
            <div className="hidden lg:block">
              <MyFliesWidget tieNext={tieNextItems} favorites={favoriteItems} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
