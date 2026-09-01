import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Phone, Mail, Home, MapPin, Fish } from "@/icons";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EntityIdentityBand from "@/components/ui/EntityIdentityBand";
import FactList from "@/components/ui/FactList";
import SpecList from "@/components/ui/SpecList";
import RatingStars from "@/components/ui/RatingStars";
import QuickFacts from "@/components/ui/QuickFacts";
import Badge from "@/components/ui/Badge";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import GoogleReviews from "@/components/GoogleReviews";
import UserReviews from "@/components/ui/UserReviews";
import { SITE_URL } from "@/lib/constants";
import {
  getAllGuides,
  getGuideBySlug,
  getDestinationById,
  getRiversByIds,
  getLodgesByDestination,
  getFlyShopsByDestination,
  getArticlesByDestination,
  getSpeciesByCommonNames,
} from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: "Guide Not Found" };

  const topSpecialties = (guide.specialties || []).slice(0, 2).join(" & ");
  const expStr = guide.yearsExperience ? `${guide.yearsExperience}+ years experience. ` : "";
  const rateStr = guide.dailyRate ? `Rates from ${guide.dailyRate}. ` : "";
  const riverCount = (guide.riverIds || []).length;
  const fallbackTitle = `${guide.name} — Expert Fly Fishing Guide | ${topSpecialties || "All Methods"} | Executive Angler`;
  const fallbackDesc = `Book ${guide.name} — expert fly fishing guide. ${expStr}${rateStr}Specialties: ${(guide.specialties || []).slice(0, 3).join(", ") || "all methods"}.${riverCount > 0 ? ` Access to ${riverCount} rivers.` : ""} Read reviews & book direct.`;

  return {
    title: { absolute: guide.metaTitle || fallbackTitle },
    description:
      guide.metaDescription || fallbackDesc,
    openGraph: {
      title: guide.metaTitle || guide.name,
      description: guide.metaDescription || fallbackDesc,
      images: [
        guide.photoUrl ||
          `${SITE_URL}/api/og?title=${encodeURIComponent(guide.name)}&subtitle=${encodeURIComponent(`Fly Fishing Guide${guide.dailyRate ? ` — ${guide.dailyRate}` : ""}`)}&type=guide`,
      ],
    },
    alternates: {
      canonical: `${SITE_URL}/guides/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const allGuides = await getAllGuides();
  return allGuides.map((g) => ({ slug: g.slug }));
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const [dest, guideRivers, areaLodges, areaFlyShops] = await Promise.all([
    guide.destinationId ? getDestinationById(guide.destinationId) : Promise.resolve(undefined),
    (guide.riverIds || []).length > 0 ? getRiversByIds(guide.riverIds) : Promise.resolve([]),
    guide.destinationId ? getLodgesByDestination(guide.destinationId) : Promise.resolve([]),
    guide.destinationId ? getFlyShopsByDestination(guide.destinationId) : Promise.resolve([]),
  ]);

  const [guideArticles, guideSpecies] = await Promise.all([
    guide.destinationId ? getArticlesByDestination(guide.destinationId) : Promise.resolve([]),
    dest ? getSpeciesByCommonNames(dest.primarySpecies || []) : Promise.resolve([]),
  ]);

  const specialties = guide.specialties || [];
  const quickFacts = [
    ...(dest ? [{ label: "Location", value: dest.name }] : []),
    ...(guide.yearsExperience
      ? [{ label: "Experience", value: `${guide.yearsExperience}+ years` }]
      : []),
    ...(guide.dailyRate ? [{ label: "Daily rate", value: guide.dailyRate }] : []),
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: guide.name,
          description: guide.bio,
          url: `${SITE_URL}/guides/${slug}`,
          ...(guide.websiteUrl ? { sameAs: guide.websiteUrl } : {}),
          ...(guide.photoUrl ? { image: guide.photoUrl } : {}),
          ...(guide.phone ? { telephone: guide.phone } : {}),
          ...(guide.email ? { email: guide.email } : {}),
          ...(guide.dailyRate ? { priceRange: guide.dailyRate } : {}),
          ...(dest ? {
            areaServed: {
              "@type": "Place",
              name: dest.name,
              url: `${SITE_URL}/destinations/${dest.slug}`,
            },
          } : {}),
          employee: {
            "@type": "Person",
            name: guide.name,
            ...(guide.photoUrl ? { image: guide.photoUrl } : {}),
            ...(guide.yearsExperience ? { description: `Professional fly fishing guide with ${guide.yearsExperience}+ years of experience` } : {}),
            ...(guide.specialties && guide.specialties.length > 0
              ? { knowsAbout: guide.specialties }
              : {}),
          },
          ...(guide.googleRating && guide.googleReviewCount ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: guide.googleRating,
              reviewCount: guide.googleReviewCount,
              bestRating: 5,
              worstRating: 1,
            },
          } : {}),
          ...(guide.featuredReviews && guide.featuredReviews.length > 0
            ? {
                review: guide.featuredReviews.map((r) => ({
                  "@type": "Review",
                  author: { "@type": "Person", name: r.authorName },
                  reviewRating: {
                    "@type": "Rating",
                    ratingValue: r.rating,
                    bestRating: 5,
                    worstRating: 1,
                  },
                  reviewBody: r.text,
                })),
              }
            : {}),
        }}
      />

      <EntityIdentityBand
        toolbar={
          <div className="flex items-center justify-between gap-3">
            <Breadcrumbs
              items={[
                { label: "Guides", href: "/guides" },
                ...(dest ? [{ label: dest.name, href: `/destinations/${dest.slug}` }] : []),
                { label: guide.name },
              ]}
            />
            <FavoriteButton entityType="guide" entityId={guide.id} />
          </div>
        }
        overline={dest?.name}
        title={guide.name}
        spec={
          <FactList
            className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 sm:gap-x-8"
            facts={[
              ...(dest ? [{ label: "Location", value: dest.name }] : []),
              ...(guide.yearsExperience
                ? [{ label: "Experience", value: `${guide.yearsExperience}+ years` }]
                : []),
              ...(guide.dailyRate
                ? [{ label: "Daily rate", value: guide.dailyRate }]
                : []),
            ]}
          />
        }
      >
        {guide.googleRating ? (
          <div className="mt-3">
            <RatingStars
              rating={guide.googleRating}
              count={guide.googleReviewCount}
              size="md"
              suffix="on Google"
            />
          </div>
        ) : null}
      </EntityIdentityBand>

      <section className="bg-[var(--paper)] pb-24">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)] mb-4">
                  About
                </h2>
                {guide.bio.split("\n\n").map((p, i) => (
                  <p key={i} className="text-[var(--text-2)] leading-relaxed mb-4">
                    {p}
                  </p>
                ))}
              </ScrollAnimation>

              {specialties.length > 0 && (
                <ScrollAnimation>
                  <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                    Specialties
                  </h2>
                  <SpecList items={specialties} />
                </ScrollAnimation>
              )}

              {guideRivers.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)] mb-4">
                    Rivers & Waters
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {guideRivers.map((river) => (
                      <Link
                        key={river.id}
                        href={`/rivers/${river.slug}`}
                        className="flex items-center gap-3 p-4 bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] card-hover"
                      >
                        <MapPin className="h-5 w-5 text-[var(--accent)] shrink-0" />
                        <div>
                          <h3 className="font-medium text-[var(--accent)]">
                            {river.name}
                          </h3>
                          <p className="text-xs text-[var(--text-2)]">
                            {(river.primarySpecies || []).join(", ")}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Lodges in This Area */}
              {areaLodges.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)] mb-6">
                    Lodges in This Area
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {areaLodges.slice(0, 4).map((lodge) => (
                      <Link
                        key={lodge.id}
                        href={`/lodges/${lodge.slug}`}
                        className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] card-hover"
                      >
                        <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                          <Home className="h-5 w-5 text-[var(--accent)]" />
                        </div>
                        <div>
                          <h3 className="font-heading text-base font-semibold text-[var(--accent)]">
                            {lodge.name}
                          </h3>
                          <p className="text-sm text-[var(--text-2)] mt-0.5">{lodge.priceRange}</p>
                          {lodge.seasonStart && (
                            <p className="text-xs text-[var(--text-3)] mt-0.5">
                              {lodge.seasonStart}–{lodge.seasonEnd}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Fly Shops Nearby */}
              {areaFlyShops.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)] mb-6">
                    Fly Shops Nearby
                  </h2>
                  <div className="space-y-3">
                    {areaFlyShops.slice(0, 4).map((shop) => (
                      <Link
                        key={shop.id}
                        href={`/fly-shops/${shop.slug}`}
                        className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] card-hover"
                      >
                        <MapPin className="h-5 w-5 text-[var(--accent)] shrink-0" />
                        <div>
                          <h3 className="font-heading text-base font-semibold text-[var(--accent)]">
                            {shop.name}
                          </h3>
                          <p className="text-sm text-[var(--text-2)] mt-0.5">{shop.address}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {guideSpecies.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)] mb-6">
                    Species in This Area
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {guideSpecies.map((sp) => (
                      <Link key={sp.id} href={`/species/${sp.slug}`}>
                        <Badge variant="forest" size="md">
                          <Fish className="h-3.5 w-3.5 mr-1.5" />
                          {sp.commonName}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Google Reviews */}
              <GoogleReviews
                googleRating={guide.googleRating ?? null}
                googleReviewCount={guide.googleReviewCount ?? null}
                googleReviewsUrl={guide.googleReviewsUrl ?? null}
                featuredReviews={
                  guide.featuredReviews?.map((r) => ({
                    reviewer_name: r.authorName,
                    rating: r.rating,
                    text: r.text,
                  })) ?? null
                }
              />

              {/* User Reviews */}
              <ScrollAnimation>
                <UserReviews entityType="guide" entityId={guide.id} />
              </ScrollAnimation>
            </div>

            <div className="space-y-6">
              <QuickFacts facts={quickFacts} />

              <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] p-6">
                <h3 className="font-heading text-xl font-semibold text-[var(--text-1)] mb-3">
                  Book a Trip
                </h3>
                <p className="text-sm text-[var(--text-2)] mb-6">
                  Contact {guide.name} directly to book your guided trip.
                </p>
                {guide.websiteUrl && (
                  <a
                    href={guide.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ea-btn ea-btn-primary w-full"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Visit Website
                  </a>
                )}
                <div className="mt-4 space-y-2 text-sm">
                  {guide.phone && (
                    <a
                      href={`tel:${guide.phone}`}
                      className="flex items-center gap-2 text-[var(--text-2)] hover:text-[var(--text-1)]"
                    >
                      <Phone className="h-4 w-4" />
                      {guide.phone}
                    </a>
                  )}
                  {guide.email && (
                    <a
                      href={`mailto:${guide.email}`}
                      className="flex items-center gap-2 text-[var(--text-2)] hover:text-[var(--text-1)]"
                    >
                      <Mail className="h-4 w-4" />
                      {guide.email}
                    </a>
                  )}
                </div>
              </div>

              {guideArticles.length > 0 && (
                <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] p-6">
                  <h3 className="font-heading text-lg font-semibold text-[var(--text-1)] mb-4">
                    Related Articles
                  </h3>
                  <div className="space-y-3">
                    {guideArticles.slice(0, 3).map((article) => (
                      <Link
                        key={article.id}
                        href={`/articles/${article.slug}`}
                        className="block p-3 rounded-[var(--radius-md)] hover:bg-[var(--paper-deep)] transition-colors"
                      >
                        <p className="text-sm font-medium text-[var(--accent)]">
                          {article.title}
                        </p>
                        <p className="text-xs text-[var(--text-3)] mt-1">
                          {article.readingTimeMinutes} min read
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
