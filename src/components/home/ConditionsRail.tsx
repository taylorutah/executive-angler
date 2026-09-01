import Link from "next/link";
import {
  formatDelta,
  formatObservedAt,
  formatObservedDay,
  type FlagshipRiver,
  type GaugeSnapshot,
} from "./conditions";

interface Props {
  rivers: FlagshipRiver[];
  snapshots: Map<string, GaugeSnapshot>;
}

function lastSeenLabel(snapshot: GaugeSnapshot): string {
  const time = formatObservedAt(snapshot.observedAt);
  const day = formatObservedDay(snapshot.observedAt);
  if (time && day) return `last seen ${time}`;
  if (time) return `last seen ${time}`;
  if (day) return `last seen ${day}`;
  return "last seen";
}

function cfsLabel(cfs: number): string {
  return `${cfs.toLocaleString("en-US")} CFS`;
}

/**
 * Ticker under the header. Live flagship CFS as type links.
 * Reuses the flagship gauge payload — do not rewrite fishing logic.
 */
export default function ConditionsRail({ rivers, snapshots }: Props) {
  if (rivers.length === 0) return null;

  return (
    <div
      data-home-rail
      className="fixed top-[var(--header-h)] left-0 right-0 z-40 h-[var(--ticker-h)] border-b border-[var(--border)] bg-[var(--paper)]"
    >
      <div className="mx-auto flex h-full max-w-[var(--container)] items-center gap-5 overflow-x-auto px-4 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="ea-overline shrink-0 text-[var(--water-live)]">
          • On the water
        </span>
        {rivers.map((river) => {
          const snapshot = snapshots.get(river.id);
          const delta = formatDelta(snapshot?.deltaCfs ?? null);
          const observed = formatObservedAt(snapshot?.observedAt ?? null);
          const live = snapshot?.cfs != null && !snapshot.stale;
          const lastSeen = snapshot?.cfs != null && snapshot.stale;

          return (
            <Link
              key={river.id}
              href={`/rivers/${river.slug}`}
              className="group flex shrink-0 items-baseline gap-2 whitespace-nowrap font-ui text-[12px] tracking-[0.04em] text-[var(--text-2)] hover:text-[var(--ink)]"
            >
              {live && (
                <span
                  aria-hidden
                  className="mb-px h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--water-live)]"
                />
              )}
              <span className="uppercase tracking-[0.1em] text-[var(--ink)]">
                {river.label}
              </span>
              {live ? (
                <>
                  <span className="num text-[var(--water-live)]">
                    {cfsLabel(snapshot.cfs!)}
                  </span>
                  {delta && <span className="num text-[var(--text-3)]">{delta}</span>}
                  {observed && (
                    <span className="ea-overline hidden xl:inline">
                      {observed} USGS
                    </span>
                  )}
                </>
              ) : lastSeen ? (
                <span className="num text-[var(--text-3)]" data-live>
                  {cfsLabel(snapshot.cfs!)}
                  <span className="ea-overline ml-1.5">
                    {lastSeenLabel(snapshot)}
                  </span>
                </span>
              ) : (
                <span className="text-[var(--text-3)]" aria-hidden>
                  —
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
