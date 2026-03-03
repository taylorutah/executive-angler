import type { Destination } from "@/types/entities";
import { destinations as staticDestinations } from "@/data/destinations";

export async function getAllDestinations(): Promise<Destination[]> {
  return staticDestinations;
}

export async function getDestinationBySlug(
  slug: string
): Promise<Destination | undefined> {
  return staticDestinations.find((d) => d.slug === slug);
}

export async function getFeaturedDestinations(): Promise<Destination[]> {
  return staticDestinations.filter((d) => d.featured);
}

export async function getDestinationById(
  id: string
): Promise<Destination | undefined> {
  return staticDestinations.find((d) => d.id === id);
}

export async function getDestinationsByIds(
  ids: string[]
): Promise<Destination[]> {
  if (ids.length === 0) return [];
  return staticDestinations.filter((d) => ids.includes(d.id));
}
