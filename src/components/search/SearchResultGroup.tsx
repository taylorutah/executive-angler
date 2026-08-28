"use client";

import { FOCUS_VISIBLE } from "@/components/layout/nav/links";
import type { RankedGroup } from "@/lib/search";
import { TYPE_LABELS } from "./meta";
import SearchResultRow from "./SearchResultRow";

interface Props {
  group: RankedGroup;
  flows: Record<string, number>;
  activeHref?: string;
  narrowed: boolean;
  onSeeAll: () => void;
}

export default function SearchResultGroup({
  group,
  flows,
  activeHref,
  narrowed,
  onSeeAll,
}: Props) {
  const leftover = group.total - group.items.length;
  const showSeeAll = !narrowed && leftover > 0;

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-[var(--text-1)]">
          {TYPE_LABELS[group.type]}
        </h2>
        <div className="flex items-baseline gap-3">
          <span className="num text-[13px] text-[var(--text-2)]">
            {group.total}
          </span>
          {showSeeAll ? (
            <button
              type="button"
              onClick={onSeeAll}
              className={`ea-focus-ring ${FOCUS_VISIBLE} text-[13px] text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]`}
            >
              See all {group.total}
            </button>
          ) : null}
        </div>
      </div>
      <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {group.items.map(({ doc }) => (
          <SearchResultRow
            key={doc.href}
            item={doc}
            cfs={doc.usgsGaugeId ? flows[doc.usgsGaugeId] : undefined}
            exactFly={group.type === "fly" && group.items[0]?.doc.slug === doc.slug}
            active={doc.href === activeHref}
          />
        ))}
      </div>
    </section>
  );
}
