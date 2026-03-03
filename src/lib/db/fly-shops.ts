import type { FlyShop } from "@/types/entities";
import { flyShops as staticFlyShops } from "@/data/fly-shops";

export async function getAllFlyShops(): Promise<FlyShop[]> {
  return staticFlyShops;
}

export async function getFlyShopBySlug(
  slug: string
): Promise<FlyShop | undefined> {
  return staticFlyShops.find((s) => s.slug === slug);
}

export async function getFlyShopsByDestination(
  destinationId: string
): Promise<FlyShop[]> {
  return staticFlyShops.filter((s) => s.destinationId === destinationId);
}
