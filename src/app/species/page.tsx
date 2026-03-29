import type { Metadata } from "next";
import { Suspense } from "react";
import HeroSection from "@/components/ui/HeroSection";
import EntityListView from "@/components/ui/EntityListView";
import { getAllSpecies } from "@/lib/db";
import { speciesListConfig } from "@/lib/list-configs";
import type { CardData } from "@/types/list-config";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "35 Fly Fishing Species — Trout, Salmon & Saltwater Guide",
  description:
    "Detailed profiles of 35 fly fishing species — trout, salmon, char, bass, and saltwater game fish. Habitat, tactics, fly patterns, and conservation status.",
  alternates: { canonical: `${SITE_URL}/species` },
  openGraph: {
    title: "35 Fly Fishing Species Guide | Executive Angler",
    description: "Detailed profiles of 35 fly fishing species — trout, salmon, char, bass, and saltwater game fish. Habitat, tactics, and fly patterns.",
    images: ["/api/og?title=Fish%20Species%20Guide&subtitle=35%20Species%20Profiles&type=species"],
  },
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
      imageContain: true,
      _filterValues: {
        family: sp.family || "",
      },
    })
  );

  return (
    <>
      <HeroSection
        imageUrl="https://images.unsplash.com/photo-1573691256963-185431288431?w=1920&q=80"
        imageAlt="Close-up of a freshwater fish with brown and blue tones"
        title="Fish Species Guide"
        subtitle="Detailed profiles of the world's most prized fly fishing species — habitat, behavior, fly patterns, and angling strategies."
      />

      <section className="py-16 sm:py-20 bg-[#0D1117]">
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
