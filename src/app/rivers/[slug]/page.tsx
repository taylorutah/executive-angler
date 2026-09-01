import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import RiverHeroImage from "@/components/ui/RiverHeroImage";
import ReportButton from "@/components/ui/ReportButton";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FactList from "@/components/ui/FactList";
import TokenRow, { Token } from "@/components/ui/TokenRow";
import EntityCard from "@/components/ui/EntityCard";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import LazyMapView from "@/components/maps/LazyMapView";
import RiverPhotoStrip from "@/components/ui/RiverPhotoStrip";
import PersonalFlowOverlay from "@/components/rivers/PersonalFlowOverlay";
import PersonalRiverScorecard from "@/components/rivers/PersonalRiverScorecard";
import LazyFlowChart from "@/components/rivers/LazyFlowChart";
import BestWindowCalculator from "@/components/rivers/BestWindowCalculator";
import RiverLiveInset from "@/components/rivers/RiverLiveInset";
import SignedOutRiverInsights from "@/components/rivers/SignedOutRiverInsights";
import HatchSeasonGrid from "@/components/rivers/HatchSeasonGrid";
import YourRecordHere from "@/components/rivers/YourRecordHere";
import AdminHeroEditor from "@/components/admin/AdminHeroEditor";
import ContributeStrip from "@/components/desk/ContributeStrip";
import { accessLabel, difficultyLabel, formatBestMonthsLine, waterTypeLabel } from "@/lib/browse/river-items";
import { SITE_URL } from "@/lib/constants";
import {
  getAllRivers,
  getRiverBySlug,
  getDestinationById,
  getLodgesByRiver,
  getLodgesByDestination,
  getGuidesByRiver,
  getFlyShopsByDestination,
  getSpeciesByCommonNames,
  getAllCanonicalFlies,
  getApprovedPhotosByEntity,
  getRiversByDestination,
} from "@/lib/db";
import { hostedStillUrl } from "@/lib/media/image-url";
import { regulationSource } from "@/lib/rivers/regulations";
import { groupAccessPoints } from "@/lib/rivers/access-groups";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const river = await getRiverBySlug(slug);
  if (!river) notFound();

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

  const [dest, additionalDests, riverLodges, destLodges, nearbyGuides, destFlyShops, riverSpecies, allFlies, galleryPhotos, destRivers] = await Promise.all([
    river.destinationId ? getDestinationById(river.destinationId) : Promise.resolve(undefined),
    Promise.all((river.additionalDestinationIds ?? []).map((id) => getDestinationById(id))),
    getLodgesByRiver(river.id),
    river.destinationId ? getLodgesByDestination(river.destinationId) : Promise.resolve([]),
    getGuidesByRiver(river.id),
    river.destinationId ? getFlyShopsByDestination(river.destinationId) : Promise.resolve([]),
    getSpeciesByCommonNames(river.primarySpecies || []),
    getAllCanonicalFlies(),
    getApprovedPhotosByEntity("river", river.id),
    river.destinationId ? getRiversByDestination(river.destinationId) : Promise.resolve([]),
  ]);

  const flyByName = new Map(allFlies.map((f) => [f.name.toLowerCase(), f]));

  const allDests = [dest, ...(additionalDests ?? [])].filter(Boolean) as NonNullable<typeof dest>[];
  const destinationLabel = allDests.length > 0
    ? allDests.map((d) => d!.name).join(" · ")
    : null;

  const nearbyLodges = riverLodges.length > 0 ? riverLodges : destLodges.slice(0, 4);
  const nearbyRivers = destRivers.filter((r) => r.id !== river.id).slice(0, 6);

  const mapMarkers = [
    ...(river.accessPoints || []).map((ap) => ({
      latitude: ap.latitude,
      longitude: ap.longitude,
      title: ap.name,
      description: ap.description || (ap.parking ? "Parking available" : ""),
    })),
  ];

  const monthNow = new Date().toLocaleString("en-US", {
    month: "long",
    timeZone: "America/Denver",
  });
  const fishingNow = (river.hatchChart ?? []).find(
    (m) => m.month.toLowerCase() === monthNow.toLowerCase(),
  )?.hatches ?? [];

  const heroSubtitle = [destinationLabel, (river.flowType ?? "").replace(/-/g, " ")]
    .filter(Boolean)
    .join(" · ");
  const difficulty = difficultyLabel(river.difficulty);
  const access = accessLabel(river.wadingType);
  const season = formatBestMonthsLine(river.bestMonths || []);
  const speciesNames = river.primarySpecies ?? [];
  const destState = dest ? dest.state : undefined;
  const destCountry = dest ? dest.country : undefined;
  const destSlug = dest ? dest.slug : undefined;
  const regsSource = regulationSource({
    riverSlug: river.slug,
    destinationSlug: destSlug,
    destinationState: destState,
    destinationCountry: destCountry,
  });

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

      <RiverHeroImage
        heroImageUrl={river.heroImageUrl}
        heroImageAlt={
          river.heroImageAlt ||
          (river.slug === "madison-river"
            ? "The Madison River running low and clear below Three Dollar Bridge, Montana"
            : `${river.name} fly fishing`)
        }
        heroImageCredit={river.heroImageCredit}
        heroImageCreditUrl={river.heroImageCreditUrl}
        galleryPhotos={galleryPhotos}
        title={river.name}
        subtitle={heroSubtitle || undefined}
        meta={river.lengthMiles ? `${river.lengthMiles} miles` : undefined}
        toolbar={
          <div className="flex items-center justify-between gap-3">
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
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1">
              <Link
                href={`/plan/${river.slug}`}
                className="font-ui text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
              >
                Trip brief →
              </Link>
              <ReportButton entityType="river" entityId={river.id} />
              <FavoriteButton entityType="river" entityId={river.id} />
            </div>
          </div>
        }
        spec={
          difficulty || access || season || speciesNames.length > 0 ? (
            <FactList
              className="grid grid-cols-3 gap-x-4 gap-y-2.5 sm:grid-cols-4 sm:gap-x-8"
              facts={[
                ...(difficulty ? [{ label: "Difficulty", value: difficulty }] : []),
                ...(access ? [{ label: "Access", value: access }] : []),
                ...(season ? [{ label: "Season", value: season }] : []),
                ...(speciesNames.length > 0
                  ? [
                      {
                        label: "Fish",
                        className: "col-span-3 sm:col-span-1",
                        value: (
                          <TokenRow>
                            {speciesNames.map((speciesName, i) => {
                              const matched = riverSpecies.find(
                                (s) => s.commonName.toLowerCase() === speciesName.toLowerCase(),
                              );
                              return (
                                <Token key={speciesName} lead={i > 0}>
                                  {matched ? (
                                    <Link
                                      href={`/species/${matched.slug}`}
                                      className="underline-offset-4 hover:text-[var(--text-1)] hover:underline"
                                    >
                                      {speciesName}
                                    </Link>
                                  ) : (
                                    speciesName
                                  )}
                                </Token>
                              );
                            })}
                          </TokenRow>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          ) : undefined
        }
      >
        <AdminHeroEditor
          entityType="rivers"
          entityId={river.id}
          currentImageUrl={river.heroImageUrl}
          currentAlt={river.heroImageAlt}
          currentCredit={river.heroImageCredit}
          currentCreditUrl={river.heroImageCreditUrl}
          aspectRatio={16 / 9}
        />
      </RiverHeroImage>

      <section className="bg-[var(--paper)]">
        <div className="mx-auto max-w-[var(--container)] space-y-6 px-4 pb-8 pt-3 sm:px-6 sm:pt-5 lg:px-8">
          <YourRecordHere riverId={river.id} riverName={river.name} />
          <SignedOutRiverInsights riverName={river.name} />
          <PersonalFlowOverlay riverId={river.id} />
          <PersonalRiverScorecard riverId={river.id} riverName={river.name} />
          <BestWindowCalculator riverId={river.id} />
        </div>
      </section>

      <Suspense fallback={null}>
        <RiverLiveInset
          riverId={river.id}
          riverName={river.name}
          usgsGaugeId={river.usgsGaugeId ?? null}
          riverLatitude={river.latitude}
          riverLongitude={river.longitude}
        >
          <div className="mt-6">
            <LazyFlowChart
              usgsGaugeId={river.usgsGaugeId ?? null}
              riverName={river.name}
              riverId={river.id}
            />
            {river.usgsGaugeId ? (
              <p className="mt-3 text-sm text-[var(--text-2)]">
                New to hydrographs?{" "}
                <Link href="/articles/how-to-read-a-usgs-gauge-for-fly-fishing" className="text-[var(--accent)] underline-offset-4 hover:underline">
                  How to read a USGS gauge for fly fishing
                </Link>
                .
              </p>
            ) : null}
          </div>
        </RiverLiveInset>
      </Suspense>

      <section className="bg-[var(--paper)] pb-24">
        <div className="mx-auto max-w-[var(--container)] space-y-12 px-4 sm:px-6 lg:px-8">
          {fishingNow.length > 0 && (
            <ScrollAnimation>
              <div>
                <h2 className="mb-2 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                  Flies fishing now
                </h2>
                <p className="mb-5 text-sm text-[var(--text-2)]">
                  {monthNow} on the hatch chart — names and sizes, not a catch report.
                </p>
                <ul className="border-t border-[var(--border)]">
                  {fishingNow.map((hatch, i) => {
                    const matchedFly = flyByName.get(hatch.pattern?.toLowerCase() ?? "");
                    return (
                      <li
                        key={`${hatch.insect}-${hatch.pattern}-${i}`}
                        className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-[var(--border)] py-3"
                      >
                        <span className="font-medium text-[var(--text-1)]">{hatch.insect}</span>
                        {hatch.size ? (
                          <span className="num text-xs text-[var(--text-3)]">{hatch.size}</span>
                        ) : null}
                        {hatch.pattern ? (
                          matchedFly ? (
                            <Link
                              href={`/flies/${matchedFly.slug}`}
                              className="text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
                            >
                              {hatch.pattern}
                            </Link>
                          ) : (
                            <span className="text-[var(--text-2)]">{hatch.pattern}</span>
                          )
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </ScrollAnimation>
          )}

          {river.hatchChart && river.hatchChart.length > 0 && (
            <ScrollAnimation>
              <HatchSeasonGrid
                hatchChart={river.hatchChart}
                bestMonths={river.bestMonths || []}
              />
            </ScrollAnimation>
          )}

          <ScrollAnimation>
            <div className="border-t border-[var(--border)] pt-8">
              <h2 className="mb-2 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                Best flies for {river.name}
              </h2>
              <p className="mb-3 text-sm text-[var(--text-2)]">
                Hatch-chart nymphs, dries, and streamers for this river. Not a crowdsourced catch report.
              </p>
              <Link
                href={`/flies/for/${river.slug}`}
                className="inline-flex text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
              >
                Open the {river.name} fly list →
              </Link>
            </div>
          </ScrollAnimation>

          <ScrollAnimation>
            <div>
              <h2 className="mb-2 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                Access points
              </h2>
              {(river.accessPoints?.length ?? 0) > 0 ? (
                <p className="mb-5 text-sm text-[var(--text-2)]">
                  {river.accessPoints!.length} listed points. Map is Vellum land and Teal water — a desk chart, not a satellite.
                </p>
              ) : (
                <p className="mb-5 text-sm text-[var(--text-2)]">
                  No access points are listed for this river yet.
                </p>
              )}
              <LazyMapView
                latitude={river.latitude}
                longitude={river.longitude}
                zoom={9}
                markers={mapMarkers}
                bounds={river.mapBounds}
                tone="desk"
                className="h-[450px] w-full overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)]"
              />
              <div className="mt-6 space-y-8 border-t border-[var(--border)]">
                {groupAccessPoints(river.slug, river.accessPoints).map((group) => (
                  <div key={group.label ?? "access"}>
                    {group.label && (
                      <h3 className="mb-2 pt-4 font-heading text-lg font-semibold text-[var(--text-1)]">
                        {group.label}
                      </h3>
                    )}
                    {group.points.map((ap, i) => (
                      <div
                        key={`${group.label ?? "access"}-${i}`}
                        className="flex items-start gap-3 border-b border-[var(--border)] py-4"
                      >
                        <div className="num flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper-deep)] text-sm font-semibold text-[var(--text-1)]">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="font-ui text-base font-medium text-[var(--text-1)]">{ap.name}</h3>
                          {ap.description && (
                            <p className="mt-0.5 text-sm text-[var(--text-2)]">{ap.description}</p>
                          )}
                          <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--text-3)]">
                            <span className="flex items-center gap-1">
                              <Icon name="map" className="h-3.5 w-3.5" />
                              <span className="num">
                                {ap.latitude.toFixed(4)}, {ap.longitude.toFixed(4)}
                              </span>
                            </span>
                            {ap.parking && (
                              <span className="font-medium text-[var(--text-1)]">
                                Parking available
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </ScrollAnimation>

          <RiverPhotoStrip riverId={river.id} riverSlug={river.slug} riverName={river.name} />

          {river.regulations && (
            <ScrollAnimation>
              <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
                <div className="flex items-start gap-3">
                  <Icon name="warning" className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
                  <div>
                    <h2 className="mb-2 font-heading text-lg font-semibold text-[var(--text-1)]">
                      Regulations
                    </h2>
                    <p className="text-sm leading-relaxed text-[var(--text-2)]">
                      {river.regulations}
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-[var(--text-3)]">
                      Verify with{" "}
                      <a
                        href={regsSource.url}
                        className="text-[var(--accent)] underline underline-offset-4 hover:decoration-2"
                        rel="noopener noreferrer"
                      >
                        {regsSource.label}
                      </a>
                      . Retrieved {regsSource.retrievedOn}. Seasons and gear rules change.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          )}

          {(nearbyLodges.length > 0 || nearbyGuides.length > 0 || destFlyShops.length > 0) && (
            <ScrollAnimation>
              <div>
                <h2 className="mb-6 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                  On this river
                </h2>
                <div className="space-y-10">
                  {nearbyLodges.length > 0 && (
                    <div>
                      <h3 className="mb-4 font-heading text-lg font-semibold text-[var(--text-1)]">
                        {riverLodges.length > 0
                          ? "Lodges"
                          : `Lodges in ${destinationLabel ?? "this area"}`}
                      </h3>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {nearbyLodges.slice(0, 6).map((lodge) => (
                          <EntityCard
                            key={lodge.id}
                            href={`/lodges/${lodge.slug}`}
                            imageUrl={hostedStillUrl(lodge.heroImageUrl)}
                            imageAlt={lodge.name}
                            title={lodge.name}
                            subtitle={lodge.priceRange}
                            meta={lodge.seasonStart && lodge.seasonEnd ? `${lodge.seasonStart}–${lodge.seasonEnd}` : undefined}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {nearbyGuides.length > 0 && (
                    <div>
                      <h3 className="mb-4 font-heading text-lg font-semibold text-[var(--text-1)]">
                        Guides
                      </h3>
                      <div className="space-y-3">
                        {nearbyGuides.map((guide) => (
                          <Link
                            key={guide.id}
                            href={`/guides/${guide.slug}`}
                            className="block rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--border-strong)]"
                          >
                            <p className="text-sm font-medium text-[var(--text-1)]">{guide.name}</p>
                            {guide.dailyRate ? (
                              <p className="mt-0.5 text-xs text-[var(--text-2)]">{guide.dailyRate}</p>
                            ) : null}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {destFlyShops.length > 0 && (
                    <div>
                      <h3 className="mb-4 font-heading text-lg font-semibold text-[var(--text-1)]">
                        Fly shops
                      </h3>
                      <div className="space-y-3">
                        {destFlyShops.slice(0, 4).map((shop) => (
                          <Link
                            key={shop.id}
                            href={`/fly-shops/${shop.slug}`}
                            className="flex items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--border-strong)]"
                          >
                            <Icon name="current" className="h-5 w-5 shrink-0 text-[var(--accent)]" />
                            <div>
                              <h4 className="font-heading text-base font-semibold text-[var(--text-1)]">
                                {shop.name}
                              </h4>
                              <p className="mt-0.5 text-sm text-[var(--text-2)]">{shop.address}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollAnimation>
          )}

          {river.slug === "madison-river" && (
            <ScrollAnimation>
              <div>
                <h2 className="mb-5 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                  Planning a Madison trip in 2026
                </h2>
                <div className="prose">
                  <p>
                    The Madison is two fisheries that share a name. Above Ennis Lake you are covering broad riffle-and-run meadow water. Below the lake the wade game opens up and caddis and PMDs do more work than the salmonfly posters suggest. Build the trip around the{" "}
                    <Link href={`/flies/for/${river.slug}`} className="text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--accent)] hover:decoration-[var(--accent)]">
                      hatch-chart fly list
                    </Link>
                    , the USGS gauge on this page, and Montana&apos;s season dates. We do not publish other anglers&apos; catches or GPS.
                  </p>
                  <p>
                    If this is your first week on the Madison, fish the wade water first. A first float is worth a guide. Walk-up access is real on both the upper and the below-lake stretches if you already nymph. Pair this guide with the{" "}
                    <Link href="/destinations/montana" className="text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--accent)] hover:decoration-[var(--accent)]">
                      Montana destination page
                    </Link>{" "}
                    for lodges, shops, and neighboring rivers. For a 2026 fly box, read{" "}
                    <Link href="/articles/best-flies-for-the-madison-river-2026" className="text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--accent)] hover:decoration-[var(--accent)]">
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
                <h2 className="mb-5 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                  Fishing the Green below Flaming Gorge
                </h2>
                <div className="prose">
                  <p>
                    This tailwater is A, B, and C sections, clear water, and a crowd that shows up for the same reasons you did. Pack small flies, check the gauge on this page, and read{" "}
                    <Link href="/articles/green-river-utah-flaming-gorge-fly-fishing" className="text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--accent)] hover:decoration-[var(--accent)]">
                      Fly Fishing the Green River Below Flaming Gorge
                    </Link>
                    {" "}before you book a shuttle. The{" "}
                    <Link href={`/flies/for/${river.slug}`} className="text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--accent)] hover:decoration-[var(--accent)]">
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
                <h2 className="mb-5 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                  Pecos pocket water
                </h2>
                <div className="prose">
                  <p>
                    Above Terrero you can walk. Along the road you share campground runs. After runoff, a dry-dropper and some manners will fish this river. Longer notes are in{" "}
                    <Link href="/articles/pecos-river-new-mexico-fly-fishing" className="text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--accent)] hover:decoration-[var(--accent)]">
                      Fly Fishing the Pecos River in New Mexico
                    </Link>
                    . Flies live on the{" "}
                    <Link href={`/flies/for/${river.slug}`} className="text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--accent)] hover:decoration-[var(--accent)]">
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
                <h2 className="mb-5 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                  A short Wasatch window
                </h2>
                <div className="prose">
                  <p>
                    Little Cottonwood is not Big Cottonwood and it is not a tailwater. Fish the cold window, carry a thermometer, and leave when summer heat says so. Read{" "}
                    <Link href="/articles/little-cottonwood-creek-utah-fly-fishing" className="text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--accent)] hover:decoration-[var(--accent)]">
                      Fly Fishing Little Cottonwood Creek
                    </Link>
                    . The{" "}
                    <Link href={`/flies/for/${river.slug}`} className="text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--accent)] hover:decoration-[var(--accent)]">
                      creek fly list
                    </Link>
                    {" "}follows the hatch chart.
                  </p>
                </div>
              </div>
            </ScrollAnimation>
          )}

          <ScrollAnimation>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                  Read the river overview
                </h2>
                <Icon
                  name="chevron-down"
                  className="h-5 w-5 shrink-0 text-[var(--text-3)] transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="prose mt-5">
                {river.description.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </details>
          </ScrollAnimation>

          {nearbyRivers.length > 0 && (
            <ScrollAnimation>
              <div>
                <h2 className="mb-5 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                  Nearby rivers
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {nearbyRivers.map((near) => (
                    <EntityCard
                      key={near.id}
                      href={`/rivers/${near.slug}`}
                      imageUrl={near.heroImageUrl ?? near.thumbnailUrl}
                      imageAlt={near.name}
                      title={near.name}
                      subtitle={waterTypeLabel(near.flowType)}
                      meta={(near.primarySpecies || []).slice(0, 3).join(" · ") || undefined}
                    />
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          )}

          <ContributeStrip
            href={`/contribute/river?for=${river.slug}`}
            buttonLabel="Contribute to this river"
          />
        </div>
      </section>
    </>
  );
}
