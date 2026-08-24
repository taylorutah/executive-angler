"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, Check, Feather, Loader2, X, ChevronLeft } from "lucide-react";
import { useActiveBox } from "@/lib/flies/active-box";
import { buildPickerRows, type PatternRow, type PickerSize } from "@/lib/flies/picker-rows";
import type { PickerBundle } from "@/lib/db/fly-picker";

/**
 * iOS-parity fly picker. Mirrors `FlyPickerSheet.swift`:
 *   1. Box chip bar across the top (All Flies + every user box, sticky).
 *   2. RECENTS section (up to 5 most recent patterns from the last 14 days).
 *   3. Pattern-first list of every fly in the active scope.
 *   4. Step 2 inline size grid — clicking a pattern reveals its hook sizes;
 *      clicking a size commits the variant (size + bead auto-resolved).
 *
 * Live catalog search (debounced) augments the local list when the user types
 * a query — canonical hits that aren't in the user's library show up as new
 * pattern rows with no size grid (size step falls back to manual entry on the
 * parent form).
 */

export interface FlyPickerSelection {
  source: "canonical" | "personal";
  id: string;
  name: string;
  category?: string | null;
  /** Set when the user picked a specific size (variant) in the picker. */
  variantId?: string;
  /** Hook size string (e.g. "14") when a size was selected. */
  size?: string;
  /** Bead weight in mm when known via the chosen variant. */
  beadWeightMm?: number | null;
}

interface CatalogHit {
  source: "canonical" | "personal";
  id: string;
  name: string;
  category?: string | null;
  imageUrl?: string | null;
  isMine?: boolean;
  /** Hook sizes from the fly's option_envelope. Picker prompts when present. */
  sizes?: string[];
}

interface Props {
  value?: FlyPickerSelection | null;
  onChange: (selection: FlyPickerSelection | null) => void;
  placeholder?: string;
  className?: string;
}

export default function FlyPicker({
  value,
  onChange,
  placeholder = "Search flies…",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bundle, setBundle] = useState<PickerBundle | null>(null);
  const [bundleLoading, setBundleLoading] = useState(false);
  const [catalogHits, setCatalogHits] = useState<CatalogHit[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [pushed, setPushed] = useState<PatternRow | null>(null);
  const { activeBoxId, setActiveBoxId } = useActiveBox();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load the picker bundle once on first open. Mirrors the iOS sheet which
  // hydrates FlyBoxStore on first appearance, not on app launch.
  //
  // `bundleLoading` is intentionally NOT in the dep array — including it
  // makes the effect re-run on its own state update, and the cleanup from
  // the first invocation cancels the in-flight fetch before it can write
  // the bundle. (That's exactly the Safari/prod hang reported on 2026-05-22.)
  const fetchStartedRef = useRef(false);
  useEffect(() => {
    if (!open || bundle || fetchStartedRef.current) return;
    fetchStartedRef.current = true;
    let cancelled = false;
    setBundleLoading(true);
    fetch("/api/flies/picker-data")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setBundle(data as PickerBundle);
      })
      .catch(() => {
        // Surface in the empty-state copy; do not silently retry.
      })
      .finally(() => {
        if (!cancelled) setBundleLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, bundle]);

  // Debounced catalog search — only when the user is typing.
  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setCatalogHits([]);
      return;
    }
    const t = setTimeout(async () => {
      setCatalogLoading(true);
      try {
        const res = await fetch(
          `/api/flies/search?q=${encodeURIComponent(query.trim())}&limit=25`,
        );
        if (res.ok) {
          const data = await res.json();
          setCatalogHits((data.results ?? []) as CatalogHit[]);
        }
      } finally {
        setCatalogLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, open]);

  // Click-outside closes the popover.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setPushed(null);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Build the row model from the bundle.
  const { recents, rows, library } = useMemo(() => {
    if (!bundle) {
      return {
        recents: [] as PatternRow[],
        rows: [] as PatternRow[],
        library: [] as PatternRow[],
      };
    }
    return buildPickerRows(bundle, activeBoxId, query);
  }, [bundle, activeBoxId, query]);

  // Catalog hits not already represented in the local rows (dedup by id).
  const localPatternIds = useMemo(() => {
    const ids = new Set<string>();
    for (const r of rows) ids.add(r.pattern_id);
    for (const r of recents) ids.add(r.pattern_id);
    for (const r of library) ids.add(r.pattern_id);
    return ids;
  }, [rows, recents, library]);
  const extraCatalogRows: PatternRow[] = useMemo(
    () =>
      catalogHits
        .filter((h) => !localPatternIds.has(h.id))
        .map((h) => ({
          pattern_id: h.id,
          source: h.source,
          name: h.name,
          category: h.category ?? null,
          hero_image_url: h.imageUrl ?? null,
          // Synthesize canonical-size PickerSize entries (no variant_id)
          // so the picker pushes to the size grid for catalog-only hits
          // exactly like it does for library / orphan rows.
          sizes: (h.sizes ?? []).map((s) => ({ size: s, bead_weight_mm: null })),
          isOrphan: true,
          inActiveBox: false,
        })),
    [catalogHits, localPatternIds],
  );

  const select = useCallback(
    (row: PatternRow, size: PickerSize | null) => {
      // Sticky active box: if this pattern lives in any of the user's boxes
      // and none of them is the active box, switch to its first box (mirrors
      // iOS FlyPickerSheet:611–613). Only meaningful when size carries a
      // real variant_id — canonical sizes (no variant) don't belong to any
      // box yet.
      if (size?.variant_id && bundle) {
        const variant = bundle.variants.find((v) => v.variant_id === size.variant_id);
        if (variant && variant.box_ids.length > 0 && !variant.box_ids.includes(activeBoxId ?? "")) {
          setActiveBoxId(variant.box_ids[0]);
        }
      }
      onChange({
        source: row.source,
        id: row.pattern_id,
        name: row.name,
        category: row.category,
        ...(size
          ? {
              // variantId may be undefined for canonical-size selections —
              // the catch row keeps configuration_id null in that case
              // (parent form handles this; see edit/page.tsx).
              ...(size.variant_id ? { variantId: size.variant_id } : {}),
              size: size.size,
              beadWeightMm: size.bead_weight_mm,
            }
          : {}),
      });
      setQuery("");
      setOpen(false);
      setPushed(null);
    },
    [onChange, bundle, activeBoxId, setActiveBoxId],
  );

  // Selected-chip display when a fly is set.
  if (value && !open) {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-rule)] hover:border-[var(--action)]/40 text-left transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Feather className="h-3.5 w-3.5 text-[var(--action)] shrink-0" />
            <span className="text-sm text-[var(--text-primary)] truncate">{value.name}</span>
            {value.size && (
              <span className="text-[10px] text-[var(--text-meta)] shrink-0">#{value.size}</span>
            )}
            {value.source === "personal" && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--action)] bg-[var(--action)]/10 px-1.5 py-0.5 rounded-full shrink-0">
                Yours
              </span>
            )}
          </div>
          <X
            className="h-3.5 w-3.5 text-[var(--text-meta)] hover:text-[var(--text-primary)] shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
          />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-meta)] pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-8 pr-3 py-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-rule)] text-sm text-[var(--text-primary)] placeholder-[#6E7681] focus:outline-none focus:border-[var(--action)]/50"
        />
        {(bundleLoading || catalogLoading) && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-meta)] animate-spin" />
        )}
      </div>

      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1 rounded-lg bg-[var(--surface-page)] border border-[var(--border-rule)] shadow-xl overflow-hidden">
          {/* Step 2: size grid for the pushed pattern. */}
          {pushed ? (
            <SizeGrid
              row={pushed}
              currentVariantId={value?.variantId}
              onBack={() => setPushed(null)}
              onPick={(size) => select(pushed, size)}
            />
          ) : (
            <>
              <BoxChipBar
                bundle={bundle}
                activeBoxId={activeBoxId}
                onSelect={setActiveBoxId}
              />
              <div className="max-h-80 overflow-y-auto">
                {recents.length > 0 && (
                  <RowSection
                    title="Recents"
                    rows={recents}
                    value={value}
                    onPick={(row) => {
                      if (row.sizes.length > 0) setPushed(row);
                      else select(row, null);
                    }}
                  />
                )}
                {rows.length > 0 && (
                  <RowSection
                    title={recents.length > 0 ? "Your flies" : undefined}
                    rows={rows}
                    value={value}
                    onPick={(row) => {
                      if (row.sizes.length > 0) setPushed(row);
                      else select(row, null);
                    }}
                  />
                )}
                {library.length > 0 && (
                  <RowSection
                    title="Library"
                    rows={library}
                    value={value}
                    onPick={(row) => {
                      if (row.sizes.length > 0) setPushed(row);
                      else select(row, null);
                    }}
                  />
                )}
                {extraCatalogRows.length > 0 && (
                  <RowSection
                    title="More matches"
                    rows={extraCatalogRows}
                    value={value}
                    onPick={(row) => {
                      if (row.sizes.length > 0) setPushed(row);
                      else select(row, null);
                    }}
                  />
                )}
                {!bundleLoading &&
                  recents.length === 0 &&
                  rows.length === 0 &&
                  library.length === 0 &&
                  extraCatalogRows.length === 0 && (
                    <p className="px-3 py-3 text-xs text-[var(--text-meta)]">
                      {query
                        ? `No matches for "${query}"`
                        : activeBoxId
                          ? "This box is empty. Pick All Flies to see more."
                          : "Your fly box is empty."}
                    </p>
                  )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── BoxChipBar ─────────────────────────────────────────────────────────────

function BoxChipBar({
  bundle,
  activeBoxId,
  onSelect,
}: {
  bundle: PickerBundle | null;
  activeBoxId: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (!bundle || bundle.boxes.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 px-2 py-2 border-b border-[var(--border-rule)] overflow-x-auto">
      <ChipButton active={activeBoxId == null} onClick={() => onSelect(null)}>
        All flies
      </ChipButton>
      {bundle.boxes.map((b) => (
        <ChipButton
          key={b.id}
          active={activeBoxId === b.id}
          onClick={() => onSelect(b.id)}
        >
          {b.name}
        </ChipButton>
      ))}
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
        active
          ? "bg-[var(--action)] text-[var(--surface-page)]"
          : "bg-transparent border border-[var(--border-rule)] text-[var(--text-body)] hover:border-[var(--action)]/40 hover:text-[var(--text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

// ── RowSection ────────────────────────────────────────────────────────────

function RowSection({
  title,
  rows,
  value,
  onPick,
}: {
  title?: string;
  rows: PatternRow[];
  value: FlyPickerSelection | null | undefined;
  onPick: (row: PatternRow) => void;
}) {
  return (
    <div>
      {title && (
        <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-meta)]">
          {title}
        </p>
      )}
      {rows.map((r) => {
        const selected = value?.id === r.pattern_id && value.source === r.source;
        return (
          <button
            key={`${r.source}-${r.pattern_id}`}
            type="button"
            onClick={() => onPick(r)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-[var(--surface-raised)] ${
              selected ? "bg-[var(--surface-raised)]" : ""
            }`}
          >
            <div className="h-7 w-7 rounded bg-[var(--surface-raised)] border border-[var(--border-rule)] overflow-hidden shrink-0 flex items-center justify-center">
              {r.hero_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.hero_image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Feather className="h-3 w-3 text-[var(--text-meta)]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text-primary)] truncate">{r.name}</p>
              <p className="text-[10px] text-[var(--text-meta)] capitalize truncate">
                {r.category ?? (r.isOrphan ? "Personal" : "")}
                {r.sizes.length > 0 && (
                  <span className="ml-1 text-[var(--text-meta)]">
                    · {r.sizes.length} size{r.sizes.length === 1 ? "" : "s"}
                  </span>
                )}
              </p>
            </div>
            {r.source === "personal" && !r.isOrphan && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--action)] bg-[var(--action)]/10 px-1.5 py-0.5 rounded-full shrink-0">
                Yours
              </span>
            )}
            {selected && <Check className="h-3.5 w-3.5 text-[var(--action)] shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

// ── SizeGrid (step 2) ─────────────────────────────────────────────────────

function SizeGrid({
  row,
  currentVariantId,
  onBack,
  onPick,
}: {
  row: PatternRow;
  currentVariantId?: string;
  onBack: () => void;
  onPick: (size: PickerSize) => void;
}) {
  return (
    <div className="max-h-80 overflow-y-auto">
      <div className="flex items-center gap-2 px-2 py-2 border-b border-[var(--border-rule)]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--text-body)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Back
        </button>
        <p className="text-sm text-[var(--text-primary)] font-semibold truncate flex-1">{row.name}</p>
      </div>
      <div className="grid grid-cols-3 gap-1.5 p-2">
        {row.sizes.map((s) => {
          // `variant_id` is omitted for canonical-only sizes (library
          // patterns the user hasn't configured yet). Highlight the
          // current selection by variant_id when one exists; otherwise
          // canonical sizes always render unselected — the user is
          // picking, not re-selecting.
          const isCurrent = !!s.variant_id && currentVariantId === s.variant_id;
          return (
            <button
              key={s.variant_id ?? `canonical-${s.size}`}
              type="button"
              onClick={() => onPick(s)}
              className={`px-2 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isCurrent
                  ? "bg-[var(--action)] text-[var(--surface-page)]"
                  : "bg-[var(--surface-raised)] border border-[var(--border-rule)] text-[var(--text-primary)] hover:border-[var(--action)]/40"
              }`}
            >
              <div>#{s.size}</div>
              {s.bead_weight_mm != null && (
                <div className="text-[9px] text-[var(--text-meta)] font-normal mt-0.5">
                  {s.bead_weight_mm}mm bead
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
