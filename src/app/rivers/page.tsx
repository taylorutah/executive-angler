/**
 * /rivers — browse index (Lane L).
 *
 * Daylight throughout. This is a finding surface, not a workbench, so there
 * is no Dusk switch. Editorial header, filter bar, results, load-more.
 */
import type { Metadata } from "next";
import Link from "next/link";
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
  const featured = rivers.filter((river) => river.featured);
  const stateOptions = [...new Set(rivers.flatMap((r) => statesForRiver(r)))]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ value: name, label: name }));

  return (
    <>
      <EntityListHeader
        overline="The reference"
        title={`${rivers.length} rivers, documented`}
        dek="Access points, hatch charts, and live flow when a gauge exists. Filter by state, water, species, difficulty, and flow."
      >
        {featured.length > 0 && (
          <div className="mt-6">
            <p className="ea-overline">Start here</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {featured.map((river) => (
                <li key={river.id}>
                  <Link
                    href={`/rivers/${river.slug}`}
                    className="ea-chip border border-[var(--border)] bg-[var(--surface)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                  >
                    {river.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </EntityListHeader>

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
