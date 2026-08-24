import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCanonicalFlies, getFliesByImitates } from "@/lib/db";
import { getAllRivers } from "@/lib/db/rivers";
import { hatchMatchesSlug, hatchSlugsFor } from "@/lib/search";
import { SITE_URL } from "@/lib/constants";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import EntityCard from "@/components/ui/EntityCard";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { formatHookSize } from "@/lib/flies/variant-format";

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

/** Convert a display name to a URL slug */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Convert a slug back to a display-friendly title */
function unslugify(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const [allFlies, rivers] = await Promise.all([
    getAllCanonicalFlies(),
    getAllRivers(),
  ]);
  const insectSet = new Set<string>();
  for (const fly of allFlies) {
    for (const im of fly.imitates) {
      for (const s of hatchSlugsFor(im)) insectSet.add(s);
    }
  }
  for (const river of rivers) {
    for (const month of river.hatchChart ?? []) {
      for (const h of month.hatches ?? []) {
        if (h.insect) {
          for (const s of hatchSlugsFor(h.insect)) insectSet.add(s);
        }
      }
    }
  }
  return Array.from(insectSet).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const displayName = unslugify(slug);

  return {
    title: `${displayName} Fly Patterns — Best Imitations for Trout`,
    description: `The best fly patterns that imitate ${displayName.toLowerCase()}. Browse proven imitations with tying guides, sizes, materials, and fishing tips for matching this hatch.`,
    openGraph: {
      title: `${displayName} Fly Patterns`,
      description: `Top fly patterns imitating ${displayName.toLowerCase()} — matched to hatches and trout feeding behavior.`,
      images: [
        `/api/og?title=${encodeURIComponent(`${displayName} Patterns`)}&subtitle=Hatch%20Imitations&type=fly`,
      ],
    },
    alternates: {
      canonical: `${SITE_URL}/flies/hatch/${slug}`,
    },
  };
}

export default async function HatchInsectPage({ params }: Props) {
  const { slug } = await params;
  const displayName = unslugify(slug);

  const [allFlies, rivers] = await Promise.all([
    getAllCanonicalFlies(),
    getAllRivers(),
  ]);
  const matchingImitates = new Set<string>();
  for (const fly of allFlies) {
    for (const im of fly.imitates) {
      if (hatchMatchesSlug(im, slug) || slugify(im) === slug) {
        matchingImitates.add(im);
      }
    }
  }
  let mentionedOnRiver = false;
  for (const river of rivers) {
    for (const month of river.hatchChart ?? []) {
      for (const h of month.hatches ?? []) {
        if (h.insect && (hatchMatchesSlug(h.insect, slug) || slugify(h.insect) === slug)) {
          mentionedOnRiver = true;
        }
      }
    }
  }

  if (matchingImitates.size === 0 && !mentionedOnRiver) notFound();

  // Query flies for each matching imitates value and deduplicate
  const flyMap = new Map<string, (typeof allFlies)[number]>();
  for (const imitatesValue of matchingImitates) {
    const results = await getFliesByImitates(imitatesValue);
    for (const fly of results) {
      flyMap.set(fly.id, fly);
    }
  }
  const flies = Array.from(flyMap.values());

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Flies That Imitate ${displayName}`,
          description: `Fly patterns that imitate ${displayName.toLowerCase()} for trout fishing.`,
          url: `${SITE_URL}/flies/hatch/${slug}`,
        }}
      />

      {/* Breadcrumbs */}
      <div className="bg-[var(--surface-page)] pt-6 pb-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Fly Library", href: "/flies" },
              { label: displayName },
            ]}
          />
        </div>
      </div>

      {/* Editorial header */}
      <section className="bg-[var(--surface-page)] pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--action)]">
            Hatch Imitations
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)]">
            Flies That Imitate {displayName}
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-[var(--text-body)]">
            {flies.length} proven pattern{flies.length !== 1 ? "s" : ""} designed
            to match {displayName.toLowerCase()} across multiple life stages.
            From subsurface nymphs to surface duns, these are the flies that
            consistently fool selective trout.
          </p>
        </div>
      </section>

      {/* Fly grid */}
      <section className="bg-[var(--surface-raised)] border-t border-[var(--border-rule)] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {flies.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {flies.map((fly, i) => (
                <ScrollAnimation key={fly.id} delay={Math.min(i * 0.05, 0.3)}>
                  <EntityCard
                    href={`/flies/${fly.slug}`}
                    imageUrl={
                      fly.heroImageUrl ||
                      "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600&q=80"
                    }
                    imageAlt={`${fly.name} fly pattern`}
                    title={fly.name}
                    subtitle={fly.tagline || fly.description?.substring(0, 100)}
                    meta={
                      fly.sizes.length > 0
                        ? `Sizes ${formatHookSize(fly.sizes[0])}–${formatHookSize(fly.sizes[fly.sizes.length - 1])}`
                        : undefined
                    }
                    badges={[FLY_CATEGORY_LABELS[fly.category] || fly.category]}
                    iconOnly={!fly.heroImageUrl}
                    actionSlot={{
                      kind: "add-to-fly-box",
                      canonicalFlyId: fly.id,
                      flyName: fly.name,
                    }}
                  />
                </ScrollAnimation>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[var(--text-body)] text-lg">
                No patterns found for this insect yet. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
