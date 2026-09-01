import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import GazetteRiverReport, { platesFromHatches } from "@/components/gazette/GazetteRiverReport";
import {
  getAllCanonicalFlies,
  getAllRivers,
  getDestinationById,
  getRiverBySlug,
} from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import { regulationSource } from "@/lib/rivers/regulations";
import { primaryGauge } from "@/components/home/conditions";
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

  const [dest, allFlies] = await Promise.all([
    river.destinationId ? getDestinationById(river.destinationId) : Promise.resolve(undefined),
    getAllCanonicalFlies(),
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
  const overline =
    river.slug === "madison-river"
      ? "MONTANA  ·  MISSOURI HEADWATERS"
      : [place, (river.flowType ?? "").replace(/-/g, " ")].filter(Boolean).join("  ·  ").toUpperCase();

  const gauge = primaryGauge(river.usgsGaugeId, river.name);

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
        overline={overline}
        place={place}
        siteId={gauge?.siteId ?? null}
        plates={plates}
        accessPoints={river.accessPoints ?? []}
        regulations={river.regulations}
        regsSource={regsSource}
        evidencePhoto={evidencePhoto}
      />
    </>
  );
}
