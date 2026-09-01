import type { Metadata } from "next";
import { Suspense } from "react";
import EntityListView from "@/components/ui/EntityListView";
import { getAllSpecies } from "@/lib/db";
import { speciesListConfig } from "@/lib/list-configs";
import { toSpeciesBrowseItem } from "@/lib/browse/species-items";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
import EntityListHeader from "@/components/ui/EntityListHeader";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const allSpecies = await getAllSpecies();
  const n = allSpecies.length;
  return {
    title: brandedTitle(`${n} Fly Fishing Species`),
    description: `Profiles of ${n} fly fishing species: trout, salmon, char, bass, and saltwater game fish. Habitat, tactics, fly patterns, and conservation status.`,
    alternates: { canonical: `${SITE_URL}/species` },
    openGraph: {
      title: `${n} Fly Fishing Species`,
      description: `Profiles of ${n} fly fishing species. Habitat, tactics, fly patterns, and conservation status.`,
      images: [
        `/api/og?title=Fish%20Species%20Guide&subtitle=${encodeURIComponent(`${n} species`)}&type=species`,
      ],
    },
  };
}

export default async function SpeciesListPage() {
  const allSpecies = await getAllSpecies();

  const items = allSpecies.map(toSpeciesBrowseItem);

  return (
    <>
      <EntityListHeader
        overline="The reference"
        title={`${allSpecies.length} species, documented`}
        dek="Trout, salmon, char, bass, and saltwater game fish. Habitat, behavior, fly patterns, and conservation status for each."
      />

      <section className="bg-[var(--paper)] pb-16 sm:pb-24">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
