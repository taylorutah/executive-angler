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
    <div className="space-y-6">

      {/* Location Filter */}
      {locationOptions.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#A8B2BD]">
            Filter by Location
            <HelpHint label="What Location filter pulls from">
              <p className="text-[#F0F6FC] font-semibold">Venue-type tags you added to sessions.</p>
              <p>Things like <span className="text-[#E8923A]">walk-in</span>, <span className="text-[#E8923A]">tailwater</span>, <span className="text-[#E8923A]">below-dam</span>, <span className="text-[#E8923A]">public</span>. We pull them from your session tags so you can filter down to a specific kind of water.</p>
              <p className="text-[#6E7681] text-xs">Nothing here? Start tagging sessions with where you fished (not just the river).</p>
            </HelpHint>
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-[#A8B2BD] cursor-pointer">
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
                className="h-4 w-4 rounded border-[#21262D] text-[#E8923A] focus:ring-[#E8923A]"
              />
              <span>All Locations</span>
            </label>
            {visibleLocations.map(({ location, count }) => (
              <label
                key={location}
                className="flex items-center gap-2 text-sm text-[#A8B2BD] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filterLocations.includes(location)}
                  onChange={() => onFilterChange("locations", location)}
                  className="h-4 w-4 rounded border-[#21262D] text-[#E8923A] focus:ring-[#E8923A]"
                />
                <span>
                  {location} <span className="text-[#A8B2BD]">({count})</span>
                </span>
              </label>
            ))}
            {locationOptions.length > 5 && (
              <button
                onClick={() => setShowAllLocations(!showAllLocations)}
                className="text-xs text-[#E8923A] hover:text-[#E8923A]"
              >
                {showAllLocations
                  ? "Show less"
                  : `Show ${locationOptions.length - 5} more`}
              </button>
            )}
          </div>
        </div>
      )}

      <hr className="border-[#21262D]" />

    </div>
  );
}
