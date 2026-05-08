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
import type {
  Pattern,
  Variant,
  VariantStock,
  VariantInBox,
  VariantPhoto,
  VariantRow,
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
    .select("box_id, variant_id")
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
  for (const m of memberships as { box_id: string; variant_id: string }[]) {
    if (!result[m.box_id]) result[m.box_id] = { total: 0, byCategory: {} };
    result[m.box_id].total++;
    const pid = variantToPattern.get(m.variant_id);
    const cat = pid ? (patternCategory.get(pid) ?? "other") : "other";
    result[m.box_id].byCategory[cat] = (result[m.box_id].byCategory[cat] ?? 0) + 1;
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
