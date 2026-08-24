"use client";

import { useState } from "react";
import Image from "next/image";
import { Images, Camera } from "lucide-react";
import PhotoLightbox from "./PhotoLightbox";
import type { ApprovedPhoto } from "@/lib/db/photos";
import PlateFallback from "@/components/media/PlateFallback";
import { isUsableImageUrl } from "@/lib/media/image-url";
import { SURFACE_RAISED_BLUR_DATA_URL } from "@/lib/media/blur";

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
      <section className="relative h-[60svh] min-h-[360px] w-full overflow-hidden sm:h-[72vh]">
        {showPhoto ? (
          <Image
            src={heroImageUrl}
            alt={heroImageAlt}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL={SURFACE_RAISED_BLUR_DATA_URL}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        ) : (
          <PlateFallback title="" meta={meta} />
        )}

        {/* Unconditional scrim — title is items-end in the 0.8 band. */}
        <div className="hero-overlay absolute inset-0 pointer-events-none" />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
            {subtitle ? (
              <p className="mb-2 text-[13px] font-medium uppercase tracking-[0.14em] text-white">
                {subtitle}
              </p>
            ) : null}
            <h1
              className="max-w-4xl font-heading font-bold leading-[1.08] tracking-tight text-white drop-shadow-lg"
              style={{ fontSize: "clamp(2.25rem, 5vw, 4.25rem)" }}
            >
              {title}
            </h1>
          </div>
        </div>

        {totalCount > 1 && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-[var(--card)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--ink)] hover:opacity-90"
            aria-label={`View ${totalCount} photos`}
          >
            <Images className="h-3.5 w-3.5" />
            {totalCount} photos
          </button>
        )}

        {loaded && showPhoto && heroImageCredit && (
          <div className="absolute bottom-3 right-3 z-10">
            {heroImageCreditUrl ? (
              <a
                href={heroImageCreditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-[var(--card)] px-2.5 py-1 text-[11px] font-medium text-[var(--ink)] hover:opacity-90"
              >
                <Camera className="h-2.5 w-2.5" />
                {heroImageCredit}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--card)] px-2.5 py-1 text-[11px] font-medium text-[var(--ink)]">
                <Camera className="h-2.5 w-2.5" />
                {heroImageCredit}
              </span>
            )}
          </div>
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
