"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Camera, User } from "@/icons";
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

      // Pull banned user ids first so we can hide their photos. Legacy
      // uploads with a NULL user_id stay visible (the `.is.null` branch).
      const { data: bannedRows } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("is_banned", true);
      const bannedIds = (bannedRows ?? []).map((r) => r.user_id as string);

      let query = supabase
        .from("photo_submissions")
        .select(
          "id, photo_url, caption, submitter_name, camera_body, lens, aperture, shutter_speed, iso, submitted_at"
        )
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .eq("status", "approved");

      if (bannedIds.length > 0) {
        query = query.or(
          `user_id.is.null,user_id.not.in.(${bannedIds.join(",")})`
        );
      }

      const { data, error } = await query.order("submitted_at", {
        ascending: false,
      });

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
          <div className="h-8 w-48 bg-[var(--paper-deep)] rounded-[var(--radius-sm)] animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-[var(--paper-deep)] rounded-surface animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Camera className="h-5 w-5 text-[var(--text-1)]" />
        <h2 className="font-heading text-2xl font-semibold text-[var(--text-1)]">
          Community Photos
        </h2>
        <span className="ea-badge num">
          {photos.length}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(index)}
            aria-label={`View photo${photo.caption ? `: ${photo.caption}` : ""} by ${photo.submitterName}`}
            className="group relative aspect-[4/3] rounded-surface overflow-hidden bg-[var(--paper-deep)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
          >
            <Image
              src={photo.photoUrl}
              alt={photo.caption || `Photo by ${photo.submitterName}`}
              fill
              className="ea-photo"
              sizes="(max-width: 768px) 50vw, 33vw"
            />

            {/* Photo credit — the one sanctioned on-photo affordance */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--ink)] px-2 py-1 text-xs font-medium text-[var(--paper)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <User className="h-3 w-3" aria-hidden />
              {photo.submitterName}
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
