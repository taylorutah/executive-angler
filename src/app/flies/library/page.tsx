/**
 * /flies/library — browse index (Lane L).
 * Daylight. Editorial header, filter bar (category · hatch · size · can-tie), results.
 * Density toggles live on the toolbar. No Dusk — catalog, not vise.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import FlyLibraryClient from "./FlyLibraryClient";
import { formatHookSize } from "@/lib/flies/variant-format";
import { hatchTokens, sizeListValue } from "@/lib/browse/fly-filters";
import { getAllCanonicalFlies } from "@/lib/db";
import type { CardData } from "@/types/list-config";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
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

export async function generateMetadata(): Promise<Metadata> {
  const flies = await getAllCanonicalFlies();
  const n = flies.length;
  return {
    title: brandedTitle(`${n} Trout Fly Patterns — Recipes & Tying Guides`),
    description: `Browse ${n} trout fly patterns with tying guides, materials, variations, and where to fish them. Dry flies, nymphs, streamers, emergers, and more.`,
    alternates: { canonical: `${SITE_URL}/flies/library` },
    openGraph: {
      title: `${n} Trout Fly Patterns`,
      description: `The trout fly reference — ${n} patterns with tying videos, materials lists, and fishing tips.`,
      images: [
        `/api/og?title=Trout%20Fly%20Library&subtitle=${encodeURIComponent(`${n} patterns`)}&type=fly`,
      ],
    },
  };
}

export default async function FliesPage() {
  const allFlies = await getAllCanonicalFlies();

  const items: (CardData & { _filterValues: Record<string, string> })[] = allFlies.map(
    (fly) => ({
      href: `/flies/${fly.slug}`,
      imageUrl: fly.heroImageUrl || undefined,
      imageAlt: `${fly.name} fly pattern for trout fishing`,
      title: fly.name,
      subtitle: fly.tagline || undefined,
      meta: `Sizes ${formatHookSize(fly.sizes[0])}–${formatHookSize(fly.sizes[fly.sizes.length - 1])}`,
      badges: [FLY_CATEGORY_LABELS[fly.category] || fly.category],
      featured: fly.featured,
      description: fly.description?.substring(0, 150),
      iconOnly:
        !fly.heroImageUrl ||
        fly.heroImageUrl.includes("/fly-icons/") ||
        fly.heroImageUrl.includes("/community-images/submissions/"),
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
    }),
  );

  return (
    <>
      <section className="bg-[var(--paper)] pt-6 pb-10 sm:pb-12">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <p className="ea-overline">
            The complete reference
          </p>
          <h1 className="mt-3 text-[var(--text-1)]">
            {allFlies.length} trout fly patterns
          </h1>
          <p className="mt-5 max-w-[var(--prose)] text-lg leading-relaxed text-[var(--text-2)]">
            {allFlies.length} patterns. Filter by hatch, size, and — when you are signed
            in — what you can tie from your own materials.
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--paper)] pb-16 sm:pb-24">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Suspense>
            <FlyLibraryClient items={items} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
