import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  HERO_DEK,
  HERO_HEADLINE,
  HERO_IMAGE,
  SEARCH_PLACEHOLDER,
  formatHeroEyebrow,
} from "./hero-copy";

interface Props {
  riverCount: number;
  /** Live Madison discharge. Null when the gauge is silent — never a guess. */
  cfs: number | null;
}

/**
 * The photograph and the search that sits on it. The hero <Image> is the LCP
 * element; nothing above it renders a skeleton. Type is display-sized; the
 * search chip is opaque so ink is not asked to sit on a 90% wash.
 */
export default function HomeHero({ riverCount, cfs }: Props) {
  const eyebrow = formatHeroEyebrow(cfs);

  return (
    <section
      data-lane="resource"
      className="relative min-h-[60svh] w-full overflow-hidden sm:min-h-[72vh]"
    >
      <Image
        src={HERO_IMAGE.src}
        alt={HERO_IMAGE.alt}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover"
      />
      <div className="hero-overlay absolute inset-0" />

      <div className="absolute inset-0 flex items-end">
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
          <p className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white">
            <span aria-hidden className="h-px w-8 bg-[var(--copper-400)]" />
            {eyebrow}
          </p>

          <h1
            className="max-w-5xl font-heading font-bold tracking-tight text-white drop-shadow-lg"
            style={{ fontSize: "clamp(3.5rem, 7vw, 7rem)", lineHeight: 0.95 }}
          >
            {HERO_HEADLINE}
          </h1>

          <p
            className="prose mt-6 max-w-[40rem] text-[21px] leading-relaxed text-white"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {HERO_DEK}
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
            {riverCount > 0 ? `Browse ${riverCount} rivers` : "Browse the rivers"}{" "}
            <span className="text-[var(--copper-400)]">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
