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
 * One chip — not a dark card of its own. Three sizes: 20 name, 16 CFS, 12 meta.
 * Three fixed-proportion columns — name+state | CFS+sparkline | hatch — so
 * every row lines up regardless of name length.
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
      className="group grid grid-cols-1 gap-2 border border-[var(--border)] px-4 py-3 transition-colors hover:border-[var(--border-strong)] sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1.2fr)] sm:items-center sm:gap-x-6"
    >
      <span className="min-w-0">
        <span className="block truncate font-display text-xl font-semibold text-[var(--text-1)] transition-colors group-hover:text-[var(--accent)]">
          {river.name}
        </span>
        {river.state ? (
          <span className="ea-overline mt-1 block">
            {river.state}
          </span>
        ) : null}
      </span>

      <span className="flex items-center justify-between gap-4">
        <span className="min-w-0">
          {cfs != null ? (
            <span
              className={`num block text-base font-semibold ${live ? "text-[var(--accent)]" : "text-[var(--text-1)]"}`}
              data-live
            >
              {cfs.toLocaleString("en-US")}
              <span className="ea-overline ml-1">
                {live ? "cfs" : "cfs last seen"}
              </span>
            </span>
          ) : (
            <span className="ea-overline block">
              no instantaneous reading
            </span>
          )}
          {trend ? (
            <span
              data-live
              className={`block text-xs font-medium uppercase tracking-[0.06em] ${
                trend === "rising"
                  ? "text-[var(--success)]"
                  : trend === "dropping"
                    ? "text-[var(--danger)]"
                    : "text-[var(--text-2)]"
              }`}
            >
              {delta ? `${delta} ` : ""}
              {TREND_WORD[trend]}
            </span>
          ) : null}
        </span>
        <span data-live className="inline-flex shrink-0">
          <Sparkline values={values} />
        </span>
      </span>

      <span className="flex flex-wrap items-center gap-1">
        {hatches.length > 0 ? (
          hatches.map((hatch) => (
            <span key={hatch} className="ea-chip">
              {hatch}
            </span>
          ))
        ) : (
          <span className="text-xs text-[var(--text-3)]">
            <span aria-hidden>—</span>
            <span className="sr-only">No hatch listed this month</span>
          </span>
        )}
      </span>
    </Link>
  );
}
