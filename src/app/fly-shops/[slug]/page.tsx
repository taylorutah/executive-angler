import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Phone, MapPin, Clock, Waves, User } from "lucide-react";
import HeroSection from "@/components/ui/HeroSection";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import QuickFacts from "@/components/ui/QuickFacts";
import Badge from "@/components/ui/Badge";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import MapView from "@/components/maps/DynamicMapView";
import GoogleReviews from "@/components/GoogleReviews";
import CommunityPhotos from "@/components/ui/CommunityPhotos";
import PhotoSubmissionForm from "@/components/ui/PhotoSubmissionForm";
import { flyShops } from "@/data/fly-shops";
import { SITE_URL } from "@/lib/constants";
import Link from "next/link";
import { getAllFlyShops, getFlyShopBySlug, getDestinationById, getRiversByDestination, getGuidesByDestination } from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getFlyShopBySlug(slug);
  if (!shop) return { title: "Fly Shop Not Found" };

  return {
    title: `${shop.name} — Fly Shop`,
    description: shop.metaDescription || `${shop.name} — ${shop.address}. ${(shop.services || []).join(", ")}.`,
    alternates: {
      canonical: `${SITE_URL}/fly-shops/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  try {
    const shops = await getAllFlyShops();
    return shops.map((s) => ({ slug: s.slug }));
  } catch {
    return flyShops.map((s) => ({ slug: s.slug }));
  }
}

export default async function FlyShopPage({ params }: Props) {
  const { slug } = await params;
  const shop = await getFlyShopBySlug(slug);
  if (!shop) notFound();

  const [dest, nearbyRivers, areaGuides] = await Promise.all([
    shop.destinationId ? getDestinationById(shop.destinationId) : Promise.resolve(undefined),
    shop.destinationId ? getRiversByDestination(shop.destinationId) : Promise.resolve([]),
    shop.destinationId ? getGuidesByDestination(shop.destinationId) : Promise.resolve([]),
  ]);

  const quickFacts = [
    ...(dest ? [{ label: "Location", value: dest.name }] : []),
    { label: "Address", value: shop.address },
    ...(shop.phone ? [{ label: "Phone", value: shop.phone }] : []),
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: shop.name,
          description: shop.description,
          address: shop.address,
          url: shop.websiteUrl,
          geo: {
            "@type": "GeoCoordinates",
            latitude: shop.latitude,
            longitude: shop.longitude,
          },
        }}
      />

      <HeroSection
        imageUrl={
          shop.heroImageUrl ||
          "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=1920&q=80"
        }
        imageAlt={shop.name}
        title={shop.name}
        subtitle={shop.address}
        height="h-[50vh]"
      />

      <div className="bg-[#0D1117]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <Breadcrumbs
              items={[
                { label: "Fly Shops", href: "/fly-shops" },
                ...(dest ? [{ label: dest.name, href: `/destinations/${dest.slug}` }] : []),
                { label: shop.name },
              ]}
            />
            <FavoriteButton entityType="fly_shop" entityId={shop.id} />
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
                {shop.description.split("\n\n").map((p, i) => (
                  <p key={i} className="text-[#8B949E] leading-relaxed mb-4">
                    {p}
                  </p>
                ))}
              </ScrollAnimation>

              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                  Services
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(shop.services || []).map((s) => (
                    <Badge key={s} variant="forest" size="md">
                      {s}
                    </Badge>
                  ))}
                </div>
              </ScrollAnimation>

              {(shop.brandsCarried || []).length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                    Brands Carried
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(shop.brandsCarried || []).map((b) => (
                      <Badge key={b} variant="outline" size="md">
                        {b}
                      </Badge>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Waters We Know */}
              {nearbyRivers.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-6">
                    Waters We Know
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {nearbyRivers.slice(0, 6).map((river) => (
                      <Link
                        key={river.id}
                        href={`/rivers/${river.slug}`}
                        className="flex items-center gap-3 p-4 bg-[#161B22] rounded-xl shadow-sm card-hover"
                      >
                        <Waves className="h-5 w-5 text-river shrink-0" />
                        <div>
                          <h3 className="font-medium text-[#E8923A]">{river.name}</h3>
                          <p className="text-xs text-[#8B949E]">
                            {(river.primarySpecies || []).slice(0, 3).join(", ")}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Guides in This Area */}
              {areaGuides.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-6">
                    Guides in This Area
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {areaGuides.slice(0, 4).map((guide) => (
                      <Link
                        key={guide.id}
                        href={`/guides/${guide.slug}`}
                        className="flex items-center gap-4 p-4 bg-[#161B22] rounded-xl shadow-sm card-hover"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#E8923A]/10 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-[#E8923A]" />
                        </div>
                        <div>
                          <h3 className="font-heading text-base font-semibold text-[#E8923A]">
                            {guide.name}
                          </h3>
                          <p className="text-sm text-[#8B949E] mt-0.5">
                            {(guide.specialties || []).slice(0, 2).join(", ")}
                          </p>
                          {guide.dailyRate && (
                            <p className="text-sm font-medium text-[#E8923A] mt-0.5">
                              {guide.dailyRate}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                  Location
                </h2>
                <MapView
                  latitude={shop.latitude}
                  longitude={shop.longitude}
                  zoom={14}
                  markers={[
                    {
                      latitude: shop.latitude,
                      longitude: shop.longitude,
                      title: shop.name,
                      description: shop.address,
                    },
                  ]}
                  className="h-[300px] w-full rounded-xl overflow-hidden shadow-md"
                />
              </ScrollAnimation>

              {/* Google Reviews */}
              <GoogleReviews
                googleRating={shop.googleRating ?? null}
                googleReviewCount={shop.googleReviewCount ?? null}
                googleReviewsUrl={shop.googleReviewsUrl ?? null}
                featuredReviews={
                  shop.featuredReviews?.map((r) => ({
                    reviewer_name: r.authorName,
                    rating: r.rating,
                    text: r.text,
                  })) ?? null
                }
              />

              {/* Community Photos */}
              <CommunityPhotos entityType="fly-shop" entityId={shop.id} />
              <PhotoSubmissionForm entityType="fly-shop" entityId={shop.id} entityName={shop.name} />
            </div>

            <div className="space-y-6">
              <QuickFacts facts={quickFacts} />

              {/* Hours */}
              {shop.hours && (
                <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                  <h3 className="font-heading text-lg font-semibold text-[#E8923A] mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Hours
                  </h3>
                  <dl className="space-y-2">
                    {Object.entries(shop.hours || {}).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <dt className="text-[#8B949E] capitalize">{day}</dt>
                        <dd className="font-medium text-[#8B949E]">{hours}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Contact */}
              <div className="bg-[#E8923A] rounded-xl p-6 text-white shadow-lg">
                <h3 className="font-heading text-xl font-bold mb-3">
                  Contact
                </h3>
                {shop.websiteUrl && (
                  <a
                    href={shop.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#161B22] text-[#E8923A] font-semibold rounded-lg hover:bg-[#0D1117] transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
                  </a>
                )}
                <div className="mt-4 space-y-2 text-sm">
                  {shop.phone && (
                    <a
                      href={`tel:${shop.phone}`}
                      className="flex items-center gap-2 text-white/80 hover:text-white"
                    >
                      <Phone className="h-4 w-4" />
                      {shop.phone}
                    </a>
                  )}
                  <p className="flex items-center gap-2 text-white/80">
                    <MapPin className="h-4 w-4" />
                    {shop.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
