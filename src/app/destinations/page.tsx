/**
 * /destinations — browse index (Lane L).
 * Daylight. Editorial header, filter bar (region · season · species · trip), results.
 * No Dusk — this is a catalog, not a workbench.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import DeskMast from "@/components/desk/DeskMast";
import HomeGutter from "@/components/home/HomeGutter";
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
      <DeskMast
        title="Every place we keep"
        lede="Lodges, shops, and water. Not a booking engine. Pictures first. One Refine."
        titleSize="phrase"
        ledeFace="ui"
      />

      <section className="bg-[var(--surface-page)] pb-16">
        <HomeGutter>
          <Suspense>
            <EntityListView
              items={items}
              config={destinationListConfig}
              storageKey="destinations"
            />
          </Suspense>
        </HomeGutter>
      </section>
    </>
  );
}
