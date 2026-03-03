import type { Metadata } from "next";
import { Suspense } from "react";
import HeroSection from "@/components/ui/HeroSection";
import EntityListView from "@/components/ui/EntityListView";
import { getAllGuides, getAllDestinations } from "@/lib/db";
import { guideListConfig } from "@/lib/list-configs";
import type { CardData, EntityListConfig } from "@/types/list-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fly Fishing Guides",
  description:
    "Find expert fly fishing guides worldwide. Profiles, specialties, rates, and direct booking links.",
};

export default async function GuidesPage() {
  const [guides, destinations] = await Promise.all([
    getAllGuides(),
    getAllDestinations(),
  ]);

  // Build destination filter options dynamically
  const destCounts = new Map<string, { name: string; count: number }>();
  guides.forEach((g) => {
    const dest = destinations.find((d) => d.id === g.destinationId);
    if (dest) {
      const existing = destCounts.get(g.destinationId);
      if (existing) {
        existing.count++;
      } else {
        destCounts.set(g.destinationId, { name: dest.name, count: 1 });
      }
    }
  });

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
        imageAlt: guide.name,
        title: guide.name,
        subtitle: dest?.name,
        description: guide.bio.substring(0, 120),
        tags: guide.specialties.slice(0, 3),
        accent: guide.dailyRate || undefined,
        featured: false,
        iconOnly: true,
        _filterValues: {
          destination: guide.destinationId,
          experience: guide.yearsExperience ?? 0,
        },
      };
    }
  );

  return (
    <>
      <HeroSection
        imageUrl="https://images.unsplash.com/photo-1720465033515-3ff32449380f?w=1920&q=80"
        imageAlt="Fly fishing angler standing in river with caught fish"
        title="Guides"
        subtitle="Expert fly fishing guides who know every riffle, run, and hatch on their home waters."
      />

      <section className="py-16 sm:py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense>
            <EntityListView items={items} config={config} storageKey="guides" />
          </Suspense>
        </div>
      </section>
    </>
  );
}
