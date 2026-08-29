"use client";

import { useState, useEffect, useId, type ReactNode } from "react";
import { LayoutGrid, Grid3X3, List, Newspaper, Search, Filter, X } from "@/icons";
import type { FilterDimension, SortOption, ViewMode } from "@/types/list-config";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";

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
  /** Show filters marked `when: "authenticated"`. */
  showOptionalFilters?: boolean;
  /** Extra controls (near me, map) sit in the filter panel. */
  toolbarExtra?: ReactNode;
  /** Page default. Falls back to the first sort option. A non-default
      sort counts as an active filter (badge, Clear, URL auto-open). */
  defaultSort?: string;
  /** Controlled open state. Uncontrolled default: closed, unless the URL
      arrives with an active filter — then the panel starts open so the
      filtering is visible (client ruling 2026-08-28). */
  filtersOpen?: boolean;
  onFiltersOpenChange?: (open: boolean) => void;
}

const viewModes: { mode: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
  { mode: "grid", icon: LayoutGrid, label: "Grid view" },
  { mode: "compact", icon: Grid3X3, label: "Compact view" },
  { mode: "list", icon: List, label: "List view" },
  { mode: "magazine", icon: Newspaper, label: "Magazine view" },
];

function dimensionUi(dimension: FilterDimension): "chips" | "select" | "hidden" {
  if (dimension.ui) return dimension.ui;
  return dimension.options.length > 8 ? "select" : "chips";
}

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
  showOptionalFilters = false,
  toolbarExtra,
  defaultSort,
  filtersOpen: filtersOpenProp,
  onFiltersOpenChange,
}: ListToolbarProps) {
  const filteredViewModes = availableViews
    ? viewModes.filter((v) => availableViews.includes(v.mode))
    : viewModes;

  const visibleFilters = filters.filter((f) => {
    if (f.options.length === 0) return false;
    if (f.ui === "hidden") return false;
    if (f.when === "authenticated" && !showOptionalFilters) return false;
    return true;
  });

  const clearableFilters = filters.filter((f) => {
    if (f.when === "authenticated" && !showOptionalFilters) return false;
    return true;
  });

  const defaultSortValue = defaultSort ?? sortOptions[0]?.value ?? "";
  const hasNonDefaultSort = Boolean(defaultSortValue) && activeSort !== defaultSortValue;
  const activeFilterCount =
    Object.keys(activeFilters).length + (hasNonDefaultSort ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  // Closed on a plain visit; a shared filtered link opens the panel so the
  // active filtering is visible. Initializer reads the first render's URL.
  const [internalOpen, setInternalOpen] = useState(
    () => Object.keys(activeFilters).length > 0 || hasNonDefaultSort,
  );
  const filtersOpen = filtersOpenProp ?? internalOpen;
  const setFiltersOpen = (open: boolean) => {
    onFiltersOpenChange?.(open);
    if (filtersOpenProp === undefined) setInternalOpen(open);
  };

  const searchId = useId();
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
    <div className="sticky top-14 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[var(--paper)] border-b border-[var(--border)] mb-8">
      {onSearchChange && (
        <div className="relative mb-3">
          <label htmlFor={searchId} className="sr-only">
            {searchPlaceholder ?? "Filter results"}
          </label>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-3)]" aria-hidden />
          <input
            id={searchId}
            type="search"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={searchPlaceholder ?? "Search..."}
            className={`ea-focus-ring ${FOCUS_VISIBLE} w-full rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] pl-9 pr-9 py-2 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] outline-none`}
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className={`ea-focus-ring ${FOCUS_VISIBLE} absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-meta)] hover:text-[var(--text-body)] transition-colors`}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="browse-filter-panel"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`ea-btn ea-btn-secondary ea-btn-sm ea-focus-ring ${FOCUS_VISIBLE}`}
          >
            <Filter className="h-4 w-4" aria-hidden />
            Filters
            {hasActiveFilters && (
              <span className="num rounded-[var(--radius-pill)] bg-[var(--accent-soft)] px-2 py-1 text-xs font-medium leading-none text-[var(--accent)]">
                {activeFilterCount}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                clearableFilters.forEach((f) => onFilterChange(f.key, null));
                if (hasNonDefaultSort && defaultSortValue) {
                  onSortChange(defaultSortValue);
                }
              }}
              className={`ea-focus-ring ${FOCUS_VISIBLE} px-2 py-1.5 text-sm text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors`}
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden text-xs text-[var(--text-3)] sm:inline" aria-live="polite">
            {filteredCount === totalCount
              ? `${totalCount} results`
              : `${filteredCount} of ${totalCount}`}
          </span>

          <div
            className="ea-segmented"
            role="group"
            aria-label="View density"
          >
            {filteredViewModes.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewChange(mode)}
                aria-label={label}
                aria-pressed={viewMode === mode}
                title={label}
                className={`ea-focus-ring ${FOCUS_VISIBLE} ea-segment ea-segment-icon`}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        id="browse-filter-panel"
        className="ea-filter-panel"
        data-open={filtersOpen}
      >
        <div>
          <div className="mt-3 pt-3 pb-1 border-t border-[var(--border)] flex flex-col gap-3">
            {sortOptions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="browse-sort" className="ea-overline w-20 shrink-0">
                  Sort
                </label>
                <select
                  id="browse-sort"
                  value={activeSort}
                  onChange={(e) => onSortChange(e.target.value)}
                  className={`ea-focus-ring ${FOCUS_VISIBLE} appearance-none rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] pl-3 pr-8 py-1.5 text-sm text-[var(--text-2)] hover:border-[var(--border-strong)] outline-none cursor-pointer`}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {visibleFilters.map((dimension) => {
              const ui = dimensionUi(dimension);
              return (
                <div key={dimension.key} className="flex flex-wrap items-center gap-2">
                  <span className="ea-overline w-20 shrink-0">
                    {dimension.label}
                  </span>
                  {ui === "select" ? (
                    <select
                      aria-label={dimension.label}
                      value={activeFilters[dimension.key] ?? ""}
                      onChange={(e) =>
                        onFilterChange(dimension.key, e.target.value || null)
                      }
                      className={`ea-focus-ring ${FOCUS_VISIBLE} min-w-[10rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-1)] outline-none`}
                    >
                      <option value="">All</option>
                      {dimension.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onFilterChange(dimension.key, null)}
                        className={`ea-focus-ring ${FOCUS_VISIBLE} whitespace-nowrap rounded-chip px-3 py-1.5 text-sm font-medium transition-colors ${
                          !activeFilters[dimension.key]
                            ? "bg-[var(--accent)] text-[var(--on-action)]"
                            : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--border-strong)] hover:text-[var(--text-1)]"
                        }`}
                      >
                        All
                      </button>
                      {dimension.options.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            onFilterChange(
                              dimension.key,
                              activeFilters[dimension.key] === opt.value ? null : opt.value,
                            )
                          }
                          className={`ea-focus-ring ${FOCUS_VISIBLE} whitespace-nowrap rounded-chip px-3 py-1.5 text-sm font-medium transition-colors ${
                            activeFilters[dimension.key] === opt.value
                              ? "bg-[var(--accent)] text-[var(--on-action)]"
                              : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--border-strong)] hover:text-[var(--text-1)]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
            {toolbarExtra}
          </div>
        </div>
      </div>
    </div>
  );
}
