import { createStaticClient } from "@/lib/supabase/static";
import { keysToCamel } from "./utils";
import type { Destination } from "@/types/entities";
import { destinations as staticDestinations } from "@/data/destinations";

export async function getAllDestinations(): Promise<Destination[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<Destination>(row));
  } catch (e) {
    console.error("[db] getAllDestinations fallback:", e);
    return staticDestinations;
  }
}

export async function getDestinationBySlug(
  slug: string
): Promise<Destination | undefined> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) throw error;
    return data ? keysToCamel<Destination>(data) : undefined;
  } catch (e) {
    console.error("[db] getDestinationBySlug fallback:", e);
    return staticDestinations.find((d) => d.slug === slug);
  }
}

export async function getFeaturedDestinations(): Promise<Destination[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .eq("featured", true)
      .order("sort_order");
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<Destination>(row));
  } catch (e) {
    console.error("[db] getFeaturedDestinations fallback:", e);
    return staticDestinations.filter((d) => d.featured);
  }
}

export async function getDestinationById(
  id: string
): Promise<Destination | undefined> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data ? keysToCamel<Destination>(data) : undefined;
  } catch (e) {
    console.error("[db] getDestinationById fallback:", e);
    return staticDestinations.find((d) => d.id === id);
  }
}

export async function getDestinationsByIds(
  ids: string[]
): Promise<Destination[]> {
  if (ids.length === 0) return [];
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .in("id", ids);
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<Destination>(row));
  } catch (e) {
    console.error("[db] getDestinationsByIds fallback:", e);
    return staticDestinations.filter((d) => ids.includes(d.id));
  }
}
