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
  if (intensity === "heavy") return "bg-[var(--accent)]";
  if (intensity === "moderate") return "bg-[var(--accent)]/65";
  if (intensity === "sparse") return "bg-[var(--accent)]/35";
  return "bg-[var(--accent)]/50";
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
          <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
            Hatch chart
          </h2>
          <p className="mt-1 text-sm text-[var(--text-2)]">
            Filled months are when that insect is on the chart. Best months for this river are lit.
          </p>
        </div>
        <ul className="flex items-center gap-3 text-xs text-[var(--text-2)]">
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[var(--accent)]/35" /> Sparse
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[var(--accent)]/65" /> Moderate
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[var(--accent)]" /> Heavy
          </li>
        </ul>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[var(--surface)] px-3 py-3 text-left text-xs font-medium uppercase tracking-[0.06em] text-[var(--text-3)]">
                Insect
              </th>
              {MONTHS.map((month, i) => {
                const on = best.has(month);
                return (
                  <th
                    key={month}
                    className={`px-1 py-3 text-center text-xs font-medium uppercase tracking-[0.06em] ${
                      on
                        ? "bg-[var(--accent)] text-[var(--on-action)]"
                        : "text-[var(--text-3)]"
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
                <tr key={insect} className="border-t border-[var(--border)]">
                  <th className="sticky left-0 z-10 bg-[var(--surface)] px-3 py-3 text-left font-medium text-[var(--text-1)]">
                    {insect}
                  </th>
                  {MONTHS.map((month) => {
                    const cell = row[month];
                    const on = best.has(month);
                    return (
                      <td
                        key={month}
                        className={`px-1 py-3 text-center ${on ? "bg-[var(--accent-soft)]" : ""}`}
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
                          <span className="mx-auto block h-3 w-3 rounded-sm bg-[var(--paper-deep)]" />
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
