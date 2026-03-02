import type { Metadata } from "next";
import { Suspense } from "react";
import HeroSection from "@/components/ui/HeroSection";
import EntityListView from "@/components/ui/EntityListView";
import { getAllFlyShops, getAllDestinations } from "@/lib/db";
import { flyShopListConfig } from "@/lib/list-configs";
import type { CardData, EntityListConfig } from "@/types/list-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fly Shops",
  description:
    "Find the best fly shops near your fishing destination. Local knowledge, gear, guided trips, and fly tying supplies.",
};

export default async function FlyShopsPage() {
  const [flyShops, destinations] = await Promise.all([
    getAllFlyShops(),
    getAllDestinations(),
  ]);

  // Build destination filter options dynamically
  const destCounts = new Map<string, { name: string; count: number }>();
  flyShops.forEach((shop) => {
    const dest = destinations.find((d) => d.id === shop.destinationId);
    if (dest) {
      const existing = destCounts.get(shop.destinationId);
      if (existing) {
        existing.count++;
      } else {
        destCounts.set(shop.destinationId, { name: dest.name, count: 1 });
      }
    }
  });

  const destOptions = Array.from(destCounts.entries())
    .sort((a, b) => b[1].count - a[1].count || a[1].name.localeCompare(b[1].name))
    .map(([id, { name }]) => ({
      value: id,
      label: name,
    }));

  const config: EntityListConfig = {
    ...flyShopListConfig,
    filters: [
      {
        ...flyShopListConfig.filters[0],
        options: destOptions,
      },
    ],
  };

  const items: (CardData & { _filterValues: Record<string, string> })[] = flyShops.map(
    (shop) => {
      const dest = destinations.find((d) => d.id === shop.destinationId);
      return {
        href: `/fly-shops/${shop.slug}`,
        imageUrl: shop.heroImageUrl || undefined,
        imageAlt: shop.name,
        title: shop.name,
        subtitle: dest?.name,
        description: shop.description.substring(0, 120),
        tags: shop.services.slice(0, 3),
        featured: false,
        iconOnly: !shop.heroImageUrl,
        _filterValues: {
          destination: shop.destinationId,
        },
      };
    }
  );

  return (
    <>
      <HeroSection
        imageUrl="https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=1920&q=80"
        imageAlt="Fly fishing gear and flies"
        title="Fly Shops"
        subtitle="Local fly shops with the gear, knowledge, and guides to put you on fish."
      />

      <section className="py-16 sm:py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense>
            <EntityListView
              items={items}
              config={config}
              storageKey="fly-shops"
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
