"use client";

import { useState } from "react";
import Image from "next/image";
import { Images } from "lucide-react";
import PhotoLightbox from "./PhotoLightbox";
import type { ApprovedPhoto } from "@/lib/db/photos";

interface HeroCompactProps {
  heroImageUrl: string;
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

  const heroAsPhoto: ApprovedPhoto = {
    id: "hero",
    photoUrl: heroImageUrl,
    caption: title,
    submitterName: heroImageCredit || "Executive Angler",
    submittedAt: new Date().toISOString(),
  };

  const allPhotos = [heroAsPhoto, ...galleryPhotos];
  const totalCount = allPhotos.length;
  const visibleChips = (chips ?? []).filter((c) => c && c.trim().length > 0);

  return (
    <>
      <div className="group relative flex items-stretch gap-4 bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden shadow-lg">
        {/* Thumbnail — clickable to open gallery */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative shrink-0 w-[160px] sm:w-[200px] h-[120px] bg-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#E8923A] focus:ring-inset"
          aria-label={`View ${totalCount} photo${totalCount === 1 ? "" : "s"} of ${title}`}
        >
          <Image
            src={heroImageUrl}
            alt={heroImageAlt}
            fill
            className={`${imageContain ? "object-contain" : "object-cover"} transition-transform duration-300 group-hover:scale-105`}
            sizes="200px"
            priority
          />
          {/* Gallery count badge */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs font-medium">
            <Images className="h-3 w-3" />
            {totalCount}
          </div>
        </button>

        {/* Text block */}
        <div className="flex-1 min-w-0 py-3 pr-4 flex flex-col justify-center">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm sm:text-base text-[#A8B2BD] truncate">
              {subtitle}
            </p>
          )}
          {visibleChips.length > 0 && (
            // Horizontal scroller (matches iOS CompactRiverHero) so long
            // species chips (e.g. "Bonneville Cutthroat Trout") can't clip
            // the hero or wrap onto a second line.
            <div
              className="mt-2 flex gap-1.5 overflow-x-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {visibleChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex shrink-0 items-center px-2 py-0.5 rounded-full bg-[#0D1117] border border-[#30363D] text-xs text-[#A8B2BD] whitespace-nowrap"
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
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-sm text-[#A8B2BD] hover:text-white hover:border-[#E8923A] transition-colors"
          >
            <Images className="h-4 w-4" />
            View gallery
          </button>
        </div>

        {/* Admin editor slot */}
        {children && (
          <div className="absolute top-2 right-2 z-10">{children}</div>
        )}
      </div>

      {lightboxOpen && (
        <PhotoLightbox
          photos={allPhotos}
          initialIndex={0}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
