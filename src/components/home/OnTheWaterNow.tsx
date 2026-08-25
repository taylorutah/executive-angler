import Link from "next/link";
import HomeHydrograph from "./HomeHydrograph";
import SectionMark from "./SectionMark";
import Sparkline from "@/components/hydrograph/Sparkline";
import {
  classifyFlowState,
  FLOW_STATE_LABEL,
  median,
  type FlowState,
} from "@/lib/browse/flow-state";
import {
  formatObservedAt,
  hatchesForMonth,
  type DailyReading,
  type FlagshipRiver,
  type GaugeSnapshot,
} from "./conditions";
import { WATER_JUDGEMENT } from "./hero-copy";

interface Props {
  rivers: FlagshipRiver[];
  snapshots: Map<string, GaugeSnapshot>;
  histories: Map<string, DailyReading[]>;
  month: string;
}

function stateFor(
  snapshot: GaugeSnapshot | undefined,
  history: DailyReading[] | undefined,
): FlowState | null {
  if (snapshot?.cfs == null) return null;
  const mid = median((history ?? []).map((r) => r.discharge));
  if (mid == null) return null;
  return classifyFlowState(snapshot.cfs, mid);
}

/**
 * Ledger of flagship rivers, then the river-of-the-day instrument.
 */
export default function OnTheWaterNow({ rivers, snapshots, histories, month }: Props) {
  if (rivers.length === 0) return null;

  const hero = rivers[0];
  const heroSnap = snapshots.get(hero.id);
  const heroHistory = histories.get(hero.id) ?? [];
  const heroHatches = hatchesForMonth(hero.hatchChart, month);
  const observed = formatObservedAt(heroSnap?.observedAt ?? null);
  const heroState = stateFor(heroSnap, heroHistory);

  return (
    <>
      <section data-lane="resource" className="bg-[var(--surface-page)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-baseline justify-between gap-4">
            <SectionMark n="01" label="On the water" />
            <Link
              href="/rivers"
              className="shrink-0 text-[14px] text-[var(--action)] underline-offset-4 hover:underline"
            >
              All rivers <span aria-hidden>&rarr;</span>
            </Link>
          </div>

          <div data-roster className="border-t border-[var(--border-rule)]">
            {rivers.map((river) => (
              <RosterRow
                key={river.id}
                river={river}
                snapshot={snapshots.get(river.id)}
                history={histories.get(river.id) ?? []}
                month={month}
              />
            ))}
          </div>
        </div>
      </section>

      <section data-lane="resource" className="bg-[var(--surface-page)] pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            data-instrument
            className="register-dusk rounded-xl border border-[var(--border-rule)] bg-[var(--surface-page)] px-5 py-6 shadow-[var(--elev-4)] sm:px-7 sm:py-7"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
                  River of the day
                </p>
                <h2 className="mt-2 font-heading text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
                  {hero.name}
                </h2>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
                  {hero.gauge ? `USGS ${hero.gauge.siteId} · ${hero.gauge.section}` : "No USGS gauge"}
                  {observed ? ` · ${observed}` : ""}
                  {heroState ? ` · ${FLOW_STATE_LABEL[heroState]}` : ""}
                </p>
              </div>
              <div className="text-right">
                {heroSnap?.cfs != null ? (
                  <p>
                    <span
                      className={`num text-4xl font-bold leading-none sm:text-5xl ${heroSnap.stale ? "text-[var(--text-primary)]" : "text-[var(--signal-live)]"}`}
                    >
                      {heroSnap.cfs.toLocaleString("en-US")}
                    </span>
                    <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
                      cfs
                    </span>
                  </p>
                ) : (
                  <p className="text-[14px] text-[var(--text-meta)]">No live reading right now</p>
                )}
              </div>
            </div>

            {hero.gauge && (
              <div className="mt-5">
                <HomeHydrograph
                  riverId={hero.id}
                  siteId={hero.gauge.siteId}
                  liveCfs={heroSnap?.cfs ?? null}
                  readings={heroHistory}
                />
              </div>
            )}

            <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-[var(--text-body)]">
              {WATER_JUDGEMENT}.
              {heroHatches.length > 0 ? ` Hatch on: ${heroHatches.slice(0, 3).join(", ")}.` : ""}
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
              Daily means · band is this river&apos;s 30-day median ± IQR · USGS NWIS
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function RosterRow({
  river,
  snapshot,
  history,
  month,
}: {
  river: FlagshipRiver;
  snapshot: GaugeSnapshot | undefined;
  history: DailyReading[];
  month: string;
}) {
  const state = stateFor(snapshot, history);
  const hatches = hatchesForMonth(river.hatchChart, month).slice(0, 3);
  const values = history.map((r) => r.discharge);

  return (
    <Link
      href={`/rivers/${river.slug}`}
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-[var(--border-rule)] py-3 transition-[background-color,box-shadow] duration-[var(--hover-duration)] ease-[var(--hover-ease)] hover:bg-[var(--surface-raised)] hover:shadow-[var(--elev-1)] sm:grid-cols-[minmax(9rem,1.3fr)_6.5rem_60px_5.5rem_minmax(0,1.2fr)] sm:gap-x-5"
    >
      <span className="font-heading text-lg font-bold text-[var(--text-primary)] sm:text-xl">
        {river.name}
      </span>
      <span className="text-right">
        {snapshot?.cfs != null ? (
          <span
            className={`num text-[17px] ${snapshot.stale ? "text-[var(--text-meta)]" : "text-[var(--signal-live)]"}`}
          >
            {snapshot.cfs.toLocaleString("en-US")}
            <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-meta)]">
              cfs
            </span>
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
            no reading
          </span>
        )}
      </span>
      <span className="col-start-1 sm:col-auto">
        <Sparkline values={values} />
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-body)]">
        {state ? FLOW_STATE_LABEL[state] : ""}
      </span>
      <span className="col-span-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)] sm:col-span-1">
        {hatches.join(" · ")}
      </span>
    </Link>
  );
}
