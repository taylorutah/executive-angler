import Link from "next/link";
import { hatchesForMonth, type FlagshipRiver, type GaugeSnapshot } from "./conditions";

interface Props {
  rivers: FlagshipRiver[];
  snapshots: Map<string, GaugeSnapshot>;
  histories: Map<string, import("./conditions").DailyReading[]>;
  month: string;
}

function cfsCell(snapshot: GaugeSnapshot | undefined): string {
  if (snapshot?.cfs == null) return "—";
  return `${snapshot.cfs.toLocaleString("en-US")} CFS`;
}

/**
 * Station table: River · Place · CFS · What’s on.
 * Ungauged water is an em dash — never a guessed number.
 */
export default function OnTheWaterNow({ rivers, snapshots, month }: Props) {
  if (rivers.length === 0) return null;

  return (
    <section data-lane="resource" className="border-b border-[var(--border)] bg-[var(--paper)] py-12 sm:py-16">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <p className="ea-overline">On the water now</p>
          <Link
            href="/rivers"
            className="font-ui text-[12px] uppercase tracking-[0.12em] text-[var(--accent)]"
          >
            All rivers
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-t border-[var(--border)] text-left">
            <thead>
              <tr className="font-ui text-[11px] uppercase tracking-[0.12em] text-[var(--text-3)]">
                <th className="py-3 pr-4 font-medium">River</th>
                <th className="py-3 pr-4 font-medium">Place</th>
                <th className="py-3 pr-4 font-medium">CFS</th>
                <th className="py-3 font-medium">What’s on</th>
              </tr>
            </thead>
            <tbody>
              {rivers.map((river) => {
                const snapshot = snapshots.get(river.id);
                const hatches = hatchesForMonth(river.hatchChart, month).slice(0, 3);
                const live = snapshot?.cfs != null && !snapshot.stale;
                return (
                  <tr key={river.id} className="border-t border-[var(--border)]">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/rivers/${river.slug}`}
                        className="font-display text-[18px] font-semibold text-[var(--ink)] hover:text-[var(--accent)]"
                      >
                        {river.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 font-ui text-[13px] uppercase tracking-[0.08em] text-[var(--text-3)]">
                      {river.state ?? "—"}
                    </td>
                    <td
                      className={`num py-3 pr-4 text-[15px] ${
                        live ? "text-[var(--water-live)]" : "text-[var(--text-3)]"
                      }`}
                    >
                      {cfsCell(snapshot)}
                    </td>
                    <td className="py-3 font-ui text-[13px] text-[var(--text-2)]">
                      {hatches.length > 0 ? hatches.join(", ") : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
