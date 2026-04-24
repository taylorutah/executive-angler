import type { GearProduct, GearProductCategory } from "@/types/gear-catalog";
import { createStaticClient } from "@/lib/supabase/static";
import { withRetry } from "./retry";

function mapRow(r: Record<string, unknown>): GearProduct {
  return {
    id: r.id as string,
    slug: r.slug as string,
    brandId: r.brand_id as string,
    name: r.name as string,
    category: r.category as GearProductCategory,
    description: (r.description ?? "") as string,
    heroImageUrl: (r.hero_image_url ?? undefined) as string | undefined,
    heroImageAlt: (r.hero_image_alt ?? undefined) as string | undefined,
    heroImageCredit: (r.hero_image_credit ?? undefined) as string | undefined,
    heroImageCreditUrl: (r.hero_image_credit_url ?? undefined) as string | undefined,
    galleryUrls: (r.gallery_urls as string[]) ?? [],
    msrpUsd: r.msrp_usd ? Number(r.msrp_usd) : undefined,
    specs: (r.specs as Record<string, unknown>) ?? {},
    useCases: (r.use_cases as string[]) ?? [],
    relatedRiverIds: (r.related_river_ids as string[]) ?? [],
    relatedSpeciesIds: (r.related_species_ids as string[]) ?? [],
    productUrl: (r.product_url ?? undefined) as string | undefined,
    featured: Boolean(r.featured),
    metaTitle: (r.meta_title ?? undefined) as string | undefined,
    metaDescription: (r.meta_description ?? undefined) as string | undefined,
  };
}

export async function getAllGearProducts(): Promise<GearProduct[]> {
  return withRetry(async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("gear_products")
      .select("*")
      .order("name");

    if (error) {
      console.error("[getAllGearProducts] Supabase error:", error);
      throw error;
    }
    return (data ?? []).map(mapRow);
  }, "getAllGearProducts");
}

export async function getGearProductBySlug(slug: string): Promise<GearProduct | undefined> {
  return withRetry(async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("gear_products")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("[getGearProductBySlug] Supabase error:", error);
      throw error;
    }
    return mapRow(data as Record<string, unknown>);
  }, "getGearProductBySlug").catch((err) => {
    console.error(`[getGearProductBySlug] All retries failed for "${slug}":`, err);
    return undefined;
  });
}

export async function getGearProductsByBrand(brandId: string): Promise<GearProduct[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("gear_products")
    .select("*")
    .eq("brand_id", brandId)
    .order("category")
    .order("name");

  if (error) {
    console.error("[getGearProductsByBrand] Supabase error:", error);
    return [];
  }
  return (data ?? []).map(mapRow);
}

export async function getGearProductsByCategory(
  category: GearProductCategory
): Promise<GearProduct[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("gear_products")
    .select("*")
    .eq("category", category)
    .order("name");

  if (error) {
    console.error("[getGearProductsByCategory] Supabase error:", error);
    return [];
  }
  return (data ?? []).map(mapRow);
}

export async function getFeaturedGearProducts(): Promise<GearProduct[]> {
  return withRetry(async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("gear_products")
      .select("*")
      .eq("featured", true)
      .order("name");

    if (error) {
      console.error("[getFeaturedGearProducts] Supabase error:", error);
      throw error;
    }
    return (data ?? []).map(mapRow);
  }, "getFeaturedGearProducts");
}

export async function getGearProductById(id: string): Promise<GearProduct | undefined> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("gear_products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return undefined;
  }
  return mapRow(data as Record<string, unknown>);
}
