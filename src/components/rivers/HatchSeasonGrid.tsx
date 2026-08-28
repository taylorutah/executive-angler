import type { HatchMonth } from "@/types/entities";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

type Intensity = "sparse" | "moderate" | "heavy";

interface HatchCell {
  intensity?: Intensity;
  size?: string;
  pattern?: string;
}

function monthKey(raw: string): (typeof MONTHS)[number] | null {
  const t = raw.trim();
  const full = MONTHS.find((m) => m.toLowerCase() === t.toLowerCase());
  if (full) return full;
  const idx = SHORT.findIndex((s) => s.toLowerCase() === t.toLowerCase());
  return idx >= 0 ? MONTHS[idx] : null;
}

function intensityClass(intensity?: Intensity): string {
  if (intensity === "heavy") return "bg-[var(--signal-live)]";
  if (intensity === "moderate") return "bg-[var(--signal-live)]/65";
  if (intensity === "sparse") return "bg-[var(--signal-live)]/35";
  return "bg-[var(--signal-live)]/50";
}

interface Props {
  hatchChart: HatchMonth[];
  bestMonths: string[];
}

/**
 * Seasonal hatch grid. Columns are the year; best months read as on
 * (filled headers), not as the leftover chips.
 */
export default function HatchSeasonGrid({ hatchChart, bestMonths }: Props) {
  const best = new Set(
    bestMonths.map(monthKey).filter((m): m is (typeof MONTHS)[number] => m != null),
  );

  const insects: string[] = [];
  const cells = new Map<string, Partial<Record<(typeof MONTHS)[number], HatchCell>>>();

  for (const month of hatchChart) {
    const key = monthKey(month.month);
    if (!key) continue;
    for (const hatch of month.hatches) {
      const insect = hatch.insect?.trim();
      if (!insect) continue;
      if (!cells.has(insect)) {
        cells.set(insect, {});
        insects.push(insect);
      }
      cells.get(insect)![key] = {
        intensity: hatch.intensity,
        size: hatch.size,
        pattern: hatch.pattern,
      };
    }
  }

  if (insects.length === 0) return null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
            Hatch chart
          </h2>
          <p className="mt-1 text-sm text-[var(--text-body)]">
            Filled months are when that insect is on the chart. Best months for this river are lit.
          </p>
        </div>
        <ul className="flex items-center gap-3 text-[11px] text-[var(--text-body)]">
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[var(--signal-live)]/35" /> Sparse
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[var(--signal-live)]/65" /> Moderate
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[var(--signal-live)]" /> Heavy
          </li>
        </ul>
      </div>

      <p className="mb-2 font-ui text-[12px] text-[var(--text-meta)] lg:hidden">
        Swipe months to stay on the year.
      </p>
      <div
        className="desk-table-wrap overflow-x-auto border border-[var(--border-rule)] bg-[var(--vellum)]"
        tabIndex={0}
        role="region"
        aria-label="Hatch chart by month"
      >
        <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[9.5rem]" />
            {MONTHS.map((month) => (
              <col key={month} className="w-8" />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[var(--vellum)] px-3 py-2 text-left font-medium text-[var(--slate)]">
                Insect
              </th>
              {MONTHS.map((month, i) => {
                const on = best.has(month);
                return (
                  <th
                    key={month}
                    className={`w-8 px-0 py-2 text-center text-[11px] font-semibold ${
                      on
                        ? "bg-[var(--ink)] text-[var(--hero-type)]"
                        : "text-[var(--graphite)]"
                    }`}
                  >
                    {SHORT[i]}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {insects.map((insect) => {
              const row = cells.get(insect) ?? {};
              return (
                <tr key={insect} className="border-t border-[var(--border-rule)]">
                  <th className="sticky left-0 z-10 bg-[var(--vellum)] px-3 py-2 text-left font-medium text-[var(--ink)]">
                    {insect}
                  </th>
                  {MONTHS.map((month) => {
                    const cell = row[month];
                    const on = best.has(month);
                    return (
                      <td
                        key={month}
                        className={`w-8 px-0 py-2 text-center ${on ? "bg-[var(--paper)]" : ""}`}
                      >
                        {cell ? (
                          <span
                            className={`mx-auto block h-3 w-3 rounded-sm ${intensityClass(cell.intensity)}`}
                            title={[
                              insect,
                              month,
                              cell.intensity,
                              cell.size,
                              cell.pattern,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          />
                        ) : (
                          <span className="mx-auto block h-3 w-3 rounded-sm bg-[var(--border-rule)]/40" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
