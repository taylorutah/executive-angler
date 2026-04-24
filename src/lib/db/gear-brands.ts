import type { GearBrand } from "@/types/gear-catalog";
import { createStaticClient } from "@/lib/supabase/static";
import { withRetry } from "./retry";

function mapRow(r: Record<string, unknown>): GearBrand {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    tagline: (r.tagline ?? undefined) as string | undefined,
    description: (r.description ?? "") as string,
    logoUrl: (r.logo_url ?? undefined) as string | undefined,
    heroImageUrl: (r.hero_image_url ?? undefined) as string | undefined,
    heroImageAlt: (r.hero_image_alt ?? undefined) as string | undefined,
    heroImageCredit: (r.hero_image_credit ?? undefined) as string | undefined,
    heroImageCreditUrl: (r.hero_image_credit_url ?? undefined) as string | undefined,
    websiteUrl: (r.website_url ?? undefined) as string | undefined,
    country: (r.country ?? undefined) as string | undefined,
    foundedYear: r.founded_year ? Number(r.founded_year) : undefined,
    headquarters: (r.headquarters ?? undefined) as string | undefined,
    specialties: (r.specialties as string[]) ?? [],
    featured: Boolean(r.featured),
    sortOrder: r.sort_order ? Number(r.sort_order) : 0,
    metaTitle: (r.meta_title ?? undefined) as string | undefined,
    metaDescription: (r.meta_description ?? undefined) as string | undefined,
  };
}

export async function getAllGearBrands(): Promise<GearBrand[]> {
  return withRetry(async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("gear_brands")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name");

    if (error) {
      console.error("[getAllGearBrands] Supabase error:", error);
      throw error;
    }
    return (data ?? []).map(mapRow);
  }, "getAllGearBrands");
}

export async function getGearBrandBySlug(slug: string): Promise<GearBrand | undefined> {
  return withRetry(async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("gear_brands")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("[getGearBrandBySlug] Supabase error:", error);
      throw error;
    }
    return mapRow(data as Record<string, unknown>);
  }, "getGearBrandBySlug").catch((err) => {
    console.error(`[getGearBrandBySlug] All retries failed for "${slug}":`, err);
    return undefined;
  });
}

export async function getFeaturedGearBrands(): Promise<GearBrand[]> {
  return withRetry(async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("gear_brands")
      .select("*")
      .eq("featured", true)
      .order("sort_order", { ascending: true })
      .order("name");

    if (error) {
      console.error("[getFeaturedGearBrands] Supabase error:", error);
      throw error;
    }
    return (data ?? []).map(mapRow);
  }, "getFeaturedGearBrands");
}

export async function getGearBrandById(id: string): Promise<GearBrand | undefined> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("gear_brands")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return undefined;
  }
  return mapRow(data as Record<string, unknown>);
}
