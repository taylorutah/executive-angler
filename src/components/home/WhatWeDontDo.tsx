const LINES = [
  "we never publish your spots",
  "we never publish your counts",
  "there is no leaderboard here",
];

/** Typographic only. Three lines, no icons. */
export default function WhatWeDontDo() {
  return (
    <section
      id="what-we-dont-do"
      data-lane="ethic"
      className="flex min-h-[36vh] items-center bg-[var(--surface-page)]"
    >
      <div className="mx-auto w-full max-w-7xl border-y border-[var(--border-rule)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
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
