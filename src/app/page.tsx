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
import type { Article, CanonicalFly } from "@/types/entities";
import { selectFlagshipRivers } from "@/components/home/conditions";
import { loadFlagshipGaugePayload } from "@/components/home/flagship-cache";
import { HERO_IMAGE } from "@/components/home/hero-copy";
import GazetteLiveHome from "@/components/gazette/GazetteLiveHome";

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

function currentMonth(): string {
  return new Date().toLocaleString("en-US", { month: "long", timeZone: "America/Denver" });
}

const BANNED_EXCERPT =
  /river intelligence|intelligence platform|fly fishing intelligence|upgrade to|founders|premium tier/i;

const PLATE_SLUGS = [
  "parachute-adams",
  "elk-hair-caddis",
  "pheasant-tail",
  "hares-ear",
  "parachute-hopper",
  "woolly-bugger",
];

function isPublicRead(article: Article): boolean {
  return !BANNED_EXCERPT.test(article.excerpt ?? "");
}

function pickRead(articles: Article[]): Article | null {
  const sorted = [...articles].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
  const eligible = sorted.filter(isPublicRead);
  const featured = eligible.filter((a) => a.featured);
  return [...featured, ...eligible.filter((a) => !a.featured)][0] ?? null;
}

function pickPlate(featured: CanonicalFly[], all: CanonicalFly[]): CanonicalFly[] {
  const bySlug = new Map(all.map((fly) => [fly.slug, fly]));
  const seen = new Set<string>();
  const plate: CanonicalFly[] = [];
  for (const slug of PLATE_SLUGS) {
    const fly = bySlug.get(slug);
    if (!fly || seen.has(fly.id)) continue;
    seen.add(fly.id);
    plate.push(fly);
  }
  for (const fly of [...featured, ...all]) {
    if (plate.length === 6) break;
    if (seen.has(fly.id)) continue;
    seen.add(fly.id);
    plate.push(fly);
  }
  return plate;
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
  const madison = flagshipRivers.find((r) => r.slug === "madison-river") ?? flagshipRivers[0];
  const gauges = await loadFlagshipGaugePayload(flagshipRivers).catch(() => ({
    snapshots: {},
    histories: {},
  }));

  const plate = pickPlate(featuredFlies, allFlies);
  const fieldNote = pickRead(articles);

  return (
    <GazetteLiveHome
      madisonId={madison?.id}
      initial={gauges}
      counts={{
        rivers: rivers.length,
        flies: allFlies.length,
        hatches: destinations.length,
        days: articles.length,
      }}
      rivers={flagshipRivers}
      month={month}
      plate={plate}
      flyCount={allFlies.length}
      fieldNote={fieldNote}
    />
  );
}
