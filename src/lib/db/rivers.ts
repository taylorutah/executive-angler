import { createStaticClient } from "@/lib/supabase/static";
import { keysToCamel } from "./utils";
import type { River } from "@/types/entities";
import { rivers as staticRivers } from "@/data/rivers";

export async function getAllRivers(): Promise<River[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("rivers")
      .select("*")
      .order("name");
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<River>(row));
  } catch (e) {
    console.error("[db] getAllRivers fallback:", e);
    return staticRivers;
  }
}

export async function getRiverBySlug(
  slug: string
): Promise<River | undefined> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("rivers")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) throw error;
    return data ? keysToCamel<River>(data) : undefined;
  } catch (e) {
    console.error("[db] getRiverBySlug fallback:", e);
    return staticRivers.find((r) => r.slug === slug);
  }
}

export async function getFeaturedRivers(): Promise<River[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("rivers")
      .select("*")
      .eq("featured", true)
      .order("name");
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<River>(row));
  } catch (e) {
    console.error("[db] getFeaturedRivers fallback:", e);
    return staticRivers.filter((r) => r.featured);
  }
}

export async function getRiversByDestination(
  destinationId: string
): Promise<River[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("rivers")
      .select("*")
      .eq("destination_id", destinationId)
      .order("name");
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<River>(row));
  } catch (e) {
    console.error("[db] getRiversByDestination fallback:", e);
    return staticRivers.filter((r) => r.destinationId === destinationId);
  }
}

export async function getRiversByIds(ids: string[]): Promise<River[]> {
  if (ids.length === 0) return [];
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("rivers")
      .select("*")
      .in("id", ids);
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<River>(row));
  } catch (e) {
    console.error("[db] getRiversByIds fallback:", e);
    return staticRivers.filter((r) => ids.includes(r.id));
  }
}
