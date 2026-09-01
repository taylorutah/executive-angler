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
 * T7O4R ticker: one centered type row, not a dark chip or a wrapped second line.
 */
export default function ConditionsRail({ rivers, snapshots }: Props) {
  const ticker = rivers.slice(0, TICKER_LIMIT);
  if (ticker.length === 0) return null;

  return (
    <div
      data-home-rail
      className="sticky top-[var(--header-h)] z-40 min-h-[var(--ticker-h)] border-b border-[var(--border)] bg-[var(--paper)]"
    >
      <p className="ea-ticker-row mx-auto max-w-[72rem] justify-start px-4 font-ui text-[11px] uppercase tracking-[0.1em] text-[var(--ink)] md:justify-center md:px-8 md:text-[12px] md:tracking-[0.14em]">
        <span className="shrink-0">On the water</span>
        <span className="ml-2 flex flex-nowrap items-center justify-center gap-x-2">
          <RiverItems rivers={ticker} snapshots={snapshots} />
        </span>
      </p>
    </div>
  );
}
