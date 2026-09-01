import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import GazetteRiverReport, { platesFromHatches } from "@/components/gazette/GazetteRiverReport";
import {
  getAllArticles,
  getAllCanonicalFlies,
  getAllRivers,
  getDestinationById,
  getRiverBySlug,
} from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import { regulationSource } from "@/lib/rivers/regulations";
import { FLAGSHIP_RIVERS, primaryGauge, selectFlagshipRivers } from "@/components/home/conditions";
import { loadFlagshipGaugePayload } from "@/components/home/flagship-cache";
import { GazetteClock } from "@/lib/gazette/date";
import { HERO_IMAGE } from "@/components/home/hero-copy";

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
    description: river.metaDescription || fallbackDesc,
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

  const [dest, allFlies, articles] = await Promise.all([
    river.destinationId ? getDestinationById(river.destinationId) : Promise.resolve(undefined),
    getAllCanonicalFlies(),
    getAllArticles().catch(() => []),
  ]);

  const monthNow = new Date().toLocaleString("en-US", {
    month: "long",
    timeZone: "America/Denver",
  });
  const fishingNow =
    (river.hatchChart ?? []).find((m) => m.month.toLowerCase() === monthNow.toLowerCase())
      ?.hatches ?? [];
  const plates = platesFromHatches(fishingNow, allFlies);

  const destState = dest?.state;
  const destCountry = dest?.country;
  const destSlug = dest?.slug;
  const place = destState || dest?.name || destCountry || "";
  const meta = [
    place,
    (river.flowType ?? "").replace(/-/g, " "),
    river.lengthMiles ? `${river.lengthMiles} miles` : "",
  ]
    .filter(Boolean)
    .join("  ·  ")
    .toUpperCase();
  const crumbs = [
    { label: "Rivers", href: "/rivers" },
    ...(dest
      ? [{ label: dest.name, href: `/destinations/${dest.slug}` }]
      : place
        ? [{ label: place }]
        : []),
    { label: river.name },
  ];

  const gauge = primaryGauge(river.usgsGaugeId, river.name);
  const preferredAccess = ["Three Dollar Bridge FAS", "Lyons Bridge FAS", "Varney Bridge FAS"];
  const accessPoints = [...(river.accessPoints ?? [])].sort((a, b) => {
    const ai = preferredAccess.findIndex((name) => a.name.startsWith(name.replace(" FAS", "")));
    const bi = preferredAccess.findIndex((name) => b.name.startsWith(name.replace(" FAS", "")));
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  }).slice(0, 3);

  const fieldNote =
    articles.find(
      (article) =>
        article.relatedRiverIds?.includes(river.id) ||
        article.title.toLowerCase().includes(river.name.toLowerCase().replace(/ river$/, "")),
    ) ?? null;
  const flagship = FLAGSHIP_RIVERS.some((row) => row.slug === river.slug)
    ? selectFlagshipRivers([river])[0]
    : undefined;
  const gauges = flagship
    ? await loadFlagshipGaugePayload([flagship]).catch(() => null)
    : null;

  const regsSource = regulationSource({
    riverSlug: river.slug,
    destinationSlug: destSlug,
    destinationState: destState,
    destinationCountry: destCountry,
  });

  const evidenceSrc =
    river.slug === "madison-river"
      ? HERO_IMAGE.src
      : river.heroImageUrl;
  const evidencePhoto = evidenceSrc
    ? {
        src: evidenceSrc,
        alt:
          river.heroImageAlt ||
          (river.slug === "madison-river"
            ? HERO_IMAGE.alt
            : `${river.name} fly fishing`),
        caption: [place || river.name, GazetteClock.photoDay()].filter(Boolean).join("  ·  "),
      }
    : undefined;

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
            ? { keywords: river.primarySpecies.join(", ") }
            : {}),
        }}
      />
      <GazetteRiverReport
        river={river}
        crumbs={crumbs}
        meta={meta}
        place={place}
        siteId={gauge?.siteId ?? null}
        siteName={gauge?.name ?? null}
        plates={plates}
        accessPoints={accessPoints}
        regulations={river.regulations}
        regsSource={regsSource}
        evidencePhoto={evidencePhoto}
        fieldNote={fieldNote}
        initialSnapshot={gauges?.snapshots[river.id] ?? null}
        initialHistory={gauges?.histories[river.id]}
      />
    </>
  );
}
