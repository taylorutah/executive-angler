import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Phone, Mail, Calendar, Users, DollarSign, Fish } from "@/icons";
import HeroSection from "@/components/ui/HeroSection";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FactList from "@/components/ui/FactList";
import SpecList from "@/components/ui/SpecList";
import QuickFacts from "@/components/ui/QuickFacts";
import RatingStars from "@/components/ui/RatingStars";
import Badge from "@/components/ui/Badge";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import MapView from "@/components/maps/DynamicMapView";
import GoogleReviews from "@/components/GoogleReviews";
import UserReviews from "@/components/ui/UserReviews";
import CommunityPhotos from "@/components/ui/CommunityPhotos";
import PhotoSubmissionForm from "@/components/ui/PhotoSubmissionForm";
import AdminHeroEditor from "@/components/admin/AdminHeroEditor";
import { SITE_URL } from "@/lib/constants";
import { COPPER_700 } from "@/lib/palette";
import {
  getAllLodges,
  getLodgeBySlug,
  getDestinationById,
  getRiversByDestination,
  getRiversByIds,
  getArticlesByDestination,
  getSpeciesByCommonNames,
} from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lodge = await getLodgeBySlug(slug);
  if (!lodge) return { title: "Lodge Not Found" };

  const priceLabel = lodge.priceTier ? (lodge.priceTier <= 2 ? "Value" : lodge.priceTier <= 3 ? "Mid-Range" : "Premium") : "";
  const nearbyCount = (lodge.nearbyRiverIds || []).length;
  const amenityHighlights = (lodge.amenities || []).slice(0, 3).join(", ");
  const capacityStr = lodge.capacity ? `${lodge.capacity} guests. ` : "";
  const fallbackTitle = `${lodge.name} — ${priceLabel ? priceLabel + " " : ""}Fly Fishing Lodge | Reviews & Booking | Executive Angler`;
  const fallbackDesc = `${lodge.name}${lodge.priceRange ? ` — ${lodge.priceRange}` : ""}. ${capacityStr}${amenityHighlights ? amenityHighlights + ". " : ""}${nearbyCount > 0 ? `${nearbyCount} nearby rivers. ` : ""}Book direct and read reviews.`;

  return {
    title: { absolute: lodge.metaTitle || fallbackTitle },
    description:
      lodge.metaDescription || fallbackDesc,
    openGraph: {
      title: lodge.metaTitle || lodge.name,
      description: lodge.metaDescription || lodge.description.substring(0, 160),
      ...(lodge.heroImageUrl ? { images: [lodge.heroImageUrl] } : {}),
    },
    alternates: {
      canonical: `${SITE_URL}/lodges/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const allLodges = await getAllLodges();
  return allLodges.map((l) => ({ slug: l.slug }));
}

export default async function LodgePage({ params }: Props) {
  const { slug } = await params;
  const lodge = await getLodgeBySlug(slug);
  if (!lodge) notFound();

  const [dest, nearbyRivers] = await Promise.all([
    lodge.destinationId ? getDestinationById(lodge.destinationId) : Promise.resolve(undefined),
    (lodge.nearbyRiverIds || []).length > 0
      ? getRiversByIds(lodge.nearbyRiverIds!)
      : lodge.destinationId
        ? getRiversByDestination(lodge.destinationId)
        : Promise.resolve([]),
  ]);

  const [lodgeArticles, lodgeSpecies] = await Promise.all([
    lodge.destinationId ? getArticlesByDestination(lodge.destinationId) : Promise.resolve([]),
    dest ? getSpeciesByCommonNames(dest.primarySpecies || []) : Promise.resolve([]),
  ]);

  const quickFacts = [
    ...(dest ? [{ label: "Destination", value: dest.name }] : []),
    ...(lodge.priceRange
      ? [{ label: "Price Range", value: lodge.priceRange }]
      : []),
    ...(lodge.seasonStart
      ? [{ label: "Season", value: `${lodge.seasonStart}–${lodge.seasonEnd}` }]
      : []),
    ...(lodge.capacity
      ? [{ label: "Capacity", value: `${lodge.capacity} guests` }]
      : []),
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LodgingBusiness",
          name: lodge.name,
          description: lodge.description,
          url: `${SITE_URL}/lodges/${slug}`,
          ...(lodge.websiteUrl ? { sameAs: lodge.websiteUrl } : {}),
          address: lodge.address,
          ...(lodge.phone ? { telephone: lodge.phone } : {}),
          ...(lodge.email ? { email: lodge.email } : {}),
          ...(lodge.priceRange ? { priceRange: lodge.priceRange } : {}),
          geo: {
            "@type": "GeoCoordinates",
            latitude: lodge.latitude,
            longitude: lodge.longitude,
          },
          image: lodge.heroImageUrl,
          ...(lodge.amenities?.length ? {
            amenityFeature: lodge.amenities.map((a: string) => ({
              "@type": "LocationFeatureSpecification",
              name: a,
              value: true,
            })),
          } : {}),
          ...((lodge.googleRating || lodge.averageRating) ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: lodge.googleRating || lodge.averageRating,
              reviewCount: lodge.googleReviewCount || lodge.reviewCount,
              bestRating: 5,
              worstRating: 1,
            },
          } : {}),
          ...(lodge.featuredReviews && lodge.featuredReviews.length > 0
            ? {
                review: lodge.featuredReviews.map((r) => ({
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

      <div className="relative">
        <HeroSection
          imageUrl={lodge.heroImageUrl}
          imageAlt={lodge.heroImageAlt || lodge.name}
          title={lodge.name}
          subtitle={lodge.priceRange}
          overline={dest?.name}
          height="h-[60vh]"
          imageCredit={lodge.heroImageCredit}
          imageCreditUrl={lodge.heroImageCreditUrl}
          toolbar={
            <div className="flex items-center justify-between gap-3">
              <Breadcrumbs
                items={[
                  { label: "Lodges", href: "/lodges" },
                  ...(dest ? [{ label: dest.name, href: `/destinations/${dest.slug}` }] : []),
                  { label: lodge.name },
                ]}
              />
              <FavoriteButton entityType="lodge" entityId={lodge.id} />
            </div>
          }
          spec={
            <FactList
              className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 sm:gap-x-8"
              facts={quickFacts}
            />
          }
        />
        {true && (
          <div className="absolute top-4 right-4 z-20">
            <AdminHeroEditor
              entityType="lodges"
              entityId={lodge.id}
              currentImageUrl={lodge.heroImageUrl}
              currentAlt={lodge.heroImageAlt}
              currentCredit={lodge.heroImageCredit}
              currentCreditUrl={lodge.heroImageCreditUrl}
            />
          </div>
        )}
      </div>

      <section className="bg-[var(--paper)] pb-24">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Rating */}
              {lodge.averageRating && (
                <ScrollAnimation>
                  <RatingStars
                    rating={lodge.averageRating}
                    count={lodge.reviewCount}
                    size="md"
                  />
                </ScrollAnimation>
              )}

              {/* Overview */}
              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)] mb-4">
                  About {lodge.name}
                </h2>
                {lodge.description.split("\n\n").map((p, i) => (
                  <p key={i} className="text-[var(--text-2)] leading-relaxed mb-4">
                    {p}
                  </p>
                ))}
              </ScrollAnimation>

              {/* Amenities */}
              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)] mb-4">
                  Amenities & Services
                </h2>
                <SpecList items={lodge.amenities || []} />
              </ScrollAnimation>

              {/* Photo Gallery */}
              {(lodge.galleryUrls || []).length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)] mb-4">
                    Photos
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(lodge.galleryUrls || []).map((url, i) => (
                      <div
                        key={i}
                        className="relative h-48 rounded-[var(--radius-card)] overflow-hidden"
                      >
                        {/* PLACEHOLDER — Replace with real lodge photography */}
                        <Image
                          src={url}
                          alt={`${lodge.name} photo ${i + 1}`}
                          fill
                          className="ea-photo"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Map */}
              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)] mb-4">
                  Location
                </h2>
                <MapView
                  latitude={lodge.latitude}
                  longitude={lodge.longitude}
                  zoom={11}
                  markers={[
                    {
                      latitude: lodge.latitude,
                      longitude: lodge.longitude,
                      title: lodge.name,
                      description: lodge.address,
                      color: COPPER_700,
                    },
                  ]}
                  className="h-[350px] w-full rounded-[var(--radius-card)] overflow-hidden border border-[var(--border)]"
                />
              </ScrollAnimation>

              {/* Nearby Rivers */}
              {nearbyRivers.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)] mb-6">
                    Nearby Rivers
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {nearbyRivers.map((river) => (
                      <Link
                        key={river.id}
                        href={`/rivers/${river.slug}`}
                        className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] card-hover"
                      >
                        <div className="relative w-20 h-20 rounded-[var(--radius-md)] overflow-hidden shrink-0 bg-[var(--paper-deep)]">
                          <SafeEntityImage
                            src={river.heroImageUrl}
                            alt={river.name}
                            title={river.name}
                            className="ea-photo"
                            sizes="80px"
                          />
                        </div>
                        <div>
                          <h3 className="font-heading text-base font-semibold text-[var(--accent)]">
                            {river.name}
                          </h3>
                          <p className="text-sm text-[var(--text-2)] mt-0.5">
                            {(river.primarySpecies || []).join(", ")}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Species in This Area */}
              {lodgeSpecies.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)] mb-6">
                    Species in This Area
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {lodgeSpecies.map((sp) => (
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
                googleRating={lodge.googleRating ?? null}
                googleReviewCount={lodge.googleReviewCount ?? null}
                googleReviewsUrl={lodge.googleReviewsUrl ?? null}
                featuredReviews={
                  lodge.featuredReviews?.map((r) => ({
                    reviewer_name: r.authorName,
                    rating: r.rating,
                    text: r.text,
                  })) ?? null
                }
              />

              {/* User Reviews */}
              <ScrollAnimation>
                <UserReviews entityType="lodge" entityId={lodge.id} />
              </ScrollAnimation>

              {/* Community Photos */}
              <CommunityPhotos entityType="lodge" entityId={lodge.id} />
              <PhotoSubmissionForm entityType="lodge" entityId={lodge.id} entityName={lodge.name} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <QuickFacts facts={quickFacts} />

              {/* Booking CTA */}
              <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] p-6">
                <h3 className="font-heading text-xl font-semibold text-[var(--text-1)] mb-3">
                  Book Your Stay
                </h3>
                <p className="text-sm text-[var(--text-2)] mb-6">
                  Book directly with {lodge.name} for the best rates and availability.
                </p>
                {lodge.websiteUrl && (
                  <a
                    href={lodge.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ea-btn ea-btn-primary w-full"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Visit Website
                  </a>
                )}
                <div className="mt-4 space-y-2 text-sm">
                  {lodge.phone && (
                    <a
                      href={`tel:${lodge.phone}`}
                      className="flex items-center gap-2 text-[var(--text-2)] hover:text-[var(--text-1)]"
                    >
                      <Phone className="h-4 w-4" />
                      {lodge.phone}
                    </a>
                  )}
                  {lodge.email && (
                    <a
                      href={`mailto:${lodge.email}`}
                      className="flex items-center gap-2 text-[var(--text-2)] hover:text-[var(--text-1)]"
                    >
                      <Mail className="h-4 w-4" />
                      {lodge.email}
                    </a>
                  )}
                </div>
              </div>

              {/* Season Calendar */}
              {lodge.seasonStart && (
                <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] p-6">
                  <h3 className="font-heading text-lg font-semibold text-[var(--text-1)] mb-3">
                    Season
                  </h3>
                  <p className="text-sm text-[var(--text-2)]">
                    <Calendar className="h-4 w-4 inline mr-1.5" />
                    {lodge.seasonStart} through {lodge.seasonEnd}
                  </p>
                  {lodge.capacity && (
                    <p className="text-sm text-[var(--text-2)] mt-2">
                      <Users className="h-4 w-4 inline mr-1.5" />
                      {lodge.capacity} guest capacity
                    </p>
                  )}
                  {lodge.priceRange && (
                    <p className="text-sm text-[var(--text-2)] mt-2">
                      <DollarSign className="h-4 w-4 inline mr-1.5" />
                      {lodge.priceRange}
                    </p>
                  )}
                </div>
              )}

              {/* Related Articles */}
              {lodgeArticles.length > 0 && (
                <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] p-6">
                  <h3 className="font-heading text-lg font-semibold text-[var(--text-1)] mb-4">
                    Related Articles
                  </h3>
                  <div className="space-y-3">
                    {lodgeArticles.slice(0, 3).map((article) => (
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
