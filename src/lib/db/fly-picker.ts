/**
 * Picker data bundle — the single round-trip the catch-logging fly picker uses
 * to render its chip bar (boxes), pattern-first row list (every fly the user
 * has), and RECENTS section (last 14 days of catches).
 *
 * Mirrors the iOS FlyPickerSheet contract so behavior stays in lockstep:
 *   - "All Flies" pseudo-box surfaces every variant the user has stock for OR
 *     box-membership in, plus orphan personal patterns with no variants yet.
 *   - Each user box (fly_boxes) becomes a chip; tapping it scopes the list to
 *     that box's variants only.
 *   - Recents are pattern keys derived from the user's most-recent catches.
 */
import { createClient } from "@/lib/supabase/server";

export interface PickerBox {
  id: string;
  name: string;
  tier: "kill" | "support" | "archive" | "custom";
  sort_order: number;
}

export interface PickerVariant {
  variant_id: string;
  pattern_id: string;
  pattern_name: string;
  pattern_category: string | null;
  pattern_owner_user_id: string | null;
  pattern_hero_image_url: string | null;
  size: string;
  bead_weight_mm: number | null;
  bead_material: string | null;
  /** Box memberships for this variant (one row per box the variant sits in). */
  box_ids: string[];
  /** True if the user has a fly_variant_stock row for this variant. */
  is_stocked: boolean;
}

export interface PickerOrphanPattern {
  pattern_id: string;
  name: string;
  category: string | null;
  hero_image_url: string | null;
  owner_user_id: string;
}

export interface PickerLibraryPattern {
  pattern_id: string;
  name: string;
  category: string | null;
  hero_image_url: string | null;
}

export interface PickerRecent {
  pattern_id: string;
  variant_id: string | null;
  /** ms timestamp of the most recent catch on this pattern. */
  caught_at: number;
}

export interface PickerBundle {
  boxes: PickerBox[];
  variants: PickerVariant[];
  /** Personal patterns owned by the user that have no variants yet. */
  orphanPatterns: PickerOrphanPattern[];
  /**
   * Canonical fly library — top patterns by rank. Surfaces in the picker
   * when the user is on "All flies" so they can pick library flies even
   * before they've stocked any variants in their own boxes.
   */
  libraryPatterns: PickerLibraryPattern[];
  recents: PickerRecent[];
}

const LIBRARY_LIMIT = 200;

const RECENTS_DAYS = 14;
const RECENTS_LIMIT = 50;

/**
 * Single-shot fetch for everything the picker needs to render. Returns empty
 * arrays when the user is signed out — the catch-edit page is gated on auth
 * upstream so this only happens in dev/preview contexts.
 */
export async function loadFlyPickerBundle(): Promise<PickerBundle> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { boxes: [], variants: [], orphanPatterns: [], libraryPatterns: [], recents: [] };
  }
  const userId = user.id;

  // Boxes — for the chip bar.
  const boxesPromise = supabase
    .from("fly_boxes")
    .select("id, name, tier, sort_order")
    .eq("user_id", userId)
    .order("tier")
    .order("sort_order")
    .order("created_at");

  // Box memberships for this user — drives box scoping per variant.
  const membershipsPromise = supabase
    .from("fly_variant_in_box")
    .select("variant_id, box_id")
    .eq("user_id", userId);

  // Stocked variants for this user — drives is_stocked + ensures variants
  // outside any box still surface in "All Flies".
  const stockPromise = supabase
    .from("fly_variant_stock")
    .select("variant_id")
    .eq("user_id", userId);

  // Personal patterns — orphan ones (no variants in any box / no stock) still
  // need to be pickable.
  const patternsPromise = supabase
    .from("fly_patterns_v2")
    .select("id, name, category, hero_image_url, owner_user_id")
    .eq("owner_user_id", userId)
    .order("name");

  // Recents — most recent catches in the last 14 days, with variant + pattern.
  const sinceIso = new Date(Date.now() - RECENTS_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const recentsPromise = supabase
    .from("catches")
    .select("variant_id, canonical_fly_id, fly_pattern_id, caught_at")
    .eq("user_id", userId)
    .gte("caught_at", sinceIso)
    .order("caught_at", { ascending: false })
    .limit(RECENTS_LIMIT);

  // Canonical library — top patterns by rank. Lets the picker show useful
  // rows in "All flies" even when the user has no stocked variants yet.
  const libraryPromise = supabase
    .from("canonical_flies")
    .select("id, name, category, hero_image_url")
    .order("rank", { ascending: true, nullsFirst: false })
    .order("name")
    .limit(LIBRARY_LIMIT);

  const [boxesRes, membershipsRes, stockRes, patternsRes, recentsRes, libraryRes] = await Promise.all([
    boxesPromise,
    membershipsPromise,
    stockPromise,
    patternsPromise,
    recentsPromise,
    libraryPromise,
  ]);

  const boxes: PickerBox[] = (boxesRes.data ?? []).map((b) => ({
    id: b.id as string,
    name: (b.name as string) ?? "Box",
    tier: ((b.tier as PickerBox["tier"]) ?? "custom"),
    sort_order: (b.sort_order as number) ?? 0,
  }));

  // Build the variant universe: union of (in any box) ∪ (stocked).
  const membershipsByVariant = new Map<string, string[]>();
  for (const r of (membershipsRes.data ?? []) as { variant_id: string; box_id: string }[]) {
    const list = membershipsByVariant.get(r.variant_id) ?? [];
    list.push(r.box_id);
    membershipsByVariant.set(r.variant_id, list);
  }
  const stockedVariantIds = new Set<string>(
    ((stockRes.data ?? []) as { variant_id: string }[]).map((s) => s.variant_id),
  );
  const allVariantIds = new Set<string>([
    ...membershipsByVariant.keys(),
    ...stockedVariantIds,
  ]);

  let variants: PickerVariant[] = [];
  if (allVariantIds.size > 0) {
    const variantIds = Array.from(allVariantIds);
    const { data: variantRows } = await supabase
      .from("fly_variants")
      .select("id, pattern_id, size, bead_weight_mm, bead_material")
      .in("id", variantIds)
      .is("deleted_at", null);

    const patternIds = Array.from(
      new Set(((variantRows ?? []) as { pattern_id: string }[]).map((v) => v.pattern_id)),
    );
    const { data: patternRows } = patternIds.length
      ? await supabase
          .from("fly_patterns_v2")
          .select("id, name, category, owner_user_id, hero_image_url")
          .in("id", patternIds)
      : { data: [] as Record<string, unknown>[] };
    const patternById = new Map<string, {
      name: string;
      category: string | null;
      owner_user_id: string | null;
      hero_image_url: string | null;
    }>();
    for (const p of (patternRows ?? []) as {
      id: string;
      name: string;
      category: string | null;
      owner_user_id: string | null;
      hero_image_url: string | null;
    }[]) {
      patternById.set(p.id, {
        name: p.name,
        category: p.category,
        owner_user_id: p.owner_user_id,
        hero_image_url: p.hero_image_url,
      });
    }

    variants = ((variantRows ?? []) as {
      id: string;
      pattern_id: string;
      size: string;
      bead_weight_mm: number | null;
      bead_material: string | null;
    }[]).map<PickerVariant | null>((v) => {
      const p = patternById.get(v.pattern_id);
      if (!p) return null;
      return {
        variant_id: v.id,
        pattern_id: v.pattern_id,
        pattern_name: p.name,
        pattern_category: p.category,
        pattern_owner_user_id: p.owner_user_id,
        pattern_hero_image_url: p.hero_image_url,
        size: v.size,
        bead_weight_mm: v.bead_weight_mm,
        bead_material: v.bead_material,
        box_ids: membershipsByVariant.get(v.id) ?? [],
        is_stocked: stockedVariantIds.has(v.id),
      };
    }).filter((r): r is PickerVariant => r !== null);
  }

  // Orphan personal patterns — those with no variants in the variant universe.
  const patternIdsWithVariants = new Set<string>(variants.map((v) => v.pattern_id));
  const orphanPatterns: PickerOrphanPattern[] = ((patternsRes.data ?? []) as {
    id: string;
    name: string;
    category: string | null;
    hero_image_url: string | null;
    owner_user_id: string;
  }[])
    .filter((p) => !patternIdsWithVariants.has(p.id))
    .map((p) => ({
      pattern_id: p.id,
      name: p.name,
      category: p.category,
      hero_image_url: p.hero_image_url,
      owner_user_id: p.owner_user_id,
    }));

  // Recents — collapse to one entry per pattern (first/most-recent wins).
  const seenPatterns = new Set<string>();
  const recents: PickerRecent[] = [];
  for (const r of (recentsRes.data ?? []) as {
    variant_id: string | null;
    canonical_fly_id: string | null;
    fly_pattern_id: string | null;
    caught_at: string;
  }[]) {
    // Map back to a pattern_id. Prefer the variant_id lookup (it's accurate)
    // and fall back to canonical_fly_id / fly_pattern_id when variant is null.
    let patternId: string | null = null;
    if (r.variant_id) {
      patternId = variants.find((v) => v.variant_id === r.variant_id)?.pattern_id ?? null;
    }
    if (!patternId) patternId = r.canonical_fly_id ?? r.fly_pattern_id ?? null;
    if (!patternId || seenPatterns.has(patternId)) continue;
    seenPatterns.add(patternId);
    recents.push({
      pattern_id: patternId,
      variant_id: r.variant_id,
      caught_at: Date.parse(r.caught_at),
    });
  }

  const libraryPatterns: PickerLibraryPattern[] = ((libraryRes.data ?? []) as {
    id: string;
    name: string;
    category: string | null;
    hero_image_url: string | null;
  }[]).map((p) => ({
    pattern_id: p.id,
    name: p.name,
    category: p.category,
    hero_image_url: p.hero_image_url,
  }));

  return { boxes, variants, orphanPatterns, libraryPatterns, recents };
}
