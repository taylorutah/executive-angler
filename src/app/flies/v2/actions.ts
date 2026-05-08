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
} from "@/lib/db/fly-v2";

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
  revalidatePath(`/flies/v2/${input.pattern_slug}`);
  revalidatePath(`/flies/v2`);
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
  revalidatePath(`/flies/v2/${input.pattern_slug}`);
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

  if (patternSlug) revalidatePath(`/flies/v2/${patternSlug}`);
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
  if (added === 0) return { ok: false, error: "Failed to add variants. Are you signed in?" };
  revalidatePath(`/flies/v2/${input.pattern_slug}`);
  revalidatePath(`/flies/boxes`);
  return { ok: true, added };
}
