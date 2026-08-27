import type { Metadata } from "next";
import { Suspense } from "react";
import DeskMast from "@/components/desk/DeskMast";
import HomeGutter from "@/components/home/HomeGutter";
import EntityListView from "@/components/ui/EntityListView";
import { getAllFlyShops, getAllDestinations } from "@/lib/db";
import { flyShopListConfig } from "@/lib/list-configs";
import type { CardData, EntityListConfig } from "@/types/list-config";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "27 Fly Shops Near the Best Fishing Waters — Local Gear",
  description:
    "Find 27 curated fly shops near top fishing waters. Local knowledge, expert staff, hours, services, and the right flies for every river. Browse by region.",
  alternates: { canonical: `${SITE_URL}/fly-shops` },
  openGraph: {
    title: "27 Fly Shops Near the Best Fishing Waters",
    description: "Find 27 curated fly shops near top fishing waters. Local knowledge, expert staff, and the right flies for every river.",
    images: ["/api/og?title=Fly%20Shops&subtitle=27%20Curated%20Shops&type=default"],
  },
};

export default async function FlyShopsPage() {
  const [flyShops, destinations] = await Promise.all([
    getAllFlyShops(),
    getAllDestinations(),
  ]);

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
    .map(([id, { name }]) => ({ value: id, label: name }));

  const config: EntityListConfig = {
    ...flyShopListConfig,
    filters: [{ ...flyShopListConfig.filters[0], options: destOptions }],
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
        meta: dest?.name,
        description: shop.description.substring(0, 120),
        featured: false,
        _filterValues: {
          destination: shop.destinationId,
        },
      };
    },
  );

  return (
    <>
      <DeskMast
        title="Shops"
        lede="Local counters near the water we keep. Hours and flies. Not a cart."
      />

      <section className="bg-[var(--surface-page)] pb-16">
        <HomeGutter>
          <Suspense>
            <EntityListView items={items} config={config} storageKey="fly-shops" />
          </Suspense>
        </HomeGutter>
      </section>
    </>
  );
}
