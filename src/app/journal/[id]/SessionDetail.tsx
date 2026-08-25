"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Pencil, Fish, X, ChevronLeft, ChevronRight, Clock,
  MapPin, Check, RotateCcw, Camera, Loader2, Lock, Globe
} from "lucide-react";
import { KudosButton } from "@/components/social/KudosButton";
import { compressImage } from "@/lib/image-compress";
import ImageEditor, { validateImageFile } from "@/components/ui/ImageEditor";
import { CommentsSection } from "@/components/social/CommentsSection";
import { parseLocalDate, formatCatchTime } from "@/lib/date";
import LazyMapView from "@/components/maps/LazyMapView";
import HelpHint from "@/components/ui/HelpHint";
import FlyBoxAddButton from "@/components/flies/FlyBoxAddButton";
import { Button } from "@/components/ui/Button";

interface Catch {
  id: string;
  species?: string;
  length_inches?: string;
  quantities?: number;
  fly_position?: string;
  fly_size?: string;
  bead_size?: string;
  time_caught?: string;
  /** Legacy web column — a bare TIME value like "09:40". */
  time?: string;
  latitude?: number | null;
  longitude?: number | null;
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
  section?: string;
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
  broadcast_presence?: boolean;
  created_at?: string;
  latitude?: number;
  longitude?: number;
  route_points?: number[][];
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

interface OwnerProfile {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface Props {
  session: Session;
  catches: Catch[];
  flies: FlyPattern[];
  sessionPhotos?: SessionPhoto[];
  isOwner?: boolean;
  ownerProfile?: OwnerProfile | null;
  /**
   * True when no viewer is signed in. Strava parity: anonymous visitors
   * can view any public session (shareable URLs) but every mutation
   * surface — photo upload/delete, notes, memo, kudos, comment — routes
   * them to /login?redirect=/journal/<id>. Authenticated non-owners see
   * the same read-only layout minus the sign-in CTAs.
   */
  isAnonymous?: boolean;
  /** The day's flow trace, rendered on the server so its readings never
   *  enter the client bundle for a viewer who is not the owner. */
  flowTrace?: React.ReactNode;
  prevDay?: { id: string; date: string } | null;
  nextDay?: { id: string; date: string } | null;
}

function shortDay(date: string): string {
  return parseLocalDate(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-[var(--surface-raised)]/10 text-white hover:bg-[var(--surface-raised)]/20"><X className="h-5 w-5" /></button>
      {photos.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); goPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[var(--surface-raised)]/10 text-white hover:bg-[var(--surface-raised)]/20"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={e => { e.stopPropagation(); goNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[var(--surface-raised)]/10 text-white hover:bg-[var(--surface-raised)]/20"><ChevronRight className="h-5 w-5" /></button>
        </>
      )}
      <div className="max-w-2xl w-full mx-16" onClick={e => e.stopPropagation()}>
        {imageUrl ? (
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
            <Image src={imageUrl} alt={c.species || "Fish"} fill sizes="(max-width: 768px) 100vw, 672px" className="object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] rounded-xl bg-[var(--surface-card)] flex items-center justify-center">
            <Fish className="h-16 w-16 text-[var(--text-body)]" />
          </div>
        )}
        <div className="mt-4 text-center">
          <p className="text-white text-xl font-semibold">{c.species || "Unknown"}{c.length_inches ? ` · ${c.length_inches}"` : ""}</p>
          <div className="flex items-center justify-center gap-3 mt-1 text-sm text-white/60 flex-wrap">
            {c.fly_pattern?.name && <span>🪰 {c.fly_pattern.name}</span>}
            {c.fly_position && <span>· {c.fly_position}</span>}
            {c.fly_size && <span>· Size {c.fly_size}</span>}
            {c.bead_size && <span>· {c.bead_size} bead</span>}
            {c.time_caught && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatCatchTime(c.time_caught)}</span>}
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
  /**
   * Owner-only. When absent (non-owner viewing a public session) the
   * delete button is hidden — the lightbox becomes read-only.
   */
  onDelete?: (id: string) => void;
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
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-[var(--surface-raised)]/10 text-white hover:bg-[var(--surface-raised)]/20"><X className="h-5 w-5" /></button>
      {onDelete && (
        <div className="absolute top-4 right-16">
          <Button
            onClick={() => {
              onDelete(photo.id);
              if (photos.length === 1) onClose();
              else if (idx >= photos.length - 1) setIdx(0);
            }}
            variant="destructive"
            size="sm"
           
          >
            Delete
          </Button>
        </div>
      )}
      {photos.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); goPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[var(--surface-raised)]/10 text-white hover:bg-[var(--surface-raised)]/20"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={e => { e.stopPropagation(); goNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[var(--surface-raised)]/10 text-white hover:bg-[var(--surface-raised)]/20"><ChevronRight className="h-5 w-5" /></button>
        </>
      )}
      <div className="max-w-3xl w-full mx-16" onClick={e => e.stopPropagation()}>
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
          <Image src={photo.url} alt={photo.caption || "Session photo"} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
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

export default function SessionDetail({ session, catches, flies, sessionPhotos = [], isOwner = true, ownerProfile = null, isAnonymous = false, flowTrace = null, prevDay = null, nextDay = null }: Props) {
  // Login return path — anon viewers who tap any signed-in-only surface
  // (kudos CTA, comment CTA, follow button) come back to this session.
  const loginHref = `/login?redirect=/journal/${session.id}`;
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

  // Pending photo awaiting crop (catch or session). Stores raw blob URL +
  // a target tag describing what to do with the cropped Blob.
  const [pendingPhoto, setPendingPhoto] = useState<
    | { src: string; target: { kind: "catch"; catchId: string } | { kind: "session" } }
    | null
  >(null);

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

  function handleCatchPhotoUpload(catchId: string, file: File) {
    try {
      validateImageFile(file);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Invalid image");
      return;
    }
    setPendingPhoto({
      src: URL.createObjectURL(file),
      target: { kind: "catch", catchId },
    });
  }

  function handleSessionPhotoUpload(file: File) {
    try {
      validateImageFile(file);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Invalid image");
      return;
    }
    setPendingPhoto({
      src: URL.createObjectURL(file),
      target: { kind: "session" },
    });
  }

  async function uploadCroppedCatchPhoto(catchId: string, blob: Blob) {
    setUploadingCatch(catchId);
    try {
      const compressed = await compressImage(blob);
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

  async function uploadCroppedSessionPhoto(blob: Blob) {
    setUploadingSessionPhoto(true);
    try {
      const compressed = await compressImage(blob);
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

  function handleEditorApply(blob: Blob) {
    if (!pendingPhoto) return;
    const target = pendingPhoto.target;
    URL.revokeObjectURL(pendingPhoto.src);
    setPendingPhoto(null);
    if (target.kind === "catch") {
      void uploadCroppedCatchPhoto(target.catchId, blob);
    } else {
      void uploadCroppedSessionPhoto(blob);
    }
  }

  function handleEditorCancel() {
    if (pendingPhoto) URL.revokeObjectURL(pendingPhoto.src);
    setPendingPhoto(null);
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
  const formattedDate = parseLocalDate(session.date).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  // Unique flies used — prefer fly pattern image from flies prop, fall back to fly_image_url.
  // Includes the personal pattern id (when resolvable) so the chip can offer
  // an "Add to box" affordance via FlyBoxAddButton.
  const usedFlies = Array.from(
    new Map(
      catches.filter(c => c.fly_pattern?.name)
        .map(c => {
          const matchedPattern = flies.find(f => f.name === c.fly_pattern!.name!);
          return [
            c.fly_pattern!.name!,
            {
              name: c.fly_pattern!.name!,
              image: matchedPattern?.image_url || c.fly_image_url,
              patternId: matchedPattern?.id,
            },
          ];
        })
    ).values()
  );

  // The one photograph for the editorial header. A session photo the angler
  // framed deliberately wins over an incidental fish shot; either way it is
  // one image, and the rest stay reachable through the lightbox.
  const heroPhoto = allSessionPhotos[0]
    ? { url: allSessionPhotos[0].url, alt: allSessionPhotos[0].caption || "Session photograph", kind: "session" as const, index: 0 }
    : fishPhotoEntries[0]
      ? { url: fishPhotoEntries[0].url, alt: fishPhotoEntries[0].catchRef.species || "Fish", kind: "fish" as const, index: 0 }
      : null;

  const catchRows = catches.map((c) => ({
    ...c,
    clock: formatCatchTime(c.time_caught ?? c.time),
  }));

  const speciesTally = Array.from(
    catches.reduce((m, c) => {
      const k = c.species || "Unlogged";
      return m.set(k, (m.get(k) ?? 0) + (c.quantities || 1));
    }, new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]);

  const bestFish = catches.reduce<{ len: number; species?: string; fly?: string } | null>((best, c) => {
    const len = parseFloat(c.length_inches || "0");
    if (!len || (best && len <= best.len)) return best;
    return { len, species: c.species, fly: c.fly_pattern?.name };
  }, null);

  // Conditions as they were on the day. Water and weather readings are the
  // owner's record of the outing, so they sit behind isOwner alongside the
  // rest of the workbench.
  const conditions: { label: string; value: string }[] = [];
  if (session.weather_temp_f != null) conditions.push({ label: "Air", value: `${Math.round(session.weather_temp_f)}°F` });
  if (session.weather_feels_like_f != null) conditions.push({ label: "Feels like", value: `${Math.round(session.weather_feels_like_f)}°F` });
  // Structured sky reading when the client captured one, otherwise whatever
  // the angler typed — legacy sessions only ever carried the free-text field.
  const sky = session.weather_condition || session.weather;
  if (sky) conditions.push({ label: "Sky", value: sky });
  if (session.weather_wind_mph != null) {
    conditions.push({
      label: "Wind",
      value: `${Math.round(session.weather_wind_mph)} mph${session.weather_wind_dir ? ` ${session.weather_wind_dir}` : ""}`,
    });
  }
  if (session.weather_humidity != null) conditions.push({ label: "Humidity", value: `${session.weather_humidity}%` });
  if (session.weather_pressure_hpa != null) {
    conditions.push({ label: "Pressure", value: `${(session.weather_pressure_hpa / 33.8639).toFixed(2)} inHg` });
  }
  if (session.water_temp_f) conditions.push({ label: "Water", value: `${session.water_temp_f}°F` });
  if (session.water_clarity) conditions.push({ label: "Clarity", value: session.water_clarity });
  if (session.river_flow_cfs != null) conditions.push({ label: "Flow", value: `${Math.round(session.river_flow_cfs).toLocaleString()} cfs` });
  if (session.gage_height_ft != null) conditions.push({ label: "Gage", value: `${session.gage_height_ft.toFixed(2)} ft` });

  const gear = (() => {
    const snap = session.gear_snapshot || {};
    return [
      { label: "Rod", item: session.gear_rod || snap.rod },
      { label: "Reel", item: session.gear_reel || snap.reel },
      { label: "Line", item: session.gear_line || snap.line },
      { label: "Leader", item: session.gear_leader || snap.leader },
      { label: "Tippet", item: session.gear_tippet || snap.tippet },
    ].filter((g): g is { label: string; item: { name: string; maker?: string } } => !!g.item?.name);
  })();

  // Broadcast presence is the only sharing switch left after the 2026-05-04
  // privacy overhaul, and it shares river + section + weather only. The old
  // `privacy` column is gone, so social affordances key off this field —
  // never off an absent column, which used to read as "public".
  const isBroadcast = session.broadcast_presence === true;

  const headline = session.river_name || session.title || "A day on the water";
  const subhead = session.title && session.title !== headline ? session.title : null;
  const place = [session.location, session.section].filter(Boolean).join(" · ");

  const sectionLabel = "text-[11px] font-semibold uppercase tracking-wider text-[var(--text-meta)]";

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
          onDelete={isOwner ? handleSessionPhotoDelete : undefined}
        />
      )}

      <div className="min-h-screen bg-[var(--surface-page)]">
        {/* A trip log is a record of a day, not a home. Every route out of it
            goes back to the surfaces that own it — /journal and /today. */}
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-6 sm:px-6">
          <Link
            href="/journal"
            className="flex items-center gap-1.5 text-sm text-[var(--text-body)] transition-colors hover:text-[var(--action)]"
          >
            <ArrowLeft className="h-4 w-4" /> Journal
          </Link>
          <div className="flex items-center gap-3">
            {isOwner && notesSaved && (
              <span className="flex items-center gap-1 text-xs font-medium text-[var(--state-positive)]">
                <Check className="h-3.5 w-3.5" /> Saved
              </span>
            )}
            {isOwner && (
              <Button href={`/journal/${session.id}/edit`} variant="solid" size="md" icon={Pencil}>
                Edit Session
              </Button>
            )}
          </div>
        </div>

        {/* ─────────────── EDITORIAL HEADER ─────────────── */}
        <header className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6">
          <p className="num text-sm text-[var(--text-meta)]">{formattedDate}</p>
          <h1 className="font-heading mt-1 text-3xl leading-tight font-semibold text-[var(--text-primary)] sm:text-4xl">
            {headline}
          </h1>
          {subhead && <p className="mt-1 text-lg text-[var(--text-body)]">{subhead}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--text-meta)]">
            {place && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {place}
              </span>
            )}
            {isOwner && (
              <span className="flex items-center gap-1">
                {isBroadcast ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {isBroadcast ? "On the feed — river and weather only" : "Private to you"}
              </span>
            )}
            {!isOwner && ownerProfile && (ownerProfile.username || ownerProfile.display_name) && (
              <span>{ownerProfile.username ? `@${ownerProfile.username}` : ownerProfile.display_name}</span>
            )}
          </div>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-[var(--border-rule)] px-2.5 py-0.5 text-[11px] text-[var(--text-body)]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* One photograph. Not a strip, not a collage. */}
            <figure className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[var(--surface-raised)]">
              {heroPhoto ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      heroPhoto.kind === "session"
                        ? setSessionPhotoLightboxIdx(heroPhoto.index)
                        : setLightboxIdx(heroPhoto.index)
                    }
                    className="block h-full w-full"
                    aria-label="View photograph full size"
                  >
                    <Image
                      src={heroPhoto.url}
                      alt={heroPhoto.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 560px"
                      className="object-cover"
                    />
                  </button>
                  {fishPhotoEntries.length + allSessionPhotos.length > 1 && (
                    <figcaption className="pointer-events-none absolute bottom-2 left-2 rounded bg-[var(--surface-page)]/85 px-2 py-1 text-[11px] text-[var(--text-body)]">
                      {fishPhotoEntries.length + allSessionPhotos.length} photographs from this day
                    </figcaption>
                  )}
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 border border-dashed border-[var(--border-rule)] px-6 text-center">
                  <Camera className="h-5 w-5 text-[var(--text-meta)]" />
                  <p className="text-sm text-[var(--text-meta)]">No photograph from this day.</p>
                </div>
              )}
              {isOwner && (
                <label className="absolute right-2 top-2 flex cursor-pointer items-center gap-1.5 rounded bg-[var(--surface-page)]/90 px-2.5 py-1.5 text-xs text-[var(--text-body)] transition-colors hover:text-[var(--action)]">
                  {uploadingSessionPhoto ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                  {heroPhoto ? "Add" : "Add a photograph"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingSessionPhoto}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleSessionPhotoUpload(file);
                    }}
                  />
                </label>
              )}
            </figure>

            {/* The route, as a two-tone map: Vellum land, Teal water.
                Coordinates are owner-only per the privacy ethic. */}
            {isOwner && session.latitude != null && session.longitude != null ? (
              <div className="overflow-hidden rounded-lg">
                <LazyMapView
                  latitude={session.latitude}
                  longitude={session.longitude}
                  zoom={13}
                  tone="desk"
                  route={session.route_points || []}
                  markers={catches
                    .filter((c) => c.latitude != null && c.longitude != null)
                    .map((c) => ({
                      latitude: c.latitude as number,
                      longitude: c.longitude as number,
                      title: c.species || "Fish",
                      description: c.length_inches ? `${c.length_inches}"` : undefined,
                    }))}
                  className="aspect-[4/3] w-full"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border-rule)] bg-[var(--surface-raised)] px-6 text-center">
                <MapPin className="h-5 w-5 text-[var(--text-meta)]" />
                <p className="text-sm text-[var(--text-meta)]">No route recorded for this day.</p>
              </div>
            )}
          </div>
        </header>

        {/* ─────────────── THE WORKBENCH ───────────────
            The register turns here: editorial above the rule, instrument
            below it. */}
        <div className="border-t-2 border-[var(--border-strong)] bg-[var(--surface-raised)]">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <div className="min-w-0 space-y-8">
              {/* ── Catches ── */}
              <section>
                <div className="flex items-baseline justify-between border-b border-[var(--border-strong)] pb-2">
                  <h2 className={sectionLabel}>Catches</h2>
                  <span className="num text-xs text-[var(--text-meta)]">
                    {totalFish} {totalFish === 1 ? "fish" : "fish"}
                  </span>
                </div>

                {catchRows.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[38rem] text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border-rule)]">
                          <th className={`h-8 px-2 text-left font-semibold ${sectionLabel}`}>Time</th>
                          <th className={`h-8 px-2 text-left font-semibold ${sectionLabel}`}>Species</th>
                          <th className={`h-8 px-2 text-right font-semibold ${sectionLabel}`}>Length</th>
                          <th className={`h-8 px-2 text-left font-semibold ${sectionLabel}`}>Fly</th>
                          <th className={`h-8 px-2 text-left font-semibold ${sectionLabel}`}>Section</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catchRows.map((c) => {
                          const photoUrls =
                            catchPhotos[c.id] || c.fish_image_urls || (c.fish_image_url ? [c.fish_image_url] : []);
                          return (
                            <tr
                              key={c.id}
                              className="h-8 border-b border-[var(--border-rule)] last:border-0 even:bg-[var(--surface-page)]"
                            >
                              <td className="num h-8 whitespace-nowrap px-2 text-[var(--text-body)]">{c.clock}</td>
                              <td className="h-8 px-2 font-medium text-[var(--text-primary)]">
                                {photoUrls[0] ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setLightboxIdx(fishPhotoEntries.findIndex((p) => p.catchRef.id === c.id))
                                    }
                                    className="mr-2 inline-block h-5 w-5 overflow-hidden rounded align-middle"
                                    aria-label={`View photograph of ${c.species || "this fish"}`}
                                  >
                                    <Image
                                      src={photoUrls[0]}
                                      alt=""
                                      width={20}
                                      height={20}
                                      className="h-5 w-5 object-cover"
                                    />
                                  </button>
                                ) : isOwner ? (
                                  <label
                                    className="mr-2 inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded align-middle text-[var(--text-meta)] hover:text-[var(--action)]"
                                    title="Add a photograph of this fish"
                                  >
                                    {uploadingCatch === c.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Camera className="h-3.5 w-3.5" />
                                    )}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={uploadingCatch === c.id}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleCatchPhotoUpload(c.id, file);
                                      }}
                                    />
                                  </label>
                                ) : (
                                  <Fish className="mr-2 inline-block h-3.5 w-3.5 align-middle text-[var(--text-meta)]" />
                                )}
                                {c.species || "Unlogged"}
                                {(c.quantities || 1) > 1 && (
                                  <span className="num ml-1 text-xs text-[var(--text-meta)]">×{c.quantities}</span>
                                )}
                              </td>
                              <td className="num h-8 px-2 text-right text-[var(--text-body)]">
                                {c.length_inches ? `${c.length_inches}″` : "—"}
                              </td>
                              <td className="h-8 max-w-[12rem] truncate px-2 text-[var(--text-body)]">
                                {c.fly_pattern?.name || "—"}
                                {c.fly_size && <span className="num ml-1 text-[var(--text-meta)]">#{String(c.fly_size).replace(/^#/, "")}</span>}
                                {c.fly_position && (
                                  <span className="ml-1 text-xs text-[var(--text-meta)]">{c.fly_position}</span>
                                )}
                              </td>
                              <td className="h-8 px-2 text-[var(--text-body)]">{session.section || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : isDriftMode ? (
                  <div className="flex items-baseline gap-3 py-6">
                    <span className="num text-4xl font-semibold text-[var(--text-primary)]">{session.total_fish}</span>
                    <p className="text-sm text-[var(--text-body)]">
                      fish landed, counted rather than logged one by one. Edit the session to fill in species,
                      lengths and flies.
                    </p>
                  </div>
                ) : (
                  /* A day where nothing was caught is still a real day. */
                  <div className="py-8">
                    <p className="font-heading text-xl text-[var(--text-primary)]">No fish.</p>
                    <p className="mt-1 max-w-md text-sm text-[var(--text-body)]">
                      The day is still on the record. What the water was doing, what you fished and what you
                      noticed are below — that is the part worth keeping.
                    </p>
                    {isOwner && (
                      <Link
                        href={`/journal/${session.id}/edit`}
                        className="mt-3 inline-block text-sm text-[var(--action)] underline underline-offset-2"
                      >
                        Add a catch
                      </Link>
                    )}
                  </div>
                )}

                {usedFlies.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--border-rule)] pt-3">
                    <span className={sectionLabel}>Flies</span>
                    {/* Two multi-word patterns side by side read as one name
                        on whitespace alone — "Pheasant Tail Zebra Midge". */}
                    {usedFlies.map((f, i) => (
                      <span key={f.name} className="flex items-center gap-1.5 text-sm text-[var(--text-body)]">
                        {i > 0 && (
                          <span aria-hidden className="text-[var(--text-meta)]">·</span>
                        )}
                        {f.name}
                        {f.patternId && (
                          <FlyBoxAddButton fly={{ id: f.patternId, name: f.name, kind: "personal" }} variant="icon" />
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* ── Conditions ── */}
              {isOwner && (
                <section>
                  <h2 className={`${sectionLabel} block border-b border-[var(--border-strong)] pb-2`}>
                    Conditions that day
                  </h2>
                  {conditions.length > 0 ? (
                    <dl className="grid grid-cols-2 gap-x-6 sm:grid-cols-4">
                      {conditions.map((c) => (
                        <div key={c.label} className="flex h-8 items-baseline justify-between border-b border-[var(--border-rule)]">
                          <dt className="text-xs text-[var(--text-meta)]">{c.label}</dt>
                          <dd className="num text-sm text-[var(--text-primary)]">{c.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="py-3 text-sm text-[var(--text-meta)]">Nothing recorded.</p>
                  )}
                </section>
              )}

              {/* ── Gear ── */}
              {isOwner && (
                <section>
                  <h2 className={`${sectionLabel} block border-b border-[var(--border-strong)] pb-2`}>Gear used</h2>
                  {gear.length > 0 ? (
                    <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                      {gear.map((g) => (
                        <div key={g.label} className="flex h-8 items-baseline justify-between border-b border-[var(--border-rule)]">
                          <dt className="text-xs text-[var(--text-meta)]">{g.label}</dt>
                          <dd className="truncate pl-3 text-sm text-[var(--text-primary)]">
                            {g.item.maker ? `${g.item.maker} ${g.item.name}` : g.item.name}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="py-3 text-sm text-[var(--text-meta)]">Nothing recorded.</p>
                  )}
                  {session.flies_notes && (
                    <p className="mt-3 text-sm text-[var(--text-body)]">
                      <span className="text-[var(--text-meta)]">Rig</span> {session.flies_notes}
                    </p>
                  )}
                </section>
              )}

              {/* ── Notes ── */}
              <section>
                <h2 className={`${sectionLabel} block border-b border-[var(--border-strong)] pb-2`}>Notes</h2>
                <div className="pt-3">
                  {!isOwner ? (
                    notesValue ? (
                      <p className="max-w-2xl text-sm leading-relaxed whitespace-pre-wrap text-[var(--text-body)]">
                        {notesValue}
                      </p>
                    ) : (
                      <p className="text-sm text-[var(--text-meta)]">No notes.</p>
                    )
                  ) : editingNotes ? (
                    <div className="max-w-2xl">
                      <textarea
                        autoFocus
                        rows={5}
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setNotesValue(session.notes || "");
                            setEditingNotes(false);
                          }
                        }}
                        className="w-full resize-none rounded border border-[var(--action)] bg-[var(--surface-page)] px-3 py-2 text-sm leading-relaxed text-[var(--text-primary)] focus:outline-none"
                      />
                      <div className="mt-2 flex items-center gap-3">
                        <Button onClick={saveNotes} disabled={notesSaving} loading={notesSaving} variant="solid" size="sm">
                          {notesSaving ? "Saving…" : "Save"}
                        </Button>
                        <button
                          onClick={() => {
                            setNotesValue(session.notes || "");
                            setEditingNotes(false);
                          }}
                          className="flex items-center gap-1 text-xs text-[var(--text-meta)] hover:text-[var(--text-body)]"
                        >
                          <RotateCcw className="h-3 w-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingNotes(true)}
                      className="block max-w-2xl text-left"
                      title="Click to edit notes"
                    >
                      {notesValue ? (
                        <span className="block text-sm leading-relaxed whitespace-pre-wrap text-[var(--text-body)]">
                          {notesValue}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-sm text-[var(--text-meta)] hover:text-[var(--action)]">
                          <Pencil className="h-3.5 w-3.5" /> Write what the day was like
                        </span>
                      )}
                    </button>
                  )}
                </div>

                {isOwner && (
                  <div className="mt-5 border-t border-[var(--border-rule)] pt-3">
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <Lock className="h-3 w-3 text-[var(--text-meta)]" />
                      <span className={sectionLabel}>Private memo</span>
                      <HelpHint label="Private Memo vs Notes">
                        <p className="font-semibold text-[var(--text-primary)]">Only you see this.</p>
                        <p>
                          Notes are part of the session record. The memo is for yourself — what to try next, why a
                          rig didn&apos;t work.
                        </p>
                      </HelpHint>
                      {memoSaved && <span className="text-[10px] text-[var(--state-positive)]">Saved</span>}
                    </div>
                    {editingMemo ? (
                      <div className="max-w-2xl">
                        <textarea
                          autoFocus
                          rows={3}
                          value={memoValue}
                          onChange={(e) => setMemoValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setMemoValue(session.private_memo || "");
                              setEditingMemo(false);
                            }
                          }}
                          placeholder="Personal notes only you can see…"
                          className="w-full resize-none rounded border border-[var(--border-strong)] bg-[var(--surface-page)] px-3 py-2 text-sm leading-relaxed text-[var(--text-primary)] focus:outline-none"
                        />
                        <div className="mt-2 flex items-center gap-3">
                          <Button onClick={saveMemo} disabled={memoSaving} loading={memoSaving} variant="neutral" size="sm">
                            {memoSaving ? "Saving…" : "Save"}
                          </Button>
                          <button
                            onClick={() => {
                              setMemoValue(session.private_memo || "");
                              setEditingMemo(false);
                            }}
                            className="text-xs text-[var(--text-meta)] hover:text-[var(--text-body)]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingMemo(true)}
                        className="block max-w-2xl text-left text-sm text-[var(--text-meta)] hover:text-[var(--text-body)]"
                      >
                        {memoValue ? (
                          <span className="block leading-relaxed whitespace-pre-wrap italic">{memoValue}</span>
                        ) : (
                          <span className="flex items-center gap-1.5 italic">
                            <Pencil className="h-3.5 w-3.5" /> Add a private memo
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </section>

              {/* Kudos and comments belong to a session the angler chose to
                  broadcast. Everything else is private by default. */}
              {isBroadcast && (
                <div className="flex items-center gap-6 border-t border-[var(--border-rule)] pt-4">
                  <KudosButton sessionId={session.id} initialCount={0} loginHref={isAnonymous ? loginHref : undefined} />
                  <CommentsSection sessionId={session.id} initialCount={0} loginHref={isAnonymous ? loginHref : undefined} />
                </div>
              )}
            </div>

            {/* ─────────────── RIGHT RAIL ─────────────── */}
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div>
                <p className={sectionLabel}>Fish landed</p>
                <p className="num mt-1 text-4xl leading-none font-semibold text-[var(--text-primary)]">
                  {totalFish}
                </p>
                {speciesTally.length > 0 && (
                  <dl className="mt-3 space-y-1">
                    {speciesTally.map(([species, n]) => (
                      <div key={species} className="flex items-baseline justify-between gap-3">
                        <dt className="truncate text-sm text-[var(--text-body)]">{species}</dt>
                        <dd className="num text-sm text-[var(--text-primary)]">{n}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>

              <div className="border-t border-[var(--border-rule)] pt-4">
                <p className={sectionLabel}>Best fish</p>
                {bestFish ? (
                  <>
                    <p className="num mt-1 text-3xl leading-none font-semibold text-[var(--text-primary)]">
                      {bestFish.len.toFixed(1)}″
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-body)]">
                      {bestFish.species}
                      {bestFish.fly && <span className="text-[var(--text-meta)]"> · {bestFish.fly}</span>}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-[var(--text-meta)]">Nothing measured.</p>
                )}
              </div>

              {flowTrace && <div className="border-t border-[var(--border-rule)] pt-4">{flowTrace}</div>}

              {isOwner && (prevDay || nextDay) && (
                <nav className="border-t border-[var(--border-rule)] pt-4" aria-label="Neighbouring days">
                  <p className={sectionLabel}>Other days</p>
                  <div className="mt-2 space-y-1.5">
                    {prevDay && (
                      <Link
                        href={`/journal/${prevDay.id}`}
                        className="flex items-center gap-1.5 text-sm text-[var(--text-body)] transition-colors hover:text-[var(--action)]"
                      >
                        <ChevronLeft className="h-4 w-4 flex-shrink-0" />
                        <span className="num">{shortDay(prevDay.date)}</span>
                      </Link>
                    )}
                    {nextDay && (
                      <Link
                        href={`/journal/${nextDay.id}`}
                        className="flex items-center gap-1.5 text-sm text-[var(--text-body)] transition-colors hover:text-[var(--action)]"
                      >
                        <span className="num">{shortDay(nextDay.date)}</span>
                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                      </Link>
                    )}
                  </div>
                </nav>
              )}
            </aside>
          </div>
        </div>
      </div>

      <ImageEditor
        open={!!pendingPhoto}
        imageSrc={pendingPhoto?.src ?? ""}
        aspect="free"
        maxOutputPx={1600}
        title={pendingPhoto?.target.kind === "session" ? "Crop session photo" : "Crop fish photo"}
        onCancel={handleEditorCancel}
        onApply={handleEditorApply}
      />
    </>
  );
}
