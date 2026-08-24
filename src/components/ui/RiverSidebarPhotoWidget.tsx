"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Plus } from "lucide-react";
import type { RiverPhoto } from "@/app/api/photos/river/[riverId]/route";

interface RiverSidebarPhotoWidgetProps {
  riverId: string;
  riverSlug: string;
}

export default function RiverSidebarPhotoWidget({
  riverId,
  riverSlug,
}: RiverSidebarPhotoWidgetProps) {
  const [photos, setPhotos] = useState<RiverPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/photos/river/${riverId}`)
      .then((r) => r.json())
      .then((d) => { setPhotos(d.photos || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [riverId]);

  return (
    <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-[var(--action)]" />
          <h3 className="font-heading text-base font-semibold text-[var(--action)]">
            Community Photos
          </h3>
        </div>
        {photos.length > 0 && (
          <span className="px-2 py-0.5 text-xs font-mono bg-[var(--action)]/10 text-[var(--action)] rounded-full">
            {photos.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square rounded-lg bg-[var(--surface-card)] animate-pulse" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-xs text-[var(--text-meta)] mb-3">No photos yet.</p>
          <Link
            href={`/rivers/${riverSlug}/photos#submit`}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--action)] hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Be the first to submit
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-1.5 mb-4">
            {photos.slice(0, 4).map((photo) => (
              <Link
                key={photo.id}
                href={`/rivers/${riverSlug}/photos`}
                className="relative aspect-square rounded-lg overflow-hidden group ring-1 ring-[var(--border-rule)] hover:ring-[var(--action)] transition-all"
              >
                <Image
                  src={photo.photoUrl}
                  alt={photo.caption || "River photo"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="120px"
                />
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Link
              href={`/rivers/${riverSlug}/photos`}
              className="text-xs text-[var(--text-body)] hover:text-[var(--text-primary)] transition-colors"
            >
              View all {photos.length} photos →
            </Link>
            <Link
              href={`/rivers/${riverSlug}/photos#submit`}
              className="flex items-center gap-1 text-xs bg-[var(--action)]/10 text-[var(--action)] hover:bg-[var(--action)]/20 px-2 py-1 rounded-full transition-colors"
            >
              <Plus className="h-3 w-3" /> Add yours
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
