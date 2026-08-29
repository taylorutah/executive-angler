import { Suspense } from "react";
import DeskMast from "@/components/desk/DeskMast";
import HomeGutter from "@/components/home/HomeGutter";
import EntityListView from "@/components/ui/EntityListView";
import { getAllDestinations, getAllGuides } from "@/lib/db";
import { guideListConfig } from "@/lib/list-configs";
import type { CardData, EntityListConfig } from "@/types/list-config";
import { hostedStillUrl } from "@/lib/media/image-url";

/** Every guide — magazine + Refine. Same index as Lodges 84:95. */
export default async function GuidesIndex() {
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
        imageUrl: hostedStillUrl(guide.photoUrl),
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
        kicker="FIND"
        title="Every guide we keep"
        lede="Pictures first. One Refine. Their site takes the day. We do not book it."
        titleSize="phrase"
        ledeFace="ui"
      />

      <section className="bg-[var(--paper)] pb-16">
        <HomeGutter>
          <Suspense>
            <EntityListView items={items} config={config} storageKey="guides" />
          </Suspense>
        </HomeGutter>
      </section>
    </>
  );
}
