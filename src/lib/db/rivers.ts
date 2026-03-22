import type { River } from "@/types/entities";
import { createStaticClient } from "@/lib/supabase/static";

function mapRow(row: Record<string, unknown>): River {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    destinationId: (row.destination_id ?? row.ea_destination_id ?? "") as string,
    additionalDestinationIds: (row.additional_destination_ids as string[]) ?? [],
    description: (row.description ?? "") as string,
    heroImageUrl: (row.hero_image_url ?? "") as string,
    heroImageAlt: row.hero_image_alt as string | undefined,
    heroImageCredit: row.hero_image_credit as string | undefined,
    heroImageCreditUrl: row.hero_image_credit_url as string | undefined,
    thumbnailUrl: (row.thumbnail_url ?? row.hero_image_url ?? "") as string,
    lengthMiles: row.length_miles ? Number(row.length_miles) : undefined,
    flowType: (row.flow_type ?? "freestone") as River["flowType"],
    difficulty: (row.difficulty ?? "intermediate") as River["difficulty"],
    wadingType: (row.wading_type ?? "wade") as River["wadingType"],
    primarySpecies: (row.primary_species as string[]) ?? [],
    regulations: (row.regulations ?? "") as string,
    accessPoints: (row.access_points as River["accessPoints"]) ?? [],
    bestMonths: (row.best_months as string[]) ?? [],
    latitude: row.latitude ? Number(row.latitude) : 0,
    longitude: row.longitude ? Number(row.longitude) : 0,
    mapBounds: row.map_bounds as River["mapBounds"],
    hatchChart: (row.hatch_chart as River["hatchChart"]) ?? [],
    metaTitle: (row.meta_title ?? "") as string,
    metaDescription: (row.meta_description ?? "") as string,
    featured: (row.featured ?? false) as boolean,
  };
}

export async function getAllRivers(): Promise<River[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("rivers")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("[getAllRivers] Supabase error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}

export async function getRiverBySlug(slug: string): Promise<River | undefined> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("rivers")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[getRiverBySlug] Supabase error:", error);
    return undefined;  // Return undefined → caller calls notFound() → 404 not 500
  }
  if (!data) return undefined;
  return mapRow(data as Record<string, unknown>);
}

export async function getFeaturedRivers(): Promise<River[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("rivers")
    .select("*")
    .eq("featured", true)
    .order("name");

  if (error) {
    console.error("[getFeaturedRivers] Supabase error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}

export async function getRiversByDestination(destinationId: string): Promise<River[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("rivers")
    .select("*")
    .eq("destination_id", destinationId)
    .order("name");

  if (error) {
    console.error("[getRiversByDestination] Supabase error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}

export async function getRiversByIds(ids: string[]): Promise<River[]> {
  if (ids.length === 0) return [];
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("rivers")
    .select("*")
    .in("id", ids);

  if (error) {
    console.error("[getRiversByIds] Supabase error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}
