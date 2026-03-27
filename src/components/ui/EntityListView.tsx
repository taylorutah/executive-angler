"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { CardData, EntityListConfig, ViewMode } from "@/types/list-config";
import ListToolbar from "./ListToolbar";
import EntityCard from "./EntityCard";
import CompactCard from "./CompactCard";
import ListCard from "./ListCard";
import MagazineGrid from "./MagazineGrid";
import Link from "next/link";

const VIEW_STORAGE_KEY = "ea-view-mode";

interface EntityListViewProps {
  items: CardData[];
  config: EntityListConfig;
  /** Unique key for localStorage (e.g., "destinations", "rivers") */
  storageKey: string;
}

export default function EntityListView({ items, config, storageKey }: EntityListViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // View mode from localStorage
  const [viewMode, setViewMode] = useState<ViewMode>(config.defaultView);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(`${VIEW_STORAGE_KEY}-${storageKey}`);
    if (stored && ["grid", "compact", "list", "magazine"].includes(stored)) {
      setViewMode(stored as ViewMode);
    }
  }, [storageKey]);

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

  // Filter items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      // Text search
      if (q) {
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
        if (!haystack.includes(q)) return false;
      }

      // Each CardData item has a _filterValues map injected by the page
      const filterVals = (item as CardData & { _filterValues?: Record<string, string | number> })._filterValues;
      if (!filterVals) return true;

      for (const [key, activeVal] of Object.entries(activeFilters)) {
        const itemVal = filterVals[key];
        if (itemVal === undefined) return false;
        if (String(itemVal) !== activeVal) return false;
      }
      return true;
    });
  }, [items, activeFilters, searchQuery]);

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
          ((item as CardData & { _filterValues?: Record<string, string | number> })._filterValues?.publishedAt as string) ?? "";
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
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${displayView}-${JSON.stringify(activeFilters)}-${activeSort}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {sortedItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#A8B2BD] text-lg">
                {searchQuery ? "No results match your search." : "No results match your filters."}
              </p>
              <button
                onClick={() => {
                  config.filters.forEach((f) => handleFilterChange(f.key, null));
                  handleSearchChange("");
                }}
                className="mt-4 inline-block text-[#E8923A] font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : displayView === "magazine" ? (
            <MagazineGrid items={sortedItems} />
          ) : displayView === "list" ? (
            <div className="divide-y-0">
              {sortedItems.map((item) => (
                <ListCard key={item.href} {...item} />
              ))}
            </div>
          ) : displayView === "compact" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedItems.map((item) => (
                <CompactCard key={item.href} {...item} />
              ))}
            </div>
          ) : (
            /* Grid view (default) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedItems.map((item) => (
                <EntityCard
                  key={item.href}
                  href={item.href}
                  imageUrl={item.imageUrl || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80"}
                  imageAlt={item.imageAlt}
                  title={item.title}
                  subtitle={item.subtitle}
                  meta={item.meta}
                  badges={item.badges}
                  iconOnly={item.iconOnly}
                  imageContain={item.imageContain}
                  imageZoom={(item as { imageZoom?: number }).imageZoom}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
