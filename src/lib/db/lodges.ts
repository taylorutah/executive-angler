import { createStaticClient } from "@/lib/supabase/static";
import { keysToCamel } from "./utils";
import type { Lodge } from "@/types/entities";
import { lodges as staticLodges } from "@/data/lodges";

export async function getAllLodges(): Promise<Lodge[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("lodges")
      .select("*")
      .order("name");
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<Lodge>(row));
  } catch (e) {
    console.error("[db] getAllLodges fallback:", e);
    return staticLodges;
  }
}

export async function getLodgeBySlug(
  slug: string
): Promise<Lodge | undefined> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("lodges")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) throw error;
    return data ? keysToCamel<Lodge>(data) : undefined;
  } catch (e) {
    console.error("[db] getLodgeBySlug fallback:", e);
    return staticLodges.find((l) => l.slug === slug);
  }
}

export async function getFeaturedLodges(): Promise<Lodge[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("lodges")
      .select("*")
      .eq("featured", true)
      .order("name");
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<Lodge>(row));
  } catch (e) {
    console.error("[db] getFeaturedLodges fallback:", e);
    return staticLodges.filter((l) => l.featured);
  }
}

export async function getLodgesByDestination(
  destinationId: string
): Promise<Lodge[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("lodges")
      .select("*")
      .eq("destination_id", destinationId)
      .order("name");
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<Lodge>(row));
  } catch (e) {
    console.error("[db] getLodgesByDestination fallback:", e);
    return staticLodges.filter((l) => l.destinationId === destinationId);
  }
}
