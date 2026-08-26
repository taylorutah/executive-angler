"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
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
} from "@/icons";
import { createClient } from "@/lib/supabase/client";
import { SubmitMaterialForm } from "@/components/flies/SubmitMaterialForm";
import { Button } from "@/components/ui/Button";

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
  isAuthenticated: boolean;
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

const PAGE_SIZE = 60;

// ─── Component ───────────────────────────────────────────────────────────────

export default function MaterialsBrowserClient({
  initialMaterials,
  categoryCounts,
  totalCount,
  isAuthenticated,
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
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

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

  // Debounced search with race-condition protection via request id + AbortController.
  // During an active search we DON'T wipe the grid — previous results stay visible
  // (slightly faded) and swap in when the new ones arrive. Spinner lives inside the
  // search input so there's no jarring center-of-page replacement.
  const fetchMaterials = useCallback(
    async (query: string, category: string | null, reset = true) => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const myRequestId = ++requestIdRef.current;

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

        const res = await fetch(`/api/materials/search?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        const results = Array.isArray(data) ? data : [];

        // Drop results if a newer request has started since
        if (myRequestId !== requestIdRef.current) return;

        if (reset) {
          setMaterials(results);
          setOffset(results.length);
        } else {
          setMaterials((prev) => [...prev, ...results]);
          setOffset((prev) => prev + results.length);
        }
        setHasMore(results.length >= PAGE_SIZE);
      } catch (err) {
        // AbortError is expected when a newer keystroke fires — ignore silently
        if ((err as { name?: string })?.name === "AbortError") return;
      } finally {
        if (myRequestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [offset]
  );

  // When search or category changes, refetch (debounced 150ms for snappier feel)
  useEffect(() => {
    // Empty filters — show server-rendered initial set, no fetch needed
    if (!searchQuery && !activeCategory) {
      abortRef.current?.abort();
      setMaterials(initialMaterials);
      setOffset(initialMaterials.length);
      setHasMore(initialMaterials.length >= PAGE_SIZE);
      setLoading(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchMaterials(searchQuery, activeCategory, true);
    }, 150);

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
        <div className="rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-body)]">
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
                ? "bg-[var(--action)]/15 text-[var(--action)]"
                : "text-[var(--text-body)] hover:bg-[var(--border-rule)] hover:text-[var(--text-primary)]"
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
                  ? "bg-[var(--action)]/15 text-[var(--action)]"
                  : "text-[var(--text-body)] hover:bg-[var(--border-rule)] hover:text-[var(--text-primary)]"
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
        {/* Submit Material button row */}
        <div className="mb-4 flex items-center justify-end gap-2">
          {isAuthenticated ? (
            <Button
              variant="solid"
              size="sm"
              icon={Plus}
             
              onClick={() => setSubmitModalOpen(true)}
              title="Submit a new material to the community catalog"
            >
              Submit Material
            </Button>
          ) : (
            <Button variant="outline" size="sm" icon={Plus} href="/login?next=/flies/materials">
              Sign in to Submit
            </Button>
          )}
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-meta)]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && searchQuery) handleClearSearch();
            }}
            placeholder="Search by name, brand, or color — results appear as you type"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] py-3 pl-11 pr-10 text-[var(--text-primary)] placeholder-[#6E7681] outline-none transition-colors focus:border-[var(--action)]/50 focus:ring-1 focus:ring-[var(--action)]/30"
          />
          {/* Right side: spinner while searching, X when idle with a query */}
          {loading && (searchQuery || activeCategory) ? (
            <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--action)]" />
          ) : searchQuery ? (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-meta)] hover:text-[var(--text-primary)]"
              title="Clear (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Active filter + result count (grid stays visible; spinner lives in search input) */}
        <div className="mb-4 flex items-center gap-3">
          <p className="text-sm text-[var(--text-meta)]">
            Showing{" "}
            <span className="text-[var(--text-body)]">{materials.length}</span>
            {visibleCount > materials.length && <> of {visibleCount}</>}{" "}
            materials
            {searchQuery && (
              <>
                {" "}for <span className="text-[var(--text-primary)]">“{searchQuery}”</span>
              </>
            )}
          </p>
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--action)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--action)] transition-colors hover:bg-[var(--action)]/25"
            >
              {CATEGORY_LABELS[activeCategory] || activeCategory}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Empty state — only when we finished loading AND have no results */}
        {!loading && materials.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] py-20">
            <Package className="mb-4 h-12 w-12 text-[var(--text-meta)]" />
            <p className="text-lg font-medium text-[var(--text-body)]">
              No materials found
            </p>
            <p className="mt-1 text-sm text-[var(--text-meta)]">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory(null);
              }}
              className="mt-4 text-sm font-medium text-[var(--action)] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Materials grid — stays mounted during search, just fades slightly */}
        {materials.length > 0 && (
          <div
            className={`grid gap-3 transition-opacity duration-150 sm:grid-cols-2 xl:grid-cols-3 ${
              loading ? "opacity-50" : "opacity-100"
            }`}
          >
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
            <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore} loading={loadingMore}>
              {loadingMore ? "Loading..." : "Load More Materials"}
            </Button>
          </div>
        )}
      </div>

      {/* Submit Material modal */}
      {submitModalOpen && isAuthenticated && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-16 sm:pt-24"
          onClick={() => setSubmitModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-xl border border-[var(--border-rule)] bg-[var(--surface-raised)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSubmitModalOpen(false)}
              className="absolute right-4 top-4 text-[var(--text-meta)] hover:text-[var(--text-primary)]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                Submit a New Material
              </h2>
              <p className="mt-1 text-sm text-[var(--text-body)]">
                Add a material that&apos;s missing from the catalog. Submissions are
                reviewed before appearing in search.
              </p>
            </div>

            <SubmitMaterialForm
              onSuccess={() => {
                // Close after a short delay so the user sees the success state
                setTimeout(() => setSubmitModalOpen(false), 1500);
              }}
              onCancel={() => setSubmitModalOpen(false)}
            />
          </div>
        </div>
      )}
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
          ? "border-[var(--action)]/30 bg-[var(--surface-card)]"
          : "border-[var(--border-rule)] bg-[var(--surface-raised)] hover:border-[var(--border-strong)]"
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
              className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border-rule)]"
            >
              {CATEGORY_LABELS[material.category] || material.category}
            </span>
            {material.brand && (
              <span className="truncate text-xs text-[var(--text-meta)]">
                {material.brand}
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="text-sm font-semibold leading-tight text-[var(--text-primary)] group-hover:text-[var(--action)] transition-colors">
            {material.name}
          </h3>

          {/* Sizes preview */}
          {previewSizes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {previewSizes.map((size) => (
                <span
                  key={size}
                  className="rounded bg-[var(--border-rule)] px-1.5 py-0.5 text-[11px] text-[var(--text-body)]"
                >
                  {size}
                </span>
              ))}
              {hasMoreSizes && (
                <span className="px-1 text-[11px] text-[var(--text-meta)]">
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
                  className="rounded bg-[var(--surface-page)] px-1.5 py-0.5 text-[11px] text-[var(--text-meta)]"
                >
                  {color}
                </span>
              ))}
              {hasMoreColors && (
                <span className="px-1 text-[11px] text-[var(--text-meta)]">
                  +{colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Expand chevron */}
        <div className="mt-1 shrink-0 text-[var(--text-meta)]">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-[var(--border-rule)] px-4 pb-4 pt-3">
          {/* Description */}
          {material.description && (
            <p className="mb-3 text-sm leading-relaxed text-[var(--text-body)]">
              {material.description}
            </p>
          )}

          {/* Detail grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {material.material_type && (
              <div>
                <span className="text-[var(--text-meta)]">Type</span>
                <p className="text-[var(--text-primary)]">{material.material_type}</p>
              </div>
            )}
            {material.weight && (
              <div>
                <span className="text-[var(--text-meta)]">Weight</span>
                <p className="text-[var(--text-primary)]">{material.weight}</p>
              </div>
            )}
            {material.finish && (
              <div>
                <span className="text-[var(--text-meta)]">Finish</span>
                <p className="text-[var(--text-primary)]">{material.finish}</p>
              </div>
            )}
            {material.subcategory && (
              <div>
                <span className="text-[var(--text-meta)]">Subcategory</span>
                <p className="text-[var(--text-primary)]">{material.subcategory}</p>
              </div>
            )}
          </div>

          {/* All sizes */}
          {sizes.length > 4 && (
            <div className="mt-3">
              <span className="mb-1 block text-xs font-medium text-[var(--text-meta)]">
                All Sizes ({sizes.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {sizes.map((size) => (
                  <span
                    key={size}
                    className="rounded bg-[var(--border-rule)] px-1.5 py-0.5 text-[11px] text-[var(--text-body)]"
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
              <span className="mb-1 block text-xs font-medium text-[var(--text-meta)]">
                All Colors ({colors.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {colors.map((color) => (
                  <span
                    key={color}
                    className="rounded bg-[var(--surface-page)] px-1.5 py-0.5 text-[11px] text-[var(--text-meta)]"
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
                    : "bg-[var(--action)]/15 text-[var(--action)] hover:bg-[var(--action)]/25"
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
                className="inline-flex items-center gap-1 text-xs text-[var(--text-meta)] hover:text-[var(--action)] transition-colors"
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
