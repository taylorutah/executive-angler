import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import HeroParallax from "@/components/ui/HeroParallax";
import {
  HERO_HEADLINE,
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
 * Homepage overlay is darker through the lower two-thirds than the shared
 * `.hero-overlay`. Display type is tall; content is in-flow so the section
 * can grow and keep the stack in the dark band. Do not use `.prose` here —
 * its unlayered `color: var(--text-body)` beats `text-white`.
 *
 * The 11px eyebrow sits on an opaque Vellum chip (slate on vellum is 5.03:1).
 * Small caps on a scrim cannot make 4.5.
 */
const HERO_SCRIM =
  "linear-gradient(to bottom, rgba(15,43,31,0) 0%, rgba(15,43,31,0.45) 32%, rgba(15,43,31,0.86) 100%)";

export default function HomeHero({ riverCount, cfs }: Props) {
  const eyebrow = formatHeroEyebrow(cfs);

  return (
    <section
      data-lane="resource"
      data-hero-parallax-host
      className="relative min-h-[70svh] w-full overflow-hidden sm:min-h-[85vh]"
    >
      <HeroParallax>
        <Image
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
        />
      </HeroParallax>
      <div className="absolute inset-0" style={{ background: HERO_SCRIM }} aria-hidden />

      <div className="relative z-10 flex min-h-[70svh] flex-col justify-end sm:min-h-[85vh]">
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-[22vh] sm:px-6 sm:pb-16 lg:px-8">
          <p className="mb-5 inline-flex items-center gap-3 bg-[var(--vellum)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
            <span aria-hidden className="h-px w-6 bg-[var(--action)]" />
            {eyebrow}
          </p>

          <h1
            className="max-w-5xl font-heading font-bold tracking-tight text-white drop-shadow-lg"
            style={{ fontSize: "clamp(3.5rem, 7vw, 7rem)", lineHeight: 0.95 }}
          >
            {HERO_HEADLINE}
          </h1>

          <p
            className="mt-6 max-w-[40rem] text-[21px] leading-relaxed text-white"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {heroDek(cfs)}
          </p>

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
            className="mt-4 inline-block text-[14px] text-white underline-offset-4 transition-colors hover:underline"
          >
            {riverCount > 0 ? `Browse ${riverCount} rivers` : "Browse the rivers"} &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
