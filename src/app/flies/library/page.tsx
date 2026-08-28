/**
 * /flies/library — browse index (Lane L).
 * Daylight. Editorial header, filter bar (category · hatch · size · can-tie), results.
 * Density toggles live on the toolbar. No Dusk — catalog, not vise.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import DeskMast from "@/components/desk/DeskMast";
import HomeGutter from "@/components/home/HomeGutter";
import BrowseIndexFallback from "@/components/ui/BrowseIndexFallback";
import DismissBrowseFallback from "@/components/ui/DismissBrowseFallback";
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
      group: FLY_CATEGORY_LABELS[fly.category] || fly.category,
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
      <DeskMast
        title="Every fly we keep"
        lede="The plate is twelve this week. This is the bench — nymphs, dries, streamers. Pictures first. One Refine."
        titleSize="phrase"
        ledeFace="ui"
      />

      <section className="bg-[var(--surface-page)] pb-16">
        <HomeGutter>
          <BrowseIndexFallback
            id="flies-browse-fallback"
            count={items.length > 24 ? 24 : items.length}
          />
          <Suspense fallback={null}>
            <DismissBrowseFallback fallbackId="flies-browse-fallback">
              <FlyLibraryClient items={items} />
            </DismissBrowseFallback>
          </Suspense>
        </HomeGutter>
      </section>
    </>
  );
}
