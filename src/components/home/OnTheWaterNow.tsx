import Link from "next/link";
import InstrumentWell, { InstrumentWellFrame } from "@/components/desk/InstrumentWell";
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
    <InstrumentWellFrame className="py-10 sm:py-14">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
          On the water now
        </p>
        <Link
          href="/rivers"
          className="shrink-0 text-[14px] text-[var(--action)] underline-offset-4 hover:underline"
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
    </InstrumentWellFrame>
  );
}
