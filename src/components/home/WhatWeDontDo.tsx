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
      className="border-y border-[var(--border)] bg-[var(--paper-deep)]"
    >
      <div className="mx-auto w-full max-w-[var(--container)] px-4 py-14 sm:px-6 sm:py-24">
        <h2 className="ea-overline">
          What we don&apos;t do
        </h2>
        <ul className="mt-8 space-y-4">
          {LINES.map((line) => (
            <li
              key={line}
              className="font-display text-3xl font-semibold leading-[1.15] text-[var(--text-1)] sm:text-5xl"
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
