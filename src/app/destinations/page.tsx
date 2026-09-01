/**
 * /destinations — browse index (Lane L).
 * Daylight. Editorial header, filter bar (region · season · species · trip), results.
 * No Dusk — this is a catalog, not a workbench.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import EntityListView from "@/components/ui/EntityListView";
import { getAllDestinations } from "@/lib/db";
import { destinationListConfig } from "@/lib/list-configs";
import { toDestinationBrowseItem } from "@/lib/browse/destination-items";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
import EntityListHeader from "@/components/ui/EntityListHeader";
export const revalidate = 3600;

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

  const items = destinations.map(toDestinationBrowseItem);

  return (
    <>
      <EntityListHeader
        overline="Places"
        title={`${destinations.length} destinations`}
        dek="Filter by region, season, species, and trip length."
      />

      <section className="bg-[var(--paper)] pb-16 sm:pb-24">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
