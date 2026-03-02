import { createStaticClient } from "@/lib/supabase/static";
import { keysToCamel } from "./utils";
import type { Article } from "@/types/entities";
import { articles as staticArticles } from "@/data/articles";

export async function getAllArticles(): Promise<Article[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<Article>(row));
  } catch (e) {
    console.error("[db] getAllArticles fallback:", e);
    return staticArticles;
  }
}

export async function getArticleBySlug(
  slug: string
): Promise<Article | undefined> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) throw error;
    return data ? keysToCamel<Article>(data) : undefined;
  } catch (e) {
    console.error("[db] getArticleBySlug fallback:", e);
    return staticArticles.find((a) => a.slug === slug);
  }
}

export async function getFeaturedArticles(): Promise<Article[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("featured", true)
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<Article>(row));
  } catch (e) {
    console.error("[db] getFeaturedArticles fallback:", e);
    return staticArticles.filter((a) => a.featured);
  }
}

export async function getArticlesByDestination(
  destinationId: string
): Promise<Article[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .contains("related_destination_ids", [destinationId])
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<Article>(row));
  } catch (e) {
    console.error("[db] getArticlesByDestination fallback:", e);
    return staticArticles.filter((a) =>
      a.relatedDestinationIds.includes(destinationId)
    );
  }
}
