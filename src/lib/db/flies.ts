import type { CanonicalFly } from "@/types/entities";
import { createStaticClient } from "@/lib/supabase/static";
import { withRetry } from "./retry";

function mapRow(row: Record<string, unknown>): CanonicalFly {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    category: (row.category ?? "nymph") as CanonicalFly["category"],

    // Editorial
    tagline: row.tagline as string | undefined,
    description: (row.description ?? "") as string,
    history: row.history as string | undefined,
    tyingOverview: row.tying_overview as string | undefined,
    tyingSteps: (row.tying_steps as CanonicalFly["tyingSteps"]) ?? undefined,
    materialsList: (row.materials_list as CanonicalFly["materialsList"]) ?? undefined,
    fishingTips: row.fishing_tips as string | undefined,
    whenToUse: row.when_to_use as string | undefined,

    // Classification
    imitates: (row.imitates as string[]) ?? [],
    effectiveSpecies: (row.effective_species as string[]) ?? [],
    waterTypes: (row.water_types as string[]) ?? [],

    // Variations
    sizes: (row.sizes as string[]) ?? [],
    colors: (row.colors as string[]) ?? [],
    beadOptions: (row.bead_options as string[]) ?? [],
    hookStyles: (row.hook_styles as string[]) ?? [],
    keyVariations: (row.key_variations as CanonicalFly["keyVariations"]) ?? undefined,

    // Media
    heroImageUrl: row.hero_image_url as string | undefined,
    galleryUrls: (row.gallery_urls as string[]) ?? [],
    iconUrl: row.icon_url as string | undefined,
    videoUrl: row.video_url as string | undefined,
    additionalVideos: (row.additional_videos as CanonicalFly["additionalVideos"]) ?? undefined,

    // Relationships
    relatedFlyIds: (row.related_fly_ids as string[]) ?? [],
    relatedRiverIds: (row.related_river_ids as string[]) ?? [],
    relatedDestinationIds: (row.related_destination_ids as string[]) ?? [],
    hatchAssociations: (row.hatch_associations as CanonicalFly["hatchAssociations"]) ?? undefined,

    // Commerce
    affiliateLinks: (row.affiliate_links as CanonicalFly["affiliateLinks"]) ?? undefined,
    flyShopIds: (row.fly_shop_ids as string[]) ?? [],
    originCredit: row.origin_credit as string | undefined,

    // SEO
    metaTitle: row.meta_title as string | undefined,
    metaDescription: row.meta_description as string | undefined,

    // Display
    rank: row.rank ? Number(row.rank) : undefined,
    featured: (row.featured ?? false) as boolean,
    isHeroPattern: (row.is_hero_pattern ?? false) as boolean,
  };
}

export async function getAllCanonicalFlies(): Promise<CanonicalFly[]> {
  return withRetry(async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("canonical_flies")
      .select("*")
      .order("rank", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("[getAllCanonicalFlies] Supabase error:", error);
      throw error;
    }
    return (data ?? []).map(mapRow);
  }, "getAllCanonicalFlies");
}

export async function getCanonicalFlyBySlug(
  slug: string
): Promise<CanonicalFly | undefined> {
  return withRetry(async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("canonical_flies")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("[getCanonicalFlyBySlug] Supabase error:", error);
      throw error; // Let retry handle transient errors
    }
    if (!data) return undefined;
    return mapRow(data as Record<string, unknown>);
  }, "getCanonicalFlyBySlug").catch((err) => {
    // After all retries exhausted, return undefined so notFound() handles it
    console.error(`[getCanonicalFlyBySlug] All retries failed for "${slug}":`, err);
    return undefined;
  });
}

export async function getFeaturedFlies(): Promise<CanonicalFly[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("canonical_flies")
    .select("*")
    .eq("featured", true)
    .order("rank", { ascending: true });

  if (error) {
    console.error("[getFeaturedFlies] Supabase error:", error);
    return [];
  }
  return (data ?? []).map(mapRow);
}

export async function getFliesByCategory(
  category: string
): Promise<CanonicalFly[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("canonical_flies")
    .select("*")
    .eq("category", category)
    .order("rank", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("[getFliesByCategory] Supabase error:", error);
    return [];
  }
  return (data ?? []).map(mapRow);
}

export async function getFliesForRiver(
  riverId: string
): Promise<CanonicalFly[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("canonical_flies")
    .select("*")
    .contains("related_river_ids", [riverId])
    .order("rank", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("[getFliesForRiver] Supabase error:", error);
    return [];
  }
  return (data ?? []).map(mapRow);
}

export async function getFliesByEffectiveSpecies(
  speciesName: string
): Promise<CanonicalFly[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("canonical_flies")
    .select("*")
    .contains("effective_species", [speciesName])
    .order("rank", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("[getFliesByEffectiveSpecies] Supabase error:", error);
    return [];
  }
  return (data ?? []).map(mapRow);
}

export async function getFliesForDestination(
  destinationId: string
): Promise<CanonicalFly[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("canonical_flies")
    .select("*")
    .contains("related_destination_ids", [destinationId])
    .order("rank", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("[getFliesForDestination] Supabase error:", error);
    return [];
  }
  return (data ?? []).map(mapRow);
}

export async function getFliesForFlyShop(
  shopId: string
): Promise<CanonicalFly[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("canonical_flies")
    .select("*")
    .contains("fly_shop_ids", [shopId])
    .order("rank", { ascending: true })
    .limit(8);

  if (error) {
    console.error("[getFliesForFlyShop] Supabase error:", error);
    return [];
  }
  return (data ?? []).map(mapRow);
}

export async function getFliesByImitates(
  insect: string
): Promise<CanonicalFly[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("canonical_flies")
    .select("*")
    .contains("imitates", [insect])
    .order("rank", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("[getFliesByImitates] Supabase error:", error);
    return [];
  }
  return (data ?? []).map(mapRow);
}
