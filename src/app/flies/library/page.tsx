import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import EntityListView from "@/components/ui/EntityListView";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import FlyCardForkOverlay from "@/components/flies/FlyCardForkOverlay";
import { formatHookSize } from "@/lib/flies/variant-format";
import { getAllCanonicalFlies } from "@/lib/db";
import { flyListConfig } from "@/lib/list-configs";
import type { CardData } from "@/types/list-config";
import { SITE_URL } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

// Per-request render: must read auth + the viewer's favorites. Cached
// canonical_flies queries inside getAllCanonicalFlies still benefit from
// Next's data cache.
export const dynamic = "force-dynamic";

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

const CATEGORY_ICONS: Record<string, string> = {
  dry: "/images/fly-icons/dry.svg",
  nymph: "/images/fly-icons/nymph.svg",
  streamer: "/images/fly-icons/streamer.svg",
  emerger: "/images/fly-icons/emerger.svg",
  wet: "/images/fly-icons/wet.svg",
  terrestrial: "/images/fly-icons/terrestrial.svg",
  egg: "/images/fly-icons/egg.svg",
  midge: "/images/fly-icons/midge.svg",
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
    title: "Trout Fly Library | Executive Angler",
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

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // Post-Phase-C: favorites live on user_fly_configurations, joined to flies.
      const { data: favRows } = await supabase
        .from("user_fly_configurations")
        .select("fly_id")
        .eq("user_id", user.id)
        .eq("is_favorite", true);
      const favIds = new Set(
        (favRows ?? [])
          .map((r) => (r as { fly_id?: string | null }).fly_id)
          .filter((id): id is string => !!id),
      );
      if (favIds.size > 0) {
        spotlightFlies = allFlies
          .filter((f) => favIds.has(f.id))
          .slice(0, SPOTLIGHT_LIMIT);
        spotlightLabel = "Your Favorites";
      }
    }
  } catch (e) {
    // Auth/network failure shouldn't break the public library. Fall through
    // to the featured/fallback path.
    console.warn("[/flies] favorite lookup failed:", e);
  }

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
      },
    }));

  return (
    <>
      {/* Editorial header */}
      <section className="bg-[#0D1117] pt-6 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A]">
            The Complete Reference
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Trout Fly Library
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-white/70">
            {allFlies.length} proven patterns — dry flies, nymphs, streamers,
            emergers, and more. Every pattern includes sizes, materials, tying
            videos, and where to fish it.
          </p>
        </div>
      </section>

      {/* Spotlight flies */}
      {spotlightFlies.length > 0 && (
        <section className="bg-[#0D1117] pt-2 pb-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A] mb-8">
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
                    className="block bg-[#161B22] rounded-xl border border-[#21262D] group-hover:border-[#E8923A]/30 transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="inline-block px-2.5 py-1 text-xs font-medium bg-[#E8923A]/10 text-[#E8923A] rounded-full mb-3">
                            {FLY_CATEGORY_LABELS[fly!.category] ||
                              fly!.category}
                          </span>
                          <h3 className="font-heading text-xl font-semibold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">
                            {fly!.name}
                          </h3>
                          <p className="mt-1 text-sm text-[#A8B2BD]">
                            Sizes{" "}
                            {fly!.sizes[0]}–{fly!.sizes[fly!.sizes.length - 1]}
                          </p>
                        </div>
                          {fly!.heroImageUrl ? (
                          <div className="flex-shrink-0 w-28 rounded-lg overflow-hidden bg-[#F8F4EE]" style={{aspectRatio: '3/2'}}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={fly!.heroImageUrl}
                              alt={`${fly!.name} fly pattern`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-[#0D1117] flex items-center justify-center p-2">
                            <Image
                              src={CATEGORY_ICONS[fly!.category] || CATEGORY_ICONS.dry}
                              alt={FLY_CATEGORY_LABELS[fly!.category] || fly!.category}
                              width={48}
                              height={48}
                            />
                          </div>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-[#A8B2BD] line-clamp-2">
                        {fly!.description?.substring(0, 120)}
                      </p>
                      {fly!.imitates.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {fly!.imitates.slice(0, 3).map((im) => (
                            <span
                              key={im}
                              className="px-2 py-0.5 text-xs bg-[#21262D] text-[#A8B2BD] rounded"
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
      <section className="bg-[#161B22] border-t border-[#21262D] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Suspense>
            <EntityListView
              items={items}
              config={flyListConfig}
              storageKey="flies"
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
