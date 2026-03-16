"use client";

import { FishingSession, SessionRig, Catch } from "@/types/fishing-log";
import { useEffect, useState } from "react";
import { parseLocalDate } from "@/lib/date";
import { SessionCard } from "./SessionCard";
import { SidebarFilters } from "./SidebarFilters";
import { CalendarView } from "./CalendarView";
import { ListIcon, CalendarIcon, FilterIcon, BookOpen, Feather, Package, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const JournalMapView = dynamic(
  () => import("@/components/maps/JournalMapView"),
  { ssr: false }
);

interface UserProfile {
  displayName?: string;
  email?: string;
  avatarUrl?: string;
}

interface JournalClientProps {
  sessions: FishingSession[];
  rigs: SessionRig[];
  catches?: Catch[];
  feedDisplay?: "collage" | "map";
  userProfile?: UserProfile;
  totalFlyPatterns?: number;
}

export function JournalClient({ sessions, rigs, catches = [], feedDisplay = "collage", userProfile, totalFlyPatterns = 0 }: JournalClientProps) {
  // Group catches by session ID
  const catchesMap = catches.reduce((acc, c) => {
    const sid = (c as Catch & { session_id?: string }).session_id || "";
    if (!acc.has(sid)) acc.set(sid, []);
    acc.get(sid)!.push(c);
    return acc;
  }, new Map<string, Catch[]>());

  // Group rigs by session ID
  const rigsMap = rigs.reduce((acc, rig) => {
    if (!acc.has(rig.session_id)) {
      acc.set(rig.session_id, []);
    }
    acc.get(rig.session_id)!.push(rig);
    return acc;
  }, new Map<string, SessionRig[]>());

  // Sort rigs by position within each session
  rigsMap.forEach((sessionRigs) => {
    sessionRigs.sort((a, b) => a.position - b.position);
  });

  // State
  const [view, setView] = useState<"list" | "calendar">("list");
  const [filterRivers, setFilterRivers] = useState<string[]>([]);
  const [filterYears, setFilterYears] = useState<number[]>([]);
  const [filterLocations, setFilterLocations] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem("journal-view");
    if (savedView === "list" || savedView === "calendar") {
      setView(savedView);
    }
  }, []);

  // Save view preference to localStorage
  useEffect(() => {
    localStorage.setItem("journal-view", view);
  }, [view]);

  // Calculate stats
  const totalSessions = sessions.length;
  const totalFish = sessions.reduce((sum, s) => sum + (s.total_fish || 0), 0);
  const riversFished = new Set(sessions.map((s) => s.river_name).filter(Boolean)).size;

  // Find best session
  const bestSession = sessions.reduce(
    (best, session) => {
      if (!best || (session.total_fish || 0) > best.fish) {
        return { fish: session.total_fish || 0, date: session.date };
      }
      return best;
    },
    null as { fish: number; date: string } | null
  );

  // Sort most recent first
  // Sort by fishing date DESC (most recent first).
  // Do NOT sort by created_at — bulk-imported sessions all share the same import timestamp,
  // which would scramble the order. The date field (YYYY-MM-DD) is the authoritative sort key.
  const sortedSessions = [...sessions].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0
  );

  // Filter sessions
  const filteredSessions = sortedSessions.filter((session) => {
    // River filter
    if (filterRivers.length > 0) {
      const riverName = session.river_name || "Unknown";
      if (!filterRivers.includes(riverName)) {
        return false;
      }
    }

    // Year filter
    if (filterYears.length > 0) {
      const year = parseLocalDate(session.date).getFullYear();
      if (!filterYears.includes(year)) {
        return false;
      }
    }

    // Location filter
    if (filterLocations.length > 0) {
      const sessionLocations = session.tags?.filter((tag) =>
        tag.toLowerCase().includes("walk-in") ||
        tag.toLowerCase().includes("below") ||
        tag.toLowerCase().includes("above") ||
        tag.toLowerCase().includes("creek") ||
        tag.toLowerCase().includes("section")
      ) || [];

      const hasMatchingLocation = sessionLocations.some((loc) =>
        filterLocations.includes(loc)
      );

      if (!hasMatchingLocation) {
        return false;
      }
    }

    return true;
  });

  const handleFilterChange = (
    type: "rivers" | "years" | "locations",
    value: string | number
  ) => {
    if (type === "rivers") {
      const river = value as string;
      setFilterRivers((prev) =>
        prev.includes(river) ? prev.filter((r) => r !== river) : [...prev, river]
      );
    } else if (type === "years") {
      const year = value as number;
      setFilterYears((prev) =>
        prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
      );
    } else if (type === "locations") {
      const location = value as string;
      setFilterLocations((prev) =>
        prev.includes(location)
          ? prev.filter((l) => l !== location)
          : [...prev, location]
      );
    }
  };

  const clearFilters = () => {
    setFilterRivers([]);
    setFilterYears([]);
    setFilterLocations([]);
  };

  const hasActiveFilters =
    filterRivers.length > 0 || filterYears.length > 0 || filterLocations.length > 0;

  return (
    <div className="min-h-screen bg-[#0D1117] pt-20 lg:pt-0">
      {/* Mobile header */}
      <div className="lg:hidden border-b border-[#21262D] bg-[#161B22] px-4 py-4">
        <h1 className="font-heading text-2xl font-bold text-[#E8923A] mb-3">Journal</h1>
        <div className="flex gap-2">
          <Link
            href="/journal/stats"
            className="flex-1 text-center rounded-md border border-[#00B4D8] px-2 py-1.5 text-xs font-medium text-[#00B4D8] hover:bg-[#00B4D8]/10"
          >
            📊 Stats
          </Link>
          <Link
            href="/journal/flies"
            className="flex-1 text-center rounded-md border border-[#E8923A] px-2 py-1.5 text-xs font-medium text-[#E8923A] hover:bg-[#E8923A]/10"
          >
            🪰 Flies
          </Link>
          <Link
            href="/account/gear"
            className="flex-1 text-center rounded-md border border-[#00B4D8] px-2 py-1.5 text-xs font-medium text-[#00B4D8] hover:bg-[#00B4D8]/10"
          >
            🎣 Gear
          </Link>
          <Link
            href="/journal/new"
            className="flex-1 text-center rounded-md bg-[#E8923A] px-2 py-1.5 text-xs font-medium text-white hover:bg-[#E8923A]/80"
          >
            + Log
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-[#E8923A] text-white"
                  : "bg-[#1F2937] text-[#8B949E] hover:bg-[#1F2937]"
              }`}
            >
              <ListIcon className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                view === "calendar"
                  ? "bg-[#E8923A] text-white"
                  : "bg-[#1F2937] text-[#8B949E] hover:bg-[#1F2937]"
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </button>
          </div>
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-1.5 rounded-lg bg-[#1F2937] px-3 py-2 text-sm font-medium text-[#8B949E] hover:bg-[#1F2937]"
          >
            <FilterIcon className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E8923A] text-xs text-white">
                {filterRivers.length + filterYears.length + filterLocations.length}
              </span>
            )}
          </button>
        </div>

        {/* Mobile stats */}
        <div className="mt-4 flex gap-4 overflow-x-auto text-sm text-[#8B949E]">
          <span>{totalSessions} Sessions</span>
          <span>·</span>
          <span>{totalFish} Fish</span>
          <span>·</span>
          <span>{riversFished} Rivers</span>
        </div>

        {/* Mobile filters panel */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileFiltersOpen(false)}>
            <div
              className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-xl bg-[#161B22] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-xl font-semibold text-[#E8923A]">
                  Filters
                </h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="text-[#8B949E] hover:text-[#8B949E]"
                >
                  ✕
                </button>
              </div>
              <SidebarFilters
                sessions={sessions}
                filterRivers={filterRivers}
                filterYears={filterYears}
                filterLocations={filterLocations}
                onFilterChange={handleFilterChange}
                stats={{
                  totalSessions,
                  totalFish,
                  riversFished,
                  bestSession: bestSession || undefined,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Desktop layout */}
      <div className="mx-auto max-w-7xl lg:flex lg:gap-6 lg:px-8 lg:pt-20 lg:pb-8">
        {/* Desktop sidebar — Strava-style profile panel */}
        <aside className="hidden lg:block lg:w-[240px] lg:flex-shrink-0">
          <div className="sticky top-20 flex flex-col gap-4 max-h-[calc(100vh-5.5rem)] overflow-y-auto pb-4 pr-1">

            {/* Profile card */}
            <div className="bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden">
              <div className="h-16 bg-gradient-to-br from-forest to-forest-dark" />
              <div className="px-4 pb-4">
                <Link href="/account" className="-mt-8 mb-3 block w-fit">
                  <div className="h-14 w-14 rounded-full border-3 border-white bg-[#E8923A]/20 overflow-hidden shadow-md flex items-center justify-center">
                    {userProfile?.avatarUrl ? (
                      <Image src={userProfile.avatarUrl} alt="Profile" width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-lg font-bold text-[#E8923A]">
                        {(userProfile?.displayName || userProfile?.email || "A")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                </Link>
                <p className="font-bold text-[#F0F6FC] text-sm leading-tight">{userProfile?.displayName || "Angler"}</p>
                <p className="text-xs text-[#484F58] mt-0.5 mb-3 truncate">{userProfile?.email || ""}</p>
                <div className="grid grid-cols-3 gap-1 text-center border-t border-[#21262D] pt-3">
                  <div>
                    <p className="text-base font-bold text-[#F0F6FC]">{totalSessions}</p>
                    <p className="text-[10px] text-[#484F58] uppercase tracking-wide">Sessions</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#F0F6FC]">{totalFish}</p>
                    <p className="text-[10px] text-[#484F58] uppercase tracking-wide">Fish</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#F0F6FC]">{riversFished}</p>
                    <p className="text-[10px] text-[#484F58] uppercase tracking-wide">Rivers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick nav */}
            <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-3 space-y-1">
              <Link href="/journal" className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#E8923A]/5 text-[#E8923A] text-sm font-medium">
                <BookOpen className="h-4 w-4" /> Journal
              </Link>
              <Link href="/journal/stats" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#8B949E] text-sm hover:bg-[#0D1117] transition-colors">
                <TrendingUp className="h-4 w-4" /> River Stats
              </Link>
              <Link href="/journal/flies" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#8B949E] text-sm hover:bg-[#0D1117] transition-colors">
                <Feather className="h-4 w-4" /> My Fly Box
                <span className="ml-auto text-xs text-[#484F58]">{totalFlyPatterns}</span>
              </Link>
              <Link href="/account/gear" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#8B949E] text-sm hover:bg-[#0D1117] transition-colors">
                <Package className="h-4 w-4" /> Gear Box
              </Link>
              <Link href="/favorites" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#8B949E] text-sm hover:bg-[#0D1117] transition-colors">
                <span className="text-base">❤️</span> Favorites
              </Link>
              <Link href="/account" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#8B949E] text-sm hover:bg-[#0D1117] transition-colors">
                <span className="text-base">⚙️</span> Settings
              </Link>
            </div>

            {/* Log buttons */}
            <div className="space-y-2">
              <Link href="/journal/new" className="block w-full text-center rounded-xl bg-[#E8923A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0D1117] transition-colors shadow-sm">
                + Log Session
              </Link>
              <Link href="/journal/flies/new" className="block w-full text-center rounded-xl border border-[#21262D] px-4 py-2.5 text-sm font-medium text-[#8B949E] hover:border-[#E8923A] hover:text-[#E8923A] transition-colors">
                + Add Fly Pattern
              </Link>
            </div>

            {/* Filters — always at bottom */}
            <SidebarFilters
              sessions={sessions}
              filterRivers={filterRivers}
              filterYears={filterYears}
              filterLocations={filterLocations}
              onFilterChange={handleFilterChange}
              stats={{
                totalSessions,
                totalFish,
                riversFished,
                bestSession: bestSession || undefined,
              }}
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 py-6 lg:px-0 lg:py-0">
          {/* View toggle header */}
          <div className="mb-6 hidden items-center justify-between lg:flex">
            <div className="flex gap-2">
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  view === "list"
                    ? "bg-[#E8923A] text-white"
                    : "bg-[#161B22] text-[#8B949E] hover:bg-[#0D1117] border border-[#21262D]"
                }`}
              >
                <ListIcon className="h-4 w-4" />
                List
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  view === "calendar"
                    ? "bg-[#E8923A] text-white"
                    : "bg-[#161B22] text-[#8B949E] hover:bg-[#0D1117] border border-[#21262D]"
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
                Calendar
              </button>
            </div>
            <p className="text-sm text-[#8B949E]">
              Showing {filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Content */}
          {view === "list" ? (
            <>
              {/* Compact map panel — shown when feedDisplay==="map", collapsible */}
              {feedDisplay === "map" && (
                <div className="mb-4 rounded-xl overflow-hidden border border-[#21262D]">
                  <JournalMapView sessions={filteredSessions} compact />
                </div>
              )}

              {/* Session list — always visible */}
              {filteredSessions.length === 0 ? (
                <div className="rounded-lg bg-[#161B22] p-12 text-center shadow-sm">
                  <p className="text-[#8B949E]">No sessions match your filters</p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-sm font-medium text-[#E8923A] hover:text-[#E8923A]"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      session={session as any}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      catches={catchesMap.get(session.id) as any}
                      feedDisplay={feedDisplay}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <CalendarView
              sessions={filteredSessions}
              rigsMap={rigsMap}
            />
          )}
        </main>
      </div>
    </div>
  );
}
