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
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="font-heading text-lg font-semibold text-forest-dark mb-4">
        {title}
      </h3>
      <dl className="space-y-3">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="flex justify-between items-start gap-4 py-2 border-b border-slate-100 last:border-0"
          >
            <dt className="text-sm text-slate-500 shrink-0">{fact.label}</dt>
            <dd className="text-sm font-medium text-slate-800 text-right">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
