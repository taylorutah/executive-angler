import type { Metadata } from "next";
import { Suspense } from "react";
import HeroSection from "@/components/ui/HeroSection";
import EntityListView from "@/components/ui/EntityListView";
import { getAllDestinations } from "@/lib/db";
import { destinationListConfig, destinationRegionGroups } from "@/lib/list-configs";
import type { CardData } from "@/types/list-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fly Fishing Destinations",
  description:
    "Explore the world's finest fly fishing destinations — from the Rocky Mountain West to Patagonia, New Zealand, and beyond.",
};

function getRegionGroup(region: string): string {
  for (const [group, regions] of Object.entries(destinationRegionGroups)) {
    if (regions.includes(region)) return group;
  }
  return "north-america";
}

export default async function DestinationsPage() {
  const destinations = await getAllDestinations();

  const items: (CardData & { _filterValues: Record<string, string> })[] = destinations.map(
    (dest) => ({
      href: `/destinations/${dest.slug}`,
      imageUrl: dest.heroImageUrl,
      imageAlt: `Fly fishing in ${dest.name}`,
      title: dest.name,
      subtitle: dest.tagline,
      meta: dest.primarySpecies.slice(0, 3).join(" · "),
      badges: [dest.region],
      featured: dest.featured,
      description: dest.description?.substring(0, 150),
      _filterValues: {
        region: getRegionGroup(dest.region),
      },
    })
  );

  return (
    <>
      <HeroSection
        imageUrl="https://images.unsplash.com/photo-1770243173807-0cea8e5a893a?w=1920&q=80"
        imageAlt="Wide river flowing through a lush mountain valley at twilight"
        title="Destinations"
        subtitle="The world's finest fly fishing waters, from Montana's legendary rivers to the remote streams of New Zealand."
      />

      <section className="py-16 sm:py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense>
            <EntityListView
              items={items}
              config={destinationListConfig}
              storageKey="destinations"
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
