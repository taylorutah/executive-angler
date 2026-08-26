import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import {
  HERO_HEADLINE_LEAD,
  HERO_HEADLINE_CLOSE,
  HERO_IMAGE,
  SEARCH_PLACEHOLDER,
  formatHeroCaption,
  formatHeroEyebrow,
  heroDek,
} from "./hero-copy";

interface Props {
  cfs: number | null;
}

/**
 * One photograph, full strength, ~72vh. Search is the only CTA.
 * Eyebrow sits on the photograph — not in an opaque plate.
 * Text is protected locally. No full-bleed wash — that darkens the photograph
 * and the §2 census reads a gradient shorthand as duskFullBleed.
 */
export default function HomeHero({ cfs }: Props) {
  const eyebrow = formatHeroEyebrow(cfs);
  const caption = formatHeroCaption(cfs);

  return (
    <section data-lane="resource" className="relative min-h-[72vh] w-full overflow-hidden">
      <Image
        src={HERO_IMAGE.src}
        alt={HERO_IMAGE.alt}
        fill
        priority
        fetchPriority="high"
        quality={85}
        sizes="100vw"
        className="object-cover object-[center_68%]"
      />

      <div className="relative z-10 flex min-h-[72vh] flex-col justify-end">
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-[18vh] sm:px-6 sm:pb-14 lg:px-8">
          <p
            className="mb-5 font-ui text-[11px] font-medium uppercase tracking-[0.2em] text-white"
            style={{ textShadow: "0 1px 2px rgb(15 43 31 / 0.85)" }}
          >
            {eyebrow}
          </p>

          <div className="relative max-w-5xl">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-4 -inset-y-3 sm:-inset-x-6"
              style={{
                backgroundColor: "rgba(250, 246, 240, 0)",
                backgroundImage:
                  "linear-gradient(to bottom, rgb(15 43 31 / 0) 0%, rgb(15 43 31 / 0.36) 40%, rgb(15 43 31 / 0.62) 100%)",
              }}
            />
            <h1
              className="relative font-heading font-bold tracking-tight text-white"
              style={{ fontSize: "clamp(3rem, 6.4vw, 6.25rem)", lineHeight: 0.95 }}
            >
              {HERO_HEADLINE_LEAD}
              {" — "}
              <em className="italic">{HERO_HEADLINE_CLOSE}</em>
            </h1>
            <p
              className="relative mt-6 max-w-[40rem] text-[21px] leading-relaxed text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {heroDek(cfs)}
            </p>
          </div>

          <form
            action="/search"
            method="get"
            role="search"
            className="mt-8 flex w-full max-w-[640px] items-center gap-2 border border-[var(--rule)] bg-[var(--card)] px-4 py-3 focus-within:border-[var(--ink)]"
            style={{ borderRadius: "var(--radius-instrument)" }}
          >
            <Icon name="search" className="h-5 w-5 shrink-0 text-[var(--text-meta)]" />
            <label htmlFor="home-search" className="sr-only">
              {SEARCH_PLACEHOLDER}
            </label>
            <input
              id="home-search"
              type="search"
              name="q"
              placeholder={SEARCH_PLACEHOLDER}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--ink)] placeholder:text-[var(--text-meta)] focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 bg-[var(--ink)] px-4 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--graphite)]"
              style={{ borderRadius: "var(--radius-instrument)" }}
            >
              Look up
            </button>
          </form>

          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white/90">
            {caption}
          </p>
        </div>
      </div>
    </section>
  );
}
