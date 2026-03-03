import type { Species } from "@/types/entities";
import { species as staticSpecies } from "@/data/species";

export async function getAllSpecies(): Promise<Species[]> {
  return staticSpecies;
}

export async function getSpeciesBySlug(
  slug: string
): Promise<Species | undefined> {
  return staticSpecies.find((s) => s.slug === slug);
}

export async function getFeaturedSpecies(): Promise<Species[]> {
  return staticSpecies.filter((s) => s.featured);
}
