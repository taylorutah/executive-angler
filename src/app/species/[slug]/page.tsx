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
import HeroImageEditor from "@/components/admin/HeroImageEditor";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { SITE_URL } from "@/lib/constants";
import {
  getAllSpecies,
  getSpeciesBySlug,
  getDestinationsByIds,
  getRiversByIds,
  getFliesByEffectiveSpecies,
} from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await getSpeciesBySlug(slug);
  if (!sp) return { title: "Species Not Found" };

  const sizeStr = sp.averageSize ? `Avg size: ${sp.averageSize}. ` : "";
  const flyCount = (sp.preferredFlies || []).length;
  const destCount = (sp.relatedDestinationIds || []).length;
  const habitatStr = sp.preferredHabitat ? sp.preferredHabitat.split(".")[0] + ". " : "";
  const fallbackTitle = `${sp.commonName} — Fly Fishing Guide: Best Flies, Tactics & Waters | Executive Angler`;
  const fallbackDesc = `${sp.commonName} fly fishing guide. ${sizeStr}${habitatStr}${flyCount > 0 ? `${flyCount} proven fly patterns. ` : ""}${destCount > 0 ? `${destCount} top destinations. ` : ""}Tactics, gear & where to catch them.`;

  return {
    title: sp.metaTitle || fallbackTitle,
    description:
      sp.metaDescription || fallbackDesc,
    openGraph: {
      title: sp.metaTitle || `${sp.commonName} Fly Fishing Guide`,
      description:
        sp.metaDescription ||
        (sp.description ? sp.description.substring(0, 160) : `Fly fishing guide for ${sp.commonName}.`),
      images: [
        sp.imageUrl ||
          `${SITE_URL}/api/og?title=${encodeURIComponent(sp.commonName)}&subtitle=${encodeURIComponent("Fly Fishing Species Guide")}&type=species`,
      ],
    },
    alternates: {
      canonical: `${SITE_URL}/species/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const allSpecies = await getAllSpecies();
  return allSpecies.map((s) => ({ slug: s.slug }));
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
  const sp = await getSpeciesBySlug(slug);
  if (!sp) notFound();

  // Check if current user is admin (for hero image editor)
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const userIsAdmin = isAdmin(currentUser?.email);

  const [relatedDests, relatedRivers, speciesFlies] = await Promise.all([
    sp.relatedDestinationIds ? getDestinationsByIds(sp.relatedDestinationIds) : Promise.resolve([]),
    sp.relatedRiverIds ? getRiversByIds(sp.relatedRiverIds) : Promise.resolve([]),
    getFliesByEffectiveSpecies(sp.commonName),
  ]);

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
          url: `${SITE_URL}/species/${slug}`,
          ...(sp.scientificName
            ? {
                sameAs: `https://en.wikipedia.org/wiki/${encodeURIComponent(sp.scientificName.replace(/ /g, "_"))}`,
              }
            : {}),
          ...(sp.conservationStatus
            ? { additionalProperty: { "@type": "PropertyValue", name: "Conservation Status", value: sp.conservationStatus } }
            : {}),
        }}
      />

      <div className="relative">
        <HeroSection
          imageUrl={
            sp.imageUrl ||
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80"
          }
          imageAlt={sp.heroImageAlt || `${sp.commonName} fly fishing`}
          title={sp.commonName}
          subtitle={sp.scientificName || undefined}
          height="h-[60vh]"
          imageContain={true}
        />
        {userIsAdmin && (
          <div className="absolute top-4 right-4 z-20">
            <HeroImageEditor
              entityType="species"
              entityId={sp.id}
              currentImageUrl={sp.imageUrl || ""}
              currentAlt={sp.heroImageAlt}
              currentCredit={sp.heroImageCredit}
              currentCreditUrl={sp.heroImageCreditUrl}
            />
          </div>
        )}
      </div>

      <div className="bg-[#0D1117]">
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

      <section className="bg-[#0D1117] pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                  Overview
                </h2>
                {sp.description ? (
                  sp.description.split("\n\n").map((p, i) => (
                    <p key={i} className="text-[#A8B2BD] leading-relaxed mb-4">
                      {p}
                    </p>
                  ))
                ) : (
                  <p className="text-[#A8B2BD] leading-relaxed">
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
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                    Taxonomy
                  </h2>
                  <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs font-medium text-[#6E7681] uppercase tracking-wider mb-1">
                          Order
                        </p>
                        <p className="text-sm font-semibold text-[#E8923A] italic">
                          {sp.taxonomy.order}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#6E7681] uppercase tracking-wider mb-1">
                          Family
                        </p>
                        <p className="text-sm font-semibold text-[#E8923A] italic">
                          {sp.taxonomy.family}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#6E7681] uppercase tracking-wider mb-1">
                          Genus
                        </p>
                        <p className="text-sm font-semibold text-[#E8923A] italic">
                          {sp.taxonomy.genus}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#6E7681] uppercase tracking-wider mb-1">
                          Species
                        </p>
                        <p className="text-sm font-semibold text-[#E8923A] italic">
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
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                    <Droplets className="inline h-6 w-6 mr-2 text-river" />
                    Habitat & Behavior
                  </h2>
                  <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                    <p className="text-[#A8B2BD] leading-relaxed">
                      {sp.preferredHabitat}
                    </p>
                    {sp.nativeRange && (
                      <div className="mt-4 flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-[#E8923A] mt-0.5 shrink-0" />
                        <p className="text-sm text-[#A8B2BD]">
                          <span className="font-medium text-[#E8923A]">
                            Native Range:
                          </span>{" "}
                          {sp.nativeRange}
                        </p>
                      </div>
                    )}
                    {sp.introducedRange && (
                      <div className="mt-2 flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-[#6E7681] mt-0.5 shrink-0" />
                        <p className="text-sm text-[#A8B2BD]">
                          <span className="font-medium text-[#E8923A]">
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
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                    <Bug className="inline h-6 w-6 mr-2 text-[#E8923A]" />
                    Diet
                  </h2>
                  <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                    <p className="text-[#A8B2BD] leading-relaxed">{sp.diet}</p>
                  </div>
                </ScrollAnimation>
              )}

              {/* Spawning */}
              {sp.spawningInfo && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                    Spawning
                  </h2>
                  <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                    <p className="text-[#A8B2BD] leading-relaxed mb-4">
                      {sp.spawningInfo}
                    </p>
                    {sp.spawningMonths && sp.spawningMonths.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-[#A8B2BD] mb-2">
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
                                    ? "bg-[#E8923A]/20 text-[#E8923A] font-semibold"
                                    : "bg-[#1F2937] text-[#6E7681]"
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
                      <p className="mt-3 text-sm text-[#A8B2BD]">
                        Spawning Temperature:{" "}
                        <span className="font-medium text-[#A8B2BD]">
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
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                    Conservation Status
                  </h2>
                  <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <Leaf className="h-5 w-5 text-[#E8923A]" />
                      <Badge
                        variant={getConservationColor(sp.conservationStatus)}
                        size="md"
                      >
                        {sp.conservationStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#A8B2BD] leading-relaxed">
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
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                    <Fish className="inline h-6 w-6 mr-2 text-river" />
                    Fly Fishing Tips
                  </h2>
                  <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm space-y-4">
                    {sp.flyFishingTips && (
                      <p className="text-[#A8B2BD] leading-relaxed">
                        {sp.flyFishingTips}
                      </p>
                    )}
                    {sp.tackleRecommendations && (
                      <div className="border-t border-[#21262D] pt-4">
                        <h4 className="text-sm font-semibold text-[#E8923A] mb-2">
                          Tackle Recommendations
                        </h4>
                        <p className="text-sm text-[#A8B2BD] leading-relaxed">
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
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
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
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-6">
                    <Bug className="inline h-6 w-6 mr-2 text-[#E8923A]" />
                    Recommended Fly Patterns
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sp.preferredFlies.map((fly, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 bg-[#161B22] rounded-xl shadow-sm border border-[#21262D]"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#E8923A]/10 flex items-center justify-center shrink-0">
                          <Fish className="h-4 w-4 text-[#E8923A]" />
                        </div>
                        <span className="text-sm font-medium text-[#A8B2BD]">
                          {fly}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Proven Fly Patterns (from canonical_flies) */}
              {speciesFlies.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-6">
                    Proven Fly Patterns for {sp.commonName}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {speciesFlies.slice(0, 8).map((fly) => (
                      <EntityCard
                        key={fly.id}
                        href={`/flies/${fly.slug}`}
                        imageUrl={fly.heroImageUrl || ""}
                        imageAlt={fly.name}
                        title={fly.name}
                        subtitle={fly.category.charAt(0).toUpperCase() + fly.category.slice(1)}
                        meta={(fly.imitates || []).slice(0, 3).join(" · ") || undefined}
                        iconOnly={!fly.heroImageUrl}
                      />
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Related Destinations */}
              {relatedDests.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-6">
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
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-6">
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

              {/* FAQ Section */}
              {(() => {
                const faqs: { question: string; answer: string }[] = [];
                if (sp.preferredHabitat)
                  faqs.push({
                    question: `Where do ${sp.commonName} live?`,
                    answer: sp.preferredHabitat,
                  });
                if (sp.diet)
                  faqs.push({
                    question: `What do ${sp.commonName} eat?`,
                    answer: sp.diet,
                  });
                if (sp.averageSize)
                  faqs.push({
                    question: `How big do ${sp.commonName} get?`,
                    answer: `${sp.commonName} average ${sp.averageSize}.${sp.recordSize ? ` The world record is ${sp.recordSize}.` : ""}`,
                  });
                if (sp.flyFishingTips)
                  faqs.push({
                    question: `How do you fly fish for ${sp.commonName}?`,
                    answer: sp.flyFishingTips,
                  });
                if (sp.tackleRecommendations)
                  faqs.push({
                    question: `What tackle do you need for ${sp.commonName}?`,
                    answer: sp.tackleRecommendations,
                  });
                if (sp.spawningInfo)
                  faqs.push({
                    question: `When do ${sp.commonName} spawn?`,
                    answer: `${sp.spawningInfo}${sp.spawningTempF ? ` Optimal spawning temperature: ${sp.spawningTempF}.` : ""}`,
                  });
                if (sp.conservationStatus)
                  faqs.push({
                    question: `What is the conservation status of ${sp.commonName}?`,
                    answer: `${sp.commonName} are currently classified as ${sp.conservationStatus}. Responsible catch-and-release practices help protect populations for future generations.`,
                  });
                if (sp.waterTemperatureRange)
                  faqs.push({
                    question: `What water temperature do ${sp.commonName} prefer?`,
                    answer: `${sp.commonName} thrive in water temperatures of ${sp.waterTemperatureRange}.`,
                  });

                if (faqs.length === 0) return null;
                return (
                  <ScrollAnimation>
                    <script
                      type="application/ld+json"
                      dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                          "@context": "https://schema.org",
                          "@type": "FAQPage",
                          mainEntity: faqs.map((faq) => ({
                            "@type": "Question",
                            name: faq.question,
                            acceptedAnswer: {
                              "@type": "Answer",
                              text: faq.answer,
                            },
                          })),
                        }),
                      }}
                    />
                    <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-6">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                      {faqs.map((faq, i) => (
                        <details
                          key={i}
                          className="group bg-[#161B22] rounded-xl border border-[#21262D] shadow-sm"
                          {...(i === 0 ? { open: true } : {})}
                        >
                          <summary className="flex items-center justify-between p-5 cursor-pointer list-none text-[#F0F6FC] font-medium text-sm hover:text-[#E8923A] transition-colors">
                            {faq.question}
                            <span className="text-[#6E7681] group-open:rotate-180 transition-transform ml-4 shrink-0">
                              ▾
                            </span>
                          </summary>
                          <div className="px-5 pb-5 pt-0 text-sm text-[#A8B2BD] leading-relaxed">
                            {faq.answer}
                          </div>
                        </details>
                      ))}
                    </div>
                  </ScrollAnimation>
                );
              })()}

              {/* Community Photos */}
              <CommunityPhotos entityType="species" entityId={sp.id} />
              <PhotoSubmissionForm entityType="species" entityId={sp.id} entityName={sp.commonName} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <QuickFacts facts={quickFacts} />

              {/* Fun Facts */}
              {sp.funFacts && sp.funFacts.length > 0 && (
                <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                  <h3 className="font-heading text-lg font-semibold text-[#E8923A] mb-4">
                    Fun Facts
                  </h3>
                  <ul className="space-y-3">
                    {sp.funFacts.map((fact, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#E8923A]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Fish className="h-3 w-3 text-[#E8923A]" />
                        </span>
                        <span className="text-sm text-[#A8B2BD] leading-relaxed">
                          {fact}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Where to Find */}
              {relatedDests.length > 0 && (
                <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                  <h3 className="font-heading text-lg font-semibold text-[#E8923A] mb-4">
                    Where to Find
                  </h3>
                  <div className="space-y-3">
                    {relatedDests.map((dest) => (
                      <Link
                        key={dest.id}
                        href={`/destinations/${dest.slug}`}
                        className="block p-3 rounded-lg hover:bg-[#0D1117] transition-colors"
                      >
                        <p className="text-sm font-medium text-[#E8923A] flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-[#E8923A]" />
                          {dest.name}
                        </p>
                        <p className="text-xs text-[#A8B2BD] mt-0.5 ml-5">
                          {dest.region}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferred Size & Record */}
              {(sp.averageSize || sp.recordSize) && (
                <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                  <h3 className="font-heading text-lg font-semibold text-[#E8923A] mb-4">
                    Size Reference
                  </h3>
                  {sp.averageSize && (
                    <div className="mb-3 pb-3 border-b border-[#21262D]">
                      <p className="text-xs font-medium text-[#6E7681] uppercase tracking-wider mb-1">
                        Average Size
                      </p>
                      <p className="text-sm font-medium text-[#F0F6FC]">
                        {sp.averageSize}
                      </p>
                    </div>
                  )}
                  {sp.recordSize && (
                    <div>
                      <p className="text-xs font-medium text-[#6E7681] uppercase tracking-wider mb-1">
                        World Record
                      </p>
                      <p className="text-sm font-medium text-[#F0F6FC]">
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
