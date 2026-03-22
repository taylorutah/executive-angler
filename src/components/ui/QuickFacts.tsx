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
    <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
      <h3 className="font-heading text-lg font-semibold text-[#E8923A] mb-4">
        {title}
      </h3>
      <dl className="space-y-3">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="flex justify-between items-start gap-4 py-2 border-b border-[#21262D] last:border-0"
          >
            <dt className="text-sm text-[#A8B2BD] shrink-0">{fact.label}</dt>
            <dd className="text-sm font-medium text-[#F0F6FC] text-right break-words min-w-0">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
