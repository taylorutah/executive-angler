"use client";

import { useState } from "react";
import Image from "next/image";
import PhotoLightbox from "./PhotoLightbox";
import type { ApprovedPhoto } from "@/lib/db/photos";
import PlateFallback from "@/components/media/PlateFallback";
import { isUsableImageUrl } from "@/lib/media/image-url";
import { SURFACE_RAISED_BLUR_DATA_URL } from "@/lib/media/blur";
import { localHeroMobileSrc, localHeroWebpSrc } from "@/lib/media/local-hero";

interface RiverHeroImageProps {
  heroImageUrl?: string;
  heroImageAlt: string;
  heroImageCredit?: string;
  heroImageCreditUrl?: string;
  galleryPhotos: ApprovedPhoto[];
  /** River name — painted over the photograph in Fraunces. */
  title: string;
  /** Destination / water-type line under the name. */
  subtitle?: string;
  meta?: string;
  children?: React.ReactNode;
}

/**
 * Full-bleed river hero. The name sits in the 0.8-alpha band of `.hero-overlay`
 * (8.45:1 on Vellum if the photo never loads). Do not move the title up
 * into the thinner scrim, and do not repaint it dark.
 */
export default function RiverHeroImage({
  heroImageUrl,
  heroImageAlt,
  heroImageCredit,
  heroImageCreditUrl,
  galleryPhotos,
  title,
  subtitle,
  meta,
  children,
}: RiverHeroImageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showPhoto = isUsableImageUrl(heroImageUrl) && !failed;
  const mobileSrc = heroImageUrl ? localHeroMobileSrc(heroImageUrl) : undefined;
  const webpSrc = heroImageUrl ? localHeroWebpSrc(heroImageUrl) : undefined;
  const mobileWebp = mobileSrc ? localHeroWebpSrc(mobileSrc) : undefined;
  const useNativeHero = Boolean(mobileSrc && heroImageUrl);

  const heroAsPhoto: ApprovedPhoto | null = showPhoto
    ? {
        id: "hero",
        photoUrl: heroImageUrl,
        caption: heroImageAlt,
        submitterName: heroImageCredit || "Executive Angler",
        submittedAt: new Date().toISOString(),
      }
    : null;

  const allPhotos = heroAsPhoto ? [heroAsPhoto, ...galleryPhotos] : galleryPhotos;
  const totalCount = allPhotos.length;

  return (
    <>
      <section className="relative h-[420px] w-full overflow-hidden">
        {showPhoto && useNativeHero ? (
          <div className="absolute inset-0">
            <picture className="block h-full w-full">
          {mobileWebp ? (
            <source type="image/webp" srcSet={mobileWebp} media="(max-width: 1024px)" />
          ) : null}
          {mobileSrc ? (
            <source srcSet={mobileSrc} media="(max-width: 1024px)" />
          ) : null}
          <img
                src={heroImageUrl}
                alt={heroImageAlt}
                decoding="async"
                fetchPriority="high"
                className="h-full w-full object-cover"
                onLoad={() => setLoaded(true)}
                onError={() => setFailed(true)}
              />
            </picture>
          </div>
        ) : showPhoto ? (
          <div className="absolute inset-0">
            <Image
              src={heroImageUrl}
              alt={heroImageAlt}
              fill
              className="object-cover"
              priority
              fetchPriority="high"
              sizes="100vw"
              placeholder="blur"
              blurDataURL={SURFACE_RAISED_BLUR_DATA_URL}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
            />
          </div>
        ) : (
          <PlateFallback title="" meta={meta} />
        )}

        {/* Unconditional scrim — type sits in the 0.8 band of the 420px desk wash. */}
        <div className="hero-overlay-desk absolute inset-0 pointer-events-none" />

        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-5 pb-7 sm:px-8 xl:px-20">
            {subtitle ? (
              <p className="mb-2 font-ui text-[11px] font-medium uppercase tracking-[1.6px] text-[var(--hero-type)]">
                {subtitle}
              </p>
            ) : null}
            <h1
              className="max-w-4xl font-heading text-[32px] font-semibold leading-[36px] text-[var(--hero-type)] sm:text-[56px] sm:leading-[60px]"
              style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
            >
              {title}
            </h1>
            {meta ? (
              <p className="mt-2 font-ui text-[14px] text-[var(--hero-type)]">{meta}</p>
            ) : null}
            {heroImageCredit ? (
              <p
                className={`mt-3 min-h-[1.125rem] font-ui text-[11px] tracking-wide text-[var(--hero-type)]/80 transition-opacity ${loaded && showPhoto ? "opacity-100" : "opacity-0"}`}
              >
                {heroImageCreditUrl ? (
                  <a
                    href={heroImageCreditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-white/40 underline-offset-4 hover:text-white hover:decoration-white"
                  >
                    {heroImageCredit}
                  </a>
                ) : (
                  heroImageCredit
                )}
              </p>
            ) : null}
          </div>
        </div>

        {totalCount > 1 && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-3 left-3 z-10 font-ui text-[11px] font-medium text-[var(--hero-type)]/90 underline decoration-white/40 underline-offset-4 hover:text-[var(--hero-type)] hover:decoration-white"
            aria-label={`View ${totalCount} photos`}
          >
            {totalCount} photographs
          </button>
        )}

        {children && (
          <div className="absolute top-3 right-3 z-20">{children}</div>
        )}
      </section>

      {lightboxOpen && allPhotos.length > 0 && (
        <PhotoLightbox
          photos={allPhotos}
          initialIndex={0}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
