import type { FlyShop } from "@/types/entities";
import { flyShops as staticFlyShops } from "@/data/fly-shops";
import { createStaticClient } from "@/lib/supabase/static";

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

let cache: FlyShop[] | null = null;
let cacheTime = 0;
const TTL = 5 * 60 * 1000;

export async function getAllFlyShops(): Promise<FlyShop[]> {
  if (cache && Date.now() - cacheTime < TTL) return cache;
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase.from("fly_shops").select("*").order("name");
    if (error) throw error;
    if (!data?.length) throw new Error("empty");
    cache = data.map(mapRow);
    cacheTime = Date.now();
    return cache;
  } catch {
    return staticFlyShops;
  }
}

export async function getFlyShopBySlug(slug: string): Promise<FlyShop | undefined> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase.from("fly_shops").select("*").eq("slug", slug).single();
    if (error) throw error;
    return mapRow(data as Record<string, unknown>);
  } catch {
    return staticFlyShops.find((s) => s.slug === slug);
  }
}

export async function getFlyShopsByDestination(destinationId: string): Promise<FlyShop[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase.from("fly_shops").select("*").eq("destination_id", destinationId).order("name");
    if (error) throw error;
    return (data ?? []).map(mapRow);
  } catch {
    return staticFlyShops.filter((s) => s.destinationId === destinationId);
  }
}
