import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { HERO_HEADLINE, HERO_IMAGE, SEARCH_PLACEHOLDER } from "./hero-copy";

interface Props {
  riverCount: number;
}

/**
 * Bands 2 + 3 — the photograph and the search that sits on it. The hero
 * <Image> is the LCP element; nothing above it renders a skeleton.
 */
export default function HomeHero({ riverCount }: Props) {
  return (
    <section className="relative h-[60svh] min-h-[420px] w-full overflow-hidden sm:h-[72vh]">
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
          <h1
            className="max-w-3xl font-heading font-bold leading-[1.08] tracking-tight text-white drop-shadow-lg"
            style={{ fontSize: "clamp(2rem, 4.4vw, 3.5rem)" }}
          >
            {HERO_HEADLINE}
          </h1>

          <form
            action="/search"
            method="get"
            role="search"
            className="mt-8 flex w-full max-w-[640px] items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-3 backdrop-blur-md focus-within:border-white/60"
          >
            <Search className="h-5 w-5 shrink-0 text-white/70" aria-hidden />
            <label htmlFor="home-search" className="sr-only">
              {SEARCH_PLACEHOLDER}
            </label>
            <input
              id="home-search"
              type="search"
              name="q"
              placeholder={SEARCH_PLACEHOLDER}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-white placeholder:text-white/70 focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded bg-white/90 px-4 py-1.5 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:bg-white"
            >
              Search
            </button>
          </form>

          <Link
            href="/rivers"
            className="mt-4 inline-block text-[14px] text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            {riverCount > 0 ? `Browse ${riverCount} rivers` : "Browse the rivers"} &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
