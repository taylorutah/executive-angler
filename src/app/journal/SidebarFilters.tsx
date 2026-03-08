"use client";

import { FishingSession } from "@/types/fishing-log";
import { useState } from "react";
import Link from "next/link";
import { parseLocalDate, formatDate } from "@/lib/date";

interface SidebarFiltersProps {
  sessions: FishingSession[];
  filterRivers: string[];
  filterYears: number[];
  filterLocations: string[];
  onFilterChange: (type: "rivers" | "years" | "locations", value: string | number) => void;
  stats: {
    totalSessions: number;
    totalFish: number;
    riversFished: number;
    bestSession?: {
      fish: number;
      date: string;
    };
  };
}

export function SidebarFilters({
  sessions,
  filterRivers,
  filterYears,
  filterLocations,
  onFilterChange,
  stats,
}: SidebarFiltersProps) {
  const [showAllRivers, setShowAllRivers] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);

  // Count sessions per river
  const riverCounts = sessions.reduce((acc, session) => {
    const river = session.river_name || "Unknown";
    acc[river] = (acc[river] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riverOptions = Object.entries(riverCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([river, count]) => ({ river, count }));

  const visibleRivers = showAllRivers ? riverOptions : riverOptions.slice(0, 5);

  // Count sessions per year
  const yearCounts = sessions.reduce((acc, session) => {
    const year = parseLocalDate(session.date).getFullYear();
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const yearOptions = Object.entries(yearCounts)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, count]) => ({ year: Number(year), count }));

  // Extract locations from tags
  const locationCounts = sessions.reduce((acc, session) => {
    const locationTags = session.tags?.filter((tag) =>
      tag.toLowerCase().includes("walk-in") ||
      tag.toLowerCase().includes("below") ||
      tag.toLowerCase().includes("above") ||
      tag.toLowerCase().includes("creek") ||
      tag.toLowerCase().includes("section")
    ) || [];

    locationTags.forEach((loc) => {
      acc[loc] = (acc[loc] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const locationOptions = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([location, count]) => ({ location, count }));

  const visibleLocations = showAllLocations
    ? locationOptions
    : locationOptions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="space-y-2">
        <div className="text-sm text-slate-600">
          <strong className="text-lg text-forest-dark">{stats.totalSessions}</strong> Sessions
        </div>
        <div className="text-sm text-slate-600">
          <strong className="text-lg text-forest-dark">{stats.totalFish}</strong> Fish Caught
        </div>
        <div className="text-sm text-slate-600">
          <strong className="text-lg text-forest-dark">{stats.riversFished}</strong> Rivers Fished
        </div>
        {stats.bestSession && (
          <div className="text-sm text-slate-600">
            <span className="font-medium">Best:</span> {stats.bestSession.fish} fish ·{" "}
            {formatDate(stats.bestSession.date, { month: "short", day: "numeric", year: "numeric" })}
          </div>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* River Filter */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Filter by River
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filterRivers.length === 0}
              onChange={() => {
                // Clear all river filters
                riverOptions.forEach(({ river }) => {
                  if (filterRivers.includes(river)) {
                    onFilterChange("rivers", river);
                  }
                });
              }}
              className="h-4 w-4 rounded border-slate-300 text-forest focus:ring-forest"
            />
            <span>All Rivers</span>
          </label>
          {visibleRivers.map(({ river, count }) => (
            <label
              key={river}
              className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filterRivers.includes(river)}
                onChange={() => onFilterChange("rivers", river)}
                className="h-4 w-4 rounded border-slate-300 text-forest focus:ring-forest"
              />
              <span>
                {river} <span className="text-slate-500">({count})</span>
              </span>
            </label>
          ))}
          {riverOptions.length > 5 && (
            <button
              onClick={() => setShowAllRivers(!showAllRivers)}
              className="text-xs text-forest hover:text-forest-dark"
            >
              {showAllRivers ? "Show less" : `Show ${riverOptions.length - 5} more`}
            </button>
          )}
        </div>
      </div>

      {/* Year Filter */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Filter by Year
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filterYears.length === 0}
              onChange={() => {
                // Clear all year filters
                yearOptions.forEach(({ year }) => {
                  if (filterYears.includes(year)) {
                    onFilterChange("years", year);
                  }
                });
              }}
              className="h-4 w-4 rounded border-slate-300 text-forest focus:ring-forest"
            />
            <span>All Years</span>
          </label>
          {yearOptions.map(({ year, count }) => (
            <label
              key={year}
              className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filterYears.includes(year)}
                onChange={() => onFilterChange("years", year)}
                className="h-4 w-4 rounded border-slate-300 text-forest focus:ring-forest"
              />
              <span>
                {year} <span className="text-slate-500">({count})</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      {locationOptions.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Filter by Location
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filterLocations.length === 0}
                onChange={() => {
                  // Clear all location filters
                  locationOptions.forEach(({ location }) => {
                    if (filterLocations.includes(location)) {
                      onFilterChange("locations", location);
                    }
                  });
                }}
                className="h-4 w-4 rounded border-slate-300 text-forest focus:ring-forest"
              />
              <span>All Locations</span>
            </label>
            {visibleLocations.map(({ location, count }) => (
              <label
                key={location}
                className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filterLocations.includes(location)}
                  onChange={() => onFilterChange("locations", location)}
                  className="h-4 w-4 rounded border-slate-300 text-forest focus:ring-forest"
                />
                <span>
                  {location} <span className="text-slate-500">({count})</span>
                </span>
              </label>
            ))}
            {locationOptions.length > 5 && (
              <button
                onClick={() => setShowAllLocations(!showAllLocations)}
                className="text-xs text-forest hover:text-forest-dark"
              >
                {showAllLocations
                  ? "Show less"
                  : `Show ${locationOptions.length - 5} more`}
              </button>
            )}
          </div>
        </div>
      )}

      <hr className="border-slate-200" />

      {/* Fly Patterns Link */}
      <Link
        href="/journal/fly-patterns"
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-forest transition-colors hover:bg-cream"
      >
        🪰 Fly Patterns →
      </Link>
    </div>
  );
}
