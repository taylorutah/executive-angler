import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import EntityListView from "@/components/ui/EntityListView";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { getAllDestinations } from "@/lib/db";
import { destinationListConfig, destinationRegionGroups } from "@/lib/list-configs";
import type { CardData } from "@/types/list-config";
import { SITE_URL } from "@/lib/constants";
export const revalidate = 3600;

const HERO_SLUG = "alaska";
const SECONDARY_SLUGS = ["montana", "patagonia", "new-zealand"];

function getRegionGroup(region: string): string {
  for (const [group, regions] of Object.entries(destinationRegionGroups)) {
    if (regions.includes(region)) return group;
  }
  return "north-america";
}

export const metadata: Metadata = {
  title: "30+ Fly Fishing Destinations Worldwide — Plan Your Trip",
  description:
    "Explore 30 fly fishing destinations across the Rockies, Patagonia, New Zealand, Iceland, and beyond. Maps, best months, species, and local intel to plan your next adventure.",
  alternates: { canonical: `${SITE_URL}/destinations` },
  openGraph: {
    title: "30+ Fly Fishing Destinations Worldwide",
    description: "Explore 30 fly fishing destinations across the Rockies, Patagonia, New Zealand, Iceland, and beyond. Plan your next adventure.",
    images: ["/api/og?title=Fly%20Fishing%20Destinations&subtitle=Thirty%20places%2C%20documented&type=destination"],
  },
};

export default async function DestinationsPage() {
  const destinations = await getAllDestinations();
  const heroDestination = destinations.find((d) => d.slug === HERO_SLUG);
  const secondaryDestinations = SECONDARY_SLUGS.map((slug) =>
    destinations.find((d) => d.slug === slug)
  ).filter(Boolean);

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
      },
    })
  );

  return (
    <>
      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <section className="bg-[var(--surface-page)] pt-6 pb-10 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--action)]">
            Places
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)]">
            Where Great Fly Fishing Begins
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-[var(--text-body)] leading-relaxed">
            Thirty destinations — from Montana&apos;s spring creeks to the wild salmon
            rivers of Kamchatka.
          </p>
        </div>
      </section>

      {/* ── Spotlight Destinations ─────────────────────────────────────────── */}
      <section className="bg-[var(--surface-page)] pt-2 pb-10 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--action)] mb-8">
            Featured places
          </p>

          {/* Alaska — hero editorial card */}
          {heroDestination && (
            <ScrollAnimation>
              <Link
                href={`/destinations/${heroDestination.slug}`}
                className="group block mb-6"
              >
                <div className="grid lg:grid-cols-5 rounded-2xl overflow-hidden shadow-xl min-h-[380px]">
                  <div className="relative lg:col-span-3 h-72 lg:h-auto min-h-[288px]">
                    <SafeEntityImage
                      src={heroDestination.heroImageUrl}
                      alt={`Fly fishing in ${heroDestination.name}`}
                      title={heroDestination.name}
                      meta={`${heroDestination.region} · ${heroDestination.country}`}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 hidden lg:block pointer-events-none" />
                  </div>
                  <div className="bg-[var(--surface-page)] lg:col-span-2 p-8 lg:p-10 flex flex-col justify-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--action)]">
                      Featured place
                    </p>
                    <h2 className="mt-2 font-heading text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                      {heroDestination.name}
                    </h2>
                    <p className="mt-1 text-base font-medium text-[var(--text-body)]">
                      {heroDestination.tagline}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-[var(--text-meta)] text-sm">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>
                        {heroDestination.region} · {heroDestination.country}
                      </span>
                    </div>
                    <p className="mt-4 text-[var(--text-body)] text-sm leading-relaxed line-clamp-3">
                      {heroDestination.description?.substring(0, 240)}...
                    </p>
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {heroDestination.primarySpecies.slice(0, 4).map((sp) => (
                        <span
                          key={sp}
                          className="px-2.5 py-1 bg-[var(--surface-raised)] text-[var(--text-body)] text-[10px] font-medium rounded-full"
                        >
                          {sp}
                        </span>
                      ))}
                    </div>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--action)] group-hover:underline">
                      Explore Alaska <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </ScrollAnimation>
          )}

          {/* 3 secondary destination cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {secondaryDestinations.map((dest, i) => {
              if (!dest) return null;
              return (
                <ScrollAnimation key={dest.id} delay={i * 0.1}>
                  <Link
                    href={`/destinations/${dest.slug}`}
                    className="group block bg-[var(--surface-raised)] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-52">
                      <SafeEntityImage
                        src={dest.heroImageUrl}
                        alt={`Fly fishing in ${dest.name}`}
                        title={dest.name}
                        meta={`${dest.region} · ${dest.country}`}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        priority
                        scrimClassName="bg-gradient-to-t from-black/80 via-black/40 to-black/10"
                      />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="font-heading text-xl font-bold text-white leading-tight">
                          {dest.name}
                        </h3>
                        <p className="text-white/80 text-xs mt-0.5 line-clamp-1">
                          {dest.tagline}
                        </p>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap gap-1.5">
                        {dest.primarySpecies.slice(0, 3).map((sp) => (
                          <span
                            key={sp}
                            className="px-2 py-0.5 bg-[var(--surface-page)] text-[var(--action)] text-[10px] font-medium rounded-full"
                          >
                            {sp}
                          </span>
                        ))}
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--action)] group-hover:underline">
                        Explore <ChevronRight className="h-3.5 w-3.5" />
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
      <div className="bg-[var(--surface-raised)] border-t border-[var(--border-rule)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h2 className="font-heading text-2xl font-bold text-[var(--action)]">All Destinations</h2>
          <p className="text-sm text-[var(--text-body)] mt-1">
            {destinations.length} destinations — filterable by region
          </p>
        </div>
      </div>
      <section className="bg-[var(--surface-raised)] pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
