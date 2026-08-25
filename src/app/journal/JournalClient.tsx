"use client";

import { FishingSession, SessionRig, Catch } from "@/types/fishing-log";
import { useEffect, useMemo, useState } from "react";
import { parseLocalDate } from "@/lib/date";
import { SessionCard } from "./SessionCard";
import { SidebarFilters } from "./SidebarFilters";
import { CalendarView } from "./CalendarView";
import { JournalTable } from "./JournalTable";
import { ListIcon, CalendarIcon, TableIcon, FilterIcon, BookOpen, Feather, Package, TrendingUp, Download, Trophy, Sparkles, Upload } from "lucide-react";
import Link from "next/link";
import TipCard from "@/components/ui/TipCard";
import FilterDropdown from "@/components/ui/FilterDropdown";
import FilterBar from "@/components/ui/FilterBar";
import { Button } from "@/components/ui/Button";
import dynamic from "next/dynamic";

const JournalMapView = dynamic(
  () => import("@/components/maps/JournalMapView"),
  { ssr: false }
);

/** Resilient avatar — uses <img> to avoid Next.js domain whitelist issues, with error fallback */
function AvatarImage({ url, name, size = 56 }: { url?: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const initial = (name || "A").charAt(0).toUpperCase();

  if (!url || failed) {
    return (
      <div className={`h-14 w-14 rounded-xl border-[3px] border-white bg-[var(--action)]/20 overflow-hidden shadow-md flex items-center justify-center`}>
        <span className="text-lg font-bold text-[var(--action)]">{initial}</span>
      </div>
    );
  }

  return (
    <div className="h-14 w-14 rounded-xl border-[3px] border-white bg-[var(--action)]/20 overflow-hidden shadow-md flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Profile"
        width={size}
        height={size}
        className="object-cover w-full h-full"
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

interface UserProfile {
  displayName?: string;
  username?: string;
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
  likeCounts?: Record<string, number>;
  commentCounts?: Record<string, number>;
}

export function JournalClient({ sessions, rigs, catches = [], feedDisplay = "collage", userProfile, totalFlyPatterns = 0, likeCounts = {}, commentCounts = {} }: JournalClientProps) {
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
  const [view, setView] = useState<"list" | "calendar" | "table">("list");
  const [filterRivers, setFilterRivers] = useState<string[]>([]);
  const [filterYears, setFilterYears] = useState<number[]>([]);
  const [filterLocations, setFilterLocations] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem("journal-view");
    if (savedView === "list" || savedView === "calendar" || savedView === "table") {
      setView(savedView);
    }
  }, []);

  // Save view preference to localStorage
  useEffect(() => {
    localStorage.setItem("journal-view", view);
  }, [view]);

  // Logged catches per session. The table shows what was actually logged,
  // which can differ from the session's own total_fish tally.
  const fishBySession = useMemo(() => {
    const counts: Record<string, number> = {};
    catchesMap.forEach((list, sid) => {
      counts[sid] = list.reduce((sum, c) => {
        const q = (c as Catch & { quantities?: number }).quantities;
        return sum + (typeof q === "number" && q > 0 ? q : 1);
      }, 0);
    });
    return counts;
    // catchesMap is rebuilt each render from the `catches` prop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catches]);

  // Calculate stats
  const totalSessions = sessions.length;
  const totalFish = sessions.reduce((sum, s) => sum + (s.total_fish || 0), 0);
  const riversFished = new Set(sessions.map((s) => s.river_name).filter(Boolean)).size;
  const biggestFish = Math.round(catches.reduce((best, c) => {
    const raw = c.length_inches;
    const len = typeof raw === "number" ? raw : parseFloat(String(raw ?? "0"));
    return Number.isFinite(len) && len > best ? len : best;
  }, 0) * 10) / 10;

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

  // Sort most recent first — date DESC, then created_at DESC as tiebreaker for same-day sessions
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0;
  });

  // Facets: rivers ordered by recency of last session (newest first), years DESC
  const riverFacets = useMemo(() => {
    const map = new Map<string, { lastDate: string; count: number }>();
    for (const s of sortedSessions) {
      const name = s.river_name || "Unknown";
      const existing = map.get(name);
      if (!existing) {
        map.set(name, { lastDate: s.date, count: 1 });
      } else {
        existing.count += 1;
        if (s.date > existing.lastDate) existing.lastDate = s.date;
      }
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ value: name, label: name, count: v.count, lastDate: v.lastDate }))
      .sort((a, b) => (a.lastDate < b.lastDate ? 1 : a.lastDate > b.lastDate ? -1 : 0));
  }, [sortedSessions]);

  const yearFacets = useMemo(() => {
    const counts = new Map<number, number>();
    for (const s of sortedSessions) {
      const y = parseLocalDate(s.date).getFullYear();
      counts.set(y, (counts.get(y) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([year, count]) => ({ value: String(year), label: String(year), count }))
      .sort((a, b) => Number(b.value) - Number(a.value));
  }, [sortedSessions]);

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

  const handleLocationChange = (_: "locations", value: string) => {
    setFilterLocations((prev) =>
      prev.includes(value) ? prev.filter((l) => l !== value) : [...prev, value]
    );
  };

  const yearSelectedStr = filterYears.map((y) => String(y));

  const activeChips = [
    ...filterRivers.map((r) => ({
      key: `river:${r}`,
      label: r,
      onRemove: () => setFilterRivers((prev) => prev.filter((x) => x !== r)),
    })),
    ...filterYears.map((y) => ({
      key: `year:${y}`,
      label: String(y),
      onRemove: () => setFilterYears((prev) => prev.filter((x) => x !== y)),
    })),
    ...filterLocations.map((l) => ({
      key: `loc:${l}`,
      label: l,
      onRemove: () => setFilterLocations((prev) => prev.filter((x) => x !== l)),
    })),
  ];

  const clearFilters = () => {
    setFilterRivers([]);
    setFilterYears([]);
    setFilterLocations([]);
  };

  const hasActiveFilters =
    filterRivers.length > 0 || filterYears.length > 0 || filterLocations.length > 0;

  return (
    <div className="min-h-screen bg-[var(--surface-page)]">
      {/* Mobile header */}
      <div className="lg:hidden border-b border-[var(--border-rule)] bg-[var(--surface-raised)] px-4 py-4">
        <h1 className="font-heading text-2xl font-bold text-[var(--action)] mb-3">Journal</h1>
        <div className="flex gap-2">
          <Link
            href="/journal/stats"
            className="flex-1 text-center rounded-md border border-[var(--signal-live)] px-2 py-1.5 text-xs font-medium text-[var(--signal-live)] hover:bg-[var(--signal-live)]/10"
          >
            📊 Stats
          </Link>
          <Button href="/journal/flies" variant="outline" size="sm" className="flex-1">
            🪰 Flies
          </Button>
          <Link
            href="/account/gear"
            className="flex-1 text-center rounded-md border border-[var(--signal-live)] px-2 py-1.5 text-xs font-medium text-[var(--signal-live)] hover:bg-[var(--signal-live)]/10"
          >
            🎣 Gear
          </Link>
          <Button href="/journal/new" variant="solid" size="sm" className="flex-1">
            + Log
          </Button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-[var(--action)] text-[var(--on-action)]"
                  : "bg-[var(--surface-card)] text-[var(--text-body)] hover:bg-[var(--surface-card)]"
              }`}
            >
              <ListIcon className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                view === "calendar"
                  ? "bg-[var(--action)] text-[var(--on-action)]"
                  : "bg-[var(--surface-card)] text-[var(--text-body)] hover:bg-[var(--surface-card)]"
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </button>
            <button
              onClick={() => setView("table")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                view === "table"
                  ? "bg-[var(--action)] text-[var(--on-action)]"
                  : "bg-[var(--surface-card)] text-[var(--text-body)] hover:bg-[var(--surface-card)]"
              }`}
            >
              <TableIcon className="h-4 w-4" />
              Table
            </button>
          </div>
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--surface-card)] px-3 py-2 text-sm font-medium text-[var(--text-body)] hover:bg-[var(--surface-card)]"
          >
            <FilterIcon className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--action)] text-xs text-[var(--on-action)]">
                {filterRivers.length + filterYears.length + filterLocations.length}
              </span>
            )}
          </button>
        </div>

        {/* Mobile stats */}
        <div className="mt-4 flex gap-4 overflow-x-auto text-sm text-[var(--text-body)]">
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
              className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-xl bg-[var(--surface-raised)] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-xl font-semibold text-[var(--action)]">
                  Filters
                </h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="text-[var(--text-body)] hover:text-[var(--text-body)]"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-body)]">Rivers</p>
                  <FilterDropdown
                    label="Rivers"
                    options={riverFacets}
                    selected={filterRivers}
                    onChange={setFilterRivers}
                    placeholder="All rivers"
                    emptyMessage="No rivers logged yet"
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-body)]">Years</p>
                  <FilterDropdown
                    label="Years"
                    options={yearFacets}
                    selected={yearSelectedStr}
                    onChange={(next) => setFilterYears(next.map(Number))}
                    placeholder="All years"
                    emptyMessage="No years yet"
                  />
                </div>
                <SidebarFilters
                  sessions={sessions}
                  filterLocations={filterLocations}
                  onFilterChange={handleLocationChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop layout */}
      <div className="mx-auto max-w-7xl lg:flex lg:gap-6 lg:px-8 lg:pt-6 lg:pb-8">
        {/* Desktop sidebar — Strava-style profile panel */}
        <aside className="hidden lg:block lg:w-[240px] lg:flex-shrink-0">
          <div className="sticky top-[4rem] flex flex-col gap-4 max-h-[calc(100vh-5rem)] overflow-y-auto pt-2 pb-4 pr-1">

            {/* Profile card */}
            <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)]">
              <div className="h-16 bg-gradient-to-br from-forest to-forest-dark rounded-t-xl" />
              <div className="px-4 pb-4">
                <Link href="/account" className="-mt-8 mb-3 block w-fit">
                  <AvatarImage
                    url={userProfile?.avatarUrl}
                    name={userProfile?.displayName || userProfile?.email || "A"}
                    size={56}
                  />
                </Link>
                <p className="font-bold text-[var(--text-primary)] text-sm leading-tight">
                  {(userProfile?.displayName || "Angler").trim().split(/\s+/)[0]}
                </p>
                {userProfile?.username && (
                  <p className="text-xs text-[var(--text-meta)] mt-0.5 mb-3 truncate">@{userProfile.username}</p>
                )}
                <div className={`grid grid-cols-3 gap-1 text-center border-t border-[var(--border-rule)] pt-3 ${userProfile?.username ? "" : "mt-3"}`}>
                  <div>
                    <p className="text-base font-bold text-[var(--text-primary)]">{totalSessions}</p>
                    <p className="text-[10px] text-[var(--text-meta)] uppercase tracking-wide">Sessions</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-[var(--text-primary)]">{totalFish}</p>
                    <p className="text-[10px] text-[var(--text-meta)] uppercase tracking-wide">Fish</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-[var(--text-primary)]">{biggestFish > 0 ? `${biggestFish}"` : "—"}</p>
                    <p className="text-[10px] text-[var(--text-meta)] uppercase tracking-wide">Biggest</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick nav */}
            <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-3 space-y-1">
              <Link href="/journal" className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[var(--action)]/5 text-[var(--action)] text-sm font-medium">
                <BookOpen className="h-4 w-4" /> Journal
              </Link>
              <Link href="/journal/stats" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-body)] text-sm hover:bg-[var(--surface-page)] transition-colors">
                <TrendingUp className="h-4 w-4" /> River Stats
              </Link>
              <Link href="/journal/trophy-wall" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-body)] text-sm hover:bg-[var(--surface-page)] transition-colors">
                <Trophy className="h-4 w-4" /> Trophy Wall
              </Link>
              <Link href="/journal/insights" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-body)] text-sm hover:bg-[var(--surface-page)] transition-colors">
                <Sparkles className="h-4 w-4" /> Insights
              </Link>
              <Link href="/journal/flies" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-body)] text-sm hover:bg-[var(--surface-page)] transition-colors">
                <Feather className="h-4 w-4" /> Fly Box
                <span className="ml-auto text-xs text-[var(--text-meta)]">{totalFlyPatterns}</span>
              </Link>
              <Link href="/account/gear" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-body)] text-sm hover:bg-[var(--surface-page)] transition-colors">
                <Package className="h-4 w-4" /> Gear Locker
              </Link>
              <Link href="/favorites" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-body)] text-sm hover:bg-[var(--surface-page)] transition-colors">
                <span className="text-base">❤️</span> Favorites
              </Link>
              <Link href="/account" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-body)] text-sm hover:bg-[var(--surface-page)] transition-colors">
                <span className="text-base">⚙️</span> Settings
              </Link>
            </div>

            {/* Log buttons */}
            <div className="space-y-2">
              <Button href="/journal/new" variant="solid" size="md" fullWidth>
                + Log Session
              </Button>
              <Link href="/journal/flies/new" className="block w-full text-center rounded-xl border border-[var(--signal-live)] bg-[var(--signal-live)]/10 px-4 py-2.5 text-sm font-medium text-[var(--signal-live)] hover:bg-[var(--signal-live)]/20 transition-colors">
                + Add Fly Pattern
              </Link>
            </div>

            {/* Import */}
            <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-3">
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-meta)] uppercase tracking-wide font-medium mb-1">
                <Upload className="h-3.5 w-3.5" /> Import Journal
              </div>
              <Link
                href="/journal/import"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-body)] text-sm hover:bg-[var(--surface-page)] transition-colors"
              >
                Import from CSV →
              </Link>
            </div>

            {/* Export */}
            <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-3">
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-meta)] uppercase tracking-wide font-medium mb-1">
                <Download className="h-3.5 w-3.5" /> Export Journal
              </div>
              <a
                href="/api/export/csv"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-body)] text-sm hover:bg-[var(--surface-page)] transition-colors"
              >
                CSV (Spreadsheet)
              </a>
              <a
                href="/api/export/pdf"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-body)] text-sm hover:bg-[var(--surface-page)] transition-colors"
              >
                PDF (Trip Report)
              </a>
            </div>

            {/* Location tags — venue-type filter, kept in sidebar */}
            <SidebarFilters
              sessions={sessions}
              filterLocations={filterLocations}
              onFilterChange={handleLocationChange}
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 py-6 lg:px-0 lg:py-0">
          {/* Top filter bar — sticky on desktop, hidden on mobile (mobile uses bottom sheet) */}
          {sessions.length > 0 && (
            <div className="hidden lg:block">
              <FilterBar
                sticky
                inline
                activeChips={activeChips}
                onClearAll={hasActiveFilters ? clearFilters : undefined}
                rightSlot={
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 border border-[var(--border-rule)] rounded-lg p-0.5 bg-[var(--surface-raised)]">
                      <button
                        onClick={() => setView("list")}
                        aria-label="List view"
                        aria-pressed={view === "list"}
                        className={`p-1.5 rounded-md transition-colors ${
                          view === "list"
                            ? "bg-[var(--action)]/10 text-[var(--action)]"
                            : "text-[var(--text-meta)] hover:text-[var(--text-body)]"
                        }`}
                      >
                        <ListIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setView("calendar")}
                        aria-label="Calendar view"
                        aria-pressed={view === "calendar"}
                        className={`p-1.5 rounded-md transition-colors ${
                          view === "calendar"
                            ? "bg-[var(--action)]/10 text-[var(--action)]"
                            : "text-[var(--text-meta)] hover:text-[var(--text-body)]"
                        }`}
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setView("table")}
                        aria-label="Table view"
                        aria-pressed={view === "table"}
                        className={`p-1.5 rounded-md transition-colors ${
                          view === "table"
                            ? "bg-[var(--action)]/10 text-[var(--action)]"
                            : "text-[var(--text-meta)] hover:text-[var(--text-body)]"
                        }`}
                      >
                        <TableIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-xs text-[var(--text-meta)] hidden xl:inline tabular-nums">
                      {filteredSessions.length === sortedSessions.length
                        ? `${sortedSessions.length} sessions`
                        : `${filteredSessions.length} of ${sortedSessions.length}`}
                    </span>
                  </div>
                }
              >
                <FilterDropdown
                  label="Rivers"
                  options={riverFacets}
                  selected={filterRivers}
                  onChange={setFilterRivers}
                  placeholder="Rivers"
                  emptyMessage="No rivers logged yet"
                />
                <FilterDropdown
                  label="Years"
                  options={yearFacets}
                  selected={yearSelectedStr}
                  onChange={(next) => setFilterYears(next.map(Number))}
                  placeholder="Years"
                  emptyMessage="No years yet"
                />
              </FilterBar>
            </div>
          )}

          {/* One-time intro */}
          <div className="mb-4">
            <TipCard storageKey="journal-feed-intro" title="Your fishing journal">
              <p>Every logged session shows up here. Tap a card to dive in — catches, photos, weather, notes, and kudos from people you follow.</p>
              <p className="text-[var(--text-meta)]">Toggle <span className="text-[var(--text-primary)] font-semibold">List</span>, <span className="text-[var(--text-primary)] font-semibold">Calendar</span>, or <span className="text-[var(--text-primary)] font-semibold">Table</span> above. Filter by river, year, or location tag in the sidebar.</p>
            </TipCard>
          </div>

          {/* Content */}
          {view === "list" ? (
            <>
              {/* Compact map panel — shown when feedDisplay==="map", collapsible */}
              {feedDisplay === "map" && (
                <div className="mb-4 rounded-xl overflow-hidden border border-[var(--border-rule)]">
                  <JournalMapView sessions={filteredSessions} compact />
                </div>
              )}

              {/* Session list — always visible */}
              {filteredSessions.length === 0 ? (
                <div className="rounded-lg bg-[var(--surface-raised)] p-12 text-center shadow-sm">
                  <p className="text-[var(--text-body)]">No sessions match your filters</p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-sm font-medium text-[var(--action)] hover:text-[var(--action)]"
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
                      kudosCount={likeCounts[session.id] || 0}
                      commentCount={commentCounts[session.id] || 0}
                    />
                  ))}
                </div>
              )}
            </>
          ) : view === "table" ? (
            <JournalTable sessions={filteredSessions} fishBySession={fishBySession} />
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
