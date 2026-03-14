import type { River } from "@/types/entities";
import { rivers as staticRivers } from "@/data/rivers";
import { createStaticClient } from "@/lib/supabase/static";

function mapRow(row: Record<string, unknown>): River {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    destinationId: (row.destination_id ?? row.ea_destination_id ?? "") as string,
    description: (row.description ?? "") as string,
    heroImageUrl: (row.hero_image_url ?? "") as string,
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

let cachedRivers: River[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getAllRivers(): Promise<River[]> {
  // Return in-memory cache if fresh
  if (cachedRivers && Date.now() - cacheTime < CACHE_TTL) {
    return cachedRivers;
  }

  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("rivers")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("No rivers returned");

    cachedRivers = data.map(mapRow);
    cacheTime = Date.now();
    return cachedRivers;
  } catch (err) {
    console.warn("[getAllRivers] Supabase fetch failed, falling back to static data:", err);
    return staticRivers;
  }
}

export async function getRiverBySlug(slug: string): Promise<River | undefined> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("rivers")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return mapRow(data as Record<string, unknown>);
  } catch {
    return staticRivers.find((r) => r.slug === slug);
  }
}

export async function getFeaturedRivers(): Promise<River[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("rivers")
      .select("*")
      .eq("featured", true)
      .order("name");

    if (error) throw error;
    return (data ?? []).map(mapRow);
  } catch {
    return staticRivers.filter((r) => r.featured);
  }
}

export async function getRiversByDestination(destinationId: string): Promise<River[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("rivers")
      .select("*")
      .eq("destination_id", destinationId)
      .order("name");

    if (error) throw error;
    return (data ?? []).map(mapRow);
  } catch {
    return staticRivers.filter((r) => r.destinationId === destinationId);
  }
}

export async function getRiversByIds(ids: string[]): Promise<River[]> {
  if (ids.length === 0) return [];
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("rivers")
      .select("*")
      .in("id", ids);

    if (error) throw error;
    return (data ?? []).map(mapRow);
  } catch {
    return staticRivers.filter((r) => ids.includes(r.id));
  }
}
