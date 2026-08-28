import Link from "next/link";
import DeskMast from "@/components/desk/DeskMast";
import DeskPhotoCard from "@/components/desk/DeskPhotoCard";
import DeskSeeAll from "@/components/desk/DeskSeeAll";
import HomeGutter from "@/components/home/HomeGutter";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { formatHookSize } from "@/lib/flies/variant-format";
import { getAllCanonicalFlies } from "@/lib/db";
import { plateImageUrl } from "@/lib/media/image-url";
import type { CanonicalFly } from "@/types/entities";

const FEATURED_NAMES = ["Pale Morning Dun", "PMD Sparkle Dun", "Sparkle Dun"] as const;

const BENCH_NAMES = [
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

function sizeLabel(sizes: CanonicalFly["sizes"]): string | null {
  const values = (sizes ?? []).map((s) => formatHookSize(s)).filter(Boolean);
  if (values.length === 0) return null;
  if (values.length === 1) return values[0];
  return `${values[0]}–${values[values.length - 1]}`;
}

function pickFeatured(flies: CanonicalFly[]): CanonicalFly | null {
  const byName = new Map(flies.map((fly) => [nameKey(fly.name), fly]));
  for (const name of FEATURED_NAMES) {
    const fly = byName.get(nameKey(name));
    if (fly?.heroImageUrl) return fly;
  }
  return flies.find((fly) => Boolean(fly.heroImageUrl)) ?? flies[0] ?? null;
}

function pickBench(flies: CanonicalFly[], featuredId: string | undefined): CanonicalFly[] {
  const seen = new Set<string>();
  const bench: CanonicalFly[] = [];
  const byName = new Map(flies.map((fly) => [nameKey(fly.name), fly]));
  for (const name of BENCH_NAMES) {
    if (bench.length === 12) break;
    const fly = byName.get(nameKey(name));
    if (!fly || seen.has(fly.id)) continue;
    seen.add(fly.id);
    bench.push(fly);
  }
  for (const fly of flies) {
    if (bench.length === 12) break;
    if (fly.id === featuredId || seen.has(fly.id)) continue;
    seen.add(fly.id);
    bench.push(fly);
  }
  return bench;
}

/** Flies / 1440 — THE DESK / The plate. Frame 76:3. */
export default async function FliesDeskPage() {
  const flies = await getAllCanonicalFlies();
  const featured = pickFeatured(flies);
  const bench = pickBench(flies, featured?.id);
  const featuredMeta = featured
    ? [sizeLabel(featured.sizes), featured.imitates?.[0], featured.tagline]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <>
      <DeskMast
        kicker="THE DESK"
        title="The plate"
        lede="Twelve patterns on the water this week. One Refine. Not a catalog."
        titleSize="phrase"
        ledeFace="ui"
      />

      <section className="bg-[var(--surface-page)] pb-4">
        <HomeGutter>
          <div className="mb-8 flex h-10 items-center">
            <Link
              href="/flies/library"
              className="ea-focus-ring rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-page)] px-[18px] py-2 font-ui text-[13px] font-medium text-[var(--text-primary)]"
            >
              Refine
            </Link>
          </div>

          {featured ? (
            <Link
              href={`/flies/${featured.slug}`}
              className="group grid items-center gap-8 pb-10 lg:grid-cols-[minmax(0,794fr)_minmax(0,454fr)]"
            >
              <div className="photo-lift relative aspect-[794/420] w-full border border-[var(--border-rule)]">
                <SafeEntityImage
                  src={featured.heroImageUrl}
                  alt={featured.name}
                  title={featured.name}
                  fallback="quiet"
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 62vw"
                  priority
                />
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-ui text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--signal-live)]">
                  On the plate
                </p>
                <h2
                  className="hover-copper font-heading text-[32px] font-semibold leading-[38px] text-[var(--text-primary)] group-hover:text-[var(--action)] sm:text-[36px] sm:leading-[40px]"
                  style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
                >
                  {featured.name}
                </h2>
                {featuredMeta ? (
                  <p className="font-ui text-[14px] leading-[18px] text-[var(--text-meta)]">
                    {featuredMeta}
                  </p>
                ) : null}
                {featured.description ? (
                  <p className="font-ui text-[16px] leading-6 text-[var(--text-body)]">
                    {featured.description.length > 280
                      ? `${featured.description.slice(0, 277).trimEnd()}…`
                      : featured.description}
                  </p>
                ) : null}
              </div>
            </Link>
          ) : null}

          {bench.length > 0 ? (
            <div className="pb-12">
              <h2
                className="mb-4 font-heading text-[28px] font-semibold leading-8 text-[var(--text-primary)]"
                style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
              >
                The rest of the bench
              </h2>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {bench.map((fly) => (
                  <li key={fly.id}>
                    <DeskPhotoCard
                      href={`/flies/${fly.slug}`}
                      imageUrl={plateImageUrl(fly.heroImageUrl)}
                      imageAlt={`${fly.name} fly pattern`}
                      title={fly.name}
                      meta={sizeLabel(fly.sizes) ?? undefined}
                      density="plate"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <DeskSeeAll
            kicker="THE BENCH"
            title="The plate is this week. The bench is every fly we keep."
            href="/flies/library"
            label="Every fly we keep →"
          />
        </HomeGutter>
      </section>
    </>
  );
}
