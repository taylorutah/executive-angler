import { createStaticClient } from "@/lib/supabase/static";
import { keysToCamel } from "./utils";
import type { Guide } from "@/types/entities";
import { guides as staticGuides } from "@/data/guides";

export async function getAllGuides(): Promise<Guide[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("guides")
      .select("*")
      .order("name");
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<Guide>(row));
  } catch (e) {
    console.error("[db] getAllGuides fallback:", e);
    return staticGuides;
  }
}

export async function getGuideBySlug(
  slug: string
): Promise<Guide | undefined> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("guides")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) throw error;
    return data ? keysToCamel<Guide>(data) : undefined;
  } catch (e) {
    console.error("[db] getGuideBySlug fallback:", e);
    return staticGuides.find((g) => g.slug === slug);
  }
}

export async function getGuidesByDestination(
  destinationId: string
): Promise<Guide[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("guides")
      .select("*")
      .eq("destination_id", destinationId)
      .order("name");
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<Guide>(row));
  } catch (e) {
    console.error("[db] getGuidesByDestination fallback:", e);
    return staticGuides.filter((g) => g.destinationId === destinationId);
  }
}

export async function getGuidesByRiver(riverId: string): Promise<Guide[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("guides")
      .select("*")
      .contains("river_ids", [riverId])
      .order("name");
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<Guide>(row));
  } catch (e) {
    console.error("[db] getGuidesByRiver fallback:", e);
    return staticGuides.filter((g) => g.riverIds.includes(riverId));
  }
}
