import Link from "next/link";
import InstrumentWell from "@/components/desk/InstrumentWell";
import RiverChip from "./RiverChip";
import type { DailyReading, FlagshipRiver, GaugeSnapshot } from "./conditions";

interface Props {
  rivers: FlagshipRiver[];
  snapshots: Map<string, GaugeSnapshot>;
  histories: Map<string, DailyReading[]>;
  month: string;
}

/**
 * Six RiverChips, sparkline and hatch, inside one InstrumentWell.
 * Contained. Not a full-bleed dusk band. Not six little dark cards.
 */
export default function OnTheWaterNow({ rivers, snapshots, histories, month }: Props) {
  if (rivers.length === 0) return null;

  return (
    <section data-lane="resource" className="bg-[var(--paper-deep)] py-14 sm:py-24">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-4">
          <p className="ea-overline">
            On the water now
          </p>
          <Link
            href="/rivers"
            className="shrink-0 text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
          >
            All rivers <span aria-hidden>&rarr;</span>
          </Link>
        </div>
        <InstrumentWell label="On the water now" className="p-3 sm:p-4">
          <ul className="grid grid-cols-1 gap-2">
            {rivers.map((river) => (
              <li key={river.id}>
                <RiverChip
                  river={river}
                  snapshot={snapshots.get(river.id)}
                  history={histories.get(river.id) ?? []}
                  month={month}
                />
              </li>
            ))}
          </ul>
        </InstrumentWell>
      </div>
    </section>
  );
}
