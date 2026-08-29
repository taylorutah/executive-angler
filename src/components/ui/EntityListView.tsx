"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { CardData, EntityListConfig, ViewMode } from "@/types/list-config";
import ListToolbar from "./ListToolbar";
import EntityCard from "./EntityCard";
import CompactCard from "./CompactCard";
import ListCard from "./ListCard";
import MagazineGrid from "./MagazineGrid";
import ScrollAnimation from "./ScrollAnimation";
import { itemMatchesFilters } from "@/lib/browse/match";

const VIEW_STORAGE_KEY = "ea-view-mode";

export type BrowseCard = CardData & {
  _filterValues?: Record<string, string | number>;
  _sortDistance?: number;
};

interface EntityListViewProps {
  items: CardData[];
  config: EntityListConfig;
  /** Unique key for localStorage (e.g., "destinations", "rivers") */
  storageKey: string;
  /** Overlay live values (flow, canTie, near) keyed by href. */
  liveValues?: Record<string, Record<string, string>>;
  showOptionalFilters?: boolean;
  toolbarExtra?: ReactNode;
  filtersOpen?: boolean;
  onFiltersOpenChange?: (open: boolean) => void;
  /** When set, replace the card grid (e.g. river map). */
  resultsOverride?: ReactNode;
  /** Origin Water Desk leftover pages pass this; unused on the token-system list. */
  deskLayout?: string;
}

export default function EntityListView({
  items,
  config,
  storageKey,
  liveValues,
  showOptionalFilters = false,
  toolbarExtra,
  filtersOpen,
  onFiltersOpenChange,
  resultsOverride,
}: EntityListViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // View mode from localStorage
  const [viewMode, setViewMode] = useState<ViewMode>(config.defaultView);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(`${VIEW_STORAGE_KEY}-${storageKey}`);
    const allowed = config.availableViews ?? ["grid", "compact", "list", "magazine"];
    if (stored && (allowed as string[]).includes(stored)) {
      setViewMode(stored as ViewMode);
    } else if (stored && !(allowed as string[]).includes(stored)) {
      // Stored view not allowed — reset to default
      setViewMode(config.defaultView);
    }
  }, [storageKey, config.availableViews, config.defaultView]);

  const handleViewChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      localStorage.setItem(`${VIEW_STORAGE_KEY}-${storageKey}`, mode);
    },
    [storageKey]
  );

  // Search query from URL params
  const searchQuery = searchParams.get("q") || "";

  // Active filters from URL params
  const activeFilters: Record<string, string> = useMemo(() => {
    const filters: Record<string, string> = {};
    config.filters.forEach((dim) => {
      const val = searchParams.get(dim.key);
      if (val) filters[dim.key] = val;
    });
    return filters;
  }, [searchParams, config.filters]);

  // Active sort from URL params
  const activeSort = searchParams.get("sort") || config.defaultSort;

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const str = params.toString();
      router.replace(`${pathname}${str ? `?${str}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      updateParams({ q: value || null });
    },
    [updateParams]
  );

  const handleFilterChange = useCallback(
    (key: string, value: string | null) => {
      updateParams({ [key]: value });
    },
    [updateParams]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      updateParams({ sort: value === config.defaultSort ? null : value });
    },
    [updateParams, config.defaultSort]
  );

  const [visibleCount, setVisibleCount] = useState(config.pageSize ?? items.length);

  useEffect(() => {
    setVisibleCount(config.pageSize ?? items.length);
  }, [searchQuery, activeFilters, activeSort, config.pageSize, items.length]);

  // Filter items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const queryWords = q ? q.split(/\s+/).filter(Boolean) : [];
    return items.filter((item) => {
      // Text search — typo-tolerant. Each query word must match somewhere
      // in the haystack as a substring OR (length >= 4) within edit
      // distance 1 of any whitespace token. Handles "wolly" → "Woolly".
      if (queryWords.length > 0) {
        const haystack = [
          item.title,
          item.subtitle,
          item.description,
          item.meta,
          ...(item.badges || []),
          ...(item.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystackMatchesQuery(haystack, queryWords)) return false;
      }

      const base = (item as BrowseCard)._filterValues ?? {};
      const live = liveValues?.[item.href] ?? {};
      return itemMatchesFilters({ ...base, ...live }, activeFilters, config.filters);
    });
  }, [items, activeFilters, searchQuery, liveValues, config.filters]);

  // Sort items
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];
    switch (activeSort) {
      case "name-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "featured":
        sorted.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.title.localeCompare(b.title);
        });
        break;
      case "price-asc": {
        const pv = (item: CardData) =>
          ((item as CardData & { _filterValues?: Record<string, string | number> })._filterValues?.price as number) ?? 0;
        sorted.sort((a, b) => pv(a) - pv(b) || a.title.localeCompare(b.title));
        break;
      }
      case "price-desc": {
        const pvd = (item: CardData) =>
          ((item as CardData & { _filterValues?: Record<string, string | number> })._filterValues?.price as number) ?? 0;
        sorted.sort((a, b) => pvd(b) - pvd(a) || a.title.localeCompare(b.title));
        break;
      }
      case "experience-desc": {
        const ev = (item: CardData) =>
          ((item as CardData & { _filterValues?: Record<string, string | number> })._filterValues?.experience as number) ?? 0;
        sorted.sort((a, b) => ev(b) - ev(a) || a.title.localeCompare(b.title));
        break;
      }
      case "newest": {
        const dv = (item: CardData) =>
          ((item as BrowseCard)._filterValues?.publishedAt as string) ?? "";
        sorted.sort((a, b) => dv(b).localeCompare(dv(a)));
        break;
      }
      case "distance": {
        sorted.sort((a, b) => {
          const da = (a as BrowseCard)._sortDistance;
          const db = (b as BrowseCard)._sortDistance;
          if (da == null && db == null) return a.title.localeCompare(b.title);
          if (da == null) return 1;
          if (db == null) return -1;
          return da - db;
        });
        break;
      }
      default:
        break;
    }
    return sorted;
  }, [filteredItems, activeSort]);

  const pageSize = config.pageSize;
  const visibleItems =
    pageSize && !resultsOverride ? sortedItems.slice(0, visibleCount) : sortedItems;
  const canLoadMore = Boolean(pageSize && !resultsOverride && visibleCount < sortedItems.length);

  // Use defaultView on server, real viewMode only after mount
  const displayView = mounted ? viewMode : config.defaultView;

  return (
    <>
      <ListToolbar
        filters={config.filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        sortOptions={config.sortOptions}
        activeSort={activeSort}
        onSortChange={handleSortChange}
        viewMode={displayView}
        onViewChange={handleViewChange}
        totalCount={items.length}
        filteredCount={sortedItems.length}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder={config.searchPlaceholder}
        availableViews={config.availableViews}
        showOptionalFilters={showOptionalFilters}
        toolbarExtra={toolbarExtra}
        filtersOpen={filtersOpen}
        onFiltersOpenChange={onFiltersOpenChange}
      />

      <div>
        {resultsOverride ? (
          resultsOverride
        ) : sortedItems.length === 0 ? (
            <div className="ea-empty">
              <p>
                {searchQuery ? "No results match your search." : "No results match your filters."}
              </p>
              <button
                type="button"
                onClick={() => {
                  config.filters.forEach((f) => handleFilterChange(f.key, null));
                  handleSearchChange("");
                }}
                className="ea-btn ea-btn-secondary"
              >
                Clear all filters
              </button>
            </div>
          ) : displayView === "magazine" ? (
            <MagazineGrid items={visibleItems} />
          ) : displayView === "list" ? (
            <div className="divide-y-0">
              {visibleItems.map((item, i) => (
                <ScrollAnimation key={item.href} index={i}>
                  <ListCard {...item} />
                </ScrollAnimation>
              ))}
            </div>
          ) : displayView === "compact" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleItems.map((item, i) => (
                <ScrollAnimation key={item.href} index={i}>
                  <CompactCard {...item} />
                </ScrollAnimation>
              ))}
            </div>
          ) : (
            /* Grid view (default) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleItems.map((item, i) => (
                <ScrollAnimation key={item.href} index={i}>
                  <EntityCard
                    href={item.href}
                    imageUrl={item.imageUrl}
                    imageAlt={item.imageAlt}
                    title={item.title}
                    subtitle={item.subtitle}
                    meta={item.meta}
                    badges={item.badges}
                    iconOnly={item.iconOnly}
                    imageContain={item.imageContain}
                    imageZoom={(item as { imageZoom?: number }).imageZoom}
                    actionSlot={item.actionSlot}
                  />
                </ScrollAnimation>
              ))}
            </div>
          )}
      </div>

      {canLoadMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((n) => n + (pageSize ?? 24))}
            className="ea-btn ea-btn-secondary"
          >
            Load more
            <span className="num text-[var(--text-3)]">
              {sortedItems.length - visibleCount} left
            </span>
          </button>
        </div>
      )}
    </>
  );
}

/**
 * Edit distance ≤ 1 check (insert/delete/substitute one character). Linear
 * time, no DP. Used for typo-tolerant search ("wolly" matches "woolly").
 */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a === b) return true;
  if (a.length > b.length) {
    const tmp = a;
    a = b;
    b = tmp;
  }
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length === b.length) {
      i++;
      j++;
    } else {
      j++;
    }
  }
  return true;
}

function haystackMatchesQuery(haystack: string, queryWords: string[]): boolean {
  // Tokenize haystack once for fuzzy comparisons.
  const tokens = haystack.split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
  for (const q of queryWords) {
    if (haystack.includes(q)) continue;
    if (q.length >= 4 && tokens.some((t) => withinOneEdit(t, q))) continue;
    return false;
  }
  return true;
}
