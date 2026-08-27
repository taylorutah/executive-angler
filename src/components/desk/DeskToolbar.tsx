"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";
import type { FilterDimension, SortOption, ViewMode } from "@/types/list-config";

interface Props {
  filters: FilterDimension[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string | null) => void;
  sortOptions: SortOption[];
  activeSort: string;
  onSortChange: (value: string) => void;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showOptionalFilters?: boolean;
  toolbarExtra?: ReactNode;
  refineOpen: boolean;
  onRefineOpenChange: (open: boolean) => void;
  onClearAll?: () => void;
}

function dimensionUi(dimension: FilterDimension): "chips" | "select" | "hidden" {
  if (dimension.ui) return dimension.ui;
  return dimension.options.length > 8 ? "select" : "chips";
}

/** Pictures | List + Refine. Filters live in the drawer. The index stays pictures. */
export default function DeskToolbar({
  filters,
  activeFilters,
  onFilterChange,
  sortOptions,
  activeSort,
  onSortChange,
  viewMode,
  onViewChange,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder,
  showOptionalFilters = false,
  toolbarExtra,
  refineOpen,
  onRefineOpenChange,
  onClearAll,
}: Props) {
  const pictures = viewMode !== "list";
  const searchId = useId();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (localSearch === searchQuery) return;
    const timer = setTimeout(() => onSearchChange?.(localSearch), 300);
    return () => clearTimeout(timer);
  }, [localSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleFilters = filters.filter((f) => {
    if (f.options.length === 0) return false;
    if (f.ui === "hidden") return false;
    if (f.when === "authenticated" && !showOptionalFilters) return false;
    return true;
  });

  const hasActive = Object.keys(activeFilters).length > 0;

  return (
    <>
      <div className="mb-8 flex h-10 items-center justify-between">
        <div
          className="flex overflow-hidden rounded-[2px] border border-[var(--border-rule)]"
          role="group"
          aria-label="View density"
        >
          <button
            type="button"
            aria-pressed={pictures}
            onClick={() => onViewChange("magazine")}
            className={`ea-focus-ring px-3.5 py-2 font-ui text-[12px] ${
              pictures
                ? "bg-[var(--text-primary)] font-medium text-[var(--hero-type)]"
                : "bg-[var(--surface-page)] text-[var(--text-body)]"
            }`}
          >
            Pictures
          </button>
          <button
            type="button"
            aria-pressed={!pictures}
            onClick={() => onViewChange("list")}
            className={`ea-focus-ring px-3.5 py-2 font-ui text-[12px] ${
              !pictures
                ? "bg-[var(--text-primary)] font-medium text-[var(--hero-type)]"
                : "bg-[var(--surface-page)] text-[var(--text-body)]"
            }`}
          >
            List
          </button>
        </div>

        <button
          type="button"
          aria-expanded={refineOpen}
          aria-controls="desk-refine"
          onClick={() => onRefineOpenChange(!refineOpen)}
          className="ea-focus-ring rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-page)] px-[18px] py-2 font-ui text-[13px] font-medium text-[var(--text-primary)]"
        >
          Refine{hasActive ? ` · ${Object.keys(activeFilters).length}` : ""}
        </button>
      </div>

      {refineOpen && (
        <div
          id="desk-refine"
          className="fixed inset-0 z-50 flex justify-end bg-[rgb(11_17_18/0.32)]"
          onClick={() => onRefineOpenChange(false)}
        >
          <aside
            className="flex h-full w-full max-w-[400px] flex-col overflow-y-auto border-l border-[var(--border-rule)] bg-[var(--surface-page)] px-6 py-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  className="font-heading text-[28px] font-semibold text-[var(--text-primary)]"
                  style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
                >
                  Refine
                </h2>
                <p className="mt-2 font-ui text-[13px] leading-5 text-[var(--text-body)]">
                  Map and filters live here. The index stays pictures.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRefineOpenChange(false)}
                className="ea-focus-ring font-ui text-[13px] text-[var(--text-body)]"
              >
                Close
              </button>
            </div>

            {onSearchChange && (
              <div className="mb-5">
                <label htmlFor={searchId} className="sr-only">
                  {searchPlaceholder ?? "Search"}
                </label>
                <input
                  id={searchId}
                  type="search"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder={searchPlaceholder ?? "Search"}
                  className={`ea-focus-ring ${FOCUS_VISIBLE} w-full rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-card)] px-3 py-2 font-ui text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-meta)]`}
                />
              </div>
            )}

            <div className="mb-5">
              <label htmlFor="desk-sort" className="mb-2 block font-ui text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-meta)]">
                Sort
              </label>
              <select
                id="desk-sort"
                value={activeSort}
                onChange={(e) => onSortChange(e.target.value)}
                className={`ea-focus-ring ${FOCUS_VISIBLE} w-full rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-card)] px-3 py-2 font-ui text-[14px] text-[var(--text-primary)]`}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {visibleFilters.map((dimension) => {
              const ui = dimensionUi(dimension);
              return (
                <div key={dimension.key} className="mb-5">
                  <p className="mb-2 font-ui text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-meta)]">
                    {dimension.label}
                  </p>
                  {ui === "select" ? (
                    <select
                      aria-label={dimension.label}
                      value={activeFilters[dimension.key] ?? ""}
                      onChange={(e) => onFilterChange(dimension.key, e.target.value || null)}
                      className={`ea-focus-ring ${FOCUS_VISIBLE} w-full rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-card)] px-3 py-2 font-ui text-[14px]`}
                    >
                      <option value="">All</option>
                      {dimension.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onFilterChange(dimension.key, null)}
                        className={`ea-focus-ring rounded-[2px] px-3 py-1.5 font-ui text-[13px] ${
                          !activeFilters[dimension.key]
                            ? "bg-[var(--text-primary)] text-[var(--hero-type,#F4EFE6)]"
                            : "border border-[var(--border-rule)] text-[var(--text-body)]"
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
                          className={`ea-focus-ring rounded-[2px] px-3 py-1.5 font-ui text-[13px] ${
                            activeFilters[dimension.key] === opt.value
                              ? "bg-[var(--text-primary)] text-[var(--hero-type,#F4EFE6)]"
                              : "border border-[var(--border-rule)] text-[var(--text-body)]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {toolbarExtra}

            {hasActive && (
              <button
                type="button"
                onClick={() => {
                  if (onClearAll) {
                    onClearAll();
                  } else {
                    visibleFilters.forEach((f) => onFilterChange(f.key, null));
                    onSearchChange?.("");
                  }
                  setLocalSearch("");
                }}
                className="mt-2 font-ui text-[13px] font-medium text-[var(--action)]"
              >
                Clear
              </button>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
