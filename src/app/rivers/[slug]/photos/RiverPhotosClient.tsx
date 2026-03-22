"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Camera, Fish, Calendar, User } from "lucide-react";
import PhotoSubmissionForm from "@/components/ui/PhotoSubmissionForm";
import PhotoLightbox from "@/components/ui/PhotoLightbox";
import type { RiverPhoto } from "@/app/api/photos/river/[riverId]/route";

interface RiverPhotosClientProps {
  riverId: string;
  riverSlug: string;
  riverName: string;
}

type PhotoTab = "all" | "catches" | "submissions";

export default function RiverPhotosClient({
  riverId,
  riverSlug,
  riverName,
}: RiverPhotosClientProps) {
  const [photos, setPhotos] = useState<RiverPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<PhotoTab>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/photos/river/${riverId}`)
      .then((r) => r.json())
      .then((d) => { setPhotos(d.photos || []); setLoading(false); })
      .catch(() => setLoading(false));

    // Scroll to submit if hash present
    if (typeof window !== "undefined" && window.location.hash === "#submit") {
      setTimeout(() => {
        document.getElementById("submit-section")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [riverId]);

  const filteredPhotos = photos.filter((p) => {
    if (tab === "catches") return p.type === "catch";
    if (tab === "submissions") return p.type === "submission";
    return true;
  });

  const lightboxPhotos = filteredPhotos.map((p) => ({
    id: p.id,
    photoUrl: p.photoUrl,
    caption: p.caption,
    submitterName: p.submitterName || p.username || "Angler",
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

  const catches = photos.filter((p) => p.type === "catch").length;
  const submissions = photos.filter((p) => p.type === "submission").length;

  return (
    <div className="space-y-10">
      {/* Submit Section */}
      <section id="submit-section">
        <div className="bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#21262D] flex items-center gap-3">
            <Camera className="h-5 w-5 text-[#E8923A]" />
            <div>
              <h2 className="font-heading text-lg font-semibold text-[#E8923A]">Submit Your Photo</h2>
              <p className="text-xs text-[#A8B2BD] mt-0.5">
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
            />
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section>
        {/* Tabs + counts */}
        <div className="flex items-center gap-1 mb-6 border-b border-[#21262D] pb-0">
          {([
            { key: "all", label: "All Photos", count: photos.length },
            { key: "catches", label: "Catches", count: catches },
            { key: "submissions", label: "Community", count: submissions },
          ] as { key: PhotoTab; label: string; count: number }[]).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === key
                  ? "border-[#E8923A] text-[#E8923A]"
                  : "border-transparent text-[#A8B2BD] hover:text-[#F0F6FC]"
              }`}
            >
              {label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-mono ${
                tab === key ? "bg-[#E8923A]/10 text-[#E8923A]" : "bg-[#1F2937] text-[#6E7681]"
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl bg-[#161B22] animate-pulse" />
            ))}
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="h-12 w-12 text-[#21262D] mx-auto mb-4" />
            <p className="text-[#6E7681]">
              {tab === "all" ? "No photos yet." : `No ${tab} photos yet.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => setLightboxIndex(index)}
                className="group relative text-left bg-[#161B22] rounded-xl overflow-hidden ring-1 ring-[#21262D] hover:ring-[#E8923A] transition-all focus:outline-none focus:ring-2 focus:ring-[#E8923A]"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={photo.photoUrl}
                    alt={photo.caption || photo.species || "River photo"}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {/* Type badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      photo.type === "catch"
                        ? "bg-[#00B4D8]/20 text-[#00B4D8]"
                        : "bg-[#E8923A]/20 text-[#E8923A]"
                    }`}>
                      {photo.type === "catch" ? <><Fish className="h-2.5 w-2.5" /> Catch</> : <><Camera className="h-2.5 w-2.5" /> Photo</>}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-3">
                  {photo.caption && (
                    <p className="text-xs text-[#F0F6FC] line-clamp-2 mb-1.5">{photo.caption}</p>
                  )}
                  {photo.type === "catch" && (photo.species || photo.lengthInches) && (
                    <p className="text-xs text-[#00B4D8] mb-1">
                      {[photo.species, photo.lengthInches ? `${photo.lengthInches}"` : ""].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-[#6E7681]">
                    <span className="flex items-center gap-1">
                      <User className="h-2.5 w-2.5" />
                      {photo.submitterName || photo.username || "Angler"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
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
