import type { Lodge } from "@/types/entities";
import { lodges as staticLodges } from "@/data/lodges";

export async function getAllLodges(): Promise<Lodge[]> {
  return staticLodges;
}

export async function getLodgeBySlug(
  slug: string
): Promise<Lodge | undefined> {
  return staticLodges.find((l) => l.slug === slug);
}

export async function getFeaturedLodges(): Promise<Lodge[]> {
  return staticLodges.filter((l) => l.featured);
}

export async function getLodgesByDestination(
  destinationId: string
): Promise<Lodge[]> {
  return staticLodges.filter((l) => l.destinationId === destinationId);
}

export async function getLodgesByRiver(riverId: string): Promise<Lodge[]> {
  return staticLodges.filter((l) =>
    (l.nearbyRiverIds || []).includes(riverId)
  );
}
