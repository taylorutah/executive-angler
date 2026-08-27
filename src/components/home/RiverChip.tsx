import Link from "next/link";
import Sparkline from "@/components/hydrograph/Sparkline";
import { flowTrend } from "@/lib/rivers/missing-gauge";
import {
  formatDelta,
  type DailyReading,
  type FlagshipRiver,
  type GaugeSnapshot,
  hatchesForMonth,
} from "./conditions";

interface Props {
  river: FlagshipRiver;
  snapshot: GaugeSnapshot | undefined;
  history: DailyReading[];
  month: string;
}

const TREND_WORD = {
  rising: "rising",
  dropping: "dropping",
  steady: "steady",
} as const;

/**
 * Name, state, live CFS, 24h delta with the word, sparkline, hatch.
 * One chip — not a dark card of its own.
 */
export default function RiverChip({ river, snapshot, history, month }: Props) {
  const hatches = hatchesForMonth(river.hatchChart, month).slice(0, 3);
  const values = history.map((r) => r.discharge);
  const live = snapshot?.cfs != null && !snapshot.stale;
  const cfs = snapshot?.cfs ?? null;
  const previous =
    cfs != null && snapshot?.deltaCfs != null ? cfs - snapshot.deltaCfs : null;
  const trend = flowTrend(previous, cfs);
  const delta = formatDelta(snapshot?.deltaCfs ?? null);

  return (
    <Link
      href={`/rivers/${river.slug}`}
      className="group grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-4 gap-y-2 border border-[var(--border-rule)] px-4 py-3 transition-[border-color] duration-[140ms] ease-out hover:border-[var(--border-strong)] sm:grid-cols-[minmax(7rem,1.1fr)_5.5rem_60px_minmax(4.5rem,0.9fr)_minmax(0,1.1fr)] sm:items-center"
    >
      <span>
        <span className="block font-heading text-lg font-bold text-[var(--text-primary)] sm:text-xl">
          {river.name}
        </span>
        {river.state ? (
          <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
            {river.state}
          </span>
        ) : null}
      </span>

      <span className="text-right">
        {cfs != null ? (
          <span
            className={`num text-[17px] ${live ? "text-[var(--signal-live)]" : "text-[var(--text-primary)]"}`}
          >
            {cfs.toLocaleString("en-US")}
            <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-meta)]">
              {live ? "cfs" : "cfs last seen"}
            </span>
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
            no instantaneous reading
          </span>
        )}
      </span>

      <span className="col-start-1 sm:col-auto">
        <Sparkline values={values} />
      </span>

      <span
        className={`font-mono text-[11px] uppercase tracking-[0.12em] ${
          trend === "rising"
            ? "text-[var(--state-positive)]"
            : trend === "dropping"
              ? "text-[var(--state-negative)]"
              : "text-[var(--text-body)]"
        }`}
      >
        {trend ? (
          <>
            {delta ? `${delta} ` : ""}
            {TREND_WORD[trend]}
          </>
        ) : null}
      </span>

      <span className="col-span-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)] sm:col-span-1">
        {hatches.length > 0 ? hatches.join(" · ") : "No hatch listed this month"}
      </span>
    </Link>
  );
}
