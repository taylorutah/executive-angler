/**
 * /rivers — browse index (Lane L).
 *
 * Daylight throughout. This is a finding surface, not a workbench, so there
 * is no Dusk switch. Editorial header, filter bar, results, load-more.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllRivers } from "@/lib/db";
import DeskMast from "@/components/desk/DeskMast";
import HomeGutter from "@/components/home/HomeGutter";
import BrowseIndexFallback from "@/components/ui/BrowseIndexFallback";
import DismissBrowseFallback from "@/components/ui/DismissBrowseFallback";
import RiversPageClient from "./RiversPageClient";
import { toRiverBrowseItem, statesForRiver } from "@/lib/browse/river-items";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
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
  const items = rivers.map(toRiverBrowseItem);
  const stateOptions = [...new Set(rivers.flatMap((r) => statesForRiver(r)))]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ value: name, label: name }));

  return (
    <>
      <DeskMast
        title="Rivers"
        lede={`${rivers.length} waters we actually keep. Honest flows. Pictures first.`}
      />

      <section className="bg-[var(--surface-page)] pb-16">
        <HomeGutter>
          <BrowseIndexFallback id="rivers-browse-fallback" count={items.length} />
          <Suspense fallback={null}>
            <DismissBrowseFallback fallbackId="rivers-browse-fallback">
              <RiversPageClient items={items} stateOptions={stateOptions} />
            </DismissBrowseFallback>
          </Suspense>
        </HomeGutter>
      </section>
    </>
  );
}
