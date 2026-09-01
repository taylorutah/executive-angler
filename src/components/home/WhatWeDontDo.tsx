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
      className="border-b border-[var(--border)] bg-[var(--paper)]"
    >
      <div className="mx-auto w-full max-w-[var(--container)] px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="ea-overline">What we don&apos;t do</h2>
        <ul className="mt-6 space-y-3">
          {LINES.map((line) => (
            <li
              key={line}
              className="font-display text-2xl font-semibold leading-[1.2] text-[var(--ink)] sm:text-4xl"
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
