interface Count {
  value: number;
  noun: string;
}

interface Props {
  counts: Count[];
}

/** The proof the reference exists — four numerals on Vellum. */
export default function CountsBand({ counts }: Props) {
  if (counts.every((c) => c.value === 0)) return null;

  return (
    <section data-lane="resource" className="bg-[var(--surface-raised)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ol className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {counts.map((count) => (
            <li key={count.noun}>
              <p
                className="font-heading font-bold leading-none tracking-tight text-[var(--text-primary)]"
                style={{ fontSize: "clamp(6rem, 8vw, 7.5rem)" }}
              >
                {count.value > 0 ? count.value.toLocaleString("en-US") : "—"}
              </p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-meta)]">
                {count.noun}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
