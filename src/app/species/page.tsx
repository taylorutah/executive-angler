import type { Metadata } from "next";
import { Suspense } from "react";
import DeskMast from "@/components/desk/DeskMast";
import HomeGutter from "@/components/home/HomeGutter";
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
      <DeskMast
        title="Species"
        lede={`${allSpecies.length} we actually keep. Habitat, flies, conservation. Pictures first. One Refine.`}
      />

      <section className="bg-[var(--surface-page)] pb-16">
        <HomeGutter>
          <Suspense>
            <EntityListView
              items={items}
              config={speciesListConfig}
              storageKey="species"
            />
          </Suspense>
        </HomeGutter>
      </section>
    </>
  );
}
