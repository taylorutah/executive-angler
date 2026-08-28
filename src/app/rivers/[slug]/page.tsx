import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import HomeGutter from "@/components/home/HomeGutter";
import RiverHeroImage from "@/components/ui/RiverHeroImage";
import ReportButton from "@/components/ui/ReportButton";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import PersonalFlowOverlay from "@/components/rivers/PersonalFlowOverlay";
import PersonalRiverScorecard from "@/components/rivers/PersonalRiverScorecard";
import BestWindowCalculator from "@/components/rivers/BestWindowCalculator";
import { HERO_IMAGE } from "@/components/home/hero-copy";
import HatchSeasonGrid from "@/components/rivers/HatchSeasonGrid";
import RiverDeskBody from "@/components/rivers/RiverDeskBody";
import AdminHeroEditor from "@/components/admin/AdminHeroEditor";
import { SITE_URL } from "@/lib/constants";
import { formatHeroCaptionDate } from "@/components/home/hero-copy";
import { currentHatchMonth } from "@/lib/flies/fishing-now";
import { hatchRailFromChart, weekFliesFromChart } from "@/lib/rivers/week-flies";
import {
  getAllRivers,
  getRiverBySlug,
  getDestinationById,
  getAllCanonicalFlies,
  getApprovedPhotosByEntity,
  getArticlesByRiver,
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
  const fallbackTitle = `${river.name} Fly Fishing — ${flowLabel || "Prime"} Water for ${speciesList || "Trout"} | Executive Angler`;
  const fallbackDesc = `${river.name}: ${river.lengthMiles ? river.lengthMiles + " miles, " : ""}${river.difficulty || "all-level"} ${river.flowType || ""} water.${speciesList ? ` Target ${speciesList}.` : ""} Hatch charts and trip planning.`;

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

  const [dest, additionalDests, allFlies, galleryPhotos, riverNotes] = await Promise.all([
    river.destinationId ? getDestinationById(river.destinationId) : Promise.resolve(undefined),
    Promise.all((river.additionalDestinationIds ?? []).map((id) => getDestinationById(id))),
    getAllCanonicalFlies(),
    getApprovedPhotosByEntity("river", river.id),
    getArticlesByRiver(river.id),
  ]);

  const monthNow = currentHatchMonth();
  const fishingNow = (river.hatchChart ?? []).find(
    (m) => m.month.toLowerCase() === monthNow.toLowerCase(),
  )?.hatches ?? [];
  const weekFlies = weekFliesFromChart(fishingNow, allFlies);
  const hatchRail = hatchRailFromChart(fishingNow);
  const fieldNote = riverNotes[0]
    ? { slug: riverNotes[0].slug, title: riverNotes[0].title, excerpt: riverNotes[0].excerpt }
    : null;

  const heroSubtitle =
    river.slug === "madison-river"
      ? "Montana  ·  Gallatin County"
      : [...new Set([dest?.state, dest?.name].filter(Boolean))].join(" · ");
  const heroMeta =
    river.slug === "madison-river"
      ? ["Hebgen to Ennis", formatHeroCaptionDate()].join(" · ")
      : [
          (river.flowType ?? "").replace(/-/g, " "),
          dest?.state ?? dest?.name,
        ]
          .filter(Boolean)
          .join(" · ");

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

      {river.heroImageUrl === HERO_IMAGE.src ? (
        <link
          rel="preload"
          as="image"
          href={HERO_IMAGE.mobileWebp}
          type="image/webp"
          media="(max-width: 1024px)"
          fetchPriority="high"
        />
      ) : null}

      <RiverHeroImage
        heroImageUrl={river.heroImageUrl}
        heroImageAlt={river.heroImageAlt || `${river.name} fly fishing`}
        heroImageCredit={river.heroImageCredit}
        heroImageCreditUrl={river.heroImageCreditUrl}
        galleryPhotos={galleryPhotos}
        title={river.name}
        subtitle={heroSubtitle || undefined}
        meta={heroMeta || undefined}
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

      <div className="border-b border-[var(--border-rule)] bg-[var(--paper)]">
        <HomeGutter className="py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
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
            <div className="mt-0.5 flex shrink-0 items-center gap-3">
              <Link
                href={`/plan/${river.slug}`}
                className="text-sm font-semibold text-[var(--text-primary)] underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--action)] hover:decoration-[var(--action)]"
              >
                Trip brief →
              </Link>
              <ReportButton entityType="river" entityId={river.id} />
              <FavoriteButton entityType="river" entityId={river.id} />
            </div>
          </div>
        </HomeGutter>
      </div>

      <RiverDeskBody
        riverId={river.id}
        riverName={river.name}
        description={river.description}
        usgsGaugeId={river.usgsGaugeId ?? null}
        riverLatitude={river.latitude}
        riverLongitude={river.longitude}
        regulations={river.regulations}
        weekFlies={weekFlies}
        hatchRail={hatchRail}
        fieldNote={fieldNote}
      />

      <section className="bg-[var(--paper)]">
        <HomeGutter className="space-y-6 pb-8">
          <PersonalFlowOverlay riverId={river.id} />
          <PersonalRiverScorecard riverId={river.id} riverName={river.name} />
          <BestWindowCalculator riverId={river.id} />
        </HomeGutter>
      </section>

      {river.hatchChart && river.hatchChart.length > 0 ? (
        <section className="bg-[var(--paper)] pb-20">
          <HomeGutter>
            <HatchSeasonGrid
              hatchChart={river.hatchChart}
              bestMonths={river.bestMonths || []}
            />
          </HomeGutter>
        </section>
      ) : null}
    </>
  );
}
