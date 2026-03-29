import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import EntityListView from "@/components/ui/EntityListView";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { getAllGuides, getAllDestinations } from "@/lib/db";
import { guideListConfig } from "@/lib/list-configs";
import type { CardData, EntityListConfig } from "@/types/list-config";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

const SPOTLIGHT_SLUGS = [
  "domenick-swentosky-troutbitten",
  "jackson-hole-anglers",
  "paddy-mcdonnell-moy-ghillie",
] as const;

const GUIDE_HEADLINES: Record<string, string> = {
  "domenick-swentosky-troutbitten": "Twenty-Five Years on Pennsylvania's Wild Limestone Streams",
  "jackson-hole-anglers": "Wild Cutthroats in the Shadow of the Tetons",
  "paddy-mcdonnell-moy-ghillie": "Third-Generation Ghillie on Ireland's River Moy",
};

export const metadata: Metadata = {
  title: "31 Expert Fly Fishing Guides — Compare & Book",
  description:
    "Browse 31 vetted fly fishing guides worldwide with rates, specialties, and reviews. From Montana to Mongolia — find your next guide and book direct.",
  alternates: { canonical: `${SITE_URL}/guides` },
  openGraph: {
    title: "31 Expert Fly Fishing Guides | Executive Angler",
    description: "Browse 31 vetted fly fishing guides worldwide with rates, specialties, and reviews. Find your next guide and book direct.",
    images: ["/api/og?title=Fly%20Fishing%20Guides&subtitle=31%20Expert%20Professionals&type=default"],
  },
};

export default async function GuidesPage() {
  const [guides, destinations] = await Promise.all([getAllGuides(), getAllDestinations()]);

  const spotlightGuides = SPOTLIGHT_SLUGS.map((s) =>
    guides.find((g) => g.slug === s)
  ).filter(Boolean);

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
    defaultView: "list",
    availableViews: ["list", "compact"],
  };

  const items: (CardData & { _filterValues: Record<string, string | number> })[] = guides.map(
    (guide) => {
      const dest = destinations.find((d) => d.id === guide.destinationId);
      return {
        href: `/guides/${guide.slug}`,
        imageUrl: undefined,
        imageAlt: guide.name,
        title: guide.name,
        subtitle: dest?.name,
        description: guide.bio.substring(0, 120),
        tags: guide.specialties.slice(0, 3),
        accent: guide.dailyRate || undefined,
        featured: false,
        _filterValues: {
          destination: guide.destinationId,
          experience: guide.yearsExperience ?? 0,
        },
      };
    }
  );

  return (
    <>
      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <section className="bg-[#0D1117] pt-6 pb-10 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A]">
            Expert Voices
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Your Guide Makes the Trip
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-white/70 leading-relaxed">
            {guides.length} certified professionals with decades of experience on the
            world&apos;s most storied waters.
          </p>
        </div>
      </section>

      {/* ── Spotlight Guides ──────────────────────────────────────────────── */}
      <section className="bg-[#0D1117] pt-2 pb-10 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A] mb-8">
            Featured Guides
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {spotlightGuides.map((guide, i) => {
              if (!guide) return null;
              const dest = destinations.find((d) => d.id === guide.destinationId);
              return (
                <ScrollAnimation key={guide.id} delay={i * 0.1}>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="group block bg-[#161B22] rounded-xl border-l-4 border-[#E8923A] shadow-lg hover:bg-[#1C2128] transition-colors"
                  >
                    <div className="p-6">
                      <h3 className="font-heading text-2xl font-bold text-white group-hover:text-[#E8923A] transition-colors leading-tight">
                        {guide.name}
                      </h3>
                      <p className="mt-2 text-sm font-medium text-[#E8923A] italic">
                        {GUIDE_HEADLINES[guide.slug]}
                      </p>
                      {dest && (
                        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#6E7681]">
                          {dest.name}
                        </p>
                      )}
                      <p className="mt-4 text-sm text-[#A8B2BD] leading-relaxed line-clamp-3">
                        {guide.bio.substring(0, 150)}...
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {guide.specialties.slice(0, 3).map((sp) => (
                          <span
                            key={sp}
                            className="px-2.5 py-1 bg-[#0D1117] text-[#E8923A] text-xs font-medium rounded-full border border-[#21262D]"
                          >
                            {sp}
                          </span>
                        ))}
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-[#21262D] pt-4">
                        <div className="flex items-center gap-4">
                          {guide.googleRating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-[#E8923A] text-[#E8923A]" />
                              <span className="text-sm text-[#A8B2BD]">
                                {guide.googleRating}
                              </span>
                            </div>
                          )}
                          {guide.yearsExperience && (
                            <span className="text-xs text-[#6E7681]">
                              {guide.yearsExperience}+ yrs
                            </span>
                          )}
                        </div>
                        {guide.dailyRate && (
                          <span className="text-sm font-semibold text-[#E8923A]">
                            {guide.dailyRate}
                          </span>
                        )}
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#E8923A] group-hover:underline">
                        View Profile <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </ScrollAnimation>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Full Catalog ──────────────────────────────────────────────────── */}
      <div className="bg-[#161B22] border-t border-[#21262D]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h2 className="font-heading text-2xl font-bold text-[#E8923A]">All Guides</h2>
          <p className="text-sm text-[#A8B2BD] mt-1">
            {guides.length} guides — filterable by destination and experience
          </p>
        </div>
      </div>
      <section className="bg-[#161B22] pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense>
            <EntityListView items={items} config={config} storageKey="guides" />
          </Suspense>
        </div>
      </section>
    </>
  );
}
