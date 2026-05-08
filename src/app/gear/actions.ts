"use server";
/**
 * Server actions for the Gear catalog list.
 *
 * The catalog page (`/gear`) shows manufacturer products. Tapping the inline
 * "+ Add to Locker" button on any row creates a personal `gear_items` row
 * for the current user, populated from the catalog product. No deep product
 * page navigation needed.
 */
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Map from gear_products.category to gear_items.type. */
function productCategoryToLockerType(c: string): string {
  switch (c) {
    case "rod": return "rod";
    case "reel": return "reel";
    case "line": return "line";
    case "leader": return "leader";
    case "tippet": return "tippet";
    case "net": return "net";
    case "waders":
    case "wading-boots": return "waders";
    case "pack":
    default: return "other";
  }
}

export interface AddProductToLockerInput {
  product_id: string;
}

export async function addProductToLockerAction(input: AddProductToLockerInput): Promise<{
  ok: boolean;
  locker_item_id?: string;
  alreadyOwned?: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to add to your locker." };

  // Look up the catalog product
  const { data: product, error: pErr } = await supabase
    .from("gear_products")
    .select("id, slug, name, category, brand_id, msrp_usd, specs")
    .eq("id", input.product_id)
    .maybeSingle();
  if (pErr || !product) return { ok: false, error: "Product not found." };

  // Brand name for denormalization
  let brandName: string | null = null;
  if (product.brand_id) {
    const { data: brand } = await supabase
      .from("gear_brands")
      .select("name")
      .eq("id", product.brand_id)
      .maybeSingle();
    brandName = brand?.name ?? null;
  }

  // If the user already added this product to their locker, return that.
  const { data: existing } = await supabase
    .from("gear_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("gear_product_id", product.id)
    .maybeSingle();
  if (existing?.id) {
    return { ok: true, locker_item_id: existing.id, alreadyOwned: true };
  }

  const lockerType = productCategoryToLockerType(product.category as string);

  const { data: inserted, error: insertErr } = await supabase
    .from("gear_items")
    .insert({
      user_id: user.id,
      gear_product_id: product.id,
      type: lockerType,
      name: product.name as string,
      maker: brandName,
      specs: product.specs ?? {},
      is_active: true,
    })
    .select("id")
    .single();
  if (insertErr) return { ok: false, error: insertErr.message };

  revalidatePath("/gear");
  revalidatePath("/account/gear");
  return { ok: true, locker_item_id: inserted?.id };
}
