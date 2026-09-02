/**
 * /flies/library — browse index (Lane L).
 * Daylight. Editorial header, filter bar (category · hatch · size · can-tie), results.
 * Density toggles live on the toolbar. No Dusk — catalog, not vise.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import FlyLibraryClient from "./FlyLibraryClient";
import LibraryNotebookLinks from "./LibraryNotebookLinks";
import { formatHookSize } from "@/lib/flies/variant-format";
import { hatchTokens, sizeListValue } from "@/lib/browse/fly-filters";
import { getAllCanonicalFlies } from "@/lib/db";
import type { CardData } from "@/types/list-config";
import { SITE_URL } from "@/lib/constants";
import { plateImageUrl } from "@/lib/media/image-url";
import { brandedTitle } from "@/lib/seo";
import EntityListHeader from "@/components/ui/EntityListHeader";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";
export const revalidate = 3600;

const TRIP_LINK = `${FOCUS_VISIBLE} rounded-sm text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--accent)] hover:decoration-[var(--accent)]`;

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
      imageUrl: plateImageUrl(fly.heroImageUrl),
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
      <EntityListHeader
        overline="Fly library"
        title={`${allFlies.length} trout fly patterns`}
        dek="Patterns on the bench. Twelve on the plate, the rest in columns. Filters stay behind the toggle. Signed in, you can also filter by what you can tie from your materials."
      >
        <LibraryNotebookLinks />
      </EntityListHeader>

      <section className="bg-[var(--paper)]">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          <div className="max-w-[var(--prose)] font-body">
            <p className="text-[var(--text-16)] leading-relaxed text-[var(--text-2)]">
              Executive Angler lists {allFlies.length} trout fly patterns with
              recipes, materials, and river matches. Use this library to build a
              box, then open a river fly list when you need what is on the hatch
              chart for that water. Start with{" "}
              <Link href="/flies/for/madison-river" className={TRIP_LINK}>
                Madison flies
              </Link>{" "}
              if you are packing for Montana meadow water, or browse by dry,
              nymph, and streamer.
            </p>
            <h2 className="mt-8 text-[var(--text-1)]">
              How to use this fly library for a river trip
            </h2>
            <p className="mt-3 text-[var(--text-16)] leading-relaxed text-[var(--text-2)]">
              For a river week, pick patterns from this library, then confirm
              sizes on that river&apos;s hatch-chart fly list. Madison is the
              default Montana freestone start: rubber-leg stones, PMDs, caddis,
              and BWOs cover most of the season above and below Ennis. Open{" "}
              <Link href="/flies/for/madison-river" className={TRIP_LINK}>
                Best Flies for Madison River
              </Link>{" "}
              for the chart-matched list, the{" "}
              <Link href="/rivers/madison-river" className={TRIP_LINK}>
                Madison River page
              </Link>{" "}
              for access and gauges, and{" "}
              <Link href="/destinations/montana" className={TRIP_LINK}>
                Montana
              </Link>{" "}
              for neighboring waters. We do not publish other anglers&apos;
              catches or GPS.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[var(--paper)] pb-16 sm:pb-24">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Suspense>
            <FlyLibraryClient items={items} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
