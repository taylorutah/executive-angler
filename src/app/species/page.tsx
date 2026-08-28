import type { Metadata } from "next";
import { Suspense } from "react";
import EntityListView from "@/components/ui/EntityListView";
import { getAllSpecies } from "@/lib/db";
import { speciesListConfig } from "@/lib/list-configs";
import type { CardData } from "@/types/list-config";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";

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

  const items: (CardData & { _filterValues: Record<string, string> })[] = allSpecies.map(
    (sp) => ({
      href: `/species/${sp.slug}`,
      imageUrl: sp.imageUrl || sp.illustrationUrl || undefined,
      imageAlt: `${sp.commonName} — ${sp.scientificName || "fly fishing species"}`,
      title: sp.commonName,
      subtitle: sp.scientificName,
      meta: [sp.family, sp.conservationStatus].filter(Boolean).join(" · ") || undefined,
      badges: sp.family ? [sp.family] : undefined,
      featured: sp.featured,
      description: sp.description?.substring(0, 150),
      imageContain: true,
      _filterValues: {
        family: sp.family || "",
      },
    }),
  );

  return (
    <>
      <section className="bg-[var(--paper)] pt-6 pb-10 sm:pb-12">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <p className="ea-overline">
            The reference
          </p>
          <h1 className="mt-3 text-[var(--text-1)]">
            {allSpecies.length} species, documented
          </h1>
          <p className="mt-5 max-w-[var(--prose)] text-lg leading-relaxed text-[var(--text-2)]">
            Trout, salmon, char, bass, and saltwater game fish. Habitat, behavior,
            fly patterns, and conservation status for each.
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--paper)] pb-16 sm:pb-24">
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
