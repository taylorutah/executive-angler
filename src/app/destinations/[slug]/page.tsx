import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Fish, ArrowRight, Star } from "lucide-react";
import HeroSection from "@/components/ui/HeroSection";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import QuickFacts from "@/components/ui/QuickFacts";
import EntityCard from "@/components/ui/EntityCard";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import Badge from "@/components/ui/Badge";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import MapView from "@/components/maps/DynamicMapView";
import CommunityPhotos from "@/components/ui/CommunityPhotos";
import PhotoSubmissionForm from "@/components/ui/PhotoSubmissionForm";
import HeroImageEditor from "@/components/admin/HeroImageEditor";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { SITE_URL } from "@/lib/constants";
import {
  getAllDestinations,
  getDestinationBySlug,
  getRiversByDestination,
  getLodgesByDestination,
  getGuidesByDestination,
  getArticlesByDestination,
  getFlyShopsByDestination,
  getSpeciesByCommonNames,
} from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest) return { title: "Destination Not Found" };

  const speciesList = (dest.primarySpecies || []).slice(0, 3).join(", ");
  const monthStr = (dest.bestMonths || []).length > 0 ? `Best months: ${dest.bestMonths!.slice(0, 3).join(", ")}` : "";
  const fallbackTitle = `${dest.name} Fly Fishing — ${speciesList || dest.tagline || "Complete Guide"} | Executive Angler`;
  const fallbackDesc = `Plan your ${dest.name} fly fishing trip. ${speciesList ? "Target " + speciesList + ". " : ""}${monthStr ? monthStr + ". " : ""}Rivers, guides, lodges, and local intel.`;

  return {
    title: dest.metaTitle || fallbackTitle,
    description:
      dest.metaDescription || fallbackDesc,
    openGraph: {
      title: dest.metaTitle || `${dest.name} Fly Fishing`,
      description: dest.metaDescription || dest.tagline,
      images: [
        dest.heroImageUrl ||
          `${SITE_URL}/api/og?title=${encodeURIComponent(dest.name)}&subtitle=${encodeURIComponent("Fly Fishing Destination Guide")}&type=destination`,
      ],
    },
    alternates: {
      canonical: `${SITE_URL}/destinations/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const allDests = await getAllDestinations();
  return allDests.map((d) => ({ slug: d.slug }));
}

export const revalidate = 3600;

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest) notFound();

  // Check if current user is admin (for hero image editor)
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const userIsAdmin = isAdmin(currentUser?.email);

  const [destRivers, destLodges, destGuides, destArticles, destFlyShops, destSpecies] = await Promise.all([
    getRiversByDestination(dest.id),
    getLodgesByDestination(dest.id),
    getGuidesByDestination(dest.id),
    getArticlesByDestination(dest.id),
    getFlyShopsByDestination(dest.id),
    getSpeciesByCommonNames(dest.primarySpecies || []),
  ]);

  const mapMarkers = [
    ...destRivers.map((r) => ({
      latitude: r.latitude,
      longitude: r.longitude,
      title: r.name,
      description: `${r.flowType} · ${(r.primarySpecies || []).join(", ")}`,
      color: "#2563EB",
    })),
    ...destLodges.map((l) => ({
      latitude: l.latitude,
      longitude: l.longitude,
      title: l.name,
      description: l.priceRange || "Lodge",
      color: "#B8860B",
    })),
  ];

  const quickFacts = [
    { label: "Region", value: dest.region },
    { label: "Best Months", value: (dest.bestMonths || []).join(", ") },
    { label: "Primary Species", value: (dest.primarySpecies || []).join(", ") },
    ...(dest.elevationRange
      ? [{ label: "Elevation", value: dest.elevationRange }]
      : []),
    ...(dest.licenseInfo
      ? [{ label: "License Info", value: dest.licenseInfo }]
      : []),
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": ["TouristDestination", "Place"],
          name: `${dest.name} Fly Fishing`,
          description: dest.description,
          url: `${SITE_URL}/destinations/${slug}`,
          geo: {
            "@type": "GeoCoordinates",
            latitude: dest.latitude,
            longitude: dest.longitude,
          },
          image: dest.heroImageUrl,
          containedInPlace: {
            "@type": "Country",
            name: dest.country,
          },
          ...(dest.primarySpecies && dest.primarySpecies.length > 0
            ? {
                touristType: dest.primarySpecies.map((s) => `Fly fishing for ${s}`),
              }
            : {}),
        }}
      />

      <div className="relative">
        <HeroSection
          imageUrl={dest.heroImageUrl}
          imageAlt={dest.heroImageAlt || `Fly fishing in ${dest.name}`}
          title={dest.name}
          subtitle={dest.tagline}
          height="h-[65vh]"
          imageCredit={dest.heroImageCredit}
          imageCreditUrl={dest.heroImageCreditUrl}
        />
        {userIsAdmin && (
          <div className="absolute top-4 right-4 z-20">
            <HeroImageEditor
              entityType="destinations"
              entityId={dest.id}
              currentImageUrl={dest.heroImageUrl}
              currentAlt={dest.heroImageAlt}
              currentCredit={dest.heroImageCredit}
              currentCreditUrl={dest.heroImageCreditUrl}
            />
          </div>
        )}
      </div>

      <div className="bg-[#0D1117]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <Breadcrumbs
              items={[
                { label: "Destinations", href: "/destinations" },
                { label: dest.name },
              ]}
            />
            <FavoriteButton entityType="destination" entityId={dest.id} />
          </div>
        </div>
      </div>

      <section className="bg-[#0D1117] pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              <ScrollAnimation>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                    Overview
                  </h2>
                  <div className="destination-body">
                    {dest.description.split("\n\n").map((paragraph, i) => (
                      <p key={i} className="text-[#A8B2BD] text-base leading-[1.8] mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {/* Species badges — flex-wrap ensures no overflow on mobile */}
                  <div className="entity-tags mt-4">
                    {(dest.primarySpecies || []).map((speciesName) => {
                      const matched = destSpecies.find(
                        (s) => s.commonName.toLowerCase() === speciesName.toLowerCase()
                      );
                      const badge = (
                        <Badge key={speciesName} variant="forest" size="md">
                          <Fish className="h-3.5 w-3.5 mr-1.5" />
                          {speciesName}
                        </Badge>
                      );
                      return matched ? (
                        <Link key={speciesName} href={`/species/${matched.slug}`}>
                          {badge}
                        </Link>
                      ) : badge;
                    })}
                  </div>
                </div>
              </ScrollAnimation>

              {/* Map */}
              {mapMarkers.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                    Map
                  </h2>
                  <MapView
                    latitude={dest.latitude}
                    longitude={dest.longitude}
                    zoom={7}
                    markers={mapMarkers}
                    className="h-[450px] w-full rounded-xl overflow-hidden shadow-md"
                  />
                  <div className="mt-3 flex gap-4 text-xs text-[#A8B2BD]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-river" /> Rivers
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#E8923A]" /> Lodges
                    </span>
                  </div>
                </ScrollAnimation>
              )}

              {/* Rivers */}
              {destRivers.length > 0 && (
                <ScrollAnimation>
                  <div className="flex items-end justify-between mb-6">
                    <h2 className="font-heading text-2xl font-bold text-[#E8923A]">
                      Rivers & Waters
                    </h2>
                    <Link
                      href="/rivers"
                      className="text-sm text-[#E8923A] font-medium hover:text-[#E8923A] inline-flex items-center gap-1"
                    >
                      View All <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {destRivers.map((river) => (
                      <EntityCard
                        key={river.id}
                        href={`/rivers/${river.slug}`}
                        imageUrl={river.heroImageUrl}
                        imageAlt={river.name}
                        title={river.name}
                        subtitle={(river.primarySpecies || []).join(", ")}
                        meta={`${river.flowType} · ${river.difficulty}`}
                        badges={[river.wadingType]}
                      />
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Lodges */}
              {destLodges.length > 0 && (
                <ScrollAnimation>
                  <div className="flex items-end justify-between mb-6">
                    <h2 className="font-heading text-2xl font-bold text-[#E8923A]">
                      Lodges & Outfitters
                    </h2>
                    <Link
                      href="/lodges"
                      className="text-sm text-[#E8923A] font-medium hover:text-[#E8923A] inline-flex items-center gap-1"
                    >
                      View All <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {destLodges.map((lodge) => (
                      <EntityCard
                        key={lodge.id}
                        href={`/lodges/${lodge.slug}`}
                        imageUrl={lodge.heroImageUrl}
                        imageAlt={lodge.name}
                        title={lodge.name}
                        subtitle={lodge.priceRange}
                        meta={`${lodge.seasonStart}–${lodge.seasonEnd}`}
                      />
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Guides */}
              {destGuides.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-6">
                    Guides
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {destGuides.map((guide) => (
                      <Link
                        key={guide.id}
                        href={`/guides/${guide.slug}`}
                        className="flex items-center gap-4 p-4 bg-[#161B22] rounded-xl shadow-sm card-hover"
                      >
                        <div className="w-16 h-16 rounded-full bg-[#E8923A]/10 flex items-center justify-center shrink-0">
                          <MapPin className="h-6 w-6 text-[#E8923A]" />
                        </div>
                        <div>
                          <h3 className="font-heading text-base font-semibold text-[#E8923A]">
                            {guide.name}
                          </h3>
                          <p className="text-sm text-[#A8B2BD] mt-0.5">
                            {(guide.specialties || []).slice(0, 3).join(", ")}
                          </p>
                          {guide.dailyRate && (
                            <p className="text-sm font-medium text-[#E8923A] mt-1">
                              {guide.dailyRate}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Fly Shops */}
              {destFlyShops.length > 0 && (
                <ScrollAnimation>
                  <div className="flex items-end justify-between mb-6">
                    <h2 className="font-heading text-2xl font-bold text-[#E8923A]">
                      Fly Shops
                    </h2>
                    <Link
                      href="/fly-shops"
                      className="text-sm text-[#E8923A] font-medium hover:text-[#E8923A] inline-flex items-center gap-1"
                    >
                      View All <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {destFlyShops.slice(0, 6).map((shop) => (
                      <Link
                        key={shop.id}
                        href={`/fly-shops/${shop.slug}`}
                        className="flex items-center justify-between p-4 bg-[#161B22] rounded-xl shadow-sm card-hover"
                      >
                        <div>
                          <h3 className="font-heading text-base font-semibold text-[#E8923A]">
                            {shop.name}
                          </h3>
                          <p className="text-sm text-[#A8B2BD] mt-0.5">{shop.address}</p>
                          {(shop.services || []).length > 0 && (
                            <p className="text-xs text-[#6E7681] mt-1">
                              {(shop.services || []).slice(0, 3).join(" · ")}
                            </p>
                          )}
                        </div>
                        {shop.googleRating && (
                          <div className="flex items-center gap-1 shrink-0 ml-4">
                            <Star className="h-3.5 w-3.5 fill-[#E8923A] text-[#E8923A]" />
                            <span className="text-sm font-medium text-[#A8B2BD]">
                              {shop.googleRating}
                            </span>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Community Photos */}
              <CommunityPhotos entityType="destination" entityId={dest.id} />
              <PhotoSubmissionForm entityType="destination" entityId={dest.id} entityName={dest.name} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <QuickFacts facts={quickFacts} />

              {/* Best Months Calendar */}
              <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                <h3 className="font-heading text-lg font-semibold text-[#E8923A] mb-4">
                  Best Months
                </h3>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                  ].map((month) => {
                    const fullMonth = [
                      "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December",
                    ][[
                      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                    ].indexOf(month)];
                    const isGood = (dest.bestMonths || []).includes(fullMonth);
                    return (
                      <div
                        key={month}
                        className={`text-center py-2 rounded text-xs font-medium ${
                          isGood
                            ? "bg-[#E8923A] text-white"
                            : "bg-[#1F2937] text-[#6E7681]"
                        }`}
                      >
                        {month}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Related Articles */}
              {destArticles.length > 0 && (
                <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                  <h3 className="font-heading text-lg font-semibold text-[#E8923A] mb-4">
                    Related Articles
                  </h3>
                  <div className="space-y-3">
                    {destArticles.map((article) => (
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
