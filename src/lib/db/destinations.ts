import type { Destination } from "@/types/entities";
import { destinations as staticDestinations } from "@/data/destinations";
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

let cache: Destination[] | null = null;
let cacheTime = 0;
const TTL = 5 * 60 * 1000;

export async function getAllDestinations(): Promise<Destination[]> {
  if (cache && Date.now() - cacheTime < TTL) return cache;
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase.from("destinations").select("*").order("sort_order", { ascending: true }).order("name");
    if (error) throw error;
    if (!data?.length) throw new Error("empty");
    cache = data.map(mapRow);
    cacheTime = Date.now();
    return cache;
  } catch {
    return staticDestinations;
  }
}

export async function getDestinationBySlug(slug: string): Promise<Destination | undefined> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase.from("destinations").select("*").eq("slug", slug).single();
    if (error) throw error;
    return mapRow(data as Record<string, unknown>);
  } catch {
    return staticDestinations.find((d) => d.slug === slug);
  }
}

export async function getDestinationById(id: string): Promise<Destination | undefined> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase.from("destinations").select("*").eq("id", id).single();
    if (error) throw error;
    return mapRow(data as Record<string, unknown>);
  } catch {
    return staticDestinations.find((d) => d.id === id);
  }
}

export async function getDestinationsByIds(ids: string[]): Promise<Destination[]> {
  if (!ids.length) return [];
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase.from("destinations").select("*").in("id", ids);
    if (error) throw error;
    return (data ?? []).map(mapRow);
  } catch {
    return staticDestinations.filter((d) => ids.includes(d.id));
  }
}

export async function getFeaturedDestinations(): Promise<Destination[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase.from("destinations").select("*").eq("featured", true).order("sort_order");
    if (error) throw error;
    return (data ?? []).map(mapRow);
  } catch {
    return staticDestinations.filter((d) => d.featured);
  }
}
