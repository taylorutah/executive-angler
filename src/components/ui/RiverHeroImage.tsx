"use client";

import { useState } from "react";
import Image from "next/image";
import { Images } from "@/icons";
import PhotoLightbox from "./PhotoLightbox";
import type { ApprovedPhoto } from "@/lib/db/photos";
import PlateFallback from "@/components/media/PlateFallback";
import EntityIdentityBand from "@/components/ui/EntityIdentityBand";
import { isUsableImageUrl, normalizeImageUrl } from "@/lib/media/image-url";
import { SURFACE_RAISED_BLUR_DATA_URL } from "@/lib/media/blur";
import { labeledPhotoCredit } from "@/lib/authors";

interface RiverHeroImageProps {
  heroImageUrl?: string;
  heroImageAlt: string;
  heroImageCredit?: string;
  heroImageCreditUrl?: string;
  galleryPhotos: ApprovedPhoto[];
  /** River name — set in Fraunces on the paper band below the photograph. */
  title: string;
  /** Destination / water-type overline above the name. */
  subtitle?: string;
  meta?: string;
  /** Breadcrumbs + actions — sits on the same paper band as the title. */
  toolbar?: React.ReactNode;
  /** Spec facts — full-width rail under the name so the band is not a left stack. */
  spec?: React.ReactNode;
  /** Answer-first lede under the H1, above the spec rail. */
  lede?: string;
  children?: React.ReactNode;
}

/**
 * Flat river hero (DESIGN.md § Imagery): graded photograph in its own band,
 * then overline/title/meta on paper below. No scrim, no text over the
 * photo — gradients are banned and metadata never sits on imagery.
 *
 * The "N photographs" chip sits on the photo as a solid ink chip (the one
 * sanctioned flat pattern for photo affordances). AdminHeroEditor mounts in
 * the top-right corner via children.
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
  toolbar,
  spec,
  lede,
  children,
}: RiverHeroImageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const heroSrc = normalizeImageUrl(heroImageUrl);
  const showPhoto = isUsableImageUrl(heroSrc) && !failed;
  const credit = labeledPhotoCredit(heroImageCredit);

  const heroAsPhoto: ApprovedPhoto | null = showPhoto
    ? {
        id: "hero",
        photoUrl: heroSrc,
        caption: heroImageAlt,
        submitterName: credit || "Executive Angler",
        submittedAt: new Date().toISOString(),
      }
    : null;

  const allPhotos = heroAsPhoto ? [heroAsPhoto, ...galleryPhotos] : galleryPhotos;
  const totalCount = allPhotos.length;

  return (
    <>
      <section className="w-full">
        <div className="relative h-[60svh] min-h-[360px] w-full overflow-hidden sm:h-[72vh]">
          {showPhoto ? (
            <Image
              src={heroSrc}
              alt={heroImageAlt}
              fill
              className="object-cover [filter:var(--photo-grade)]"
              priority
              sizes="100vw"
              placeholder="blur"
              blurDataURL={SURFACE_RAISED_BLUR_DATA_URL}
              onError={() => setFailed(true)}
            />
          ) : (
            <PlateFallback title="" meta={meta} />
          )}

          {totalCount > 1 && (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded bg-[var(--ink)] px-2 py-1 text-[var(--text-12)] font-medium text-[var(--paper)] hover:opacity-90 transition-opacity"
              aria-label={`View ${totalCount} photos`}
            >
              <Images className="h-3.5 w-3.5" />
              {totalCount} photographs
            </button>
          )}

          {children && (
            <div className="absolute top-3 right-3 z-20">{children}</div>
          )}
        </div>

        {showPhoto && credit ? (
          <p className="mx-auto max-w-[var(--container)] px-4 pt-2 text-[var(--text-13)] tracking-wide text-[var(--text-3)] sm:px-6 lg:px-8">
            {heroImageCreditUrl ? (
              <a
                href={heroImageCreditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-[var(--text-1)]"
              >
                {credit}
              </a>
            ) : (
              credit
            )}
          </p>
        ) : null}

        <EntityIdentityBand
          toolbar={toolbar}
          overline={subtitle}
          title={title}
          meta={meta}
          spec={spec}
        >
          {lede ? (
            <p className="mt-3 max-w-[var(--prose)] text-[var(--text-16)] leading-relaxed text-[var(--text-2)]">
              {lede}
            </p>
          ) : null}
        </EntityIdentityBand>
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
