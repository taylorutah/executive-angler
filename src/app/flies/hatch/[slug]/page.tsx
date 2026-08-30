import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCanonicalFlies, getFliesByImitates } from "@/lib/db";
import { getAllRivers } from "@/lib/db/rivers";
import { hatchMatchesSlug, hatchSlugsFor } from "@/lib/search";
import { SITE_URL } from "@/lib/constants";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import DeskFlyIndex from "@/components/desk/DeskFlyIndex";
import { canonicalFlyToCard } from "@/lib/flies/desk-cards";

export const revalidate = 3600;

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
    title: `${displayName} fly patterns`,
    description: `Catalog patterns that imitate ${displayName.toLowerCase()}.`,
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
      <div className="bg-[var(--paper)] pt-6 pb-4">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Fly Library", href: "/flies" },
              { label: displayName },
            ]}
          />
        </div>
      </div>

      {/* Editorial header */}
      <section className="bg-[var(--paper)] pb-10 sm:pb-12">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <p className="ea-overline">
            Hatch imitations
          </p>
          <h1 className="mt-3 text-[var(--text-1)]">
            {flies.length} {flies.length === 1 ? "pattern" : "patterns"} for {displayName}
          </h1>
          <p className="mt-5 max-w-[var(--prose)] text-lg leading-relaxed text-[var(--text-2)]">
            Catalog patterns whose imitates field names {displayName.toLowerCase()}.
          </p>
        </div>
      </section>

      {/* Fly grid */}
      <section className="border-t border-[var(--border)] bg-[var(--paper)] pb-16 sm:pb-24">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {flies.length > 0 ? (
            <DeskFlyIndex items={flies.map(canonicalFlyToCard)} />
          ) : (
            <div className="ea-empty">
              <p>
                No patterns found for this insect yet. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
