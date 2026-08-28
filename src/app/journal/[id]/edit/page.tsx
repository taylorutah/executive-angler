"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, MapPin, X, Check, Fish, Feather, Camera, Lock } from "@/icons";
import GearPicker from "@/components/gear/GearPicker";
import FlyPicker from "@/components/flies/FlyPicker";
import SessionPrivacyToggle, { SessionPrivacy } from "@/components/journal/SessionPrivacyToggle";
import { compressImage } from "@/lib/image-compress";
import ImageEditor, { validateImageFile } from "@/components/ui/ImageEditor";
import dynamic from "next/dynamic";
import { COMMON_SPECIES } from "@/lib/species-suggestions";

const SessionLocationPicker = dynamic(
  () => import("@/components/maps/SessionLocationPicker"),
  { ssr: false }
);

interface Catch {
  id?: string;
  species: string;
  length_inches: string;
  quantities: number;
  fly_pattern_id?: string;
  canonical_fly_id?: string;
  /**
   * Phase A primary fly link — `user_fly_configurations.id`. The picker
   * resolves a (fly_id, size, bead) tuple to a configuration and emits its
   * id here so catches roll up by configuration for analytics.
   */
  configuration_id?: string;
  fly_name?: string;
  fly_position: string;
  fly_size: string;
  bead_size: string;
  time_caught: string;
  notes: string;
  fish_image_url?: string;
  fish_image_urls?: string[];
  pendingPhotos?: File[];
  removedPhotoUrls?: string[];
}

interface Spot { id: string; name: string; latitude?: number; longitude?: number; description?: string; }

const CLARITY = ["Crystal Clear", "Clear", "Slightly Cloudy", "Cloudy", "Murky"];
const POSITIONS = ["On Point", "Dropper", "Tag", "Single"];
const FLY_TYPES = ["Nymph", "Dry Fly", "Streamer", "Wet Fly", "Emerger", "Terrestrial", "Egg", "Other"];

const emptyCatch = (): Catch => ({
  species: "", length_inches: "", quantities: 1,
  fly_pattern_id: "",
  fly_position: "", fly_size: "", bead_size: "", time_caught: "", notes: "",
  fish_image_urls: [], pendingPhotos: [], removedPhotoUrls: [],
});

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [rivers, setRivers] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [flies, setFlies] = useState<{ id: string; name: string; isCanonical?: boolean; category?: string }[]>([]);
  const [catalogFlies, setCatalogFlies] = useState<{ id: string; name: string; category?: string }[]>([]);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [savingPhotos, setSavingPhotos] = useState(false);
  const [pendingCatchPhoto, setPendingCatchPhoto] = useState<
    { src: string; catchIdx: number } | null
  >(null);
  const [showSpotManager, setShowSpotManager] = useState(false);
  const [gearRodId, setGearRodId] = useState<string | null>(null);
  const [gearReelId, setGearReelId] = useState<string | null>(null);
  const [gearLineId, setGearLineId] = useState<string | null>(null);
  const [gearLeaderId, setGearLeaderId] = useState<string | null>(null);
  const [gearTippetId, setGearTippetId] = useState<string | null>(null);
  const [spotForm, setSpotForm] = useState({ name: "", latitude: "", longitude: "", description: "" });
  const [editingSpotId, setEditingSpotId] = useState<string | null>(null);
  const [spotSaving, setSpotSaving] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  // New Fly modal state
  const [showNewFly, setShowNewFly] = useState(false);
  const [newFlyCatchIdx, setNewFlyCatchIdx] = useState<number | null>(null);
  const [newFlyForm, setNewFlyForm] = useState({ name: "", type: "", size: "" });
  const [newFlySaving, setNewFlySaving] = useState(false);
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [riverOpen, setRiverOpen] = useState(false);
  const [riverFilter, setRiverFilter] = useState("");

  // Simple/Full toggle — persisted per-session in localStorage
  // Defaults to Simple if no catches exist (drift-mode session), Full otherwise
  const [isSimpleMode, setIsSimpleMode] = useState(true); // resolved after load
  const [simpleModeResolved, setSimpleModeResolved] = useState(false);

  function toggleSimpleMode() {
    const next = !isSimpleMode;
    setIsSimpleMode(next);
    try { localStorage.setItem(`ea-edit-mode-${id}`, next ? "simple" : "full"); } catch {}
  }

  const [form, setForm] = useState({
    title: "", date: "", river_name: "", location: "",
    water_temp_f: "", water_clarity: "", weather: "",
    flies_notes: "", notes: "", private_memo: "", trip_tags: "",
  });
  // Simple mode fish count (total_fish direct entry, for drift sessions)
  const [simpleFishCount, setSimpleFishCount] = useState<string>("");
  const [privacy, setPrivacy] = useState<SessionPrivacy>("public");

  async function loadSpots() {
    const res = await fetch("/api/fishing/spots");
    if (res.ok) setSpots(await res.json());
  }

  async function saveSpot() {
    setSpotSaving(true);
    const url = editingSpotId ? `/api/fishing/spots?id=${editingSpotId}` : "/api/fishing/spots";
    const method = editingSpotId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: spotForm.name,
        latitude: spotForm.latitude ? parseFloat(spotForm.latitude) : null,
        longitude: spotForm.longitude ? parseFloat(spotForm.longitude) : null,
        description: spotForm.description || null,
      }),
    });
    if (res.ok) {
      const saved = await res.json();
      await loadSpots();
      updateForm("location", saved.name);
      setShowSpotManager(false);
      setSpotForm({ name: "", latitude: "", longitude: "", description: "" });
      setEditingSpotId(null);
    }
    setSpotSaving(false);
  }

  async function deleteSpot(spotId: string) {
    if (!confirm("Remove this location?")) return;
    await fetch(`/api/fishing/spots?id=${spotId}`, { method: "DELETE" });
    await loadSpots();
  }

  async function saveNewFly() {
    if (!newFlyForm.name.trim()) return;
    setNewFlySaving(true);
    try {
      const res = await fetch("/api/fishing/flies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFlyForm.name.trim(),
          type: newFlyForm.type || undefined,
          size: newFlyForm.size || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create fly");
      }
      const created = await res.json();
      // Refresh fly list and auto-select the new fly on the target catch
      const fliesRes = await fetch("/api/fishing/flies?include_catalog=true");
      if (fliesRes.ok) {
        const fliesData = await fliesRes.json();
        if (fliesData.userFlies) {
          setFlies(fliesData.userFlies);
          setCatalogFlies(fliesData.catalogFlies || []);
        } else {
          setFlies(fliesData);
        }
      }
      if (newFlyCatchIdx !== null) {
        updateCatch(newFlyCatchIdx, "fly_pattern_id", created.id);
      }
      setShowNewFly(false);
      setNewFlyForm({ name: "", type: "", size: "" });
      setNewFlyCatchIdx(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create fly");
    } finally {
      setNewFlySaving(false);
    }
  }

  function startEditSpot(spot: Spot) {
    setEditingSpotId(spot.id);
    setSpotForm({
      name: spot.name,
      latitude: spot.latitude?.toString() || "",
      longitude: spot.longitude?.toString() || "",
      description: spot.description || "",
    });
    setShowSpotManager(true);
  }

  useEffect(() => {
    async function load() {
      const [sessionRes, riversRes, locsRes, spotsRes, fliesRes] = await Promise.all([
        fetch(`/api/fishing/session?id=${id}`, { cache: "no-store" }),
        fetch("/api/fishing/session?autocomplete=rivers"),
        fetch("/api/fishing/session?autocomplete=locations"),
        fetch("/api/fishing/spots"),
        fetch("/api/fishing/flies?include_catalog=true"),
      ]);

      if (sessionRes.ok) {
        const session = await sessionRes.json();
        setForm({
          title: session.title || "",
          date: session.date || "",
          river_name: session.river_name || "",
          location: session.location || "",
          water_temp_f: session.water_temp_f != null ? String(session.water_temp_f) : "",
          water_clarity: session.water_clarity || "",
          weather: session.weather || "",
          flies_notes: session.flies_notes || "",
          notes: session.notes || "",
          private_memo: session.private_memo || "",
          trip_tags: (session.trip_tags || session.tags || []).join(", "),
        });
        // privacy column dropped in phase 6 — read broadcast_presence instead.
        // Default to "private" (UI label "Keep Private") when neither is set.
        setPrivacy(session.broadcast_presence === true ? "public" : "private");
        const loadedCatches = (session.catches || []).map((c: any) => ({
            id: c.id,
            species: c.species || "",
            length_inches: c.length_inches ?? "",
            quantities: c.quantities ?? 1,
            fly_pattern_id: c.fly_pattern_id || null,
            canonical_fly_id: c.canonical_fly_id || null,
            configuration_id: c.configuration_id || null,
            fly_name: c.fly_name || null,
            fly_position: c.fly_position || "",
            fly_size: c.fly_size || "",
            bead_size: c.bead_size || "",
            time_caught: c.time_caught || "",
            notes: c.notes || "",
            fish_image_url: c.fish_image_url || undefined,
            fish_image_urls: c.fish_image_urls || (c.fish_image_url ? [c.fish_image_url] : []),
            pendingPhotos: [] as File[],
            removedPhotoUrls: [] as string[],
          }));
        setCatches(loadedCatches);

        // Resolve simple/full mode:
        // If catches exist in the DB → ALWAYS open in Full mode (data wins over localStorage).
        // This ensures drift-mode sessions edited into full mode stay in full mode.
        // Only fall back to localStorage/default when there are no catches.
        if (loadedCatches.length > 0) {
          setIsSimpleMode(false);
          try { localStorage.setItem(`ea-edit-mode-${id}`, "full"); } catch {}
        } else {
          try {
            const saved = localStorage.getItem(`ea-edit-mode-${id}`);
            if (saved === "simple" || saved === "full") {
              setIsSimpleMode(saved === "simple");
            } else {
              setIsSimpleMode(true);
            }
          } catch {
            setIsSimpleMode(true);
          }
        }
        setSimpleFishCount(session.total_fish != null ? String(session.total_fish) : "");
        setSimpleModeResolved(true);
        // Load gear
        if (session.gear_rod_id) setGearRodId(session.gear_rod_id);
        if (session.gear_reel_id) setGearReelId(session.gear_reel_id);
        if (session.gear_line_id) setGearLineId(session.gear_line_id);
        if (session.gear_leader_id) setGearLeaderId(session.gear_leader_id);
        if (session.gear_tippet_id) setGearTippetId(session.gear_tippet_id);
        // Load location
        if (session.lat != null) setLatitude(session.lat);
        else if (session.latitude != null) setLatitude(session.latitude);
        if (session.lng != null) setLongitude(session.lng);
        else if (session.longitude != null) setLongitude(session.longitude);
      }

      if (riversRes.ok) setRivers(await riversRes.json());
      if (locsRes.ok) setLocations(await locsRes.json());
      if (spotsRes.ok) setSpots(await spotsRes.json());
      if (fliesRes.ok) {
        const fliesData = await fliesRes.json();
        if (fliesData.userFlies) {
          setFlies(fliesData.userFlies);
          setCatalogFlies(fliesData.catalogFlies || []);
        } else {
          // Fallback for old response format
          setFlies(fliesData);
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }
  function updateCatch(i: number, field: string, value: string | number) {
    setCatches((prev) => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  }

  /**
   * Free-text size override. The picker's internal size step is the primary
   * path to setting both `fly_size` and `configuration_id`; this just lets
   * the user override the size string after the fact.
   */
  function onCatchSizeChange(catchIdx: number, newSize: string) {
    setCatches((prev) => prev.map((c, idx) => idx === catchIdx ? {
      ...c,
      fly_size: newSize,
    } : c));
  }

  function addCatchPhoto(catchIdx: number, file: File) {
    const c = catches[catchIdx];
    if (c) {
      const existing = (c.fish_image_urls || []).length;
      const pending = (c.pendingPhotos || []).length;
      if (existing + pending >= 3) { alert("Maximum 3 photos per catch"); return; }
    }
    try {
      validateImageFile(file);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Invalid image");
      return;
    }
    setPendingCatchPhoto({ src: URL.createObjectURL(file), catchIdx });
  }

  function handleCatchEditorApply(blob: Blob) {
    if (!pendingCatchPhoto) return;
    const { catchIdx, src } = pendingCatchPhoto;
    URL.revokeObjectURL(src);
    setPendingCatchPhoto(null);
    const cropped = new File([blob], "photo.jpg", { type: "image/jpeg" });
    setCatches(prev => prev.map((c, i) => {
      if (i !== catchIdx) return c;
      const existing = (c.fish_image_urls || []).length;
      const pending = (c.pendingPhotos || []).length;
      if (existing + pending >= 3) return c;
      return { ...c, pendingPhotos: [...(c.pendingPhotos || []), cropped] };
    }));
  }

  function handleCatchEditorCancel() {
    if (pendingCatchPhoto) URL.revokeObjectURL(pendingCatchPhoto.src);
    setPendingCatchPhoto(null);
  }

  function removeCatchPhoto(catchIdx: number, url: string) {
    setCatches(prev => prev.map((c, i) => {
      if (i !== catchIdx) return c;
      return {
        ...c,
        fish_image_urls: (c.fish_image_urls || []).filter(u => u !== url),
        removedPhotoUrls: [...(c.removedPhotoUrls || []), url],
      };
    }));
  }

  function removePendingPhoto(catchIdx: number, fileIdx: number) {
    setCatches(prev => prev.map((c, i) => {
      if (i !== catchIdx) return c;
      const pending = [...(c.pendingPhotos || [])];
      pending.splice(fileIdx, 1);
      return { ...c, pendingPhotos: pending };
    }));
  }

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      catches.forEach(c => {
        (c.pendingPhotos || []).forEach(f => {
          try { URL.revokeObjectURL(URL.createObjectURL(f)); } catch {}
        });
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { trip_tags: _tripTags, ...formFields } = form;

      // Build clean catch payloads — include ALL catches (even without species)
      // to prevent silent deletion of catches the user is still editing.
      // Only truly empty catches (no species, no length, no photos, no notes) are excluded.
      const validCatches = catches.filter((c) => c.species || c.id || c.length_inches || c.notes || (c.fish_image_urls || []).length > 0 || (c.pendingPhotos || []).length > 0);
      const catchPayloads = validCatches.map((c) => {
        // Compute final fish_image_urls: existing URLs minus any the user removed
        const currentUrls = (c.fish_image_urls || []).filter(
          (url: string) => !(c.removedPhotoUrls || []).includes(url)
        );
        return {
          id: c.id || undefined, // existing catches have an id; new ones don't
          species: c.species || null,
          length_inches: c.length_inches ?? null,
          quantities: c.quantities ?? 1,
          fly_pattern_id: c.fly_pattern_id && String(c.fly_pattern_id).trim() !== "" ? c.fly_pattern_id : null,
          canonical_fly_id: c.canonical_fly_id && String(c.canonical_fly_id).trim() !== "" ? c.canonical_fly_id : null,
          configuration_id: c.configuration_id && String(c.configuration_id).trim() !== "" ? c.configuration_id : null,
          fly_name: c.fly_name || null,
          fly_position: c.fly_position || null,
          fly_size: c.fly_size || null,
          bead_size: c.bead_size || null,
          time_caught: c.time_caught || null,
          notes: c.notes || null,
          fish_image_url: currentUrls[0] || null,
          fish_image_urls: currentUrls.length > 0 ? currentUrls : null,
        };
      });

      const res = await fetch(`/api/fishing/session?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formFields,
          privacy,
          tags: form.trip_tags ? form.trip_tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          ...(isSimpleMode
            ? { total_fish: simpleFishCount !== "" ? parseInt(simpleFishCount, 10) || 0 : null }
            : {
                catches: catchPayloads,
                total_fish: validCatches.reduce((sum, c) => sum + (c.quantities || 1), 0),
              }
          ),
          ...(isSimpleMode ? {} : {
            gear_rod_id: gearRodId || null,
            gear_reel_id: gearReelId || null,
            gear_line_id: gearLineId || null,
            gear_leader_id: gearLeaderId || null,
            gear_tippet_id: gearTippetId || null,
          }),
          latitude: latitude ?? null,
          longitude: longitude ?? null,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      const result = await res.json();
      const dbCatches: Array<Record<string, any>> = result.catches || [];

      // Match DB catches back to our local catches by id (existing) or by order (new inserts)
      // DB returns catches ordered by created_at, new inserts are at the end in insertion order
      const dbById = new Map(dbCatches.map((c) => [c.id, c]));
      // Separate: catches that had an id vs new ones
      const existingPayloads = catchPayloads.filter((c) => c.id);
      const newPayloads = catchPayloads.filter((c) => !c.id);
      // New DB catches = those whose id isn't in our existing payload ids
      const existingPayloadIds = new Set(existingPayloads.map((c) => c.id));
      const newDbCatches = dbCatches.filter((c) => !existingPayloadIds.has(c.id));

      // Upload pending photos now that we have DB IDs
      const hasPendingPhotos = validCatches.some(c => (c.pendingPhotos || []).length > 0);
      const photoUpdates: Array<{ catchId: string; urls: string[] }> = [];

      if (hasPendingPhotos) {
        setSavingPhotos(true);
        let newIdx = 0;
        for (let i = 0; i < validCatches.length; i++) {
          const catchData = validCatches[i];
          if (!(catchData.pendingPhotos || []).length) {
            if (!catchData.id) newIdx++;
            continue;
          }

          // Find the DB id for this catch
          let dbCatchId: string | null = null;
          if (catchData.id) {
            dbCatchId = catchData.id;
          } else {
            // Match to newly inserted DB catch by order
            if (newIdx < newDbCatches.length) {
              dbCatchId = newDbCatches[newIdx].id;
            }
            newIdx++;
          }

          if (!dbCatchId) continue;

          const uploadedUrls: string[] = [];
          for (const file of catchData.pendingPhotos!) {
            try {
              const compressed = await compressImage(file);
              const formData = new FormData();
              formData.append("file", new File([compressed], "photo.jpg", { type: "image/jpeg" }));
              formData.append("catchId", dbCatchId);
              const uploadRes = await fetch("/api/photos/catch", { method: "POST", body: formData });
              if (uploadRes.ok) {
                const { url } = await uploadRes.json();
                if (url) uploadedUrls.push(url);
              }
            } catch (e) {
              console.error("Photo upload error:", e);
            }
          }

          if (uploadedUrls.length > 0) {
            // Combine existing URLs with newly uploaded ones
            const dbCatch = dbById.get(dbCatchId);
            const existingUrls: string[] = dbCatch?.fish_image_urls || (dbCatch?.fish_image_url ? [dbCatch.fish_image_url] : []);
            const allUrls = [...existingUrls, ...uploadedUrls].slice(0, 3);
            photoUpdates.push({ catchId: dbCatchId, urls: allUrls });
          }
        }

        // Persist photo URL updates — pass through ALL DB fields, only override photos
        // This prevents the API from nulling out length, fly, notes, etc.
        if (photoUpdates.length > 0) {
          const photoRes = await fetch(`/api/fishing/session?id=${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              catches: dbCatches.map((c) => {
                const update = photoUpdates.find(p => p.catchId === c.id);
                return {
                  ...c, // pass ALL fields from DB catch (length, fly, notes, etc.)
                  fish_image_url: update ? (update.urls[0] || null) : (c.fish_image_url || null),
                  fish_image_urls: update ? update.urls : (c.fish_image_urls || null),
                };
              }),
            }),
          });
          if (!photoRes.ok) {
            console.error("[EDIT] Photo URL save failed:", await photoRes.text());
          }
        }
        setSavingPhotos(false);
      }

      // Persist edit mode
      try {
        const mode = isSimpleMode ? "simple" : "full";
        localStorage.setItem(`ea-edit-mode-${id}`, mode);
      } catch {}
      // Full page load to bypass Next.js router cache — ensures fresh data
      window.location.href = `/journal/${id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this session permanently? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/fishing/session?id=${id}`, { method: "DELETE" });
      if (res.ok) window.location.href = "/journal";
      else { setError("Failed to delete session"); }
    } catch {
      setError("Network error — check your connection and try again");
    } finally {
      setDeleting(false);
    }
  }

  const input = "ea-input";
  const label = "ea-label";
  const section = "ea-card mb-4";

  if (loading) return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-[var(--text-3)]">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
        <p className="text-sm">Loading session…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="mx-auto max-w-[var(--prose)] px-4 pt-6 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href={`/journal/${id}`} className="flex items-center gap-1.5 text-sm text-[var(--text-2)] hover:text-[var(--accent)] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="font-display text-xl font-semibold text-[var(--text-1)]">Edit Session</h1>
          {/* Simple / Full toggle */}
          {simpleModeResolved && (
            <div className="ea-segmented" role="group" aria-label="Edit mode">
              <button
                type="button"
                onClick={() => { if (!isSimpleMode) toggleSimpleMode(); }}
                className="ea-segment"
                aria-pressed={isSimpleMode}
              >
                Simple
              </button>
              <button
                type="button"
                onClick={() => { if (isSimpleMode) toggleSimpleMode(); }}
                className="ea-segment"
                aria-pressed={!isSimpleMode}
              >
                Full
              </button>
            </div>
          )}
        </div>

        {error && <div className="mb-4 rounded-[var(--radius-md)] bg-[var(--danger)]/10 border border-[var(--danger)]/40 px-4 py-3 text-[var(--danger)] text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-0">

          {/* Basic Info */}
          <div className={section}>
            <h2 className="ea-overline mb-4">Basic Info</h2>
            <div className="space-y-3">
              <div>
                <label className={label}>Session Title</label>
                <input className={input} placeholder="e.g. Sept 13 - Lower Provo" value={form.title} onChange={(e) => updateForm("title", e.target.value)} />
              </div>
              <div>
                <label className={label}>Date <span className="text-[var(--danger)]">*</span></label>
                <input type="date" required className={input} value={form.date} onChange={(e) => updateForm("date", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>River</label>
                  <div className="relative">
                    <input
                      className={input}
                      placeholder="Middle Provo River"
                      value={form.river_name}
                      onChange={(e) => { updateForm("river_name", e.target.value); setRiverFilter(e.target.value); setRiverOpen(true); }}
                      onFocus={() => setRiverOpen(true)}
                      onBlur={() => setTimeout(() => setRiverOpen(false), 150)}
                      autoComplete="off"
                    />
                    {riverOpen && rivers.filter(r => r.toLowerCase().includes(form.river_name.toLowerCase())).length > 0 && (
                      <ul className="absolute z-50 w-full mt-1 max-h-52 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-float)]">
                        {rivers
                          .filter(r => !form.river_name || r.toLowerCase().includes(form.river_name.toLowerCase()))
                          .slice(0, 20)
                          .map(r => (
                            <li
                              key={r}
                              onMouseDown={() => { updateForm("river_name", r); setRiverOpen(false); }}
                              className="px-4 py-2 text-[var(--text-1)] hover:bg-[var(--paper-deep)] cursor-pointer text-sm"
                            >
                              {r}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={label + " mb-0"}>Location</label>
                    <button type="button" onClick={() => { setEditingSpotId(null); setSpotForm({ name: form.location || "", latitude: "", longitude: "", description: "" }); setShowSpotManager(true); }}
                      className="text-xs text-[var(--accent)] font-semibold flex items-center gap-0.5 hover:text-[var(--accent-hover)]">
                      <MapPin className="h-3 w-3" /> Manage
                    </button>
                  </div>
                  <input ref={locationInputRef} list="locations-list" className={input} placeholder="Below Jordanelle" value={form.location} onChange={(e) => updateForm("location", e.target.value)} />
                  {form.location && (() => { const s = spots.find(sp => sp.name === form.location); return s?.latitude ? (
                    <p className="num text-xs text-[var(--text-3)] mt-1">{s.latitude.toFixed(5)}, {s.longitude?.toFixed(5)}</p>
                  ) : null; })()}
                  <datalist id="locations-list">
                    {spots.map(s => <option key={s.id} value={s.name} />)}
                    {locations.filter(l => !spots.find(s => s.name === l)).map((l) => <option key={l} value={l} />)}
                  </datalist>
                </div>
              </div>
            </div>
          </div>

          {/* Simple mode: fish count field */}
          {isSimpleMode && (
            <div className={section}>
              <h2 className="ea-overline mb-4 flex items-center gap-2">
                <Fish className="h-4 w-4 text-[var(--accent)]" /> Fish Count
              </h2>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  className={`${input} w-32 text-2xl font-semibold text-[var(--text-1)] num text-center`}
                  placeholder="0"
                  value={simpleFishCount}
                  onChange={(e) => setSimpleFishCount(e.target.value)}
                />
                <p className="text-xs text-[var(--text-3)]">Total fish for this session.<br />Switch to Full to log individual catches with species, size &amp; fly.</p>
              </div>
            </div>
          )}

          {/* Full mode: Conditions */}
          {!isSimpleMode && <div className={section}>
            <h2 className="ea-overline mb-4">Conditions</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={label}>Water Temp (°F)</label>
                <input type="number" step="0.1" className={input} placeholder="52" value={form.water_temp_f} onChange={(e) => updateForm("water_temp_f", e.target.value)} />
              </div>
              <div>
                <label className={label}>Clarity</label>
                <select className={input} value={form.water_clarity} onChange={(e) => updateForm("water_clarity", e.target.value)}>
                  <option value="">—</option>
                  {CLARITY.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Weather</label>
                <input className={input} placeholder="Sunny, 65°F" value={form.weather} onChange={(e) => updateForm("weather", e.target.value)} />
              </div>
            </div>
          </div>

          }

          {/* Full mode: Map Location */}
          {!isSimpleMode && <div className={section}>
            <h2 className="ea-overline mb-1 flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--accent)]" /> Map Location</h2>
            <p className="text-xs text-[var(--text-3)] mb-3">Click or drag pin to reposition</p>
            <SessionLocationPicker
              initialLat={latitude}
              initialLng={longitude}
              onChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
            />
          </div>}

          {/* Full mode: Fish Caught */}
          {!isSimpleMode && <div className={section}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="ea-overline flex items-center gap-2"><Fish className="h-4 w-4 text-[var(--accent)]" /> Fish Caught ({catches.filter(c => c.species).reduce((s, c) => s + (c.quantities || 1), 0)})</h2>
              <button type="button" onClick={() => setCatches((p) => [...p, emptyCatch()])}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]">
                <Plus className="h-3.5 w-3.5" /> Add Fish
              </button>
            </div>

            {catches.length === 0 ? (
              <button type="button" onClick={() => setCatches([emptyCatch()])}
                className="w-full rounded-[var(--radius-md)] border-2 border-dashed border-[var(--border-strong)] py-6 text-sm text-[var(--text-3)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
                + Log a fish
              </button>
            ) : (
              <div className="space-y-3">
                {catches.map((c, i) => (
                  <div key={i} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper-deep)] p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-[var(--text-2)]">Fish #{i + 1}</span>
                      <button type="button" onClick={() => setCatches((p) => p.filter((_, idx) => idx !== i))}
                        className="text-[var(--text-3)] hover:text-[var(--danger)] transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className={label}>Species</label>
                        <input list={`species-list-${i}`} className={input} placeholder="Brown Trout" value={c.species} onChange={(e) => updateCatch(i, "species", e.target.value)} />
                        <datalist id={`species-list-${i}`}>{COMMON_SPECIES.map((s) => <option key={s} value={s} />)}</datalist>
                      </div>
                      <div>
                        <label className={label}>Length (")</label>
                        <input type="number" step="0.1" min="0" className={input} placeholder="15" value={c.length_inches} onChange={(e) => updateCatch(i, "length_inches", e.target.value)} />
                      </div>
                      <div>
                        <label className={label}>Qty</label>
                        <input type="number" min={1} className={input} value={c.quantities} onChange={(e) => updateCatch(i, "quantities", parseInt(e.target.value) || 1)} />
                      </div>
                      <div className="col-span-2">
                        <label className={label}>Fly Pattern</label>
                        {c.configuration_id && !c.fly_pattern_id && !c.canonical_fly_id && c.fly_name && (
                          <p className="text-xs text-[var(--text-3)] mb-1">
                            Current: <span className="text-[var(--accent)]">{c.fly_name}</span> — pick a new fly to replace
                          </p>
                        )}
                        <FlyPicker
                          value={
                            c.fly_pattern_id
                              ? { source: "personal", id: c.fly_pattern_id, name: c.fly_name || flies.find((f) => f.id === c.fly_pattern_id)?.name || "Selected fly" }
                              : c.canonical_fly_id
                                ? { source: "canonical", id: c.canonical_fly_id, name: c.fly_name || catalogFlies.find((f) => f.id === c.canonical_fly_id)?.name || "Selected fly" }
                                : null
                          }
                          onChange={(sel) => {
                            if (!sel) {
                              updateCatch(i, "fly_pattern_id", "");
                              updateCatch(i, "canonical_fly_id", "");
                              updateCatch(i, "configuration_id", "");
                              updateCatch(i, "fly_name", "");
                              return;
                            }
                            // Identity columns — both still exist on `catches`
                            // for back-compat. New `flies` IDs work for either
                            // column since canonical_flies is now a view on flies.
                            if (sel.source === "personal") {
                              updateCatch(i, "fly_pattern_id", sel.id);
                              updateCatch(i, "canonical_fly_id", "");
                            } else {
                              updateCatch(i, "canonical_fly_id", sel.id);
                              updateCatch(i, "fly_pattern_id", "");
                            }
                            updateCatch(i, "fly_name", sel.name);
                            // Configuration resolved by the picker's size step.
                            // When a library fly is picked without a sized
                            // configuration, configuration_id stays empty;
                            // catches.fly_name + canonical_fly_id keep the
                            // identity until the user creates a configuration.
                            if (sel.variantId) {
                              updateCatch(i, "configuration_id", sel.variantId);
                              if (sel.size) updateCatch(i, "fly_size", sel.size);
                              if (sel.beadWeightMm != null) {
                                updateCatch(i, "bead_size", String(sel.beadWeightMm));
                              }
                            } else {
                              updateCatch(i, "configuration_id", "");
                            }
                          }}
                          placeholder="Search your flies and the library…"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewFlyCatchIdx(i);
                            setNewFlyForm({ name: "", type: "", size: "" });
                            setShowNewFly(true);
                          }}
                          className="mt-1 text-xs text-[var(--text-3)] hover:text-[var(--accent)]"
                        >
                          + Add a new pattern
                        </button>
                      </div>
                      <div>
                        <label className={label}>Position</label>
                        <select className={input} value={c.fly_position} onChange={(e) => updateCatch(i, "fly_position", e.target.value)}>
                          <option value="">—</option>
                          {POSITIONS.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={label}>Fly Size (#)</label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          className={input}
                          placeholder="14"
                          value={c.fly_size}
                          onChange={(e) => onCatchSizeChange(i, e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={label}>Time</label>
                        <input type="time" className={input} value={c.time_caught} onChange={(e) => updateCatch(i, "time_caught", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className={label}>Notes</label>
                        <input className={input} placeholder="What worked…" value={c.notes} onChange={(e) => updateCatch(i, "notes", e.target.value)} />
                      </div>
                      {/* Photo grid */}
                      <div className="col-span-3">
                        <label className={label}>Photos ({(c.fish_image_urls || []).length + (c.pendingPhotos || []).length}/3)</label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Existing uploaded photos */}
                          {(c.fish_image_urls || []).map((url, pi) => (
                            <div key={`existing-${pi}`} className="relative h-14 w-14 rounded-[var(--radius-md)] overflow-hidden flex-shrink-0 border border-[var(--border)] group">
                              <img src={url} alt="Fish" className="object-cover w-full h-full" />
                              <button
                                type="button"
                                onClick={() => removeCatchPhoto(i, url)}
                                className="absolute top-0 right-0 bg-[var(--ink)]/60 rounded-bl-[var(--radius-md)] p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3 text-[var(--paper)]" />
                              </button>
                            </div>
                          ))}
                          {/* Pending local photos */}
                          {(c.pendingPhotos || []).map((file, fi) => (
                            <div key={`pending-${fi}`} className="relative h-14 w-14 rounded-[var(--radius-md)] overflow-hidden flex-shrink-0 border border-[var(--accent)]/40 group">
                              <img src={URL.createObjectURL(file)} alt="Pending" className="object-cover w-full h-full" />
                              <button
                                type="button"
                                onClick={() => removePendingPhoto(i, fi)}
                                className="absolute top-0 right-0 bg-[var(--ink)]/60 rounded-bl-[var(--radius-md)] p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3 text-[var(--paper)]" />
                              </button>
                            </div>
                          ))}
                          {/* Add photo button */}
                          {(c.fish_image_urls || []).length + (c.pendingPhotos || []).length < 3 && (
                            <label className="h-14 w-14 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--border-strong)] hover:border-[var(--accent)] flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer">
                              <Camera className="h-5 w-5 text-[var(--text-3)] hover:text-[var(--accent)]" />
                              <input type="file" accept="image/*" className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) addCatchPhoto(i, f); e.target.value = ""; }} />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>}

          {/* Full mode: Gear, Flies, Tags */}
          {!isSimpleMode && <>
            <div className={section}>
              <h2 className="ea-overline mb-3">Gear</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GearPicker type="rod" label="Rod" value={gearRodId} onChange={setGearRodId} />
                <GearPicker type="reel" label="Reel" value={gearReelId} onChange={setGearReelId} />
                <GearPicker type="line" label="Line" value={gearLineId} onChange={setGearLineId} />
                <GearPicker type="leader" label="Leader" value={gearLeaderId} onChange={setGearLeaderId} />
                <GearPicker type="tippet" label="Tippet" value={gearTippetId} onChange={setGearTippetId} />
              </div>
            </div>

            <div className={section}>
              <h2 className="ea-overline mb-3 flex items-center gap-2"><Feather className="h-4 w-4 text-[var(--accent)]" /> Flies & Rig</h2>
              <textarea rows={3} className={input} placeholder="Perdigon size 16 with 2.8mm tungsten on point, Silver Bullet dropper. 5x tippet, 9ft 5wt…" value={form.flies_notes} onChange={(e) => updateForm("flies_notes", e.target.value)} />
            </div>

            <div className={section}>
              <h2 className="ea-overline mb-3">Tags</h2>
              <input className={input} placeholder="utah, provo, nymphing, spring runoff" value={form.trip_tags} onChange={(e) => updateForm("trip_tags", e.target.value)} />
              <p className="ea-field-helper">Separate tags with commas</p>
            </div>
          </>}

          {/* Notes — always visible */}
          <div className={section}>
            <h2 className="ea-overline mb-3">Session Notes</h2>
            <textarea rows={5} className={input} placeholder="How did the day go? What worked, what didn't, water conditions, hatch activity…" value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} />
          </div>

          {/* Privacy */}
          <div className={section}>
            <SessionPrivacyToggle value={privacy} onChange={setPrivacy} />
          </div>

          {/* Private Memo */}
          <div>
            <h2 className="ea-overline mb-3 flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Private Memo</h2>
            <textarea rows={3} className={input} placeholder="Personal notes only you can see — never shared on public sessions…" value={form.private_memo} onChange={(e) => updateForm("private_memo", e.target.value)} />
            <p className="ea-field-helper">Only visible to you, even on public sessions.</p>
          </div>

        </form>

        {/* Spot Manager Modal */}
        {showSpotManager && (
          <div className="fixed inset-0 z-[200] bg-[var(--ink)]/50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-[var(--surface)] rounded-[var(--radius-card)] w-full max-w-md shadow-[var(--shadow-float)]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <h3 className="font-display text-lg font-semibold text-[var(--text-1)]">{editingSpotId ? "Edit Spot" : "Add Location"}</h3>
                <button onClick={() => { setShowSpotManager(false); setEditingSpotId(null); }} aria-label="Close">
                  <X className="h-5 w-5 text-[var(--text-3)]" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className={label}>Location Name <span className="text-[var(--danger)]">*</span></label>
                  <input className={input} placeholder="Below Jordanelle" value={spotForm.name} onChange={e => setSpotForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={label}>Latitude</label>
                    <input className={input} placeholder="40.5732" type="number" step="any" value={spotForm.latitude} onChange={e => setSpotForm(p => ({ ...p, latitude: e.target.value }))} />
                  </div>
                  <div>
                    <label className={label}>Longitude</label>
                    <input className={input} placeholder="-111.4285" type="number" step="any" value={spotForm.longitude} onChange={e => setSpotForm(p => ({ ...p, longitude: e.target.value }))} />
                  </div>
                </div>
                <p className="text-xs text-[var(--text-3)]">Tip: long-press a spot in Google Maps → copy coordinates</p>
                <div>
                  <label className={label}>Notes (optional)</label>
                  <input className={input} placeholder="Public access, park at turnout" value={spotForm.description} onChange={e => setSpotForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <button onClick={saveSpot} disabled={!spotForm.name || spotSaving}
                  className="ea-btn ea-btn-primary w-full">
                  <Check className="h-4 w-4" /> {spotSaving ? "Saving…" : editingSpotId ? "Save Changes" : "Add Location"}
                </button>
              </div>
              {spots.length > 0 && (
                <div className="border-t border-[var(--border)] px-5 pb-5">
                  <p className="ea-overline pt-4 mb-2">Your Spots</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {spots.map(s => (
                      <div key={s.id} className="flex items-center justify-between rounded-[var(--radius-md)] px-2 py-1.5 hover:bg-[var(--paper-deep)] text-sm">
                        <div>
                          <button type="button" onClick={() => { updateForm("location", s.name); setShowSpotManager(false); }} className="font-medium text-[var(--text-1)] hover:text-[var(--accent)] text-left">{s.name}</button>
                          {s.latitude && <p className="num text-xs text-[var(--text-3)]">{s.latitude.toFixed(4)}, {s.longitude?.toFixed(4)}</p>}
                        </div>
                        <div className="flex items-center gap-3 ml-2">
                          <button type="button" onClick={() => startEditSpot(s)} className="text-xs text-[var(--text-3)] hover:text-[var(--accent)]">Edit</button>
                          <button type="button" onClick={() => deleteSpot(s.id)} className="text-xs text-[var(--danger)] hover:text-[var(--danger)]">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* New Fly Modal */}
        {showNewFly && (
          <div className="fixed inset-0 z-[200] bg-[var(--ink)]/50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-[var(--surface)] rounded-[var(--radius-card)] w-full max-w-md shadow-[var(--shadow-float)]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <h3 className="font-display text-lg font-semibold text-[var(--text-1)]">Add New Fly</h3>
                <button onClick={() => { setShowNewFly(false); setNewFlyCatchIdx(null); }} aria-label="Close">
                  <X className="h-5 w-5 text-[var(--text-3)]" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className={label}>Name <span className="text-[var(--danger)]">*</span></label>
                  <input
                    className={input}
                    placeholder="e.g. Perdigon, Pheasant Tail"
                    value={newFlyForm.name}
                    onChange={(e) => setNewFlyForm((p) => ({ ...p, name: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div>
                  <label className={label}>Type</label>
                  <select
                    className={input}
                    value={newFlyForm.type}
                    onChange={(e) => setNewFlyForm((p) => ({ ...p, type: e.target.value }))}
                  >
                    <option value="">— Select type —</option>
                    {FLY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Size</label>
                  <input
                    className={input}
                    placeholder="14, 16, 18"
                    value={newFlyForm.size}
                    onChange={(e) => setNewFlyForm((p) => ({ ...p, size: e.target.value }))}
                  />
                </div>
                <button
                  type="button"
                  onClick={saveNewFly}
                  disabled={!newFlyForm.name.trim() || newFlySaving}
                  className="ea-btn ea-btn-primary w-full"
                >
                  <Check className="h-4 w-4" /> {newFlySaving ? "Creating…" : "Create & Select"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sticky save bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border)] px-4 py-3 flex gap-3 z-50">
          <div className="mx-auto flex w-full max-w-[var(--prose)] gap-3">
            <button type="button" onClick={handleDelete} disabled={deleting} aria-label="Delete session"
              className="ea-btn ea-btn-secondary flex-shrink-0 px-3 text-[var(--danger)] hover:border-[var(--danger)]/50">
              {deleting ? "…" : <Trash2 className="h-4 w-4" />}
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="ea-btn ea-btn-primary flex-1">
              {savingPhotos ? "Saving photos…" : saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

      </div>

      <ImageEditor
        open={!!pendingCatchPhoto}
        imageSrc={pendingCatchPhoto?.src ?? ""}
        aspect="free"
        maxOutputPx={1600}
        title="Crop fish photo"
        onCancel={handleCatchEditorCancel}
        onApply={handleCatchEditorApply}
      />
    </div>
  );
}
