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

/**
 * Band 1 — sticky instrument rail. Six named rivers with their current gauge
 * reading. A quiet gauge is a known state (last reading + when), not a failure.
 */
export default function ConditionsRail({ rivers, snapshots }: Props) {
  if (rivers.length === 0) return null;

  return (
    <div
      data-home-rail
      className="sticky top-[56px] z-40 h-10 bg-[var(--paper)] border-b border-[var(--border)]"
    >
      <div className="mx-auto flex h-full max-w-[var(--container)] items-center gap-4 overflow-x-auto px-4 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="ea-overline hidden shrink-0 lg:inline">
          On the water
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
              className="group flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]"
            >
              {live && (
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                />
              )}
              <span className="font-medium text-[var(--text-1)] group-hover:text-[var(--accent)]">
                {river.label}
              </span>
              {live ? (
                <>
                  <span className="num text-[var(--accent)]">
                    {snapshot.cfs!.toLocaleString("en-US")}
                    <span className="ml-0.5 text-[var(--text-3)]">cfs</span>
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
                  {snapshot.cfs!.toLocaleString("en-US")}
                  <span className="ml-0.5">cfs</span>
                  <span className="ea-overline ml-1.5">
                    {lastSeenLabel(snapshot)}
                  </span>
                </span>
              ) : (
                <span className="ea-overline">
                  no reading
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
