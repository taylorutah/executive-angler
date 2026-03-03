import type { Metadata } from "next";
import { Suspense } from "react";
import HeroSection from "@/components/ui/HeroSection";
import EntityListView from "@/components/ui/EntityListView";
import { getAllLodges } from "@/lib/db";
import { lodgeListConfig } from "@/lib/list-configs";
import type { CardData } from "@/types/list-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fly Fishing Lodges",
  description:
    "Find the world's best fly fishing lodges. Real reviews, pricing, and direct booking links.",
};

export default async function LodgesPage() {
  const lodges = await getAllLodges();

  const items: (CardData & { _filterValues: Record<string, string | number> })[] = lodges.map(
    (lodge) => ({
      href: `/lodges/${lodge.slug}`,
      imageUrl: lodge.heroImageUrl,
      imageAlt: lodge.name,
      title: lodge.name,
      subtitle: lodge.priceRange,
      meta: lodge.seasonStart && lodge.seasonEnd
        ? `${lodge.seasonStart}–${lodge.seasonEnd}`
        : undefined,
      badges: lodge.amenities.slice(0, 2),
      featured: lodge.featured,
      description: lodge.description?.substring(0, 150),
      _filterValues: {
        price: String(lodge.priceTier),
      },
    })
  );

  return (
    <>
      <HeroSection
        imageUrl="https://images.unsplash.com/photo-1758186377738-6ce0e52851b9?w=1920&q=80"
        imageAlt="Log cabin with grass roof by a serene lake"
        title="Lodges"
        subtitle="Premier fly fishing lodges around the world — hand-picked for exceptional water access, guiding, and hospitality."
      />

      <section className="py-16 sm:py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense>
            <EntityListView
              items={items}
              config={lodgeListConfig}
              storageKey="lodges"
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
