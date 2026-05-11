"use server";
/**
 * Server actions for the v2 Flies surface.
 *
 * These run on the server, mutate via the authenticated Supabase client,
 * and call revalidatePath so the RSC re-renders with fresh data.
 */
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  upsertVariantStock,
  createUserVariant,
  addVariantsToBox,
  softDeleteVariants,
  removeVariantsFromBox,
  updateVariant,
  updateBoxVariantQuantity,
  updateBoxVariantTargetQuantity,
  cloneVariant,
  updatePattern,
  bulkCreateVariants,
  addVariantsToBoxWithQty,
  insertPatternRedirect,
  type PatternUpdateFields,
} from "@/lib/db/fly-v2";
import { assertCanEditPattern } from "@/lib/flies/permissions";
import type { BeadMaterial } from "@/types/fly-v2";

export interface UpdateStockInput {
  variant_id: string;
  pattern_slug: string;
  field: "tied_count" | "bought_count" | "target_count";
  value: number;
}

/** Inline-edit a stock count from the Variant table. */
export async function updateStockAction(input: UpdateStockInput): Promise<{ ok: boolean; error?: string }> {
  if (!Number.isFinite(input.value) || input.value < 0) {
    return { ok: false, error: "Count must be a non-negative number." };
  }
  const result = await upsertVariantStock({
    variant_id: input.variant_id,
    [input.field]: Math.floor(input.value),
  });
  if (!result) return { ok: false, error: "Failed to update stock." };
  if (input.pattern_slug) revalidatePath(`/flies/${input.pattern_slug}`);
  // Box detail pages display this stock too — revalidate the layout so all
  // /flies/boxes/[id] pages see the change.
  revalidatePath("/flies/boxes/[id]", "page");
  revalidatePath("/flies/boxes");
  return { ok: true };
}

export interface CreateVariantInput {
  pattern_id: string;
  pattern_slug: string;
  size: string;
  bead_material?: "tungsten" | "brass" | "glass" | "none";
  bead_weight_mm?: number;
  bead_color?: string;
  body_color?: string;
  rib_color?: string;
  display_name?: string;
  notes?: string;
}

/**
 * Clone an existing variant. Source spec is copied verbatim into a new row.
 * Admin cloning a Curated row produces a Curated clone; otherwise the clone
 * is created as user-owned. After cloning, the caller typically opens the
 * Edit modal on the new row to tweak (size, bead size, etc.).
 */
export async function cloneVariantAction(input: {
  variant_id: string;
  pattern_slug: string;
}): Promise<{ ok: boolean; variantId?: string; error?: string }> {
  const created = await cloneVariant(input.variant_id);
  if (!created) return { ok: false, error: "Failed to clone — check permissions or that the source variant still exists." };
  revalidatePath(`/flies/${input.pattern_slug}`);
  return { ok: true, variantId: created.id };
}

/** Create a user-owned variant on a pattern. */
export async function createVariantAction(input: CreateVariantInput): Promise<{ ok: boolean; variantId?: string; error?: string }> {
  if (!input.size?.trim()) return { ok: false, error: "Size is required." };
  const variant = await createUserVariant({
    pattern_id: input.pattern_id,
    size: input.size.trim(),
    bead_material: input.bead_material === "none" ? null : input.bead_material,
    bead_weight_mm: input.bead_weight_mm,
    bead_color: input.bead_color,
    body_color: input.body_color,
    rib_color: input.rib_color,
    display_name: input.display_name,
    notes: input.notes,
  });
  if (!variant) return { ok: false, error: "Failed to create variant. Are you signed in?" };
  revalidatePath(`/flies/${input.pattern_slug}`);
  return { ok: true, variantId: variant.id };
}

/**
 * Upload a photo for a variant. Stores at <user_id>/<variant_id>/<photo_id>.<ext>
 * in the `variant-photos` bucket and inserts a `fly_variant_photos` row.
 * If the variant has no primary photo yet, the new photo becomes primary.
 */
export async function uploadVariantPhotoAction(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
  storagePath?: string;
}> {
  const file = formData.get("file");
  const variantId = formData.get("variant_id");
  const patternSlug = formData.get("pattern_slug");
  const caption = formData.get("caption");

  if (!(file instanceof File)) return { ok: false, error: "No file provided." };
  if (typeof variantId !== "string" || !variantId) return { ok: false, error: "Missing variant_id." };
  if (typeof patternSlug !== "string") return { ok: false, error: "Missing pattern_slug." };
  if (file.size > 10 * 1024 * 1024) return { ok: false, error: "File over 10 MB." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in to upload." };

  // Photos can only be attached to variants the user created. Canonical
  // variants (created_by_user_id null) are admin-curated; user-uploaded
  // photos on them would otherwise leak across the public library and
  // could even be set is_primary by accident, hijacking the canonical
  // display image for everyone.
  const { data: variantOwner, error: vErr } = await supabase
    .from("fly_variants")
    .select("created_by_user_id")
    .eq("id", variantId)
    .maybeSingle();
  if (vErr || !variantOwner) return { ok: false, error: "Variant not found." };
  if (variantOwner.created_by_user_id !== user.id) {
    return { ok: false, error: "Photos can only be added to variants you created. Add your own variant from the pattern detail page first." };
  }

  // Build storage path: <user>/<variant>/<random>.<ext>
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const photoId = crypto.randomUUID();
  const storagePath = `${user.id}/${variantId}/${photoId}.${ext}`;

  // Upload bytes
  const arrayBuf = await file.arrayBuffer();
  const { error: uploadErr } = await supabase.storage
    .from("variant-photos")
    .upload(storagePath, new Uint8Array(arrayBuf), {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (uploadErr) {
    console.error("[uploadVariantPhotoAction] storage", uploadErr);
    return { ok: false, error: uploadErr.message };
  }

  // Is this the first photo for this variant? If so, mark primary.
  const { count: existingPrimary } = await supabase
    .from("fly_variant_photos")
    .select("id", { count: "exact", head: true })
    .eq("variant_id", variantId)
    .eq("is_primary", true);
  const isPrimary = (existingPrimary ?? 0) === 0;

  const { error: insertErr } = await supabase.from("fly_variant_photos").insert({
    variant_id: variantId,
    user_id: user.id,
    storage_path: storagePath,
    caption: typeof caption === "string" && caption.length > 0 ? caption : null,
    is_primary: isPrimary,
    sort_order: 0,
  });
  if (insertErr) {
    console.error("[uploadVariantPhotoAction] insert", insertErr);
    // Best-effort cleanup of orphaned storage object
    await supabase.storage.from("variant-photos").remove([storagePath]);
    return { ok: false, error: insertErr.message };
  }

  if (patternSlug) revalidatePath(`/flies/${patternSlug}`);
  return { ok: true, storagePath };
}

export interface AddToBoxInput {
  pattern_slug: string;
  box_id: string;
  variant_ids: string[];
}

/** Bulk action: add variants to a fly box. */
export async function addToBoxAction(input: AddToBoxInput): Promise<{ ok: boolean; added?: number; error?: string }> {
  if (input.variant_ids.length === 0) return { ok: false, error: "No variants selected." };
  const added = await addVariantsToBox(input.box_id, input.variant_ids);
  if (added === null) return { ok: false, error: "Failed to add variants. Are you signed in?" };
  revalidatePath(`/flies/${input.pattern_slug}`);
  revalidatePath(`/flies/boxes`);
  return { ok: true, added };
}

export interface UpdateVariantInput {
  variant_id: string;
  pattern_slug: string;
  size?: string;
  bead_material?: "tungsten" | "brass" | "glass" | "none" | null;
  bead_weight_mm?: number | null;
  bead_color?: string | null;
  body_color?: string | null;
  rib_color?: string | null;
  hook_style?: string | null;
  hook_brand?: string | null;
  display_name?: string | null;
  notes?: string | null;
}

/** Edit a single variant. Creator-only (admin can edit any). */
export async function updateVariantAction(input: UpdateVariantInput): Promise<{ ok: boolean; error?: string }> {
  if (input.size !== undefined && !input.size.trim()) {
    return { ok: false, error: "Size cannot be empty." };
  }
  const result = await updateVariant(input.variant_id, {
    size: input.size?.trim(),
    bead_material: input.bead_material === "none" ? null : input.bead_material,
    bead_weight_mm: input.bead_weight_mm,
    bead_color: input.bead_color,
    body_color: input.body_color,
    rib_color: input.rib_color,
    hook_style: input.hook_style,
    hook_brand: input.hook_brand,
    display_name: input.display_name,
    notes: input.notes,
  });
  if (!result.ok) return { ok: false, error: result.error };
  if (input.pattern_slug) revalidatePath(`/flies/${input.pattern_slug}`);
  revalidatePath("/flies/boxes/[id]", "page");
  revalidatePath("/flies/boxes");
  return { ok: true };
}

export interface DeleteVariantsInput {
  pattern_slug: string;
  variant_ids: string[];
}

/**
 * Bulk action: soft-delete variants (sets `deleted_at`). Catches that
 * referenced these variants keep their FK link and continue to display
 * the spec — only the pattern detail table hides the rows.
 */
export async function deleteVariantsAction(input: DeleteVariantsInput): Promise<{ ok: boolean; deleted?: number; error?: string }> {
  if (input.variant_ids.length === 0) return { ok: false, error: "No variants selected." };
  const result = await softDeleteVariants(input.variant_ids);
  if (result.error) return { ok: false, error: result.error };
  if (input.pattern_slug) revalidatePath(`/flies/${input.pattern_slug}`);
  revalidatePath("/flies/boxes/[id]", "page");
  revalidatePath("/flies/boxes");
  return { ok: true, deleted: result.deleted };
}

export interface RemoveFromBoxInput {
  box_id: string;
  variant_ids: string[];
}

/**
 * Bulk action: remove variants from a fly box. Only unlinks — the underlying
 * variants and their stock/photos are untouched, so the user can re-add later.
 */
export async function removeFromBoxAction(input: RemoveFromBoxInput): Promise<{ ok: boolean; removed?: number; error?: string }> {
  if (input.variant_ids.length === 0) return { ok: false, error: "No variants selected." };
  const result = await removeVariantsFromBox(input.box_id, input.variant_ids);
  if (result.error) return { ok: false, error: result.error };
  revalidatePath(`/flies/boxes/${input.box_id}`);
  revalidatePath("/flies/boxes/[id]", "page");
  revalidatePath("/flies/boxes");
  revalidatePath("/flies");
  return { ok: true, removed: result.removed };
}

export interface UpdateBoxQuantityInput {
  box_id: string;
  variant_id: string;
  quantity: number;
}

export interface UpdateBoxTargetQuantityInput {
  box_id: string;
  variant_id: string;
  /** Pass null to clear the per-box target (fall back to global target). */
  target_quantity: number | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Pattern editing — name/recipe/steps/editorial/hero
// ────────────────────────────────────────────────────────────────────────────

export interface UpdatePatternInput {
  pattern_id: string;
  /** Current slug — used to revalidate the existing URL even if slug changes. */
  pattern_slug: string;
  fields: PatternUpdateFields;
}

/**
 * Edit any subset of a pattern's editable fields. Permission is enforced
 * inside updatePattern (assertCanEditPattern + RLS). When the slug changes
 * on a canonical pattern, an automatic redirect row keeps the old URL
 * 301-ing to the new one.
 */
export async function updatePatternAction(
  input: UpdatePatternInput,
): Promise<{ ok: boolean; error?: string; newSlug?: string | null }> {
  const result = await updatePattern(input.pattern_id, input.fields);
  if (!result.ok) return { ok: false, error: result.error };

  if (result.slugChanged && result.oldSlug && result.pattern.owner_user_id === null) {
    // Canonical rename — preserve old URL.
    await insertPatternRedirect(result.oldSlug, result.pattern.id);
  }

  if (input.pattern_slug) revalidatePath(`/flies/${input.pattern_slug}`);
  if (result.pattern.slug && result.pattern.slug !== input.pattern_slug) {
    revalidatePath(`/flies/${result.pattern.slug}`);
  }
  // Catalog pages list pattern names/categories — refresh.
  revalidatePath("/flies");
  revalidatePath("/flies/library");

  return { ok: true, newSlug: result.pattern.slug };
}

/**
 * Upload a hero image for a pattern. Storage path:
 *   personal: <user_id>/<pattern_id>/<photo_id>.<ext>
 *   canonical (admin): admin/<pattern_id>/<photo_id>.<ext>
 * On success, sets pattern.hero_image_url to the public URL.
 */
export async function uploadPatternHeroAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string; url?: string }> {
  const file = formData.get("file");
  const patternId = formData.get("pattern_id");
  const patternSlug = formData.get("pattern_slug");

  if (!(file instanceof File)) return { ok: false, error: "No file provided." };
  if (typeof patternId !== "string" || !patternId) return { ok: false, error: "Missing pattern_id." };
  if (typeof patternSlug !== "string") return { ok: false, error: "Missing pattern_slug." };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: "File over 5 MB." };

  const supabase = await createClient();
  const guard = await assertCanEditPattern(supabase, patternId);
  if (!guard.ok) return { ok: false, error: guard.error };

  const folderPrefix = guard.pattern.owner_user_id === null ? "admin" : guard.user.id;
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const photoId = crypto.randomUUID();
  const storagePath = `${folderPrefix}/${patternId}/${photoId}.${ext}`;

  const arrayBuf = await file.arrayBuffer();
  const { error: uploadErr } = await supabase.storage
    .from("pattern-hero-photos")
    .upload(storagePath, new Uint8Array(arrayBuf), {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (uploadErr) {
    console.error("[uploadPatternHeroAction] storage", uploadErr);
    return { ok: false, error: uploadErr.message };
  }

  const { data: pub } = supabase.storage.from("pattern-hero-photos").getPublicUrl(storagePath);
  const publicUrl = pub.publicUrl;

  const writeResult = await updatePattern(patternId, { hero_image_url: publicUrl });
  if (!writeResult.ok) {
    // Best-effort cleanup if the metadata write failed.
    await supabase.storage.from("pattern-hero-photos").remove([storagePath]);
    return { ok: false, error: writeResult.error };
  }

  if (patternSlug) revalidatePath(`/flies/${patternSlug}`);
  return { ok: true, url: publicUrl };
}

/**
 * Upload a single tying-step photo. Returns the public URL — the client
 * writes it back into the appropriate `tying_steps[i].image_url` and saves
 * the whole steps array via updatePatternAction.
 */
export async function uploadTyingStepPhotoAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string; url?: string }> {
  const file = formData.get("file");
  const patternId = formData.get("pattern_id");

  if (!(file instanceof File)) return { ok: false, error: "No file provided." };
  if (typeof patternId !== "string" || !patternId) return { ok: false, error: "Missing pattern_id." };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: "File over 5 MB." };

  const supabase = await createClient();
  const guard = await assertCanEditPattern(supabase, patternId);
  if (!guard.ok) return { ok: false, error: guard.error };

  const folderPrefix = guard.pattern.owner_user_id === null ? "admin" : guard.user.id;
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const photoId = crypto.randomUUID();
  const storagePath = `${folderPrefix}/${patternId}/${photoId}.${ext}`;

  const arrayBuf = await file.arrayBuffer();
  const { error: uploadErr } = await supabase.storage
    .from("pattern-step-photos")
    .upload(storagePath, new Uint8Array(arrayBuf), {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (uploadErr) {
    console.error("[uploadTyingStepPhotoAction] storage", uploadErr);
    return { ok: false, error: uploadErr.message };
  }
  const { data: pub } = supabase.storage.from("pattern-step-photos").getPublicUrl(storagePath);
  return { ok: true, url: pub.publicUrl };
}

// ────────────────────────────────────────────────────────────────────────────
// Bulk variant builder
// ────────────────────────────────────────────────────────────────────────────

export interface BulkCreateVariantsActionInput {
  pattern_id: string;
  pattern_slug: string;
  sizes: string[];
  bead_colors?: string[];
  body_colors?: string[];
  bead_weights_mm?: number[];
  bead_materials?: BeadMaterial[];
  /** Admin-only: produce canonical variants instead of user-owned ones. */
  as_canonical?: boolean;
  /** If supplied, also drop every created variant into this box at qty. */
  add_to_box?: { box_id: string; quantity_per_variant: number };
}

export async function bulkCreateVariantsAction(
  input: BulkCreateVariantsActionInput,
): Promise<{ ok: boolean; error?: string; created?: number; addedToBox?: number }> {
  if (input.sizes.length === 0) {
    return { ok: false, error: "Pick at least one size." };
  }
  const result = await bulkCreateVariants({
    pattern_id: input.pattern_id,
    sizes: input.sizes,
    bead_colors: input.bead_colors,
    body_colors: input.body_colors,
    bead_weights_mm: input.bead_weights_mm,
    bead_materials: input.bead_materials,
    as_canonical: input.as_canonical,
  });
  if (!result.ok) return { ok: false, error: result.error };

  let addedToBox = 0;
  if (input.add_to_box && result.variants.length > 0) {
    const boxResult = await addVariantsToBoxWithQty(
      input.add_to_box.box_id,
      result.variants.map((v) => ({
        variant_id: v.id,
        quantity: input.add_to_box!.quantity_per_variant,
      })),
    );
    if (!boxResult.ok) {
      // Variants exist; box-add failed. Tell the caller exactly that.
      revalidatePath(`/flies/${input.pattern_slug}`);
      return {
        ok: false,
        created: result.variants.length,
        error: `Created ${result.variants.length} variants, but adding to box failed: ${boxResult.error}`,
      };
    }
    addedToBox = boxResult.addedToBox;
  }

  revalidatePath(`/flies/${input.pattern_slug}`);
  if (input.add_to_box) {
    revalidatePath(`/flies/boxes/${input.add_to_box.box_id}`);
    revalidatePath("/flies/boxes", "layout");
  }
  return { ok: true, created: result.variants.length, addedToBox };
}

/** Update how many physical flies of a variant are in a specific box. */
export async function updateBoxQuantityAction(
  input: UpdateBoxQuantityInput,
): Promise<{ ok: boolean; error?: string }> {
  if (!Number.isFinite(input.quantity) || input.quantity < 0) {
    return { ok: false, error: "Quantity must be a non-negative number." };
  }
  const ok = await updateBoxVariantQuantity(
    input.box_id,
    input.variant_id,
    Math.floor(input.quantity),
  );
  if (!ok) return { ok: false, error: "Failed to update quantity." };
  revalidatePath(`/flies/boxes/${input.box_id}`);
  return { ok: true };
}

/**
 * Set the per-box target tied count for a variant. Pass `target_quantity = 0`
 * (or null via a `Clear` UI action) to revert to the global target.
 */
export async function updateBoxTargetQuantityAction(
  input: UpdateBoxTargetQuantityInput,
): Promise<{ ok: boolean; error?: string }> {
  const next = input.target_quantity;
  if (next != null) {
    if (!Number.isFinite(next) || next < 0) {
      return { ok: false, error: "Target must be a non-negative number." };
    }
  }
  const ok = await updateBoxVariantTargetQuantity(
    input.box_id,
    input.variant_id,
    next == null ? null : Math.floor(next),
  );
  if (!ok) return { ok: false, error: "Failed to update per-box target." };
  revalidatePath(`/flies/boxes/${input.box_id}`);
  return { ok: true };
}
