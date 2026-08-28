"use client";

import { FishingSession } from "@/types/fishing-log";
import { useState } from "react";
import HelpHint from "@/components/ui/HelpHint";

interface SidebarFiltersProps {
  sessions: FishingSession[];
  filterLocations: string[];
  onFilterChange: (type: "locations", value: string) => void;
}

export function SidebarFilters({
  sessions,
  filterLocations,
  onFilterChange,
}: SidebarFiltersProps) {
  const [showAllLocations, setShowAllLocations] = useState(false);

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

  if (locationOptions.length === 0) return null;

  return (
    <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-2">

      {/* Location Filter */}
      {locationOptions.length > 0 && (
        <div>
          <h3 className="ea-overline flex items-center gap-1 px-3 pt-2 pb-1">
            Filter by Location
            <HelpHint label="What Location filter pulls from">
              <p className="font-semibold text-[var(--text-1)]">Venue-type tags you added to sessions.</p>
              <p>Things like <span className="text-[var(--accent)]">walk-in</span>, <span className="text-[var(--accent)]">tailwater</span>, <span className="text-[var(--accent)]">below-dam</span>, <span className="text-[var(--accent)]">public</span>. We pull them from your session tags so you can filter down to a specific kind of water.</p>
              <p className="text-xs text-[var(--text-3)]">Nothing here? Start tagging sessions with where you fished (not just the river).</p>
            </HelpHint>
          </h3>
          <div className="flex flex-col">
            <label className="flex cursor-pointer items-center gap-2 rounded-surface px-3 py-2 text-sm text-[var(--text-2)] transition-colors hover:bg-[var(--paper-deep)] hover:text-[var(--text-1)]">
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
                className="h-4 w-4 rounded-instrument border-[var(--border-strong)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span>All Locations</span>
            </label>
            {visibleLocations.map(({ location, count }) => (
              <label
                key={location}
                className="flex cursor-pointer items-center gap-2 rounded-surface px-3 py-2 text-sm text-[var(--text-2)] transition-colors hover:bg-[var(--paper-deep)] hover:text-[var(--text-1)]"
              >
                <input
                  type="checkbox"
                  checked={filterLocations.includes(location)}
                  onChange={() => onFilterChange("locations", location)}
                  className="h-4 w-4 rounded-instrument border-[var(--border-strong)] text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <span>
                  {location} <span className="text-[var(--text-3)] num">({count})</span>
                </span>
              </label>
            ))}
            {locationOptions.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllLocations(!showAllLocations)}
                className="rounded-surface px-3 py-2 text-left text-13 font-medium text-[var(--accent)] transition-colors hover:bg-[var(--paper-deep)] hover:text-[var(--accent-hover)]"
              >
                {showAllLocations
                  ? "Show less"
                  : `Show ${locationOptions.length - 5} more`}
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
