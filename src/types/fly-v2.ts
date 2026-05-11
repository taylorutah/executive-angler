/**
 * Phase 2 fly model types — patterns / variants / stock / photos / box membership.
 *
 * Replaces the legacy `CanonicalFly` (entities.ts) + `FlyPattern` (fishing-log.ts)
 * + `FlyBoxEntry` (db/fly-patterns.ts) trifecta with one coherent model:
 *
 *   Pattern      — the recipe (canonical OR personal). owner_user_id null = canonical.
 *   Variant      — concrete spec (size · bead · color · materials). Pattern hasMany.
 *                  created_by_user_id null = curated/canonical visible to all;
 *                  set = user-added private variant.
 *   Stock        — per (user, variant) inventory: tied / bought / target / tie-next.
 *   InBox        — variant ↔ fly_box join (which boxes hold this variant).
 *   Photo        — multi-photo gallery per variant.
 *
 * Backed by tables fly_patterns_v2, fly_variants, fly_variant_stock,
 * fly_variant_in_box, fly_variant_photos. See migration
 * supabase/migrations/20260508_phase2_unified_fly_model.sql.
 */

export type FlyVisibility = "private" | "shared" | "public";
export type BeadMaterial = "tungsten" | "brass" | "glass" | "none";
export type TieNextStatus = "none" | "wanted" | "at_vise" | "done";

/** Tier of a fly_box (kill / support / archive / custom). Source of truth lives
 *  with the table schema in supabase/migrations/20260508_fly_boxes.sql. */
export type FlyBoxTier = "kill" | "support" | "archive" | "custom";

/** A user's fly_box row — the named tiered container. Mirrors the runtime
 *  type in src/lib/db/fly-v2.ts (server-only module); duplicated here so
 *  client components can `import type` without pulling server code. */
export interface FlyBoxV2 {
  id: string;
  user_id: string;
  name: string;
  tier: FlyBoxTier;
  description: string | null;
  icon: string | null;
  cover_image_url: string | null;
  sort_order: number;
  is_default: boolean;
  total_capacity: number | null;
  created_at: string;
  updated_at: string;
}

/** A fly recipe — canonical (library) or personal (user-authored or forked). */
export interface Pattern {
  id: string;
  slug: string | null;
  name: string;
  category: string | null;

  /** null = canonical/library; set = personal pattern owned by user. */
  owner_user_id: string | null;
  forked_from_pattern_id: string | null;
  promoted_to_canonical_id: string | null;

  description: string | null;
  history: string | null;
  tying_overview: string | null;
  fishing_tips: string | null;
  imitates: string[];
  effective_species_ids: string[];
  water_types: string[];

  hook_style: string | null;
  base_materials: MaterialSlot[];
  tying_steps: TyingStep[];

  hero_image_url: string | null;
  gallery_image_urls: string[];
  video_url: string | null;

  /** Personal-only — canonical patterns ignore visibility. */
  visibility: FlyVisibility;
  shared_with_user_ids: string[];

  contributed_by_user_id: string | null;
  origin_credit: string | null;

  is_featured: boolean;
  /**
   * Optional admin override for which variant option columns this pattern
   * uses (e.g. ["size","bead","body","rib"]). When null/undefined, the
   * per-category default from `src/lib/flies/variant-axes.ts` applies.
   */
  active_variant_axes?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface MaterialSlot {
  /** "hook", "bead", "thread", "tail", "body", "rib", "wing", "thorax", "head", etc. */
  slot: string;
  /** Display name of the default material — overridable per variant. */
  material: string;
  description?: string;
  brand?: string;
  is_optional?: boolean;
}

export interface TyingStep {
  step: number;
  body: string;
  tip?: string;
  image_url?: string;
}

/** A concrete variant of a Pattern: size, bead, color combo. THIS is what you fish. */
export interface Variant {
  id: string;
  pattern_id: string;
  /** null = canonical-curated (visible to all); set = user-added (private to creator). */
  created_by_user_id: string | null;

  slug: string | null;
  display_name: string | null;
  notes: string | null;

  size: string;
  hook_style: string | null;
  hook_brand: string | null;

  bead_material: BeadMaterial | null;
  bead_weight_mm: number | null;
  bead_color: string | null;

  body_color: string | null;
  rib_color: string | null;
  tail_color: string | null;
  wing_color: string | null;
  thorax_color: string | null;
  collar_color: string | null;

  /** Per-slot diff from Pattern.base_materials. Keys match slot names. */
  materials_override: Record<string, string>;

  sort_order: number;
  is_default_for_pattern: boolean;

  created_at: string;
  updated_at: string;
}

/** Per-user inventory of a Variant: tied + bought + target + tie-next + stats. */
export interface VariantStock {
  id: string;
  user_id: string;
  variant_id: string;

  tied_count: number;
  bought_count: number;
  target_count: number;

  tie_next_status: TieNextStatus;
  tie_next_target_qty: number | null;
  tie_next_notes: string | null;

  times_used: number;
  last_used_at: string | null;
  last_loss_at: string | null;

  is_favorite: boolean;
  personal_notes: string | null;

  added_at: string;
  updated_at: string;
}

/** Variant ↔ fly_box membership. */
export interface VariantInBox {
  box_id: string;
  variant_id: string;
  user_id: string;
  sort_order: number;
  quantity: number;
  /** Per-box target. When null, the global `VariantStock.target_count` applies. */
  target_quantity: number | null;
  added_at: string;
}

/** Photo attached to a Variant (multi-photo gallery, one is primary). */
export interface VariantPhoto {
  id: string;
  variant_id: string;
  /** null = canonical/admin photo; set = user upload. */
  user_id: string | null;
  storage_path: string;
  caption: string | null;
  is_primary: boolean;
  sort_order: number;
  uploaded_at: string;
}

/** A single box-membership entry for a variant: which box, how many. */
export interface VariantBoxMembership {
  box_id: string;
  box_name: string;
  quantity: number;
  /**
   * Per-box target tied count, when set. Used by shortage queries to compute
   * `deficit` and by the box-detail UI's "Box target" column.
   */
  target_quantity?: number | null;
  /**
   * Computed shortage for THIS box (max(0, target_quantity - quantity)) when
   * the membership came from a shortage query. Absent on regular reads.
   */
  deficit?: number;
}

/** Convenience: Variant with stock + photos joined for table rows. */
export interface VariantRow extends Variant {
  pattern: Pick<Pattern, "id" | "slug" | "name" | "category"> | null;
  stock: VariantStock | null;
  primary_photo: VariantPhoto | null;
  box_count: number;
  /**
   * Which boxes this variant is in, with the per-box quantity. Used on the
   * pattern detail page to render a chip list ("Kill 3 · Madison 4") instead
   * of just a count. Populated by `listVariantRowsForPattern`.
   */
  box_memberships: VariantBoxMembership[];
  /** Quantity in the specific box being viewed (only populated on box detail). */
  box_quantity: number | null;
  /** Per-box target in the specific box being viewed (only on box detail). */
  box_target_quantity: number | null;
}

/** Inventory math helpers — single source of truth for stock readouts. */
export function totalOwned(stock: VariantStock | null | undefined): number {
  if (!stock) return 0;
  return (stock.tied_count ?? 0) + (stock.bought_count ?? 0);
}

export function deficit(stock: VariantStock | null | undefined): number {
  if (!stock) return 0;
  const target = stock.target_count ?? 0;
  if (target <= 0) return 0;
  return Math.max(0, target - totalOwned(stock));
}

export function isLowStock(stock: VariantStock | null | undefined): boolean {
  return deficit(stock) > 0;
}
