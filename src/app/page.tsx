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
import type { Article, CanonicalFly, Destination } from "@/types/entities";
import ConditionsRail from "@/components/home/ConditionsRail";
import CountsBand from "@/components/home/CountsBand";
import FlyPlate from "@/components/home/FlyPlate";
import FourDoors, { type Door } from "@/components/home/FourDoors";
import HomeHero from "@/components/home/HomeHero";
import JournalBand from "@/components/home/JournalBand";
import OnTheWaterNow from "@/components/home/OnTheWaterNow";
import PullQuote, { pickQuote } from "@/components/home/PullQuote";
import ThisWeeksRead from "@/components/home/ThisWeeksRead";
import WhatWeDontDo from "@/components/home/WhatWeDontDo";
import WhereToGo from "@/components/home/WhereToGo";
import { getGaugeSnapshots, selectFlagshipRivers } from "@/components/home/conditions";
import { HERO_IMAGE } from "@/components/home/hero-copy";

export const metadata: Metadata = {
  title: brandedTitle("Rivers, Flies, and Hatches"),
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} — Rivers, Flies, and Hatches`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: HERO_IMAGE.src,
        width: 1920,
        height: 1036,
        alt: HERO_IMAGE.alt,
      },
    ],
  },
  alternates: { canonical: SITE_URL },
};

export const revalidate = 3600;

/** The month the seasonal copy is written against, in the register's home time zone. */
function currentMonth(): string {
  return new Date().toLocaleString("en-US", { month: "long", timeZone: "America/Denver" });
}

const BANNED_EXCERPT =
  /river intelligence|intelligence platform|fly fishing intelligence|upgrade to|founders|premium tier/i;

function isPublicRead(article: Article): boolean {
  return !BANNED_EXCERPT.test(article.excerpt ?? "");
}

function pickRead(articles: Article[]): { lead: Article; rest: Article[] } | null {
  const sorted = [...articles].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
  const eligible = sorted.filter(isPublicRead);
  const featured = eligible.filter((a) => a.featured);
  const ordered = [...featured, ...eligible.filter((a) => !a.featured)];
  if (ordered.length === 0) return null;
  return { lead: ordered[0], rest: ordered.slice(1, 4) };
}

function pickPlate(featured: CanonicalFly[], all: CanonicalFly[]): CanonicalFly[] {
  const seen = new Set<string>();
  const plate: CanonicalFly[] = [];
  for (const fly of [...featured, ...all]) {
    if (plate.length === 12) break;
    if (!fly.heroImageUrl || seen.has(fly.id)) continue;
    seen.add(fly.id);
    plate.push(fly);
  }
  return plate;
}

function pickPlaces(destinations: Destination[], month: string): Destination[] {
  const withImage = destinations.filter((d) => d.heroImageUrl);
  const featured = withImage.filter((d) => d.featured);
  const inSeason = featured.filter((d) => d.bestMonths?.includes(month));
  const ordered = [
    ...inSeason,
    ...featured.filter((d) => !inSeason.includes(d)),
    ...withImage.filter((d) => !d.featured),
  ];
  return ordered.slice(0, 3);
}

export default async function HomePage() {
  const [rivers, allFlies, featuredFlies, destinations, articles] = await Promise.all([
    getAllRivers().catch(() => []),
    getAllCanonicalFlies().catch(() => []),
    getFeaturedFlies().catch(() => []),
    getAllDestinations().catch(() => []),
    getAllArticles().catch(() => []),
  ]);

  const month = currentMonth();
  const flagshipRivers = selectFlagshipRivers(rivers);
  const snapshots = await getGaugeSnapshots(flagshipRivers);
  const madison = flagshipRivers.find((r) => r.slug === "madison-river") ?? flagshipRivers[0];
  const madisonCfs = madison ? snapshots.get(madison.id)?.cfs ?? null : null;

  const read = pickRead(articles);
  const quote = pickQuote(
    [...(read?.rest ?? []), ...articles.filter((a) => a.id !== read?.lead?.id)],
  );
  const plate = pickPlate(featuredFlies, allFlies);
  const places = pickPlaces(destinations, month);

  const doors: Door[] = [
    {
      label: "Rivers",
      href: "/rivers",
      count: rivers.length,
      noun: "rivers",
      imageUrl: flagshipRivers[0]?.heroImageUrl ?? rivers.find((r) => r.heroImageUrl)?.heroImageUrl,
    },
    {
      label: "Flies",
      href: "/flies/library",
      count: allFlies.length,
      noun: "patterns",
      imageUrl: plate[0]?.heroImageUrl,
    },
    {
      label: "Destinations",
      href: "/destinations",
      count: destinations.length,
      noun: "destinations",
      imageUrl: places[0]?.heroImageUrl,
    },
    {
      label: "Articles",
      href: "/articles",
      count: articles.length,
      noun: "field notes",
      imageUrl: read?.lead.heroImageUrl,
    },
  ];

  const waterRivers = madison
    ? [madison, ...flagshipRivers.filter((r) => r.id !== madison.id)]
    : flagshipRivers;

  return (
    <>
      {/* glance — do not restyle the rail */}
      <div data-lane="resource">
        <ConditionsRail rivers={flagshipRivers} snapshots={snapshots} />
      </div>

      <HomeHero riverCount={rivers.length} cfs={madisonCfs} />

      <FourDoors doors={doors} />

      <CountsBand
        counts={[
          { value: rivers.length, noun: "rivers documented" },
          { value: allFlies.length, noun: "patterns, with recipes" },
          { value: destinations.length, noun: "destinations" },
          { value: articles.length, noun: "field notes" },
        ]}
      />

      <OnTheWaterNow rivers={waterRivers} snapshots={snapshots} month={month} />

      <FlyPlate flies={plate} flyCount={allFlies.length} />

      {quote && <PullQuote article={quote} />}

      <WhereToGo destinations={places} month={month} />

      {read && <ThisWeeksRead lead={read.lead} rest={read.rest} />}

      <JournalBand />

      <WhatWeDontDo />
    </>
  );
}
