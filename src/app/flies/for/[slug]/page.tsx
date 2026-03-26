import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllRivers, getRiverBySlug, getFliesForRiver } from "@/lib/db";
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

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const rivers = await getAllRivers();
  return rivers.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const river = await getRiverBySlug(slug);
  if (!river) return { title: "River Not Found" };

  return {
    title: `Best Flies for ${river.name} — Top Patterns & Tying Guides | Executive Angler`,
    description: `Discover the best fly patterns for fishing the ${river.name}. Dry flies, nymphs, streamers, and emergers matched to the hatches and conditions on this legendary water.`,
    openGraph: {
      title: `Best Flies for ${river.name} | Executive Angler`,
      description: `Top fly patterns for the ${river.name} — matched to local hatches, species, and seasonal conditions.`,
      images: [
        `/api/og?title=${encodeURIComponent(`Best Flies for ${river.name}`)}&subtitle=Pattern%20Guide&type=fly`,
      ],
    },
    alternates: {
      canonical: `${SITE_URL}/flies/for/${slug}`,
    },
  };
}

export default async function FliesForRiverPage({ params }: Props) {
  const { slug } = await params;
  const river = await getRiverBySlug(slug);
  if (!river) notFound();

  const flies = await getFliesForRiver(river.id);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Best Flies for ${river.name}`,
          description: `Recommended fly patterns for the ${river.name}.`,
          url: `${SITE_URL}/flies/for/${slug}`,
        }}
      />

      {/* Breadcrumbs */}
      <div className="bg-[#0D1117] pt-6 pb-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Fly Library", href: "/flies" },
              { label: `Best Flies for ${river.name}` },
            ]}
          />
        </div>
      </div>

      {/* Editorial header */}
      <section className="bg-[#0D1117] pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A]">
            River Pattern Guide
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Best Flies for {river.name}
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-white/70">
            {river.description.substring(0, 200)}
            {river.description.length > 200 ? "..." : ""}
          </p>
          <Link
            href={`/rivers/${river.slug}`}
            className="mt-4 inline-block text-sm font-medium text-[#E8923A] hover:text-[#E8923A]/80 transition-colors"
          >
            View full river guide &rarr;
          </Link>
        </div>
      </section>

      {/* Fly grid */}
      <section className="bg-[#161B22] border-t border-[#21262D] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {flies.length > 0 ? (
            <>
              <p className="text-sm text-[#6E7681] mb-8">
                {flies.length} recommended pattern{flies.length !== 1 ? "s" : ""}
              </p>
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
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#A8B2BD] text-lg">
                We&apos;re still building fly recommendations for this river. Check back soon.
              </p>
              <Link
                href="/flies"
                className="mt-4 inline-block text-sm font-medium text-[#E8923A] hover:text-[#E8923A]/80 transition-colors"
              >
                Browse the full Fly Library &rarr;
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
