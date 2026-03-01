import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, Fish, ArrowRight } from "lucide-react";
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
import { destinations } from "@/data/destinations";
import { rivers } from "@/data/rivers";
import { lodges } from "@/data/lodges";
import { guides } from "@/data/guides";
import { articles } from "@/data/articles";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = destinations.find((d) => d.slug === slug);
  if (!dest) return { title: "Destination Not Found" };

  return {
    title: `${dest.name} Fly Fishing — Destinations`,
    description:
      dest.metaDescription ||
      `Explore fly fishing in ${dest.name}. ${dest.tagline}`,
    openGraph: {
      title: `${dest.name} Fly Fishing`,
      description: dest.metaDescription || dest.tagline,
      images: [dest.heroImageUrl],
    },
  };
}

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const dest = destinations.find((d) => d.slug === slug);
  if (!dest) notFound();

  const destRivers = rivers.filter((r) => r.destinationId === dest.id);
  const destLodges = lodges.filter((l) => l.destinationId === dest.id);
  const destGuides = guides.filter((g) => g.destinationId === dest.id);
  const destArticles = articles.filter((a) =>
    a.relatedDestinationIds.includes(dest.id)
  );

  const mapMarkers = [
    ...destRivers.map((r) => ({
      latitude: r.latitude,
      longitude: r.longitude,
      title: r.name,
      description: `${r.flowType} · ${r.primarySpecies.join(", ")}`,
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
    { label: "Best Months", value: dest.bestMonths.join(", ") },
    { label: "Primary Species", value: dest.primarySpecies.join(", ") },
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
          "@type": "TouristDestination",
          name: `${dest.name} Fly Fishing`,
          description: dest.description,
          geo: {
            "@type": "GeoCoordinates",
            latitude: dest.latitude,
            longitude: dest.longitude,
          },
          image: dest.heroImageUrl,
        }}
      />

      <HeroSection
        imageUrl={dest.heroImageUrl}
        imageAlt={`Fly fishing in ${dest.name}`}
        title={dest.name}
        subtitle={dest.tagline}
        height="h-[65vh]"
      />

      <div className="bg-cream">
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

      <section className="bg-cream pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              <ScrollAnimation>
                <div className="prose max-w-none">
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                    Overview
                  </h2>
                  {dest.description.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="text-slate-700 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </ScrollAnimation>

              {/* Species */}
              <ScrollAnimation>
                <div className="flex flex-wrap gap-2">
                  {dest.primarySpecies.map((species) => (
                    <Badge key={species} variant="forest" size="md">
                      <Fish className="h-3.5 w-3.5 mr-1.5" />
                      {species}
                    </Badge>
                  ))}
                </div>
              </ScrollAnimation>

              {/* Map */}
              {mapMarkers.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                    Map
                  </h2>
                  <MapView
                    latitude={dest.latitude}
                    longitude={dest.longitude}
                    zoom={7}
                    markers={mapMarkers}
                    className="h-[450px] w-full rounded-xl overflow-hidden shadow-md"
                  />
                  <div className="mt-3 flex gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-river" /> Rivers
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-gold" /> Lodges
                    </span>
                  </div>
                </ScrollAnimation>
              )}

              {/* Rivers */}
              {destRivers.length > 0 && (
                <ScrollAnimation>
                  <div className="flex items-end justify-between mb-6">
                    <h2 className="font-heading text-2xl font-bold text-forest-dark">
                      Rivers & Waters
                    </h2>
                    <Link
                      href="/rivers"
                      className="text-sm text-forest font-medium hover:text-forest-dark inline-flex items-center gap-1"
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
                        subtitle={river.primarySpecies.join(", ")}
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
                    <h2 className="font-heading text-2xl font-bold text-forest-dark">
                      Lodges & Outfitters
                    </h2>
                    <Link
                      href="/lodges"
                      className="text-sm text-forest font-medium hover:text-forest-dark inline-flex items-center gap-1"
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
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mb-6">
                    Guides
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {destGuides.map((guide) => (
                      <Link
                        key={guide.id}
                        href={`/guides/${guide.slug}`}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm card-hover"
                      >
                        <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                          <MapPin className="h-6 w-6 text-forest" />
                        </div>
                        <div>
                          <h3 className="font-heading text-base font-semibold text-forest-dark">
                            {guide.name}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {guide.specialties.slice(0, 3).join(", ")}
                          </p>
                          {guide.dailyRate && (
                            <p className="text-sm font-medium text-forest mt-1">
                              {guide.dailyRate}
                            </p>
                          )}
                        </div>
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
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-heading text-lg font-semibold text-forest-dark mb-4">
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
                    const isGood = dest.bestMonths.includes(fullMonth);
                    return (
                      <div
                        key={month}
                        className={`text-center py-2 rounded text-xs font-medium ${
                          isGood
                            ? "bg-forest text-white"
                            : "bg-slate-100 text-slate-400"
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
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-heading text-lg font-semibold text-forest-dark mb-4">
                    Related Articles
                  </h3>
                  <div className="space-y-3">
                    {destArticles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/articles/${article.slug}`}
                        className="block p-3 rounded-lg hover:bg-cream transition-colors"
                      >
                        <p className="text-sm font-medium text-forest-dark">
                          {article.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
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
