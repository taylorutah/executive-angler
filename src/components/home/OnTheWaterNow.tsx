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
 * Home / 1440 full 40:24 — ON THE WATER kicker + six paper-register chips.
 * Live CFS in teal only. No second "On the water" rail.
 */
export default function OnTheWaterNow({ rivers, snapshots, month }: Props) {
  if (rivers.length === 0) return null;

  return (
    <section data-lane="resource" data-home-rail className="bg-[var(--paper)] pb-9 pt-10">
      <HomeGutter>
        <p className="mb-3.5 flex items-center gap-2 font-ui text-[11px] font-medium uppercase tracking-[1.4px] text-[var(--teal)]">
          <img
            src="/images/home/live.svg"
            alt=""
            width={6}
            height={6}
            className="size-[6px]"
          />
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
                  className="group flex w-[150px] flex-col gap-1 rounded-[4px] border border-[rgb(44_33_27/0.18)] bg-[var(--vellum)] px-3.5 py-3 sm:w-[204px]"
                >
                  <span className="hover-copper font-ui text-[13px] font-medium text-[var(--ink)] group-hover:text-[var(--copper)]">
                    {river.label}
                  </span>
                  {cfs != null ? (
                    <span
                      className={`font-ui text-[18px] font-medium tabular-nums ${
                        live ? "text-[var(--teal)]" : "text-[var(--slate)]"
                      }`}
                    >
                      {cfs.toLocaleString("en-US")} cfs
                    </span>
                  ) : (
                    <span className="font-ui text-[18px] font-medium text-[var(--slate)]">
                      no reading
                    </span>
                  )}
                  {meta ? (
                    <span className="font-ui text-[11px] text-[var(--slate)]">{meta}</span>
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
