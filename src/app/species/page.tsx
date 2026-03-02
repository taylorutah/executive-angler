import type { Metadata } from "next";
import { Suspense } from "react";
import HeroSection from "@/components/ui/HeroSection";
import EntityListView from "@/components/ui/EntityListView";
import { getAllSpecies } from "@/lib/db";
import { speciesListConfig } from "@/lib/list-configs";
import type { CardData } from "@/types/list-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fish Species Guide",
  description:
    "Explore detailed profiles of the most sought-after fly fishing species — from wild trout and salmon to saltwater game fish. Habitat, tactics, fly patterns, and more.",
};

export default async function SpeciesListPage() {
  const allSpecies = await getAllSpecies();

  const items: (CardData & { _filterValues: Record<string, string> })[] = allSpecies.map(
    (sp) => ({
      href: `/species/${sp.slug}`,
      imageUrl:
        sp.imageUrl ||
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80",
      imageAlt: `${sp.commonName} — ${sp.scientificName || "fly fishing species"}`,
      title: sp.commonName,
      subtitle: sp.scientificName,
      meta: sp.conservationStatus || sp.family || undefined,
      badges: sp.family ? [sp.family] : undefined,
      featured: sp.featured,
      description: sp.description?.substring(0, 150),
      _filterValues: {
        family: sp.family || "",
      },
    })
  );

  return (
    <>
      <HeroSection
        imageUrl="https://images.unsplash.com/photo-1545450660-3378a7f3a364?w=1920&q=80"
        imageAlt="Wild trout in crystal clear water"
        title="Fish Species Guide"
        subtitle="Detailed profiles of the world's most prized fly fishing species — habitat, behavior, fly patterns, and angling strategies."
      />

      <section className="py-16 sm:py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense>
            <EntityListView
              items={items}
              config={speciesListConfig}
              storageKey="species"
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
