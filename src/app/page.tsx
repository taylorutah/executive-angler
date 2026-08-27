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
import CategoryIndex from "@/components/home/CategoryIndex";
import FlyPlate from "@/components/home/FlyPlate";
import HomeHero from "@/components/home/HomeHero";
import JournalBand from "@/components/home/JournalBand";
import OnTheWaterNow from "@/components/home/OnTheWaterNow";
import ThisWeeksRead from "@/components/home/ThisWeeksRead";
import WhatWeDontDo from "@/components/home/WhatWeDontDo";
import WhereToGo from "@/components/home/WhereToGo";
import {
  getFlagshipHistories,
  getGaugeSnapshots,
  selectFlagshipRivers,
} from "@/components/home/conditions";
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

/** The month the seasonal copy is written against, in the register's home time zone. */
function currentMonth(): string {
  return new Date().toLocaleString("en-US", { month: "long", timeZone: "America/Denver" });
}

const BANNED_EXCERPT =
  /river intelligence|intelligence platform|fly fishing intelligence|upgrade to|founders|premium tier/i;

function isPublicRead(article: Article): boolean {
  return !BANNED_EXCERPT.test(article.excerpt ?? "");
}

function pickRead(
  articles: Article[],
  used: Set<string>,
): { lead: Article; rest: Article[] } | null {
  const sorted = [...articles].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
  const eligible = sorted.filter(isPublicRead);
  const featured = eligible.filter((a) => a.featured);
  const ordered = [...featured, ...eligible.filter((a) => !a.featured)];
  const lead = ordered.find((article) => imageAvailable(article.heroImageUrl, used));
  if (!lead) return null;
  claimImageUrl(lead.heroImageUrl, used);
  return {
    lead,
    rest: ordered.filter((article) => article.id !== lead.id).slice(0, 3),
  };
}

function pickPlate(
  featured: CanonicalFly[],
  all: CanonicalFly[],
  used: Set<string>,
): CanonicalFly[] {
  const seen = new Set<string>();
  const plate: CanonicalFly[] = [];
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

function pickPlaces(
  destinations: Destination[],
  month: string,
  used: Set<string>,
): Destination[] {
  const withImage = destinations.filter((d) => imageAvailable(d.heroImageUrl, used));
  const featured = withImage.filter((d) => d.featured);
  const inSeason = featured.filter((d) => d.bestMonths?.includes(month));
  const ordered = [
    ...inSeason,
    ...featured.filter((d) => !inSeason.includes(d)),
    ...withImage.filter((d) => !d.featured),
  ];
  const picked = ordered.slice(0, 3);
  for (const destination of picked) {
    claimImageUrl(destination.heroImageUrl, used);
  }
  return picked;
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
  const destById = new Map(destinations.map((d) => [d.id, d]));
  const flagshipRivers = selectFlagshipRivers(rivers).map((river) => ({
    ...river,
    state: destById.get(river.destinationId)?.state ?? destById.get(river.destinationId)?.name,
  }));
  const [snapshots, histories] = await Promise.all([
    getGaugeSnapshots(flagshipRivers),
    getFlagshipHistories(flagshipRivers).catch(() => new Map()),
  ]);
  const madison = flagshipRivers.find((r) => r.slug === "madison-river") ?? flagshipRivers[0];
  const madisonCfs = madison ? snapshots.get(madison.id)?.cfs ?? null : null;

  const usedImages = new Set<string>();
  claimImageUrl(HERO_IMAGE.src, usedImages);

  const plate = pickPlate(featuredFlies, allFlies, usedImages);
  const places = pickPlaces(destinations, month, usedImages);
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

      <div data-lane="resource">
        <ConditionsRail rivers={flagshipRivers} snapshots={snapshots} />
      </div>

      <CategoryIndex
        rivers={rivers.length}
        flies={allFlies.length}
        places={destinations.length}
        notes={articles.length}
      />

      <OnTheWaterNow
        rivers={flagshipRivers}
        snapshots={snapshots}
        histories={histories}
        month={month}
      />

      {read && <ThisWeeksRead lead={read.lead} rest={read.rest} />}

      <FlyPlate flies={plate} flyCount={allFlies.length} />

      <WhereToGo destinations={places} month={month} />

      <JournalBand />

      <WhatWeDontDo />
    </>
  );
}
