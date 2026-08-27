import type { Metadata } from "next";
import { Suspense } from "react";
import DeskMast from "@/components/desk/DeskMast";
import HomeGutter from "@/components/home/HomeGutter";
import EntityListView from "@/components/ui/EntityListView";
import { getAllLodges, getAllDestinations, getAllRivers } from "@/lib/db";
import { lodgeListConfig } from "@/lib/list-configs";
import type { CardData, EntityListConfig } from "@/types/list-config";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "32 Premier Fly Fishing Lodges — Reviews & Rates",
  description:
    "Compare 32 fly fishing lodges worldwide — from Alaskan fly-outs to Scottish castle beats. Real reviews, pricing tiers, amenities, and direct booking links.",
  alternates: { canonical: `${SITE_URL}/lodges` },
  openGraph: {
    title: "32 Premier Fly Fishing Lodges",
    description: "Compare 32 fly fishing lodges worldwide — real reviews, pricing tiers, amenities, and direct booking links.",
    images: ["/api/og?title=Fly%20Fishing%20Lodges&subtitle=32%20Premier%20Properties&type=destination"],
  },
};

export default async function LodgesPage() {
  const [lodges, destinations, rivers] = await Promise.all([
    getAllLodges(),
    getAllDestinations(),
    getAllRivers(),
  ]);

  const destCounts = new Map<string, { name: string; count: number }>();
  lodges.forEach((lodge) => {
    const dest = destinations.find((d) => d.id === lodge.destinationId);
    if (dest) {
      const existing = destCounts.get(lodge.destinationId);
      if (existing) existing.count++;
      else destCounts.set(lodge.destinationId, { name: dest.name, count: 1 });
    }
  });
  const destOptions = Array.from(destCounts.entries())
    .sort((a, b) => b[1].count - a[1].count || a[1].name.localeCompare(b[1].name))
    .map(([id, { name }]) => ({ value: id, label: name }));

  const riverIdSet = new Set<string>();
  lodges.forEach((l) => (l.nearbyRiverIds || []).forEach((r) => riverIdSet.add(r)));
  const riverOptions = Array.from(riverIdSet)
    .map((id) => {
      const r = rivers.find((rv) => rv.id === id);
      return r ? { value: id, label: r.name } : null;
    })
    .filter((r): r is { value: string; label: string } => r !== null)
    .sort((a, b) => a.label.localeCompare(b.label));

  const config: EntityListConfig = {
    ...lodgeListConfig,
    filters: [
      { ...lodgeListConfig.filters[0], options: destOptions },
      { ...lodgeListConfig.filters[1], options: riverOptions },
      lodgeListConfig.filters[2],
    ],
  };

  const items: (CardData & { _filterValues: Record<string, string | number> })[] = lodges.map(
    (lodge) => {
      const dest = destinations.find((d) => d.id === lodge.destinationId);
      return {
        href: `/lodges/${lodge.slug}`,
        imageUrl: lodge.heroImageUrl,
        imageAlt: lodge.name,
        title: lodge.name,
        subtitle: dest?.name,
        meta: lodge.priceRange,
        featured: lodge.featured,
        description: lodge.description?.substring(0, 150),
        _filterValues: {
          destination: lodge.destinationId,
          river: lodge.nearbyRiverIds?.[0] ?? "",
          price: String(lodge.priceTier),
        },
      };
    },
  );

  return (
    <>
      <DeskMast
        title="Every lodge we keep"
        lede="Pictures first. One Refine. Not a booking engine. We name the house. Their site takes the bed."
        titleSize="phrase"
        ledeFace="ui"
      />

      <section className="bg-[var(--surface-page)] pb-16">
        <HomeGutter>
          <Suspense>
            <EntityListView items={items} config={config} storageKey="lodges" />
          </Suspense>
        </HomeGutter>
      </section>
    </>
  );
}
