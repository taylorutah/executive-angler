/**
 * fly-patterns.ts — legacy module preserved as a façade for the unified
 * Phase A fly schema (`flies` + `user_fly_configurations`). The old tables
 * (`fly_patterns`, `fly_patterns_v2`, `user_fly_box`) were dropped in the
 * May-14 cleanup.
 *
 * Public exports kept stable so existing consumers compile. Functions that
 * have no analog on the new schema return empty results; the only function
 * still in active use (`getMyFliesCounts`) is rewritten against
 * `user_fly_configurations`.
 */
import { createClient } from "@/lib/supabase/server";
import type { FlyPattern, TieNextStatus } from "@/types/fishing-log";

export type BeadMaterial = "tungsten" | "brass" | "glass" | "none";

/** Compatibility shape kept for components that destructure subsets via
 *  `Pick<FlyBoxEntry, ...>`. Most fields are populated only when the source
 *  data has them; safe to ignore when the field is missing. */
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
  canonical_fly?: {
    id: string;
    slug: string;
    name: string;
    category: string;
    hero_image_url?: string | null;
    owner_user_id?: string | null;
  } | null;
  variant_label?: string | null;
  is_primary?: boolean;
  variant_sort_order?: number;
  tied_count?: number;
  bead_weight_mm?: number | null;
  bead_material?: BeadMaterial | null;
  hook_size?: string | null;
  target_count?: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Active queries (rewritten on new schema)
// ────────────────────────────────────────────────────────────────────────────

/** Badge counts for the journal/my-flies surfaces. */
export async function getMyFliesCounts(userId: string): Promise<{
  box: number;
  favorites: number;
  tieNext: number;
  sharedWithMe: number;
}> {
  const supabase = await createClient();
  const [cfgRes, customRes] = await Promise.all([
    supabase
      .from("user_fly_configurations")
      .select("id, fly_id, is_favorite, is_tie_next, tie_next_status")
      .eq("user_id", userId),
    supabase
      .from("flies")
      .select("id", { count: "exact", head: true })
      .eq("submitted_by_user_id", userId)
      .in("status", ["private", "pending", "approved"])
      .is("deleted_at", null),
  ]);

  type Row = {
    id: string;
    fly_id: string;
    is_favorite?: boolean | null;
    is_tie_next?: boolean | null;
    tie_next_status?: TieNextStatus | null;
  };
  const configs = ((cfgRes.data ?? []) as Row[]);
  const distinctFlyIds = new Set(configs.map((c) => c.fly_id));
  const favorites = configs.filter((c) => !!c.is_favorite).length;
  const tieNext = configs.filter((c) =>
    !!c.is_tie_next || c.tie_next_status === "wanted" || c.tie_next_status === "at_vise"
  ).length;

  return {
    box: distinctFlyIds.size + (customRes.count ?? 0),
    favorites,
    tieNext,
    sharedWithMe: 0,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Compatibility stubs — no analog on the new schema; return empty results.
// Callers don't currently use these post-reset, but the exports are kept so
// any straggler import compiles.
// ────────────────────────────────────────────────────────────────────────────

export async function getMyPatterns(_userId: string): Promise<FlyPattern[]> { return []; }
export async function getMyFlyBox(_userId: string): Promise<FlyBoxEntry[]> { return []; }
export async function getMyV2PersonalVariants(_userId: string): Promise<FlyBoxEntry[]> { return []; }
export async function getVariantsOf(_parentPatternId: string): Promise<FlyPattern[]> { return []; }
export async function getVariantsOfCanonical(_canonicalId: string): Promise<FlyPattern[]> { return []; }
export async function getSharedWithMe(_userId: string): Promise<FlyPattern[]> { return []; }
export async function getTieNextQueue(_userId: string): Promise<{
  wanted: FlyBoxEntry[];
  at_vise: FlyBoxEntry[];
  done: FlyBoxEntry[];
}> {
  return { wanted: [], at_vise: [], done: [] };
}
export async function getPatternWithLineage(
  _patternId: string,
): Promise<{ pattern: FlyPattern | null; parent: FlyPattern | null; children: FlyPattern[] }> {
  return { pattern: null, parent: null, children: [] };
}
export async function attachPromotedCanonicalSlugs<T extends FlyPattern>(
  patterns: T[],
): Promise<T[]> {
  return patterns;
}
export async function lookupPromotedCanonicalSlugs(
  _ids: string[],
): Promise<Map<string, string>> {
  return new Map();
}
export async function lookupAnglerUsernames(
  _userIds: string[],
): Promise<Map<string, string>> {
  return new Map();
}
