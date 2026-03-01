import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Fish, MapPin, Droplets, Leaf, Bug } from "lucide-react";
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
import { species } from "@/data/species";
import { destinations } from "@/data/destinations";
import { rivers } from "@/data/rivers";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = species.find((s) => s.slug === slug);
  if (!sp) return { title: "Species Not Found" };

  return {
    title: `${sp.commonName} — Fly Fishing Species Guide`,
    description:
      sp.metaDescription ||
      `Complete fly fishing guide to ${sp.commonName} (${sp.scientificName || ""}). Habitat, preferred flies, tactics, and where to find them.`,
    openGraph: {
      title: `${sp.commonName} Fly Fishing Guide`,
      description:
        sp.metaDescription ||
        (sp.description ? sp.description.substring(0, 160) : `Fly fishing guide for ${sp.commonName}.`),
      images: sp.imageUrl ? [sp.imageUrl] : [],
    },
  };
}

export function generateStaticParams() {
  return species.map((s) => ({ slug: s.slug }));
}

function getConservationColor(status: string): "forest" | "gold" | "river" {
  const lower = status.toLowerCase();
  if (lower.includes("least concern")) return "forest";
  if (lower.includes("near threatened") || lower.includes("vulnerable"))
    return "gold";
  return "river";
}

export default async function SpeciesDetailPage({ params }: Props) {
  const { slug } = await params;
  const sp = species.find((s) => s.slug === slug);
  if (!sp) notFound();

  const relatedDests = sp.relatedDestinationIds
    ? destinations.filter((d) => sp.relatedDestinationIds.includes(d.id))
    : [];
  const relatedRivers = sp.relatedRiverIds
    ? rivers.filter((r) => sp.relatedRiverIds.includes(r.id))
    : [];

  const mapMarkers = sp.distributionCoordinates
    ? sp.distributionCoordinates.map((coord) => ({
        latitude: coord.latitude,
        longitude: coord.longitude,
        title: coord.name,
        description: `${sp.commonName} population`,
        color: "#1B4332",
      }))
    : [];

  const defaultCoords = sp.distributionCoordinates?.[0];

  const quickFacts = [
    ...(sp.scientificName
      ? [{ label: "Scientific Name", value: sp.scientificName }]
      : []),
    ...(sp.family ? [{ label: "Family", value: sp.family }] : []),
    ...(sp.averageSize
      ? [{ label: "Average Size", value: sp.averageSize }]
      : []),
    ...(sp.recordSize ? [{ label: "Record Size", value: sp.recordSize }] : []),
    ...(sp.lifespan ? [{ label: "Lifespan", value: sp.lifespan }] : []),
    ...(sp.waterTemperatureRange
      ? [{ label: "Water Temp Range", value: sp.waterTemperatureRange }]
      : []),
    ...(sp.nativeRange
      ? [{ label: "Native Range", value: sp.nativeRange }]
      : []),
    ...(sp.conservationStatus
      ? [{ label: "Conservation", value: sp.conservationStatus }]
      : []),
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Thing",
          name: sp.commonName,
          alternateName: sp.scientificName,
          description: sp.description,
          image: sp.imageUrl,
        }}
      />

      <HeroSection
        imageUrl={
          sp.imageUrl ||
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80"
        }
        imageAlt={`${sp.commonName} fly fishing`}
        title={sp.commonName}
        subtitle={sp.scientificName || undefined}
        height="h-[60vh]"
      />

      <div className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <Breadcrumbs
              items={[
                { label: "Species", href: "/species" },
                { label: sp.commonName },
              ]}
            />
            <FavoriteButton entityType="species" entityId={sp.id} />
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
                <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                  Overview
                </h2>
                {sp.description ? (
                  sp.description.split("\n\n").map((p, i) => (
                    <p key={i} className="text-slate-700 leading-relaxed mb-4">
                      {p}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-700 leading-relaxed">
                    Species profile for {sp.commonName}.
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  {sp.family && (
                    <Badge variant="forest" size="md">
                      <Fish className="h-3.5 w-3.5 mr-1.5" />
                      {sp.family}
                    </Badge>
                  )}
                  {sp.conservationStatus && (
                    <Badge
                      variant={getConservationColor(sp.conservationStatus)}
                      size="md"
                    >
                      <Leaf className="h-3.5 w-3.5 mr-1.5" />
                      {sp.conservationStatus}
                    </Badge>
                  )}
                </div>
              </ScrollAnimation>

              {/* Taxonomy */}
              {sp.taxonomy && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                    Taxonomy
                  </h2>
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                          Order
                        </p>
                        <p className="text-sm font-semibold text-forest-dark italic">
                          {sp.taxonomy.order}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                          Family
                        </p>
                        <p className="text-sm font-semibold text-forest-dark italic">
                          {sp.taxonomy.family}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                          Genus
                        </p>
                        <p className="text-sm font-semibold text-forest-dark italic">
                          {sp.taxonomy.genus}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                          Species
                        </p>
                        <p className="text-sm font-semibold text-forest-dark italic">
                          {sp.taxonomy.species}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollAnimation>
              )}

              {/* Habitat & Behavior */}
              {sp.preferredHabitat && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                    <Droplets className="inline h-6 w-6 mr-2 text-river" />
                    Habitat & Behavior
                  </h2>
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <p className="text-slate-700 leading-relaxed">
                      {sp.preferredHabitat}
                    </p>
                    {sp.nativeRange && (
                      <div className="mt-4 flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-forest mt-0.5 shrink-0" />
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-forest-dark">
                            Native Range:
                          </span>{" "}
                          {sp.nativeRange}
                        </p>
                      </div>
                    )}
                    {sp.introducedRange && (
                      <div className="mt-2 flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-forest-dark">
                            Introduced Range:
                          </span>{" "}
                          {sp.introducedRange}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollAnimation>
              )}

              {/* Diet */}
              {sp.diet && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                    <Bug className="inline h-6 w-6 mr-2 text-forest" />
                    Diet
                  </h2>
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <p className="text-slate-700 leading-relaxed">{sp.diet}</p>
                  </div>
                </ScrollAnimation>
              )}

              {/* Spawning */}
              {sp.spawningInfo && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                    Spawning
                  </h2>
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <p className="text-slate-700 leading-relaxed mb-4">
                      {sp.spawningInfo}
                    </p>
                    {sp.spawningMonths && sp.spawningMonths.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-500 mb-2">
                          Spawning Months
                        </p>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                          {[
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dec",
                          ].map((month) => {
                            const fullMonth = [
                              "January",
                              "February",
                              "March",
                              "April",
                              "May",
                              "June",
                              "July",
                              "August",
                              "September",
                              "October",
                              "November",
                              "December",
                            ][
                              [
                                "Jan",
                                "Feb",
                                "Mar",
                                "Apr",
                                "May",
                                "Jun",
                                "Jul",
                                "Aug",
                                "Sep",
                                "Oct",
                                "Nov",
                                "Dec",
                              ].indexOf(month)
                            ];
                            const isSpawning =
                              sp.spawningMonths!.includes(fullMonth) ||
                              sp.spawningMonths!.includes(month);
                            return (
                              <div
                                key={month}
                                className={`text-center py-2 rounded text-xs font-medium ${
                                  isSpawning
                                    ? "bg-gold/20 text-gold font-semibold"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {month}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {sp.spawningTempF && (
                      <p className="mt-3 text-sm text-slate-500">
                        Spawning Temperature:{" "}
                        <span className="font-medium text-slate-700">
                          {sp.spawningTempF}
                        </span>
                      </p>
                    )}
                  </div>
                </ScrollAnimation>
              )}

              {/* Conservation Status */}
              {sp.conservationStatus && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                    Conservation Status
                  </h2>
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <Leaf className="h-5 w-5 text-forest" />
                      <Badge
                        variant={getConservationColor(sp.conservationStatus)}
                        size="md"
                      >
                        {sp.conservationStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      The {sp.commonName} is currently classified as{" "}
                      <strong>{sp.conservationStatus}</strong>. Responsible
                      catch-and-release practices help protect populations for
                      future generations of anglers.
                    </p>
                  </div>
                </ScrollAnimation>
              )}

              {/* Fly Fishing Tips */}
              {(sp.flyFishingTips || sp.tackleRecommendations) && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                    <Fish className="inline h-6 w-6 mr-2 text-river" />
                    Fly Fishing Tips
                  </h2>
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                    {sp.flyFishingTips && (
                      <p className="text-slate-700 leading-relaxed">
                        {sp.flyFishingTips}
                      </p>
                    )}
                    {sp.tackleRecommendations && (
                      <div className="border-t border-slate-100 pt-4">
                        <h4 className="text-sm font-semibold text-forest-dark mb-2">
                          Tackle Recommendations
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {sp.tackleRecommendations}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollAnimation>
              )}

              {/* Distribution Map */}
              {defaultCoords && mapMarkers.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                    Distribution Map
                  </h2>
                  <MapView
                    latitude={defaultCoords.latitude}
                    longitude={defaultCoords.longitude}
                    zoom={4}
                    markers={mapMarkers}
                    className="h-[450px] w-full rounded-xl overflow-hidden shadow-md"
                  />
                </ScrollAnimation>
              )}

              {/* Recommended Fly Patterns */}
              {sp.preferredFlies.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mb-6">
                    <Bug className="inline h-6 w-6 mr-2 text-forest" />
                    Recommended Fly Patterns
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sp.preferredFlies.map((fly, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-100"
                      >
                        <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                          <Fish className="h-4 w-4 text-forest" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {fly}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Related Destinations */}
              {relatedDests.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mb-6">
                    Where to Find {sp.commonName}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {relatedDests.map((dest) => (
                      <EntityCard
                        key={dest.id}
                        href={`/destinations/${dest.slug}`}
                        imageUrl={dest.heroImageUrl}
                        imageAlt={`Fly fishing in ${dest.name}`}
                        title={dest.name}
                        subtitle={dest.tagline}
                        meta={dest.region}
                      />
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Related Rivers */}
              {relatedRivers.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mb-6">
                    Rivers with {sp.commonName}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {relatedRivers.map((river) => (
                      <EntityCard
                        key={river.id}
                        href={`/rivers/${river.slug}`}
                        imageUrl={river.heroImageUrl}
                        imageAlt={`${river.name} fly fishing`}
                        title={river.name}
                        subtitle={river.flowType}
                        meta={river.primarySpecies.slice(0, 3).join(" · ")}
                      />
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Community Photos */}
              <CommunityPhotos entityType="species" entityId={sp.id} />
              <PhotoSubmissionForm entityType="species" entityId={sp.id} entityName={sp.commonName} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <QuickFacts facts={quickFacts} />

              {/* Fun Facts */}
              {sp.funFacts && sp.funFacts.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-heading text-lg font-semibold text-forest-dark mb-4">
                    Fun Facts
                  </h3>
                  <ul className="space-y-3">
                    {sp.funFacts.map((fact, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Fish className="h-3 w-3 text-gold" />
                        </span>
                        <span className="text-sm text-slate-700 leading-relaxed">
                          {fact}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Where to Find */}
              {relatedDests.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-heading text-lg font-semibold text-forest-dark mb-4">
                    Where to Find
                  </h3>
                  <div className="space-y-3">
                    {relatedDests.map((dest) => (
                      <Link
                        key={dest.id}
                        href={`/destinations/${dest.slug}`}
                        className="block p-3 rounded-lg hover:bg-cream transition-colors"
                      >
                        <p className="text-sm font-medium text-forest-dark flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-forest" />
                          {dest.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 ml-5">
                          {dest.region}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferred Size & Record */}
              {(sp.averageSize || sp.recordSize) && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-heading text-lg font-semibold text-forest-dark mb-4">
                    Size Reference
                  </h3>
                  {sp.averageSize && (
                    <div className="mb-3 pb-3 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                        Average Size
                      </p>
                      <p className="text-sm font-medium text-slate-800">
                        {sp.averageSize}
                      </p>
                    </div>
                  )}
                  {sp.recordSize && (
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                        World Record
                      </p>
                      <p className="text-sm font-medium text-slate-800">
                        {sp.recordSize}
                      </p>
                    </div>
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
