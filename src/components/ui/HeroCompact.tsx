"use client";

import { useState } from "react";
import { Images } from "@/icons";
import PhotoLightbox from "./PhotoLightbox";
import type { ApprovedPhoto } from "@/lib/db/photos";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { isUsableImageUrl } from "@/lib/media/image-url";

interface HeroCompactProps {
  heroImageUrl?: string;
  heroImageAlt: string;
  heroImageCredit?: string;
  title: string;
  subtitle?: string;
  chips?: string[];
  galleryPhotos: ApprovedPhoto[];
  imageContain?: boolean;
  children?: React.ReactNode;
}

export default function HeroCompact({
  heroImageUrl,
  heroImageAlt,
  heroImageCredit,
  title,
  subtitle,
  chips,
  galleryPhotos,
  imageContain = false,
  children,
}: HeroCompactProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const showPhoto = isUsableImageUrl(heroImageUrl);

  const heroAsPhoto: ApprovedPhoto | null = showPhoto
    ? {
        id: "hero",
        photoUrl: heroImageUrl,
        caption: title,
        submitterName: heroImageCredit || "Executive Angler",
        submittedAt: new Date().toISOString(),
      }
    : null;

  const allPhotos = heroAsPhoto ? [heroAsPhoto, ...galleryPhotos] : galleryPhotos;
  const totalCount = allPhotos.length;
  const visibleChips = (chips ?? []).filter((c) => c && c.trim().length > 0);

  return (
    <>
      <div className="group relative flex items-stretch gap-3 sm:gap-4 bg-[var(--surface-raised)] border border-[var(--border-strong)] rounded-xl overflow-hidden shadow-lg">
        <button
          type="button"
          onClick={() => totalCount > 0 && setLightboxOpen(true)}
          className="relative shrink-0 w-[112px] sm:w-[200px] h-[112px] sm:h-[120px] bg-[var(--surface-card)] focus:outline-none focus:ring-2 focus:ring-[var(--action)] focus:ring-inset"
          aria-label={
            totalCount > 0
              ? `View ${totalCount} photo${totalCount === 1 ? "" : "s"} of ${title}`
              : title
          }
        >
          <SafeEntityImage
            src={heroImageUrl}
            alt={heroImageAlt}
            title={title}
            meta={subtitle}
            contain={imageContain}
            className={`${imageContain ? "object-contain p-2" : "object-cover"} transition-transform duration-300 group-hover:scale-105`}
            sizes="(max-width: 640px) 112px, 200px"
            priority
          />
          {totalCount > 0 && (
            <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-[10px] sm:text-xs font-medium">
              <Images className="h-3 w-3" />
              {totalCount}
            </div>
          )}
        </button>

        {/* Text block */}
        <div className={`flex-1 min-w-0 py-2.5 sm:py-3 pr-3 sm:pr-4 flex flex-col justify-center ${children ? "pt-9 sm:pt-3" : ""}`}>
          <h1 className="font-heading text-lg sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight leading-tight line-clamp-2 sm:truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-base text-[var(--text-body)] truncate">
              {subtitle}
            </p>
          )}
          {visibleChips.length > 0 && (
            // Horizontal scroller (matches iOS CompactRiverHero) so long
            // species chips (e.g. "Bonneville Cutthroat Trout") can't clip
            // the hero or wrap onto a second line.
            <div
              className="mt-1.5 sm:mt-2 flex gap-1.5 overflow-x-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {visibleChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex shrink-0 items-center px-2 py-0.5 rounded-full bg-[var(--surface-page)] border border-[var(--border-strong)] text-[11px] sm:text-xs text-[var(--text-body)] whitespace-nowrap"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Gallery button (desktop) */}
        <div className="hidden sm:flex items-center pr-4">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-page)] border border-[var(--border-strong)] text-sm text-[var(--text-body)] hover:text-white hover:border-[var(--action)] transition-colors"
          >
            <Images className="h-4 w-4" />
            View gallery
          </button>
        </div>

        {/* Admin editor slot — positioned over the image on mobile so it
            doesn't crowd the title; sits at top-right on desktop */}
        {children && (
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10">{children}</div>
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
