import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Fish, MapPin, Droplets, Leaf, Bug, ChevronDown } from "@/icons";
import HeroSection from "@/components/ui/HeroSection";
import HeroCompact from "@/components/ui/HeroCompact";
import EntityChrome from "@/components/ui/EntityChrome";
import QuickFacts from "@/components/ui/QuickFacts";
import EntityCard from "@/components/ui/EntityCard";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import Badge from "@/components/ui/Badge";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import MapView from "@/components/maps/DynamicMapView";
import CommunityPhotos from "@/components/ui/CommunityPhotos";
import PhotoSubmissionForm from "@/components/ui/PhotoSubmissionForm";
import AdminHeroEditor from "@/components/admin/AdminHeroEditor";
import { getHeroHeight } from "@/lib/hero-height";
import type { HeroTier } from "@/lib/hero-height";
import { SITE_URL } from "@/lib/constants";
import {
  getAllSpecies,
  getSpeciesBySlug,
  getDestinationsByIds,
  getRiversByIds,
  getFliesByEffectiveSpecies,
  getApprovedPhotosByEntity,
  getPublishedMediaAsset,
} from "@/lib/db";
import { attributionHref, formatAttribution } from "@/lib/media/licence";

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
    title: { absolute: sp.metaTitle || fallbackTitle },
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

  const heroTier: HeroTier = "anonymous";
  const heroHeight = getHeroHeight("species", heroTier);

  const [relatedDests, relatedRivers, speciesFlies, galleryPhotos, mediaAsset] = await Promise.all([
    sp.relatedDestinationIds ? getDestinationsByIds(sp.relatedDestinationIds) : Promise.resolve([]),
    sp.relatedRiverIds ? getRiversByIds(sp.relatedRiverIds) : Promise.resolve([]),
    getFliesByEffectiveSpecies(sp.commonName),
    getApprovedPhotosByEntity("species", sp.id),
    getPublishedMediaAsset("species", sp.id, "image_url"),
  ]);

  const imageCredit = mediaAsset
    ? formatAttribution({
        creditName: mediaAsset.creditName,
        licence: mediaAsset.licence,
      }) || sp.heroImageCredit
    : sp.heroImageCredit;
  const imageCreditUrl = mediaAsset
    ? attributionHref({
        creditUrl: mediaAsset.creditUrl,
        licenceUrl: mediaAsset.licenceUrl,
        licence: mediaAsset.licence,
      }) || sp.heroImageCreditUrl
    : sp.heroImageCreditUrl;

  const mapMarkers = sp.distributionCoordinates
    ? sp.distributionCoordinates.map((coord) => ({
        latitude: coord.latitude,
        longitude: coord.longitude,
        title: coord.name,
        description: `${sp.commonName} population`,
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

      {heroTier === "anonymous" ? (
        <div className="relative">
          <HeroSection
            imageUrl={sp.imageUrl}
            imageAlt={sp.heroImageAlt || `${sp.commonName} fly fishing`}
            title={sp.commonName}
            subtitle={sp.scientificName || undefined}
            height={heroHeight}
            imageContain={true}
            imageCredit={imageCredit}
            imageCreditUrl={imageCreditUrl}
          />
          {true && (
            <div className="absolute top-4 right-4 z-20">
              <AdminHeroEditor
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
      ) : (
        <div className="bg-[var(--paper)] pt-6">
          <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
            <HeroCompact
              heroImageUrl={sp.imageUrl}
              heroImageAlt={sp.heroImageAlt || `${sp.commonName} fly fishing`}
              heroImageCredit={imageCredit}
              title={sp.commonName}
              subtitle={sp.scientificName || undefined}
              chips={[
                ...(sp.family ? [sp.family] : []),
                ...(sp.averageSize ? [sp.averageSize] : []),
              ]}
              galleryPhotos={galleryPhotos}
              imageContain={true}
            >
              {true && (
                <AdminHeroEditor
                  entityType="species"
                  entityId={sp.id}
                  currentImageUrl={sp.imageUrl || ""}
                  currentAlt={sp.heroImageAlt}
                  currentCredit={sp.heroImageCredit}
                  currentCreditUrl={sp.heroImageCreditUrl}
                />
              )}
            </HeroCompact>
          </div>
        </div>
      )}

      <EntityChrome
        items={[
          { label: "Species", href: "/species" },
          { label: sp.commonName },
        ]}
        actions={<FavoriteButton entityType="species" entityId={sp.id} />}
      />

      <section className="bg-[var(--paper)] pb-24">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              <ScrollAnimation>
                <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                  Overview
                </h2>
                {sp.description ? (
                  sp.description.split("\n\n").map((p, i) => (
                    <p key={i} className="text-[var(--text-2)] leading-relaxed mb-4">
                      {p}
                    </p>
                  ))
                ) : (
                  <p className="text-[var(--text-2)] leading-relaxed">
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
                  <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                    Taxonomy
                  </h2>
                  <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="ea-overline mb-1">
                          Order
                        </p>
                        <p className="text-sm font-medium italic text-[var(--text-1)]">
                          {sp.taxonomy.order}
                        </p>
                      </div>
                      <div>
                        <p className="ea-overline mb-1">
                          Family
                        </p>
                        <p className="text-sm font-medium italic text-[var(--text-1)]">
                          {sp.taxonomy.family}
                        </p>
                      </div>
                      <div>
                        <p className="ea-overline mb-1">
                          Genus
                        </p>
                        <p className="text-sm font-medium italic text-[var(--text-1)]">
                          {sp.taxonomy.genus}
                        </p>
                      </div>
                      <div>
                        <p className="ea-overline mb-1">
                          Species
                        </p>
                        <p className="text-sm font-medium italic text-[var(--text-1)]">
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
                  <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                    <Droplets className="inline h-6 w-6 mr-2 text-[var(--text-3)]" />
                    Habitat & Behavior
                  </h2>
                  <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
                    <p className="text-[var(--text-2)] leading-relaxed">
                      {sp.preferredHabitat}
                    </p>
                    {sp.nativeRange && (
                      <div className="mt-4 flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-[var(--text-3)] mt-0.5 shrink-0" />
                        <p className="text-sm text-[var(--text-2)]">
                          <span className="font-medium text-[var(--text-1)]">
                            Native Range:
                          </span>{" "}
                          {sp.nativeRange}
                        </p>
                      </div>
                    )}
                    {sp.introducedRange && (
                      <div className="mt-2 flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-[var(--text-3)] mt-0.5 shrink-0" />
                        <p className="text-sm text-[var(--text-2)]">
                          <span className="font-medium text-[var(--text-1)]">
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
                  <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                    <Bug className="inline h-6 w-6 mr-2 text-[var(--text-3)]" />
                    Diet
                  </h2>
                  <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
                    <p className="text-[var(--text-2)] leading-relaxed">{sp.diet}</p>
                  </div>
                </ScrollAnimation>
              )}

              {/* Spawning */}
              {sp.spawningInfo && (
                <ScrollAnimation>
                  <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                    Spawning
                  </h2>
                  <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
                    <p className="text-[var(--text-2)] leading-relaxed mb-4">
                      {sp.spawningInfo}
                    </p>
                    {sp.spawningMonths && sp.spawningMonths.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-[var(--text-2)] mb-2">
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
                                className={`text-center py-2 rounded-[var(--radius-sm)] text-xs font-medium ${
                                  isSpawning
                                    ? "bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                                    : "bg-[var(--paper-deep)] text-[var(--text-3)]"
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
                      <p className="mt-3 text-sm text-[var(--text-2)]">
                        Spawning Temperature:{" "}
                        <span className="font-medium text-[var(--text-2)]">
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
                  <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                    Conservation Status
                  </h2>
                  <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Leaf className="h-5 w-5 text-[var(--text-3)]" />
                      <Badge
                        variant={getConservationColor(sp.conservationStatus)}
                        size="md"
                      >
                        {sp.conservationStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--text-2)] leading-relaxed">
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
                  <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                    <Fish className="inline h-6 w-6 mr-2 text-[var(--text-3)]" />
                    Fly Fishing Tips
                  </h2>
                  <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
                    {sp.flyFishingTips && (
                      <p className="text-[var(--text-2)] leading-relaxed">
                        {sp.flyFishingTips}
                      </p>
                    )}
                    {sp.tackleRecommendations && (
                      <div className="border-t border-[var(--border)] pt-4">
                        <h4 className="mb-2 text-sm font-semibold text-[var(--text-1)]">
                          Tackle Recommendations
                        </h4>
                        <p className="text-sm text-[var(--text-2)] leading-relaxed">
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
                  <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                    Distribution Map
                  </h2>
                  <MapView
                    latitude={defaultCoords.latitude}
                    longitude={defaultCoords.longitude}
                    zoom={4}
                    markers={mapMarkers}
                    tone="desk"
                    className="h-[450px] w-full overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)]"
                  />
                </ScrollAnimation>
              )}

              {/* Recommended Fly Patterns */}
              {sp.preferredFlies.length > 0 && (
                <ScrollAnimation>
                  <h2 className="mb-6 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                    <Bug className="inline h-6 w-6 mr-2 text-[var(--text-3)]" />
                    Recommended Fly Patterns
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sp.preferredFlies.map((fly, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4"
                      >
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                          <Fish className="h-4 w-4 text-[var(--accent)]" />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-1)]">
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
                  <h2 className="mb-6 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
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
                  <h2 className="mb-6 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
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
                  <h2 className="mb-6 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
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
                    <h2 className="mb-6 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                      {faqs.map((faq, i) => (
                        <details
                          key={i}
                          className="group rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]"
                          {...(i === 0 ? { open: true } : {})}
                        >
                          <summary className="flex items-center justify-between p-5 cursor-pointer list-none text-sm font-medium text-[var(--text-1)] hover:text-[var(--accent)] transition-colors">
                            {faq.question}
                            <ChevronDown className="ml-4 h-4 w-4 shrink-0 text-[var(--text-3)] transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="px-5 pb-5 pt-0 text-sm text-[var(--text-2)] leading-relaxed">
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
                <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
                  <h3 className="mb-4 font-heading text-lg font-semibold text-[var(--text-1)]">
                    Fun Facts
                  </h3>
                  <ul className="space-y-3">
                    {sp.funFacts.map((fact, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[var(--accent-soft)] flex items-center justify-center shrink-0 mt-0.5">
                          <Fish className="h-3 w-3 text-[var(--accent)]" />
                        </span>
                        <span className="text-sm text-[var(--text-2)] leading-relaxed">
                          {fact}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Where to Find */}
              {relatedDests.length > 0 && (
                <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
                  <h3 className="mb-4 font-heading text-lg font-semibold text-[var(--text-1)]">
                    Where to Find
                  </h3>
                  <div className="space-y-3">
                    {relatedDests.map((dest) => (
                      <Link
                        key={dest.id}
                        href={`/destinations/${dest.slug}`}
                        className="block rounded-[var(--radius-md)] p-3 transition-colors hover:bg-[var(--paper-deep)]"
                      >
                        <p className="flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                          <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" />
                          {dest.name}
                        </p>
                        <p className="mt-0.5 ml-5 text-xs text-[var(--text-3)]">
                          {dest.region}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferred Size & Record */}
              {(sp.averageSize || sp.recordSize) && (
                <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
                  <h3 className="mb-4 font-heading text-lg font-semibold text-[var(--text-1)]">
                    Size Reference
                  </h3>
                  {sp.averageSize && (
                    <div className="mb-3 pb-3 border-b border-[var(--border)]">
                      <p className="ea-overline mb-1">
                        Average Size
                      </p>
                      <p className="text-sm font-medium text-[var(--text-1)]">
                        {sp.averageSize}
                      </p>
                    </div>
                  )}
                  {sp.recordSize && (
                    <div>
                      <p className="ea-overline mb-1">
                        World Record
                      </p>
                      <p className="text-sm font-medium text-[var(--text-1)]">
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
