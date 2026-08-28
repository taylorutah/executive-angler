"use client";

import { FishingSession, SessionRig, Catch } from "@/types/fishing-log";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { parseLocalDate } from "@/lib/date";
import { SessionCard } from "./SessionCard";
import { SidebarFilters } from "./SidebarFilters";
import { CalendarView } from "./CalendarView";
import { JournalTable } from "./JournalTable";
import { ListIcon, CalendarIcon, TableIcon, FilterIcon, BookOpen, Feather, Package, TrendingUp, Download, Trophy, Sparkles, Upload, Plus, Settings, Heart, X } from "@/icons";
import Link from "next/link";
import TipCard from "@/components/ui/TipCard";
import FilterDropdown from "@/components/ui/FilterDropdown";
import FilterBar from "@/components/ui/FilterBar";
import FirstRunEmpty from "@/app/today/FirstRunEmpty";
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
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-card border border-[var(--border)] bg-[var(--accent-soft)]">
        <span className="font-display text-xl font-semibold text-[var(--accent)]">{initial}</span>
      </div>
    );
  }

  return (
    <div className="h-14 w-14 overflow-hidden rounded-card border border-[var(--border)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        className="ea-photo h-full w-full"
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

  // Escape closes the mobile filter sheet
  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileFiltersOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileFiltersOpen]);

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

  if (sessions.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-[var(--prose)] px-4 py-12 sm:px-6">
          <h1 className="font-display text-3xl font-semibold text-[var(--text-1)]">Journal</h1>
          <FirstRunEmpty
            surface="journal"
            purpose="The journal is a private record of your days on the water."
            actionHref="/journal/new"
            actionLabel="Log a session"
            example="A first day can be a date and a river. The Madison is on the index if you want a name that already exists."
          />
        </div>
      </div>
    );
  }

  const viewButton = (
    v: "list" | "calendar" | "table",
    label: string,
    Icon: typeof ListIcon,
    iconOnly = false
  ) => (
    <button
      type="button"
      onClick={() => setView(v)}
      aria-label={iconOnly ? `${label} view` : undefined}
      aria-pressed={view === v}
      className={`ea-segment ${iconOnly ? "ea-segment-icon" : ""}`}
    >
      <Icon size={16} />
      {iconOnly ? null : label}
    </button>
  );

  const sidebarNavRow = (
    href: string,
    label: string,
    Icon: typeof BookOpen,
    opts: { current?: boolean; trailing?: ReactNode } = {}
  ) => (
    <Link
      href={href}
      aria-current={opts.current ? "page" : undefined}
      className={`flex items-center gap-2 rounded-surface px-3 py-2 text-sm font-medium transition-colors ${
        opts.current
          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
          : "text-[var(--text-2)] hover:bg-[var(--paper-deep)] hover:text-[var(--text-1)]"
      }`}
    >
      <Icon size={16} />
      {label}
      {opts.trailing}
    </Link>
  );

  return (
    <div className="min-h-screen">
      {/* Page header — one h1. Mobile rows collapse away at lg. */}
      <header className="border-b border-[var(--border)] lg:border-b-0">
        <div className="mx-auto max-w-[var(--container)] px-4 pt-5 pb-4 sm:px-6 lg:px-6 lg:pt-6 lg:pb-0">
          <h1 className="font-display text-2xl font-semibold text-[var(--text-1)] lg:text-3xl">Journal</h1>

          {/* Mobile stats */}
          <p className="mt-1 text-13 text-[var(--text-2)] num lg:hidden">
            {totalSessions} sessions · {totalFish} fish · {riversFished} rivers
          </p>

          {/* Mobile actions */}
          <div className="mt-4 grid grid-cols-2 gap-2 lg:hidden">
            <Link href="/journal/stats" className="ea-btn ea-btn-secondary w-full">
              <TrendingUp size={16} /> Stats
            </Link>
            <Link href="/journal/flies" className="ea-btn ea-btn-secondary w-full">
              <Feather size={16} /> Flies
            </Link>
            <Link href="/account/gear" className="ea-btn ea-btn-secondary w-full">
              <Package size={16} /> Gear
            </Link>
            <Link href="/journal/new" className="ea-btn ea-btn-primary w-full">
              <Plus size={16} /> Log Session
            </Link>
          </div>

          {/* Mobile view toggle + filter trigger */}
          <div className="mt-4 flex items-center justify-between gap-3 lg:hidden">
            <div className="ea-segmented" role="group" aria-label="Journal view">
              {viewButton("list", "List", ListIcon)}
              {viewButton("calendar", "Calendar", CalendarIcon)}
              {viewButton("table", "Table", TableIcon)}
            </div>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              aria-expanded={mobileFiltersOpen}
              className="ea-btn ea-btn-secondary"
            >
              <FilterIcon size={16} />
              Filters
              {hasActiveFilters && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-chip bg-[var(--accent)] px-1 text-xs text-[var(--on-action)] num">
                  {filterRivers.length + filterYears.length + filterLocations.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile filter sheet */}
      {mobileFiltersOpen && (
        <div className="ea-modal-overlay z-50 flex items-end lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="ea-sheet w-full overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-[var(--text-1)]">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="rounded-instrument p-2 text-[var(--text-2)] transition-colors hover:bg-[var(--paper-deep)] hover:text-[var(--text-1)]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <p className="ea-overline mb-2">Rivers</p>
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
                <p className="ea-overline mb-2">Years</p>
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

      {/* Desktop layout */}
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:flex lg:gap-6 lg:pt-6 lg:pb-8">
        {/* Sidebar — profile, sections, actions, data */}
        <aside className="hidden lg:block lg:w-60 lg:shrink-0">
          <div className="sticky top-[var(--header-h)] flex max-h-[calc(100vh-var(--header-h)-var(--space-4))] flex-col gap-4 overflow-y-auto pb-4 pr-1">

            {/* Profile card */}
            <div className="ea-card">
              <Link href="/account" aria-label="Your account" className="block w-fit rounded-card">
                <AvatarImage
                  url={userProfile?.avatarUrl}
                  name={userProfile?.displayName || userProfile?.email || "A"}
                  size={56}
                />
              </Link>
              <p className="mt-3 text-sm font-semibold leading-tight text-[var(--text-1)]">
                {(userProfile?.displayName || "Angler").trim().split(/\s+/)[0]}
              </p>
              {userProfile?.username && (
                <p className="mt-1 truncate text-xs text-[var(--text-3)]">@{userProfile.username}</p>
              )}
              <div className="mt-3 grid grid-cols-3 gap-1 border-t border-[var(--border)] pt-3 text-center">
                <div>
                  <p className="font-display text-xl font-semibold text-[var(--text-1)] num">{totalSessions}</p>
                  <p className="ea-overline mt-1">Sessions</p>
                </div>
                <div>
                  <p className="font-display text-xl font-semibold text-[var(--text-1)] num">{totalFish}</p>
                  <p className="ea-overline mt-1">Fish</p>
                </div>
                <div>
                  <p className="font-display text-xl font-semibold text-[var(--text-1)] num">{biggestFish > 0 ? `${biggestFish}"` : "—"}</p>
                  <p className="ea-overline mt-1">Biggest</p>
                </div>
              </div>
            </div>

            {/* Section nav */}
            <nav aria-label="Journal sections" className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-2">
              <div className="flex flex-col">
                {sidebarNavRow("/journal", "Journal", BookOpen, { current: true })}
                {sidebarNavRow("/journal/stats", "River Stats", TrendingUp)}
                {sidebarNavRow("/journal/trophy-wall", "Trophy Wall", Trophy)}
                {sidebarNavRow("/journal/insights", "Insights", Sparkles)}
                {sidebarNavRow("/journal/flies", "Fly Box", Feather, {
                  trailing: <span className="ml-auto text-xs text-[var(--text-3)] num">{totalFlyPatterns}</span>,
                })}
                {sidebarNavRow("/account/gear", "Gear Locker", Package)}
                {sidebarNavRow("/favorites", "Favorites", Heart)}
                {sidebarNavRow("/account", "Settings", Settings)}
              </div>
            </nav>

            {/* Log actions */}
            <div className="flex flex-col gap-2">
              <Link href="/journal/new" className="ea-btn ea-btn-primary w-full">
                <Plus size={16} /> Log Session
              </Link>
              <Link href="/journal/flies/new" className="ea-btn ea-btn-secondary w-full">
                <Plus size={16} /> Add Fly Pattern
              </Link>
            </div>

            {/* Journal data — import + export */}
            <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-2">
              <p className="ea-overline px-3 pt-2 pb-1">Journal data</p>
              <div className="flex flex-col">
                <Link
                  href="/journal/import"
                  className="flex items-center gap-2 rounded-surface px-3 py-2 text-sm font-medium text-[var(--text-2)] transition-colors hover:bg-[var(--paper-deep)] hover:text-[var(--text-1)]"
                >
                  <Upload size={16} /> Import from CSV
                </Link>
                <a
                  href="/api/export/csv"
                  className="flex items-center gap-2 rounded-surface px-3 py-2 text-sm font-medium text-[var(--text-2)] transition-colors hover:bg-[var(--paper-deep)] hover:text-[var(--text-1)]"
                >
                  <Download size={16} /> Export CSV
                </a>
                <a
                  href="/api/export/pdf"
                  className="flex items-center gap-2 rounded-surface px-3 py-2 text-sm font-medium text-[var(--text-2)] transition-colors hover:bg-[var(--paper-deep)] hover:text-[var(--text-1)]"
                >
                  <Download size={16} /> Export PDF — trip report
                </a>
              </div>
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
        <main className="min-w-0 flex-1 py-6 lg:py-0">
          {/* Filter bar — sticky on desktop; mobile uses the sheet */}
          {sessions.length > 0 && (
            <div className="hidden lg:block">
              <FilterBar
                sticky
                inline
                activeChips={activeChips}
                onClearAll={hasActiveFilters ? clearFilters : undefined}
                rightSlot={
                  <div className="flex items-center gap-3">
                    <div className="ea-segmented" role="group" aria-label="Journal view">
                      {viewButton("list", "List", ListIcon, true)}
                      {viewButton("calendar", "Calendar", CalendarIcon, true)}
                      {viewButton("table", "Table", TableIcon, true)}
                    </div>
                    <span className="hidden text-xs text-[var(--text-3)] num xl:inline">
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
              <p>Every session you log lands here — catches, photos, weather, and notes. Open a card for the full day.</p>
              <p>Switch between List, Calendar, and Table above. Filter by river, year, or location tag in the sidebar.</p>
            </TipCard>
          </div>

          {/* Content */}
          {view === "list" ? (
            <>
              {/* Compact map panel — shown when feedDisplay==="map" */}
              {feedDisplay === "map" && (
                <div className="mb-4 overflow-hidden rounded-card border border-[var(--border)]">
                  <JournalMapView sessions={filteredSessions} compact />
                </div>
              )}

              {/* Session list — always visible */}
              {filteredSessions.length === 0 ? (
                <div className="ea-empty rounded-card border border-[var(--border)] bg-[var(--surface)]">
                  <p>No sessions match those filters.</p>
                  {hasActiveFilters && (
                    <button type="button" onClick={clearFilters} className="ea-btn ea-btn-secondary">
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
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
