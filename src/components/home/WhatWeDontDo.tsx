const LINES = [
  "we never publish your spots",
  "we never publish your counts",
  "there is no leaderboard here",
];

/** Typographic only. No image, no card, no button. */
export default function WhatWeDontDo() {
  return (
    <section
      data-lane="ethic"
      className="border-t border-[var(--border-rule)] bg-[var(--surface-page)] py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
          <span aria-hidden className="h-px w-8 bg-[var(--action)]" />
          What we don&apos;t do
        </h2>
        <ul className="mt-8 space-y-3">
          {LINES.map((line) => (
            <li
              key={line}
              className="font-heading text-2xl leading-snug text-[var(--text-primary)] sm:text-4xl"
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
