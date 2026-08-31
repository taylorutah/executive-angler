interface QuickFact {
  label: string;
  value: string;
}

interface QuickFactsProps {
  title?: string;
  facts: QuickFact[];
}

export default function QuickFacts({ title = "Quick Facts", facts }: QuickFactsProps) {
  return (
    <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] p-6">
      <h3 className="font-heading text-lg font-semibold text-[var(--text-1)] mb-4">
        {title}
      </h3>
      <dl className="space-y-3">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="flex flex-col items-start gap-1 border-b border-[var(--border)] py-2.5 last:border-0 sm:flex-row sm:justify-between sm:gap-4"
          >
            <dt className="shrink-0 font-ui text-xs uppercase tracking-[0.12em] text-[var(--text-3)]">
              {fact.label}
            </dt>
            <dd className="min-w-0 text-sm font-medium leading-5 text-[var(--text-1)] sm:text-right">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
