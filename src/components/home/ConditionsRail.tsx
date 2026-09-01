import Link from "next/link";
import type { FlagshipRiver, GaugeSnapshot } from "./conditions";

interface Props {
  rivers: FlagshipRiver[];
  snapshots: Map<string, GaugeSnapshot>;
}

function cfsType(cfs: number): string {
  return `${cfs.toLocaleString("en-US")} cfs`;
}

/** T7O4R names three waters. The table below the fold can list the rest. */
const TICKER_LIMIT = 3;

function RiverItems({
  rivers,
  snapshots,
}: {
  rivers: FlagshipRiver[];
  snapshots: Map<string, GaugeSnapshot>;
}) {
  return (
    <>
      {rivers.map((river) => {
        const snapshot = snapshots.get(river.id);
        const live = snapshot?.cfs != null;
        return (
          <span key={river.id} className="flex items-baseline gap-x-2">
            <span aria-hidden className="text-[var(--text-3)]">
              ·
            </span>
            <Link
              href={`/rivers/${river.slug}`}
              className="whitespace-nowrap hover:text-[var(--copper)]"
            >
              {river.label}
              {live ? (
                <span className="num normal-case tracking-normal">
                  {" "}
                  {cfsType(snapshot.cfs!)}
                </span>
              ) : null}
            </Link>
          </span>
        );
      })}
    </>
  );
}

/**
 * T7O4R ticker: centered type row, not a dark chip or live-dot rail.
 * At 390 the three names wrap onto a second type line — never clip mid-word.
 */
export default function ConditionsRail({ rivers, snapshots }: Props) {
  const ticker = rivers.slice(0, TICKER_LIMIT);
  if (ticker.length === 0) return null;

  return (
    <div
      data-home-rail
      className="fixed top-[var(--header-h)] left-0 right-0 z-40 min-h-[var(--ticker-h)] border-b border-[var(--border)] bg-[var(--paper)]"
    >
      <p className="mx-auto hidden h-[var(--ticker-h)] max-w-[72rem] items-center px-8 font-ui text-[12px] uppercase tracking-[0.14em] text-[var(--ink)] md:flex">
        <span className="shrink-0">On the water</span>
        <span className="ml-2 flex flex-1 items-center justify-center gap-x-2">
          <RiverItems rivers={ticker} snapshots={snapshots} />
        </span>
      </p>
      <p className="flex flex-wrap content-center items-center gap-x-2 gap-y-0.5 px-4 py-1.5 font-ui text-[11px] uppercase tracking-[0.1em] text-[var(--ink)] md:hidden">
        <span className="shrink-0">On the water</span>
        <RiverItems rivers={ticker} snapshots={snapshots} />
      </p>
    </div>
  );
}
