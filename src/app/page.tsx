import type { Metadata } from "next";
import {
  getAllArticles,
  getAllCanonicalFlies,
  getAllDestinations,
  getAllRivers,
  getFeaturedFlies,
} from "@/lib/db";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
import type { Article, CanonicalFly, Destination, River } from "@/types/entities";
import FlyPlate from "@/components/home/FlyPlate";
import HomeHero from "@/components/home/HomeHero";
import JournalBand from "@/components/home/JournalBand";
import OnTheWaterNow from "@/components/home/OnTheWaterNow";
import ThisWeeksRead from "@/components/home/ThisWeeksRead";
import WhatWeDontDo from "@/components/home/WhatWeDontDo";
import WhereToGo, { type PlaceCard } from "@/components/home/WhereToGo";
import { getGaugeSnapshots, selectFlagshipRivers } from "@/components/home/conditions";
import { HERO_IMAGE } from "@/components/home/hero-copy";
import { claimImageUrl, imageAvailable } from "@/components/home/homepage-images";

export async function generateMetadata(): Promise<Metadata> {
  const [rivers, allFlies] = await Promise.all([
    getAllRivers().catch(() => []),
    getAllCanonicalFlies().catch(() => []),
  ]);
  const titlePart = `${rivers.length} Rivers, ${allFlies.length} Flies, and Hatches`;
  return {
    title: brandedTitle(titlePart),
    description: SITE_DESCRIPTION,
    openGraph: {
      title: `${SITE_NAME} — ${titlePart}`,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      images: [
        {
          url: HERO_IMAGE.src,
          width: HERO_IMAGE.width,
          height: HERO_IMAGE.height,
          alt: HERO_IMAGE.alt,
        },
      ],
    },
    alternates: { canonical: SITE_URL },
  };
}

export const revalidate = 3600;

const BANNED_EXCERPT =
  /river intelligence|intelligence platform|fly fishing intelligence|upgrade to|founders|premium tier/i;

const WHERE_SLUGS = ["green-river", "arkansas-river-colorado", "bighorn-river"] as const;

/** Home / 1440 full 40:24 captions. Stretch · place, not invented spots. */
const PLACE_CAPTIONS: Record<(typeof WHERE_SLUGS)[number], string> = {
  "green-river": "A-Section · Utah",
  "arkansas-river-colorado": "Salida, Colorado",
  "bighorn-river": "Fort Smith, Montana",
};

/** Home / 1440 full 40:24 plate order. Only used when the library has the fly. */
const PLATE_NAMES = [
  "Hare's Ear",
  "Elk Hair Caddis",
  "Parachute Adams",
  "Zebra Midge",
  "Pheasant Tail",
  "Woolly Bugger",
  "PMD Sparkle Dun",
  "Chubby Chernobyl",
  "RS2",
  "Griffith's Gnat",
  "Prince Nymph",
  "Sparkle Dun",
] as const;

function nameKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function isPublicRead(article: Article): boolean {
  return !BANNED_EXCERPT.test(article.excerpt ?? "");
}

function pickRead(articles: Article[], used: Set<string>): Article | null {
  const sorted = [...articles].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
  const eligible = sorted.filter(isPublicRead);
  const featured = eligible.filter((a) => a.featured);
  const ordered = [...featured, ...eligible.filter((a) => !a.featured)];
  const lead = ordered.find((article) => imageAvailable(article.heroImageUrl, used));
  if (!lead) return null;
  claimImageUrl(lead.heroImageUrl, used);
  return lead;
}

function pickPlate(
  featured: CanonicalFly[],
  all: CanonicalFly[],
  used: Set<string>,
): CanonicalFly[] {
  const seen = new Set<string>();
  const plate: CanonicalFly[] = [];
  const byName = new Map(all.map((fly) => [nameKey(fly.name), fly]));
  for (const name of PLATE_NAMES) {
    if (plate.length === 12) break;
    const fly = byName.get(nameKey(name));
    if (!fly || seen.has(fly.id) || !fly.heroImageUrl) continue;
    if (!imageAvailable(fly.heroImageUrl, used)) continue;
    seen.add(fly.id);
    claimImageUrl(fly.heroImageUrl, used);
    plate.push(fly);
  }
  for (const fly of [...featured, ...all]) {
    if (plate.length === 12) break;
    if (!fly.heroImageUrl || seen.has(fly.id)) continue;
    if (!imageAvailable(fly.heroImageUrl, used)) continue;
    seen.add(fly.id);
    claimImageUrl(fly.heroImageUrl, used);
    plate.push(fly);
  }
  return plate;
}

function placeFromRiver(
  river: River,
  destById: Map<string, Destination>,
  used: Set<string>,
): PlaceCard | null {
  if (!imageAvailable(river.heroImageUrl, used)) return null;
  claimImageUrl(river.heroImageUrl, used);
  const dest = destById.get(river.destinationId);
  const caption =
    PLACE_CAPTIONS[river.slug as (typeof WHERE_SLUGS)[number]] ??
    dest?.state ??
    dest?.region ??
    dest?.name ??
    river.name;
  return {
    href: `/rivers/${river.slug}`,
    name: river.name,
    imageUrl: river.heroImageUrl,
    imageAlt: river.heroImageAlt,
    caption,
  };
}

function pickPlaces(
  rivers: River[],
  destinations: Destination[],
  destById: Map<string, Destination>,
  used: Set<string>,
): PlaceCard[] {
  const bySlug = new Map(rivers.map((r) => [r.slug, r]));
  const cards: PlaceCard[] = [];
  for (const slug of WHERE_SLUGS) {
    const river = bySlug.get(slug);
    if (!river) continue;
    const card = placeFromRiver(river, destById, used);
    if (card) cards.push(card);
  }
  if (cards.length >= 3) return cards.slice(0, 3);

  const leftover = destinations.filter((d) => imageAvailable(d.heroImageUrl, used));
  for (const destination of leftover) {
    if (cards.length === 3) break;
    claimImageUrl(destination.heroImageUrl, used);
    cards.push({
      href: `/destinations/${destination.slug}`,
      name: destination.name,
      imageUrl: destination.heroImageUrl,
      imageAlt: destination.heroImageAlt,
      caption: destination.tagline ?? destination.region ?? destination.name,
    });
  }
  return cards.slice(0, 3);
}

export default async function HomePage() {
  const [rivers, allFlies, featuredFlies, destinations, articles] = await Promise.all([
    getAllRivers().catch(() => []),
    getAllCanonicalFlies().catch(() => []),
    getFeaturedFlies().catch(() => []),
    getAllDestinations().catch(() => []),
    getAllArticles().catch(() => []),
  ]);

  const destById = new Map(destinations.map((d) => [d.id, d]));
  const flagshipRivers = selectFlagshipRivers(rivers).map((river) => ({
    ...river,
    state: destById.get(river.destinationId)?.state ?? destById.get(river.destinationId)?.name,
  }));
  const snapshots = await getGaugeSnapshots(flagshipRivers);
  const madison = flagshipRivers.find((r) => r.slug === "madison-river") ?? flagshipRivers[0];
  const madisonCfs = madison ? snapshots.get(madison.id)?.cfs ?? null : null;

  const usedImages = new Set<string>();
  claimImageUrl(HERO_IMAGE.src, usedImages);

  const plate = pickPlate(featuredFlies, allFlies, usedImages);
  const places = pickPlaces(rivers, destinations, destById, usedImages);
  const read = pickRead(articles, usedImages);

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={HERO_IMAGE.mobileWebp}
        type="image/webp"
        media="(max-width: 1024px)"
        fetchPriority="high"
      />

      <HomeHero cfs={madisonCfs} />

      <OnTheWaterNow
        rivers={flagshipRivers}
        snapshots={snapshots}
        month={new Date().toLocaleString("en-US", { month: "long", timeZone: "America/Denver" })}
      />

      <FlyPlate flies={plate} flyCount={allFlies.length} />

      <WhereToGo places={places} />

      {read && <ThisWeeksRead lead={read} />}

      <JournalBand />

      <WhatWeDontDo />
    </>
  );
}
