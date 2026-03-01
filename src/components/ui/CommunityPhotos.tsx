"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Camera, User } from "lucide-react";
import PhotoLightbox from "./PhotoLightbox";

interface CommunityPhotosProps {
  entityType: string;
  entityId: string;
}

interface PhotoData {
  id: string;
  photoUrl: string;
  caption?: string;
  submitterName: string;
  cameraBody?: string;
  lens?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  submittedAt: string;
}

export default function CommunityPhotos({
  entityType,
  entityId,
}: CommunityPhotosProps) {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPhotos() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("photo_submissions")
        .select(
          "id, photo_url, caption, submitter_name, camera_body, lens, aperture, shutter_speed, iso, submitted_at"
        )
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .eq("status", "approved")
        .order("submitted_at", { ascending: false });

      if (error) {
        console.error("Error fetching photos:", error);
        setLoading(false);
        return;
      }

      const mapped: PhotoData[] = (data || []).map((row) => ({
        id: row.id,
        photoUrl: row.photo_url,
        caption: row.caption || undefined,
        submitterName: row.submitter_name,
        cameraBody: row.camera_body || undefined,
        lens: row.lens || undefined,
        aperture: row.aperture || undefined,
        shutterSpeed: row.shutter_speed || undefined,
        iso: row.iso || undefined,
        submittedAt: row.submitted_at,
      }));

      setPhotos(mapped);
      setLoading(false);
    }

    fetchPhotos();
  }, [entityType, entityId]);

  // Return null if no approved photos (and done loading)
  if (!loading && photos.length === 0) return null;

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-slate-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Camera className="h-5 w-5 text-forest" />
        <h2 className="font-heading text-2xl font-bold text-forest-dark">
          Community Photos
        </h2>
        <span className="px-2.5 py-0.5 text-xs font-medium bg-forest/10 text-forest rounded-full">
          {photos.length}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(index)}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
          >
            <Image
              src={photo.photoUrl}
              alt={photo.caption || `Photo by ${photo.submitterName}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                {photo.caption && (
                  <p className="text-white text-sm line-clamp-2 mb-1.5">
                    {photo.caption}
                  </p>
                )}
                <div className="flex items-center justify-between text-white/70 text-xs">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {photo.submitterName}
                  </span>
                  <span>{formatDate(photo.submittedAt)}</span>
                </div>
                {photo.cameraBody && (
                  <div className="flex items-center gap-1 text-white/50 text-xs mt-1">
                    <Camera className="h-3 w-3" />
                    {photo.cameraBody}
                    {photo.lens ? ` · ${photo.lens}` : ""}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
