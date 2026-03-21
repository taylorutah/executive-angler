// Species served from static data — fast, no DB round-trip.
// Migrate to Supabase only if species need user-editable fields or admin CRUD.
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

export async function getSpeciesByCommonNames(
  names: string[]
): Promise<Species[]> {
  const lower = names.map((n) => n.toLowerCase());
  return staticSpecies.filter((s) =>
    lower.includes(s.commonName.toLowerCase())
  );
}
