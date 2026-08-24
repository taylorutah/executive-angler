"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, Grid3X3, List, Newspaper, Search, X } from "lucide-react";
import type { FilterDimension, SortOption, ViewMode } from "@/types/list-config";

interface ListToolbarProps {
  filters: FilterDimension[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string | null) => void;
  sortOptions: SortOption[];
  activeSort: string;
  onSortChange: (value: string) => void;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  totalCount: number;
  filteredCount: number;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Restrict which view modes are shown (defaults to all) */
  availableViews?: ViewMode[];
}

const viewModes: { mode: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
  { mode: "grid", icon: LayoutGrid, label: "Grid view" },
  { mode: "compact", icon: Grid3X3, label: "Compact view" },
  { mode: "list", icon: List, label: "List view" },
  { mode: "magazine", icon: Newspaper, label: "Magazine view" },
];

export default function ListToolbar({
  filters,
  activeFilters,
  onFilterChange,
  sortOptions,
  activeSort,
  onSortChange,
  viewMode,
  onViewChange,
  totalCount,
  filteredCount,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder,
  availableViews,
}: ListToolbarProps) {
  // Filter view modes based on availableViews prop
  const filteredViewModes = availableViews
    ? viewModes.filter((v) => availableViews.includes(v.mode))
    : viewModes;
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  // Debounced local search state
  const [localSearch, setLocalSearch] = useState(searchQuery);
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);
  useEffect(() => {
    if (localSearch === searchQuery) return;
    const timer = setTimeout(() => {
      onSearchChange?.(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="sticky top-14 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[var(--surface-page)] border-b border-[var(--border-rule)]/60 mb-8">
      {/* Search bar */}
      {onSearchChange && (
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-meta)]" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={searchPlaceholder ?? "Search..."}
            className="w-full bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-lg pl-9 pr-9 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-meta)] focus:outline-none focus:ring-2 focus:ring-[var(--action)]/20 focus:border-[var(--action)] transition-colors"
          />
          {localSearch && (
            <button
              onClick={() => { setLocalSearch(""); onSearchChange(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-meta)] hover:text-[var(--text-body)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide min-w-0 flex-1">
          {filters.map((dimension) => (
            <div key={dimension.key} className="flex items-center gap-1.5 shrink-0">
              {dimension.options.length > 0 && (
                <>
                  <span className="text-xs text-[var(--text-meta)] uppercase tracking-wider font-medium mr-0.5 hidden lg:inline">
                    {dimension.label}
                  </span>
                  <button
                    onClick={() => onFilterChange(dimension.key, null)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      !activeFilters[dimension.key]
                        ? "bg-[var(--action)] text-white shadow-sm"
                        : "bg-[var(--surface-raised)] text-[var(--text-body)] hover:bg-[var(--action)]/10 hover:text-[var(--action)] border border-[var(--border-rule)]"
                    }`}
                  >
                    All
                  </button>
                  {dimension.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        onFilterChange(
                          dimension.key,
                          activeFilters[dimension.key] === opt.value ? null : opt.value
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                        activeFilters[dimension.key] === opt.value
                          ? "bg-[var(--action)] text-white shadow-sm"
                          : "bg-[var(--surface-raised)] text-[var(--text-body)] hover:bg-[var(--action)]/10 hover:text-[var(--action)] border border-[var(--border-rule)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  {/* Separator between filter groups */}
                  {filters.length > 1 && dimension.key !== filters[filters.length - 1].key && (
                    <div className="w-px h-5 bg-[var(--border-rule)] mx-1 shrink-0" />
                  )}
                </>
              )}
            </div>
          ))}

          {hasActiveFilters && (
            <>
              <div className="w-px h-5 bg-[var(--border-rule)] mx-1 shrink-0" />
              <button
                onClick={() => {
                  filters.forEach((f) => onFilterChange(f.key, null));
                }}
                className="px-3 py-1.5 rounded-full text-sm font-medium text-[var(--text-meta)] hover:text-[var(--text-body)] transition-colors whitespace-nowrap"
              >
                Clear all
              </button>
            </>
          )}
        </div>

        {/* Right: View toggle + Sort */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Result count */}
          <span className="text-xs text-[var(--text-meta)] hidden sm:inline">
            {filteredCount === totalCount
              ? `${totalCount} results`
              : `${filteredCount} of ${totalCount}`}
          </span>

          {/* View mode toggle */}
          <div className="flex items-center gap-0.5 border border-[var(--border-rule)] rounded-lg p-0.5 bg-[var(--surface-raised)]">
            {filteredViewModes.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => onViewChange(mode)}
                aria-label={label}
                title={label}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === mode
                    ? "bg-[var(--action)]/10 text-[var(--action)]"
                    : "text-[var(--text-meta)] hover:text-[var(--text-body)]"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={activeSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-lg pl-3 pr-8 py-1.5 text-sm text-[var(--text-body)] hover:border-[var(--action)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--action)]/20 focus:border-[var(--action)] cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
