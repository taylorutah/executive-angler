import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getFliesByCategory } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import EntityCard from "@/components/ui/EntityCard";
import ScrollAnimation from "@/components/ui/ScrollAnimation";

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
    title: `${label} — Complete Pattern Guide | Executive Angler`,
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
  const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.dry;
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

      {/* Breadcrumbs */}
      <div className="bg-[#0D1117] pt-6 pb-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Fly Library", href: "/flies" },
              { label },
            ]}
          />
        </div>
      </div>

      {/* Editorial header */}
      <section className="bg-[#0D1117] pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-[#161B22] border border-[#21262D] flex items-center justify-center p-2">
              <Image src={icon} alt={label} width={48} height={48} />
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A]">
            Fly Library
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            {label}
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-white/70">
            {description}
          </p>
          <p className="mt-3 text-sm text-[#6E7681]">
            {flies.length} pattern{flies.length !== 1 ? "s" : ""} in this category
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
                    badges={
                      fly.imitates.length > 0
                        ? fly.imitates.slice(0, 2)
                        : undefined
                    }
                    iconOnly={!fly.heroImageUrl}
                  />
                </ScrollAnimation>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#A8B2BD] text-lg">
                No patterns found in this category yet. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
