import Link from "next/link";
import HomeHydrograph from "./HomeHydrograph";
import SectionMark from "./SectionMark";
import {
  formatDelta,
  formatObservedAt,
  hatchesForMonth,
  type FlagshipRiver,
  type GaugeSnapshot,
} from "./conditions";
import { WATER_JUDGEMENT } from "./hero-copy";

interface Props {
  rivers: FlagshipRiver[];
  snapshots: Map<string, GaugeSnapshot>;
  month: string;
}

/**
 * The read, not the glance. The rail already carries six numbers; this band
 * opens on paper with an essay and three rivers, then goes dusk for the
 * river of the day and its hydrograph.
 */
export default function OnTheWaterNow({ rivers, snapshots, month }: Props) {
  if (rivers.length === 0) return null;

  const hero = rivers[0];
  const supporting = rivers.slice(1, 4);
  const remainder = rivers.slice(4);
  const heroSnap = snapshots.get(hero.id);
  const heroHatches = hatchesForMonth(hero.hatchChart, month);
  const observed = formatObservedAt(heroSnap?.observedAt ?? null);

  return (
    <>
      <section data-lane="resource" className="bg-[var(--surface-page)] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-baseline justify-between gap-4">
            <SectionMark n="01" label="On the water" />
            <Link
              href="/rivers"
              className="shrink-0 text-[14px] text-[var(--action)] underline-offset-4 hover:underline"
            >
              All rivers <span aria-hidden>&rarr;</span>
            </Link>
          </div>

          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,68ch)_1fr]">
            <div>
              <h2 className="font-heading text-3xl font-bold leading-[1.15] text-[var(--text-primary)] sm:text-4xl">
                {hero.name}
              </h2>
              <p
                className="prose mt-6 text-[19px] leading-[1.7] text-[var(--text-body)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {heroSnap?.cfs != null ? (
                  <>
                    {heroSnap.cfs.toLocaleString("en-US")} cfs
                    {hero.gauge ? ` at ${hero.gauge.section}` : ""}
                    {heroSnap.stale ? " (last seen)" : ""}. {WATER_JUDGEMENT}.
                  </>
                ) : (
                  <>
                    The gauge is quiet. {WATER_JUDGEMENT}.
                  </>
                )}
              </p>
              {heroHatches.length > 0 && (
                <p
                  className="prose mt-4 text-[19px] leading-[1.7] text-[var(--text-body)]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  On the hatch chart this {month}: {heroHatches.join(", ")}.
                </p>
              )}
            </div>

            <ul className="grid gap-4">
              {supporting.map((river) => (
                <RiverCard
                  key={river.id}
                  river={river}
                  snapshot={snapshots.get(river.id)}
                  month={month}
                />
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        data-lane="resource"
        className="register-dusk bg-[var(--surface-page)] py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
                River of the day
              </p>
              <h2 className="mt-3 font-heading text-4xl font-bold text-[var(--text-primary)] sm:text-5xl">
                {hero.name}
              </h2>
            </div>
            <div className="text-right">
              {heroSnap?.cfs != null ? (
                <p>
                  <span className={`num text-5xl font-bold leading-none sm:text-6xl ${heroSnap.stale ? "text-[var(--text-primary)]" : "text-[var(--signal-live)]"}`}>
                    {heroSnap.cfs.toLocaleString("en-US")}
                  </span>
                  <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
                    cfs
                  </span>
                </p>
              ) : (
                <p className="text-[14px] text-[var(--text-meta)]">No live reading right now</p>
              )}
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
                {hero.gauge ? `USGS ${hero.gauge.siteId} · ${hero.gauge.section}` : "No USGS gauge"}
                {observed ? ` · ${observed}` : ""}
              </p>
            </div>
          </div>

          {hero.gauge && (
            <div className="mt-10">
              <HomeHydrograph riverId={hero.id} siteId={hero.gauge.siteId} />
            </div>
          )}

          <p className="mt-8 max-w-[68ch] text-[18px] leading-relaxed text-[var(--text-body)]">
            {WATER_JUDGEMENT}.
            {heroHatches.length > 0 ? ` Hatch on: ${heroHatches.slice(0, 3).join(", ")}.` : ""}
          </p>

          {remainder.length > 0 && (
            <ul className="mt-10 grid gap-4 border-t border-[var(--border-rule)] pt-8 sm:grid-cols-2">
              {remainder.map((river) => (
                <li key={river.id}>
                  <CompactRiver river={river} snapshot={snapshots.get(river.id)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function RiverCard({
  river,
  snapshot,
  month,
}: {
  river: FlagshipRiver;
  snapshot: GaugeSnapshot | undefined;
  month: string;
}) {
  const delta = formatDelta(snapshot?.deltaCfs ?? null);
  const hatches = hatchesForMonth(river.hatchChart, month).slice(0, 2);

  return (
    <li>
      <Link
        href={`/rivers/${river.slug}`}
        className="block rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] p-5 transition-colors hover:border-[var(--action)]"
      >
        <h3 className="font-heading text-xl font-bold text-[var(--text-primary)]">{river.name}</h3>
        <div className="mt-3 flex items-baseline gap-2">
          {snapshot?.cfs != null ? (
            <>
              <span className={`num text-3xl font-bold leading-none ${snapshot.stale ? "text-[var(--text-primary)]" : "text-[var(--signal-live)]"}`}>
                {snapshot.cfs.toLocaleString("en-US")}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
                cfs
              </span>
              {delta && <span className="num text-[13px] text-[var(--text-meta)]">{delta} / 24h</span>}
            </>
          ) : (
            <span className="text-[14px] text-[var(--text-meta)]">No live reading right now</span>
          )}
        </div>
        {hatches.length > 0 && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
            {hatches.join(" · ")}
          </p>
        )}
      </Link>
    </li>
  );
}

function CompactRiver({
  river,
  snapshot,
}: {
  river: FlagshipRiver;
  snapshot: GaugeSnapshot | undefined;
}) {
  const delta = formatDelta(snapshot?.deltaCfs ?? null);
  return (
    <Link
      href={`/rivers/${river.slug}`}
      className="flex items-baseline justify-between gap-4 text-[var(--text-body)] hover:text-[var(--text-primary)]"
    >
      <span className="font-heading text-xl font-bold text-[var(--text-primary)]">{river.label}</span>
      {snapshot?.cfs != null ? (
        <span className={`num ${snapshot.stale ? "text-[var(--text-meta)]" : "text-[var(--signal-live)]"}`}>
          {snapshot.cfs.toLocaleString("en-US")}
          <span className="ml-1 text-[var(--text-meta)]">cfs</span>
          {snapshot.stale ? (
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.1em]">last seen</span>
          ) : (
            delta && <span className="ml-2 text-[13px] text-[var(--text-meta)]">{delta}</span>
          )}
        </span>
      ) : (
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
          no reading
        </span>
      )}
    </Link>
  );
}
