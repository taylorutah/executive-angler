import type { Metadata } from "next";
import Link from "next/link";
import { getAllCanonicalFlies, getAllDestinations, getAllRivers } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FiveFlyPlate from "./FiveFlyPlate";
import NearRivers from "./NearRivers";
import KeepList from "./KeepList";
import {
  DEFAULT_KEEP_RIVER_SLUGS,
  ETIQUETTE,
  FIRST_FIVE_FLY_SLUGS,
  FLY_JOBS,
  GEAR_ITEMS,
  WATER_FEATURES,
} from "./data";
import type { LearnFly, LearnRiver } from "./types";
import { primaryGauge } from "@/components/home/conditions";

// Register: Daylight throughout, by omission from DUSK_PREFIXES in src/lib/register.ts.
// /learn is an essay plus two lists, not a workbench — no live-data insets, no
// logged-in surface, so it never earns Dusk. Do not add /learn to DUSK_PREFIXES.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: brandedTitle("Learn to Fly Fish"),
  description:
    "The beginner path: the gear that actually matters, how to read water, the first five flies to carry, rivers that forgive a first cast, and how to release a fish. Ends with two lists you can keep.",
  alternates: { canonical: `${SITE_URL}/learn` },
};

function firstSentence(text: string, max = 180): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  const m = t.match(/^(.+?[.!?])(?:\s|$)/);
  const s = m ? m[1] : t;
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trimEnd()}…`;
}

function placeLabel(dest?: { name: string; state?: string; country: string }): string {
  if (!dest) return "";
  if (dest.state) return dest.state;
  return dest.country;
}

function toLearnRiver(
  river: {
    id: string;
    slug: string;
    name: string;
    destinationId: string;
    description: string;
    flowType: string;
    wadingType: string;
    primarySpecies: string[];
    latitude: number;
    longitude: number;
    usgsGaugeId?: string | null;
  },
  destName: string,
): LearnRiver {
  return {
    id: river.id,
    slug: river.slug,
    name: river.name,
    place: destName,
    flowType: river.flowType,
    wadingType: river.wadingType,
    species: river.primarySpecies ?? [],
    excerpt: firstSentence(river.description),
    latitude: river.latitude,
    longitude: river.longitude,
    usgsSiteId: primaryGauge(river.usgsGaugeId, river.name)?.siteId ?? null,
  };
}

export default async function LearnPage() {
  const [allFlies, allRivers, destinations] = await Promise.all([
    getAllCanonicalFlies().catch(() => []),
    getAllRivers().catch(() => []),
    getAllDestinations().catch(() => []),
  ]);

  const destById = new Map(destinations.map((d) => [d.id, d]));

  const flies = FIRST_FIVE_FLY_SLUGS.flatMap((slug): LearnFly[] => {
    const fly = allFlies.find((f) => f.slug === slug);
    if (!fly) return [];
    return [
      {
        id: fly.id,
        slug: fly.slug,
        name: fly.name,
        category: fly.category,
        heroImageUrl: fly.heroImageUrl,
        sizes: fly.sizes ?? [],
        imitates: fly.imitates ?? [],
        job: FLY_JOBS[slug],
      },
    ];
  });

  const beginnerRivers: LearnRiver[] = allRivers
    .filter((r) => r.difficulty === "beginner")
    .map((r) => toLearnRiver(r, placeLabel(destById.get(r.destinationId))))
    .sort((a, b) => a.place.localeCompare(b.place) || a.name.localeCompare(b.name));

  const keepRivers = DEFAULT_KEEP_RIVER_SLUGS.map((slug) =>
    beginnerRivers.find((r) => r.slug === slug),
  ).filter((r): r is LearnRiver => Boolean(r));

  return (
    <div className="bg-[var(--surface-page)]">
      <header className="mx-auto max-w-3xl px-5 pt-10 pb-16 sm:px-8 xl:px-20">
        <Breadcrumbs items={[{ label: "Learn", href: "/learn" }]} />
        <p className="mt-8 font-ui text-[11px] font-medium uppercase tracking-[1.8px] text-[var(--text-meta)]">
          The beginner path
        </p>
        <h1
          className="mt-4 font-heading text-[32px] font-semibold leading-[36px] text-[var(--text-primary)] sm:text-[48px] sm:leading-[56px]"
          style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
        >
          Learn the water
        </h1>
        <p className="prose mt-6 text-[16px] leading-6 sm:text-[18px] sm:leading-7">
          Fly fishing is smaller than the catalog makes it look. Gear that earns its
          pocket. Current that holds fish. Five flies that cover most days. Rivers that
          forgive a first cast. How to put a fish back. Then two lists — not a form.
        </p>
      </header>

      <section
        aria-labelledby="gear"
        className="border-t border-[var(--border-rule)] bg-[var(--surface-raised)]"
      >
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20 xl:px-20">
          <p className="font-ui text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-meta)]">
            01
          </p>
          <h2
            id="gear"
            className="mt-3 font-heading text-[28px] font-semibold leading-[32px] text-[var(--text-primary)] sm:text-[36px] sm:leading-[40px]"
          >
            What gear actually matters
          </h2>
          <p className="prose mt-5">
            A shop will sell you a quiver. You need one rod that casts, a line that
            matches it, and the three tools that land a fish without hurting it.
          </p>
          <ol className="mt-10 divide-y divide-[var(--border-rule)] border-y border-[var(--border-rule)]">
            {GEAR_ITEMS.map((item, i) => (
              <li key={item.title} className="py-6">
                <p className="font-mono text-[11px] tabular-nums text-[var(--text-body)]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-heading text-[20px] font-semibold text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[16px] leading-relaxed text-[var(--text-body)]">
                  {item.body}
                </p>
                {"sourceHref" in item && item.sourceHref && (
                  <Link
                    href={item.sourceHref}
                    className="mt-3 inline-block text-[14px] text-[var(--text-primary)] underline decoration-[var(--border-rule)] underline-offset-4 hover:text-[var(--action)] hover:decoration-[var(--action)]"
                  >
                    {item.sourceLabel} →
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="water" className="bg-[var(--surface-page)]">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20 xl:px-20">
          <p className="font-ui text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-meta)]">
            02
          </p>
          <h2
            id="water"
            className="mt-3 font-heading text-[28px] font-semibold leading-[32px] text-[var(--text-primary)] sm:text-[36px] sm:leading-[40px]"
          >
            How to read water
          </h2>
          <p className="prose mt-5">
            A trout holds where three things meet: food in the current, a break from
            that current, and cover from above. Find the convergence. The cast is
            secondary.
          </p>
          <ul className="mt-10 grid gap-px bg-[var(--border-rule)] sm:grid-cols-2">
            {WATER_FEATURES.map((feat) => (
              <li key={feat.name} className="bg-[var(--surface-page)] p-6">
                <h3 className="font-heading text-[20px] font-semibold text-[var(--text-primary)]">
                  {feat.name}
                </h3>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-body)]">
                  {feat.look}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-body)]">
                  {feat.hold}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-8">
            <Link
              href="/articles/reading-water-complete-guide"
              className="text-[15px] text-[var(--text-primary)] underline decoration-[var(--border-rule)] underline-offset-4 hover:text-[var(--action)] hover:decoration-[var(--action)]"
            >
              The full reading-water guide →
            </Link>
          </p>
        </div>
      </section>

      <section
        aria-labelledby="flies"
        className="border-y border-[var(--border-rule)] bg-[var(--surface-raised)]"
      >
        <div className="desk-sheet py-16 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="font-ui text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-meta)]">
              03
            </p>
            <h2
              id="flies"
              className="mt-3 font-heading text-[28px] font-semibold leading-[32px] text-[var(--text-primary)] sm:text-[36px] sm:leading-[40px]"
            >
              Your first five flies
            </h2>
            <p className="prose mt-5">
              Two dries, a nymph, a streamer, an emerger. Each one has a job. The plate
              is not decoration — it is the box you actually carry.
            </p>
          </div>
          <div className="mt-12">
            <FiveFlyPlate flies={flies} />
          </div>
          <p className="mx-auto mt-10 max-w-3xl">
            <Link
              href="/articles/essential-fly-box-20-patterns"
              className="text-[15px] text-[var(--text-primary)] underline decoration-[var(--border-rule)] underline-offset-4 hover:text-[var(--action)] hover:decoration-[var(--action)]"
            >
              Twenty patterns, when you want more →
            </Link>
          </p>
        </div>
      </section>

      <section aria-labelledby="rivers" className="bg-[var(--surface-page)]">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20 xl:px-20">
          <p className="font-ui text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-meta)]">
            04
          </p>
          <h2
            id="rivers"
            className="mt-3 font-heading text-[28px] font-semibold leading-[32px] text-[var(--text-primary)] sm:text-[36px] sm:leading-[40px]"
          >
            Rivers near you that forgive beginners
          </h2>
          <p className="prose mt-5">
            These are the rivers the catalog already marks beginner — not a new ranking.
            Wide, wadeable, or close to a town. Use your location to put the nearest
            first. Location stays on the device.
          </p>
          <div className="mt-10">
            <NearRivers rivers={beginnerRivers} />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="release"
        className="border-t border-[var(--border-rule)] bg-[var(--surface-raised)]"
      >
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20 xl:px-20">
          <p className="font-ui text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-meta)]">
            05
          </p>
          <h2
            id="release"
            className="mt-3 font-heading text-[28px] font-semibold leading-[32px] text-[var(--text-primary)] sm:text-[36px] sm:leading-[40px]"
          >
            Catch-and-release etiquette
          </h2>
          <p className="prose mt-5">
            Done well, almost every trout swims away. Done poorly, it is harvest with
            extra steps. The difference is a barb, wet hands, and the clock.
          </p>
          <ul className="mt-10 divide-y divide-[var(--border-rule)] border-y border-[var(--border-rule)]">
            {ETIQUETTE.map((row) => (
              <li key={row.do} className="grid gap-3 py-5 sm:grid-cols-2 sm:gap-8">
                <p className="text-[15px] leading-relaxed text-[var(--text-primary)]">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-body)]">
                    Do
                  </span>
                  <span className="mt-1 block">{row.do}</span>
                </p>
                <p className="text-[15px] leading-relaxed text-[var(--text-body)]">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-body)]">
                    Don&apos;t
                  </span>
                  <span className="mt-1 block">{row.dont}</span>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-8">
            <Link
              href="/articles/catch-and-release-best-practices"
              className="text-[15px] text-[var(--text-primary)] underline decoration-[var(--border-rule)] underline-offset-4 hover:text-[var(--action)] hover:decoration-[var(--action)]"
            >
              The full handling sequence →
            </Link>
          </p>
        </div>
      </section>

      <section
        aria-labelledby="keep"
        className="border-t border-[var(--border-rule)] bg-[var(--surface-page)]"
      >
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24 xl:px-20">
          <p className="font-ui text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-meta)]">
            Take these with you
          </p>
          <h2
            id="keep"
            className="mt-3 font-heading text-[28px] font-semibold leading-[32px] text-[var(--text-primary)] sm:text-[36px] sm:leading-[40px]"
          >
            Two lists. That is the whole path.
          </h2>
          <p className="prose mt-5">
            Five flies that cover a first season. Five rivers the catalog already calls
            beginner, spread so one of them is closer than it looks. Keep them — the
            account is just the pocket they live in.
          </p>
          <div className="mt-12">
            <KeepList flies={flies} rivers={keepRivers} />
          </div>
        </div>
      </section>
    </div>
  );
}
