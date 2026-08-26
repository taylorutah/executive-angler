import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  HERO_HEADLINE_LEAD,
  HERO_HEADLINE_CLOSE,
  HERO_IMAGE,
  SEARCH_PLACEHOLDER,
  formatHeroEyebrow,
  heroDek,
} from "./hero-copy";

interface Props {
  riverCount: number;
  /** Live Madison discharge. Null when the gauge is silent — never a guess. */
  cfs: number | null;
}

/**
 * Homepage wash is `--scrim-light` (0 / 0.10@50% / 0.45). The image stays
 * the image — brand bible §5.3. Display type is tall; content is in-flow.
 * Do not use `.prose` here — its unlayered `color: var(--text-body)` beats
 * `text-white`.
 *
 * The 11px eyebrow sits on an opaque Vellum chip (slate on vellum is 5.03:1).
 * Small caps on a scrim cannot make 4.5. The h1 and dek share a narrow local
 * panel; the browse link has its own. Do not darken the full-bleed wash.
 *
 * The photograph lives in an explicit `absolute inset-0` containing block.
 * `next/image` `fill` needs that. The production olive void was the forest
 * scrim starting at 0.28 opacity on pixel zero — the JPEG was always there.
 */

export default function HomeHero({ riverCount, cfs }: Props) {
  const eyebrow = formatHeroEyebrow(cfs);

  return (
    <section
      data-lane="resource"
      className="relative min-h-[70svh] w-full overflow-hidden sm:min-h-[85vh]"
    >
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div
        className="absolute inset-0"
        style={{ background: "var(--scrim-light)" }}
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[70svh] flex-col justify-end sm:min-h-[85vh]">
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-[22vh] sm:px-6 sm:pb-16 lg:px-8">
          <p className="mb-5 inline-flex items-center gap-3 bg-[var(--vellum)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
            <span aria-hidden className="h-px w-6 bg-[var(--action)]" />
            {eyebrow}
          </p>

          <div className="relative max-w-5xl">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-4 -inset-y-3 sm:-inset-x-6"
              style={{
                background:
                  "linear-gradient(to bottom, rgb(15 43 31 / 0) 0%, rgb(15 43 31 / 0.42) 35%, rgb(15 43 31 / 0.70) 100%)",
              }}
            />
            <h1
              className="relative font-heading font-bold tracking-tight text-white"
              style={{ fontSize: "clamp(3.5rem, 7vw, 7rem)", lineHeight: 0.95 }}
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
            className="mt-8 flex w-full max-w-[640px] items-center gap-2 rounded-lg border border-[var(--rule)] bg-white px-4 py-3 focus-within:border-[var(--ink)]"
          >
            <Search className="h-5 w-5 shrink-0 text-[var(--text-meta)]" aria-hidden />
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
              className="shrink-0 rounded bg-[var(--ink)] px-4 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--graphite)]"
            >
              Search
            </button>
          </form>

          <Link
            href="/rivers"
            className="mt-4 inline-block px-2 py-1 text-[14px] text-white underline-offset-4 transition-colors hover:underline"
            style={{ background: "rgb(15 43 31 / 0.72)" }}
          >
            {riverCount > 0 ? `Browse ${riverCount} rivers` : "Browse the rivers"} &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
