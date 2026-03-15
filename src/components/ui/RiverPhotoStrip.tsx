"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Plus } from "lucide-react";
import type { RiverPhoto } from "@/app/api/photos/river/[riverId]/route";
import PhotoLightbox from "./PhotoLightbox";

interface RiverPhotoStripProps {
  riverId: string;
  riverSlug: string;
  riverName: string;
}

export default function RiverPhotoStrip({
  riverId,
  riverSlug,
  riverName,
}: RiverPhotoStripProps) {
  const [photos, setPhotos] = useState<RiverPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/photos/river/${riverId}`)
      .then((r) => r.json())
      .then((d) => { setPhotos(d.photos || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [riverId]);

  if (!loading && photos.length === 0) {
    return (
      <div className="bg-[#0D1117] border-b border-[#21262D] px-4 py-3 flex items-center gap-4">
        <Camera className="h-4 w-4 text-[#484F58] shrink-0" />
        <span className="text-sm text-[#484F58]">No photos yet.</span>
        <Link
          href={`/rivers/${riverSlug}/photos#submit`}
          className="text-sm text-[#E8923A] hover:underline flex items-center gap-1"
        >
          <Plus className="h-3.5 w-3.5" /> Be the first to submit a photo
        </Link>
      </div>
    );
  }

  const displayPhotos = photos.slice(0, 12);

  // Convert to lightbox format
  const lightboxPhotos = displayPhotos.map((p) => ({
    id: p.id,
    photoUrl: p.photoUrl,
    caption: p.caption,
    submitterName: p.submitterName || p.username || "Angler",
    submittedAt: p.submittedAt,
  }));

  return (
    <>
      <div className="bg-[#0D1117] border-b border-[#21262D]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Thumbnails */}
            <div className="flex items-center gap-1 flex-1 overflow-hidden">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-16 h-16 rounded-md bg-[#161B22] animate-pulse shrink-0"
                    />
                  ))
                : displayPhotos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setLightboxIndex(index)}
                      className="relative w-16 h-16 rounded-md overflow-hidden shrink-0 group ring-1 ring-[#21262D] hover:ring-[#E8923A] transition-all"
                    >
                      <Image
                        src={photo.photoUrl}
                        alt={photo.caption || photo.species || "River photo"}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="64px"
                      />
                      {/* Type badge */}
                      <span className="absolute top-0.5 right-0.5 text-[10px] leading-none">
                        {photo.type === "catch" ? "🐟" : "📷"}
                      </span>
                    </button>
                  ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {photos.length > 0 && (
                <Link
                  href={`/rivers/${riverSlug}/photos`}
                  className="text-xs text-[#8B949E] hover:text-[#F0F6FC] whitespace-nowrap transition-colors"
                >
                  View all {photos.length} →
                </Link>
              )}
              <Link
                href={`/rivers/${riverSlug}/photos#submit`}
                className="flex items-center gap-1 text-xs bg-[#E8923A]/10 text-[#E8923A] hover:bg-[#E8923A]/20 px-2.5 py-1.5 rounded-full transition-colors whitespace-nowrap"
              >
                <Plus className="h-3 w-3" /> Add yours
              </Link>
            </div>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={lightboxPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
