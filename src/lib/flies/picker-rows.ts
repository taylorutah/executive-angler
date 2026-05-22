/**
 * Pure helpers that turn the picker bundle into the row model the FlyPicker
 * UI renders. Mirrors the iOS FlyPickerSheet grouping rules so behavior stays
 * in lockstep — one row per pattern, sizes aggregated.
 */
import type {
  PickerBundle,
  PickerLibraryPattern,
  PickerOrphanPattern,
  PickerVariant,
} from "@/lib/db/fly-picker";

export interface PickerSize {
  variant_id: string;
  size: string;
  bead_weight_mm: number | null;
}

export interface PatternRow {
  pattern_id: string;
  /** "personal" when owner_user_id is the current user; "canonical" otherwise. */
  source: "personal" | "canonical";
  name: string;
  category: string | null;
  hero_image_url: string | null;
  /** Hook sizes available for this pattern, sorted by best-match-for-user. */
  sizes: PickerSize[];
  /**
   * True when the pattern has zero concrete variants in the user's library —
   * a loose personal recipe. Size step falls back to free-text entry.
   */
  isOrphan: boolean;
  /** True when at least one of this pattern's variants is in the active box. */
  inActiveBox: boolean;
}

export interface PickerRowsResult {
  recents: PatternRow[];
  rows: PatternRow[];
  /** Canonical library rows that aren't already in `rows` / `recents`. */
  library: PatternRow[];
}

/**
 * Build the row model for the picker.
 *
 * - When `activeBoxId` is null ("All Flies"), every pattern surfaces.
 * - When `activeBoxId` is set, only patterns with at least one variant in that
 *   box surface (orphan personal patterns are hidden in this mode).
 * - When `query` is set, rows are filtered to matching names (case-insensitive).
 * - Recents are pulled to the top as their own group (up to 5).
 */
export function buildPickerRows(
  bundle: PickerBundle,
  activeBoxId: string | null,
  query: string,
): PickerRowsResult {
  const q = query.trim().toLowerCase();

  // Group variants by pattern_id.
  type Agg = {
    pattern_id: string;
    name: string;
    category: string | null;
    hero_image_url: string | null;
    owner_user_id: string | null;
    variants: PickerVariant[];
  };
  const byPattern = new Map<string, Agg>();
  for (const v of bundle.variants) {
    const agg = byPattern.get(v.pattern_id) ?? {
      pattern_id: v.pattern_id,
      name: v.pattern_name,
      category: v.pattern_category,
      hero_image_url: v.pattern_hero_image_url,
      owner_user_id: v.pattern_owner_user_id,
      variants: [],
    };
    agg.variants.push(v);
    byPattern.set(v.pattern_id, agg);
  }

  const patternRow = (agg: Agg): PatternRow => {
    // Sort variants: in active box first, then stocked, then by hook size asc.
    const sortedVariants = [...agg.variants].sort((a, b) => {
      const aIn = activeBoxId ? a.box_ids.includes(activeBoxId) : a.box_ids.length > 0;
      const bIn = activeBoxId ? b.box_ids.includes(activeBoxId) : b.box_ids.length > 0;
      if (aIn !== bIn) return aIn ? -1 : 1;
      if (a.is_stocked !== b.is_stocked) return a.is_stocked ? -1 : 1;
      return Number(a.size) - Number(b.size);
    });
    // Dedupe sizes (one row per size — picker hides bead/material differences).
    const seen = new Set<string>();
    const sizes: PickerSize[] = [];
    for (const v of sortedVariants) {
      if (seen.has(v.size)) continue;
      seen.add(v.size);
      sizes.push({
        variant_id: v.variant_id,
        size: v.size,
        bead_weight_mm: v.bead_weight_mm,
      });
    }
    const inActiveBox =
      activeBoxId == null
        ? agg.variants.some((v) => v.box_ids.length > 0)
        : agg.variants.some((v) => v.box_ids.includes(activeBoxId));
    return {
      pattern_id: agg.pattern_id,
      source: agg.owner_user_id ? "personal" : "canonical",
      name: agg.name,
      category: agg.category,
      hero_image_url: agg.hero_image_url,
      sizes,
      isOrphan: false,
      inActiveBox,
    };
  };

  const orphanRow = (p: PickerOrphanPattern): PatternRow => ({
    pattern_id: p.pattern_id,
    source: "personal",
    name: p.name,
    category: p.category,
    hero_image_url: p.hero_image_url,
    sizes: [],
    isOrphan: true,
    inActiveBox: false,
  });

  const libraryRow = (p: PickerLibraryPattern): PatternRow => ({
    pattern_id: p.pattern_id,
    source: "canonical",
    name: p.name,
    category: p.category,
    hero_image_url: p.hero_image_url,
    sizes: [],
    isOrphan: true,
    inActiveBox: false,
  });

  // All rows: variant-backed patterns + orphan personals.
  const allRows: PatternRow[] = [
    ...Array.from(byPattern.values()).map(patternRow),
    ...bundle.orphanPatterns.map(orphanRow),
  ];

  // Scope by active box.
  const scoped = activeBoxId
    ? allRows.filter((r) => r.inActiveBox)
    : allRows;

  // Filter by query (name contains).
  const filtered = q
    ? scoped.filter((r) => r.name.toLowerCase().includes(q))
    : scoped;

  // Sort alphabetically by name for stability.
  filtered.sort((a, b) => a.name.localeCompare(b.name));

  // Recents — pull matching pattern_ids to the top group (up to 5).
  const rowByPattern = new Map(filtered.map((r) => [r.pattern_id, r] as const));
  const recents: PatternRow[] = [];
  for (const rec of bundle.recents) {
    const row = rowByPattern.get(rec.pattern_id);
    if (!row) continue;
    recents.push(row);
    if (recents.length >= 5) break;
  }
  const recentIds = new Set(recents.map((r) => r.pattern_id));
  const rows = filtered.filter((r) => !recentIds.has(r.pattern_id));

  // Library — only when on All flies. Dedupe against patterns already present
  // in rows/recents so a canonical pattern with user variants doesn't appear
  // twice.
  const localIds = new Set<string>([
    ...recents.map((r) => r.pattern_id),
    ...rows.map((r) => r.pattern_id),
  ]);
  const libraryAll = activeBoxId == null
    ? bundle.libraryPatterns
        .filter((p) => !localIds.has(p.pattern_id))
        .map(libraryRow)
    : [];
  const library = q
    ? libraryAll.filter((r) => r.name.toLowerCase().includes(q))
    : libraryAll;

  return { recents, rows, library };
}
