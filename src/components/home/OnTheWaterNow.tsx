import Link from "next/link";
import {
  formatDelta,
  formatObservedAt,
  hatchesForMonth,
  type FlagshipRiver,
  type GaugeSnapshot,
} from "./conditions";

interface Props {
  rivers: FlagshipRiver[];
  snapshots: Map<string, GaugeSnapshot>;
  month: string;
}

/**
 * Band 5 — the instrument band. Every number here comes off a USGS gauge and
 * every insect comes off the river's own hatch chart; a river with neither
 * shows neither.
 */
export default function OnTheWaterNow({ rivers, snapshots, month }: Props) {
  if (rivers.length === 0) return null;

  return (
    <section className="register-dusk bg-[var(--surface-page)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            On the water now
          </h2>
          <Link
            href="/rivers"
            className="shrink-0 text-[14px] text-[var(--signal-live)] underline-offset-4 hover:underline"
          >
            All rivers &rarr;
          </Link>
        </div>

        <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {rivers.map((river) => {
            const snapshot = snapshots.get(river.id);
            const delta = formatDelta(snapshot?.deltaCfs ?? null);
            const observed = formatObservedAt(snapshot?.observedAt ?? null);
            const hatches = hatchesForMonth(river.hatchChart, month).slice(0, 2);

            return (
              <li
                key={river.id}
                className="w-[78vw] shrink-0 snap-start sm:w-auto sm:shrink"
              >
                <Link
                  href={`/rivers/${river.slug}`}
                  className="flex h-full flex-col rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] p-5 transition-colors hover:border-[var(--action)]"
                >
                  <h3 className="font-heading text-xl font-bold text-[var(--text-primary)]">
                    {river.name}
                  </h3>

                  <div className="mt-4 flex items-baseline gap-3">
                    {snapshot?.cfs != null ? (
                      <>
                        <span className="num text-4xl font-bold leading-none text-[var(--signal-live)]">
                          {snapshot.cfs.toLocaleString("en-US")}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
                          cfs
                        </span>
                        {delta && (
                          <span className="num text-[13px] text-[var(--text-meta)]">
                            {delta} / 24h
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[14px] text-[var(--text-meta)]">
                        No live reading right now
                      </span>
                    )}
                  </div>

                  {snapshot?.waterTempF != null && (
                    <p className="num mt-2 text-[13px] text-[var(--text-body)]">
                      {snapshot.waterTempF}°F water
                    </p>
                  )}

                  {hatches.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {hatches.map((insect) => (
                        <li
                          key={insect}
                          className="rounded-full border border-[var(--border-rule)] px-2.5 py-1 text-[11px] text-[var(--text-body)]"
                        >
                          {insect}
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="mt-auto pt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
                    {river.gauge
                      ? `USGS ${river.gauge.siteId} · ${river.gauge.section}`
                      : "No USGS gauge"}
                    {observed ? ` · ${observed}` : ""}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
