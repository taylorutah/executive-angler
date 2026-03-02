import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Phone, Mail, Calendar, Users, DollarSign } from "lucide-react";
import HeroSection from "@/components/ui/HeroSection";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import QuickFacts from "@/components/ui/QuickFacts";
import RatingStars from "@/components/ui/RatingStars";
import Badge from "@/components/ui/Badge";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import MapView from "@/components/maps/DynamicMapView";
import GoogleReviews from "@/components/GoogleReviews";
import CommunityPhotos from "@/components/ui/CommunityPhotos";
import PhotoSubmissionForm from "@/components/ui/PhotoSubmissionForm";
import { lodges } from "@/data/lodges";
import {
  getAllLodges,
  getLodgeBySlug,
  getDestinationById,
  getRiversByDestination,
} from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lodge = await getLodgeBySlug(slug);
  if (!lodge) return { title: "Lodge Not Found" };

  return {
    title: `${lodge.name} — Fly Fishing Lodge`,
    description:
      lodge.metaDescription ||
      `${lodge.name} — ${lodge.priceRange}. ${(lodge.amenities || []).slice(0, 4).join(", ")}.`,
    openGraph: {
      title: lodge.name,
      description: lodge.metaDescription || lodge.description.substring(0, 160),
      images: [lodge.heroImageUrl],
    },
  };
}

export async function generateStaticParams() {
  try {
    const allLodges = await getAllLodges();
    return allLodges.map((l) => ({ slug: l.slug }));
  } catch {
    return lodges.map((l) => ({ slug: l.slug }));
  }
}

export default async function LodgePage({ params }: Props) {
  const { slug } = await params;
  const lodge = await getLodgeBySlug(slug);
  if (!lodge) notFound();

  const [dest, nearbyRivers] = await Promise.all([
    lodge.destinationId ? getDestinationById(lodge.destinationId) : undefined,
    lodge.destinationId ? getRiversByDestination(lodge.destinationId) : Promise.resolve([]),
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
          url: lodge.websiteUrl,
          address: lodge.address,
          geo: {
            "@type": "GeoCoordinates",
            latitude: lodge.latitude,
            longitude: lodge.longitude,
          },
          image: lodge.heroImageUrl,
          ...(lodge.averageRating && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: lodge.averageRating,
              reviewCount: lodge.reviewCount,
            },
          }),
        }}
      />

      <HeroSection
        imageUrl={lodge.heroImageUrl}
        imageAlt={lodge.name}
        title={lodge.name}
        subtitle={lodge.priceRange}
        height="h-[60vh]"
      />

      <div className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <Breadcrumbs
              items={[
                { label: "Lodges", href: "/lodges" },
                ...(dest ? [{ label: dest.name, href: `/destinations/${dest.slug}` }] : []),
                { label: lodge.name },
              ]}
            />
            <FavoriteButton entityType="lodge" entityId={lodge.id} />
          </div>
        </div>
      </div>

      <section className="bg-cream pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
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
                <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                  About {lodge.name}
                </h2>
                {lodge.description.split("\n\n").map((p, i) => (
                  <p key={i} className="text-slate-700 leading-relaxed mb-4">
                    {p}
                  </p>
                ))}
              </ScrollAnimation>

              {/* Amenities */}
              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                  Amenities & Services
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(lodge.amenities || []).map((amenity) => (
                    <Badge key={amenity} variant="forest" size="md">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </ScrollAnimation>

              {/* Photo Gallery */}
              {(lodge.galleryUrls || []).length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                    Photos
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(lodge.galleryUrls || []).map((url, i) => (
                      <div
                        key={i}
                        className="relative h-48 rounded-xl overflow-hidden"
                      >
                        {/* PLACEHOLDER — Replace with real lodge photography */}
                        <Image
                          src={url}
                          alt={`${lodge.name} photo ${i + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Map */}
              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
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
                      color: "#B8860B",
                    },
                  ]}
                  className="h-[350px] w-full rounded-xl overflow-hidden shadow-md"
                />
              </ScrollAnimation>

              {/* Nearby Rivers */}
              {nearbyRivers.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mb-6">
                    Nearby Rivers
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {nearbyRivers.map((river) => (
                      <Link
                        key={river.id}
                        href={`/rivers/${river.slug}`}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm card-hover"
                      >
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={river.heroImageUrl}
                            alt={river.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div>
                          <h3 className="font-heading text-base font-semibold text-forest-dark">
                            {river.name}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {(river.primarySpecies || []).join(", ")}
                          </p>
                        </div>
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

              {/* Community Photos */}
              <CommunityPhotos entityType="lodge" entityId={lodge.id} />
              <PhotoSubmissionForm entityType="lodge" entityId={lodge.id} entityName={lodge.name} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <QuickFacts facts={quickFacts} />

              {/* Booking CTA */}
              <div className="bg-forest rounded-xl p-6 text-white shadow-lg">
                <h3 className="font-heading text-xl font-bold mb-3">
                  Book Your Stay
                </h3>
                <p className="text-sm text-white/80 mb-6">
                  Book directly with {lodge.name} for the best rates and availability.
                </p>
                {lodge.websiteUrl && (
                  <a
                    href={lodge.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white text-forest-dark font-semibold rounded-lg hover:bg-cream transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
                  </a>
                )}
                <div className="mt-4 space-y-2 text-sm">
                  {lodge.phone && (
                    <a
                      href={`tel:${lodge.phone}`}
                      className="flex items-center gap-2 text-white/80 hover:text-white"
                    >
                      <Phone className="h-4 w-4" />
                      {lodge.phone}
                    </a>
                  )}
                  {lodge.email && (
                    <a
                      href={`mailto:${lodge.email}`}
                      className="flex items-center gap-2 text-white/80 hover:text-white"
                    >
                      <Mail className="h-4 w-4" />
                      {lodge.email}
                    </a>
                  )}
                </div>
              </div>

              {/* Season Calendar */}
              {lodge.seasonStart && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-heading text-lg font-semibold text-forest-dark mb-3">
                    Season
                  </h3>
                  <p className="text-sm text-slate-600">
                    <Calendar className="h-4 w-4 inline mr-1.5" />
                    {lodge.seasonStart} through {lodge.seasonEnd}
                  </p>
                  {lodge.capacity && (
                    <p className="text-sm text-slate-600 mt-2">
                      <Users className="h-4 w-4 inline mr-1.5" />
                      {lodge.capacity} guest capacity
                    </p>
                  )}
                  {lodge.priceRange && (
                    <p className="text-sm text-slate-600 mt-2">
                      <DollarSign className="h-4 w-4 inline mr-1.5" />
                      {lodge.priceRange}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
