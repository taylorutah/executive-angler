/**
 * /destinations/[slug] — place template (Water Desk §2.4).
 *
 * DestinationPlate header, rivers, season, species. Directories appear
 * contextually per river, never as a browsable alphabetical wall.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import LazyMapView from "@/components/maps/LazyMapView";
import CommunityPhotos from "@/components/ui/CommunityPhotos";
import PhotoSubmissionForm from "@/components/ui/PhotoSubmissionForm";
import AdminHeroEditor from "@/components/admin/AdminHeroEditor";
import DestinationPlate from "@/components/destinations/DestinationPlate";
import SeasonalChart from "@/components/destinations/SeasonalChart";
import PlaceEssay from "@/components/destinations/PlaceEssay";
import PlaceRiverGrid from "@/components/destinations/PlaceRiverGrid";
import PlaceRiverDirectories from "@/components/destinations/PlaceRiverDirectories";
import { isUsableImageUrl } from "@/lib/media/image-url";
import { claimImageUrl } from "@/components/home/homepage-images";
import { SITE_URL } from "@/lib/constants";
import {
  getAllDestinations,
  getDestinationBySlug,
  getRiversByDestination,
  getLodgesByDestination,
  getGuidesByDestination,
  getFlyShopsByDestination,
  getApprovedPhotosByEntity,
} from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest) notFound();

  const speciesList = (dest.primarySpecies || []).slice(0, 3).join(", ");
  const speciesCount = (dest.primarySpecies || []).length;
  const bestMonths = (dest.bestMonths || []).slice(0, 3).join(", ");
  const geo = dest.state || dest.country || dest.region || "";
  const fallbackTitle = `${dest.name} Fly Fishing — ${geo} Guide to Rivers, Lodges & Hatches | Executive Angler`;
  const fallbackDesc = `Plan your ${dest.name} fly fishing trip.${speciesCount > 0 ? ` Target ${speciesCount} species including ${speciesList}.` : ""}${bestMonths ? ` Best months: ${bestMonths}.` : ""} Rivers, lodges, guides & hatch charts.`;

  return {
    title: { absolute: dest.metaTitle || fallbackTitle },
    description: dest.metaDescription || fallbackDesc,
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
export const dynamicParams = false;

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest) notFound();

  const [destRivers, destLodges, destGuides, destFlyShops, galleryPhotos] = await Promise.all([
    getRiversByDestination(dest.id),
    getLodgesByDestination(dest.id),
    getGuidesByDestination(dest.id),
    getFlyShopsByDestination(dest.id),
    getApprovedPhotosByEntity("destination", dest.id),
  ]);

  const claimed = new Set<string>();
  claimImageUrl(dest.heroImageUrl, claimed);
  for (const river of destRivers) claimImageUrl(river.heroImageUrl, claimed);

  const essayImages = galleryPhotos
    .filter((p) => isUsableImageUrl(p.photoUrl) && claimImageUrl(p.photoUrl, claimed))
    .map((p) => ({
      src: p.photoUrl,
      alt: p.caption || dest.name,
      caption: p.caption,
    }))
    .slice(0, 2);

  const mapMarkers = [
    ...destRivers.map((r) => ({
      latitude: r.latitude,
      longitude: r.longitude,
      title: r.name,
      description: `${r.flowType} · ${(r.primarySpecies || []).join(", ")}`,
    })),
    ...destLodges.map((l) => ({
      latitude: l.latitude,
      longitude: l.longitude,
      title: l.name,
      description: l.priceRange || "Lodge",
    })),
  ];

  const regionLabel = [dest.state, dest.country].filter(Boolean).join(" · ") || dest.region;

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
        <DestinationPlate
          name={dest.name}
          tagline={dest.tagline}
          heroImageUrl={dest.heroImageUrl}
          heroImageAlt={dest.heroImageAlt || `Fly fishing in ${dest.name}`}
          heroImageCredit={dest.heroImageCredit}
          heroImageCreditUrl={dest.heroImageCreditUrl}
          bestMonths={dest.bestMonths || []}
          primarySpecies={dest.primarySpecies || []}
          region={regionLabel}
          toolbar={
            <div className="flex items-center justify-between gap-3">
              <Breadcrumbs
                items={[
                  { label: "Places", href: "/destinations" },
                  { label: dest.name },
                ]}
              />
              <FavoriteButton entityType="destination" entityId={dest.id} />
            </div>
          }
        />
        <div className="absolute top-4 right-4 z-20">
          <AdminHeroEditor
            entityType="destinations"
            entityId={dest.id}
            currentImageUrl={dest.heroImageUrl}
            currentAlt={dest.heroImageAlt}
            currentCredit={dest.heroImageCredit}
            currentCreditUrl={dest.heroImageCreditUrl}
          />
        </div>
      </div>

      {destRivers.length > 0 && (
        <section className="bg-[var(--paper)] pb-16">
          <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
              Rivers of this place
            </h2>
            <p className="mt-2 mb-8 text-sm text-[var(--text-2)]">
              {destRivers.length} {destRivers.length === 1 ? "river" : "rivers"} documented here.
            </p>
            <PlaceRiverGrid
              rivers={destRivers.map((river) => ({
                id: river.id,
                slug: river.slug,
                name: river.name,
                heroImageUrl: river.heroImageUrl,
                primarySpecies: river.primarySpecies || [],
                flowType: river.flowType,
                difficulty: river.difficulty,
                wadingType: river.wadingType,
              }))}
            />
          </div>
        </section>
      )}

      <section className="bg-[var(--paper)] pb-10">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <SeasonalChart placeName={dest.name} bestMonths={dest.bestMonths || []} />
        </div>
      </section>

      <section className="bg-[var(--paper)] pb-16">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <PlaceEssay description={dest.description} images={essayImages} />

          {(dest.licenseInfo || dest.elevationRange || dest.climateNotes || dest.regulationsSummary) && (
            <dl className="mt-10 grid grid-cols-1 gap-6 border-t border-[var(--border)] pt-8 sm:grid-cols-2">
              {dest.elevationRange ? (
                <div>
                  <dt className="ea-overline">
                    Elevation
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--text-2)]">{dest.elevationRange}</dd>
                </div>
              ) : null}
              {dest.licenseInfo ? (
                <div>
                  <dt className="ea-overline">
                    License
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--text-2)]">{dest.licenseInfo}</dd>
                </div>
              ) : null}
              {dest.climateNotes ? (
                <div className="sm:col-span-2">
                  <dt className="ea-overline">
                    Climate
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--text-2)]">{dest.climateNotes}</dd>
                </div>
              ) : null}
              {dest.regulationsSummary ? (
                <div className="sm:col-span-2">
                  <dt className="ea-overline">
                    Regulations
                    <span className="ml-2 font-normal normal-case tracking-normal text-[var(--text-2)]">
                      check current rules before you go
                    </span>
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--text-2)]">{dest.regulationsSummary}</dd>
                </div>
              ) : null}
            </dl>
          )}
        </div>
      </section>

      {dest.slug === "belize" && (
        <section className="bg-[var(--paper)] pb-16">
          <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
            <div className="prose max-w-[var(--prose)]">
              <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
                Permit, bonefish, and tarpon
              </h2>
              <p>
                Belize is permit country that also holds bonefish and tarpon. Plan a week around tides and a guide, not around a morning that has to be a grand slam. Species pages for{" "}
                <Link href="/species/permit" className="text-[var(--text-1)] underline decoration-[var(--border)] hover:text-[var(--accent)]">
                  permit
                </Link>
                ,{" "}
                <Link href="/species/bonefish" className="text-[var(--text-1)] underline decoration-[var(--border)] hover:text-[var(--accent)]">
                  bonefish
                </Link>
                , and{" "}
                <Link href="/species/tarpon" className="text-[var(--text-1)] underline decoration-[var(--border)] hover:text-[var(--accent)]">
                  tarpon
                </Link>
                {" "}sit next to the{" "}
                <Link href="/articles/belize-permit-bonefish-tarpon-flats" className="text-[var(--text-1)] underline decoration-[var(--border)] hover:text-[var(--accent)]">
                  Belize flats guide
                </Link>
                . We do not publish other anglers&apos; fish or GPS.
              </p>
            </div>
          </div>
        </section>
      )}

      {mapMarkers.length > 0 && (
        <section className="bg-[var(--paper)] pb-24">
          <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
            <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
              Map
            </h2>
            <p className="mb-3 text-sm text-[var(--text-2)]">
              Rivers and lodges for this place. Vellum land and Teal water — a desk chart, not a satellite.
            </p>
            <LazyMapView
              latitude={dest.latitude}
              longitude={dest.longitude}
              zoom={7}
              markers={mapMarkers}
              tone="desk"
              className="h-[450px] w-full overflow-hidden border border-[var(--border)]"
            />
          </div>
        </section>
      )}

      <PlaceRiverDirectories
        placeName={dest.name}
        rivers={destRivers.map((r) => ({ id: r.id, slug: r.slug, name: r.name }))}
        lodges={destLodges}
        guides={destGuides}
        flyShops={destFlyShops}
      />

      <section className="bg-[var(--paper)] pb-24">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <CommunityPhotos entityType="destination" entityId={dest.id} />
          <PhotoSubmissionForm entityType="destination" entityId={dest.id} entityName={dest.name} />
        </div>
      </section>
    </>
  );
}
