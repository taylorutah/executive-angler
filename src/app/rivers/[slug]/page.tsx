import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Fish, Waves, AlertTriangle } from "lucide-react";
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
import { rivers } from "@/data/rivers";
import { SITE_URL } from "@/lib/constants";
import {
  getAllRivers,
  getRiverBySlug,
  getDestinationById,
  getLodgesByRiver,
  getLodgesByDestination,
  getGuidesByRiver,
  getFlyShopsByDestination,
  getArticlesByRiver,
} from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const river = await getRiverBySlug(slug);
  if (!river) return { title: "River Not Found" };

  return {
    title: `${river.name} — Fly Fishing Guide`,
    description:
      river.metaDescription ||
      `Complete fly fishing guide to ${river.name}. Species: ${(river.primarySpecies || []).join(", ")}. ${river.flowType} river.`,
    openGraph: {
      title: `${river.name} Fly Fishing Guide`,
      description: river.metaDescription || river.description.substring(0, 160),
      images: [river.heroImageUrl],
    },
    alternates: {
      canonical: `${SITE_URL}/rivers/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  try {
    const allRivers = await getAllRivers();
    return allRivers.map((r) => ({ slug: r.slug }));
  } catch {
    return rivers.map((r) => ({ slug: r.slug }));
  }
}

export default async function RiverPage({ params }: Props) {
  const { slug } = await params;
  const river = await getRiverBySlug(slug);
  if (!river) notFound();

  const [dest, riverLodges, destLodges, nearbyGuides, destFlyShops, riverArticles] = await Promise.all([
    river.destinationId ? getDestinationById(river.destinationId) : Promise.resolve(undefined),
    getLodgesByRiver(river.id),
    river.destinationId ? getLodgesByDestination(river.destinationId) : Promise.resolve([]),
    getGuidesByRiver(river.id),
    river.destinationId ? getFlyShopsByDestination(river.destinationId) : Promise.resolve([]),
    getArticlesByRiver(river.id),
  ]);

  const nearbyLodges = riverLodges.length > 0 ? riverLodges : destLodges.slice(0, 4);
  const lodgesHeading = riverLodges.length > 0
    ? "Lodges on This River"
    : `Lodges in ${dest?.name ?? "This Area"}`;

  const mapMarkers = [
    ...(river.accessPoints || []).map((ap) => ({
      latitude: ap.latitude,
      longitude: ap.longitude,
      title: ap.name,
      description: ap.description || (ap.parking ? "Parking available" : ""),
      color: "#1B4332",
    })),
  ];

  const quickFacts = [
    ...(dest ? [{ label: "Destination", value: dest.name }] : []),
    ...(river.lengthMiles
      ? [{ label: "Length", value: `${river.lengthMiles} miles` }]
      : []),
    { label: "Type", value: river.flowType },
    { label: "Difficulty", value: river.difficulty },
    { label: "Wading", value: river.wadingType },
    { label: "Best Months", value: (river.bestMonths || []).join(", ") },
    { label: "Species", value: (river.primarySpecies || []).join(", ") },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Place",
          name: river.name,
          description: river.description,
          geo: {
            "@type": "GeoCoordinates",
            latitude: river.latitude,
            longitude: river.longitude,
          },
          image: river.heroImageUrl,
        }}
      />

      <HeroSection
        imageUrl={river.heroImageUrl}
        imageAlt={`${river.name} fly fishing`}
        title={river.name}
        subtitle={`${river.flowType} · ${(river.primarySpecies || []).join(", ")}`}
        height="h-[60vh]"
      />

      <div className="bg-[#0D1117]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <Breadcrumbs
              items={[
                { label: "Rivers", href: "/rivers" },
                ...(dest ? [{ label: dest.name, href: `/destinations/${dest.slug}` }] : []),
                { label: river.name },
              ]}
            />
            <FavoriteButton entityType="river" entityId={river.id} />
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
                <h2 className="font-heading text-2xl font-bold text-[#E8923A]-dark mb-4">
                  Overview
                </h2>
                {river.description.split("\n\n").map((p, i) => (
                  <p key={i} className="text-[#8B949E] leading-relaxed mb-4">
                    {p}
                  </p>
                ))}
                <div className="flex flex-wrap gap-2 mt-4">
                  {(river.primarySpecies || []).map((species) => (
                    <Badge key={species} variant="river" size="md">
                      <Fish className="h-3.5 w-3.5 mr-1.5" />
                      {species}
                    </Badge>
                  ))}
                </div>
              </ScrollAnimation>

              {/* Regulations */}
              {river.regulations && (
                <ScrollAnimation>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-heading text-lg font-semibold text-amber-900 mb-2">
                          Regulations
                        </h3>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          {river.regulations}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollAnimation>
              )}

              {/* Interactive Map */}
              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-bold text-[#E8923A]-dark mb-4">
                  Access Points & Map
                </h2>
                <MapView
                  latitude={river.latitude}
                  longitude={river.longitude}
                  zoom={9}
                  markers={mapMarkers}
                  bounds={river.mapBounds}
                  className="h-[450px] w-full rounded-xl overflow-hidden shadow-md"
                />
                {/* Access Point List */}
                <div className="mt-6 space-y-3">
                  {(river.accessPoints || []).map((ap, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 bg-[#161B22] rounded-xl shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#E8923A] text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-[#E8923A]-dark">
                          {ap.name}
                        </h4>
                        {ap.description && (
                          <p className="text-sm text-[#8B949E] mt-0.5">
                            {ap.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[#8B949E]">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {ap.latitude.toFixed(4)}, {ap.longitude.toFixed(4)}
                          </span>
                          {ap.parking && (
                            <span className="text-[#E8923A] font-medium">
                              Parking available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollAnimation>

              {/* Hatch Chart */}
              {river.hatchChart && river.hatchChart.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A]-dark mb-4">
                    Hatch Chart
                  </h2>
                  <div className="bg-[#161B22] rounded-xl shadow-sm border border-[#21262D] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#E8923A] text-white">
                            <th className="px-4 py-3 text-left font-semibold">
                              Month
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                              Insect
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                              Size
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                              Pattern
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {river.hatchChart.map((month) =>
                            month.hatches.map((hatch, hi) => (
                              <tr
                                key={`${month.month}-${hi}`}
                                className="border-b border-[#21262D] hover:bg-[#0D1117]/50"
                              >
                                {hi === 0 && (
                                  <td
                                    className="px-4 py-3 font-medium text-[#E8923A]-dark align-top"
                                    rowSpan={month.hatches.length}
                                  >
                                    {month.month}
                                  </td>
                                )}
                                <td className="px-4 py-3 text-[#8B949E]">
                                  {hatch.insect}
                                </td>
                                <td className="px-4 py-3 text-[#8B949E]">
                                  {hatch.size}
                                </td>
                                <td className="px-4 py-3 text-[#8B949E]">
                                  {hatch.pattern}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </ScrollAnimation>
              )}

              {/* Nearby Lodges */}
              {nearbyLodges.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A]-dark mb-6">
                    {lodgesHeading}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {nearbyLodges.slice(0, 6).map((lodge) => (
                      <EntityCard
                        key={lodge.id}
                        href={`/lodges/${lodge.slug}`}
                        imageUrl={lodge.heroImageUrl}
                        imageAlt={lodge.name}
                        title={lodge.name}
                        subtitle={lodge.priceRange}
                        meta={lodge.seasonStart && lodge.seasonEnd ? `${lodge.seasonStart}–${lodge.seasonEnd}` : undefined}
                      />
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Fly Shops Nearby */}
              {destFlyShops.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A]-dark mb-6">
                    Fly Shops Nearby
                  </h2>
                  <div className="space-y-3">
                    {destFlyShops.slice(0, 4).map((shop) => (
                      <Link
                        key={shop.id}
                        href={`/fly-shops/${shop.slug}`}
                        className="flex items-center gap-4 p-4 bg-[#161B22] rounded-xl shadow-sm card-hover"
                      >
                        <Waves className="h-5 w-5 text-river shrink-0" />
                        <div>
                          <h3 className="font-heading text-base font-semibold text-[#E8923A]-dark">
                            {shop.name}
                          </h3>
                          <p className="text-sm text-[#8B949E] mt-0.5">{shop.address}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Community Photos */}
              <CommunityPhotos entityType="river" entityId={river.id} />
              <PhotoSubmissionForm entityType="river" entityId={river.id} entityName={river.name} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <QuickFacts facts={quickFacts} />

              {/* Season Calendar */}
              <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                <h3 className="font-heading text-lg font-semibold text-[#E8923A]-dark mb-4">
                  Season
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
                    const isGood = (river.bestMonths || []).includes(fullMonth);
                    return (
                      <div
                        key={month}
                        className={`text-center py-2 rounded text-xs font-medium ${
                          isGood
                            ? "bg-river text-white"
                            : "bg-[#1F2937] text-[#484F58]"
                        }`}
                      >
                        {month}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Nearby Guides */}
              {nearbyGuides.length > 0 && (
                <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                  <h3 className="font-heading text-lg font-semibold text-[#E8923A]-dark mb-4">
                    Guides on This River
                  </h3>
                  <div className="space-y-3">
                    {nearbyGuides.map((guide) => (
                      <Link
                        key={guide.id}
                        href={`/guides/${guide.slug}`}
                        className="block p-3 rounded-lg hover:bg-[#0D1117] transition-colors"
                      >
                        <p className="text-sm font-medium text-[#E8923A]-dark">
                          {guide.name}
                        </p>
                        <p className="text-xs text-[#8B949E] mt-0.5">
                          {guide.dailyRate}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Articles */}
              {riverArticles.length > 0 && (
                <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                  <h3 className="font-heading text-lg font-semibold text-[#E8923A]-dark mb-4">
                    Reading for This River
                  </h3>
                  <div className="space-y-3">
                    {riverArticles.slice(0, 4).map((article) => (
                      <Link
                        key={article.id}
                        href={`/articles/${article.slug}`}
                        className="block p-3 rounded-lg hover:bg-[#0D1117] transition-colors"
                      >
                        <p className="text-sm font-medium text-[#E8923A]-dark">
                          {article.title}
                        </p>
                        <p className="text-xs text-[#8B949E] mt-1">
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
