"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Plus } from "@/icons";
import type { RiverPhoto } from "@/app/api/photos/river/[riverId]/route";
import { fetchOnce } from "@/components/rivers/fetch-once";
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
    fetchOnce(`/api/photos/river/${riverId}`)
      .then((r) => r.json())
      .then((d) => { setPhotos(d.photos || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [riverId]);

  if (!loading && photos.length === 0) {
    return null;
  }

  const displayPhotos = photos.slice(0, 12);

  // Convert to lightbox format
  const lightboxPhotos = displayPhotos.map((p) => ({
    id: p.id,
    photoUrl: p.photoUrl,
    caption: p.caption,
    submitterName: p.submitterName || "Angler",
    submittedAt: p.submittedAt,
  }));

  return (
    <>
      <div className="bg-[var(--paper)] border-b border-[var(--border)]">
        <div className="mx-auto max-w-[var(--container)] px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Thumbnails */}
            <div className="flex items-center gap-1 flex-1 overflow-hidden">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-16 h-16 rounded-md bg-[var(--paper-deep)] animate-pulse shrink-0"
                    />
                  ))
                : displayPhotos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setLightboxIndex(index)}
                      className="relative w-16 h-16 rounded-md overflow-hidden shrink-0 group ring-1 ring-[var(--border)] hover:ring-[var(--accent)] transition-shadow"
                    >
                      <Image
                        src={photo.photoUrl}
                        alt={photo.caption || "River photo"}
                        fill
                        className="ea-photo"
                        sizes="64px"
                      />
                    </button>
                  ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {photos.length > 0 && (
                <Link
                  href={`/rivers/${riverSlug}/photos`}
                  className="text-xs text-[var(--text-3)] hover:text-[var(--text-1)] whitespace-nowrap transition-colors"
                >
                  View all {photos.length} →
                </Link>
              )}
              <Link
                href={`/rivers/${riverSlug}/photos#submit`}
                className="flex items-center gap-1 rounded-[var(--radius-md)] px-2.5 py-1.5 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5" /> Add yours
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
