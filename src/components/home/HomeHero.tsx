import Image from "next/image";
import {
  HERO_HEADLINE_LEAD,
  HERO_HEADLINE_CLOSE,
  HERO_IMAGE,
  formatHeroCaption,
  heroDek,
} from "./hero-copy";

interface Props {
  cfs: number | null;
  headline: string;
}

/**
 * One evidence photograph. Caption on the photo. Type on paper below.
 * No search, no buttons, no scrim.
 */
export default function HomeHero({ cfs, headline }: Props) {
  const caption = formatHeroCaption(cfs);

  return (
    <section data-lane="resource" className="w-full">
      <div className="relative h-[50vh] min-h-[320px] w-full overflow-hidden">
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
        <p className="absolute bottom-0 left-0 right-0 bg-[var(--paper)]/92 px-4 py-2 font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--ink)] sm:px-6">
          {caption}
        </p>
      </div>

      <div className="border-b border-[var(--border)]">
        <div className="mx-auto w-full max-w-[var(--container)] px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="text-[var(--ink)]">{headline}</h1>
          <p className="ea-dek mt-5 max-w-[var(--prose)]">
            {HERO_HEADLINE_LEAD} — {HERO_HEADLINE_CLOSE}
          </p>
          <p className="mt-4 max-w-[var(--prose)] text-[17px] leading-relaxed text-[var(--text-2)]">
            {heroDek(cfs)}
          </p>
        </div>
      </div>
    </section>
  );
}
