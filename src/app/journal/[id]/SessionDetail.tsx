"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Pencil, Fish, X, ChevronLeft, ChevronRight,
  Cloud, MapPin, Clock, Check, RotateCcw, Camera, Loader2
} from "lucide-react";
import { parseLocalDate } from "@/lib/date";
import { RiverStatsWidget } from "@/components/stats/RiverStatsWidget";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function SessionMiniMap({ lat, lng, className }: { lat: number; lng: number; className?: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      if (mapContainer.current) {
        mapContainer.current.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#161B22;color:#8B949E;border-radius:0.75rem;font-size:0.875rem;">Map unavailable</div>';
      }
      return;
    }

    mapboxgl.accessToken = token;

    try {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: prefersDark
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/outdoors-v12",
        center: [lng, lat],
        zoom: 12,
        interactive: false, // Disable all interactions
      });

      // Add orange marker
      new mapboxgl.Marker({ color: "#E8923A" })
        .setLngLat([lng, lat])
        .addTo(map);

      return () => {
        map.remove();
      };
    } catch (e) {
      console.error("Mapbox mini-map failed:", e);
      if (mapContainer.current) {
        mapContainer.current.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#161B22;color:#8B949E;border-radius:0.75rem;font-size:0.875rem;">Map unavailable</div>';
      }
    }
  }, [mounted, lat, lng]);

  if (!mounted) {
    return <div className={`${className} bg-gray-100 dark:bg-[#161B22]`} />;
  }

  return <div ref={mapContainer} className={className} />;
}

interface Catch {
  id: string;
  species?: string;
  length_inches?: string;
  quantities?: number;
  fly_position?: string;
  fly_size?: string;
  bead_size?: string;
  time_caught?: string;
  fish_image_url?: string;
  fish_location_image_url?: string;
  fly_image_url?: string;
  fly_pattern?: { name?: string; type?: string } | null;
}

interface FlyPattern {
  id: string;
  name: string;
  type?: string;
  image_url?: string;
}

interface GearSnapshot {
  rod?: { name: string; maker?: string };
  reel?: { name: string; maker?: string };
  line?: { name: string; maker?: string };
  leader?: { name: string; maker?: string };
  tippet?: { name: string; maker?: string };
}

interface Session {
  id: string;
  title?: string;
  river_name?: string;
  location?: string;
  date: string;
  weather?: string;
  water_temp_f?: string;
  water_clarity?: string;
  notes?: string;
  flies_notes?: string;
  trip_tags?: string[];
  tags?: string[];
  total_fish?: number;
  created_at?: string;
  latitude?: number;
  longitude?: number;
  gear_snapshot?: GearSnapshot;
  gear_rod?: { name: string; maker?: string } | null;
  gear_reel?: { name: string; maker?: string } | null;
  gear_line?: { name: string; maker?: string } | null;
  gear_leader?: { name: string; maker?: string } | null;
  gear_tippet?: { name: string; maker?: string } | null;
}

interface SessionPhoto {
  id: string;
  url: string;
  caption?: string;
  created_at: string;
}

interface Props {
  session: Session;
  catches: Catch[];
  flies: FlyPattern[];
  sessionPhotos?: SessionPhoto[];
}

function FishLightbox({ catches, initialIndex, onClose, catchPhotos }: {
  catches: Catch[];
  initialIndex: number;
  onClose: () => void;
  catchPhotos: Record<string, string>;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const c = catches[idx];
  const imageUrl = catchPhotos[c.id] || c.fish_image_url;
  const goNext = useCallback(() => setIdx(p => (p + 1) % catches.length), [catches.length]);
  const goPrev = useCallback(() => setIdx(p => (p - 1 + catches.length) % catches.length), [catches.length]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", h);
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose, goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-[#161B22]/10 text-white hover:bg-[#161B22]/20"><X className="h-5 w-5" /></button>
      {catches.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); goPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#161B22]/10 text-white hover:bg-[#161B22]/20"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={e => { e.stopPropagation(); goNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#161B22]/10 text-white hover:bg-[#161B22]/20"><ChevronRight className="h-5 w-5" /></button>
        </>
      )}
      <div className="max-w-2xl w-full mx-16" onClick={e => e.stopPropagation()}>
        {imageUrl ? (
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
            <Image src={imageUrl} alt={c.species || "Fish"} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] rounded-xl bg-[#1F2937] flex items-center justify-center">
            <Fish className="h-16 w-16 text-[#8B949E]" />
          </div>
        )}
        <div className="mt-4 text-center">
          <p className="text-white text-xl font-semibold">{c.species || "Unknown"}{c.length_inches ? ` · ${c.length_inches}"` : ""}</p>
          <div className="flex items-center justify-center gap-3 mt-1 text-sm text-white/60 flex-wrap">
            {c.fly_pattern?.name && <span>🪰 {c.fly_pattern.name}</span>}
            {c.fly_position && <span>· {c.fly_position}</span>}
            {c.fly_size && <span>· Size {c.fly_size}</span>}
            {c.bead_size && <span>· {c.bead_size} bead</span>}
            {c.time_caught && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.time_caught}</span>}
          </div>
        </div>
        {catches.length > 1 && <p className="text-center text-white/30 text-xs mt-3">{idx + 1} / {catches.length}</p>}
      </div>
    </div>
  );
}

function SessionPhotoLightbox({ photos, initialIndex, onClose, onDelete }: {
  photos: SessionPhoto[];
  initialIndex: number;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const photo = photos[idx];
  const goNext = useCallback(() => setIdx(p => (p + 1) % photos.length), [photos.length]);
  const goPrev = useCallback(() => setIdx(p => (p - 1 + photos.length) % photos.length), [photos.length]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", h);
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose, goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-[#161B22]/10 text-white hover:bg-[#161B22]/20"><X className="h-5 w-5" /></button>
      <button
        onClick={() => {
          onDelete(photo.id);
          if (photos.length === 1) onClose();
          else if (idx >= photos.length - 1) setIdx(0);
        }}
        className="absolute top-4 right-16 p-2 rounded-full bg-red-600/80 text-white hover:bg-red-600"
      >
        Delete
      </button>
      {photos.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); goPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#161B22]/10 text-white hover:bg-[#161B22]/20"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={e => { e.stopPropagation(); goNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#161B22]/10 text-white hover:bg-[#161B22]/20"><ChevronRight className="h-5 w-5" /></button>
        </>
      )}
      <div className="max-w-3xl w-full mx-16" onClick={e => e.stopPropagation()}>
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
          <Image src={photo.url} alt={photo.caption || "Session photo"} fill className="object-cover" />
        </div>
        {photo.caption && (
          <div className="mt-4 text-center">
            <p className="text-white text-lg">{photo.caption}</p>
          </div>
        )}
        {photos.length > 1 && <p className="text-center text-white/30 text-xs mt-3">{idx + 1} / {photos.length}</p>}
      </div>
    </div>
  );
}

export default function SessionDetail({ session, catches, flies, sessionPhotos = [] }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Catch photo uploads
  const [catchPhotos, setCatchPhotos] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    catches.forEach(c => { if (c.fish_image_url) m[c.id] = c.fish_image_url; });
    return m;
  });
  const [uploadingCatch, setUploadingCatch] = useState<string | null>(null);

  // Session photo uploads
  const [allSessionPhotos, setAllSessionPhotos] = useState(sessionPhotos);
  const [uploadingSessionPhoto, setUploadingSessionPhoto] = useState(false);
  const [sessionPhotoLightboxIdx, setSessionPhotoLightboxIdx] = useState<number | null>(null);

  // Inline notes editing
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(session.notes || "");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  async function saveNotes() {
    if (notesValue === session.notes) { setEditingNotes(false); return; }
    setNotesSaving(true);
    try {
      const res = await fetch(`/api/fishing/session?id=${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesValue }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Notes save failed:", res.status, err);
        alert(`Save failed (${res.status}). Please try again.`);
        setNotesSaving(false);
        return;
      }
      setEditingNotes(false);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch (e) {
      console.error("Notes save error:", e);
      alert("Save failed. Check your connection and try again.");
    } finally {
      setNotesSaving(false);
    }
  }

  async function handleCatchPhotoUpload(catchId: string, file: File) {
    setUploadingCatch(catchId);
    const form = new FormData();
    form.append("file", file);
    form.append("catchId", catchId);
    try {
      const res = await fetch("/api/photos/catch", { method: "POST", body: form });
      if (res.ok) {
        const { url } = await res.json();
        setCatchPhotos(prev => ({ ...prev, [catchId]: url }));
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (e) {
      console.error("Upload error:", e);
      alert("Upload failed. Check your connection and try again.");
    } finally {
      setUploadingCatch(null);
    }
  }

  async function handleSessionPhotoUpload(file: File) {
    setUploadingSessionPhoto(true);
    const form = new FormData();
    form.append("file", file);
    form.append("sessionId", session.id);
    try {
      const res = await fetch("/api/photos/session", { method: "POST", body: form });
      if (res.ok) {
        const photo = await res.json();
        setAllSessionPhotos(prev => [...prev, photo]);
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (e) {
      console.error("Upload error:", e);
      alert("Upload failed. Check your connection and try again.");
    } finally {
      setUploadingSessionPhoto(false);
    }
  }

  async function handleSessionPhotoDelete(photoId: string) {
    if (!confirm("Delete this photo?")) return;
    try {
      const res = await fetch(`/api/photos/session?id=${photoId}`, { method: "DELETE" });
      if (res.ok) {
        setAllSessionPhotos(prev => prev.filter(p => p.id !== photoId));
      } else {
        alert("Delete failed. Please try again.");
      }
    } catch (e) {
      console.error("Delete error:", e);
      alert("Delete failed. Check your connection and try again.");
    }
  }

  const catchesTotal = catches.reduce((s, c) => s + (c.quantities || 1), 0);
  // Use whichever is larger: summed catch rows OR session.total_fish (drift mode or partial logging)
  const totalFish = Math.max(catchesTotal, session.total_fish ?? 0);
  const isDriftMode = catches.length === 0 && (session.total_fish ?? 0) > 0;
  const tags = session.trip_tags || session.tags || [];
  const fishPhotos = catches.filter(c => catchPhotos[c.id] || c.fish_image_url);

  const formattedDate = parseLocalDate(session.date).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const sessionStartTime = (() => {
    if (!session.created_at) return null;
    try {
      return new Date(session.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } catch { return null; }
  })();

  // Unique flies used
  const usedFlies = Array.from(
    new Map(
      catches.filter(c => c.fly_pattern?.name)
        .map(c => [c.fly_pattern!.name!, { name: c.fly_pattern!.name!, image: c.fly_image_url }])
    ).values()
  );

  const biggestFish = Math.round(catches.reduce((best, c) => {
    const len = parseFloat(c.length_inches || "0");
    return len > (best || 0) ? len : best;
  }, 0) * 10) / 10;

  return (
    <>
      {lightboxIdx !== null && (
        <FishLightbox catches={fishPhotos} initialIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} catchPhotos={catchPhotos} />
      )}
      {sessionPhotoLightboxIdx !== null && allSessionPhotos.length > 0 && (
        <SessionPhotoLightbox
          photos={allSessionPhotos}
          initialIndex={sessionPhotoLightboxIdx}
          onClose={() => setSessionPhotoLightboxIdx(null)}
          onDelete={handleSessionPhotoDelete}
        />
      )}

      <div className="min-h-screen bg-[#0D1117]">

        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 pt-24">

          {/* Breadcrumb + Edit */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/journal" className="flex items-center gap-1.5 text-sm text-[#8B949E] hover:text-[#E8923A] transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Journal
            </Link>
            <div className="flex items-center gap-3">
              {notesSaved && <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Saved</span>}
              <Link href={`/journal/${session.id}/edit`}
                className="flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d4822f] transition-colors shadow-sm">
                <Pencil className="h-3.5 w-3.5" /> Edit Session
              </Link>
            </div>
          </div>

          {/* ---- STRAVA-STYLE HEADER CARD ---- */}
          <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5 sm:p-6 mb-5">
            <div className="flex flex-col sm:flex-row sm:gap-8">

              {/* LEFT: title + meta + notes */}
              <div className="flex-1 min-w-0 mb-5 sm:mb-0">
                <p className="text-xs text-[#484F58] mb-1">
                  {formattedDate}
                  {sessionStartTime && <> · {sessionStartTime}</>}
                  {session.location && <> · <MapPin className="h-3 w-3 inline -mt-0.5" /> {session.river_name ? `${session.river_name}, ` : ""}{session.location}</>}
                  {!session.location && session.river_name && <> · {session.river_name}</>}
                </p>

                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#F0F6FC] leading-tight mb-3">
                  {session.title || session.river_name || "Fishing Session"}
                </h1>

                {/* Inline-editable notes */}
                <div className="mb-3 max-w-lg group/notes relative">
                  {editingNotes ? (
                    <div>
                      <textarea
                        autoFocus
                        rows={4}
                        value={notesValue}
                        onChange={e => setNotesValue(e.target.value)}
                        onKeyDown={e => { if (e.key === "Escape") { setNotesValue(session.notes || ""); setEditingNotes(false); } }}
                        className="w-full text-sm text-[#8B949E] leading-relaxed rounded-lg border border-[#E8923A]/40 bg-[#161B22] px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#E8923A]"
                      />
                      <div className="flex items-center gap-2 mt-1.5">
                        <button onClick={saveNotes} disabled={notesSaving}
                          className="flex items-center gap-1 text-xs font-semibold text-white bg-[#E8923A] rounded-lg px-3 py-1.5 hover:bg-[#0D1117] disabled:opacity-60">
                          <Check className="h-3 w-3" /> {notesSaving ? "Saving…" : "Save"}
                        </button>
                        <button onClick={() => { setNotesValue(session.notes || ""); setEditingNotes(false); }}
                          className="flex items-center gap-1 text-xs text-[#484F58] hover:text-[#8B949E]">
                          <RotateCcw className="h-3 w-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : notesValue ? (
                    <div
                      onClick={() => setEditingNotes(true)}
                      className="cursor-text rounded-lg border border-transparent hover:border-[#E8923A]/30 hover:bg-[#E8923A]/5 px-2 py-1.5 -mx-2 transition-colors group/notesblock"
                      title="Click to edit notes"
                    >
                      <p className="text-sm text-[#8B949E] leading-relaxed whitespace-pre-wrap">
                        {notesValue}
                      </p>
                      <p className="text-[10px] text-[#484F58] mt-1 opacity-0 group-hover/notesblock:opacity-100 transition-opacity flex items-center gap-1">
                        <Pencil className="h-3 w-3" /> Click to edit
                      </p>
                    </div>
                  ) : (
                    <button onClick={() => setEditingNotes(true)}
                      className="w-full text-left rounded-lg border border-dashed border-[#21262D] hover:border-[#E8923A]/50 hover:bg-[#E8923A]/5 px-3 py-2.5 transition-colors">
                      <span className="text-sm text-[#484F58] hover:text-[#E8923A] flex items-center gap-1.5">
                        <Pencil className="h-3.5 w-3.5" /> Add session notes…
                      </span>
                    </button>
                  )}
                </div>

                {session.flies_notes && (
                  <div className="text-xs text-[#8B949E] bg-[#0D1117] rounded-lg px-3 py-2 border border-[#21262D] max-w-md">
                    <span className="font-medium text-[#8B949E]">Rig: </span>{session.flies_notes}
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tags.map(t => (
                      <span key={t} className="text-[11px] bg-[#E8923A]/8 text-[#E8923A] border border-[#E8923A]/15 rounded-full px-2.5 py-0.5">{t}</span>
                    ))}
                  </div>
                )}


              </div>

              {/* RIGHT: Strava-style big stats */}
              <div className="sm:w-72 flex-shrink-0">
                {/* Session map */}
                {session.latitude && session.longitude && (
                  <SessionMiniMap lat={session.latitude} lng={session.longitude} className="w-full aspect-square rounded-xl overflow-hidden mb-4" />
                )}

                {/* 4 big stats */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-[#E8923A] leading-none">{totalFish > 0 ? totalFish : "—"}</p>
                    <p className="text-xs text-[#484F58] mt-0.5 uppercase tracking-wide">Fish Caught</p>
                  </div>
                  {session.water_temp_f && (
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-[#E8923A] leading-none">{session.water_temp_f}</p>
                      <p className="text-xs text-[#484F58] mt-0.5 uppercase tracking-wide">Water Temp</p>
                    </div>
                  )}
                  {biggestFish > 0 && (
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-[#E8923A] leading-none">{biggestFish.toFixed(1)}&quot;</p>
                      <p className="text-xs text-[#484F58] mt-0.5 uppercase tracking-wide">Biggest Fish</p>
                    </div>
                  )}
                  {session.water_clarity && (
                    <div>
                      <p className="text-xl font-bold text-[#E8923A] leading-none">{session.water_clarity}</p>
                      <p className="text-xs text-[#484F58] mt-0.5 uppercase tracking-wide">Clarity</p>
                    </div>
                  )}
                </div>

                {/* Weather row — like Strava's weather section */}
                {session.weather && (
                  <div className="border-t border-[#21262D] pt-3 flex items-center gap-2 text-sm text-[#8B949E]">
                    <Cloud className="h-4 w-4 text-[#484F58] flex-shrink-0" />
                    <span>{session.weather}</span>
                  </div>
                )}

                {/* Flies used — compact */}
                {usedFlies.length > 0 && (
                  <div className="border-t border-[#21262D] pt-3 mt-3">
                    <p className="text-[11px] font-semibold text-[#484F58] uppercase tracking-wide mb-2">Flies Used</p>
                    <div className="flex flex-wrap gap-1.5">
                      {usedFlies.map(f => (
                        <span key={f.name} className="flex items-center gap-1 text-xs bg-[#E8923A]/10 text-[#E8923A] border border-[#E8923A]/20 rounded-full px-2.5 py-1">
                          🪰 {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gear row */}
                {(() => {
                  const snap = session.gear_snapshot || {};
                  const rod = session.gear_rod || snap.rod;
                  const reel = session.gear_reel || snap.reel;
                  const line = session.gear_line || snap.line;
                  const leader = session.gear_leader || snap.leader;
                  const tippet = session.gear_tippet || snap.tippet;
                  const gearParts = [
                    rod && `🎣 ${[rod.maker, rod.name].filter(Boolean).join(" ")}`,
                    reel && `🪝 ${[reel.maker, reel.name].filter(Boolean).join(" ")}`,
                    line && `〰️ ${[line.maker, line.name].filter(Boolean).join(" ")}`,
                    leader && `📏 Leader: ${leader.name}`,
                    tippet && `🧵 ${tippet.name}`,
                  ].filter(Boolean);
                  if (!gearParts.length) return null;
                  return (
                    <div className="border-t border-[#21262D] pt-3 mt-3">
                      <p className="text-[11px] font-semibold text-[#484F58] uppercase tracking-wide mb-2">Gear</p>
                      <p className="text-xs text-[#8B949E] leading-relaxed">{gearParts.join(" · ")}</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>



          {/* ---- COMBINED PHOTO GALLERY (fish + session) ---- */}
          {(fishPhotos.length > 0 || allSessionPhotos.length > 0) && (
            <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-4 mb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[#484F58] uppercase tracking-wide">
                  Photos ({fishPhotos.length + allSessionPhotos.length})
                </p>
              </div>

              {/* Fish Photos Strip */}
              {fishPhotos.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-semibold text-[#484F58] uppercase tracking-wide mb-2">Fish</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {fishPhotos.map((c, i) => {
                      const photoUrl = catchPhotos[c.id] || c.fish_image_url;
                      return (
                        <button key={c.id} onClick={() => setLightboxIdx(i)}
                          className="relative flex-shrink-0 h-32 w-32 rounded-lg overflow-hidden group hover:ring-2 hover:ring-[#E8923A] transition-all">
                          <Image src={photoUrl!} alt={c.species || "Fish"} fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                            <p className="text-white text-xs font-medium truncate">{c.species || "Fish"}</p>
                            {c.length_inches && <p className="text-white/70 text-[10px]">{c.length_inches}&quot;</p>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Session Photos Grid */}
              <div>
                {allSessionPhotos.length > 0 && (
                  <p className="text-[11px] font-semibold text-[#484F58] uppercase tracking-wide mb-2">Session</p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {allSessionPhotos.map((photo, i) => (
                    <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden">
                      <button onClick={() => setSessionPhotoLightboxIdx(i)} className="w-full h-full">
                        <Image src={photo.url} alt={photo.caption || "Session photo"} fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
                      </button>
                      <button
                        onClick={() => handleSessionPhotoDelete(photo.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {photo.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                          <p className="text-white text-xs truncate">{photo.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Photo Button */}
                <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#21262D] hover:border-[#E8923A]/50 hover:bg-[#E8923A]/5 px-4 py-3 cursor-pointer transition-colors">
                  {uploadingSessionPhoto ? (
                    <>
                      <Loader2 className="h-4 w-4 text-[#E8923A] animate-spin" />
                      <span className="text-sm text-[#8B949E]">Uploading…</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 text-[#484F58]" />
                      <span className="text-sm text-[#484F58] hover:text-[#E8923A] transition-colors">Add photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingSessionPhoto}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleSessionPhotoUpload(file);
                    }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* ---- RIVER STATS WIDGET ---- */}
          {session.river_name && (
            <div className="mb-5">
              <RiverStatsWidget riverName={session.river_name} />
            </div>
          )}

          {/* ---- DRIFT VIEW: count-only session (no detailed catches logged) ---- */}
          {isDriftMode && (
            <div className="bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden mb-5">
              <div className="px-4 py-3 border-b border-[#21262D] flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#F0F6FC]">Fish Caught</h2>
                <span className="text-xs text-[#484F58] bg-[#0D1117] rounded-full px-2 py-0.5">Drift mode</span>
              </div>
              <div className="p-6 flex flex-col items-center text-center gap-3">
                <div className="flex items-center gap-3">
                  <Fish className="h-8 w-8 text-[#E8923A]" />
                  <span className="text-5xl font-bold text-[#F0F6FC] font-['IBM_Plex_Mono']">{session.total_fish}</span>
                </div>
                <p className="text-sm text-[#8B949E]">
                  {session.total_fish === 1 ? "fish landed" : "fish landed"}
                </p>
                <p className="text-xs text-[#484F58] max-w-xs">
                  This session was logged in drift mode — total count only, no per-catch details.
                </p>
              </div>
            </div>
          )}

          {/* ---- CATCHES TABLE (like Strava Segments) ---- */}
          {catches.length > 0 && (
            <div className="bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden mb-5">
              <div className="px-4 py-3 border-b border-[#21262D] flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#F0F6FC]">Fish Caught</h2>
                <span className="text-xs text-[#484F58]">{totalFish} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#21262D]">
                      <th className="w-10 py-2 px-3"></th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#484F58] uppercase tracking-wide">Species</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#484F58] uppercase tracking-wide">Length</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#484F58] uppercase tracking-wide">Fly</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#484F58] uppercase tracking-wide">Position</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#484F58] uppercase tracking-wide">Size</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#484F58] uppercase tracking-wide">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catches.map((c) => {
                      const photoUrl = catchPhotos[c.id] || c.fish_image_url;
                      const isUploading = uploadingCatch === c.id;
                      return (
                        <tr key={c.id} className="border-b border-[#21262D] last:border-0 hover:bg-[#0D1117]/50 transition-colors">
                          <td className="py-2 px-3">
                            {photoUrl ? (
                              <div className="relative group/photo">
                                <button onClick={() => setLightboxIdx(fishPhotos.findIndex(p => p.id === c.id))} className="block">
                                  <div className="relative h-8 w-8 rounded overflow-hidden">
                                    <Image src={photoUrl} alt="" fill className="object-cover" />
                                  </div>
                                </button>
                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                                  <Camera className="h-3.5 w-3.5 text-white" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => {
                                      const file = e.target.files?.[0];
                                      if (file) handleCatchPhotoUpload(c.id, file);
                                    }}
                                  />
                                </label>
                              </div>
                            ) : (
                              <label className="h-8 w-8 rounded bg-[#1F2937] hover:bg-[#E8923A]/10 flex items-center justify-center cursor-pointer transition-colors group/upload">
                                {isUploading ? (
                                  <Loader2 className="h-4 w-4 text-[#E8923A] animate-spin" />
                                ) : (
                                  <Camera className="h-4 w-4 text-[#484F58] group-hover/upload:text-[#E8923A]" />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={isUploading}
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) handleCatchPhotoUpload(c.id, file);
                                  }}
                                />
                              </label>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-[#F0F6FC]">
                            {c.species || "—"}
                            {(c.quantities || 1) > 1 && <span className="ml-1 text-xs text-[#484F58]">×{c.quantities}</span>}
                          </td>
                          <td className="py-2.5 px-3 text-[#8B949E]">{c.length_inches ? `${c.length_inches}"` : "—"}</td>
                          <td className="py-2.5 px-3 text-[#8B949E] max-w-[120px] truncate">{c.fly_pattern?.name || "—"}</td>
                          <td className="py-2.5 px-3">
                            {c.fly_position ? (
                              <span className="text-xs bg-[#E8923A]/10 text-[#E8923A] rounded px-1.5 py-0.5 font-medium">{c.fly_position}</span>
                            ) : <span className="text-[#484F58]">—</span>}
                          </td>
                          <td className="py-2.5 px-3 text-[#8B949E] text-xs">{c.fly_size || "—"}</td>
                          <td className="py-2.5 px-3 text-[#8B949E] text-xs">{c.time_caught || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---- FLY PATTERNS (standalone, small cards) ---- */}
          {flies.length > 0 && (
            <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-4 mb-5">
              <h2 className="text-sm font-bold text-[#F0F6FC] mb-3">Fly Box</h2>
              <div className="flex flex-wrap gap-3">
                {flies.map(fly => (
                  <div key={fly.id} className="flex items-center gap-2 bg-[#0D1117] rounded-lg px-3 py-2 border border-[#21262D]">
                    {fly.image_url ? (
                      <div className="relative h-8 w-8 rounded overflow-hidden flex-shrink-0">
                        <Image src={fly.image_url} alt={fly.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <span className="text-base flex-shrink-0">🪰</span>
                    )}
                    <div>
                      <p className="text-xs font-medium text-[#F0F6FC]">{fly.name}</p>
                      {fly.type && <p className="text-[10px] text-[#484F58]">{fly.type}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
