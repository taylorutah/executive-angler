/**
 * Phase 2 fly query module — patterns / variants / stock / photos / box membership.
 *
 * Replaces src/lib/db/fly-patterns.ts (canonical_flies + fly_patterns + user_fly_box
 * with personalizations jsonb tangle) with focused queries against the unified
 * fly_patterns_v2 / fly_variants / fly_variant_stock / fly_variant_in_box /
 * fly_variant_photos schema.
 *
 * Until the full Phase 2 cutover, the legacy module stays in place. New surfaces
 * (Pattern detail v2, Box view v2) import from here behind a feature flag.
 */
import { createClient } from "@/lib/supabase/server";
import { createStaticClient } from "@/lib/supabase/static";
import { isAdmin } from "@/lib/admin";
import { assertCanEditPattern } from "@/lib/flies/permissions";
import type {
  Pattern,
  Variant,
  VariantStock,
  VariantInBox,
  VariantPhoto,
  VariantRow,
  MaterialSlot,
  TyingStep,
  BeadMaterial,
} from "@/types/fly-v2";

// ────────────────────────────────────────────────────────────────────────────
// Patterns
// ────────────────────────────────────────────────────────────────────────────

/** All canonical patterns (library), publicly readable. */
export async function listCanonicalPatterns(): Promise<Pattern[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("fly_patterns_v2")
    .select("*")
    .is("owner_user_id", null)
    .order("name");
  if (error) {
    console.error("[listCanonicalPatterns]", error);
    return [];
  }
  return (data ?? []) as Pattern[];
}

/** Single canonical pattern by slug. */
export async function getCanonicalPatternBySlug(slug: string): Promise<Pattern | null> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("fly_patterns_v2")
    .select("*")
    .eq("slug", slug)
    .is("owner_user_id", null)
    .maybeSingle();
  if (error) {
    console.error("[getCanonicalPatternBySlug]", error);
    return null;
  }
  return (data ?? null) as Pattern | null;
}

/** Pattern by id (canonical or personal — RLS gates visibility). */
export async function getPatternById(id: string): Promise<Pattern | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fly_patterns_v2")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[getPatternById]", error);
    return null;
  }
  return (data ?? null) as Pattern | null;
}

/** All personal patterns owned by the current user. */
export async function listMyPatterns(): Promise<Pattern[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("fly_patterns_v2")
    .select("*")
    .eq("owner_user_id", user.id)
    .order("name");
  if (error) {
    console.error("[listMyPatterns]", error);
    return [];
  }
  return (data ?? []) as Pattern[];
}

// ────────────────────────────────────────────────────────────────────────────
// Variants
// ────────────────────────────────────────────────────────────────────────────

/**
 * All variants visible on a pattern's detail page:
 *   - Canonical-curated variants (created_by_user_id is null) — visible to all
 *   - Plus current user's own variants on this pattern
 *
 * RLS handles the visibility filter. Soft-deleted rows are filtered in JS
 * so this works whether or not the deleted_at migration has been applied
 * yet (a `.is("deleted_at", null)` predicate would error against a missing
 * column). The read policy stays open so historical catch detail can still
 * resolve a deleted variant's spec.
 */
export async function listVariantsForPattern(patternId: string): Promise<Variant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fly_variants")
    .select("*")
    .eq("pattern_id", patternId)
    .order("sort_order")
    .order("size");
  if (error) {
    console.error("[listVariantsForPattern]", error);
    return [];
  }
  return ((data ?? []) as Variant[]).filter(
    (v) => !(v as unknown as { deleted_at?: string | null }).deleted_at,
  );
}

/** Variant rows for a pattern, joined with stock + primary photo + box count. */
export async function listVariantRowsForPattern(patternId: string): Promise<VariantRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

  const variants = await listVariantsForPattern(patternId);
  if (variants.length === 0) return [];
  const variantIds = variants.map((v) => v.id);

  // Stock for the current user only (RLS enforces this anyway)
  const stockByVariant = new Map<string, VariantStock>();
  if (userId) {
    const { data: stockRows } = await supabase
      .from("fly_variant_stock")
      .select("*")
      .eq("user_id", userId)
      .in("variant_id", variantIds);
    for (const s of (stockRows ?? []) as VariantStock[]) {
      stockByVariant.set(s.variant_id, s);
    }
  }

  // Primary photos
  const { data: photoRows } = await supabase
    .from("fly_variant_photos")
    .select("*")
    .in("variant_id", variantIds)
    .eq("is_primary", true);
  const photoByVariant = new Map<string, VariantPhoto>();
  for (const p of (photoRows ?? []) as VariantPhoto[]) {
    photoByVariant.set(p.variant_id, p);
  }

  // Box counts (current user's boxes only, via RLS)
  const boxCountByVariant = new Map<string, number>();
  if (userId) {
    const { data: boxRows } = await supabase
      .from("fly_variant_in_box")
      .select("variant_id")
      .in("variant_id", variantIds);
    for (const r of (boxRows ?? []) as { variant_id: string }[]) {
      boxCountByVariant.set(r.variant_id, (boxCountByVariant.get(r.variant_id) ?? 0) + 1);
    }
  }

  return variants.map<VariantRow>((v) => ({
    ...v,
    pattern: null,
    stock: stockByVariant.get(v.id) ?? null,
    primary_photo: photoByVariant.get(v.id) ?? null,
    box_count: boxCountByVariant.get(v.id) ?? 0,
    box_quantity: null,
  }));
}

// ────────────────────────────────────────────────────────────────────────────
// User's Variant Stock (across all patterns)
// ────────────────────────────────────────────────────────────────────────────

/** All variants the current user has stock for, joined with pattern + variant. */
export async function listMyStockedVariants(): Promise<VariantRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: stockRows, error: stockErr } = await supabase
    .from("fly_variant_stock")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  if (stockErr || !stockRows || stockRows.length === 0) return [];

  const variantIds = (stockRows as VariantStock[]).map((s) => s.variant_id);
  const { data: variantRows } = await supabase
    .from("fly_variants")
    .select("*")
    .in("id", variantIds);
  const variantById = new Map<string, Variant>();
  for (const v of (variantRows ?? []) as Variant[]) variantById.set(v.id, v);

  const patternIds = Array.from(new Set((variantRows ?? []).map((v: Variant) => v.pattern_id)));
  const { data: patternRows } = await supabase
    .from("fly_patterns_v2")
    .select("id, slug, name, category")
    .in("id", patternIds);
  const patternById = new Map<string, Pick<Pattern, "id" | "slug" | "name" | "category">>();
  for (const p of (patternRows ?? []) as Pick<Pattern, "id" | "slug" | "name" | "category">[]) {
    patternById.set(p.id, p);
  }

  const { data: photoRows } = await supabase
    .from("fly_variant_photos")
    .select("*")
    .in("variant_id", variantIds)
    .eq("is_primary", true);
  const photoByVariant = new Map<string, VariantPhoto>();
  for (const p of (photoRows ?? []) as VariantPhoto[]) {
    photoByVariant.set(p.variant_id, p);
  }

  return (stockRows as VariantStock[])
    .map<VariantRow | null>((s) => {
      const v = variantById.get(s.variant_id);
      if (!v) return null;
      return {
        ...v,
        pattern: patternById.get(v.pattern_id) ?? null,
        stock: s,
        primary_photo: photoByVariant.get(s.variant_id) ?? null,
        box_count: 0,
        box_quantity: null,
      };
    })
    .filter((r): r is VariantRow => r !== null);
}

// ────────────────────────────────────────────────────────────────────────────
// Box-scoped views (variants in a single fly_box)
// ────────────────────────────────────────────────────────────────────────────

/** Variants in a specific fly_box, with stock + primary photo. */
export async function listVariantsInBox(boxId: string): Promise<VariantRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberships } = await supabase
    .from("fly_variant_in_box")
    .select("variant_id, sort_order")
    .eq("box_id", boxId)
    .order("sort_order");
  const variantIds = (memberships ?? []).map((m: { variant_id: string }) => m.variant_id);
  if (variantIds.length === 0) return [];

  // Fetch quantities separately so a missing column (pre-migration) degrades
  // gracefully to 1 instead of breaking the whole query.
  const quantityByVariant = new Map<string, number>();
  const { data: qtyRows } = await supabase
    .from("fly_variant_in_box")
    .select("variant_id, quantity")
    .eq("box_id", boxId);
  for (const r of (qtyRows ?? []) as { variant_id: string; quantity?: number }[]) {
    if (r.quantity != null) quantityByVariant.set(r.variant_id, r.quantity);
  }

  const { data: variantRows } = await supabase
    .from("fly_variants")
    .select("*")
    .in("id", variantIds);
  const variantById = new Map<string, Variant>();
  for (const v of (variantRows ?? []) as Variant[]) variantById.set(v.id, v);

  const { data: stockRows } = await supabase
    .from("fly_variant_stock")
    .select("*")
    .eq("user_id", user.id)
    .in("variant_id", variantIds);
  const stockByVariant = new Map<string, VariantStock>();
  for (const s of (stockRows ?? []) as VariantStock[]) {
    stockByVariant.set(s.variant_id, s);
  }

  const patternIds = Array.from(new Set((variantRows ?? []).map((v: Variant) => v.pattern_id)));
  const { data: patternRows } = await supabase
    .from("fly_patterns_v2")
    .select("id, slug, name, category")
    .in("id", patternIds);
  const patternById = new Map<string, Pick<Pattern, "id" | "slug" | "name" | "category">>();
  for (const p of (patternRows ?? []) as Pick<Pattern, "id" | "slug" | "name" | "category">[]) {
    patternById.set(p.id, p);
  }

  const { data: photoRows } = await supabase
    .from("fly_variant_photos")
    .select("*")
    .in("variant_id", variantIds)
    .eq("is_primary", true);
  const photoByVariant = new Map<string, VariantPhoto>();
  for (const p of (photoRows ?? []) as VariantPhoto[]) {
    photoByVariant.set(p.variant_id, p);
  }

  return variantIds
    .map<VariantRow | null>((id) => {
      const v = variantById.get(id);
      if (!v) return null;
      return {
        ...v,
        pattern: patternById.get(v.pattern_id) ?? null,
        stock: stockByVariant.get(id) ?? null,
        primary_photo: photoByVariant.get(id) ?? null,
        box_count: 1,
        box_quantity: quantityByVariant.get(id) ?? 1,
      };
    })
    .filter((r): r is VariantRow => r !== null);
}

// ────────────────────────────────────────────────────────────────────────────
// Boxes
// ────────────────────────────────────────────────────────────────────────────

export type FlyBoxTier = "kill" | "support" | "archive" | "custom";

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

/** All boxes for the current user, ordered by tier then sort_order. */
export async function listMyBoxes(): Promise<FlyBoxV2[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("fly_boxes")
    .select("*")
    .eq("user_id", user.id)
    .order("tier")
    .order("sort_order")
    .order("created_at");
  if (error) {
    console.error("[listMyBoxes]", error);
    return [];
  }
  return (data ?? []) as FlyBoxV2[];
}

/** Single box by id (RLS gates access to own boxes only). */
export async function getBoxById(id: string): Promise<FlyBoxV2 | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fly_boxes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[getBoxById]", error);
    return null;
  }
  return (data ?? null) as FlyBoxV2 | null;
}

export interface BoxStats {
  total: number;
  byCategory: Record<string, number>;
}

/** Variant counts per box, grouped by pattern category. 3 queries total (no N+1). */
export async function listBoxStats(boxIds: string[]): Promise<Record<string, BoxStats>> {
  if (boxIds.length === 0) return {};
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("fly_variant_in_box")
    .select("box_id, variant_id, quantity")
    .in("box_id", boxIds);
  if (!memberships || memberships.length === 0) return {};

  const variantIds = Array.from(new Set(memberships.map((m: { variant_id: string }) => m.variant_id)));
  const { data: variantRows } = await supabase
    .from("fly_variants")
    .select("id, pattern_id")
    .in("id", variantIds);
  const variantToPattern = new Map<string, string>();
  for (const v of (variantRows ?? []) as { id: string; pattern_id: string }[]) {
    variantToPattern.set(v.id, v.pattern_id);
  }

  const patternIds = Array.from(new Set(Array.from(variantToPattern.values())));
  const { data: patternRows } = await supabase
    .from("fly_patterns_v2")
    .select("id, category")
    .in("id", patternIds);
  const patternCategory = new Map<string, string>();
  for (const p of (patternRows ?? []) as { id: string; category: string | null }[]) {
    if (p.category) patternCategory.set(p.id, p.category);
  }

  const result: Record<string, BoxStats> = {};
  for (const m of memberships as { box_id: string; variant_id: string; quantity?: number }[]) {
    const qty = m.quantity ?? 1;
    if (!result[m.box_id]) result[m.box_id] = { total: 0, byCategory: {} };
    result[m.box_id].total += qty;
    const pid = variantToPattern.get(m.variant_id);
    const cat = pid ? (patternCategory.get(pid) ?? "other") : "other";
    result[m.box_id].byCategory[cat] = (result[m.box_id].byCategory[cat] ?? 0) + qty;
  }
  return result;
}

/** Get the user's default fly_box id (creates one named "My Fly Box" if missing). */
export async function getDefaultFlyBoxId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("fly_boxes")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .maybeSingle();
  if (data?.id) return data.id as string;
  // Lazy-create — keeps the UX of "always a place for new variants" working.
  const { data: created, error } = await supabase
    .from("fly_boxes")
    .insert({ user_id: user.id, name: "My Fly Box", tier: "custom", is_default: true })
    .select("id")
    .single();
  if (error) {
    console.error("[getDefaultFlyBoxId] create", error);
    return null;
  }
  return (created?.id ?? null) as string | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Mutations: create variant, upsert stock, add to box
// ────────────────────────────────────────────────────────────────────────────

/** Create a user-owned variant on a pattern (canonical or personal). */
export async function createUserVariant(input: {
  pattern_id: string;
  size: string;
  bead_material?: Variant["bead_material"];
  bead_weight_mm?: number;
  bead_color?: string;
  body_color?: string;
  rib_color?: string;
  display_name?: string;
  notes?: string;
  hook_style?: string;
  hook_brand?: string;
  materials_override?: Record<string, string>;
}): Promise<Variant | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("fly_variants")
    .insert({
      pattern_id: input.pattern_id,
      created_by_user_id: user.id,
      size: input.size,
      bead_material: input.bead_material ?? null,
      bead_weight_mm: input.bead_weight_mm ?? null,
      bead_color: input.bead_color ?? null,
      body_color: input.body_color ?? null,
      rib_color: input.rib_color ?? null,
      display_name: input.display_name ?? null,
      notes: input.notes ?? null,
      hook_style: input.hook_style ?? null,
      hook_brand: input.hook_brand ?? null,
      materials_override: input.materials_override ?? {},
    })
    .select()
    .single();
  if (error) {
    console.error("[createUserVariant]", error);
    return null;
  }
  return data as Variant;
}

/** Upsert this user's stock entry for a variant (inline edits from the table). */
export async function upsertVariantStock(input: {
  variant_id: string;
  tied_count?: number;
  bought_count?: number;
  target_count?: number;
  is_favorite?: boolean;
  personal_notes?: string;
}): Promise<VariantStock | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("fly_variant_stock")
    .upsert(
      {
        user_id: user.id,
        variant_id: input.variant_id,
        ...("tied_count" in input ? { tied_count: input.tied_count } : {}),
        ...("bought_count" in input ? { bought_count: input.bought_count } : {}),
        ...("target_count" in input ? { target_count: input.target_count } : {}),
        ...("is_favorite" in input ? { is_favorite: input.is_favorite } : {}),
        ...("personal_notes" in input ? { personal_notes: input.personal_notes } : {}),
      },
      { onConflict: "user_id,variant_id" }
    )
    .select()
    .single();
  if (error) {
    console.error("[upsertVariantStock]", error);
    return null;
  }
  return data as VariantStock;
}

/** Add a variant to one or more boxes (bulk). Returns null on auth/db failure,
 *  number of rows touched on success (0 means all variants already in the box). */
export async function addVariantsToBox(
  boxId: string,
  variantIds: string[],
): Promise<number | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (variantIds.length === 0) return 0;

  const rows = variantIds.map<VariantInBox>((vid) => ({
    box_id: boxId,
    variant_id: vid,
    user_id: user.id,
    sort_order: 0,
    quantity: 1,
    added_at: new Date().toISOString(),
  }));
  const { error, count } = await supabase
    .from("fly_variant_in_box")
    .upsert(rows, { onConflict: "box_id,variant_id", count: "exact" });
  if (error) {
    console.error("[addVariantsToBox]", error);
    return null;
  }
  return count ?? variantIds.length;
}

/** Update how many physical flies of a variant are in a specific box. */
export async function updateBoxVariantQuantity(
  boxId: string,
  variantId: string,
  quantity: number,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("fly_variant_in_box")
    .update({ quantity })
    .eq("box_id", boxId)
    .eq("variant_id", variantId);
  if (error) {
    console.error("[updateBoxVariantQuantity]", error);
    return false;
  }
  return true;
}

/**
 * Update a variant's spec fields (size / bead / colors / hook / display_name /
 * notes). Creator can update their own variants; admin can update any
 * (canonical or anyone's user variant). Returns the updated row, or null +
 * error on permission/db failure.
 */
export async function updateVariant(
  variantId: string,
  fields: {
    size?: string;
    bead_material?: Variant["bead_material"] | null;
    bead_weight_mm?: number | null;
    bead_color?: string | null;
    body_color?: string | null;
    rib_color?: string | null;
    hook_style?: string | null;
    hook_brand?: string | null;
    display_name?: string | null;
    notes?: string | null;
  },
): Promise<{ ok: true; variant: Variant } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { data: row, error: loadErr } = await supabase
    .from("fly_variants")
    .select("id, created_by_user_id")
    .eq("id", variantId)
    .maybeSingle();
  if (loadErr) return { ok: false, error: loadErr.message };
  if (!row) return { ok: false, error: "Variant not found." };
  const isCreator = (row as { created_by_user_id: string | null }).created_by_user_id === user.id;
  if (!isCreator && !isAdmin(user.email ?? null)) {
    return { ok: false, error: "You can only edit variants you created. Canonical variants require admin." };
  }

  const updates: Record<string, unknown> = {};
  if (fields.size !== undefined) updates.size = fields.size;
  if (fields.bead_material !== undefined) updates.bead_material = fields.bead_material;
  if (fields.bead_weight_mm !== undefined) updates.bead_weight_mm = fields.bead_weight_mm;
  if (fields.bead_color !== undefined) updates.bead_color = fields.bead_color;
  if (fields.body_color !== undefined) updates.body_color = fields.body_color;
  if (fields.rib_color !== undefined) updates.rib_color = fields.rib_color;
  if (fields.hook_style !== undefined) updates.hook_style = fields.hook_style;
  if (fields.hook_brand !== undefined) updates.hook_brand = fields.hook_brand;
  if (fields.display_name !== undefined) updates.display_name = fields.display_name;
  if (fields.notes !== undefined) updates.notes = fields.notes;

  const { data: updated, error: updErr } = await supabase
    .from("fly_variants")
    .update(updates)
    .eq("id", variantId)
    .select()
    .single();
  if (updErr) {
    console.error("[updateVariant]", updErr);
    return { ok: false, error: updErr.message };
  }
  return { ok: true, variant: updated as Variant };
}

/**
 * Soft-delete a batch of variants. Rules:
 *   - Creator (`created_by_user_id = auth.uid()`) can delete their own variants.
 *   - Admin (per `isAdmin(email)`) can delete canonical variants
 *     (`created_by_user_id IS NULL`) and anyone else's user variants.
 *   - The whole batch is rejected if any single row fails the permission check —
 *     no partial deletes.
 *
 * Catches that referenced these variants are unaffected: their `variant_id`
 * still resolves to the (now-flagged) row, so catch history continues to show
 * the spec used.
 */
export async function softDeleteVariants(
  variantIds: string[],
): Promise<{ deleted: number; error?: string }> {
  if (variantIds.length === 0) return { deleted: 0, error: "No variants supplied." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { deleted: 0, error: "You must be signed in." };

  const { data: rows, error: loadErr } = await supabase
    .from("fly_variants")
    .select("id, created_by_user_id")
    .in("id", variantIds)
    .is("deleted_at", null);
  if (loadErr) {
    console.error("[softDeleteVariants] load", loadErr);
    return { deleted: 0, error: loadErr.message };
  }
  if (!rows || rows.length === 0) return { deleted: 0 };

  const admin = isAdmin(user.email ?? null);
  for (const row of rows as { id: string; created_by_user_id: string | null }[]) {
    const isCreator = row.created_by_user_id === user.id;
    if (!isCreator && !admin) {
      return {
        deleted: 0,
        error: "You can only delete variants you created. Canonical variants require admin.",
      };
    }
  }

  const ids = (rows as { id: string }[]).map((r) => r.id);
  const { error: updateErr, count } = await supabase
    .from("fly_variants")
    .update({ deleted_at: new Date().toISOString() }, { count: "exact" })
    .in("id", ids)
    .is("deleted_at", null);
  if (updateErr) {
    console.error("[softDeleteVariants] update", updateErr);
    return { deleted: 0, error: updateErr.message };
  }
  return { deleted: count ?? ids.length };
}

// ────────────────────────────────────────────────────────────────────────────
// Pattern editing — full pattern fetch, update, slug-redirect
// ────────────────────────────────────────────────────────────────────────────

/**
 * Fetch a pattern with every editable field hydrated. Used by the edit
 * drawer to seed initial state without a second round-trip.
 */
export async function getPatternForEdit(patternId: string): Promise<Pattern | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fly_patterns_v2")
    .select("*")
    .eq("id", patternId)
    .maybeSingle();
  if (error) {
    console.error("[getPatternForEdit]", error);
    return null;
  }
  return (data ?? null) as Pattern | null;
}

export interface PatternUpdateFields {
  name?: string;
  slug?: string | null;
  category?: string | null;
  hook_style?: string | null;
  description?: string | null;
  history?: string | null;
  tying_overview?: string | null;
  fishing_tips?: string | null;
  base_materials?: MaterialSlot[];
  tying_steps?: TyingStep[];
  hero_image_url?: string | null;
}

/**
 * Update a pattern. Permission is enforced both here (assertCanEditPattern)
 * and at the RLS layer — defence in depth. Returns the updated row, or
 * { ok: false } with status (401/403/404/500) so the server action can
 * relay to the UI.
 *
 * If `slug` changes on a canonical pattern, caller is responsible for
 * inserting a fly_pattern_redirects row to keep the old URL alive.
 */
export async function updatePattern(
  patternId: string,
  fields: PatternUpdateFields,
): Promise<
  | { ok: true; pattern: Pattern; slugChanged: boolean; oldSlug: string | null }
  | { ok: false; error: string; status: 401 | 403 | 404 | 500 }
> {
  const supabase = await createClient();
  const guard = await assertCanEditPattern(supabase, patternId);
  if (!guard.ok) return { ok: false, error: guard.error, status: guard.status };

  const oldSlug = guard.pattern.slug;
  const updates: Record<string, unknown> = {};
  if (fields.name !== undefined) updates.name = fields.name;
  if (fields.slug !== undefined) updates.slug = fields.slug;
  if (fields.category !== undefined) updates.category = fields.category;
  if (fields.hook_style !== undefined) updates.hook_style = fields.hook_style;
  if (fields.description !== undefined) updates.description = fields.description;
  if (fields.history !== undefined) updates.history = fields.history;
  if (fields.tying_overview !== undefined) updates.tying_overview = fields.tying_overview;
  if (fields.fishing_tips !== undefined) updates.fishing_tips = fields.fishing_tips;
  if (fields.base_materials !== undefined) updates.base_materials = fields.base_materials;
  if (fields.tying_steps !== undefined) updates.tying_steps = fields.tying_steps;
  if (fields.hero_image_url !== undefined) updates.hero_image_url = fields.hero_image_url;

  if (Object.keys(updates).length === 0) {
    // No-op save — return the row as-is so the caller's revalidate still fires.
    const current = await getPatternForEdit(patternId);
    if (!current) return { ok: false, error: "Pattern vanished mid-update.", status: 404 };
    return { ok: true, pattern: current, slugChanged: false, oldSlug };
  }

  const { data, error } = await supabase
    .from("fly_patterns_v2")
    .update(updates)
    .eq("id", patternId)
    .select()
    .single();
  if (error) {
    console.error("[updatePattern]", error);
    return { ok: false, error: error.message, status: 500 };
  }
  const updated = data as Pattern;
  return {
    ok: true,
    pattern: updated,
    slugChanged: fields.slug !== undefined && fields.slug !== oldSlug,
    oldSlug,
  };
}

/**
 * Cartesian product → batch insert. Each row in the matrix becomes one
 * fly_variants row owned by the current user (created_by_user_id = auth.uid()).
 *
 * Permission: any signed-in user can create user-owned variants on a
 * pattern — RLS on fly_variants gates this. Admin can create canonical
 * variants by passing `as_canonical: true` (created_by_user_id null), but
 * only if assertCanEditPattern passes for the parent pattern.
 */
export interface BulkCreateVariantsInput {
  pattern_id: string;
  sizes: string[];
  bead_colors?: string[];
  body_colors?: string[];
  bead_weights_mm?: number[];
  bead_materials?: BeadMaterial[];
  /** Admin-only: create canonical variants visible to all users. */
  as_canonical?: boolean;
}

export async function bulkCreateVariants(
  input: BulkCreateVariantsInput,
): Promise<
  | { ok: true; variants: Variant[] }
  | { ok: false; error: string; status: 400 | 401 | 403 | 404 | 500 }
> {
  if (input.sizes.length === 0) {
    return { ok: false, error: "At least one size is required.", status: 400 };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in.", status: 401 };

  if (input.as_canonical) {
    const guard = await assertCanEditPattern(supabase, input.pattern_id);
    if (!guard.ok) return { ok: false, error: guard.error, status: guard.status };
  }

  // Cartesian product. Empty optional axes → [undefined] so the loop runs once.
  const beadColors = input.bead_colors?.length ? input.bead_colors : [undefined];
  const bodyColors = input.body_colors?.length ? input.body_colors : [undefined];
  const beadWeights = input.bead_weights_mm?.length ? input.bead_weights_mm : [undefined];
  const beadMaterials = input.bead_materials?.length ? input.bead_materials : [undefined];

  const rows: Record<string, unknown>[] = [];
  for (const size of input.sizes) {
    for (const beadColor of beadColors) {
      for (const bodyColor of bodyColors) {
        for (const beadWeight of beadWeights) {
          for (const beadMaterial of beadMaterials) {
            rows.push({
              pattern_id: input.pattern_id,
              created_by_user_id: input.as_canonical ? null : user.id,
              size,
              bead_color: beadColor ?? null,
              body_color: bodyColor ?? null,
              bead_weight_mm: beadWeight ?? null,
              bead_material: beadMaterial ?? null,
              materials_override: {},
            });
          }
        }
      }
    }
  }

  const { data, error } = await supabase
    .from("fly_variants")
    .insert(rows)
    .select();
  if (error) {
    console.error("[bulkCreateVariants]", error);
    return { ok: false, error: error.message, status: 500 };
  }
  return { ok: true, variants: (data ?? []) as Variant[] };
}

/**
 * Add a list of variants to a box with a per-variant target_count seeded
 * into fly_variant_stock so the deficit calculation lights up immediately.
 * Composes addVariantsToBox + upsertVariantStock in a way the UI can call
 * as one click.
 */
export async function addVariantsToBoxWithQty(
  boxId: string,
  items: { variant_id: string; quantity: number }[],
): Promise<
  | { ok: true; addedToBox: number; stockRows: number }
  | { ok: false; error: string }
> {
  if (items.length === 0) return { ok: true, addedToBox: 0, stockRows: 0 };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const variantIds = items.map((i) => i.variant_id);
  const boxRows = items.map<VariantInBox>((i) => ({
    box_id: boxId,
    variant_id: i.variant_id,
    user_id: user.id,
    sort_order: 0,
    quantity: Math.max(1, Math.floor(i.quantity || 1)),
    added_at: new Date().toISOString(),
  }));
  const { error: boxErr, count } = await supabase
    .from("fly_variant_in_box")
    .upsert(boxRows, { onConflict: "box_id,variant_id", count: "exact" });
  if (boxErr) {
    console.error("[addVariantsToBoxWithQty] box", boxErr);
    return { ok: false, error: boxErr.message };
  }

  const stockRows = items.map((i) => ({
    user_id: user.id,
    variant_id: i.variant_id,
    target_count: Math.max(0, Math.floor(i.quantity || 0)),
  }));
  const { error: stockErr } = await supabase
    .from("fly_variant_stock")
    .upsert(stockRows, { onConflict: "user_id,variant_id" });
  if (stockErr) {
    // Box-add already succeeded — surface the error but don't roll back.
    // The user can correct target counts manually from the variant table.
    console.error("[addVariantsToBoxWithQty] stock", stockErr);
    return { ok: false, error: `Added to box, but target counts failed: ${stockErr.message}` };
  }

  return { ok: true, addedToBox: count ?? variantIds.length, stockRows: stockRows.length };
}

// ────────────────────────────────────────────────────────────────────────────
// Slug redirects (canonical rename safety)
// ────────────────────────────────────────────────────────────────────────────

export interface PatternRedirectHit {
  pattern_id: string;
  current_slug: string | null;
}

/**
 * If `slug` matches a row in fly_pattern_redirects, return the current slug
 * to redirect to. Returns null when no redirect is registered.
 */
export async function lookupPatternRedirect(slug: string): Promise<PatternRedirectHit | null> {
  const supabase = createStaticClient();
  const { data: redirect, error } = await supabase
    .from("fly_pattern_redirects")
    .select("pattern_id")
    .eq("old_slug", slug)
    .maybeSingle();
  if (error || !redirect) return null;

  const { data: pattern } = await supabase
    .from("fly_patterns_v2")
    .select("slug")
    .eq("id", (redirect as { pattern_id: string }).pattern_id)
    .maybeSingle();

  return {
    pattern_id: (redirect as { pattern_id: string }).pattern_id,
    current_slug: ((pattern as { slug: string | null } | null)?.slug) ?? null,
  };
}

/** Insert a redirect row when an admin renames a canonical pattern's slug. */
export async function insertPatternRedirect(oldSlug: string, patternId: string): Promise<boolean> {
  if (!oldSlug) return true;
  const supabase = await createClient();
  const { error } = await supabase
    .from("fly_pattern_redirects")
    .upsert({ old_slug: oldSlug, pattern_id: patternId }, { onConflict: "old_slug" });
  if (error) {
    console.error("[insertPatternRedirect]", error);
    return false;
  }
  return true;
}

/** Remove a variant from a box. */
export async function removeVariantFromBox(boxId: string, variantId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("fly_variant_in_box")
    .delete()
    .eq("box_id", boxId)
    .eq("variant_id", variantId);
  if (error) {
    console.error("[removeVariantFromBox]", error);
    return false;
  }
  return true;
}
