import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import RiverHeroImage from "@/components/ui/RiverHeroImage";
import RiverPhotoCaption from "@/components/rivers/RiverPhotoCaption";
import { GazetteClock } from "@/lib/gazette/date";
import ReportButton from "@/components/ui/ReportButton";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FactList from "@/components/ui/FactList";
import TokenRow, { Token } from "@/components/ui/TokenRow";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import SafeEntityImage from "@/components/media/SafeEntityImage";
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
import { regulationSource } from "@/lib/rivers/regulations";
import { groupAccessPoints } from "@/lib/rivers/access-groups";
import { matchHatchPlate } from "@/lib/rivers/week-flies";

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
  const nowPlates = fishingNow.map((hatch, i) => ({
    key: `${hatch.insect}-${hatch.pattern}-${i}`,
    hatch,
    plate: matchHatchPlate(hatch, allFlies),
  }));
  const photoPlates = nowPlates.filter((row) => row.plate.imageUrl);
  const typePlates = nowPlates.filter((row) => !row.plate.imageUrl);

  const destState = dest ? dest.state : undefined;
  const destCountry = dest ? dest.country : undefined;
  const destSlug = dest ? dest.slug : undefined;
  const place = destState || dest?.name || destCountry || "";
  const water = (river.flowType ?? "").replace(/-/g, " ");
  const heroSubtitle = [
    place,
    water,
    river.lengthMiles ? `${river.lengthMiles} miles` : "",
  ]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();
  const difficulty = difficultyLabel(river.difficulty);
  const access = accessLabel(river.wadingType);
  const season = formatBestMonthsLine(river.bestMonths || []);
  const speciesNames = river.primarySpecies ?? [];
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
        meta={undefined}
        toolbar={
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
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
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 sm:justify-end">
              <Link
                href={`/journal/new?river=${river.slug}`}
                className="ea-btn ea-btn-primary ea-btn-sm"
              >
                Keep a journal
              </Link>
              <ReportButton entityType="river" entityId={river.id} />
              <FavoriteButton entityType="river" entityId={river.id} />
            </div>
          </div>
        }
        caption={
          <RiverPhotoCaption
            riverId={river.id}
            place={place || river.name}
            date={GazetteClock.photoDay()}
          />
        }
        spec={
          difficulty || access || season || speciesNames.length > 0 ? (
            <FactList
              className="grid grid-cols-3 gap-x-4 gap-y-3 sm:gap-x-8"
              facts={[
                ...(difficulty ? [{ label: "Difficulty", value: difficulty }] : []),
                ...(access ? [{ label: "Access", value: access }] : []),
                ...(season ? [{ label: "Season", value: season }] : []),
                ...(speciesNames.length > 0
                  ? [
                      {
                        label: "Fish",
                        className: "col-span-3",
                        value: (
                          <TokenRow>
                            {speciesNames.map((speciesName, i) => {
                              const matched = riverSpecies.find(
                                (s) => s.commonName.toLowerCase() === speciesName.toLowerCase(),
                              );
                              const comma = i < speciesNames.length - 1 ? "," : "";
                              return (
                                <Token key={speciesName}>
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
                                  {comma}
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

      <section className="overflow-x-clip bg-[var(--paper)]">
        <div className="mx-auto min-w-0 max-w-[var(--container)] space-y-6 px-4 pb-8 pt-3 sm:px-6 sm:pt-5 lg:px-8">
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

      <section className="overflow-x-clip bg-[var(--paper)] pb-24">
        <div className="mx-auto min-w-0 max-w-[var(--container)] space-y-12 px-4 sm:px-6 lg:px-8">
          {fishingNow.length > 0 && (
            <ScrollAnimation>
              <div>
                <h2 className="mb-2 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                  Fish this now
                </h2>
                <p className="mb-5 text-sm text-[var(--text-2)]">
                  {monthNow} on the hatch chart — tied plates, not a catch report.
                </p>
                {photoPlates.length > 0 ? (
                  <ul className="grid grid-cols-2 border-t border-l border-[var(--border)] sm:grid-cols-3">
                    {photoPlates.map(({ key, hatch, plate }) => {
                      const inner = (
                        <>
                          <div className="relative aspect-square w-full bg-[var(--plate)]">
                            <SafeEntityImage
                              src={plate.imageUrl!}
                              alt={plate.name}
                              title={plate.name}
                              contain
                              className="object-contain"
                              sizes="33vw"
                            />
                          </div>
                          <p className="mt-2 font-display text-sm font-semibold text-[var(--ink)]">
                            {plate.name}
                          </p>
                          <p className="mt-0.5 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]">
                            {[hatch.insect, hatch.size].filter(Boolean).join(" · ")}
                          </p>
                        </>
                      );
                      return (
                        <li key={key} className="border-b border-r border-[var(--border)] p-3">
                          {plate.href ? <Link href={plate.href} className="block">{inner}</Link> : inner}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                {typePlates.length > 0 ? (
                  <ul className={`${photoPlates.length > 0 ? "mt-2" : ""} border-t border-[var(--border)]`}>
                    {typePlates.map(({ key, hatch, plate }) => {
                      const row = (
                        <>
                          <p className="font-display text-sm font-semibold text-[var(--ink)]">
                            {plate.name}
                          </p>
                          <p className="mt-0.5 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]">
                            {[hatch.insect, hatch.size].filter(Boolean).join(" · ")}
                          </p>
                        </>
                      );
                      return (
                        <li key={key} className="border-b border-[var(--border)] py-3">
                          {plate.href ? <Link href={plate.href} className="block">{row}</Link> : row}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
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
              <div className="space-y-6 border-t border-[var(--border)]">
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
                        className="border-b border-[var(--border)] py-3"
                      >
                        <h3 className="font-display text-base font-semibold text-[var(--ink)]">{ap.name}</h3>
                        {ap.description && (
                          <p className="mt-0.5 text-sm text-[var(--text-2)]">{ap.description}</p>
                        )}
                        <p className="mt-1 font-ui text-[12px] uppercase tracking-[0.08em] text-[var(--text-3)]">
                          <span className="num">
                            {ap.latitude.toFixed(4)}, {ap.longitude.toFixed(4)}
                          </span>
                          {ap.parking ? " · Parking" : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <LazyMapView
                latitude={river.latitude}
                longitude={river.longitude}
                zoom={9}
                markers={mapMarkers}
                bounds={river.mapBounds}
                tone="desk"
                className="mt-6 h-[280px] w-full overflow-hidden border border-[var(--border)]"
              />
            </div>
          </ScrollAnimation>

          <RiverPhotoStrip riverId={river.id} riverSlug={river.slug} riverName={river.name} />

          {river.regulations && (
            <ScrollAnimation>
              <div className="border-t border-[var(--border)] pt-8">
                <h2 className="mb-3 font-heading text-2xl font-semibold text-[var(--ink)]">
                  Regulations
                </h2>
                <p className="max-w-[var(--prose)] text-[17px] leading-relaxed text-[var(--text-2)]">
                  {river.regulations}
                </p>
                <p className="mt-3 font-ui text-[12px] uppercase tracking-[0.08em] text-[var(--text-3)]">
                  Verify with{" "}
                  <a
                    href={regsSource.url}
                    className="text-[var(--accent)] underline underline-offset-4"
                    rel="noopener noreferrer"
                  >
                    {regsSource.label}
                  </a>
                  . Retrieved {regsSource.retrievedOn}.
                </p>
              </div>
            </ScrollAnimation>
          )}

          {(nearbyLodges.length > 0 || nearbyGuides.length > 0 || destFlyShops.length > 0) && (
            <ScrollAnimation>
              <div>
                <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                  On this river
                </h2>
                <div className="space-y-6">
                  {nearbyLodges.length > 0 && (
                    <div className="border-t border-[var(--border)]">
                      <h3 className="ea-overline pt-4">Lodges</h3>
                      <ul>
                        {nearbyLodges.slice(0, 6).map((lodge) => (
                          <li key={lodge.id} className="border-b border-[var(--border)] py-2">
                            <Link href={`/lodges/${lodge.slug}`} className="font-display text-[17px] font-semibold text-[var(--ink)] hover:text-[var(--accent)]">
                              {lodge.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {nearbyGuides.length > 0 && (
                    <div className="border-t border-[var(--border)]">
                      <h3 className="ea-overline pt-4">Guides</h3>
                      <ul>
                        {nearbyGuides.map((guide) => (
                          <li key={guide.id} className="border-b border-[var(--border)] py-2">
                            <Link href={`/guides/${guide.slug}`} className="font-display text-[17px] font-semibold text-[var(--ink)] hover:text-[var(--accent)]">
                              {guide.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {destFlyShops.length > 0 && (
                    <div className="border-t border-[var(--border)]">
                      <h3 className="ea-overline pt-4">Fly shops</h3>
                      <ul>
                        {destFlyShops.slice(0, 4).map((shop) => (
                          <li key={shop.id} className="border-b border-[var(--border)] py-2">
                            <Link href={`/fly-shops/${shop.slug}`} className="font-display text-[17px] font-semibold text-[var(--ink)] hover:text-[var(--accent)]">
                              {shop.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </ScrollAnimation>
          )}

          {river.slug === "madison-river" && (
            <ScrollAnimation>
              <div className="border-t border-[var(--border)] pt-8">
                <p className="ea-overline">Field note</p>
                <Link
                  href="/articles/best-flies-for-the-madison-river-2026"
                  className="mt-2 inline-block font-display text-xl font-semibold text-[var(--ink)] hover:text-[var(--accent)]"
                >
                  Best Flies for the Madison River in 2026
                </Link>
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
              <div className="border-t border-[var(--border)] pt-8">
                <h2 className="mb-3 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                  Nearby rivers
                </h2>
                <ul>
                  {nearbyRivers.map((near) => (
                    <li key={near.id} className="border-b border-[var(--border)] py-2">
                      <Link href={`/rivers/${near.slug}`} className="font-display text-[17px] font-semibold text-[var(--ink)] hover:text-[var(--accent)]">
                        {near.name}
                      </Link>
                      <span className="ml-3 font-ui text-[12px] uppercase tracking-[0.08em] text-[var(--text-3)]">
                        {waterTypeLabel(near.flowType) ?? ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollAnimation>
          )}

          <div className="border-t border-[var(--border)] py-10">
            <p className="ea-overline">The journal</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">
              Keep a journal on this river
            </h2>
            <Link href={`/journal/new?river=${river.slug}`} className="ea-btn ea-btn-primary mt-5">
              Keep a journal
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
