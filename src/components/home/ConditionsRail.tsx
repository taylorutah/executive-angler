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
  loopKey,
}: {
  rivers: FlagshipRiver[];
  snapshots: Map<string, GaugeSnapshot>;
  loopKey?: string;
}) {
  return (
    <>
      {rivers.map((river) => {
        const snapshot = snapshots.get(river.id);
        const live = snapshot?.cfs != null;
        return (
          <span key={`${loopKey ?? "a"}-${river.id}`} className="flex shrink-0 items-baseline gap-x-2">
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
 * ON THE WATER  ·  Madison 760 cfs  ·  Green 1,910 cfs
 * At 390 the CFS list marquees so names never clip mid-word.
 */
export default function ConditionsRail({ rivers, snapshots }: Props) {
  const ticker = rivers.slice(0, TICKER_LIMIT);
  if (ticker.length === 0) return null;

  return (
    <div
      data-home-rail
      className="fixed top-[var(--header-h)] left-0 right-0 z-40 h-[var(--ticker-h)] border-b border-[var(--border)] bg-[var(--paper)]"
    >
      <div className="mx-auto flex h-full max-w-[72rem] items-center px-4 font-ui text-[12px] uppercase tracking-[0.14em] text-[var(--ink)] sm:px-8">
        <span className="shrink-0">On the water</span>
        <p className="ml-2 hidden h-full items-center justify-center gap-x-2 md:flex md:flex-1">
          <RiverItems rivers={ticker} snapshots={snapshots} />
        </p>
        <div className="ml-3 min-w-0 flex-1 overflow-hidden md:hidden">
          <p className="ea-ticker-track flex items-center gap-x-2">
            <RiverItems rivers={ticker} snapshots={snapshots} loopKey="a" />
            <RiverItems rivers={ticker} snapshots={snapshots} loopKey="b" />
          </p>
        </div>
      </div>
    </div>
  );
}
