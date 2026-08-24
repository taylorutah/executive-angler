import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Fish, Star } from "lucide-react";
import HeroSection from "@/components/ui/HeroSection";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EntityCard from "@/components/ui/EntityCard";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import Badge from "@/components/ui/Badge";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import LazyMapView from "@/components/maps/LazyMapView";
import CommunityPhotos from "@/components/ui/CommunityPhotos";
import PhotoSubmissionForm from "@/components/ui/PhotoSubmissionForm";
import AdminHeroEditor from "@/components/admin/AdminHeroEditor";
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
  getArticlesByDestination,
  getFlyShopsByDestination,
  getSpeciesByCommonNames,
  getFliesForDestination,
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

  const [destRivers, destLodges, destGuides, destArticles, destFlyShops, destSpecies, destFlies, galleryPhotos] = await Promise.all([
    getRiversByDestination(dest.id),
    getLodgesByDestination(dest.id),
    getGuidesByDestination(dest.id),
    getArticlesByDestination(dest.id),
    getFlyShopsByDestination(dest.id),
    getSpeciesByCommonNames(dest.primarySpecies || []),
    getFliesForDestination(dest.id),
    getApprovedPhotosByEntity("destination", dest.id),
  ]);

  const essayImages = [
    ...galleryPhotos
      .filter((p) => isUsableImageUrl(p.photoUrl))
      .map((p) => ({
        src: p.photoUrl,
        alt: p.caption || dest.name,
        caption: p.caption,
      })),
    ...destRivers
      .filter((r) => isUsableImageUrl(r.heroImageUrl))
      .map((r) => ({
        src: r.heroImageUrl as string,
        alt: r.name,
        caption: r.name,
      })),
  ].slice(0, 2);

  if (essayImages.length === 0 && isUsableImageUrl(dest.heroImageUrl)) {
    essayImages.push({
      src: dest.heroImageUrl,
      alt: dest.heroImageAlt || dest.name,
      caption: dest.name,
    });
  }

  const mapMarkers = [
    ...destRivers.map((r) => ({
      latitude: r.latitude,
      longitude: r.longitude,
      title: r.name,
      description: `${r.flowType} · ${(r.primarySpecies || []).join(", ")}`,
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
          <div className="max-w-4xl">
            <SeasonalChart placeName={dest.name} bestMonths={dest.bestMonths || []} />
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface-page)] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PlaceEssay description={dest.description} images={essayImages} />

          {(dest.primarySpecies || []).length > 0 && (
            <div className="entity-tags mt-8">
              {(dest.primarySpecies || []).map((speciesName) => {
                const matched = destSpecies.find(
                  (s) => s.commonName.toLowerCase() === speciesName.toLowerCase()
                );
                const badge = (
                  <Badge key={speciesName} variant="forest" size="md">
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
          )}

          {(dest.licenseInfo || dest.elevationRange || dest.climateNotes || dest.regulationsSummary) && (
            <dl className="mt-10 grid grid-cols-1 gap-6 border-t border-[var(--border-rule)] pt-8 sm:grid-cols-2">
              {dest.elevationRange ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-meta)]">
                    Elevation
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--text-body)]">{dest.elevationRange}</dd>
                </div>
              ) : null}
              {dest.licenseInfo ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-meta)]">
                    License
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--text-body)]">{dest.licenseInfo}</dd>
                </div>
              ) : null}
              {dest.climateNotes ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-meta)]">
                    Climate
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--text-body)]">{dest.climateNotes}</dd>
                </div>
              ) : null}
              {dest.regulationsSummary ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-meta)]">
                    Regulations
                    <span className="ml-2 font-normal normal-case tracking-normal text-[var(--text-meta)]">
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

            {dest.slug === "montana" && (
              <ScrollAnimation>
                <div className="mt-12">
                  <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-4">
                    Montana rivers at a glance
                  </h3>
                  <p className="text-[var(--text-body)] text-base leading-[1.8] mb-4">
                    Use this as a trip-planning table, not a live report. Open each river for the hatch chart and gauge. Fly lists live at{" "}
                    <Link href="/flies/for/madison-river" className="text-[var(--text-primary)] underline decoration-[var(--border-rule)] hover:text-[var(--action)]">
                      /flies/for/[slug]
                    </Link>
                    .
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-[var(--border-rule)]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[var(--surface-raised)] text-left text-[var(--text-body)]">
                          <th className="px-4 py-3 font-medium">River</th>
                          <th className="px-4 py-3 font-medium">Flow</th>
                          <th className="px-4 py-3 font-medium">Wade / float</th>
                          <th className="px-4 py-3 font-medium">Best months</th>
                          <th className="px-4 py-3 font-medium">Flies</th>
                        </tr>
                      </thead>
                      <tbody>
                        {destRivers.slice(0, 8).map((r) => (
                          <tr key={r.id} className="border-t border-[var(--border-rule)]">
                            <td className="px-4 py-2.5">
                              <Link
                                href={`/rivers/${r.slug}`}
                                className="text-[var(--text-primary)] underline decoration-[var(--border-rule)] hover:text-[var(--action)]"
                              >
                                {r.name}
                              </Link>
                            </td>
                            <td className="px-4 py-2.5 text-[var(--text-body)]">{r.flowType}</td>
                            <td className="px-4 py-2.5 text-[var(--text-body)]">{r.wadingType}</td>
                            <td className="px-4 py-2.5 text-[var(--text-body)]">
                              {(r.bestMonths ?? []).slice(0, 3).join(", ") || "—"}
                            </td>
                            <td className="px-4 py-2.5">
                              <Link
                                href={`/flies/for/${r.slug}`}
                                className="text-[var(--text-primary)] underline decoration-[var(--border-rule)] hover:text-[var(--action)]"
                              >
                                Fly list
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </ScrollAnimation>
            )}
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
              <LazyMapView
                latitude={dest.latitude}
                longitude={dest.longitude}
                zoom={7}
                markers={mapMarkers}
                className="h-[450px] w-full rounded-xl overflow-hidden shadow-md"
              />
              <div className="mt-3 flex gap-4 text-xs text-[var(--text-body)]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-river" /> Rivers
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[var(--action)]" /> Lodges
                </span>
              </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {destGuides.length > 0 && (
              <ScrollAnimation>
                <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-6">
                  Guides
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {destGuides.map((guide) => (
                    <Link
                      key={guide.id}
                      href={`/guides/${guide.slug}`}
                      className="flex items-center gap-4 p-4 bg-[var(--surface-page)] rounded-xl border border-[var(--border-rule)] card-hover"
                    >
                      <div>
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
                      </div>
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
                      className="flex items-center justify-between p-4 bg-[var(--surface-page)] rounded-xl border border-[var(--border-rule)] card-hover"
                    >
                      <div>
                        <h4 className="font-heading text-base font-semibold text-[var(--text-primary)]">
                          {shop.name}
                        </h4>
                        <p className="text-sm text-[var(--text-body)] mt-0.5">{shop.address}</p>
                        {(shop.services || []).length > 0 && (
                          <p className="text-xs text-[var(--text-meta)] mt-1">
                            {(shop.services || []).slice(0, 3).join(" · ")}
                          </p>
                        )}
                      </div>
                      {shop.googleRating && (
                        <div className="flex items-center gap-1 shrink-0 ml-4">
                          <Star className="h-3.5 w-3.5 fill-[var(--action)] text-[var(--action)]" />
                          <span className="text-sm font-medium text-[var(--text-body)]">
                            {shop.googleRating}
                          </span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </ScrollAnimation>
            )}
          </div>
        </section>
      )}

      {destFlies.length > 0 && (
        <section className="bg-[var(--surface-page)] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollAnimation>
              <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-6">
                Flies for {dest.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {destFlies.slice(0, 8).map((fly) => (
                  <EntityCard
                    key={fly.id}
                    href={`/flies/${fly.slug}`}
                    imageUrl={fly.heroImageUrl || ""}
                    imageAlt={fly.name}
                    title={fly.name}
                    subtitle={fly.category.charAt(0).toUpperCase() + fly.category.slice(1)}
                    meta={(fly.effectiveSpecies || []).slice(0, 3).join(" · ") || undefined}
                    iconOnly={!fly.heroImageUrl}
                  />
                ))}
              </div>
            </ScrollAnimation>
          </div>
        </section>
      )}

      {destArticles.length > 0 && (
        <section className="bg-[var(--surface-page)] pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-6">
              Field notes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {destArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="block p-4 rounded-xl border border-[var(--border-rule)] hover:border-[var(--border-strong)] transition-colors"
                >
                  <p className="text-base font-heading font-semibold text-[var(--text-primary)]">
                    {article.title}
                  </p>
                  <p className="text-xs text-[var(--text-meta)] mt-1">
                    {article.readingTimeMinutes} min read
                  </p>
                </Link>
              ))}
            </div>
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
