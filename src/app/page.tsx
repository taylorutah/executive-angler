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
import FlyPlate from "@/components/home/FlyPlate";
import FourDoors, { type Door } from "@/components/home/FourDoors";
import HomeHero from "@/components/home/HomeHero";
import JournalBand from "@/components/home/JournalBand";
import OnTheWaterNow from "@/components/home/OnTheWaterNow";
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

function pickRead(articles: Article[]): { lead: Article; rest: Article[] } | null {
  const sorted = [...articles].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
  const featured = sorted.filter((a) => a.featured);
  const ordered = [...featured, ...sorted.filter((a) => !a.featured)];
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

  const read = pickRead(articles);
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

  return (
    <>
      {/* 1 — conditions rail */}
      <ConditionsRail rivers={flagshipRivers} snapshots={snapshots} />

      {/* 2 + 3 — the photograph, and the search on it */}
      <HomeHero riverCount={rivers.length} />

      {/* 4 — four doors */}
      <FourDoors doors={doors} />

      {/* 5 — on the water now */}
      <OnTheWaterNow rivers={flagshipRivers} snapshots={snapshots} month={month} />

      {/* 6 — this week's read */}
      {read && <ThisWeeksRead lead={read.lead} rest={read.rest} />}

      {/* 7 — the fly plate */}
      <FlyPlate flies={plate} flyCount={allFlies.length} />

      {/* 8 — where to go */}
      <WhereToGo destinations={places} month={month} />

      {/* 9 — the journal */}
      <JournalBand />

      {/* 10 — what we don't do */}
      <WhatWeDontDo />

      {/* 11 — footer is rendered by the root layout */}
    </>
  );
}
