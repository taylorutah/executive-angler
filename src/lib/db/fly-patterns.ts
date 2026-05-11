/**
 * Query module for personal fly patterns, fly box entries, tie-next queue,
 * and shared/public patterns. Consolidates logic previously inline in API
 * routes and page components.
 *
 * All queries require an authenticated user context (server client).
 */
import { createClient } from "@/lib/supabase/server";
import type { FlyPattern, TieNextStatus } from "@/types/fishing-log";

type FlyBoxCanonicalJoin = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline?: string | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  bead_options?: string[] | null;
  hook_styles?: string[] | null;
  hero_image_url?: string | null;
  materials_list?: { material: string; description?: string }[] | null;
};

export type BeadMaterial = "tungsten" | "brass" | "glass" | "none";

export interface FlyBoxEntry {
  id: string;
  canonical_fly_id: string | null;
  fly_pattern_id: string | null;
  preferred_sizes?: string[] | null;
  personal_notes?: string | null;
  custom_image_url?: string | null;
  custom_name?: string | null;
  personalizations?: Record<string, Record<string, string | undefined> | undefined> | null;
  is_favorite?: boolean;
  is_tie_next?: boolean;
  tie_next_status?: TieNextStatus;
  tie_next_target_qty?: number | null;
  tie_next_notes?: string | null;
  times_used?: number;
  quantity_by_size?: Record<string, number>;
  last_loss_at?: string | null;
  added_at?: string;
  canonical_fly?: FlyBoxCanonicalJoin | null;
  // Variant identity (migration 20260507)
  variant_label?: string | null;
  is_primary?: boolean;
  variant_sort_order?: number;
  tied_count?: number;
  // Variant detail + MRP target (migration 20260509)
  bead_weight_mm?: number | null;
  bead_material?: BeadMaterial | null;
  hook_size?: string | null;
  target_count?: number;
}

/** User's personal fly patterns (authored or forked from canonical). */
export async function getMyPatterns(userId: string): Promise<FlyPattern[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fly_patterns")
    .select("*")
    .eq("user_id", userId)
    .order("name");
  if (error) {
    console.error("[getMyPatterns] error:", error);
    return [];
  }
  return (data ?? []) as FlyPattern[];
}

/** User's fly box entries (canonical refs + linked personal patterns). */
export async function getMyFlyBox(userId: string): Promise<FlyBoxEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_fly_box")
    .select(
      `
      id,
      canonical_fly_id,
      fly_pattern_id,
      preferred_sizes,
      personal_notes,
      custom_image_url,
      custom_name,
      personalizations,
      is_favorite,
      is_tie_next,
      tie_next_status,
      tie_next_target_qty,
      tie_next_notes,
      times_used,
      quantity_by_size,
      last_loss_at,
      added_at,
      variant_label,
      is_primary,
      variant_sort_order,
      tied_count,
      bead_weight_mm,
      bead_material,
      hook_size,
      target_count,
      canonical_fly:canonical_flies(id, slug, name, category, tagline, sizes, colors, bead_options, hook_styles, hero_image_url, materials_list)
    `
    )
    .eq("user_id", userId)
    .order("added_at", { ascending: false });
  if (error) {
    console.error("[getMyFlyBox] error:", error);
    return [];
  }
  return (data ?? []) as unknown as FlyBoxEntry[];
}

/** All variants of a given parent pattern (one level deep). */
export async function getVariantsOf(parentPatternId: string): Promise<FlyPattern[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fly_patterns")
    .select("*")
    .eq("parent_pattern_id", parentPatternId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[getVariantsOf] error:", error);
    return [];
  }
  return (data ?? []) as FlyPattern[];
}

/** All variants of a given canonical fly. */
export async function getVariantsOfCanonical(canonicalId: string): Promise<FlyPattern[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fly_patterns")
    .select("*")
    .eq("parent_canonical_id", canonicalId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[getVariantsOfCanonical] error:", error);
    return [];
  }
  return (data ?? []) as FlyPattern[];
}

/** Tie-next kanban queue for a user — includes wanted, at_vise, and recent done. */
export async function getTieNextQueue(userId: string): Promise<{
  patterns: FlyPattern[];
  boxEntries: FlyBoxEntry[];
}> {
  const supabase = await createClient();
  // "done" items are only surfaced from the last 14 days so the kanban doesn't
  // grow unbounded. The done column shows recent wins.
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  // Match either the new state-machine column OR the legacy is_tie_next bool —
  // they should stay in sync, but we defend against drift so a fly never
  // silently disappears from the queue. Done items are only kept for `cutoff`.
  const queueOr = `is_tie_next.eq.true,tie_next_status.in.(wanted,at_vise),and(tie_next_status.eq.done,updated_at.gte.${cutoff})`;
  const queueOrBox = `is_tie_next.eq.true,tie_next_status.in.(wanted,at_vise),and(tie_next_status.eq.done,added_at.gte.${cutoff})`;

  const [patternsRes, boxRes] = await Promise.all([
    supabase
      .from("fly_patterns")
      .select("*")
      .eq("user_id", userId)
      .or(queueOr)
      .order("updated_at", { ascending: false }),
    supabase
      .from("user_fly_box")
      .select(
        `
        id,
        canonical_fly_id,
        fly_pattern_id,
        preferred_sizes,
        is_favorite,
        is_tie_next,
        tie_next_status,
        tie_next_target_qty,
        tie_next_notes,
        times_used,
        added_at,
        canonical_fly:canonical_flies(id, slug, name, category, tagline, sizes, colors, bead_options, hook_styles, hero_image_url)
      `
      )
      .eq("user_id", userId)
      .or(queueOrBox)
      .order("added_at", { ascending: false }),
  ]);

  if (patternsRes.error) console.error("[getTieNextQueue patterns]", patternsRes.error);
  if (boxRes.error) console.error("[getTieNextQueue box]", boxRes.error);

  return {
    patterns: (patternsRes.data ?? []) as FlyPattern[],
    boxEntries: (boxRes.data ?? []) as unknown as FlyBoxEntry[],
  };
}

/** Patterns shared directly with the current user (not public). */
export async function getSharedWithMe(userId: string): Promise<FlyPattern[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fly_patterns")
    .select("*")
    .eq("visibility", "shared")
    .contains("shared_with_user_ids", [userId])
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("[getSharedWithMe] error:", error);
    return [];
  }
  return (data ?? []) as FlyPattern[];
}

/** Full pattern with parent + children. For variant tree display. */
export async function getPatternWithLineage(
  patternId: string
): Promise<{
  pattern: FlyPattern | null;
  parent: FlyPattern | null;
  parentCanonical: FlyBoxCanonicalJoin | null;
  children: FlyPattern[];
}> {
  const supabase = await createClient();
  const { data: pattern } = await supabase
    .from("fly_patterns")
    .select("*")
    .eq("id", patternId)
    .maybeSingle();

  if (!pattern) {
    return { pattern: null, parent: null, parentCanonical: null, children: [] };
  }

  const typed = pattern as FlyPattern;
  const [parentRes, canonicalRes, childrenRes] = await Promise.all([
    typed.parent_pattern_id
      ? supabase.from("fly_patterns").select("*").eq("id", typed.parent_pattern_id).maybeSingle()
      : Promise.resolve({ data: null }),
    typed.parent_canonical_id
      ? supabase
          .from("canonical_flies")
          .select("id, slug, name, category, tagline, sizes, colors, bead_options, hook_styles, hero_image_url")
          .eq("id", typed.parent_canonical_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("fly_patterns")
      .select("*")
      .eq("parent_pattern_id", patternId)
      .order("created_at", { ascending: false }),
  ]);

  return {
    pattern: typed,
    parent: (parentRes.data ?? null) as FlyPattern | null,
    parentCanonical: (canonicalRes.data ?? null) as FlyBoxCanonicalJoin | null,
    children: (childrenRes.data ?? []) as FlyPattern[],
  };
}

/** Aggregate counts for the /my-flies tab badges. */
export async function getMyFliesCounts(userId: string): Promise<{
  box: number;
  favorites: number;
  tieNext: number;
  sharedWithMe: number;
}> {
  const supabase = await createClient();
  const [patternsRes, boxRes, sharedRes] = await Promise.all([
    supabase
      .from("fly_patterns")
      .select("id, is_favorite, tie_next_status, is_tie_next", { count: "exact" })
      .eq("user_id", userId),
    supabase
      .from("user_fly_box")
      .select("id, is_favorite, tie_next_status, is_tie_next", { count: "exact" })
      .eq("user_id", userId),
    supabase
      .from("fly_patterns")
      .select("id", { count: "exact", head: true })
      .eq("visibility", "shared")
      .contains("shared_with_user_ids", [userId]),
  ]);

  type CountRow = { is_favorite?: boolean; tie_next_status?: TieNextStatus; is_tie_next?: boolean };
  const personal = (patternsRes.data ?? []) as CountRow[];
  const box = (boxRes.data ?? []) as CountRow[];

  const favorites =
    personal.filter((p) => p.is_favorite).length +
    box.filter((b) => b.is_favorite).length;
  const inQueue = (r: CountRow) =>
    r.tie_next_status === "wanted" || r.tie_next_status === "at_vise" || r.is_tie_next === true;
  const tieNext = personal.filter(inQueue).length + box.filter(inQueue).length;

  return {
    box: (patternsRes.count ?? 0) + (boxRes.count ?? 0),
    favorites,
    tieNext,
    sharedWithMe: sharedRes.count ?? 0,
  };
}

/**
 * Given a list of legacy fly_patterns rows, resolve the canonical slugs for
 * any that have `promoted_to_canonical_id` set. Returns a map of
 * promoted_to_canonical_id → slug so callers can join when building hrefs.
 *
 * Used by the four My Flies surfaces to avoid linking to /journal/flies/<id>/edit
 * for patterns that have been promoted to canonical (those should land on
 * /flies/<slug> instead).
 */
/**
 * Mutates the given patterns in place to populate `promoted_canonical_slug`
 * for any row whose `promoted_to_canonical_id` matches a known canonical.
 * Convenience wrapper around `lookupPromotedCanonicalSlugs`.
 */
export async function attachPromotedCanonicalSlugs<T extends FlyPattern>(
  patterns: T[]
): Promise<T[]> {
  const slugs = await lookupPromotedCanonicalSlugs(patterns);
  for (const p of patterns) {
    if (p.promoted_to_canonical_id) {
      p.promoted_canonical_slug = slugs.get(p.promoted_to_canonical_id) ?? null;
    }
  }
  return patterns;
}

export async function lookupPromotedCanonicalSlugs(
  patterns: Pick<FlyPattern, "promoted_to_canonical_id">[]
): Promise<Map<string, string>> {
  const ids = Array.from(
    new Set(
      patterns
        .map((p) => p.promoted_to_canonical_id)
        .filter((v): v is string => typeof v === "string" && v.length > 0)
    )
  );
  if (ids.length === 0) return new Map();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("canonical_flies")
    .select("id, slug")
    .in("id", ids);
  if (error) {
    console.error("[lookupPromotedCanonicalSlugs] error:", error);
    return new Map();
  }
  return new Map((data ?? []).map((r) => [r.id as string, r.slug as string]));
}

/**
 * Resolve angler_profiles.username for a set of user ids (used to build
 * /anglers/<username>/flies/<slug> links for patterns the viewer doesn't own).
 */
export async function lookupAnglerUsernames(
  userIds: string[]
): Promise<Map<string, string>> {
  const ids = Array.from(new Set(userIds.filter((v) => v && v.length > 0)));
  if (ids.length === 0) return new Map();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("angler_profiles")
    .select("user_id, username")
    .in("user_id", ids);
  if (error) {
    console.error("[lookupAnglerUsernames] error:", error);
    return new Map();
  }
  return new Map(
    (data ?? [])
      .filter((r) => r.username)
      .map((r) => [r.user_id as string, r.username as string])
  );
}
