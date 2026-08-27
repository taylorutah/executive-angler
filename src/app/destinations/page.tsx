/**
 * /destinations — browse index (Lane L).
 * Daylight. Editorial header, filter bar (region · season · species · trip), results.
 * No Dusk — this is a catalog, not a workbench.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import EntityListView from "@/components/ui/EntityListView";
import { getAllDestinations } from "@/lib/db";
import { destinationListConfig, destinationRegionGroups } from "@/lib/list-configs";
import { seasonsFromBestMonths, tripLengthFromPlace } from "@/lib/browse/place-filters";
import { speciesTokens } from "@/lib/browse/species-tokens";
import type { CardData } from "@/types/list-config";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
export const revalidate = 3600;

function getRegionGroup(region: string): string {
  for (const [group, regions] of Object.entries(destinationRegionGroups)) {
    if (regions.includes(region)) return group;
  }
  return "north-america";
}

export async function generateMetadata(): Promise<Metadata> {
  const destinations = await getAllDestinations();
  const n = destinations.length;
  return {
    title: brandedTitle(`${n} Fly Fishing Destinations`),
    description: `Browse ${n} fly fishing destinations across the Rockies, Patagonia, New Zealand, Iceland, and beyond. Maps, best months, species, and local intel.`,
    alternates: { canonical: `${SITE_URL}/destinations` },
    openGraph: {
      title: `${n} Fly Fishing Destinations`,
      description: `Browse ${n} fly fishing destinations. Maps, best months, species, and local intel to plan your next trip.`,
      images: [
        `/api/og?title=Fly%20Fishing%20Destinations&subtitle=${encodeURIComponent(`${n} places`)}&type=destination`,
      ],
    },
  };
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
        season: seasonsFromBestMonths(dest.bestMonths).join(","),
        species: speciesTokens(dest.primarySpecies).join(","),
        tripLength: tripLengthFromPlace({
          country: dest.country,
          state: dest.state,
        }),
      },
    }),
  );

  return (
    <>
      <section className="bg-[var(--surface-page)] pt-6 pb-10 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-body)]">
            Places
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
            {destinations.length} destinations
          </h1>
          <p className="mt-5 max-w-[68ch] text-lg leading-relaxed text-[var(--text-body)]">
            {destinations.length} destinations. Filter by region, season, species, and
            trip length.
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--border-rule)] bg-[var(--surface-page)] pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
