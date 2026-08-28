"use client";

import { FOCUS_VISIBLE } from "@/components/layout/nav/links";
import type { SearchDocument } from "@/lib/search";
import { EXAMPLE_QUERIES } from "./meta";
import SearchResultRow from "./SearchResultRow";

interface Props {
  catalogLine: string;
  mostRead: SearchDocument[];
  hatchingNow: SearchDocument[];
  flows: Record<string, number>;
  onExample: (query: string) => void;
}

/**
 * Empty field teaches: six real queries, three most-read rivers, what is hatching.
 */
export default function SearchEmptyState({
  catalogLine,
  mostRead,
  hatchingNow,
  flows,
  onExample,
}: Props) {
  return (
    <div className="space-y-12">
      <p className="text-[var(--text-2)]">{catalogLine}</p>

      <section>
        <h2 className="ea-overline mb-3">
          Try a real query
        </h2>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onExample(q)}
              className={`ea-focus-ring ${FOCUS_VISIBLE} rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[13px] text-[var(--text-1)] hover:border-[var(--border-strong)]`}
            >
              {q}
            </button>
          ))}
        </div>
      </section>

      {mostRead.length > 0 && (
        <section>
          <h2 className="ea-overline mb-3">
            Most-read rivers
          </h2>
          <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {mostRead.map((item) => (
              <SearchResultRow
                key={item.href}
                item={item}
                cfs={item.usgsGaugeId ? flows[item.usgsGaugeId] : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {hatchingNow.length > 0 && (
        <section>
          <h2 className="ea-overline mb-3">
            Hatching now
          </h2>
          <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {hatchingNow.map((item) => (
              <SearchResultRow key={item.href} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
