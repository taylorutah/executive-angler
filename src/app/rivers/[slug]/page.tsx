import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Fish, Waves, AlertTriangle, Bug, Map as MapIcon } from "lucide-react";
import RiverHeroImage from "@/components/ui/RiverHeroImage";
import ReportButton from "@/components/ui/ReportButton";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import QuickFacts from "@/components/ui/QuickFacts";
import EntityCard from "@/components/ui/EntityCard";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import Badge from "@/components/ui/Badge";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import LazyMapView from "@/components/maps/LazyMapView";
import RiverPhotoStrip from "@/components/ui/RiverPhotoStrip";
import RiverSidebarPhotoWidget from "@/components/ui/RiverSidebarPhotoWidget";
import RiverAnglerIntel from "@/components/ui/RiverAnglerIntel";
import FlyBoxAddButton from "@/components/flies/FlyBoxAddButton";
// Privacy overhaul: RiverActivityPulse + RiverRealtimeActivity removed.
// They surfaced active-session counts and per-event "X started fishing"
// notifications across the community — both leak presence-style intel
// at a level the new model doesn't allow. Personal pulse for the
// signed-in user lives in the Pro PersonalRiverScorecard instead.
import RiverSidebarLive from "@/components/rivers/RiverSidebarLive";
import PersonalFlowOverlay from "@/components/rivers/PersonalFlowOverlay";
import PersonalRiverScorecard from "@/components/rivers/PersonalRiverScorecard";
import LazyFlowChart from "@/components/rivers/LazyFlowChart";
import RiverSectionPills from "@/components/rivers/RiverSectionPills";
import BestWindowCalculator from "@/components/rivers/BestWindowCalculator";
import CollapsibleOverview from "@/components/rivers/CollapsibleOverview";
import CollapsibleSection from "@/components/rivers/CollapsibleSection";
import AdminHeroEditor from "@/components/admin/AdminHeroEditor";
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
  getSpeciesByCommonNames,
  getFliesForRiver,
  getAllCanonicalFlies,
  getApprovedPhotosByEntity,
} from "@/lib/db";


interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const river = await getRiverBySlug(slug);
  if (!river) return { title: "River Not Found" };

  const speciesList = (river.primarySpecies || []).slice(0, 3).join(", ");
  const flowLabel = river.flowType ? river.flowType.charAt(0).toUpperCase() + river.flowType.slice(1) : "";
  const accessCount = (river.accessPoints || []).length;
  const fallbackTitle = `${river.name} Fly Fishing — ${flowLabel || "Prime"} Water for ${speciesList || "Trout"} | Executive Angler`;
  const fallbackDesc = `${river.name}: ${river.lengthMiles ? river.lengthMiles + " miles, " : ""}${river.difficulty || "all-level"} ${river.flowType || ""} water.${speciesList ? ` Target ${speciesList}.` : ""}${accessCount > 0 ? ` ${accessCount} access points.` : ""} Hatch charts, guides & trip planning.`;

  return {
    title: { absolute: river.metaTitle || fallbackTitle },
    description:
      river.metaDescription || fallbackDesc,
    openGraph: {
      title: river.metaTitle || `${river.name} Fly Fishing Guide`,
      description: river.metaDescription || river.description.substring(0, 160),
      ...(river.heroImageUrl ? { images: [river.heroImageUrl] } : {}),
    },
    alternates: {
      canonical: `${SITE_URL}/rivers/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const allRivers = await getAllRivers();
  return allRivers.map((r) => ({ slug: r.slug }));
}

export default async function RiverPage({ params }: Props) {
  const { slug } = await params;
  const river = await getRiverBySlug(slug);
  if (!river) notFound();

  // Admin hero editor is client-gated so this page stays cacheable.

  const [dest, additionalDests, riverLodges, destLodges, nearbyGuides, destFlyShops, riverArticles, riverSpecies, riverFlies, allFlies, galleryPhotos] = await Promise.all([
    river.destinationId ? getDestinationById(river.destinationId) : Promise.resolve(undefined),
    Promise.all((river.additionalDestinationIds ?? []).map((id) => getDestinationById(id))),
    getLodgesByRiver(river.id),
    river.destinationId ? getLodgesByDestination(river.destinationId) : Promise.resolve([]),
    getGuidesByRiver(river.id),
    river.destinationId ? getFlyShopsByDestination(river.destinationId) : Promise.resolve([]),
    getArticlesByRiver(river.id),
    getSpeciesByCommonNames(river.primarySpecies || []),
    getFliesForRiver(river.id),
    getAllCanonicalFlies(),
    getApprovedPhotosByEntity("river", river.id),
  ]);

  const flyByName = new Map(allFlies.map(f => [f.name.toLowerCase(), f]));

  // All destinations (primary + additional), filtered to truthy
  const allDests = [dest, ...(additionalDests ?? [])].filter(Boolean) as NonNullable<typeof dest>[];
  const destinationLabel = allDests.length > 0
    ? allDests.map((d) => d!.name).join(" · ")
    : null;

  const nearbyLodges = riverLodges.length > 0 ? riverLodges : destLodges.slice(0, 4);
  const lodgesHeading = riverLodges.length > 0
    ? "Lodges on This River"
    : `Lodges in ${destinationLabel ?? "This Area"}`;

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
    ...(destinationLabel ? [{ label: "States", value: destinationLabel }] : []),
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
          "@type": ["BodyOfWater", "Place"],
          name: river.name,
          description: river.description,
          url: `${SITE_URL}/rivers/${slug}`,
          geo: {
            "@type": "GeoCoordinates",
            latitude: river.latitude,
            longitude: river.longitude,
          },
          ...(river.heroImageUrl ? { image: river.heroImageUrl } : {}),
          ...(dest
            ? {
                containedInPlace: {
                  "@type": "Place",
                  name: dest.name,
                  url: `${SITE_URL}/destinations/${dest.slug}`,
                },
              }
            : {}),
          ...(river.primarySpecies && river.primarySpecies.length > 0
            ? {
                keywords: river.primarySpecies.join(", "),
              }
            : {}),
        }}
      />

      {/* Narrow panoramic hero — pure image, no text overlay */}
      <RiverHeroImage
        heroImageUrl={river.heroImageUrl}
        heroImageAlt={river.heroImageAlt || `${river.name} fly fishing`}
        heroImageCredit={river.heroImageCredit}
        heroImageCreditUrl={river.heroImageCreditUrl}
        galleryPhotos={galleryPhotos}
        title={river.name}
        meta={[
          (river.flowType ?? "").replace(/-/g, " "),
          dest?.state ?? dest?.name,
        ]
          .filter(Boolean)
          .join(" · ")}
      >
        <AdminHeroEditor
          entityType="rivers"
          entityId={river.id}
          currentImageUrl={river.heroImageUrl}
          currentAlt={river.heroImageAlt}
          currentCredit={river.heroImageCredit}
          currentCreditUrl={river.heroImageCreditUrl}
          aspectRatio={16 / 3}
        />
      </RiverHeroImage>

      {/* Title block — identity + navigation, all below the image */}
      <div className="bg-[var(--surface-page)] border-b border-[var(--border-rule)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text-primary)] leading-tight">
                {river.name}
              </h1>
              {allDests.length > 0 && (
                <p className="mt-1 text-sm text-[var(--text-body)]">
                  {allDests.map((d) => d!.name).join(" · ")}
                </p>
              )}
              {/* Species + flow type chips */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {[river.flowType, ...(river.primarySpecies ?? [])]
                  .filter(Boolean)
                  .map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[12px] text-[var(--text-body)]"
                    >
                      {chip}
                    </span>
                  ))}
              </div>
            </div>
            {/* Actions */}
            <div className="shrink-0 flex items-center gap-2 mt-1">
              <ReportButton entityType="river" entityId={river.id} />
              <FavoriteButton entityType="river" entityId={river.id} />
            </div>
          </div>
          {/* Breadcrumbs */}
          <div className="mt-3">
            <Breadcrumbs
              items={[
                { label: "Rivers", href: "/rivers" },
                ...(dest ? [{ label: dest.name, href: `/destinations/${dest.slug}` }] : []),
                ...(additionalDests && additionalDests.length > 0
                  ? additionalDests
                      .filter(Boolean)
                      .map((d) => ({ label: d!.name, href: `/destinations/${d!.slug}` }))
                  : []),
                { label: river.name },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Section pills — sub-navigation for multi-gauge rivers */}
      <RiverSectionPills riverId={river.id} />

      <section className="bg-[var(--surface-page)] pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:grid-rows-[auto_1fr]">
            {/* 1. Fishability / live conditions. Exactly one instance: first on
                mobile, top of the sidebar column on desktop. Mirroring it into
                both columns gave Recharts a 0×0 container in the hidden copy. */}
            <div className="order-1 space-y-6 lg:order-none lg:col-start-3 lg:row-start-1">
              <RiverSidebarLive
                riverId={river.id}
                riverLatitude={river.latitude}
                riverLongitude={river.longitude}
              />
            </div>

            {/* Main Content */}
            <div className="order-2 space-y-10 lg:order-none lg:col-span-2 lg:col-start-1 lg:row-span-2 lg:row-start-1">
              {/* 2. Flow history chart (7D/30D/6M/1Y toggles built-in) */}
              <ScrollAnimation>
                <LazyFlowChart
                  usgsGaugeId={river.usgsGaugeId ?? null}
                  riverName={river.name}
                  riverId={river.id}
                />
                {river.usgsGaugeId ? (
                  <p className="mt-3 text-sm text-[var(--text-body)]">
                    New to hydrographs?{" "}
                    <Link href="/articles/how-to-read-a-usgs-gauge-for-fly-fishing" className="text-[var(--action)] hover:underline">
                      How to read a USGS gauge for fly fishing
                    </Link>
                    .
                  </p>
                ) : null}
              </ScrollAnimation>

              {/* Personal Flow Overlay — 12-month catch correlation, signed-in only */}
              <PersonalFlowOverlay riverId={river.id} />

              {/* Personal River Scorecard — your patterns on THIS river, signed-in only */}
              <PersonalRiverScorecard riverId={river.id} riverName={river.name} />

              {/* Community photo strip — moved here from above the grid */}
              <RiverPhotoStrip riverId={river.id} riverSlug={river.slug} riverName={river.name} />

              {/* 3. Recent Fly Choices — community fly pulse (names only, no counts) */}
              <ScrollAnimation>
                <RiverAnglerIntel riverId={river.id} riverName={river.name} />
              </ScrollAnimation>

              {/* 4. Hatch Chart — collapsed by default (matches native) */}
              {river.hatchChart && river.hatchChart.length > 0 && (
                <ScrollAnimation>
                  <CollapsibleSection
                    title="Hatch Chart"
                    subtitle={`${river.hatchChart.length} mo`}
                    icon={<Bug className="h-5 w-5" />}
                    defaultOpen={false}
                  >
                    <div className="bg-[var(--surface-raised)] rounded-xl shadow-sm border border-[var(--border-rule)] overflow-hidden">
                      {/* Mobile: stacked card layout grouped by month */}
                      <div className="sm:hidden divide-y divide-[#21262D]">
                        {river.hatchChart.map((month) => (
                          <div key={month.month} className="p-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--action)] mb-3">
                              {month.month}
                            </h3>
                            <ul className="space-y-3">
                              {month.hatches.map((hatch, hi) => {
                                const matchedFly = flyByName.get(hatch.pattern?.toLowerCase());
                                return (
                                  <li
                                    key={`${month.month}-${hi}`}
                                    className="rounded-lg bg-[var(--surface-page)] border border-[var(--border-rule)] p-3"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <p className="font-medium text-[var(--text-primary)] text-[15px] leading-snug">
                                        {hatch.insect}
                                      </p>
                                      <span className="shrink-0 inline-flex items-center rounded-full bg-[var(--border-rule)] px-2 py-0.5 text-xs font-medium text-[var(--text-body)] whitespace-nowrap">
                                        {hatch.size}
                                      </span>
                                    </div>
                                    {hatch.pattern && (
                                      <div className="mt-1.5 flex items-center gap-2 text-[13px] text-[var(--text-body)]">
                                        <p className="min-w-0 flex-1">
                                          {matchedFly ? (
                                            <Link
                                              href={`/flies/${matchedFly.slug}`}
                                              className="text-[var(--action)] hover:underline"
                                            >
                                              {hatch.pattern}
                                            </Link>
                                          ) : (
                                            hatch.pattern
                                          )}
                                        </p>
                                        {matchedFly && (
                                          <FlyBoxAddButton
                                            fly={{
                                              id: matchedFly.id,
                                              slug: matchedFly.slug,
                                              name: matchedFly.name,
                                            }}
                                            variant="icon"
                                          />
                                        )}
                                      </div>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Desktop: table */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-[var(--action)] text-white">
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
                                  className="border-b border-[var(--border-rule)] hover:bg-[var(--surface-page)]/50"
                                >
                                  {hi === 0 && (
                                    <td
                                      className="px-4 py-3 font-medium text-[var(--action)] align-top"
                                      rowSpan={month.hatches.length}
                                    >
                                      {month.month}
                                    </td>
                                  )}
                                  <td className="px-4 py-3 text-[var(--text-body)]">
                                    {hatch.insect}
                                  </td>
                                  <td className="px-4 py-3 text-[var(--text-body)] whitespace-nowrap">
                                    {hatch.size}
                                  </td>
                                  <td className="px-4 py-3 text-[var(--text-body)]">
                                    {(() => {
                                      const matchedFly = flyByName.get(hatch.pattern?.toLowerCase());
                                      return (
                                        <div className="flex items-center gap-2">
                                          <span className="min-w-0 flex-1">
                                            {matchedFly ? (
                                              <Link href={`/flies/${matchedFly.slug}`} className="text-[var(--action)] hover:underline">
                                                {hatch.pattern}
                                              </Link>
                                            ) : (
                                              hatch.pattern
                                            )}
                                          </span>
                                          {matchedFly && (
                                            <FlyBoxAddButton
                                              fly={{
                                                id: matchedFly.id,
                                                slug: matchedFly.slug,
                                                name: matchedFly.name,
                                              }}
                                              variant="icon"
                                            />
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CollapsibleSection>
                </ScrollAnimation>
              )}

              {/* 6. Community Photos — mobile-only inline */}
              <div className="lg:hidden">
                <RiverSidebarPhotoWidget riverId={river.id} riverSlug={river.slug} />
              </div>

              {/* 7. Quick Facts — mobile-only inline */}
              <div className="lg:hidden">
                <QuickFacts facts={quickFacts} />
              </div>

              {/* 8. Overview — collapsible, full text in DOM for SEO */}
              <ScrollAnimation>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-[var(--action)] mb-5">
                    Overview
                  </h2>
                  <CollapsibleOverview>
                    <div className="river-body">
                      {river.description.split("\n\n").map((p, i) => (
                        <p key={i} className="text-[var(--text-body)] text-base leading-[1.8] mb-4">
                          {p}
                        </p>
                      ))}
                    </div>
                    {/* Species badges */}
                    <div className="entity-tags mt-4">
                      {(river.primarySpecies || []).map((speciesName) => {
                        const matched = riverSpecies.find(
                          (s) => s.commonName.toLowerCase() === speciesName.toLowerCase()
                        );
                        const badge = (
                          <Badge key={speciesName} variant="river" size="md">
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
                  </CollapsibleOverview>
                </div>
              </ScrollAnimation>

              {river.slug === "madison-river" && (
                <ScrollAnimation>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-[var(--action)] mb-5">
                      Planning a Madison trip in 2026
                    </h2>
                    <div className="space-y-4 text-[var(--text-body)] text-base leading-[1.8]">
                      <p>
                        The Madison is two fisheries that share a name. Above Ennis Lake you are covering broad riffle-and-run meadow water. Below the lake the wade game opens up and caddis and PMDs do more work than the salmonfly posters suggest. Build the trip around the{" "}
                        <Link href={`/flies/for/${river.slug}`} className="text-[var(--action)] hover:underline">
                          hatch-chart fly list
                        </Link>
                        , the USGS gauge on this page, and Montana&apos;s season dates. We do not publish other anglers&apos; catches or GPS.
                      </p>
                      <p>
                        If this is your first week on the Madison, fish the wade water first. A first float is worth a guide. Walk-up access is real on both the upper and the below-lake stretches if you already nymph. Pair this guide with the{" "}
                        <Link href="/destinations/montana" className="text-[var(--action)] hover:underline">
                          Montana destination page
                        </Link>{" "}
                        for lodges, shops, and neighboring rivers. For a 2026 fly box, read{" "}
                        <Link href="/articles/best-flies-for-the-madison-river-2026" className="text-[var(--action)] hover:underline">
                          Best Flies for the Madison River in 2026
                        </Link>
                        .
                      </p>
                    </div>
                  </div>
                </ScrollAnimation>
              )}

              {river.slug === "green-river" && (
                <ScrollAnimation>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-[var(--action)] mb-5">
                      Fishing the Green below Flaming Gorge
                    </h2>
                    <div className="space-y-4 text-[var(--text-body)] text-base leading-[1.8]">
                      <p>
                        This tailwater is A, B, and C sections, clear water, and a crowd that shows up for the same reasons you did. Pack small flies, check the gauge on this page, and read{" "}
                        <Link href="/articles/green-river-utah-flaming-gorge-fly-fishing" className="text-[var(--action)] hover:underline">
                          Fly Fishing the Green River Below Flaming Gorge
                        </Link>
                        {" "}before you book a shuttle. The{" "}
                        <Link href={`/flies/for/${river.slug}`} className="text-[var(--action)] hover:underline">
                          hatch-chart fly list
                        </Link>
                        {" "}is public. Other anglers&apos; fish are not.
                      </p>
                    </div>
                  </div>
                </ScrollAnimation>
              )}

              {river.slug === "pecos-river-new-mexico" && (
                <ScrollAnimation>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-[var(--action)] mb-5">
                      Pecos pocket water
                    </h2>
                    <div className="space-y-4 text-[var(--text-body)] text-base leading-[1.8]">
                      <p>
                        Above Terrero you can walk. Along the road you share campground runs. After runoff, a dry-dropper and some manners will fish this river. Longer notes are in{" "}
                        <Link href="/articles/pecos-river-new-mexico-fly-fishing" className="text-[var(--action)] hover:underline">
                          Fly Fishing the Pecos River in New Mexico
                        </Link>
                        . Flies live on the{" "}
                        <Link href={`/flies/for/${river.slug}`} className="text-[var(--action)] hover:underline">
                          Pecos hatch-chart fly list
                        </Link>
                        .
                      </p>
                    </div>
                  </div>
                </ScrollAnimation>
              )}

              {river.slug === "little-cottonwood-creek" && (
                <ScrollAnimation>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-[var(--action)] mb-5">
                      A short Wasatch window
                    </h2>
                    <div className="space-y-4 text-[var(--text-body)] text-base leading-[1.8]">
                      <p>
                        Little Cottonwood is not Big Cottonwood and it is not a tailwater. Fish the cold window, carry a thermometer, and leave when summer heat says so. Read{" "}
                        <Link href="/articles/little-cottonwood-creek-utah-fly-fishing" className="text-[var(--action)] hover:underline">
                          Fly Fishing Little Cottonwood Creek
                        </Link>
                        . The{" "}
                        <Link href={`/flies/for/${river.slug}`} className="text-[var(--action)] hover:underline">
                          creek fly list
                        </Link>
                        {" "}follows the hatch chart.
                      </p>
                    </div>
                  </div>
                </ScrollAnimation>
              )}

              {/* 9. Regulations */}
              {river.regulations && (
                <ScrollAnimation>
                  <div className="bg-[var(--surface-raised)] border border-[var(--border-strong)] rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-[var(--action)] shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-2">
                          Regulations
                        </h3>
                        <p className="text-sm text-[var(--text-body)] leading-relaxed">
                          {river.regulations}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollAnimation>
              )}

              {/* 10. Access Points & Map — collapsed by default (matches native) */}
              <ScrollAnimation>
                <CollapsibleSection
                  title="Access Points & Map"
                  subtitle={
                    (river.accessPoints?.length ?? 0) > 0
                      ? `${river.accessPoints!.length} points`
                      : undefined
                  }
                  icon={<MapIcon className="h-5 w-5" />}
                  defaultOpen={false}
                >
                  <LazyMapView
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
                        className="flex items-start gap-3 p-4 bg-[var(--surface-raised)] rounded-xl shadow-sm"
                      >
                        <div className="w-8 h-8 rounded-full bg-[var(--action)] text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-[var(--action)]">
                            {ap.name}
                          </h4>
                          {ap.description && (
                            <p className="text-sm text-[var(--text-body)] mt-0.5">
                              {ap.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-body)]">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {ap.latitude.toFixed(4)}, {ap.longitude.toFixed(4)}
                            </span>
                            {ap.parking && (
                              <span className="text-[var(--action)] font-medium">
                                Parking available
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              </ScrollAnimation>

              {/* Nearby Lodges */}
              {nearbyLodges.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[var(--action)] mb-5">
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
                  <h2 className="font-heading text-2xl font-bold text-[var(--action)] mb-5">
                    Fly Shops Nearby
                  </h2>
                  <div className="space-y-3">
                    {destFlyShops.slice(0, 4).map((shop) => (
                      <Link
                        key={shop.id}
                        href={`/fly-shops/${shop.slug}`}
                        className="flex items-center gap-4 p-4 bg-[var(--surface-raised)] rounded-xl shadow-sm card-hover"
                      >
                        <Waves className="h-5 w-5 text-river shrink-0" />
                        <div>
                          <h3 className="font-heading text-base font-semibold text-[var(--action)]">
                            {shop.name}
                          </h3>
                          <p className="text-sm text-[var(--text-body)] mt-0.5">{shop.address}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {/* Best Flies for This River — always link the hatch-chart list */}
              <ScrollAnimation>
                <div className="rounded-xl border border-[var(--border-rule)] bg-[var(--surface-raised)] p-5 mb-5">
                  <h2 className="font-heading text-2xl font-bold text-[var(--action)] mb-2">
                    Best Flies for {river.name}
                  </h2>
                  <p className="text-sm text-[var(--text-body)] mb-3">
                    Hatch-chart nymphs, dries, and streamers for this river. Not a crowdsourced catch report.
                  </p>
                  <Link
                    href={`/flies/for/${river.slug}`}
                    className="inline-flex text-sm font-semibold text-[var(--action)] hover:underline"
                  >
                    Open the {river.name} fly list →
                  </Link>
                </div>
              </ScrollAnimation>
              {riverFlies.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[var(--action)] mb-5">
                    Catalog flies tied to {river.name}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {riverFlies.slice(0, 8).map((fly) => (
                      <Link
                        key={fly.id}
                        href={`/flies/${fly.slug}`}
                        className="flex items-center gap-2.5 p-2.5 bg-[var(--surface-raised)] rounded-lg border border-[var(--border-rule)] hover:border-[var(--action)]/40 transition-colors group"
                      >
                        {fly.heroImageUrl ? (
                          <img
                            src={fly.heroImageUrl}
                            alt={fly.name}
                            className="w-8 h-8 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-[var(--border-rule)] flex items-center justify-center shrink-0">
                            <Fish className="h-3.5 w-3.5 text-[var(--text-meta)]" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--action)] transition-colors truncate">
                            {fly.name}
                          </p>
                          <p className="text-[10px] text-[var(--text-meta)] truncate">
                            {fly.category.charAt(0).toUpperCase() + fly.category.slice(1)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

            </div>

            {/* Sidebar — on mobile this stacks below the main column. The widgets
                that are mirrored inline above (QuickFacts,
                RiverSidebarPhotoWidget) are hidden on mobile to avoid
                double-rendering. */}
            <div className="order-3 space-y-6 lg:order-none lg:col-start-3 lg:row-start-2 lg:self-start lg:sticky lg:top-24">
              <BestWindowCalculator riverId={river.id} />

              <div className="hidden lg:block">
                <QuickFacts facts={quickFacts} />
              </div>

              {/* Season Calendar */}
              <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-6 shadow-sm">
                <h3 className="font-heading text-lg font-semibold text-[var(--action)] mb-4">
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
                        className={`text-center py-2 rounded border text-xs ${
                          isGood
                            ? "border-[var(--action)] bg-[var(--action)] font-semibold text-[var(--on-action)]"
                            : "border-[var(--border-rule)] font-medium text-[var(--text-meta)]"
                        }`}
                      >
                        {month}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="hidden lg:block">
                <RiverSidebarPhotoWidget riverId={river.id} riverSlug={river.slug} />
              </div>

              {/* Nearby Guides */}
              {nearbyGuides.length > 0 && (
                <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-6 shadow-sm">
                  <h3 className="font-heading text-lg font-semibold text-[var(--action)] mb-4">
                    Guides on This River
                  </h3>
                  <div className="space-y-3">
                    {nearbyGuides.map((guide) => (
                      <Link
                        key={guide.id}
                        href={`/guides/${guide.slug}`}
                        className="block p-3 rounded-lg hover:bg-[var(--surface-page)] transition-colors"
                      >
                        <p className="text-sm font-medium text-[var(--action)]">
                          {guide.name}
                        </p>
                        <p className="text-xs text-[var(--text-body)] mt-0.5">
                          {guide.dailyRate}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Articles */}
              {riverArticles.length > 0 && (
                <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-6 shadow-sm">
                  <h3 className="font-heading text-lg font-semibold text-[var(--action)] mb-4">
                    Reading for This River
                  </h3>
                  <div className="space-y-3">
                    {riverArticles.slice(0, 4).map((article) => (
                      <Link
                        key={article.id}
                        href={`/articles/${article.slug}`}
                        className="block p-3 rounded-lg hover:bg-[var(--surface-page)] transition-colors"
                      >
                        <p className="text-sm font-medium text-[var(--action)]">
                          {article.title}
                        </p>
                        <p className="text-xs text-[var(--text-body)] mt-1">
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
