import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFliesByCategory } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import DeskFlyIndex from "@/components/desk/DeskFlyIndex";
import { canonicalFlyToCard } from "@/lib/flies/desk-cards";

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
  dry: "Patterns that ride the surface film: adult mayflies, caddis, and stoneflies.",
  nymph: "Subsurface patterns for larval and pupal stages.",
  streamer: "Baitfish, sculpin, leech, and crayfish patterns, usually retrieved.",
  emerger: "Patterns for the nymph-to-adult transition, in or just under the film.",
  wet: "Soft-hackle and slim patterns fished below the surface on a swing.",
  terrestrial: "Ants, beetles, hoppers, and other land insects on the water.",
  egg: "Spawn-season egg imitations.",
  midge: "Small dipteran patterns. Midges hatch in cold months as well as warm.",
};

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return FLY_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = CATEGORY_LABELS[category] || category;
  const flies = CATEGORY_LABELS[category] ? await getFliesByCategory(category) : [];
  const n = flies.length;

  return {
    title: `${n} ${label}`,
    description: CATEGORY_DESCRIPTIONS[category] || `Browse ${label.toLowerCase()} in the fly library.`,
    openGraph: {
      title: `${n} ${label}`,
      description: CATEGORY_DESCRIPTIONS[category]?.substring(0, 160) || `${label} in the fly library.`,
      images: [
        `/api/og?title=${encodeURIComponent(label)}&subtitle=Fly%20library&type=fly`,
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
  const items = flies.map(canonicalFlyToCard);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${label} — Fly library`,
          description,
          url: `${SITE_URL}/flies/category/${category}`,
        }}
      />

      <div className="bg-[var(--paper)] pt-6 pb-4">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Fly Library", href: "/flies/library" },
              { label },
            ]}
          />
        </div>
      </div>

      <section className="bg-[var(--paper)] pb-10 sm:pb-12">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <p className="ea-overline">Fly library</p>
          <h1 className="mt-3 text-[var(--text-1)]">
            {flies.length} {label.toLowerCase()}
          </h1>
          <p className="mt-5 max-w-[var(--prose)] text-lg leading-relaxed text-[var(--text-2)]">
            {description}
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--paper)] pb-16 sm:pb-24">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {items.length > 0 ? (
            <DeskFlyIndex items={items} />
          ) : (
            <div className="ea-empty">
              <p>No patterns in this category yet.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
