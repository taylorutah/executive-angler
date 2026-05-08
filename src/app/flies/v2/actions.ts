"use server";
/**
 * Server actions for the v2 Flies surface.
 *
 * These run on the server, mutate via the authenticated Supabase client,
 * and call revalidatePath so the RSC re-renders with fresh data.
 */
import { revalidatePath } from "next/cache";
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
