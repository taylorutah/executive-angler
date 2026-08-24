import Link from "next/link";
import {
  formatDelta,
  formatObservedAt,
  type FlagshipRiver,
  type GaugeSnapshot,
} from "./conditions";

interface Props {
  rivers: FlagshipRiver[];
  snapshots: Map<string, GaugeSnapshot>;
}

/**
 * Band 1 — sticky instrument rail. Six named rivers with their current gauge
 * reading. When USGS is unreachable the rail still carries the names and links.
 */
export default function ConditionsRail({ rivers, snapshots }: Props) {
  if (rivers.length === 0) return null;

  return (
    <div className="register-dusk sticky top-[56px] z-40 h-10 bg-[var(--surface-page)] border-b border-[var(--border-rule)]">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-5 overflow-x-auto px-4 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-meta)] lg:inline">
          On the water
        </span>
        {rivers.map((river) => {
          const snapshot = snapshots.get(river.id);
          const delta = formatDelta(snapshot?.deltaCfs ?? null);
          const observed = formatObservedAt(snapshot?.observedAt ?? null);
          return (
            <Link
              key={river.id}
              href={`/rivers/${river.slug}`}
              className="group flex shrink-0 items-center gap-2 whitespace-nowrap text-[12px] text-[var(--text-body)] transition-colors hover:text-[var(--text-primary)]"
            >
              {snapshot?.cfs != null && (
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--signal-live)]"
                />
              )}
              <span className="font-medium text-[var(--text-primary)] group-hover:text-[var(--action)]">
                {river.label}
              </span>
              {snapshot?.cfs != null ? (
                <>
                  <span className="num text-[var(--signal-live)]">
                    {snapshot.cfs.toLocaleString("en-US")}
                    <span className="ml-0.5 text-[var(--text-meta)]">cfs</span>
                  </span>
                  {delta && <span className="num text-[11px] text-[var(--text-meta)]">{delta}</span>}
                  {observed && (
                    <span className="hidden font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-meta)] xl:inline">
                      {observed} USGS
                    </span>
                  )}
                </>
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-meta)]">
                  gauge offline
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
