import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import FlyLibraryClient from "./FlyLibraryClient";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import FlyCardForkOverlay from "@/components/flies/FlyCardForkOverlay";
import { formatHookSize } from "@/lib/flies/variant-format";
import { hatchTokens, sizeListValue } from "@/lib/browse/fly-filters";
import { getAllCanonicalFlies } from "@/lib/db";
import type { CardData } from "@/types/list-config";
import { SITE_URL } from "@/lib/constants";
export const revalidate = 3600;

const FLY_CATEGORY_LABELS: Record<string, string> = {
  dry: "Dry Fly",
  nymph: "Nymph",
  streamer: "Streamer",
  emerger: "Emerger",
  wet: "Wet Fly",
  terrestrial: "Terrestrial",
  egg: "Egg",
  midge: "Midge",
};

// Final fallback if no flies are flagged `featured` in the admin AND the
// viewer has no favorites. Keeps the page presentable on a fresh DB.
const FALLBACK_SPOTLIGHT_SLUGS = [
  "parachute-adams",
  "pheasant-tail-nymph",
  "elk-hair-caddis",
  "woolly-bugger",
  "rs2",
  "copper-john",
];

const SPOTLIGHT_LIMIT = 6;

export const metadata: Metadata = {
  title: "Trout Fly Library — 120+ Proven Patterns & Tying Guides",
  description:
    "Browse 120+ proven trout fly patterns with tying guides, materials, variations, and where to fish them. Dry flies, nymphs, streamers, emergers, and more.",
  alternates: { canonical: `${SITE_URL}/flies/library` },
  openGraph: {
    title: "Trout Fly Library",
    description:
      "The complete trout fly reference — 120+ patterns with tying videos, materials lists, and fishing tips.",
    images: [
      "/api/og?title=Trout%20Fly%20Library&subtitle=120%2B%20Proven%20Patterns&type=fly",
    ],
  },
};

export default async function FliesPage() {
  const allFlies = await getAllCanonicalFlies();

  // Resolve the spotlight list with this priority:
  //   1. Logged-in viewer with favorites → their favorited canonical flies
  //   2. Admin-flagged `featured` flies (sortable by rank then name)
  //   3. Hardcoded fallback slugs (fresh-DB safety net)
  let spotlightFlies: typeof allFlies = [];
  let spotlightLabel = "Essential Patterns";

  if (spotlightFlies.length === 0) {
    const featured = allFlies.filter((f) => f.featured);
    if (featured.length > 0) {
      spotlightFlies = featured.slice(0, SPOTLIGHT_LIMIT);
    } else {
      spotlightFlies = FALLBACK_SPOTLIGHT_SLUGS.map((s) =>
        allFlies.find((f) => f.slug === s),
      ).filter((f): f is NonNullable<typeof f> => !!f);
    }
  }

  const items: (CardData & { _filterValues: Record<string, string> })[] =
    allFlies.map((fly) => ({
      href: `/flies/${fly.slug}`,
      imageUrl: fly.heroImageUrl || undefined,
      imageAlt: `${fly.name} fly pattern for trout fishing`,
      title: fly.name,
      subtitle: fly.tagline || undefined,
      meta: `Sizes ${formatHookSize(fly.sizes[0])}–${formatHookSize(fly.sizes[fly.sizes.length - 1])}`,
      badges: [FLY_CATEGORY_LABELS[fly.category] || fly.category],
      featured: fly.featured,
      description: fly.description?.substring(0, 150),
      iconOnly: !fly.heroImageUrl,
      actionSlot: {
        kind: "add-to-fly-box" as const,
        canonicalFlyId: fly.id,
        flyName: fly.name,
      },
      _filterValues: {
        category: fly.category || "",
        imitates: (fly.imitates || [])
          .map((i) => i.toLowerCase().split(" ")[0])
          .join(","),
        hatch: hatchTokens({
          imitates: fly.imitates,
          hatchAssociations: fly.hatchAssociations,
        }).join(","),
        size: sizeListValue(fly.sizes),
        canTie: "0",
      },
    }));

  return (
    <>
      {/* Editorial header */}
      <section className="bg-[var(--surface-page)] pt-6 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--action)]">
            The Complete Reference
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)]">
            Trout Fly Library
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-[var(--text-body)]">
            {allFlies.length} patterns — dry flies, nymphs, streamers,
            emergers, and more. Filter by hatch, size, and, when you are signed
            in, what you can tie from your own materials.
          </p>
        </div>
      </section>

      {/* Spotlight flies */}
      {spotlightFlies.length > 0 && (
        <section className="bg-[var(--surface-page)] pt-2 pb-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--action)] mb-8">
              {spotlightLabel}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {spotlightFlies.map((fly, i) => (
                <ScrollAnimation key={fly!.id} delay={i * 0.1}>
                  <div className="group relative">
                    <FlyCardForkOverlay
                      canonicalFlyId={fly!.id}
                      flySlug={fly!.slug}
                    />
                  <Link
                    href={`/flies/${fly!.slug}`}
                    className="block bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] group-hover:border-[var(--action)]/30 transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="inline-block px-2.5 py-1 text-xs font-medium bg-[var(--action)]/10 text-[var(--action)] rounded-full mb-3">
                            {FLY_CATEGORY_LABELS[fly!.category] ||
                              fly!.category}
                          </span>
                          <h3 className="font-heading text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--action)] transition-colors">
                            {fly!.name}
                          </h3>
                          <p className="mt-1 text-sm text-[var(--text-body)]">
                            Sizes{" "}
                            {fly!.sizes[0]}–{fly!.sizes[fly!.sizes.length - 1]}
                          </p>
                        </div>
                          <div className="relative flex-shrink-0 w-28 rounded-lg overflow-hidden bg-[var(--surface-card)]" style={{aspectRatio: '3/2'}}>
                            <SafeEntityImage
                              src={fly!.heroImageUrl}
                              alt={`${fly!.name} fly pattern`}
                              title={fly!.name}
                              meta={`${FLY_CATEGORY_LABELS[fly!.category] || fly!.category} · ${fly!.sizes[0]}–${fly!.sizes[fly!.sizes.length - 1]}`}
                              className="object-cover"
                              sizes="112px"
                              priority={i < 3}
                            />
                          </div>
                      </div>
                      <p className="mt-3 text-sm text-[var(--text-body)] line-clamp-2">
                        {fly!.description?.substring(0, 120)}
                      </p>
                      {fly!.imitates.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {fly!.imitates.slice(0, 3).map((im) => (
                            <span
                              key={im}
                              className="px-2 py-0.5 text-xs bg-[var(--border-rule)] text-[var(--text-body)] rounded"
                            >
                              {im}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full catalog */}
      <section className="bg-[var(--surface-raised)] border-t border-[var(--border-rule)] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Suspense>
            <FlyLibraryClient items={items} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
