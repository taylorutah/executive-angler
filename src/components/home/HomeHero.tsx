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
 * Flat hero (DESIGN.md § Imagery): the photograph stands alone in its own
 * band, graded; headline, dek, and search sit on paper below. No scrim, no
 * text-shadow, no text over the photo — gradients are banned.
 */
export default function HomeHero({ cfs }: Props) {
  const eyebrow = formatHeroEyebrow(cfs);
  const caption = formatHeroCaption(cfs);

  return (
    <section data-lane="resource" className="w-full">
      {/*
        Public JPEG, not /_next/image. The file is already 1920px — at or
        above rendered CSS width. Vercel Image Optimization fetches the
        origin without the preview SSO cookie and gets HTML, so the
        photograph vanishes on the protected deploy while localhost and
        a direct /images/... request in the browser stay fine.
        A quality of 85 is not in the Next 16 allowlist (default [75]).
      */}
      <div className="relative h-[52vh] min-h-[320px] w-full overflow-hidden">
        <Image
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          fill
          priority
          fetchPriority="high"
          unoptimized
          sizes="100vw"
          className="object-cover object-[center_68%] [filter:var(--photo-grade)]"
        />
      </div>

      <div className="border-b border-[var(--border)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="mb-5 font-ui text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-3)]">
            {eyebrow}
          </p>

          <div className="max-w-5xl">
            <h1
              className="font-heading font-bold tracking-tight text-[var(--text-1)]"
              style={{ fontSize: "clamp(3rem, 6.4vw, 6.25rem)", lineHeight: 0.95 }}
            >
              {HERO_HEADLINE_LEAD}
              {" — "}
              <em className="italic">{HERO_HEADLINE_CLOSE}</em>
            </h1>
            <p
              className="mt-6 max-w-[40rem] text-[21px] leading-relaxed text-[var(--text-2)]"
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

          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
            {caption}
          </p>
        </div>
      </div>
    </section>
  );
}
