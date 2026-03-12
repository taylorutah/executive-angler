import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Phone, Mail, Award, MapPin } from "lucide-react";
import HeroSection from "@/components/ui/HeroSection";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import QuickFacts from "@/components/ui/QuickFacts";
import Badge from "@/components/ui/Badge";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import GoogleReviews from "@/components/GoogleReviews";
import CommunityPhotos from "@/components/ui/CommunityPhotos";
import PhotoSubmissionForm from "@/components/ui/PhotoSubmissionForm";
import { guides } from "@/data/guides";
import { SITE_URL } from "@/lib/constants";
import {
  getAllGuides,
  getGuideBySlug,
  getDestinationById,
  getRiversByIds,
  getLodgesByDestination,
  getFlyShopsByDestination,
} from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: "Guide Not Found" };

  return {
    title: `${guide.name} — Fly Fishing Guide`,
    description:
      guide.metaDescription ||
      `${guide.name} — professional fly fishing guide. Specialties: ${(guide.specialties || []).join(", ")}.`,
    alternates: {
      canonical: `${SITE_URL}/guides/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  try {
    const allGuides = await getAllGuides();
    return allGuides.map((g) => ({ slug: g.slug }));
  } catch {
    return guides.map((g) => ({ slug: g.slug }));
  }
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
          "@type": ["LocalBusiness", "Person"],
          name: guide.name,
          description: guide.bio,
          url: guide.websiteUrl,
        }}
      />

      <HeroSection
        imageUrl={
          guide.photoUrl ||
          "https://images.unsplash.com/photo-1545816250-e12bedba42ba?w=1920&q=80"
        }
        imageAlt={`${guide.name} — fly fishing guide`}
        title={guide.name}
        subtitle={`Fly Fishing Guide${dest ? ` — ${dest.name}` : ""}`}
        height="h-[50vh]"
      />

      <div className="bg-[#0D1117]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <Breadcrumbs
              items={[
                { label: "Guides", href: "/guides" },
                ...(dest ? [{ label: dest.name, href: `/destinations/${dest.slug}` }] : []),
                { label: guide.name },
              ]}
            />
            <FavoriteButton entityType="guide" entityId={guide.id} />
          </div>
        </div>
      </div>

      <section className="bg-[#0D1117] pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                  About
                </h2>
                {guide.bio.split("\n\n").map((p, i) => (
                  <p key={i} className="text-[#8B949E] leading-relaxed mb-4">
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
                          <p className="text-xs text-[#8B949E]">
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
                          <p className="text-sm text-[#8B949E] mt-0.5">{lodge.priceRange}</p>
                          {lodge.seasonStart && (
                            <p className="text-xs text-[#484F58] mt-0.5">
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
                          <p className="text-sm text-[#8B949E] mt-0.5">{shop.address}</p>
                        </div>
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

              {/* Community Photos */}
              <CommunityPhotos entityType="guide" entityId={guide.id} />
              <PhotoSubmissionForm entityType="guide" entityId={guide.id} entityName={guide.name} />
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
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
