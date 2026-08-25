export interface Stat {
  label: string;
  value: string;
}

/**
 * The other permitted interruption to a field note's prose column: a small
 * run of figures, set in the UI face so it reads as instrument rather than
 * argument. Callers pass only facts they hold; the block renders nothing at
 * all below two, because one number is a sentence, not a table.
 */
export default function StatBlock({
  caption,
  stats,
}: {
  caption?: string;
  stats: Stat[];
}) {
  if (stats.length < 2) return null;

  return (
    <aside className="my-10 border-y border-[var(--border-rule)] py-5 not-italic">
      {caption && (
        <p className="font-ui text-[11px] uppercase tracking-[0.12em] text-[var(--text-meta)] mb-4">
          {caption}
        </p>
      )}
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="font-ui text-[11px] uppercase tracking-[0.1em] text-[var(--text-meta)]">
              {stat.label}
            </dt>
            <dd className="mt-1 num text-lg text-[var(--text-primary)]">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
