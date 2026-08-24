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
      <section className="bg-[var(--surface-page)] pt-6 pb-10 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-body)]">
            The reference
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
            {rivers.length} rivers, documented
          </h1>
          <p className="mt-5 max-w-[68ch] text-lg leading-relaxed text-[var(--text-body)]">
            Access points, hatch charts, and live flow when a gauge exists.
            Filter by state, water, species, difficulty, and flow.
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--border-rule)] bg-[var(--surface-page)] pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Suspense>
            <RiversPageClient items={items} stateOptions={stateOptions} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
