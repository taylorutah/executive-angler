import type { Guide } from "@/types/entities";
import { guides as staticGuides } from "@/data/guides";
import { createStaticClient } from "@/lib/supabase/static";

function mapRow(r: Record<string, unknown>): Guide {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    destinationId: (r.destination_id ?? "") as string,
    bio: (r.bio ?? "") as string,
    specialties: (r.specialties as string[]) ?? [],
    yearsExperience: r.years_experience ? Number(r.years_experience) : undefined,
    photoUrl: (r.photo_url ?? undefined) as string | undefined,
    websiteUrl: (r.website_url ?? undefined) as string | undefined,
    phone: (r.phone ?? undefined) as string | undefined,
    email: (r.email ?? undefined) as string | undefined,
    licenseNumber: (r.license_number ?? undefined) as string | undefined,
    riverIds: (r.river_ids as string[]) ?? [],
    dailyRate: (r.daily_rate ?? undefined) as string | undefined,
    googlePlaceId: (r.google_place_id ?? undefined) as string | undefined,
    googleRating: r.google_rating ? Number(r.google_rating) : undefined,
    googleReviewCount: r.google_review_count ? Number(r.google_review_count) : undefined,
    googleReviewsUrl: (r.google_reviews_url ?? undefined) as string | undefined,
    metaTitle: (r.meta_title ?? undefined) as string | undefined,
    metaDescription: (r.meta_description ?? undefined) as string | undefined,
  };
}

let cache: Guide[] | null = null;
let cacheTime = 0;
const TTL = 5 * 60 * 1000;

export async function getAllGuides(): Promise<Guide[]> {
  if (cache && Date.now() - cacheTime < TTL) return cache;
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase.from("guides").select("*").order("name");
    if (error) throw error;
    if (!data?.length) throw new Error("empty");
    cache = data.map(mapRow);
    cacheTime = Date.now();
    return cache;
  } catch {
    return staticGuides;
  }
}

export async function getGuideBySlug(slug: string): Promise<Guide | undefined> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase.from("guides").select("*").eq("slug", slug).single();
    if (error) throw error;
    return mapRow(data as Record<string, unknown>);
  } catch {
    return staticGuides.find((g) => g.slug === slug);
  }
}

export async function getGuidesByRiver(riverId: string): Promise<Guide[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase.from("guides").select("*").contains("river_ids", [riverId]).order("name");
    if (error) throw error;
    return (data ?? []).map(mapRow);
  } catch {
    return staticGuides.filter((g) => g.riverIds?.includes(riverId));
  }
}

export async function getGuidesByDestination(destinationId: string): Promise<Guide[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase.from("guides").select("*").eq("destination_id", destinationId).order("name");
    if (error) throw error;
    return (data ?? []).map(mapRow);
  } catch {
    return staticGuides.filter((g) => g.destinationId === destinationId);
  }
}
// Guide photos fixed Sat Mar 14 15:54:23 MDT 2026
