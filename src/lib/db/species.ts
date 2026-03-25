import type { Species } from "@/types/entities";
import { createStaticClient } from "@/lib/supabase/static";

function mapRow(r: Record<string, unknown>): Species {
  return {
    id: r.id as string,
    slug: r.slug as string,
    commonName: (r.common_name ?? "") as string,
    scientificName: (r.scientific_name ?? undefined) as string | undefined,
    family: (r.family ?? undefined) as Species["family"],
    description: (r.description ?? undefined) as string | undefined,
    imageUrl: (r.image_url ?? undefined) as string | undefined,
    illustrationUrl: (r.illustration_url ?? undefined) as string | undefined,
    nativeRange: (r.native_range ?? undefined) as string | undefined,
    introducedRange: (r.introduced_range ?? undefined) as string | undefined,
    averageSize: (r.average_size ?? undefined) as string | undefined,
    recordSize: (r.record_size ?? undefined) as string | undefined,
    recordDetails: (r.record_details ?? undefined) as string | undefined,
    preferredHabitat: (r.preferred_habitat ?? undefined) as string | undefined,
    preferredFlies: (r.preferred_flies as string[]) ?? [],
    taxonomy: (r.taxonomy ?? undefined) as Species["taxonomy"],
    conservationStatus: (r.conservation_status ?? undefined) as string | undefined,
    diet: (r.diet ?? undefined) as string | undefined,
    spawningInfo: (r.spawning_info ?? undefined) as string | undefined,
    spawningMonths: (r.spawning_months as string[]) ?? [],
    spawningTempF: (r.spawning_temp_f ?? undefined) as string | undefined,
    lifespan: (r.lifespan ?? undefined) as string | undefined,
    waterTemperatureRange: (r.water_temperature_range ?? undefined) as string | undefined,
    flyFishingTips: (r.fly_fishing_tips ?? undefined) as string | undefined,
    tackleRecommendations: (r.tackle_recommendations ?? undefined) as string | undefined,
    funFacts: (r.fun_facts as string[]) ?? [],
    relatedDestinationIds: (r.related_destination_ids as string[]) ?? [],
    relatedRiverIds: (r.related_river_ids as string[]) ?? [],
    distributionCoordinates: (r.distribution_coordinates as Species["distributionCoordinates"]) ?? [],
    metaTitle: (r.meta_title ?? undefined) as string | undefined,
    metaDescription: (r.meta_description ?? undefined) as string | undefined,
    featured: (r.featured ?? false) as boolean,
  };
}

export async function getAllSpecies(): Promise<Species[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("species")
    .select("*")
    .order("common_name");

  if (error) {
    console.error("[getAllSpecies] Supabase error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}

export async function getSpeciesBySlug(slug: string): Promise<Species | undefined> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("species")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[getSpeciesBySlug] Supabase error:", error);
    return undefined;
  }
  return data ? mapRow(data as Record<string, unknown>) : undefined;
}

export async function getFeaturedSpecies(): Promise<Species[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("species")
    .select("*")
    .eq("featured", true);

  if (error) {
    console.error("[getFeaturedSpecies] Supabase error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}

export async function getSpeciesByCommonNames(names: string[]): Promise<Species[]> {
  if (!names.length) return [];
  const supabase = createStaticClient();
  // Supabase ilike doesn't support arrays, so fetch all and filter client-side
  // for case-insensitive matching (species names vary in casing across data)
  const { data, error } = await supabase
    .from("species")
    .select("*");

  if (error) {
    console.error("[getSpeciesByCommonNames] Supabase error:", error);
    throw error;
  }

  const lower = names.map((n) => n.toLowerCase());
  return (data ?? [])
    .filter((r) => lower.includes((r.common_name as string || "").toLowerCase()))
    .map(mapRow);
}
