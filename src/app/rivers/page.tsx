/**
 * /rivers — browse index (Lane L).
 *
 * Daylight throughout. This is a finding surface, not a workbench, so there
 * is no Dusk switch. Editorial header, filter bar, results, load-more.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllRivers } from "@/lib/db";
import RiversPageClient from "./RiversPageClient";
import { toRiverBrowseItem, statesForRiver } from "@/lib/browse/river-items";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
import EntityListHeader from "@/components/ui/EntityListHeader";
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const rivers = await getAllRivers();
  const n = rivers.length;
  return {
    title: brandedTitle(`${n} Fly Fishing Rivers — Maps, Hatches & Access Points`),
    description: `Browse ${n} fly fishing rivers with interactive maps, hatch charts, access points, and regulations. From the Madison to the Moy — find your next water.`,
    alternates: { canonical: `${SITE_URL}/rivers` },
    openGraph: {
      title: `${n} Fly Fishing Rivers — Maps, Hatches & Access`,
      description: `Browse ${n} fly fishing rivers with interactive maps, hatch charts, access points, and regulations. Find your next water.`,
      images: ["/api/og?title=Fly%20Fishing%20Rivers&subtitle=Legendary%20Waters&type=river"],
    },
  };
}

export default async function RiversPage() {
  const rivers = await getAllRivers();
  const items = rivers.map((river) => toRiverBrowseItem(river));
  const stateOptions = [...new Set(rivers.flatMap((r) => statesForRiver(r)))]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ value: name, label: name }));

  return (
    <>
      <EntityListHeader
        overline="The reference"
        title={`${rivers.length} rivers, documented`}
        dek="Access, hatches, and live flow when a gauge exists. Ungauged water is an em dash — never a guessed number."
      />

      <section className="bg-[var(--paper)] pb-16 sm:pb-24">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Suspense>
            <RiversPageClient items={items} stateOptions={stateOptions} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
