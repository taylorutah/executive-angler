import HomeGutter from "./HomeGutter";

/** Typographic ethic. Two lines. */
export default function WhatWeDontDo() {
  return (
    <section
      id="what-we-dont-do"
      data-lane="ethic"
      className="bg-[var(--paper)] pb-10 pt-14"
    >
      <HomeGutter>
        <h2
          className="font-heading text-[28px] font-semibold text-[var(--ink)]"
          style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
        >
          What we don&apos;t publish
        </h2>
        <p className="prose mt-2.5 text-[18px] leading-7 text-[var(--graphite)]">
          Named spots. Fish counts. Your water.
        </p>
      </HomeGutter>
    </section>
  );
}
