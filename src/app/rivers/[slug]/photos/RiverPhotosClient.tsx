"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Camera, Calendar, User } from "@/icons";
import PhotoSubmissionForm from "@/components/ui/PhotoSubmissionForm";
import PhotoLightbox from "@/components/ui/PhotoLightbox";
import type { RiverPhoto } from "@/app/api/photos/river/[riverId]/route";

interface RiverPhotosClientProps {
  riverId: string;
  riverSlug: string;
  riverName: string;
}

export default function RiverPhotosClient({
  riverId,
  riverSlug: _riverSlug,
  riverName,
}: RiverPhotosClientProps) {
  const [photos, setPhotos] = useState<RiverPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/photos/river/${riverId}`)
      .then((r) => r.json())
      .then((d) => { setPhotos(d.photos || []); setLoading(false); })
      .catch(() => setLoading(false));

    if (typeof window !== "undefined" && window.location.hash === "#submit") {
      setTimeout(() => {
        document.getElementById("submit-section")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [riverId]);

  const lightboxPhotos = photos.map((p) => ({
    id: p.id,
    photoUrl: p.photoUrl,
    caption: p.caption,
    submitterName: p.submitterName || "Angler",
    cameraBody: undefined,
    lens: undefined,
    aperture: undefined,
    shutterSpeed: undefined,
    iso: undefined,
    submittedAt: p.submittedAt,
  }));

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="space-y-10">
      {/* Submit Section */}
      <section id="submit-section">
        <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3">
            <Camera className="h-5 w-5 text-[var(--accent)]" />
            <div>
              <h2 className="font-heading text-lg font-semibold text-[var(--text-1)]">Submit Your Photo</h2>
              <p className="text-xs text-[var(--text-2)] mt-0.5">
                Share your best shots from {riverName}. Ideal: 2000px+ wide, JPEG or PNG, well-exposed. All photos are reviewed before publishing.
              </p>
            </div>
          </div>
          <div className="p-0">
            <PhotoSubmissionForm
              entityType="river"
              entityId={riverId}
              entityName={riverName}
              defaultOpen={true}
              showQualityGuidance={true}
              hideHeader={true}
            />
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-[var(--text-1)]">
            Community Photos
            <span className="ml-2 text-xs text-[var(--text-3)] num font-normal">{photos.length}</span>
          </h2>
          <p className="text-xs text-[var(--text-3)]">
            Submitted by anglers — never pulled from private catch logs.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-[var(--radius-card)] bg-[var(--paper-deep)] animate-pulse" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="ea-empty rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
            <p>No photos yet. Be the first to submit one above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => setLightboxIndex(index)}
                className="group relative text-left bg-[var(--surface)] rounded-[var(--radius-card)] overflow-hidden border border-[var(--border)] transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={photo.photoUrl}
                    alt={photo.caption || "River photo"}
                    fill
                    className="ea-photo"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="p-3">
                  {photo.caption && (
                    <p className="text-xs text-[var(--text-1)] line-clamp-2 mb-1.5">{photo.caption}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-[var(--text-3)]">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {photo.submitterName || "Angler"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(photo.submittedAt)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={lightboxPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
