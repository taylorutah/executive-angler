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
  /** Shown on the plate when the photo is missing. */
  title: string;
  meta?: string;
  children?: React.ReactNode;
}

export default function RiverHeroImage({
  heroImageUrl,
  heroImageAlt,
  heroImageCredit,
  heroImageCreditUrl,
  galleryPhotos,
  title,
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
      <div className="relative w-full overflow-hidden bg-[var(--surface-raised)]" style={{ height: "240px" }}>
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
          <PlateFallback title={title} meta={meta} />
        )}

        {loaded ? (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />
        ) : null}

        {totalCount > 1 && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--ink)] text-[var(--card)] text-xs font-medium hover:opacity-90 transition-opacity"
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
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--ink)] text-[var(--card)] hover:opacity-90 transition-opacity text-[10px] font-medium"
              >
                <Camera className="h-2.5 w-2.5" />
                {heroImageCredit}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--ink)] text-[var(--card)] text-[10px] font-medium">
                <Camera className="h-2.5 w-2.5" />
                {heroImageCredit}
              </span>
            )}
          </div>
        )}

        {children && (
          <div className="absolute top-3 right-3 z-20">{children}</div>
        )}
      </div>

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
