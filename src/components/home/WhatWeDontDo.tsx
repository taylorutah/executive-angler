const LINES = [
  "we never publish your spots",
  "we never publish your counts",
  "there is no leaderboard here",
];

/** Typographic only. Same height as before — presence comes from type and rules. */
export default function WhatWeDontDo() {
  return (
    <section
      data-lane="ethic"
      className="flex min-h-[36vh] items-center bg-[var(--surface-page)]"
    >
      <div className="mx-auto w-full max-w-7xl border-y border-[var(--border-rule)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--action)]">
          <span aria-hidden className="h-px w-10 bg-[var(--action)]" />
          What we don&apos;t do
        </h2>
        <ul className="mt-8 space-y-4">
          {LINES.map((line) => (
            <li
              key={line}
              className="font-heading text-3xl leading-[1.15] text-[var(--text-primary)] sm:text-5xl"
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
