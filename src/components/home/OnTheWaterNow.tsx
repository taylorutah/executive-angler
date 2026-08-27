import Link from "next/link";
import HomeGutter from "./HomeGutter";
import { hatchesForMonth, type FlagshipRiver, type GaugeSnapshot } from "./conditions";

interface Props {
  rivers: FlagshipRiver[];
  snapshots: Map<string, GaugeSnapshot>;
  month: string;
}

const STATE_ABBR: Record<string, string> = {
  Montana: "MT",
  Utah: "UT",
  Colorado: "CO",
  Idaho: "ID",
  Wyoming: "WY",
  Oregon: "OR",
  Alaska: "AK",
};

function stateLabel(state?: string): string | null {
  if (!state) return null;
  return STATE_ABBR[state] ?? (state.length <= 3 ? state.toUpperCase() : state);
}

function hatchLabel(river: FlagshipRiver, month: string): string | null {
  const insect = hatchesForMonth(river.hatchChart, month)[0];
  if (!insect) return null;
  const lower = insect.toLowerCase();
  if (lower.includes("pale morning")) return "PMD";
  if (lower.includes("blue-winged") || lower.includes("blue winged")) return "BWO";
  return insect;
}

/**
 * One ON THE WATER kicker. Six chips. Live CFS in teal only.
 * No second "On the water" rail above this.
 */
export default function OnTheWaterNow({ rivers, snapshots, month }: Props) {
  if (rivers.length === 0) return null;

  return (
    <section data-lane="resource" data-home-rail className="bg-[var(--surface-page)] pt-10 pb-9">
      <HomeGutter>
        <p className="mb-3.5 flex items-center gap-2 font-ui text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--signal-live)]">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--signal-live)]" />
          On the water
        </p>
        <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {rivers.map((river) => {
            const snapshot = snapshots.get(river.id);
            const live = snapshot?.cfs != null && !snapshot.stale;
            const cfs = snapshot?.cfs ?? null;
            const state = stateLabel(river.state);
            const hatch = hatchLabel(river, month);
            const meta = [state, hatch].filter(Boolean).join("  ·  ");

            return (
              <li key={river.id} className="shrink-0">
                <Link
                  href={`/rivers/${river.slug}`}
                  className="group flex w-[150px] flex-col gap-1 rounded-[4px] border border-[rgb(44_33_27/0.18)] bg-[var(--surface-card)] px-3.5 py-3 sm:w-[204px]"
                >
                  <span className="hover-copper font-ui text-[13px] font-medium text-[var(--text-primary)] group-hover:text-[var(--action)]">
                    {river.label}
                  </span>
                  {cfs != null ? (
                    <span
                      className={`font-ui text-[18px] font-medium tabular-nums ${
                        live ? "text-[var(--signal-live)]" : "text-[var(--text-meta)]"
                      }`}
                    >
                      {cfs.toLocaleString("en-US")} cfs
                    </span>
                  ) : (
                    <span className="font-ui text-[18px] font-medium text-[var(--text-meta)]">
                      no reading
                    </span>
                  )}
                  {meta ? (
                    <span className="font-ui text-[11px] text-[var(--text-meta)]">{meta}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </HomeGutter>
    </section>
  );
}
