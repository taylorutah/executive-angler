import {
  HERO_HEADLINE_CLOSE,
  HERO_HEADLINE_LEAD,
  HERO_IMAGE,
  HERO_PLACE,
  HERO_STRETCH,
  SEARCH_PLACEHOLDER,
  formatHeroCaption,
  formatHeroDay,
  heroDek,
} from "./hero-copy";

interface Props {
  cfs: number | null;
}

/**
 * 56px bar + remaining viewport. At 1440×900 that is a 1440×844 hero.
 * Search is the only CTA. CFS is teal and only when the gauge answered.
 */
export default function HomeHero({ cfs }: Props) {
  const date = formatHeroDay();
  const caption = formatHeroCaption(cfs);

  return (
    <section
      data-lane="resource"
      className="relative w-full overflow-hidden"
      style={{ height: "calc(100dvh - 56px - var(--app-banner-height, 0px))" }}
    >
      <div className="absolute inset-0">
        <picture className="block h-full w-full">
          <source type="image/webp" srcSet={HERO_IMAGE.mobileWebp} media="(max-width: 1024px)" />
          <source srcSet={HERO_IMAGE.mobileSrc} media="(max-width: 1024px)" />
          <source type="image/webp" srcSet={HERO_IMAGE.webp} />
          <img
            src={HERO_IMAGE.src}
            alt={HERO_IMAGE.alt}
            width={HERO_IMAGE.width}
            height={HERO_IMAGE.height}
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-cover object-[center_42%]"
          />
        </picture>
      </div>

      <div
        aria-hidden
        className="hero-overlay-home pointer-events-none absolute inset-0"
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-8 pt-12 sm:px-8 sm:pb-10 xl:px-20 xl:pb-10">
        <div className="flex w-full max-w-[720px] flex-col gap-3.5">
          <p className="font-ui text-[10px] font-medium uppercase tracking-[1.2px] text-[var(--hero-type)] sm:text-[11px]">
            {HERO_STRETCH.toUpperCase()}
            <span className="px-1.5 text-[var(--hero-type)]/70">·</span>
            {HERO_PLACE.toUpperCase()}
            {cfs != null && (
              <>
                <span className="px-1.5 text-[var(--hero-type)]/70">·</span>
                <span className="text-[var(--teal-300)]">{cfs.toLocaleString("en-US")} CFS</span>
              </>
            )}
            <span className="px-1.5 text-[var(--hero-type)]/70">·</span>
            {date}
          </p>

          <h1
            className="font-heading text-[32px] font-semibold leading-[36px] text-[var(--hero-type)] sm:text-[64px] sm:leading-[68px]"
            style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
          >
            {HERO_HEADLINE_LEAD}
            <br />
            {HERO_HEADLINE_CLOSE}
          </h1>

          <p className="hero-dek">
            {heroDek(cfs)}
          </p>

          <form
            action="/search"
            method="get"
            role="search"
            className="flex h-11 w-full max-w-[640px] items-center overflow-hidden rounded-[2px] border border-[var(--border-rule)] bg-[color-mix(in_srgb,var(--paper)_92%,transparent)] px-4 sm:h-12"
          >
            <label htmlFor="home-search" className="sr-only">
              {SEARCH_PLACEHOLDER}
            </label>
            <input
              id="home-search"
              type="search"
              name="q"
              placeholder={SEARCH_PLACEHOLDER}
              autoComplete="off"
              className="h-full min-w-0 flex-1 bg-transparent font-ui text-[14px] text-[var(--ink)] placeholder:text-[var(--text-meta)] focus:outline-none"
            />
          </form>
        </div>

        <p className="mt-7 max-w-[720px] font-ui text-[11px] text-[var(--hero-type)]">{caption}</p>
      </div>
    </section>
  );
}
