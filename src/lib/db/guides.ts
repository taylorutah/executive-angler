import type { Guide } from "@/types/entities";
import { createStaticClient } from "@/lib/supabase/static";
import { withRetry } from "./retry";

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

export async function getAllGuides(): Promise<Guide[]> {
  return withRetry(async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("guides")
      .select("*")
      .order("name");

    if (error) {
      console.error("[getAllGuides] Supabase error:", error);
      throw error;
    }
    return (data ?? []).map(mapRow);
  }, "getAllGuides");
}

export async function getGuideBySlug(slug: string): Promise<Guide | undefined> {
  return withRetry(async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("guides")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("[getGuideBySlug] Supabase error:", error);
      throw error;
    }
    return mapRow(data as Record<string, unknown>);
  }, "getGuideBySlug").catch((err) => {
    console.error(`[getGuideBySlug] All retries failed for "${slug}":`, err);
    return undefined;
  });
}

export async function getGuidesByRiver(riverId: string): Promise<Guide[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .contains("river_ids", [riverId])
    .order("name");

  if (error) {
    console.error("[getGuidesByRiver] Supabase error:", error);
    return [];
  }
  return (data ?? []).map(mapRow);
}

export async function getGuidesByDestination(destinationId: string): Promise<Guide[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .eq("destination_id", destinationId)
    .order("name");

  if (error) {
    console.error("[getGuidesByDestination] Supabase error:", error);
    return [];
  }
  return (data ?? []).map(mapRow);
}
