import type { Metadata } from "next";
import { Suspense } from "react";
import DeskMast from "@/components/desk/DeskMast";
import HomeGutter from "@/components/home/HomeGutter";
import EntityListView from "@/components/ui/EntityListView";
import { getAllGuides, getAllDestinations } from "@/lib/db";
import { guideListConfig } from "@/lib/list-configs";
import type { CardData, EntityListConfig } from "@/types/list-config";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const guides = await getAllGuides();
  const n = guides.length;
  return {
    title: brandedTitle(`${n} Expert Fly Fishing Guides — Compare & Book`),
    description: `Browse ${n} vetted fly fishing guides worldwide with rates, specialties, and reviews. From Montana to Mongolia — find your next guide and book direct.`,
    alternates: { canonical: `${SITE_URL}/guides` },
    openGraph: {
      title: `${n} Expert Fly Fishing Guides`,
      description: `Browse ${n} vetted fly fishing guides worldwide with rates, specialties, and reviews. Find your next guide and book direct.`,
      images: ["/api/og?title=Fly%20Fishing%20Guides&subtitle=Expert%20Professionals&type=default"],
    },
  };
}

export default async function GuidesPage() {
  const [guides, destinations] = await Promise.all([getAllGuides(), getAllDestinations()]);

  const destCounts = new Map<string, { name: string; count: number }>();
  for (const guide of guides) {
    const dest = destinations.find((d) => d.id === guide.destinationId);
    if (!dest) continue;
    const existing = destCounts.get(guide.destinationId);
    if (existing) existing.count++;
    else destCounts.set(guide.destinationId, { name: dest.name, count: 1 });
  }
  const destOptions = Array.from(destCounts.entries())
    .sort((a, b) => b[1].count - a[1].count || a[1].name.localeCompare(b[1].name))
    .map(([id, { name }]) => ({ value: id, label: name }));

  const config: EntityListConfig = {
    ...guideListConfig,
    filters: [{ ...guideListConfig.filters[0], options: destOptions }],
  };

  const items: (CardData & { _filterValues: Record<string, string | number> })[] = guides.map(
    (guide) => {
      const dest = destinations.find((d) => d.id === guide.destinationId);
      return {
        href: `/guides/${guide.slug}`,
        imageUrl: guide.photoUrl || undefined,
        imageAlt: guide.name,
        title: guide.name,
        subtitle: dest?.name,
        kicker: dest?.state || dest?.name,
        group: dest?.state || dest?.name || dest?.country,
        meta: [dest?.name, guide.specialties.slice(0, 2).join(", ")].filter(Boolean).join(" · "),
        featured: false,
        description: guide.bio?.substring(0, 150),
        _filterValues: {
          destination: guide.destinationId,
          experience: guide.yearsExperience ?? 0,
        },
      };
    },
  );

  return (
    <>
      <DeskMast
        title="Guides"
        lede={`${guides.length} people who know a river. Their site takes the day. We do not book it.`}
        titleSize="word"
        ledeFace="ui"
      />

      <section className="bg-[var(--surface-page)] pb-16">
        <HomeGutter>
          <Suspense>
            <EntityListView items={items} config={config} storageKey="guides" />
          </Suspense>
        </HomeGutter>
      </section>
    </>
  );
}
