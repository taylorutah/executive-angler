import {
  CALENDAR_MONTHS,
  formatBestMonthsLabel,
  isBestMonth,
} from "@/lib/destinations/season";

interface SeasonalChartProps {
  placeName: string;
  bestMonths: string[];
}

export default function SeasonalChart({
  placeName,
  bestMonths,
}: SeasonalChartProps) {
  const span = formatBestMonthsLabel(bestMonths);
  const marked = CALENDAR_MONTHS.filter((m) => isBestMonth(m, bestMonths));

  return (
    <section aria-labelledby="place-season-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-meta)]">
        Season
      </p>
      <h2
        id="place-season-heading"
        className="mt-2 font-heading text-2xl font-bold text-[var(--text-primary)]"
      >
        Best months
      </h2>
      {span ? (
        <p className="mt-2 text-sm text-[var(--text-body)]">
          {placeName}: {span}
          {marked.length > 0 ? (
            <span className="text-[var(--text-meta)]">
              {" "}
              · {marked.length} of 12 months
            </span>
          ) : null}
        </p>
      ) : (
        <p className="mt-2 text-sm text-[var(--text-meta)]">
          Best months are not listed for this place yet.
        </p>
      )}

      <ol className="mt-6 grid grid-cols-12 gap-1.5 sm:gap-2" aria-label="Seasonal chart">
        {CALENDAR_MONTHS.map((month) => {
          const best = isBestMonth(month, bestMonths);
          return (
            <li key={month.short} className="flex flex-col items-center gap-2">
              <div
                className="flex h-20 w-full items-end rounded-sm bg-[var(--surface-card)] sm:h-24"
                aria-hidden="true"
              >
                <div
                  className={`w-full rounded-sm ${
                    best
                      ? "h-full bg-[var(--action)]"
                      : "h-[18%] bg-[var(--border-rule)]"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-medium uppercase tracking-wider ${
                  best
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-meta)]"
                }`}
              >
                {month.short}
              </span>
              <span className="sr-only">
                {month.full}
                {best ? ", listed among the best months" : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
