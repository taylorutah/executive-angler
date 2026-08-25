/**
 * /destinations/[slug] — place page: essay + river catalog.
 *
 * Register: Daylight throughout. `registerForPath` (src/lib/register.ts)
 * only flips to Dusk for /app, /journal, /favorites, and other logged-in
 * product routes — /destinations is not one of them, and nothing on this
 * page asks for that treatment either.
 *
 * No Dusk switch here, on purpose: a place page is an essay and a catalog
 * of rivers, lodges, guides, and shops, not a workbench. There is no live
 * gauge, personal scorecard, or stock/variant tool the way /rivers/[slug]
 * and /flies/[slug] justify a dusk-styled module. The one piece of
 * per-user data on this page — which of these rivers you've fished — is a
 * plain client-fetched line in ordinary Daylight tokens (see
 * PlaceRiverGrid), not a register change.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import HeroSection from "@/components/ui/HeroSection";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import LazyMapView from "@/components/maps/LazyMapView";
import CommunityPhotos from "@/components/ui/CommunityPhotos";
import PhotoSubmissionForm from "@/components/ui/PhotoSubmissionForm";
import AdminHeroEditor from "@/components/admin/AdminHeroEditor";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import SeasonalChart from "@/components/destinations/SeasonalChart";
import PlaceEssay from "@/components/destinations/PlaceEssay";
import PlaceRiverGrid from "@/components/destinations/PlaceRiverGrid";
import { isUsableImageUrl } from "@/lib/media/image-url";
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
  if (!dest) return { title: "Destination Not Found" };

  const speciesList = (dest.primarySpecies || []).slice(0, 3).join(", ");
  const speciesCount = (dest.primarySpecies || []).length;
  const bestMonths = (dest.bestMonths || []).slice(0, 3).join(", ");
  const geo = dest.state || dest.country || dest.region || "";
  const fallbackTitle = `${dest.name} Fly Fishing — ${geo} Guide to Rivers, Lodges & Hatches | Executive Angler`;
  const fallbackDesc = `Plan your ${dest.name} fly fishing trip.${speciesCount > 0 ? ` Target ${speciesCount} species including ${speciesList}.` : ""}${bestMonths ? ` Best months: ${bestMonths}.` : ""} Rivers, lodges, guides & hatch charts. Plan your trip today.`;

  return {
    title: { absolute: dest.metaTitle || fallbackTitle },
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

  const [destRivers, destLodges, destGuides, destFlyShops, galleryPhotos] = await Promise.all([
    getRiversByDestination(dest.id),
    getLodgesByDestination(dest.id),
    getGuidesByDestination(dest.id),
    getFlyShopsByDestination(dest.id),
    getApprovedPhotosByEntity("destination", dest.id),
  ]);

  // River heroes belong to the river grid below. Reusing one as an essay plate
  // printed the same photograph twice on the page, so the essay draws only on
  // community photos of the place itself.
  const essayImages = galleryPhotos
    .filter((p) => isUsableImageUrl(p.photoUrl))
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
          height="h-[70vh]"
          imageCredit={dest.heroImageCredit}
          imageCreditUrl={dest.heroImageCreditUrl}
          creditStyle="overlay"
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

      <div className="bg-[var(--surface-page)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <Breadcrumbs
              items={[
                { label: "Places", href: "/destinations" },
                { label: dest.name },
              ]}
            />
            <FavoriteButton entityType="destination" entityId={dest.id} />
          </div>
        </div>
      </div>

      <section className="bg-[var(--surface-page)] pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SeasonalChart placeName={dest.name} bestMonths={dest.bestMonths || []} />
        </div>
      </section>

      <section className="bg-[var(--surface-page)] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PlaceEssay description={dest.description} images={essayImages} />

          {(dest.licenseInfo || dest.elevationRange || dest.climateNotes || dest.regulationsSummary) && (
            <dl className="mt-10 grid grid-cols-1 gap-6 border-t border-[var(--border-rule)] pt-8 sm:grid-cols-2">
              {dest.elevationRange ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-body)]">
                    Elevation
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--text-body)]">{dest.elevationRange}</dd>
                </div>
              ) : null}
              {dest.licenseInfo ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-body)]">
                    License
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--text-body)]">{dest.licenseInfo}</dd>
                </div>
              ) : null}
              {dest.climateNotes ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-body)]">
                    Climate
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--text-body)]">{dest.climateNotes}</dd>
                </div>
              ) : null}
              {dest.regulationsSummary ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-body)]">
                    Regulations
                    <span className="ml-2 font-normal normal-case tracking-normal text-[var(--text-body)]">
                      check current rules before you go
                    </span>
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--text-body)]">{dest.regulationsSummary}</dd>
                </div>
              ) : null}
            </dl>
          )}
        </div>
      </section>

      {dest.slug === "belize" && (
        <section className="bg-[var(--surface-page)] pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="prose">
              <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
                Permit, bonefish, and tarpon
              </h2>
              <p>
                Belize is permit country that also holds bonefish and tarpon. Plan a week around tides and a guide, not around a morning that has to be a grand slam. Species pages for{" "}
                <Link href="/species/permit" className="text-[var(--text-primary)] underline decoration-[var(--border-rule)] hover:text-[var(--action)]">
                  permit
                </Link>
                ,{" "}
                <Link href="/species/bonefish" className="text-[var(--text-primary)] underline decoration-[var(--border-rule)] hover:text-[var(--action)]">
                  bonefish
                </Link>
                , and{" "}
                <Link href="/species/tarpon" className="text-[var(--text-primary)] underline decoration-[var(--border-rule)] hover:text-[var(--action)]">
                  tarpon
                </Link>
                {" "}sit next to the{" "}
                <Link href="/articles/belize-permit-bonefish-tarpon-flats" className="text-[var(--text-primary)] underline decoration-[var(--border-rule)] hover:text-[var(--action)]">
                  Belize flats guide
                </Link>
                . We do not publish other anglers&apos; fish or GPS.
              </p>
            </div>
          </div>
        </section>
      )}

      {destRivers.length > 0 && (
        <section className="bg-[var(--surface-page)] pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollAnimation>
              <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
                Rivers of this place
              </h2>
              <p className="mt-2 mb-8 text-sm text-[var(--text-body)]">
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
            </ScrollAnimation>
          </div>
        </section>
      )}

      {mapMarkers.length > 0 && (
        <section className="bg-[var(--surface-page)] pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollAnimation>
              <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-4">
                Map
              </h2>
              <p className="mb-3 text-sm text-[var(--text-body)]">
                Rivers and lodges for this place. Vellum land and Teal water — a desk chart, not a satellite.
              </p>
              <LazyMapView
                latitude={dest.latitude}
                longitude={dest.longitude}
                zoom={7}
                markers={mapMarkers}
                tone="desk"
                className="h-[450px] w-full overflow-hidden border border-[var(--border-rule)]"
              />
            </ScrollAnimation>
          </div>
        </section>
      )}

      {(destLodges.length > 0 || destGuides.length > 0 || destFlyShops.length > 0) && (
        <section className="bg-[var(--surface-raised)] border-t border-[var(--border-rule)] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">
            <div>
              <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
                On the ground
              </h2>
              <p className="mt-2 text-sm text-[var(--text-body)]">
                Lodges, guides, and shops for this place — reached from the water, not as a directory.
              </p>
            </div>

            {destLodges.length > 0 && (
              <ScrollAnimation>
                <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-6">
                  Lodges
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {destLodges.map((lodge) => (
                    <Link
                      key={lodge.id}
                      href={`/lodges/${lodge.slug}`}
                      className="flex gap-4 border border-[var(--border-rule)] bg-[var(--surface-page)] p-4 transition-colors hover:bg-[var(--surface-card)]"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-[var(--surface-card)]">
                        <SafeEntityImage
                          src={lodge.heroImageUrl}
                          alt={lodge.name}
                          title={lodge.name}
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-heading text-base font-semibold text-[var(--text-primary)]">
                          {lodge.name}
                        </h4>
                        {lodge.priceRange && (
                          <p className="text-sm text-[var(--text-body)] mt-0.5">{lodge.priceRange}</p>
                        )}
                        {lodge.seasonStart && lodge.seasonEnd && (
                          <p className="text-xs text-[var(--text-body)] mt-1">
                            {lodge.seasonStart}–{lodge.seasonEnd}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollAnimation>
            )}

            {destGuides.length > 0 && (
              <ScrollAnimation>
                <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-6">
                  Guides
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {destGuides.map((guide) => (
                    <Link
                      key={guide.id}
                      href={`/guides/${guide.slug}`}
                      className="block border border-[var(--border-rule)] bg-[var(--surface-page)] p-4 transition-colors hover:bg-[var(--surface-card)]"
                    >
                      <h4 className="font-heading text-base font-semibold text-[var(--text-primary)]">
                        {guide.name}
                      </h4>
                      <p className="text-sm text-[var(--text-body)] mt-0.5">
                        {(guide.specialties || []).slice(0, 3).join(", ")}
                      </p>
                      {guide.dailyRate && (
                        <p className="text-sm font-medium text-[var(--text-body)] mt-1">
                          {guide.dailyRate}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </ScrollAnimation>
            )}

            {destFlyShops.length > 0 && (
              <ScrollAnimation>
                <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-6">
                  Fly shops
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {destFlyShops.slice(0, 6).map((shop) => (
                    <Link
                      key={shop.id}
                      href={`/fly-shops/${shop.slug}`}
                      className="flex items-start gap-4 border border-[var(--border-rule)] bg-[var(--surface-page)] p-4 transition-colors hover:bg-[var(--surface-card)]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <h4 className="font-heading text-base font-semibold text-[var(--text-primary)]">
                            {shop.name}
                          </h4>
                          {shop.googleRating && (
                            <span className="shrink-0 text-xs text-[var(--text-body)]">
                              {shop.googleRating} rating
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-body)] mt-0.5">{shop.address}</p>
                        {(shop.services || []).length > 0 && (
                          <p className="text-xs text-[var(--text-body)] mt-1">
                            {(shop.services || []).slice(0, 3).join(" · ")}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollAnimation>
            )}
          </div>
        </section>
      )}

      <section className="bg-[var(--surface-page)] pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CommunityPhotos entityType="destination" entityId={dest.id} />
          <PhotoSubmissionForm entityType="destination" entityId={dest.id} entityName={dest.name} />
        </div>
      </section>
    </>
  );
}
