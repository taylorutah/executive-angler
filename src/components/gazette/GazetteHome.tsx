import Image from "next/image";
import Link from "next/link";
import HeronMark from "@/components/brand/HeronMark";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import {
  HERO_HEADLINE_CLOSE,
  HERO_HEADLINE_LEAD,
  HERO_IMAGE,
  formatHeroCaption,
  heroDek,
} from "@/components/home/hero-copy";
import {
  hatchesForMonth,
  type FlagshipRiver,
  type GaugeSnapshot,
} from "@/components/home/conditions";
import type { Article, CanonicalFly } from "@/types/entities";
import { flyPlateAlt } from "@/components/home/fly-plate";

export type GazetteHomeCounts = {
  rivers: number;
  flies: number;
  hatches: number;
  days: number;
};

interface PlateFly {
  id: string;
  slug: string;
  name: string;
  heroImageUrl?: string;
  category: CanonicalFly["category"];
  imitates: string[];
  sizes: string[];
}

interface Props {
  madisonCfs: number | null;
  counts: GazetteHomeCounts;
  rivers: FlagshipRiver[];
  snapshots: Map<string, GaugeSnapshot>;
  month: string;
  plate: PlateFly[];
  flyCount: number;
  fieldNote: Article | null;
}

const INDEX_COPY: { key: keyof GazetteHomeCounts; label: string; line: string; href: string }[] = [
  { key: "rivers", label: "Rivers", line: "Documented. Fished. Remembered.", href: "/rivers" },
  { key: "flies", label: "Flies", line: "Patterns that worked this season", href: "/flies" },
  { key: "hatches", label: "Hatches", line: "Observed windows and species", href: "/destinations" },
  { key: "days", label: "Days", line: "On the water. Logged and mapped", href: "/articles" },
];

function figure(n: number): string {
  return n > 0 ? n.toLocaleString("en-US") : "—";
}

function sizeLabel(sizes: string[]): string | null {
  const values = sizes.map(String).filter(Boolean);
  if (values.length === 0) return null;
  if (values.length === 1) return `Sizes ${values[0]}`;
  return `Sizes ${values.join(" · ")}`;
}

function categoryLine(fly: PlateFly): string {
  const cat = fly.category ? fly.category.charAt(0).toUpperCase() + fly.category.slice(1) : "Dry";
  const imitates = fly.imitates?.[0];
  return [cat, imitates].filter(Boolean).join(" · ");
}

/**
 * T7O4R above the fold + AWna3 below. One component. Not HomeHero + CategoryIndex.
 */
export default function GazetteHome({
  madisonCfs,
  counts,
  rivers,
  snapshots,
  month,
  plate,
  flyCount,
  fieldNote,
}: Props) {
  const caption = formatHeroCaption(madisonCfs);

  return (
    <div className="bg-[var(--paper)]">
      <section className="mx-auto max-w-[72rem] px-4 pt-6 sm:px-8 sm:pt-8">
        <div className="relative aspect-[21/8] min-h-[220px] w-full overflow-hidden bg-[var(--paper-deep)]">
          <Image
            src={HERO_IMAGE.src}
            alt={HERO_IMAGE.alt}
            fill
            priority
            fetchPriority="high"
            unoptimized
            sizes="(max-width: 1440px) 92vw, 1152px"
            className="object-cover object-[center_68%]"
          />
        </div>
        <p className="mt-3 text-center font-ui text-[11px] uppercase tracking-[0.2em] text-[var(--ink)]">
          {caption}
        </p>
      </section>

      <section className="mx-auto grid max-w-[72rem] gap-10 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)] lg:gap-16 lg:items-start">
        <div>
          <h1 className="font-display text-[clamp(44px,5.8vw,70px)] font-semibold leading-[0.95] tracking-[-0.02em] text-[var(--ink)]">
            <span className="whitespace-nowrap">
              {counts.rivers} Rivers, {counts.flies} Flies,
            </span>
            <br />
            and Hatches
          </h1>
          <div className="mt-6 h-px w-20 bg-[var(--copper)]" aria-hidden />
          <p className="mt-6 max-w-[36rem] font-body text-[20px] italic leading-snug text-[var(--ink)]">
            {HERO_HEADLINE_LEAD} — {HERO_HEADLINE_CLOSE}
          </p>
          <p className="mt-4 max-w-[36rem] text-[17px] leading-relaxed text-[var(--text-2)]">
            {heroDek(madisonCfs)}
          </p>
        </div>

        <ol className="space-y-5">
          {INDEX_COPY.map((row) => (
            <li key={row.key}>
              <Link href={row.href} className="group grid grid-cols-[5rem_auto_1fr] items-start gap-3">
                <span className="font-display text-[48px] font-semibold leading-none tabular-nums text-[var(--ink)]">
                  {figure(counts[row.key])}
                </span>
                <span className="mt-2 h-10 w-px bg-[var(--copper)]" aria-hidden />
                <span>
                  <span className="block font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--ink)] group-hover:text-[var(--copper)]">
                    {row.label}
                  </span>
                  <span className="mt-1 block text-[13px] leading-snug text-[var(--text-3)]">
                    {row.line}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-[72rem] px-4 py-12 sm:px-8">
        <div className="mb-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-[var(--border)] pt-8">
          <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">02</p>
          <h2 className="font-display text-[28px] font-semibold uppercase tracking-[0.06em] text-[var(--ink)] sm:text-[32px]">
            On the water now
          </h2>
          <p className="max-w-[28rem] text-[14px] leading-snug text-[var(--text-3)] lg:ml-auto">
            Real-time river conditions from our log, not a forecast model.
          </p>
        </div>

        <table className="w-full border-t border-[var(--border)] text-left">
          <tbody>
            {rivers.map((river) => {
              const snapshot = snapshots.get(river.id);
              const hatches = hatchesForMonth(river.hatchChart, month).slice(0, 2);
              const live = snapshot?.cfs != null && !snapshot.stale;
              const st = (river.state ?? "").replace(/\s+/g, " ").trim();
              const stShort = st.length <= 4 ? st.toUpperCase() : st.slice(0, 2).toUpperCase();
              return (
                <tr key={river.id} className="relative border-b border-[var(--border)]">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/rivers/${river.slug}`}
                      className="absolute inset-0"
                      aria-label={river.name}
                    />
                    <span className="relative font-display text-[18px] font-semibold text-[var(--ink)]">
                      {river.name}
                    </span>
                  </td>
                  <td className="relative py-3 pr-4 font-ui text-[12px] uppercase tracking-[0.1em] text-[var(--text-3)]">
                    {stShort || "·"}
                  </td>
                  <td
                    className={`relative num py-3 pr-4 text-[15px] ${
                      live ? "text-[var(--water-live)]" : "text-[var(--text-3)]"
                    }`}
                  >
                    {live ? `${snapshot!.cfs!.toLocaleString("en-US")} cfs` : "·"}
                  </td>
                  <td className="relative py-3 font-ui text-[13px] text-[var(--text-2)]">
                    {hatches.length > 0 ? hatches.join(" · ") : "·"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="mx-auto max-w-[72rem] px-4 py-12 sm:px-8">
        <div className="mb-6 flex items-baseline gap-x-6 border-t border-[var(--border)] pt-8">
          <h2 className="font-display text-[28px] font-semibold uppercase tracking-[0.06em] text-[var(--ink)] sm:text-[32px]">
            The plate
          </h2>
          <Link
            href="/flies"
            className="ml-auto font-ui text-[12px] uppercase tracking-[0.12em] text-[var(--ink)]"
          >
            {flyCount > 0 ? `All ${flyCount} patterns` : "All patterns"}
          </Link>
        </div>

        <ul className="grid grid-cols-2 border-t border-l border-[var(--border)] sm:grid-cols-3 lg:grid-cols-6">
          {plate.map((fly) => {
            const sizes = sizeLabel(fly.sizes);
            const line = categoryLine(fly);
            return (
              <li key={fly.id} className="border-b border-r border-[var(--border)]">
                <Link href={`/flies/${fly.slug}`} className="block">
                  <div className="relative flex aspect-square w-full items-end bg-[var(--plate)] p-3">
                    {fly.heroImageUrl ? (
                      <SafeEntityImage
                        src={fly.heroImageUrl}
                        alt={flyPlateAlt(fly.name, sizes, fly.imitates?.[0])}
                        title={fly.name}
                        contain
                        fallback="none"
                        className="object-contain p-3"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                    ) : (
                      <p className="font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--ink)]">
                        {fly.name}
                      </p>
                    )}
                  </div>
                  <div className="p-3 pt-2">
                    <h3 className="font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--ink)]">
                      {fly.name}
                    </h3>
                    <p className="mt-1 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]">
                      {line}
                    </p>
                    {sizes ? (
                      <p className="mt-0.5 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]">
                        {sizes}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mx-auto grid max-w-[72rem] gap-12 border-t border-[var(--border)] px-4 py-12 sm:px-8 lg:grid-cols-2">
        <div>
          <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
            Field note / 03
          </p>
          {fieldNote ? (
            <Link href={`/articles/${fieldNote.slug}`} className="group mt-4 block">
              <h2 className="font-display text-[26px] font-semibold leading-tight text-[var(--ink)] group-hover:text-[var(--copper)]">
                {fieldNote.title}
              </h2>
              <p className="mt-3 line-clamp-2 text-[16px] leading-relaxed text-[var(--text-2)]">
                {fieldNote.excerpt}
              </p>
              <span className="mt-4 inline-block font-ui text-[12px] uppercase tracking-[0.14em] text-[var(--ink)]">
                →
              </span>
            </Link>
          ) : (
            <p className="mt-4 text-[16px] text-[var(--text-3)]">No field note this week.</p>
          )}
        </div>

        <div>
          <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">Journal</p>
          <h2 className="mt-4 font-display text-[26px] font-semibold leading-tight text-[var(--ink)]">
            Keep the record the water can&apos;t keep for you.
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-[var(--text-2)]">
            Sessions, flies, and the days you actually fished — yours, and no one else&apos;s.
          </p>
          <p className="mt-3 text-[16px] leading-relaxed text-[var(--text-2)]">
            The gauge is public. Your notebook is not.
          </p>
          <p className="mt-3 text-[16px] leading-relaxed text-[var(--text-2)]">
            Write the day before the river forgets it.
          </p>
          <HeronMark className="mt-6 h-[30px] w-[22px] text-[var(--copper)]" aria-hidden />
          <div className="mt-6">
            <Link
              href="/journal"
              className="inline-flex bg-[var(--accent)] px-4 py-2.5 font-ui text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--on-action)]"
            >
              Keep a journal
            </Link>
          </div>
        </div>
      </section>

      <section
        id="what-we-dont-do"
        className="mx-auto max-w-[72rem] border-t border-[var(--border)] px-4 py-10 sm:px-8"
      >
        <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
          What we don&apos;t do
        </p>
        <p className="mt-3 font-display text-[22px] font-semibold text-[var(--ink)] sm:text-[28px]">
          spots / counts / no leaderboard
        </p>
      </section>
    </div>
  );
}
