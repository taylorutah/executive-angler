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
            className="flex justify-between items-start gap-4 py-2 border-b border-[var(--border)] last:border-0"
          >
            <dt className="text-sm text-[var(--text-2)] shrink-0">{fact.label}</dt>
            <dd className="text-sm font-medium text-[var(--text-1)] text-right break-words min-w-0">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
