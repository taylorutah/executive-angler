import type { FlyShop } from "@/types/entities";
import { createStaticClient } from "@/lib/supabase/static";
import { withRetry } from "./retry";

function mapRow(r: Record<string, unknown>): FlyShop {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    destinationId: (r.destination_id ?? "") as string,
    description: (r.description ?? "") as string,
    heroImageUrl: (r.hero_image_url ?? undefined) as string | undefined,
    address: (r.address ?? "") as string,
    latitude: r.latitude ? Number(r.latitude) : 0,
    longitude: r.longitude ? Number(r.longitude) : 0,
    phone: (r.phone ?? undefined) as string | undefined,
    websiteUrl: (r.website_url ?? undefined) as string | undefined,
    hours: (r.hours ?? undefined) as Record<string, string> | undefined,
    services: (r.services as string[]) ?? [],
    brandsCarried: (r.brands_carried as string[]) ?? [],
    googlePlaceId: (r.google_place_id ?? undefined) as string | undefined,
    googleRating: r.google_rating ? Number(r.google_rating) : undefined,
    googleReviewCount: r.google_review_count ? Number(r.google_review_count) : undefined,
    googleReviewsUrl: (r.google_reviews_url ?? undefined) as string | undefined,
    metaTitle: (r.meta_title ?? undefined) as string | undefined,
    metaDescription: (r.meta_description ?? undefined) as string | undefined,
  };
}

export async function getAllFlyShops(): Promise<FlyShop[]> {
  return withRetry(async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("fly_shops")
      .select("*")
      .order("name");

    if (error) {
      console.error("[getAllFlyShops] Supabase error:", error);
      throw error;
    }
    return (data ?? []).map(mapRow);
  }, "getAllFlyShops");
}

export async function getFlyShopBySlug(slug: string): Promise<FlyShop | undefined> {
  return withRetry(async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("fly_shops")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("[getFlyShopBySlug] Supabase error:", error);
      throw error;
    }
    return mapRow(data as Record<string, unknown>);
  }, "getFlyShopBySlug").catch((err) => {
    console.error(`[getFlyShopBySlug] All retries failed for "${slug}":`, err);
    return undefined;
  });
}

export async function getFlyShopsByDestination(destinationId: string): Promise<FlyShop[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("fly_shops")
    .select("*")
    .eq("destination_id", destinationId)
    .order("name");

  if (error) {
    console.error("[getFlyShopsByDestination] Supabase error:", error);
    return [];
  }
  return (data ?? []).map(mapRow);
}
