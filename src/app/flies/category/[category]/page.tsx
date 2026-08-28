import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFliesByCategory } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import EntityCard from "@/components/ui/EntityCard";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import DeskMast from "@/components/desk/DeskMast";
import HomeGutter from "@/components/home/HomeGutter";
import { formatHookSize } from "@/lib/flies/variant-format";
import { hostedStillUrl } from "@/lib/media/image-url";

export const revalidate = 3600;

const FLY_CATEGORIES = [
  "dry",
  "nymph",
  "streamer",
  "emerger",
  "wet",
  "terrestrial",
  "egg",
  "midge",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  dry: "Dry Flies",
  nymph: "Nymphs",
  streamer: "Streamers",
  emerger: "Emergers",
  wet: "Wet Flies",
  terrestrial: "Terrestrials",
  egg: "Egg Patterns",
  midge: "Midges",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  dry: "Dry flies ride on the surface film, imitating adult mayflies, caddis, stoneflies, and other insects. Few moments in fly fishing rival the explosive take of a trout sipping a well-presented dry.",
  nymph: "Nymphs imitate the subsurface larval and pupal stages of aquatic insects where trout feed roughly 80% of the time. Mastering nymph fishing is the fastest path to consistent success on any trout stream.",
  streamer: "Streamers imitate baitfish, sculpins, leeches, and crayfish — the big-protein meals that draw aggressive strikes from the largest trout in the river. Fish them on sink-tip lines with an active retrieve.",
  emerger: "Emergers imitate insects transitioning from nymph to adult, suspended in or just below the surface film. During a heavy hatch, trout often key on emergers over fully formed duns — the most overlooked stage in the drift.",
  wet: "Wet flies are the oldest form of the artificial fly, designed to be fished below the surface on a downstream swing. Their soft hackle and slim profiles suggest drowned insects and emerging pupae tumbling in the current.",
  terrestrial: "Terrestrials imitate land-born insects — ants, beetles, hoppers, crickets — that get blown or fall onto the water. From midsummer through early fall, terrestrial patterns can salvage otherwise slow fishing days.",
  egg: "Egg patterns imitate the single most calorie-dense food item in a trout stream during spawning season. Simple to tie and deadly effective, egg flies are a must-have from late summer through winter.",
  midge: "Midges are the smallest and most abundant aquatic insects on most trout waters, hatching year-round even in the coldest months. When nothing else is hatching, trout are almost certainly eating midges.",
};

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return FLY_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = CATEGORY_LABELS[category] || category;

  return {
    title: `${label} — Complete Pattern Guide`,
    description: CATEGORY_DESCRIPTIONS[category] || `Browse all ${label.toLowerCase()} patterns with tying guides, materials, and fishing tips.`,
    openGraph: {
      title: `${label} — Trout Fly Pattern Guide`,
      description: CATEGORY_DESCRIPTIONS[category]?.substring(0, 160) || `Complete guide to ${label.toLowerCase()} for trout fishing.`,
      images: [
        `/api/og?title=${encodeURIComponent(label)}&subtitle=Fly%20Pattern%20Guide&type=fly`,
      ],
    },
    alternates: {
      canonical: `${SITE_URL}/flies/category/${category}`,
    },
  };
}

export default async function FlyCategoryPage({ params }: Props) {
  const { category } = await params;
  const label = CATEGORY_LABELS[category];
  if (!label) notFound();

  const flies = await getFliesByCategory(category);
  const description = CATEGORY_DESCRIPTIONS[category] || "";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${label} — Fly Pattern Guide`,
          description,
          url: `${SITE_URL}/flies/category/${category}`,
        }}
      />

      <div className="bg-[var(--surface-page)] pt-6">
        <HomeGutter>
          <Breadcrumbs
            items={[
              { label: "Fly Library", href: "/flies" },
              { label },
            ]}
          />
        </HomeGutter>
      </div>

      <DeskMast
        kicker="Fly Library"
        title={label}
        lede={description}
        titleSize="phrase"
        ledeFace="ui"
      />

      <section className="bg-[var(--surface-page)] pb-16">
        <HomeGutter>
          <p className="mb-6 font-ui text-[13px] text-[var(--text-meta)]">
            {flies.length} pattern{flies.length !== 1 ? "s" : ""} in this category
          </p>
          {flies.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {flies.map((fly, i) => (
                <ScrollAnimation key={fly.id} delay={Math.min(i * 0.05, 0.3)}>
                  <EntityCard
                    href={`/flies/${fly.slug}`}
                    imageUrl={hostedStillUrl(fly.heroImageUrl)}
                    imageAlt={`${fly.name} fly pattern`}
                    title={fly.name}
                    subtitle={fly.tagline || fly.description?.substring(0, 100)}
                    meta={
                      fly.sizes.length > 0
                        ? `Sizes ${formatHookSize(fly.sizes[0])}–${formatHookSize(fly.sizes[fly.sizes.length - 1])}`
                        : undefined
                    }
                    badges={
                      fly.imitates.length > 0
                        ? fly.imitates.slice(0, 2)
                        : undefined
                    }
                    iconOnly={!hostedStillUrl(fly.heroImageUrl)}
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
            <p className="py-8 font-ui text-[15px] text-[var(--text-body)]">
              No patterns found in this category yet. Check back soon.
            </p>
          )}
        </HomeGutter>
      </section>
    </>
  );
}
