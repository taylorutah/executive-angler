import { createStaticClient } from "@/lib/supabase/static";
import { keysToCamel } from "./utils";
import type { FlyShop } from "@/types/entities";
import { flyShops as staticFlyShops } from "@/data/fly-shops";

export async function getAllFlyShops(): Promise<FlyShop[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("fly_shops")
      .select("*")
      .order("name");
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<FlyShop>(row));
  } catch (e) {
    console.error("[db] getAllFlyShops fallback:", e);
    return staticFlyShops;
  }
}

export async function getFlyShopBySlug(
  slug: string
): Promise<FlyShop | undefined> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("fly_shops")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) throw error;
    return data ? keysToCamel<FlyShop>(data) : undefined;
  } catch (e) {
    console.error("[db] getFlyShopBySlug fallback:", e);
    return staticFlyShops.find((s) => s.slug === slug);
  }
}

export async function getFlyShopsByDestination(
  destinationId: string
): Promise<FlyShop[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("fly_shops")
      .select("*")
      .eq("destination_id", destinationId)
      .order("name");
    if (error) throw error;
    return (data || []).map((row) => keysToCamel<FlyShop>(row));
  } catch (e) {
    console.error("[db] getFlyShopsByDestination fallback:", e);
    return staticFlyShops.filter((s) => s.destinationId === destinationId);
  }
}
