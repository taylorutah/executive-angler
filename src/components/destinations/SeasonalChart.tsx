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
      <p className="ea-overline">
        Season
      </p>
      <h2
        id="place-season-heading"
        className="mt-2 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]"
      >
        Best months
      </h2>
      {span ? (
        <p className="mt-2 text-sm text-[var(--text-2)]">
          {placeName}: {span}
          {marked.length > 0 ? (
            <span className="text-[var(--text-2)]">
              {" "}
              · {marked.length} of 12 months
            </span>
          ) : null}
        </p>
      ) : (
        <p className="mt-2 text-sm text-[var(--text-2)]">
          Best months are not listed for this place yet.
        </p>
      )}

      <ol className="mt-6 grid grid-cols-12 gap-1.5 sm:gap-2" aria-label="Seasonal chart">
        {CALENDAR_MONTHS.map((month) => {
          const best = isBestMonth(month, bestMonths);
          return (
            <li key={month.short} className="flex flex-col items-center gap-2">
              <div
                className="flex h-20 w-full items-end bg-[var(--paper-deep)] sm:h-24"
                aria-hidden="true"
              >
                <div
                  className={`w-full ${
                    best
                      ? "h-full bg-[var(--text-1)]"
                      : "h-[18%] bg-[var(--border)]"
                  }`}
                />
              </div>
              <span
                className={`text-xs font-medium uppercase tracking-[0.06em] ${
                  best
                    ? "text-[var(--text-1)]"
                    : "text-[var(--text-2)]"
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
