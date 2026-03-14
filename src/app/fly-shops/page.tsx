import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ChevronRight, Star } from "lucide-react";
import EntityListView from "@/components/ui/EntityListView";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { getAllFlyShops, getAllDestinations } from "@/lib/db";
import { flyShopListConfig } from "@/lib/list-configs";
import type { CardData, EntityListConfig } from "@/types/list-config";

export const revalidate = 3600;

const SPOTLIGHT_SLUGS = [
  "blue-ribbon-flies",
  "jack-dennis-outdoor-shop",
  "world-cast-anglers",
  "silver-creek-outfitters",
] as const;

const SHOP_HEADLINES: Record<string, string> = {
  "blue-ribbon-flies": "The Gateway to Yellowstone's Blue-Ribbon Waters",
  "jack-dennis-outdoor-shop": "Jackson Hole's Premier Fly Fishing Institution",
  "world-cast-anglers": "Teton Valley's Destination Shop",
  "silver-creek-outfitters": "Sun Valley's Spring Creek Specialists",
};

export const metadata: Metadata = {
  title: "Fly Shops",
  description:
    "Local knowledge, expert staff, and the right fly for the right river — curated fly shops near the best waters on earth.",
};

export default async function FlyShopsPage() {
  const [flyShops, destinations] = await Promise.all([
    getAllFlyShops(),
    getAllDestinations(),
  ]);

  const spotlightShops = SPOTLIGHT_SLUGS.map((s) =>
    flyShops.find((shop) => shop.slug === s)
  ).filter(Boolean);

  // Build destination filter options dynamically
  const destCounts = new Map<string, { name: string; count: number }>();
  flyShops.forEach((shop) => {
    const dest = destinations.find((d) => d.id === shop.destinationId);
    if (dest) {
      const existing = destCounts.get(shop.destinationId);
      if (existing) {
        existing.count++;
      } else {
        destCounts.set(shop.destinationId, { name: dest.name, count: 1 });
      }
    }
  });

  const destOptions = Array.from(destCounts.entries())
    .sort((a, b) => b[1].count - a[1].count || a[1].name.localeCompare(b[1].name))
    .map(([id, { name }]) => ({ value: id, label: name }));

  const config: EntityListConfig = {
    ...flyShopListConfig,
    filters: [{ ...flyShopListConfig.filters[0], options: destOptions }],
  };

  const items: (CardData & { _filterValues: Record<string, string> })[] = flyShops.map(
    (shop) => {
      const dest = destinations.find((d) => d.id === shop.destinationId);
      return {
        href: `/fly-shops/${shop.slug}`,
        imageUrl: shop.heroImageUrl || undefined,
        imageAlt: shop.name,
        title: shop.name,
        subtitle: dest?.name,
        description: shop.description.substring(0, 120),
        tags: shop.services.slice(0, 3),
        featured: false,
        iconOnly: !shop.heroImageUrl,
        _filterValues: {
          destination: shop.destinationId,
        },
      };
    }
  );

  return (
    <>
      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <section className="bg-[#0D1117] pt-20 pb-10 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A]">
            Outfitted for the Water
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Gear Up at the Source
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-white/70 leading-relaxed">
            Local knowledge, expert staff, and the right fly for the right river — curated
            shops near the best waters on earth.
          </p>
        </div>
      </section>

      {/* ── Spotlight Shops ───────────────────────────────────────────────── */}
      <section className="bg-[#0D1117] pt-2 pb-10 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A] mb-8">
            Iconic Shops
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {spotlightShops.map((shop, i) => {
              if (!shop) return null;
              const dest = destinations.find((d) => d.id === shop.destinationId);
              return (
                <ScrollAnimation key={shop.id} delay={i * 0.08}>
                  <Link
                    href={`/fly-shops/${shop.slug}`}
                    className="group block bg-[#161B22] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-full"
                  >
                    {shop.heroImageUrl && (
                      <div className="relative h-48">
                        <Image
                          src={shop.heroImageUrl}
                          alt={shop.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/60 to-transparent" />
                        {shop.googleRating && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#161B22]/90 backdrop-blur-sm rounded-full px-2 py-1">
                            <Star className="h-3 w-3 fill-[#E8923A] text-[#E8923A]" />
                            <span className="text-[10px] font-semibold text-[#E8923A]">
                              {shop.googleRating}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-5 flex flex-col h-full">
                      <h3 className="font-heading text-lg font-bold text-[#E8923A] group-hover:text-[#E8923A] transition-colors leading-snug">
                        {shop.name}
                      </h3>
                      <p className="mt-0.5 text-sm font-medium text-[#E8923A]">
                        {SHOP_HEADLINES[shop.slug]}
                      </p>
                      {(shop.address || dest) && (
                        <div className="mt-1.5 flex items-start gap-1 text-[#484F58] text-xs">
                          <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">
                            {shop.address ?? dest?.name}
                          </span>
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {shop.services.slice(0, 2).map((svc) => (
                          <span
                            key={svc}
                            className="px-2 py-0.5 bg-[#0D1117] text-[#E8923A] text-[10px] font-medium rounded-full"
                          >
                            {svc}
                          </span>
                        ))}
                      </div>
                      {shop.googleReviewCount && (
                        <p className="mt-3 text-xs text-[#484F58]">
                          {shop.googleReviewCount.toLocaleString()} Google reviews
                        </p>
                      )}
                      <span className="mt-auto pt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#E8923A] group-hover:underline">
                        Visit Shop <ChevronRight className="h-3.5 w-3.5" />
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
          <h2 className="font-heading text-2xl font-bold text-[#E8923A]">
            All Fly Shops
          </h2>
          <p className="text-sm text-[#8B949E] mt-1">
            {flyShops.length} shops — filterable by destination
          </p>
        </div>
      </div>
      <section className="bg-[#161B22] pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense>
            <EntityListView items={items} config={config} storageKey="fly-shops" />
          </Suspense>
        </div>
      </section>
    </>
  );
}
