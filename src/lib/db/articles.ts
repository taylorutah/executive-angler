import type { Article } from "@/types/entities";
import { articles as staticArticles } from "@/data/articles";

export async function getAllArticles(): Promise<Article[]> {
  return staticArticles;
}

export async function getArticleBySlug(
  slug: string
): Promise<Article | undefined> {
  return staticArticles.find((a) => a.slug === slug);
}

export async function getFeaturedArticles(): Promise<Article[]> {
  return staticArticles.filter((a) => a.featured);
}

export async function getArticlesByDestination(
  destinationId: string
): Promise<Article[]> {
  return staticArticles.filter((a) =>
    a.relatedDestinationIds.includes(destinationId)
  );
}

export async function getArticlesByRiver(riverId: string): Promise<Article[]> {
  return staticArticles.filter((a) =>
    (a.relatedRiverIds || []).includes(riverId)
  );
}
