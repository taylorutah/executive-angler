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
    <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-[#E8923A]" />
          <h3 className="font-heading text-base font-semibold text-[#E8923A]">
            Community Photos
          </h3>
        </div>
        {photos.length > 0 && (
          <span className="px-2 py-0.5 text-xs font-mono bg-[#E8923A]/10 text-[#E8923A] rounded-full">
            {photos.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square rounded-lg bg-[#1F2937] animate-pulse" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-xs text-[#484F58] mb-3">No photos yet.</p>
          <Link
            href={`/rivers/${riverSlug}/photos#submit`}
            className="inline-flex items-center gap-1.5 text-sm text-[#E8923A] hover:underline"
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
                className="relative aspect-square rounded-lg overflow-hidden group ring-1 ring-[#21262D] hover:ring-[#E8923A] transition-all"
              >
                <Image
                  src={photo.photoUrl}
                  alt={photo.caption || photo.species || "River photo"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="120px"
                />
                <span className="absolute top-1 right-1 text-[10px]">
                  {photo.type === "catch" ? "🐟" : "📷"}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Link
              href={`/rivers/${riverSlug}/photos`}
              className="text-xs text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
            >
              View all {photos.length} photos →
            </Link>
            <Link
              href={`/rivers/${riverSlug}/photos#submit`}
              className="flex items-center gap-1 text-xs bg-[#E8923A]/10 text-[#E8923A] hover:bg-[#E8923A]/20 px-2 py-1 rounded-full transition-colors"
            >
              <Plus className="h-3 w-3" /> Add yours
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
