"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { CardData, EntityListConfig, ViewMode } from "@/types/list-config";
import ListToolbar from "@/components/ui/ListToolbar";
import CompactCard from "@/components/ui/CompactCard";
import ListCard from "@/components/ui/ListCard";
import MagazineGrid from "@/components/ui/MagazineGrid";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import ArticleCard from "@/components/article/ArticleCard";
import { haystackMatchesQuery, itemMatchesFilters } from "@/lib/browse/match";

const VIEW_STORAGE_KEY = "ea-view-mode";

type BrowseItem = CardData & { _filterValues?: Record<string, string | number> };

interface ArticlesBrowserProps {
  items: BrowseItem[];
  config: EntityListConfig;
  /** Unique key for localStorage (matches EntityListView's scheme). */
  storageKey: string;
}

/**
 * The /articles browse surface: the shared ListToolbar (search, category
 * filter, sort — identical URL-param behavior to EntityListView) over the
 * Patagonia-style story grid. Grid view is four wide on desktop with the
 * ArticleCard hover preview; compact, list, and magazine views keep the
 * existing shared renderers so no browse behavior is lost.
 */
export default function ArticlesBrowser({ items, config, storageKey }: ArticlesBrowserProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // View mode from localStorage (same key scheme as EntityListView)
  const [viewMode, setViewMode] = useState<ViewMode>(config.defaultView);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(`${VIEW_STORAGE_KEY}-${storageKey}`);
    const allowed = config.availableViews ?? ["grid", "compact", "list", "magazine"];
    if (stored && (allowed as string[]).includes(stored)) {
      setViewMode(stored as ViewMode);
    } else if (stored) {
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

  const searchQuery = searchParams.get("q") || "";

  const activeFilters: Record<string, string> = useMemo(() => {
    const filters: Record<string, string> = {};
    config.filters.forEach((dim) => {
      const val = searchParams.get(dim.key);
      if (val) filters[dim.key] = val;
    });
    return filters;
  }, [searchParams, config.filters]);

  const activeSort = searchParams.get("sort") || config.defaultSort;

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

  // Filter items — typo-tolerant text search + shared dimension matching,
  // the same rules EntityListView applies.
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const queryWords = q ? q.split(/\s+/).filter(Boolean) : [];
    return items.filter((item) => {
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
      return itemMatchesFilters(item._filterValues ?? {}, activeFilters, config.filters);
    });
  }, [items, activeFilters, searchQuery, config.filters]);

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
      case "newest": {
        const dv = (item: CardData) => item._filterValues?.publishedAt as string ?? "";
        sorted.sort((a, b) => dv(b).localeCompare(dv(a)));
        break;
      }
      default:
        break;
    }
    return sorted;
  }, [filteredItems, activeSort]);

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
      />

      <div>
        {sortedItems.length === 0 ? (
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
          <MagazineGrid items={sortedItems} />
        ) : displayView === "list" ? (
          <div className="divide-y-0">
            {sortedItems.map((item, i) => (
              <ScrollAnimation key={item.href} index={i}>
                <ListCard {...item} />
              </ScrollAnimation>
            ))}
          </div>
        ) : displayView === "compact" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedItems.map((item, i) => (
              <ScrollAnimation key={item.href} index={i}>
                <CompactCard {...item} />
              </ScrollAnimation>
            ))}
          </div>
        ) : (
          /* Story grid — four wide, the Field Notes layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedItems.map((item, i) => (
              <ScrollAnimation key={item.href} index={i}>
                <ArticleCard {...item} />
              </ScrollAnimation>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
