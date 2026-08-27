import HomeGutter from "./HomeGutter";

/** Typographic ethic. Two lines. */
export default function WhatWeDontDo() {
  return (
    <section
      id="what-we-dont-do"
      data-lane="ethic"
      className="bg-[var(--surface-page)] pb-10 pt-14"
    >
      <HomeGutter>
        <h2
          className="font-heading text-[28px] font-semibold text-[var(--text-primary)]"
          style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
        >
          What we don&apos;t publish
        </h2>
        <p className="mt-2.5 font-ui text-[18px] leading-7 text-[var(--text-body)]">
          Named spots. Fish counts. Your water.
        </p>
      </HomeGutter>
    </section>
  );
}
