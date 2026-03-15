import type { Lodge } from "@/types/entities";
import { createStaticClient } from "@/lib/supabase/static";

function mapRow(r: Record<string, unknown>): Lodge {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    destinationId: (r.destination_id ?? "") as string,
    description: (r.description ?? "") as string,
    heroImageUrl: (r.hero_image_url ?? "") as string,
    thumbnailUrl: (r.thumbnail_url ?? undefined) as string | undefined,
    galleryUrls: (r.gallery_urls as string[]) ?? [],
    websiteUrl: (r.website_url ?? undefined) as string | undefined,
    phone: (r.phone ?? undefined) as string | undefined,
    email: (r.email ?? undefined) as string | undefined,
    address: (r.address ?? undefined) as string | undefined,
    latitude: r.latitude ? Number(r.latitude) : 0,
    longitude: r.longitude ? Number(r.longitude) : 0,
    priceRange: (r.price_range ?? undefined) as string | undefined,
    priceTier: r.price_tier ? Number(r.price_tier) : 2,
    seasonStart: (r.season_start ?? undefined) as string | undefined,
    seasonEnd: (r.season_end ?? undefined) as string | undefined,
    capacity: r.capacity ? Number(r.capacity) : undefined,
    amenities: (r.amenities as string[]) ?? [],
    nearbyRiverIds: (r.nearby_river_ids as string[]) ?? [],
    averageRating: r.average_rating ? Number(r.average_rating) : undefined,
    reviewCount: r.review_count ? Number(r.review_count) : 0,
    googlePlaceId: (r.google_place_id ?? undefined) as string | undefined,
    googleRating: r.google_rating ? Number(r.google_rating) : undefined,
    googleReviewCount: r.google_review_count ? Number(r.google_review_count) : undefined,
    googleReviewsUrl: (r.google_reviews_url ?? undefined) as string | undefined,
    metaTitle: (r.meta_title ?? undefined) as string | undefined,
    metaDescription: (r.meta_description ?? undefined) as string | undefined,
    featured: (r.featured ?? false) as boolean,
  };
}

export async function getAllLodges(): Promise<Lodge[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("lodges")
    .select("*")
    .order("name");

  if (error) {
    console.error("[getAllLodges] Supabase error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}

export async function getLodgeBySlug(slug: string): Promise<Lodge | undefined> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("lodges")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("[getLodgeBySlug] Supabase error:", error);
    throw error;
  }
  return mapRow(data as Record<string, unknown>);
}

export async function getFeaturedLodges(): Promise<Lodge[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("lodges")
    .select("*")
    .eq("featured", true)
    .order("name");

  if (error) {
    console.error("[getFeaturedLodges] Supabase error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}

export async function getLodgesByDestination(destinationId: string): Promise<Lodge[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("lodges")
    .select("*")
    .eq("destination_id", destinationId)
    .order("name");

  if (error) {
    console.error("[getLodgesByDestination] Supabase error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}

export async function getLodgesByRiver(riverId: string): Promise<Lodge[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("lodges")
    .select("*")
    .contains("nearby_river_ids", [riverId]);

  if (error) {
    console.error("[getLodgesByRiver] Supabase error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}
