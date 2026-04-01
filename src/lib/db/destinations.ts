import type { Destination } from "@/types/entities";
import { createStaticClient } from "@/lib/supabase/static";

function mapRow(r: Record<string, unknown>): Destination {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    region: (r.region ?? "") as string,
    country: (r.country ?? "United States") as string,
    state: (r.state ?? undefined) as string | undefined,
    tagline: (r.tagline ?? undefined) as string | undefined,
    description: (r.description ?? "") as string,
    heroImageUrl: (r.hero_image_url ?? "") as string,
    heroImageCredit: r.hero_image_credit as string | undefined,
    heroImageCreditUrl: r.hero_image_credit_url as string | undefined,
    thumbnailUrl: (r.thumbnail_url ?? undefined) as string | undefined,
    latitude: r.latitude ? Number(r.latitude) : 0,
    longitude: r.longitude ? Number(r.longitude) : 0,
    bestMonths: (r.best_months as string[]) ?? [],
    primarySpecies: (r.primary_species as string[]) ?? [],
    licenseInfo: (r.license_info ?? undefined) as string | undefined,
    elevationRange: (r.elevation_range ?? undefined) as string | undefined,
    climateNotes: (r.climate_notes ?? undefined) as string | undefined,
    regulationsSummary: (r.regulations_summary ?? undefined) as string | undefined,
    metaTitle: (r.meta_title ?? undefined) as string | undefined,
    metaDescription: (r.meta_description ?? undefined) as string | undefined,
    featured: (r.featured ?? false) as boolean,
    sortOrder: r.sort_order ? Number(r.sort_order) : undefined,
  };
}

export async function getAllDestinations(): Promise<Destination[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name");

  if (error) {
    console.error("[getAllDestinations] Supabase error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}

export async function getDestinationBySlug(slug: string): Promise<Destination | undefined> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("[getDestinationBySlug] Supabase error:", error);
    throw error;
  }
  return mapRow(data as Record<string, unknown>);
}

export async function getDestinationById(id: string): Promise<Destination | undefined> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getDestinationById] Supabase error:", error);
    return undefined;
  }
  return mapRow(data as Record<string, unknown>);
}

export async function getDestinationsByIds(ids: string[]): Promise<Destination[]> {
  if (!ids.length) return [];
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .in("id", ids);

  if (error) {
    console.error("[getDestinationsByIds] Supabase error:", error);
    return [];
  }
  return (data ?? []).map(mapRow);
}

export async function getFeaturedDestinations(): Promise<Destination[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("featured", true)
    .order("sort_order");

  if (error) {
    console.error("[getFeaturedDestinations] Supabase error:", error);
    return [];
  }
  return (data ?? []).map(mapRow);
}
