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

/**
 * One type row. Nested flex was wrapping "On the water" onto a second line
 * at 390 and clipping Henry's Fork. Everything is inline nowrap.
 */
export default function ConditionsRail({ rivers, snapshots }: Props) {
  const ticker = rivers.slice(0, TICKER_LIMIT);
  if (ticker.length === 0) return null;

  return (
    <div
      data-home-rail
      className="sticky top-[var(--header-h)] z-40 border-b border-[var(--border)] bg-[var(--paper)]"
    >
      <p className="ea-ticker-row mx-auto max-w-[72rem] justify-start px-3 font-ui text-[10px] uppercase tracking-[0.05em] text-[var(--ink)] md:justify-center md:px-8 md:text-[12px] md:tracking-[0.14em]">
        <span className="ea-ticker-copy">
          <span>On the water</span>
          {ticker.map((river) => {
            const snapshot = snapshots.get(river.id);
            const live = snapshot?.cfs != null;
            return (
              <span key={river.id}>
                {" · "}
                <Link href={`/rivers/${river.slug}`} className="hover:text-[var(--copper)]">
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
        </span>
      </p>
    </div>
  );
}
