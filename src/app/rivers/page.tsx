import type { Metadata } from "next";
import { Suspense } from "react";
import HeroSection from "@/components/ui/HeroSection";
import EntityListView from "@/components/ui/EntityListView";
import { getAllRivers } from "@/lib/db";
import { riverListConfig } from "@/lib/list-configs";
import type { CardData } from "@/types/list-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fly Fishing Rivers & Waters",
  description:
    "Explore the world's finest fly fishing rivers with detailed maps, hatch charts, access points, and regulations.",
};

export default async function RiversPage() {
  const rivers = await getAllRivers();

  const items: (CardData & { _filterValues: Record<string, string> })[] = rivers.map(
    (river) => ({
      href: `/rivers/${river.slug}`,
      imageUrl: river.heroImageUrl,
      imageAlt: `${river.name} fly fishing`,
      title: river.name,
      subtitle: river.primarySpecies.join(", "),
      meta: `${river.flowType} · ${river.difficulty}`,
      badges: [river.wadingType],
      featured: river.featured,
      description: river.description?.substring(0, 150),
      _filterValues: {
        difficulty: river.difficulty,
        wading: river.wadingType,
      },
    })
  );

  return (
    <>
      <HeroSection
        imageUrl="https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&q=80"
        imageAlt="Crystal clear mountain river with rocks"
        title="Rivers & Waters"
        subtitle="Detailed guides to the world's finest fly fishing rivers — maps, hatches, access, and regulations."
      />

      <section className="py-16 sm:py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense>
            <EntityListView
              items={items}
              config={riverListConfig}
              storageKey="rivers"
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
