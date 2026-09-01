import Link from "next/link";
import HeronMark from "@/components/brand/HeronMark";
import GazettePlate from "./GazettePlate";
import {
  hatchesForMonth,
  type FlagshipRiver,
  type GaugeSnapshot,
} from "@/components/home/conditions";
import { shortInsect } from "@/lib/browse/river-items";
import type { Article, CanonicalFly } from "@/types/entities";

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

function sizeLabel(sizes: string[]): string | null {
  const values = sizes.map(String).filter(Boolean);
  if (values.length === 0) return null;
  return `Sizes ${values.join(" · ")}`;
}

function hatchLine(river: FlagshipRiver, month: string): string {
  const hatches = hatchesForMonth(river.hatchChart, month)
    .map(shortInsect)
    .filter(Boolean)
    .slice(0, 2);
  return hatches.length > 0 ? hatches.join(" · ") : "—";
}

/**
 * Still 4 — ON THE WATER NOW / RIVERS REPORT, then 02 THE PLATE,
 * then FIELD NOTE + JOURNAL + heron on the right. No photo hero.
 * Empty cream plates. Never AI insects. Never a 50vh bleed.
 */
export default function GazetteHome({
  rivers,
  snapshots,
  month,
  plate,
  flyCount,
  fieldNote,
}: Props) {
  return (
    <div className="bg-[var(--paper)]">
      <section className="mx-auto grid max-w-[72rem] gap-10 border-b border-[var(--border)] px-4 pb-10 pt-8 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:pt-12">
        <div>
          <p className="font-ui text-[11px] uppercase tracking-[0.18em] text-[var(--ink)]">
            On the water now
          </p>
          <h1 className="mt-5 font-display text-[clamp(40px,7vw,72px)] font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-[var(--ink)]">
            Rivers
            <br />
            Report
          </h1>
        </div>

        <table className="w-full text-left">
          <tbody>
            {rivers.map((river) => {
              const snapshot = snapshots.get(river.id);
              const live = snapshot?.cfs != null && !snapshot.stale;
              const st = (river.state ?? "").replace(/\s+/g, " ").trim();
              const stShort = st.length <= 4 ? st.toUpperCase() : st.slice(0, 2).toUpperCase();
              return (
                <tr key={river.id} className="relative border-b border-[var(--border)]">
                  <td className="py-2.5 pr-4">
                    <Link
                      href={`/rivers/${river.slug}`}
                      className="absolute inset-0"
                      aria-label={river.name}
                    />
                    <span className="relative font-body text-[17px] italic text-[var(--ink)]">
                      {river.label}
                    </span>
                  </td>
                  <td className="relative py-2.5 pr-4 font-ui text-[12px] uppercase tracking-[0.1em] text-[var(--text-3)]">
                    {stShort || "·"}
                  </td>
                  <td
                    className={`relative num py-2.5 pr-4 text-[14px] ${
                      live ? "text-[var(--ink)]" : "text-[var(--text-3)]"
                    }`}
                  >
                    {live ? `${snapshot!.cfs!.toLocaleString("en-US")} cfs` : "—"}
                    {live ? <span className="ea-live-dot" aria-hidden /> : null}
                  </td>
                  <td className="relative py-2.5 font-ui text-[13px] text-[var(--text-2)]">
                    {hatchLine(river, month)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="mx-auto max-w-[72rem] border-b border-[var(--border)] px-4 py-10 sm:px-8">
        <h2 className="font-ui text-[12px] uppercase tracking-[0.16em] text-[var(--ink)]">
          02 The plate
        </h2>

        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {plate.map((fly) => (
            <li key={fly.id}>
              <GazettePlate
                name={fly.name}
                line={sizeLabel(fly.sizes) ?? undefined}
                href={`/flies/${fly.slug}`}
              />
            </li>
          ))}
        </ul>
        <p className="mt-5 text-right">
          <Link href="/flies" className="font-body text-[16px] italic text-[var(--ink)]">
            {flyCount > 0 ? `→ All ${flyCount} patterns` : "→ All patterns"}
          </Link>
        </p>
      </section>

      <section className="mx-auto grid max-w-[72rem] gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-end">
        <div>
          <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--copper)]">
            Field note
          </p>
          {fieldNote ? (
            <Link href={`/articles/${fieldNote.slug}`} className="group mt-4 block">
              <h2 className="font-display text-[28px] font-semibold leading-tight text-[var(--ink)] group-hover:text-[var(--copper)]">
                {fieldNote.title}
              </h2>
              <p className="mt-3 font-body text-[16px] italic leading-relaxed text-[var(--text-2)]">
                {fieldNote.excerpt}
              </p>
            </Link>
          ) : (
            <p className="mt-4 font-body text-[16px] italic text-[var(--text-3)]">
              No field note this week.
            </p>
          )}
        </div>

        <div className="grid items-end gap-6 border-t border-[var(--border)] pt-8 md:grid-cols-[minmax(0,1fr)_auto] lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
          <div>
            <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]">
              Journal
            </p>
            <h2 className="mt-4 font-display text-[26px] font-semibold leading-tight text-[var(--ink)]">
              Keep the record the water can&apos;t keep for you.
            </h2>
            <p className="mt-3 font-body text-[16px] italic leading-relaxed text-[var(--text-2)]">
              Date. River. Conditions. Flies. What worked. What didn&apos;t. Build your own
              encyclopedia.
            </p>
            <p className="mt-6 font-ui text-[18px] tracking-[0.2em] text-[var(--ink)]" aria-hidden>
              →
            </p>
            <Link href="/journal" className="ea-journal-box mt-6">
              Keep a journal
            </Link>
          </div>
          <HeronMark
            facing="right"
            className="hidden h-52 w-[7.25rem] shrink-0 text-[var(--copper)] md:block"
            aria-hidden
          />
        </div>
      </section>
    </div>
  );
}
