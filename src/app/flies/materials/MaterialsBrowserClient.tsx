"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  Plus,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Material {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  category: string;
  subcategory: string | null;
  sizes: string[] | null;
  colors: string[] | null;
  material_type: string | null;
  weight: string | null;
  finish: string | null;
  description: string | null;
  image_url: string | null;
  vendor_url: string | null;
  popularity: number | null;
}

interface CategoryCount {
  category: string;
  count: number;
}

interface Props {
  initialMaterials: Material[];
  categoryCounts: CategoryCount[];
  totalCount: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  hook: "Hooks",
  bead: "Beads",
  thread: "Thread",
  dubbing: "Dubbing",
  feather: "Feathers",
  flash: "Flash",
  foam: "Foam",
  wire: "Wire",
  chenille: "Chenille",
  body: "Body",
  tail: "Tails",
  wing: "Wings",
  ribbing: "Ribbing",
  synthetic: "Synthetics",
  rubber: "Rubber",
  eye: "Eyes",
  resin: "Resins",
  marker: "Markers",
};

const CATEGORY_COLORS: Record<string, string> = {
  hook: "bg-zinc-600",
  bead: "bg-amber-700",
  thread: "bg-purple-700",
  dubbing: "bg-emerald-700",
  feather: "bg-sky-700",
  flash: "bg-yellow-600",
  foam: "bg-pink-700",
  wire: "bg-orange-700",
  chenille: "bg-teal-700",
  body: "bg-lime-700",
  tail: "bg-indigo-700",
  wing: "bg-cyan-700",
  ribbing: "bg-rose-700",
  synthetic: "bg-violet-700",
  rubber: "bg-red-700",
  eye: "bg-slate-600",
  resin: "bg-blue-700",
  marker: "bg-fuchsia-700",
};

const PAGE_SIZE = 60;

// ─── Component ───────────────────────────────────────────────────────────────

export default function MaterialsBrowserClient({
  initialMaterials,
  categoryCounts,
  totalCount,
}: Props) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialMaterials.length >= PAGE_SIZE);
  const [offset, setOffset] = useState(initialMaterials.length);
  const [userId, setUserId] = useState<string | null>(null);
  const [inventoryIds, setInventoryIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Check auth on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        // Fetch existing inventory
        fetch("/api/materials/inventory")
          .then((r) => r.json())
          .then((data) => {
            if (data.inventory) {
              const ids = new Set<string>(
                data.inventory.map((item: { material_id: string }) => item.material_id)
              );
              setInventoryIds(ids);
            }
          })
          .catch(() => {});
      }
    });
  }, []);

  // Debounced search
  const fetchMaterials = useCallback(
    async (query: string, category: string | null, reset = true) => {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (category) params.set("category", category);
        params.set("limit", String(PAGE_SIZE));
        if (!reset) params.set("offset", String(offset));

        const res = await fetch(`/api/materials/search?${params.toString()}`);
        const data = await res.json();
        const results = Array.isArray(data) ? data : [];

        if (reset) {
          setMaterials(results);
          setOffset(results.length);
        } else {
          setMaterials((prev) => [...prev, ...results]);
          setOffset((prev) => prev + results.length);
        }
        setHasMore(results.length >= PAGE_SIZE);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [offset]
  );

  // When search or category changes, refetch
  useEffect(() => {
    // Skip initial render with no filters
    if (!searchQuery && !activeCategory) {
      setMaterials(initialMaterials);
      setOffset(initialMaterials.length);
      setHasMore(initialMaterials.length >= PAGE_SIZE);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchMaterials(searchQuery, activeCategory, true);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeCategory]);

  const handleLoadMore = () => {
    fetchMaterials(searchQuery, activeCategory, false);
  };

  const handleAddToInventory = async (materialId: string) => {
    setAddingId(materialId);
    try {
      const res = await fetch("/api/materials/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material_id: materialId }),
      });
      if (res.ok) {
        setInventoryIds((prev) => new Set([...prev, materialId]));
      }
    } catch {
      // Silently fail
    } finally {
      setAddingId(null);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
    setExpandedId(null);
  };

  const visibleCount =
    activeCategory && !searchQuery
      ? categoryCounts.find((c) => c.category === activeCategory)?.count ||
        materials.length
      : searchQuery
        ? materials.length
        : totalCount;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* ── Sidebar: Categories ─────────────────────────────────────────── */}
      <aside className="w-full shrink-0 lg:w-64">
        <div className="rounded-lg border border-[#21262D] bg-[#161B22] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#A8B2BD]">
            Categories
          </h2>

          {/* All button */}
          <button
            onClick={() => {
              setActiveCategory(null);
              setExpandedId(null);
            }}
            className={`mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeCategory === null
                ? "bg-[#E8923A]/15 text-[#E8923A]"
                : "text-[#A8B2BD] hover:bg-[#21262D] hover:text-[#F0F6FC]"
            }`}
          >
            <span>All Materials</span>
            <span className="text-xs tabular-nums opacity-70">
              {totalCount}
            </span>
          </button>

          {categoryCounts.map(({ category, count }) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeCategory === category
                  ? "bg-[#E8923A]/15 text-[#E8923A]"
                  : "text-[#A8B2BD] hover:bg-[#21262D] hover:text-[#F0F6FC]"
              }`}
            >
              <span>{CATEGORY_LABELS[category] || category}</span>
              <span className="text-xs tabular-nums opacity-70">{count}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6E7681]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search materials by name or brand..."
            className="w-full rounded-lg border border-[#21262D] bg-[#161B22] py-3 pl-11 pr-10 text-[#F0F6FC] placeholder-[#6E7681] outline-none transition-colors focus:border-[#E8923A]/50 focus:ring-1 focus:ring-[#E8923A]/30"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E7681] hover:text-[#F0F6FC]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Active filter + result count */}
        <div className="mb-4 flex items-center gap-3">
          <p className="text-sm text-[#6E7681]">
            {loading ? (
              "Searching..."
            ) : (
              <>
                Showing{" "}
                <span className="text-[#A8B2BD]">{materials.length}</span>
                {visibleCount > materials.length && (
                  <> of {visibleCount}</>
                )}{" "}
                materials
              </>
            )}
          </p>
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="inline-flex items-center gap-1 rounded-full bg-[#E8923A]/15 px-2.5 py-0.5 text-xs font-medium text-[#E8923A] transition-colors hover:bg-[#E8923A]/25"
            >
              {CATEGORY_LABELS[activeCategory] || activeCategory}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#E8923A]" />
          </div>
        )}

        {/* Empty state */}
        {!loading && materials.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-[#21262D] bg-[#161B22] py-20">
            <Package className="mb-4 h-12 w-12 text-[#6E7681]" />
            <p className="text-lg font-medium text-[#A8B2BD]">
              No materials found
            </p>
            <p className="mt-1 text-sm text-[#6E7681]">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory(null);
              }}
              className="mt-4 text-sm font-medium text-[#E8923A] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Materials grid */}
        {!loading && materials.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {materials.map((mat) => (
              <MaterialCard
                key={mat.id}
                material={mat}
                isExpanded={expandedId === mat.id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === mat.id ? null : mat.id))
                }
                userId={userId}
                isInInventory={inventoryIds.has(mat.id)}
                isAdding={addingId === mat.id}
                onAddToInventory={() => handleAddToInventory(mat.id)}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {!loading && hasMore && materials.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 rounded-lg border border-[#21262D] bg-[#161B22] px-6 py-3 text-sm font-medium text-[#F0F6FC] transition-colors hover:border-[#E8923A]/40 hover:bg-[#1C2128] disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More Materials"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Material Card ─────────────────────────────────────────────────────────

interface MaterialCardProps {
  material: Material;
  isExpanded: boolean;
  onToggle: () => void;
  userId: string | null;
  isInInventory: boolean;
  isAdding: boolean;
  onAddToInventory: () => void;
}

function MaterialCard({
  material,
  isExpanded,
  onToggle,
  userId,
  isInInventory,
  isAdding,
  onAddToInventory,
}: MaterialCardProps) {
  const sizes = material.sizes || [];
  const colors = material.colors || [];
  const previewSizes = sizes.slice(0, 4);
  const previewColors = colors.slice(0, 4);
  const hasMoreSizes = sizes.length > 4;
  const hasMoreColors = colors.length > 4;

  return (
    <div
      className={`group rounded-lg border transition-colors ${
        isExpanded
          ? "border-[#E8923A]/30 bg-[#1C2128]"
          : "border-[#21262D] bg-[#161B22] hover:border-[#30363D]"
      }`}
    >
      {/* Card header — always visible */}
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          {/* Category badge + brand */}
          <div className="mb-1.5 flex items-center gap-2">
            <span
              className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white ${
                CATEGORY_COLORS[material.category] || "bg-gray-600"
              }`}
            >
              {CATEGORY_LABELS[material.category] || material.category}
            </span>
            {material.brand && (
              <span className="truncate text-xs text-[#6E7681]">
                {material.brand}
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="text-sm font-semibold leading-tight text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">
            {material.name}
          </h3>

          {/* Sizes preview */}
          {previewSizes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {previewSizes.map((size) => (
                <span
                  key={size}
                  className="rounded bg-[#21262D] px-1.5 py-0.5 text-[11px] text-[#A8B2BD]"
                >
                  {size}
                </span>
              ))}
              {hasMoreSizes && (
                <span className="px-1 text-[11px] text-[#6E7681]">
                  +{sizes.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Colors preview */}
          {previewColors.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {previewColors.map((color) => (
                <span
                  key={color}
                  className="rounded bg-[#0D1117] px-1.5 py-0.5 text-[11px] text-[#6E7681]"
                >
                  {color}
                </span>
              ))}
              {hasMoreColors && (
                <span className="px-1 text-[11px] text-[#6E7681]">
                  +{colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Expand chevron */}
        <div className="mt-1 shrink-0 text-[#6E7681]">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-[#21262D] px-4 pb-4 pt-3">
          {/* Description */}
          {material.description && (
            <p className="mb-3 text-sm leading-relaxed text-[#A8B2BD]">
              {material.description}
            </p>
          )}

          {/* Detail grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {material.material_type && (
              <div>
                <span className="text-[#6E7681]">Type</span>
                <p className="text-[#F0F6FC]">{material.material_type}</p>
              </div>
            )}
            {material.weight && (
              <div>
                <span className="text-[#6E7681]">Weight</span>
                <p className="text-[#F0F6FC]">{material.weight}</p>
              </div>
            )}
            {material.finish && (
              <div>
                <span className="text-[#6E7681]">Finish</span>
                <p className="text-[#F0F6FC]">{material.finish}</p>
              </div>
            )}
            {material.subcategory && (
              <div>
                <span className="text-[#6E7681]">Subcategory</span>
                <p className="text-[#F0F6FC]">{material.subcategory}</p>
              </div>
            )}
          </div>

          {/* All sizes */}
          {sizes.length > 4 && (
            <div className="mt-3">
              <span className="mb-1 block text-xs font-medium text-[#6E7681]">
                All Sizes ({sizes.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {sizes.map((size) => (
                  <span
                    key={size}
                    className="rounded bg-[#21262D] px-1.5 py-0.5 text-[11px] text-[#A8B2BD]"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* All colors */}
          {colors.length > 4 && (
            <div className="mt-3">
              <span className="mb-1 block text-xs font-medium text-[#6E7681]">
                All Colors ({colors.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {colors.map((color) => (
                  <span
                    key={color}
                    className="rounded bg-[#0D1117] px-1.5 py-0.5 text-[11px] text-[#6E7681]"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex items-center gap-3">
            {userId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isInInventory) onAddToInventory();
                }}
                disabled={isInInventory || isAdding}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  isInInventory
                    ? "bg-emerald-900/30 text-emerald-400 cursor-default"
                    : "bg-[#E8923A]/15 text-[#E8923A] hover:bg-[#E8923A]/25"
                } disabled:opacity-60`}
              >
                {isAdding ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isInInventory ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                {isInInventory ? "In Inventory" : "Add to Inventory"}
              </button>
            )}
            {material.vendor_url && (
              <a
                href={material.vendor_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-[#6E7681] hover:text-[#E8923A] transition-colors"
              >
                View at vendor
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
