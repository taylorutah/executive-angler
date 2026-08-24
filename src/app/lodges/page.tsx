import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { MapPin, ChevronRight, Star } from "lucide-react";
import EntityListView from "@/components/ui/EntityListView";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { getAllLodges, getAllDestinations, getAllRivers } from "@/lib/db";
import { lodgeListConfig } from "@/lib/list-configs";
import type { CardData, EntityListConfig } from "@/types/list-config";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

const HERO_SLUG = "firehole-ranch";
const SECONDARY_SLUGS = ["bristol-bay-sportfishing", "dean-river-lodge", "snake-river-sporting-club"];

export const metadata: Metadata = {
  title: "32 Premier Fly Fishing Lodges — Reviews & Rates",
  description:
    "Compare 32 fly fishing lodges worldwide — from Alaskan fly-outs to Scottish castle beats. Real reviews, pricing tiers, amenities, and direct booking links.",
  alternates: { canonical: `${SITE_URL}/lodges` },
  openGraph: {
    title: "32 Premier Fly Fishing Lodges",
    description: "Compare 32 fly fishing lodges worldwide — real reviews, pricing tiers, amenities, and direct booking links.",
    images: ["/api/og?title=Fly%20Fishing%20Lodges&subtitle=32%20Premier%20Properties&type=destination"],
  },
};

export default async function LodgesPage() {
  const [lodges, destinations, rivers] = await Promise.all([
    getAllLodges(),
    getAllDestinations(),
    getAllRivers(),
  ]);

  const heroLodge = lodges.find((l) => l.slug === HERO_SLUG);
  const secondaryLodges = SECONDARY_SLUGS.map((slug) =>
    lodges.find((l) => l.slug === slug)
  ).filter(Boolean);

  // Build destination filter options dynamically
  const destCounts = new Map<string, { name: string; count: number }>();
  lodges.forEach((lodge) => {
    const dest = destinations.find((d) => d.id === lodge.destinationId);
    if (dest) {
      const existing = destCounts.get(lodge.destinationId);
      if (existing) existing.count++;
      else destCounts.set(lodge.destinationId, { name: dest.name, count: 1 });
    }
  });
  const destOptions = Array.from(destCounts.entries())
    .sort((a, b) => b[1].count - a[1].count || a[1].name.localeCompare(b[1].name))
    .map(([id, { name }]) => ({ value: id, label: name }));

  // Build river filter options from lodges' nearbyRiverIds
  const riverIdSet = new Set<string>();
  lodges.forEach((l) => (l.nearbyRiverIds || []).forEach((r) => riverIdSet.add(r)));
  const riverOptions = Array.from(riverIdSet)
    .map((id) => {
      const r = rivers.find((rv) => rv.id === id);
      return r ? { value: id, label: r.name } : null;
    })
    .filter((r): r is { value: string; label: string } => r !== null)
    .sort((a, b) => a.label.localeCompare(b.label));

  const config: EntityListConfig = {
    ...lodgeListConfig,
    filters: [
      { ...lodgeListConfig.filters[0], options: destOptions },
      { ...lodgeListConfig.filters[1], options: riverOptions },
      lodgeListConfig.filters[2],
    ],
  };

  const items: (CardData & { _filterValues: Record<string, string | number> })[] = lodges.map(
    (lodge) => ({
      href: `/lodges/${lodge.slug}`,
      imageUrl: lodge.heroImageUrl,
      imageAlt: lodge.name,
      title: lodge.name,
      subtitle: lodge.priceRange,
      meta:
        lodge.seasonStart && lodge.seasonEnd
          ? `${lodge.seasonStart}–${lodge.seasonEnd}`
          : undefined,
      badges: lodge.amenities.slice(0, 2),
      featured: lodge.featured,
      description: lodge.description?.substring(0, 150),
      _filterValues: {
        destination: lodge.destinationId,
        river: lodge.nearbyRiverIds?.[0] ?? "",
        price: String(lodge.priceTier),
      },
    })
  );

  return (
    <>
      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <section className="bg-[var(--surface-page)] pt-6 pb-10 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--action)]">
            Premier Accommodations
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Stay Where the Fishing Is Finest
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-white/70 leading-relaxed">
            World-class lodges at the world&apos;s greatest fisheries — from remote Alaskan
            fly-outs to Scottish castle beats.
          </p>
        </div>
      </section>

      {/* ── Spotlight Lodges ──────────────────────────────────────────────── */}
      <section className="bg-[var(--surface-page)] pt-2 pb-10 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--action)] mb-8">
            Editor&apos;s Selection
          </p>

          {/* Firehole Ranch — hero editorial card */}
          {heroLodge && (
            <ScrollAnimation>
              <Link
                href={`/lodges/${heroLodge.slug}`}
                className="group block mb-6"
              >
                <div className="grid lg:grid-cols-5 rounded-2xl overflow-hidden shadow-xl min-h-[380px]">
                  <div className="relative lg:col-span-3 h-72 lg:h-auto min-h-[288px]">
                    <SafeEntityImage
                      src={heroLodge.heroImageUrl}
                      alt={heroLodge.name}
                      title={heroLodge.name}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 hidden lg:block pointer-events-none" />
                  </div>
                  <div className="bg-[var(--surface-page)] lg:col-span-2 p-8 lg:p-10 flex flex-col justify-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--action)]">
                      Featured Lodge
                    </p>
                    <h2 className="mt-2 font-heading text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                      {heroLodge.name}
                    </h2>
                    <div className="mt-2 flex items-center gap-1.5 text-[var(--text-meta)] text-sm">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>West Yellowstone, Montana</span>
                    </div>
                    {heroLodge.averageRating && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-[var(--action)] text-[var(--action)]" />
                        <span className="text-[var(--text-body)] text-sm font-medium">
                          {heroLodge.averageRating} · {heroLodge.reviewCount} reviews
                        </span>
                      </div>
                    )}
                    <p className="mt-4 text-[var(--text-body)] text-sm leading-relaxed line-clamp-3">
                      {heroLodge.description?.substring(0, 240)}...
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {heroLodge.amenities.slice(0, 4).map((a) => (
                        <span
                          key={a}
                          className="px-2.5 py-1 bg-[var(--surface-raised)] text-[var(--text-body)] text-[10px] font-medium rounded-full"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[var(--action)] text-sm font-semibold">
                        {heroLodge.priceRange}
                      </span>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--action)] group-hover:underline">
                      View Lodge <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </ScrollAnimation>
          )}

          {/* 3 secondary lodge cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {secondaryLodges.map((lodge, i) => {
              if (!lodge) return null;
              return (
                <ScrollAnimation key={lodge.id} delay={i * 0.1}>
                  <Link
                    href={`/lodges/${lodge.slug}`}
                    className="group block bg-[var(--surface-raised)] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-52">
                      <SafeEntityImage
                        src={lodge.heroImageUrl}
                        alt={lodge.name}
                        title={lodge.name}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="font-heading text-xl font-bold text-white leading-tight">
                          {lodge.name}
                        </h3>
                        {lodge.priceRange && (
                          <p className="text-[var(--action)] text-xs mt-0.5 font-medium">
                            {lodge.priceRange}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap gap-1.5">
                        {lodge.amenities.slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="px-2 py-0.5 bg-[var(--surface-page)] text-[var(--action)] text-[10px] font-medium rounded-full"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                      {lodge.averageRating && (
                        <div className="mt-3 flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-[var(--action)] text-[var(--action)]" />
                          <span className="text-[var(--text-body)] text-xs">
                            {lodge.averageRating} ({lodge.reviewCount} reviews)
                          </span>
                        </div>
                      )}
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--action)] group-hover:underline">
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
          <h2 className="font-heading text-2xl font-bold text-[var(--action)]">All Lodges</h2>
          <p className="text-sm text-[var(--text-body)] mt-1">
            {lodges.length} world-class lodges — filter by destination, river &amp; price
          </p>
        </div>
      </div>
      <section className="bg-[var(--surface-raised)] pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense>
            <EntityListView items={items} config={config} storageKey="lodges" />
          </Suspense>
        </div>
      </section>
    </>
  );
}
