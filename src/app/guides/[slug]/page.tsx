import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Phone, Mail, Award, MapPin, Fish, Star } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
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
    title: guide.metaTitle || fallbackTitle,
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

  const quickFacts = [
    ...(dest ? [{ label: "Location", value: dest.name }] : []),
    ...(guide.yearsExperience
      ? [{ label: "Experience", value: `${guide.yearsExperience}+ years` }]
      : []),
    ...(guide.dailyRate ? [{ label: "Daily Rate", value: guide.dailyRate }] : []),
    {
      label: "Specialties",
      value: (guide.specialties || []).join(", "),
    },
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

      {/* Text Hero */}
      <section className="bg-[#0D1117] pt-6 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              ...(dest ? [{ label: dest.name, href: `/destinations/${dest.slug}` }] : []),
              { label: guide.name },
            ]}
          />

          <div className="mt-6 flex items-start gap-4">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white flex-1">
              {guide.name}
            </h1>
            <div className="mt-2 shrink-0">
              <FavoriteButton entityType="guide" entityId={guide.id} />
            </div>
          </div>

          {/* Badge Row: Destination, Experience, Rate */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {dest && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#161B22] text-[#A8B2BD] text-sm font-medium rounded-full border border-[#21262D]">
                <MapPin className="h-4 w-4 text-[#E8923A]" />
                {dest.name}
              </span>
            )}
            {guide.yearsExperience && (
              <span className="inline-flex items-center px-3 py-1.5 bg-[#161B22] text-[#A8B2BD] text-sm font-medium rounded-full border border-[#21262D]">
                {guide.yearsExperience}+ years experience
              </span>
            )}
            {guide.dailyRate && (
              <span className="inline-flex items-center px-3 py-1.5 bg-[#E8923A]/10 text-[#E8923A] text-sm font-semibold rounded-full border border-[#E8923A]/30">
                {guide.dailyRate}
              </span>
            )}
          </div>

          {/* Specialty Pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            {(guide.specialties || []).map((s) => (
              <span
                key={s}
                className="px-3 py-1 bg-[#0D1117] text-[#E8923A] text-sm font-medium rounded-full border border-[#21262D]"
              >
                {s}
              </span>
            ))}
          </div>

          {/* Rating */}
          {guide.googleRating && (
            <div className="mt-6 flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-[#E8923A] text-[#E8923A]" />
              <span className="text-white font-semibold">{guide.googleRating}</span>
              {guide.googleReviewCount && (
                <span className="text-[#6E7681] text-sm">({guide.googleReviewCount} reviews)</span>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#0D1117] pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                  About
                </h2>
                {guide.bio.split("\n\n").map((p, i) => (
                  <p key={i} className="text-[#A8B2BD] leading-relaxed mb-4">
                    {p}
                  </p>
                ))}
              </ScrollAnimation>

              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                  Specialties
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(guide.specialties || []).map((s) => (
                    <Badge key={s} variant="forest" size="md">
                      <Award className="h-3.5 w-3.5 mr-1.5" />
                      {s}
                    </Badge>
                  ))}
                </div>
              </ScrollAnimation>

              {guideRivers.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                    Rivers & Waters
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {guideRivers.map((river) => (
                      <Link
                        key={river.id}
                        href={`/rivers/${river.slug}`}
                        className="flex items-center gap-3 p-4 bg-[#161B22] rounded-xl shadow-sm card-hover"
                      >
                        <MapPin className="h-5 w-5 text-river shrink-0" />
                        <div>
                          <h3 className="font-medium text-[#E8923A]">
                            {river.name}
                          </h3>
                          <p className="text-xs text-[#A8B2BD]">
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
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-6">
                    Lodges in This Area
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {areaLodges.slice(0, 4).map((lodge) => (
                      <Link
                        key={lodge.id}
                        href={`/lodges/${lodge.slug}`}
                        className="flex items-center gap-4 p-4 bg-[#161B22] rounded-xl shadow-sm card-hover"
                      >
                        <div className="w-12 h-12 rounded-lg bg-[#E8923A]/10 flex items-center justify-center shrink-0 text-lg">
                          🏕
                        </div>
                        <div>
                          <h3 className="font-heading text-base font-semibold text-[#E8923A]">
                            {lodge.name}
                          </h3>
                          <p className="text-sm text-[#A8B2BD] mt-0.5">{lodge.priceRange}</p>
                          {lodge.seasonStart && (
                            <p className="text-xs text-[#6E7681] mt-0.5">
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
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-6">
                    Fly Shops Nearby
                  </h2>
                  <div className="space-y-3">
                    {areaFlyShops.slice(0, 4).map((shop) => (
                      <Link
                        key={shop.id}
                        href={`/fly-shops/${shop.slug}`}
                        className="flex items-center gap-4 p-4 bg-[#161B22] rounded-xl shadow-sm card-hover"
                      >
                        <MapPin className="h-5 w-5 text-[#E8923A] shrink-0" />
                        <div>
                          <h3 className="font-heading text-base font-semibold text-[#E8923A]">
                            {shop.name}
                          </h3>
                          <p className="text-sm text-[#A8B2BD] mt-0.5">{shop.address}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {guideSpecies.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-6">
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

              <div className="bg-[#E8923A] rounded-xl p-6 text-white shadow-lg">
                <h3 className="font-heading text-xl font-bold mb-3">
                  Book a Trip
                </h3>
                <p className="text-sm text-white/80 mb-6">
                  Contact {guide.name} directly to book your guided trip.
                </p>
                {guide.websiteUrl && (
                  <a
                    href={guide.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#161B22] text-[#E8923A] font-semibold rounded-lg hover:bg-[#0D1117] transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
                  </a>
                )}
                <div className="mt-4 space-y-2 text-sm">
                  {guide.phone && (
                    <a
                      href={`tel:${guide.phone}`}
                      className="flex items-center gap-2 text-white/80 hover:text-white"
                    >
                      <Phone className="h-4 w-4" />
                      {guide.phone}
                    </a>
                  )}
                  {guide.email && (
                    <a
                      href={`mailto:${guide.email}`}
                      className="flex items-center gap-2 text-white/80 hover:text-white"
                    >
                      <Mail className="h-4 w-4" />
                      {guide.email}
                    </a>
                  )}
                </div>
              </div>

              {guideArticles.length > 0 && (
                <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                  <h3 className="font-heading text-lg font-semibold text-[#E8923A] mb-4">
                    Related Articles
                  </h3>
                  <div className="space-y-3">
                    {guideArticles.slice(0, 3).map((article) => (
                      <Link
                        key={article.id}
                        href={`/articles/${article.slug}`}
                        className="block p-3 rounded-lg hover:bg-[#0D1117] transition-colors"
                      >
                        <p className="text-sm font-medium text-[#E8923A]">
                          {article.title}
                        </p>
                        <p className="text-xs text-[#A8B2BD] mt-1">
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
