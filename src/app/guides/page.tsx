import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "@/icons";
import RatingStars from "@/components/ui/RatingStars";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { getAllGuides, getAllDestinations } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
import EntityListHeader from "@/components/ui/EntityListHeader";

export const revalidate = 3600;

const SPOTLIGHT_SLUGS = [
  "domenick-swentosky-troutbitten",
  "jackson-hole-anglers",
  "paddy-mcdonnell-moy-ghillie",
] as const;

const GUIDE_HEADLINES: Record<string, string> = {
  "domenick-swentosky-troutbitten": "Twenty-Five Years on Pennsylvania's Wild Limestone Streams",
  "jackson-hole-anglers": "Wild Cutthroats in the Shadow of the Tetons",
  "paddy-mcdonnell-moy-ghillie": "Third-Generation Ghillie on Ireland's River Moy",
};

export async function generateMetadata(): Promise<Metadata> {
  const guides = await getAllGuides();
  const n = guides.length;
  return {
    title: brandedTitle(`${n} Expert Fly Fishing Guides — Compare & Book`),
    description: `Browse ${n} vetted fly fishing guides worldwide with rates, specialties, and reviews. From Montana to Mongolia — find your next guide and book direct.`,
    alternates: { canonical: `${SITE_URL}/guides` },
    openGraph: {
      title: `${n} Expert Fly Fishing Guides`,
      description: `Browse ${n} vetted fly fishing guides worldwide with rates, specialties, and reviews. Find your next guide and book direct.`,
      images: ["/api/og?title=Fly%20Fishing%20Guides&subtitle=Expert%20Professionals&type=default"],
    },
  };
}

export default async function GuidesPage() {
  const [guides, destinations] = await Promise.all([getAllGuides(), getAllDestinations()]);

  const spotlightGuides = SPOTLIGHT_SLUGS.map((s) =>
    guides.find((g) => g.slug === s)
  ).filter(Boolean);

  // Sort all guides A-Z by name
  const sortedGuides = [...guides].sort((a, b) => a.name.localeCompare(b.name));

  // Helper to truncate bio at word boundary
  const truncateBio = (bio: string, maxLen = 100): string => {
    if (bio.length <= maxLen) return bio;
    const truncated = bio.slice(0, maxLen);
    const lastSpace = truncated.lastIndexOf(" ");
    return lastSpace > 60 ? truncated.slice(0, lastSpace) + "..." : truncated + "...";
  };

  return (
    <>
      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <EntityListHeader
        overline="Directory"
        title={`${guides.length} guides`}
        dek="Rates, specialties, and reviews. Book direct — we do not take a cut."
      />

      {/* ── Spotlight Guides ──────────────────────────────────────────────── */}
      <section className="bg-[var(--paper)] pt-2 pb-10 sm:pb-12">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <p className="ea-overline mb-8">
            Featured Guides
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {spotlightGuides.map((guide, i) => {
              if (!guide) return null;
              const dest = destinations.find((d) => d.id === guide.destinationId);
              return (
                <ScrollAnimation key={guide.id} delay={i * 0.1}>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="group block card-hover rounded-[var(--radius-card)] border border-[var(--border)] border-l-4 border-l-[var(--accent)] bg-[var(--surface)]"
                  >
                    <div className="p-6">
                      <h3 className="font-heading text-2xl font-semibold text-[var(--text-1)] group-hover:text-[var(--accent)] transition-colors leading-tight">
                        {guide.name}
                      </h3>
                      <p className="mt-2 text-sm font-medium text-[var(--text-2)] italic">
                        {GUIDE_HEADLINES[guide.slug]}
                      </p>
                      {dest && (
                        <p className="ea-overline mt-2">
                          {dest.name}
                        </p>
                      )}
                      <p className="mt-4 text-sm text-[var(--text-2)] leading-relaxed line-clamp-3">
                        {guide.bio.substring(0, 150)}...
                      </p>
                      {guide.specialties.length > 0 && (
                        <p className="mt-4 font-ui text-sm leading-5 text-[var(--text-2)]">
                          {guide.specialties.slice(0, 2).join(" · ")}
                        </p>
                      )}
                      <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
                        <div className="flex items-center gap-4">
                          {guide.googleRating ? (
                            <RatingStars
                              rating={guide.googleRating}
                              count={guide.googleReviewCount}
                            />
                          ) : null}
                          {guide.yearsExperience && (
                            <span className="text-xs text-[var(--text-3)]">
                              {guide.yearsExperience}+ yrs
                            </span>
                          )}
                        </div>
                        {guide.dailyRate && (
                          <span className="text-sm font-semibold text-[var(--accent)]">
                            {guide.dailyRate}
                          </span>
                        )}
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] group-hover:underline">
                        View Profile <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </ScrollAnimation>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Full Catalog ──────────────────────────────────────────────────── */}
      <div className="bg-[var(--paper)] border-t border-[var(--border)]">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">All Guides</h2>
          <p className="text-sm text-[var(--text-2)] mt-1">
            {guides.length} guides sorted A–Z
          </p>
        </div>
      </div>
      <section className="bg-[var(--paper)] pb-16 sm:pb-24">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <ul className="divide-y divide-[var(--border)]">
            {sortedGuides.map((guide) => {
              const dest = destinations.find((d) => d.id === guide.destinationId);
              return (
                <li key={guide.id}>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="group flex items-start justify-between gap-4 py-5 px-2 -mx-2 rounded-[var(--radius-md)] hover:bg-[var(--paper-deep)] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-lg font-semibold text-[var(--text-1)] group-hover:text-[var(--accent)] transition-colors">
                        {guide.name}
                      </h3>
                      <p className="mt-0.5 text-sm text-[var(--text-2)]">
                        {dest?.name}
                        {guide.dailyRate && (
                          <>
                            <span className="mx-2 text-[var(--text-3)]">·</span>
                            <span className="font-semibold text-[var(--accent)]">{guide.dailyRate}</span>
                          </>
                        )}
                      </p>
                      {guide.specialties.length > 0 && (
                        <p className="mt-2 font-ui text-sm leading-5 text-[var(--text-2)]">
                          {guide.specialties.slice(0, 2).join(" · ")}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-[var(--text-3)] line-clamp-2">
                        {truncateBio(guide.bio)}
                      </p>
                    </div>
                    <span className="shrink-0 flex items-center gap-1 text-sm font-medium text-[var(--accent)] pt-1 group-hover:underline">
                      View Profile <ChevronRight className="h-4 w-4" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
