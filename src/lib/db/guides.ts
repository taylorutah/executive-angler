import type { Guide } from "@/types/entities";
import { guides as staticGuides } from "@/data/guides";

export async function getAllGuides(): Promise<Guide[]> {
  return staticGuides;
}

export async function getGuideBySlug(
  slug: string
): Promise<Guide | undefined> {
  return staticGuides.find((g) => g.slug === slug);
}

export async function getGuidesByDestination(
  destinationId: string
): Promise<Guide[]> {
  return staticGuides.filter((g) => g.destinationId === destinationId);
}

export async function getGuidesByRiver(riverId: string): Promise<Guide[]> {
  return staticGuides.filter((g) => g.riverIds.includes(riverId));
}
