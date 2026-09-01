import type { ReactNode } from "react";

export interface FactItem {
  label: string;
  value: ReactNode;
  className?: string;
}

/**
 * Labeled facts for entity pages. Overline + value, never a wrapping
 * middot paragraph that splits "Rainbow Trout" across three lines.
 */
export default function FactList({
  facts,
  className = "grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-10",
}: {
  facts: FactItem[];
  className?: string;
}) {
  if (facts.length === 0) return null;

  return (
    <dl className={className}>
      {facts.map((fact) => (
        <div key={fact.label} className={`min-w-0 ${fact.className ?? ""}`.trim()}>
          <dt className="ea-overline">{fact.label}</dt>
          <dd className="mt-1 font-ui text-sm leading-5 text-[var(--text-1)]">
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
