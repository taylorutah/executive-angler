"use client";

import { LayoutGrid, Grid3X3, List, Newspaper, ChevronDown } from "lucide-react";
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
}: ListToolbarProps) {
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="sticky top-20 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[#0D1117]/95 backdrop-blur-sm border-b border-[#21262D]/60 mb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide min-w-0 flex-1">
          {filters.map((dimension) => (
            <div key={dimension.key} className="flex items-center gap-1.5 shrink-0">
              {dimension.options.length > 0 && (
                <>
                  <span className="text-xs text-[#6E7681] uppercase tracking-wider font-medium mr-0.5 hidden lg:inline">
                    {dimension.label}
                  </span>
                  <button
                    onClick={() => onFilterChange(dimension.key, null)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      !activeFilters[dimension.key]
                        ? "bg-[#E8923A] text-white shadow-sm"
                        : "bg-[#161B22] text-[#A8B2BD] hover:bg-[#E8923A]/10 hover:text-[#E8923A] border border-[#21262D]"
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
                          ? "bg-[#E8923A] text-white shadow-sm"
                          : "bg-[#161B22] text-[#A8B2BD] hover:bg-[#E8923A]/10 hover:text-[#E8923A] border border-[#21262D]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  {/* Separator between filter groups */}
                  {filters.length > 1 && dimension.key !== filters[filters.length - 1].key && (
                    <div className="w-px h-5 bg-[#21262D] mx-1 shrink-0" />
                  )}
                </>
              )}
            </div>
          ))}

          {hasActiveFilters && (
            <>
              <div className="w-px h-5 bg-[#21262D] mx-1 shrink-0" />
              <button
                onClick={() => {
                  filters.forEach((f) => onFilterChange(f.key, null));
                }}
                className="px-3 py-1.5 rounded-full text-sm font-medium text-[#6E7681] hover:text-[#A8B2BD] transition-colors whitespace-nowrap"
              >
                Clear all
              </button>
            </>
          )}
        </div>

        {/* Right: View toggle + Sort */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Result count */}
          <span className="text-xs text-[#6E7681] hidden sm:inline">
            {filteredCount === totalCount
              ? `${totalCount} results`
              : `${filteredCount} of ${totalCount}`}
          </span>

          {/* View mode toggle */}
          <div className="flex items-center gap-0.5 border border-[#21262D] rounded-lg p-0.5 bg-[#161B22]">
            {viewModes.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => onViewChange(mode)}
                aria-label={label}
                title={label}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === mode
                    ? "bg-[#E8923A]/10 text-[#E8923A]"
                    : "text-[#6E7681] hover:text-[#A8B2BD]"
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
              className="appearance-none bg-[#161B22] border border-[#21262D] rounded-lg pl-3 pr-8 py-1.5 text-sm text-[#A8B2BD] hover:border-[#E8923A]/30 focus:outline-none focus:ring-2 focus:ring-[#E8923A]/20 focus:border-[#E8923A] cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6E7681] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
