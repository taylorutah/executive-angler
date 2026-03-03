import type { River } from "@/types/entities";
import { rivers as staticRivers } from "@/data/rivers";

export async function getAllRivers(): Promise<River[]> {
  return staticRivers;
}

export async function getRiverBySlug(
  slug: string
): Promise<River | undefined> {
  return staticRivers.find((r) => r.slug === slug);
}

export async function getFeaturedRivers(): Promise<River[]> {
  return staticRivers.filter((r) => r.featured);
}

export async function getRiversByDestination(
  destinationId: string
): Promise<River[]> {
  return staticRivers.filter((r) => r.destinationId === destinationId);
}

export async function getRiversByIds(ids: string[]): Promise<River[]> {
  if (ids.length === 0) return [];
  return staticRivers.filter((r) => ids.includes(r.id));
}
