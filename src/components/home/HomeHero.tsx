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
  headline: string;
}

/**
 * Flat hero (DESIGN.md § Imagery): the photograph stands alone in its own
 * band, graded; headline, dek, and search sit on paper below. No scrim, no
 * text-shadow, no text over the photo — gradients are banned.
 */
export default function HomeHero({ cfs, headline }: Props) {
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
        <div className="mx-auto w-full max-w-[var(--container)] px-4 py-12 sm:px-6 sm:py-16">
          <p className="ea-overline mb-5">
            {eyebrow}
          </p>

          <h1 className="text-[var(--text-1)]">
            {headline}
          </h1>
          <p className="mt-6 max-w-[var(--prose)] text-lg leading-relaxed text-[var(--text-2)]">
            {HERO_HEADLINE_LEAD}
            {" — "}
            <em className="italic">{HERO_HEADLINE_CLOSE}</em>
          </p>
          <p className="mt-4 max-w-[var(--prose)] text-lg leading-relaxed text-[var(--text-2)]">
            {heroDek(cfs)}
          </p>

          <form
            action="/search"
            method="get"
            role="search"
            className="mt-8 flex w-full max-w-[var(--prose)] items-center gap-2"
          >
            <div className="relative min-w-0 flex-1">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-3)]"
              />
              <label htmlFor="home-search" className="sr-only">
                {SEARCH_PLACEHOLDER}
              </label>
              <input
                id="home-search"
                type="search"
                name="q"
                placeholder={SEARCH_PLACEHOLDER}
                autoComplete="off"
                className="ea-input pl-10"
              />
            </div>
            <button type="submit" className="ea-btn ea-btn-primary shrink-0">
              Look up
            </button>
          </form>

          <p className="ea-overline mt-4">
            {caption}
          </p>
        </div>
      </div>
    </section>
  );
}
