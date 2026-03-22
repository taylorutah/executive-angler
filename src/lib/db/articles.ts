import type { Article } from "@/types/entities";
import { createStaticClient } from "@/lib/supabase/static";

function mapRow(r: Record<string, unknown>): Article {
  return {
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as string,
    subtitle: (r.subtitle ?? undefined) as string | undefined,
    author: (r.author ?? "") as string,
    category: (r.category ?? "technique") as Article["category"],
    heroImageUrl: (r.hero_image_url ?? "") as string,
    heroImageAlt: r.hero_image_alt as string | undefined,
    heroImageCredit: r.hero_image_credit as string | undefined,
    heroImageCreditUrl: r.hero_image_credit_url as string | undefined,
    thumbnailUrl: (r.thumbnail_url ?? undefined) as string | undefined,
    excerpt: (r.excerpt ?? "") as string,
    content: (r.content ?? "") as string,
    readingTimeMinutes: r.reading_time_minutes ? Number(r.reading_time_minutes) : 5,
    tags: (r.tags as string[]) ?? [],
    relatedDestinationIds: (r.related_destination_ids as string[]) ?? [],
    relatedRiverIds: (r.related_river_ids as string[]) ?? [],
    publishedAt: (r.published_at ?? "") as string,
    metaTitle: (r.meta_title ?? undefined) as string | undefined,
    metaDescription: (r.meta_description ?? undefined) as string | undefined,
    featured: (r.featured ?? false) as boolean,
  };
}

export async function getAllArticles(): Promise<Article[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[getAllArticles] Supabase error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("[getArticleBySlug] Supabase error:", error);
    throw error;
  }
  return mapRow(data as Record<string, unknown>);
}

export async function getFeaturedArticles(): Promise<Article[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("featured", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[getFeaturedArticles] Supabase error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}

export async function getArticlesByDestination(destinationId: string): Promise<Article[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .contains("related_destination_ids", [destinationId])
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[getArticlesByDestination] Supabase error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}

export async function getArticlesByRiver(riverId: string): Promise<Article[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .contains("related_river_ids", [riverId])
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[getArticlesByRiver] Supabase error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}
