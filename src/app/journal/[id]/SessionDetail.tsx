"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Pencil, Fish, X, ChevronLeft, ChevronRight,
  Cloud, MapPin, Clock, Check, RotateCcw, Camera, Loader2, Lock
} from "lucide-react";
import { KudosButton } from "@/components/social/KudosButton";
import { compressImage } from "@/lib/image-compress";
import { CommentsSection } from "@/components/social/CommentsSection";
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
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#161B22;color:#A8B2BD;border-radius:0.75rem;font-size:0.875rem;">Map unavailable</div>';
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
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#161B22;color:#A8B2BD;border-radius:0.75rem;font-size:0.875rem;">Map unavailable</div>';
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
  fish_image_urls?: string[];
  fish_location_image_url?: string;
  fly_image_url?: string;
  fly_pattern?: { name?: string; type?: string } | null;
  weather_temp_f?: number | null;
  weather_condition?: string | null;
  weather_wind_mph?: number | null;
  weather_wind_dir?: string | null;
  weather_humidity?: number | null;
  weather_pressure_hpa?: number | null;
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
  weather_temp_f?: number | null;
  weather_feels_like_f?: number | null;
  weather_humidity?: number | null;
  weather_wind_mph?: number | null;
  weather_wind_dir?: string | null;
  weather_pressure_hpa?: number | null;
  weather_condition?: string | null;
  water_temp_f?: string;
  river_flow_cfs?: number | null;
  gage_height_ft?: number | null;
  water_clarity?: string;
  notes?: string;
  private_memo?: string;
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

interface FishPhotoEntry {
  catchRef: Catch;
  url: string;
}

function FishLightbox({ photos, initialIndex, onClose }: {
  photos: FishPhotoEntry[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const entry = photos[idx];
  const c = entry.catchRef;
  const imageUrl = entry.url;
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
      {photos.length > 1 && (
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
            <Fish className="h-16 w-16 text-[#A8B2BD]" />
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
        {photos.length > 1 && <p className="text-center text-white/30 text-xs mt-3">{idx + 1} / {photos.length}</p>}
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

  // Catch photo uploads — track all photos per catch (array)
  const [catchPhotos, setCatchPhotos] = useState<Record<string, string[]>>(() => {
    const m: Record<string, string[]> = {};
    catches.forEach(c => {
      const urls = c.fish_image_urls || (c.fish_image_url ? [c.fish_image_url] : []);
      if (urls.length > 0) m[c.id] = urls;
    });
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

  // Private memo (like Strava — only visible to session owner, never public)
  const [editingMemo, setEditingMemo] = useState(false);
  const [memoValue, setMemoValue] = useState(session.private_memo || "");
  const [memoSaving, setMemoSaving] = useState(false);
  const [memoSaved, setMemoSaved] = useState(false);

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

  async function saveMemo() {
    if (memoValue === session.private_memo) { setEditingMemo(false); return; }
    setMemoSaving(true);
    try {
      const res = await fetch(`/api/fishing/session?id=${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ private_memo: memoValue }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Memo save failed:", res.status, err);
        alert(`Save failed (${res.status}). Please try again.`);
        setMemoSaving(false);
        return;
      }
      setEditingMemo(false);
      setMemoSaved(true);
      setTimeout(() => setMemoSaved(false), 2000);
    } catch (e) {
      console.error("Memo save error:", e);
      alert("Save failed. Check your connection and try again.");
    } finally {
      setMemoSaving(false);
    }
  }

  async function handleCatchPhotoUpload(catchId: string, file: File) {
    setUploadingCatch(catchId);
    try {
      const compressed = await compressImage(file);
      const form = new FormData();
      form.append("file", new File([compressed], "photo.jpg", { type: "image/jpeg" }));
      form.append("catchId", catchId);
      const res = await fetch("/api/photos/catch", { method: "POST", body: form });
      if (res.ok) {
        const { url, urls } = await res.json();
        setCatchPhotos(prev => ({ ...prev, [catchId]: urls || [url] }));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Upload failed. Please try again.");
      }
    } catch (e) {
      console.error("Upload error:", e);
      const msg = e instanceof Error ? e.message : "Upload failed. Check your connection and try again.";
      alert(msg);
    } finally {
      setUploadingCatch(null);
    }
  }

  async function handleSessionPhotoUpload(file: File) {
    setUploadingSessionPhoto(true);
    try {
      const compressed = await compressImage(file);
      const form = new FormData();
      form.append("file", new File([compressed], "photo.jpg", { type: "image/jpeg" }));
      form.append("sessionId", session.id);
      const res = await fetch("/api/photos/session", { method: "POST", body: form });
      if (res.ok) {
        const photo = await res.json();
        setAllSessionPhotos(prev => [...prev, photo]);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Upload failed. Please try again.");
      }
    } catch (e) {
      console.error("Upload error:", e);
      const msg = e instanceof Error ? e.message : "Upload failed. Check your connection and try again.";
      alert(msg);
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
  // Build flat list of all catch photos (multiple per catch supported)
  const fishPhotoEntries: FishPhotoEntry[] = catches.flatMap(c => {
    const urls = catchPhotos[c.id] || c.fish_image_urls || (c.fish_image_url ? [c.fish_image_url] : []);
    return urls.map(url => ({ catchRef: c, url }));
  });
  // Catches that have at least one photo (for backwards-compat references)
  const catchesWithPhotos = catches.filter(c => (catchPhotos[c.id]?.length || 0) > 0 || c.fish_image_urls?.length || c.fish_image_url);

  const formattedDate = parseLocalDate(session.date).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const sessionStartTime = (() => {
    if (!session.created_at) return null;
    try {
      return new Date(session.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } catch { return null; }
  })();

  // Unique flies used — prefer fly pattern image from flies prop, fall back to fly_image_url
  const usedFlies = Array.from(
    new Map(
      catches.filter(c => c.fly_pattern?.name)
        .map(c => {
          const patternImage = flies.find(f => f.name === c.fly_pattern!.name!)?.image_url;
          return [c.fly_pattern!.name!, { name: c.fly_pattern!.name!, image: patternImage || c.fly_image_url }];
        })
    ).values()
  );

  const biggestFish = Math.round(catches.reduce((best, c) => {
    const len = parseFloat(c.length_inches || "0");
    return len > (best || 0) ? len : best;
  }, 0) * 10) / 10;

  return (
    <>
      {lightboxIdx !== null && (
        <FishLightbox photos={fishPhotoEntries} initialIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
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

        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 pb-6">

          {/* Breadcrumb + Edit */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/journal" className="flex items-center gap-1.5 text-sm text-[#A8B2BD] hover:text-[#E8923A] transition-colors">
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
                <p className="text-xs text-[#6E7681] mb-1">
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
                        className="w-full text-sm text-[#A8B2BD] leading-relaxed rounded-lg border border-[#E8923A]/40 bg-[#161B22] px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#E8923A]"
                      />
                      <div className="flex items-center gap-2 mt-1.5">
                        <button onClick={saveNotes} disabled={notesSaving}
                          className="flex items-center gap-1 text-xs font-semibold text-white bg-[#E8923A] rounded-lg px-3 py-1.5 hover:bg-[#0D1117] disabled:opacity-60">
                          <Check className="h-3 w-3" /> {notesSaving ? "Saving…" : "Save"}
                        </button>
                        <button onClick={() => { setNotesValue(session.notes || ""); setEditingNotes(false); }}
                          className="flex items-center gap-1 text-xs text-[#6E7681] hover:text-[#A8B2BD]">
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
                      <p className="text-sm text-[#A8B2BD] leading-relaxed whitespace-pre-wrap">
                        {notesValue}
                      </p>
                      <p className="text-[10px] text-[#6E7681] mt-1 opacity-0 group-hover/notesblock:opacity-100 transition-opacity flex items-center gap-1">
                        <Pencil className="h-3 w-3" /> Click to edit
                      </p>
                    </div>
                  ) : (
                    <button onClick={() => setEditingNotes(true)}
                      className="w-full text-left rounded-lg border border-dashed border-[#21262D] hover:border-[#E8923A]/50 hover:bg-[#E8923A]/5 px-3 py-2.5 transition-colors">
                      <span className="text-sm text-[#6E7681] hover:text-[#E8923A] flex items-center gap-1.5">
                        <Pencil className="h-3.5 w-3.5" /> Add session notes…
                      </span>
                    </button>
                  )}
                </div>

                {/* Private memo — only visible to owner */}
                <div className="mb-3 max-w-lg group/memo relative">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Lock className="h-3 w-3 text-[#6E7681]" />
                    <span className="text-[10px] text-[#6E7681] uppercase tracking-wide font-semibold">Private Memo</span>
                    {memoSaved && <span className="text-[10px] text-green-400 ml-1">Saved</span>}
                  </div>
                  {editingMemo ? (
                    <div>
                      <textarea
                        autoFocus
                        rows={3}
                        value={memoValue}
                        onChange={e => setMemoValue(e.target.value)}
                        onKeyDown={e => { if (e.key === "Escape") { setMemoValue(session.private_memo || ""); setEditingMemo(false); } }}
                        placeholder="Personal notes only you can see…"
                        className="w-full text-sm text-[#A8B2BD] leading-relaxed rounded-lg border border-[#6E7681]/40 bg-[#0D1117] px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#6E7681]"
                      />
                      <div className="flex items-center gap-2 mt-1.5">
                        <button onClick={saveMemo} disabled={memoSaving}
                          className="flex items-center gap-1 text-xs font-semibold text-white bg-[#6E7681] rounded-lg px-3 py-1.5 hover:bg-[#A8B2BD] disabled:opacity-60">
                          <Check className="h-3 w-3" /> {memoSaving ? "Saving…" : "Save"}
                        </button>
                        <button onClick={() => { setMemoValue(session.private_memo || ""); setEditingMemo(false); }}
                          className="flex items-center gap-1 text-xs text-[#6E7681] hover:text-[#A8B2BD]">
                          <RotateCcw className="h-3 w-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : memoValue ? (
                    <div
                      onClick={() => setEditingMemo(true)}
                      className="cursor-text rounded-lg border border-dashed border-[#6E7681]/20 hover:border-[#6E7681]/40 bg-[#0D1117] px-3 py-2 -mx-0 transition-colors group/memoblock"
                      title="Click to edit private memo"
                    >
                      <p className="text-sm text-[#6E7681] leading-relaxed whitespace-pre-wrap italic">
                        {memoValue}
                      </p>
                      <p className="text-[10px] text-[#6E7681] mt-1 opacity-0 group-hover/memoblock:opacity-100 transition-opacity flex items-center gap-1">
                        <Pencil className="h-3 w-3" /> Click to edit
                      </p>
                    </div>
                  ) : (
                    <button onClick={() => setEditingMemo(true)}
                      className="w-full text-left rounded-lg border border-dashed border-[#6E7681]/20 hover:border-[#6E7681]/40 hover:bg-[#0D1117] px-3 py-2 transition-colors">
                      <span className="text-sm text-[#6E7681] hover:text-[#A8B2BD] flex items-center gap-1.5 italic">
                        <Pencil className="h-3.5 w-3.5" /> Add private memo…
                      </span>
                    </button>
                  )}
                </div>

                {session.flies_notes && (
                  <div className="text-xs text-[#A8B2BD] bg-[#0D1117] rounded-lg px-3 py-2 border border-[#21262D] max-w-md">
                    <span className="font-medium text-[#A8B2BD]">Rig: </span>{session.flies_notes}
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tags.map(t => (
                      <span key={t} className="text-[11px] bg-[#E8923A]/8 text-[#E8923A] border border-[#E8923A]/15 rounded-full px-2.5 py-0.5">{t}</span>
                    ))}
                  </div>
                )}

                {/* ---- FLIES THAT WORKED — elevated for instant scanning ---- */}
                {usedFlies.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#21262D]">
                    <p className="text-[11px] font-semibold text-[#6E7681] uppercase tracking-wide mb-2">Flies That Worked</p>
                    <div className="flex flex-wrap gap-2">
                      {usedFlies.map(f => (
                        <div key={f.name} className="flex items-center gap-2 rounded-lg bg-[#0D1117] border border-[#E8923A]/20 px-3 py-2 hover:border-[#E8923A]/40 transition-colors">
                          {f.image ? (
                            <div className="relative h-9 w-9 rounded overflow-hidden flex-shrink-0">
                              <Image src={f.image} alt={f.name} fill className="object-cover" />
                            </div>
                          ) : (
                            <span className="text-lg flex-shrink-0">🪰</span>
                          )}
                          <span className="text-sm font-medium text-[#E8923A]">{f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ---- MOBILE-ONLY: Quick Stats Bar ---- */}
                <div className="sm:hidden mt-4 grid grid-cols-3 gap-2">
                  <div className="bg-[#0D1117] rounded-lg px-3 py-2.5 text-center border border-[#21262D]">
                    <p className="text-2xl font-bold text-[#E8923A] leading-none">{totalFish > 0 ? totalFish : "—"}</p>
                    <p className="text-[10px] text-[#6E7681] mt-1 uppercase tracking-wide">Fish</p>
                  </div>
                  {biggestFish > 0 && (
                    <div className="bg-[#0D1117] rounded-lg px-3 py-2.5 text-center border border-[#21262D]">
                      <p className="text-2xl font-bold text-[#E8923A] leading-none">{biggestFish.toFixed(1)}&quot;</p>
                      <p className="text-[10px] text-[#6E7681] mt-1 uppercase tracking-wide">Biggest</p>
                    </div>
                  )}
                  {session.water_clarity && (
                    <div className="bg-[#0D1117] rounded-lg px-3 py-2.5 text-center border border-[#21262D]">
                      <p className="text-lg font-bold text-[#E8923A] leading-none mt-0.5">{session.water_clarity}</p>
                      <p className="text-[10px] text-[#6E7681] mt-1 uppercase tracking-wide">Clarity</p>
                    </div>
                  )}
                </div>

                {/* ---- SOCIAL: Kudos & Comments (prominent, not buried) ---- */}
                <div className="mt-4 pt-4 border-t border-[#21262D]">
                  <div className="flex items-center gap-6">
                    <KudosButton sessionId={session.id} initialCount={0} />
                    <CommentsSection sessionId={session.id} initialCount={0} />
                  </div>
                </div>

                {/* Fish caught summary — compact cards under description */}
                {catches.filter(c => c.species).length > 0 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                    {catches.filter(c => c.species).map((c, i) => {
                      const photoUrls = catchPhotos[c.id] || c.fish_image_urls || (c.fish_image_url ? [c.fish_image_url] : []);
                      const photoUrl = photoUrls[0];
                      return (
                        <div key={i} className="flex items-center gap-2 rounded-lg bg-[#0D1117] border border-[#21262D] px-2.5 py-1.5 flex-shrink-0">
                          {photoUrl ? (
                            <button onClick={() => setLightboxIdx(fishPhotoEntries.findIndex(p => p.catchRef.id === c.id))}
                              className="relative h-8 w-8 rounded overflow-hidden flex-shrink-0">
                              <Image src={photoUrl} alt={c.species || "Fish"} fill className="object-cover" />
                            </button>
                          ) : (
                            <Fish className="h-4 w-4 text-[#E8923A] flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[#F0F6FC] leading-tight">{c.species || "Fish"}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-[#A8B2BD]">
                              {c.length_inches && <span>{c.length_inches}&quot;</span>}
                              {c.fly_pattern?.name && <><span>·</span><span className="truncate max-w-[80px]">{c.fly_pattern.name}</span></>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

              {/* RIGHT: Strava-style big stats (hidden on mobile — stats shown in left column) */}
              <div className="hidden sm:block sm:w-72 flex-shrink-0">
                {/* Session map */}
                {session.latitude && session.longitude && (
                  <SessionMiniMap lat={session.latitude} lng={session.longitude} className="w-full aspect-square rounded-xl overflow-hidden mb-4" />
                )}

                {/* 4 big stats */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-6 sm:gap-y-4 mb-4">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-[#E8923A] leading-none">{totalFish > 0 ? totalFish : "—"}</p>
                    <p className="text-xs text-[#6E7681] mt-0.5 uppercase tracking-wide">Fish Caught</p>
                  </div>
                  {session.water_temp_f && (
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-[#E8923A] leading-none">{session.water_temp_f}</p>
                      <p className="text-xs text-[#6E7681] mt-0.5 uppercase tracking-wide">Water Temp</p>
                    </div>
                  )}
                  {session.river_flow_cfs != null && (
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-[#E8923A] leading-none">{Math.round(session.river_flow_cfs).toLocaleString()}</p>
                      <p className="text-xs text-[#6E7681] mt-0.5 uppercase tracking-wide">Flow (cfs)</p>
                    </div>
                  )}
                  {session.gage_height_ft != null && (
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-[#E8923A] leading-none">{session.gage_height_ft.toFixed(2)}</p>
                      <p className="text-xs text-[#6E7681] mt-0.5 uppercase tracking-wide">Gage (ft)</p>
                    </div>
                  )}
                  {biggestFish > 0 && (
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-[#E8923A] leading-none">{biggestFish.toFixed(1)}&quot;</p>
                      <p className="text-xs text-[#6E7681] mt-0.5 uppercase tracking-wide">Biggest Fish</p>
                    </div>
                  )}
                  {session.water_clarity && (
                    <div>
                      <p className="text-xl font-bold text-[#E8923A] leading-none">{session.water_clarity}</p>
                      <p className="text-xs text-[#6E7681] mt-0.5 uppercase tracking-wide">Clarity</p>
                    </div>
                  )}
                </div>

                {/* Weather conditions */}
                {(session.weather_temp_f != null || session.weather != null) && (
                  <div className="border-t border-[#21262D] pt-3 space-y-2">
                    {session.weather_temp_f != null ? (
                      <>
                        {/* Air temp + condition */}
                        <div className="flex items-center gap-3 p-2.5 bg-[#0D1117] rounded-lg">
                          <Cloud className="h-4 w-4 text-[#E8923A] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#F0F6FC]">
                              {Math.round(session.weather_temp_f)}°F
                              {session.weather_feels_like_f != null && (
                                <span className="text-xs font-normal text-[#6E7681] ml-1.5">
                                  feels like {Math.round(session.weather_feels_like_f)}°F
                                </span>
                              )}
                            </p>
                            {session.weather_condition && (
                              <p className="text-xs text-[#A8B2BD]">{session.weather_condition}</p>
                            )}
                          </div>
                        </div>
                        {/* Wind + Humidity + Pressure */}
                        <div className="grid grid-cols-3 gap-2">
                          {session.weather_wind_mph != null && (
                            <div className="p-2 bg-[#0D1117] rounded-lg text-center">
                              <p className="text-xs text-[#6E7681] uppercase tracking-wide">Wind</p>
                              <p className="text-sm font-semibold text-[#F0F6FC]">{Math.round(session.weather_wind_mph)} <span className="text-xs font-normal text-[#6E7681]">mph</span></p>
                              {session.weather_wind_dir && <p className="text-xs text-[#A8B2BD]">{session.weather_wind_dir}</p>}
                            </div>
                          )}
                          {session.weather_humidity != null && (
                            <div className="p-2 bg-[#0D1117] rounded-lg text-center">
                              <p className="text-xs text-[#6E7681] uppercase tracking-wide">Humidity</p>
                              <p className="text-sm font-semibold text-[#F0F6FC]">{session.weather_humidity}<span className="text-xs font-normal text-[#6E7681]">%</span></p>
                            </div>
                          )}
                          {session.weather_pressure_hpa != null && (
                            <div className="p-2 bg-[#0D1117] rounded-lg text-center">
                              <p className="text-xs text-[#6E7681] uppercase tracking-wide">Pressure</p>
                              <p className="text-sm font-semibold text-[#F0F6FC]">{(session.weather_pressure_hpa / 33.8639).toFixed(2)}</p>
                              <p className="text-xs text-[#A8B2BD]">inHg</p>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      /* Legacy fallback — old sessions only have the string */
                      <div className="flex items-center gap-2 text-sm text-[#A8B2BD]">
                        <Cloud className="h-4 w-4 text-[#6E7681] flex-shrink-0" />
                        <span>{session.weather}</span>
                      </div>
                    )}
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
                      <p className="text-[11px] font-semibold text-[#6E7681] uppercase tracking-wide mb-2">Gear</p>
                      <p className="text-xs text-[#A8B2BD] leading-relaxed">{gearParts.join(" · ")}</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>



          {/* ---- COMBINED PHOTO GALLERY (fish + session) ---- */}
          <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-4 mb-5">
              {(fishPhotoEntries.length > 0 || allSessionPhotos.length > 0) && (
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[#6E7681] uppercase tracking-wide">
                  Photos ({fishPhotoEntries.length + allSessionPhotos.length})
                </p>
              </div>
              )}

              {/* Unified Photo Grid — fish + session photos together */}
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {fishPhotoEntries.map((entry, i) => {
                    const c = entry.catchRef;
                    return (
                      <div key={`fish-${c.id}-${i}`} className="relative group aspect-square rounded-lg overflow-hidden">
                        <button onClick={() => setLightboxIdx(i)} className="w-full h-full">
                          <Image src={entry.url} alt={c.species || "Fish"} fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
                        </button>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                          <p className="text-white text-xs font-medium truncate">{c.species || "Fish"}</p>
                          {c.length_inches && <p className="text-white/70 text-[10px]">{c.length_inches}&quot;</p>}
                        </div>
                      </div>
                    );
                  })}
                  {allSessionPhotos.map((photo, i) => (
                    <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden">
                      <button onClick={() => setSessionPhotoLightboxIdx(i)} className="w-full h-full">
                        <Image src={photo.url} alt={photo.caption || "Session photo"} fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
                      </button>
                      <button
                        onClick={() => handleSessionPhotoDelete(photo.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-600 transition-all"
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
                      <span className="text-sm text-[#A8B2BD]">Uploading…</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 text-[#6E7681]" />
                      <span className="text-sm text-[#6E7681] hover:text-[#E8923A] transition-colors">Add photo</span>
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

          {/* ---- MOBILE-ONLY: Map (compact, below photos) ---- */}
          {session.latitude && session.longitude && (
            <div className="sm:hidden mb-5">
              <SessionMiniMap lat={session.latitude} lng={session.longitude} className="w-full aspect-[2/1] rounded-xl overflow-hidden" />
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
                <span className="text-xs text-[#6E7681] bg-[#0D1117] rounded-full px-2 py-0.5">Drift mode</span>
              </div>
              <div className="p-6 flex flex-col items-center text-center gap-3">
                <div className="flex items-center gap-3">
                  <Fish className="h-8 w-8 text-[#E8923A]" />
                  <span className="text-5xl font-bold text-[#F0F6FC] font-['IBM_Plex_Mono']">{session.total_fish}</span>
                </div>
                <p className="text-sm text-[#A8B2BD]">
                  {session.total_fish === 1 ? "fish landed" : "fish landed"}
                </p>
                <p className="text-xs text-[#6E7681] max-w-xs">
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
                <span className="text-xs text-[#6E7681]">{totalFish} total</span>
              </div>
              {/* Mobile: Stacked catch cards */}
              <div className="sm:hidden divide-y divide-[#21262D]">
                {catches.map((c) => {
                  const photoUrls = catchPhotos[c.id] || c.fish_image_urls || (c.fish_image_url ? [c.fish_image_url] : []);
                  const photoUrl = photoUrls[0];
                  const isUploading = uploadingCatch === c.id;
                  return (
                    <div key={c.id} className="flex gap-3 px-4 py-3">
                      {/* Photo / upload */}
                      <div className="flex-shrink-0">
                        {photoUrl ? (
                          <button onClick={() => setLightboxIdx(fishPhotoEntries.findIndex(p => p.catchRef.id === c.id))} className="block">
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden">
                              <Image src={photoUrl} alt={c.species || "Catch photo"} fill className="object-cover" />
                            </div>
                          </button>
                        ) : (
                          <label className="h-12 w-12 rounded-lg bg-[#1F2937] hover:bg-[#E8923A]/10 flex items-center justify-center cursor-pointer transition-colors">
                            {isUploading ? (
                              <Loader2 className="h-4 w-4 text-[#E8923A] animate-spin" />
                            ) : (
                              <Camera className="h-4 w-4 text-[#6E7681]" />
                            )}
                            <input type="file" accept="image/*" className="hidden" disabled={isUploading}
                              onChange={e => { const file = e.target.files?.[0]; if (file) handleCatchPhotoUpload(c.id, file); }} />
                          </label>
                        )}
                      </div>
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                          <p className="font-medium text-[#F0F6FC] text-sm truncate">
                            {c.species || "—"}
                            {(c.quantities || 1) > 1 && <span className="ml-1 text-xs text-[#6E7681]">×{c.quantities}</span>}
                          </p>
                          {c.length_inches && <span className="text-sm font-mono text-[#E8923A] ml-2 flex-shrink-0">{c.length_inches}&quot;</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-[#A8B2BD]">
                          {c.fly_pattern?.name && <span className="truncate">{c.fly_pattern.name}</span>}
                          {c.fly_position && (
                            <span className="bg-[#E8923A]/10 text-[#E8923A] rounded px-1.5 py-0.5 font-medium flex-shrink-0">{c.fly_position}</span>
                          )}
                          {c.fly_size && <span className="flex-shrink-0">#{c.fly_size}</span>}
                          {c.time_caught && <span className="flex-shrink-0 text-[#6E7681]">{c.time_caught}</span>}
                        </div>
                        {(c.weather_temp_f != null || c.weather_condition || c.weather_humidity != null || c.weather_pressure_hpa != null) && (
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1 text-[10px] text-[#6E7681]">
                            {c.weather_temp_f != null && <span>{Math.round(c.weather_temp_f)}°F</span>}
                            {c.weather_condition && <span>· {c.weather_condition}</span>}
                            {c.weather_wind_mph != null && (
                              <span>· {Math.round(c.weather_wind_mph)}mph{c.weather_wind_dir ? ` ${c.weather_wind_dir}` : ''}</span>
                            )}
                            {c.weather_humidity != null && <span>· {c.weather_humidity}% RH</span>}
                            {c.weather_pressure_hpa != null && <span>· {(c.weather_pressure_hpa / 33.8639).toFixed(2)} inHg</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: Full table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#21262D]">
                      <th className="w-10 py-2 px-3"></th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#6E7681] uppercase tracking-wide">Species</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#6E7681] uppercase tracking-wide">Length</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#6E7681] uppercase tracking-wide">Fly</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#6E7681] uppercase tracking-wide">Position</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#6E7681] uppercase tracking-wide">Size</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#6E7681] uppercase tracking-wide">Time</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#6E7681] uppercase tracking-wide">Weather</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catches.map((c) => {
                      const photoUrls = catchPhotos[c.id] || c.fish_image_urls || (c.fish_image_url ? [c.fish_image_url] : []);
                      const photoUrl = photoUrls[0];
                      const isUploading = uploadingCatch === c.id;
                      return (
                        <tr key={c.id} className="border-b border-[#21262D] last:border-0 hover:bg-[#0D1117]/50 transition-colors">
                          <td className="py-2 px-3">
                            {photoUrl ? (
                              <div className="relative group/photo">
                                <button onClick={() => setLightboxIdx(fishPhotoEntries.findIndex(p => p.catchRef.id === c.id))} className="block">
                                  <div className="relative h-8 w-8 rounded overflow-hidden">
                                    <Image src={photoUrl} alt={c.species || "Catch photo"} fill className="object-cover" />
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
                                  <Camera className="h-4 w-4 text-[#6E7681] group-hover/upload:text-[#E8923A]" />
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
                            {(c.quantities || 1) > 1 && <span className="ml-1 text-xs text-[#6E7681]">×{c.quantities}</span>}
                          </td>
                          <td className="py-2.5 px-3 text-[#A8B2BD]">{c.length_inches ? `${c.length_inches}"` : "—"}</td>
                          <td className="py-2.5 px-3 text-[#A8B2BD] max-w-[120px] truncate">{c.fly_pattern?.name || "—"}</td>
                          <td className="py-2.5 px-3">
                            {c.fly_position ? (
                              <span className="text-xs bg-[#E8923A]/10 text-[#E8923A] rounded px-1.5 py-0.5 font-medium">{c.fly_position}</span>
                            ) : <span className="text-[#6E7681]">—</span>}
                          </td>
                          <td className="py-2.5 px-3 text-[#A8B2BD] text-xs">{c.fly_size || "—"}</td>
                          <td className="py-2.5 px-3 text-[#A8B2BD] text-xs">{c.time_caught || "—"}</td>
                          <td className="py-2.5 px-3 text-xs text-[#6E7681]">
                            {(c.weather_temp_f != null || c.weather_humidity != null || c.weather_pressure_hpa != null) ? (
                              <div className="space-y-0.5">
                                <div>
                                  {c.weather_temp_f != null && <span className="text-[#A8B2BD]">{Math.round(c.weather_temp_f)}°F</span>}
                                  {c.weather_condition && <span className="ml-1">{c.weather_condition}</span>}
                                  {c.weather_wind_mph != null && (
                                    <span className="ml-1">{Math.round(c.weather_wind_mph)}mph{c.weather_wind_dir ? ` ${c.weather_wind_dir}` : ''}</span>
                                  )}
                                </div>
                                {(c.weather_humidity != null || c.weather_pressure_hpa != null) && (
                                  <div className="text-[10px]">
                                    {c.weather_humidity != null && <span>{c.weather_humidity}% RH</span>}
                                    {c.weather_humidity != null && c.weather_pressure_hpa != null && <span className="mx-1">·</span>}
                                    {c.weather_pressure_hpa != null && <span>{(c.weather_pressure_hpa / 33.8639).toFixed(2)} inHg</span>}
                                  </div>
                                )}
                              </div>
                            ) : "—"}
                          </td>
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
                      {fly.type && <p className="text-[10px] text-[#6E7681]">{fly.type}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social bar is now in the header card left column */}
        </div>
      </div>
    </>
  );
}
