import { createStaticClient } from "@/lib/supabase/static";
import { keysToCamel } from "./utils";
import type { Species } from "@/types/entities";
import { species as staticSpecies } from "@/data/species";

export async function getAllSpecies(): Promise<Species[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("species")
      .select("*")
      .order("common_name");
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<Species>(row));
  } catch (e) {
    console.error("[db] getAllSpecies fallback:", e);
    return staticSpecies;
  }
}

export async function getSpeciesBySlug(
  slug: string
): Promise<Species | undefined> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("species")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) throw error;
    return data ? keysToCamel<Species>(data) : undefined;
  } catch (e) {
    console.error("[db] getSpeciesBySlug fallback:", e);
    return staticSpecies.find((s) => s.slug === slug);
  }
}

export async function getFeaturedSpecies(): Promise<Species[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("species")
      .select("*")
      .eq("featured", true)
      .order("common_name");
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<Species>(row));
  } catch (e) {
    console.error("[db] getFeaturedSpecies fallback:", e);
    return staticSpecies.filter((s) => s.featured);
  }
}
