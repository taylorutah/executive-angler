const LINES = [
  "we never publish your spots",
  "we never publish your counts",
  "there is no leaderboard here",
];

/** Band 10 — typographic only. No image, no card, no button. */
export default function WhatWeDontDo() {
  return (
    <section className="flex min-h-[40vh] items-center border-t border-[var(--border-rule)] bg-[var(--surface-page)] py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
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
