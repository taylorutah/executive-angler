import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCanonicalFlies, getFliesByImitates } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import EntityCard from "@/components/ui/EntityCard";
import ScrollAnimation from "@/components/ui/ScrollAnimation";

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
  const allFlies = await getAllCanonicalFlies();
  const insectSet = new Set<string>();
  for (const fly of allFlies) {
    for (const im of fly.imitates) {
      insectSet.add(slugify(im));
    }
  }
  return Array.from(insectSet).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const displayName = unslugify(slug);

  return {
    title: `${displayName} Fly Patterns — Best Imitations for Trout | Executive Angler`,
    description: `The best fly patterns that imitate ${displayName.toLowerCase()}. Browse proven imitations with tying guides, sizes, materials, and fishing tips for matching this hatch.`,
    openGraph: {
      title: `${displayName} Fly Patterns | Executive Angler`,
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

  // Find the original imitates value(s) that match this slug
  const allFlies = await getAllCanonicalFlies();
  const matchingImitates = new Set<string>();
  for (const fly of allFlies) {
    for (const im of fly.imitates) {
      if (slugify(im) === slug) {
        matchingImitates.add(im);
      }
    }
  }

  if (matchingImitates.size === 0) notFound();

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
      <div className="bg-[#0D1117] pt-6 pb-4">
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
      <section className="bg-[#0D1117] pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A]">
            Hatch Imitations
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Flies That Imitate {displayName}
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-white/70">
            {flies.length} proven pattern{flies.length !== 1 ? "s" : ""} designed
            to match {displayName.toLowerCase()} across multiple life stages.
            From subsurface nymphs to surface duns, these are the flies that
            consistently fool selective trout.
          </p>
        </div>
      </section>

      {/* Fly grid */}
      <section className="bg-[#161B22] border-t border-[#21262D] py-12">
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
                        ? `Sizes ${fly.sizes[0]}–${fly.sizes[fly.sizes.length - 1]}`
                        : undefined
                    }
                    badges={[FLY_CATEGORY_LABELS[fly.category] || fly.category]}
                    iconOnly={!fly.heroImageUrl}
                  />
                </ScrollAnimation>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#A8B2BD] text-lg">
                No patterns found for this insect yet. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
