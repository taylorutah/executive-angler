"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, MapPin, X, Check, Fish, Feather, Camera } from "lucide-react";
import GearPicker from "@/components/gear/GearPicker";
import { compressImage } from "@/lib/image-compress";
import dynamic from "next/dynamic";

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
  fly_position: string;
  fly_size: string;
  bead_size: string;
  time_caught: string;
  notes: string;
  fish_image_url?: string;
}

interface Spot { id: string; name: string; latitude?: number; longitude?: number; description?: string; }

const SPECIES = ["Brown Trout", "Rainbow Trout", "Cutthroat Trout", "Brook Trout", "Mountain Whitefish", "Tiger Trout", "Bull Trout"];
const CLARITY = ["Crystal Clear", "Clear", "Slightly Cloudy", "Cloudy", "Murky"];
const POSITIONS = ["On Point", "Dropper", "Tag", "Single"];
const FLY_TYPES = ["Nymph", "Dry Fly", "Streamer", "Wet Fly", "Emerger", "Terrestrial", "Egg", "Other"];

const emptyCatch = (): Catch => ({
  species: "", length_inches: "", quantities: 1,
  fly_pattern_id: "",
  fly_position: "", fly_size: "", bead_size: "", time_caught: "", notes: "",
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
  const [flies, setFlies] = useState<{ id: string; name: string }[]>([]);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [uploadingCatchIdx, setUploadingCatchIdx] = useState<number | null>(null);
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
    flies_notes: "", notes: "", trip_tags: "",
  });
  // Simple mode fish count (total_fish direct entry, for drift sessions)
  const [simpleFishCount, setSimpleFishCount] = useState<string>("");

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
      const fliesRes = await fetch("/api/fishing/flies");
      if (fliesRes.ok) setFlies(await fliesRes.json());
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
        fetch(`/api/fishing/session?id=${id}`),
        fetch("/api/fishing/session?autocomplete=rivers"),
        fetch("/api/fishing/session?autocomplete=locations"),
        fetch("/api/fishing/spots"),
        fetch("/api/fishing/flies"),
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
          trip_tags: (session.trip_tags || session.tags || []).join(", "),
        });
        const loadedCatches = (session.catches || []).map((c: Catch) => ({
            id: (c as Catch & { id?: string }).id,
            species: c.species || "",
            length_inches: c.length_inches || "",
            quantities: c.quantities || 1,
            fly_pattern_id: (c as any).fly_pattern_id || null,
            fly_position: c.fly_position || "",
            fly_size: c.fly_size || "",
            bead_size: c.bead_size || "",
            time_caught: c.time_caught || "",
            notes: c.notes || "",
            fish_image_url: (c as any).fish_image_url || undefined,
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
      if (fliesRes.ok) setFlies(await fliesRes.json());
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

  async function handleCatchPhotoUpload(i: number, file: File) {
    const catchId = catches[i].id;
    if (!catchId) return;
    setUploadingCatchIdx(i);
    try {
      const compressed = await compressImage(file);
      const form = new FormData();
      form.append("file", new File([compressed], "photo.jpg", { type: "image/jpeg" }));
      form.append("catchId", catchId);
      const res = await fetch("/api/photos/catch", { method: "POST", body: form });
      if (res.ok) {
        const { url } = await res.json();
        setCatches((prev) => prev.map((c, idx) => idx === i ? { ...c, fish_image_url: url } : c));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Photo upload failed. Please try again.");
      }
    } catch (e) {
      console.error("Upload error:", e);
      const msg = e instanceof Error ? e.message : "Photo upload failed.";
      alert(msg);
    } finally {
      setUploadingCatchIdx(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { trip_tags: _tripTags, ...formFields } = form;
      const res = await fetch(`/api/fishing/session?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formFields,
          tags: form.trip_tags ? form.trip_tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          // In simple mode: save the fish count directly; don't overwrite catches
          // In full mode: recalculate total_fish from catch rows
          ...(isSimpleMode
            ? { total_fish: simpleFishCount !== "" ? parseInt(simpleFishCount, 10) || 0 : null }
            : {
                catches: catches.filter((c) => c.species).map((c) => ({
                  ...c,
                  fly_pattern_id: c.fly_pattern_id && String(c.fly_pattern_id).trim() !== "" ? c.fly_pattern_id : null,
                  length_inches: c.length_inches || null,
                })),
                total_fish: catches.filter((c) => c.species).reduce((sum, c) => sum + (c.quantities || 1), 0),
              }
          ),
          // Gear fields only sent in full mode (simple mode preserves existing gear)
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
      // Persist edit mode — if user saved in full mode with catches, lock to full going forward
      try {
        const mode = isSimpleMode ? "simple" : "full";
        localStorage.setItem(`ea-edit-mode-${id}`, mode);
      } catch {}
      router.push(`/journal/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this session permanently? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/fishing/session?id=${id}`, { method: "DELETE" });
    if (res.ok) router.push("/journal");
    else { setDeleting(false); setError("Failed to delete"); }
  }

  const input = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E8923A] focus:outline-none focus:ring-1 focus:ring-[#E8923A] dark:border-[#21262D] dark:bg-[#161B22] dark:text-[#F0F6FC] dark:placeholder:text-[#6E7681]";
  const label = "block text-xs font-semibold text-gray-500 dark:text-[#A8B2BD] uppercase tracking-wide mb-1";
  const section = "bg-white dark:bg-[#161B22] rounded-xl border border-gray-200 dark:border-[#21262D] p-5 mb-4";

  if (loading) return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-[#6E7681]">
        <div className="h-8 w-8 rounded-full border-2 border-[#21262D] border-t-forest animate-spin" />
        <p className="text-sm">Loading session…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-2xl px-4 pt-6 pb-32">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href={`/journal/${id}`} className="flex items-center gap-1.5 text-sm text-[#A8B2BD] hover:text-[#E8923A] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="font-heading text-xl font-bold text-[#F0F6FC]">Edit Session</h1>
          {/* Simple / Full toggle */}
          {simpleModeResolved && (
            <button
              type="button"
              onClick={toggleSimpleMode}
              className="flex items-center gap-1.5 rounded-full border border-[#21262D] bg-[#161B22] px-3 py-1.5 text-xs font-medium transition-colors hover:border-[#E8923A]/50"
            >
              <span className={isSimpleMode ? "text-[#E8923A]" : "text-[#A8B2BD]"}>Simple</span>
              <span className="text-[#21262D]">|</span>
              <span className={!isSimpleMode ? "text-[#E8923A]" : "text-[#A8B2BD]"}>Full</span>
            </button>
          )}
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-0">

          {/* Basic Info */}
          <div className={section}>
            <h2 className="text-sm font-bold text-[#A8B2BD] mb-4 flex items-center gap-2">📋 Basic Info</h2>
            <div className="space-y-3">
              <div>
                <label className={label}>Session Title</label>
                <input className={input} placeholder="e.g. Sept 13 - Lower Provo" value={form.title} onChange={(e) => updateForm("title", e.target.value)} />
              </div>
              <div>
                <label className={label}>Date <span className="text-red-400">*</span></label>
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
                      <ul className="absolute z-50 w-full mt-1 max-h-52 overflow-y-auto rounded-lg border border-[#21262D] bg-[#161B22] shadow-lg">
                        {rivers
                          .filter(r => !form.river_name || r.toLowerCase().includes(form.river_name.toLowerCase()))
                          .slice(0, 20)
                          .map(r => (
                            <li
                              key={r}
                              onMouseDown={() => { updateForm("river_name", r); setRiverOpen(false); }}
                              className="px-4 py-2 text-[#F0F6FC] hover:bg-[#21262D] cursor-pointer text-sm"
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
                      className="text-[10px] text-[#E8923A] font-semibold flex items-center gap-0.5 hover:text-[#E8923A]">
                      <MapPin className="h-3 w-3" /> Manage
                    </button>
                  </div>
                  <input ref={locationInputRef} list="locations-list" className={input} placeholder="Below Jordanelle" value={form.location} onChange={(e) => updateForm("location", e.target.value)} />
                  {form.location && (() => { const s = spots.find(sp => sp.name === form.location); return s?.latitude ? (
                    <p className="text-[10px] text-[#6E7681] mt-1">{s.latitude.toFixed(5)}, {s.longitude?.toFixed(5)}</p>
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
              <h2 className="text-sm font-bold text-[#A8B2BD] mb-4 flex items-center gap-2">
                <Fish className="h-4 w-4 text-[#E8923A]" /> Fish Count
              </h2>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  className={`${input} w-32 text-2xl font-bold text-[#F0F6FC] font-['IBM_Plex_Mono'] text-center`}
                  placeholder="0"
                  value={simpleFishCount}
                  onChange={(e) => setSimpleFishCount(e.target.value)}
                />
                <p className="text-xs text-[#6E7681]">Total fish for this session.<br />Switch to Full to log individual catches with species, size &amp; fly.</p>
              </div>
            </div>
          )}

          {/* Full mode: Conditions */}
          {!isSimpleMode && <div className={section}>
            <h2 className="text-sm font-bold text-[#A8B2BD] mb-4">🌊 Conditions</h2>
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
            <h2 className="text-sm font-bold text-[#A8B2BD] mb-1 flex items-center gap-2">📍 Map Location</h2>
            <p className="text-xs text-[#6E7681] mb-3">Click or drag pin to reposition</p>
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
              <h2 className="text-sm font-bold text-[#A8B2BD] flex items-center gap-2"><Fish className="h-4 w-4 text-[#E8923A]" /> Fish Caught ({catches.filter(c => c.species).reduce((s, c) => s + (c.quantities || 1), 0)})</h2>
              <button type="button" onClick={() => setCatches((p) => [...p, emptyCatch()])}
                className="flex items-center gap-1 text-xs font-semibold text-[#E8923A] hover:text-[#E8923A]">
                <Plus className="h-3.5 w-3.5" /> Add Fish
              </button>
            </div>

            {catches.length === 0 ? (
              <button type="button" onClick={() => setCatches([emptyCatch()])}
                className="w-full rounded-lg border-2 border-dashed border-[#21262D] py-6 text-sm text-[#6E7681] hover:border-[#E8923A]/40 hover:text-[#E8923A] transition-colors">
                + Log a fish
              </button>
            ) : (
              <div className="space-y-3">
                {catches.map((c, i) => (
                  <div key={i} className="rounded-lg border border-[#21262D] bg-[#0D1117]/50 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-[#A8B2BD]">Fish #{i + 1}</span>
                      <button type="button" onClick={() => setCatches((p) => p.filter((_, idx) => idx !== i))}
                        className="text-[#6E7681] hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className={label}>Species</label>
                        <input list={`species-list-${i}`} className={input} placeholder="Brown Trout" value={c.species} onChange={(e) => updateCatch(i, "species", e.target.value)} />
                        <datalist id={`species-list-${i}`}>{SPECIES.map((s) => <option key={s} value={s} />)}</datalist>
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
                        <select className={input} value={c.fly_pattern_id || ""} onChange={(e) => {
                          if (e.target.value === "__NEW__") {
                            setNewFlyCatchIdx(i);
                            setNewFlyForm({ name: "", type: "", size: "" });
                            setShowNewFly(true);
                            // Reset the select back so it doesn't stick on "__NEW__"
                            e.target.value = c.fly_pattern_id || "";
                          } else {
                            updateCatch(i, "fly_pattern_id", e.target.value);
                          }
                        }}>
                          <option value="">— Select fly —</option>
                          {flies.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                          <option value="__NEW__">+ Add New Fly</option>
                        </select>
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
                        <input type="number" step="1" min="1" className={input} placeholder="14" value={c.fly_size} onChange={(e) => updateCatch(i, "fly_size", e.target.value)} />
                      </div>
                      <div>
                        <label className={label}>Bead (mm)</label>
                        <input type="number" step="0.1" min="0" className={input} placeholder="2.5" value={c.bead_size} onChange={(e) => updateCatch(i, "bead_size", e.target.value)} />
                      </div>
                      <div>
                        <label className={label}>Time</label>
                        <input type="time" className={input} value={c.time_caught} onChange={(e) => updateCatch(i, "time_caught", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className={label}>Notes</label>
                        <input className={input} placeholder="What worked…" value={c.notes} onChange={(e) => updateCatch(i, "notes", e.target.value)} />
                      </div>
                      {/* Photo upload */}
                      <div className="col-span-3">
                        <label className={label}>Photo</label>
                        {c.id ? (
                          <label className="flex items-center gap-3 cursor-pointer group">
                            {uploadingCatchIdx === i ? (
                              <div className="h-14 w-14 rounded-lg bg-[#E8923A]/10 flex items-center justify-center flex-shrink-0">
                                <div className="h-4 w-4 border-2 border-[#E8923A]/40 border-t-[#E8923A] rounded-full animate-spin" />
                              </div>
                            ) : c.fish_image_url ? (
                              <div className="relative h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 border border-[#21262D]">
                                <img src={c.fish_image_url} alt="Fish" className="object-cover w-full h-full" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Camera className="h-4 w-4 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="h-14 w-14 rounded-lg border-2 border-dashed border-[#21262D] group-hover:border-[#E8923A]/50 flex items-center justify-center flex-shrink-0 transition-colors">
                                <Camera className="h-5 w-5 text-[#6E7681] group-hover:text-[#E8923A]" />
                              </div>
                            )}
                            <span className="text-xs text-[#6E7681] group-hover:text-[#E8923A] transition-colors">
                              {c.fish_image_url ? "Replace photo" : "Add fish photo"}
                            </span>
                            <input type="file" accept="image/*" className="hidden"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCatchPhotoUpload(i, f); }} />
                          </label>
                        ) : (
                          <p className="text-xs text-[#6E7681]">Save session first to add a photo</p>
                        )}
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
              <h2 className="text-sm font-bold text-[#A8B2BD] mb-3 flex items-center gap-2">🎣 Gear</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GearPicker type="rod" label="Rod" value={gearRodId} onChange={setGearRodId} />
                <GearPicker type="reel" label="Reel" value={gearReelId} onChange={setGearReelId} />
                <GearPicker type="line" label="Line" value={gearLineId} onChange={setGearLineId} />
                <GearPicker type="leader" label="Leader" value={gearLeaderId} onChange={setGearLeaderId} />
                <GearPicker type="tippet" label="Tippet" value={gearTippetId} onChange={setGearTippetId} />
              </div>
            </div>

            <div className={section}>
              <h2 className="text-sm font-bold text-[#A8B2BD] mb-3 flex items-center gap-2"><Feather className="h-4 w-4 text-amber-500" /> Flies & Rig</h2>
              <textarea rows={3} className={input} placeholder="Perdigon #16 with 2.8mm tungsten on point, Silver Bullet dropper. 5x tippet, 9ft 5wt…" value={form.flies_notes} onChange={(e) => updateForm("flies_notes", e.target.value)} />
            </div>

            <div className={section}>
              <h2 className="text-sm font-bold text-[#A8B2BD] mb-3">🏷 Tags</h2>
              <input className={input} placeholder="utah, provo, nymphing, spring runoff" value={form.trip_tags} onChange={(e) => updateForm("trip_tags", e.target.value)} />
              <p className="text-xs text-[#6E7681] mt-1.5">Separate tags with commas</p>
            </div>
          </>}

          {/* Notes — always visible */}
          <div className={section}>
            <h2 className="text-sm font-bold text-[#A8B2BD] mb-3">📝 Session Notes</h2>
            <textarea rows={5} className={input} placeholder="How did the day go? What worked, what didn't, water conditions, hatch activity…" value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} />
          </div>

        </form>

        {/* Spot Manager Modal */}
        {showSpotManager && (
          <div className="fixed inset-0 z-[200] bg-black/50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-[#161B22] rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262D]">
                <h3 className="font-bold text-[#F0F6FC]">{editingSpotId ? "Edit Spot" : "Add Location"}</h3>
                <button onClick={() => { setShowSpotManager(false); setEditingSpotId(null); }}>
                  <X className="h-5 w-5 text-[#6E7681]" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className={label}>Location Name <span className="text-red-400">*</span></label>
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
                <p className="text-xs text-[#6E7681]">Tip: long-press a spot in Google Maps → copy coordinates</p>
                <div>
                  <label className={label}>Notes (optional)</label>
                  <input className={input} placeholder="Public access, park at turnout" value={spotForm.description} onChange={e => setSpotForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <button onClick={saveSpot} disabled={!spotForm.name || spotSaving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E8923A] py-3 text-white font-semibold hover:bg-[#0D1117] disabled:opacity-50 transition-colors">
                  <Check className="h-4 w-4" /> {spotSaving ? "Saving…" : editingSpotId ? "Save Changes" : "Add Location"}
                </button>
              </div>
              {spots.length > 0 && (
                <div className="border-t border-[#21262D] px-5 pb-5">
                  <p className="text-xs font-semibold text-[#6E7681] uppercase tracking-wide pt-4 mb-2">Your Spots</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {spots.map(s => (
                      <div key={s.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-[#0D1117] text-sm">
                        <div>
                          <button type="button" onClick={() => { updateForm("location", s.name); setShowSpotManager(false); }} className="font-medium text-[#F0F6FC] hover:text-[#E8923A] text-left">{s.name}</button>
                          {s.latitude && <p className="text-xs text-[#6E7681]">{s.latitude.toFixed(4)}, {s.longitude?.toFixed(4)}</p>}
                        </div>
                        <div className="flex items-center gap-3 ml-2">
                          <button type="button" onClick={() => startEditSpot(s)} className="text-xs text-[#6E7681] hover:text-[#E8923A]">Edit</button>
                          <button type="button" onClick={() => deleteSpot(s.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
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
          <div className="fixed inset-0 z-[200] bg-black/50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-[#161B22] rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262D]">
                <h3 className="font-bold text-[#F0F6FC]">Add New Fly</h3>
                <button onClick={() => { setShowNewFly(false); setNewFlyCatchIdx(null); }}>
                  <X className="h-5 w-5 text-[#6E7681]" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className={label}>Name <span className="text-red-400">*</span></label>
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
                    placeholder="#14, #16, #18"
                    value={newFlyForm.size}
                    onChange={(e) => setNewFlyForm((p) => ({ ...p, size: e.target.value }))}
                  />
                </div>
                <button
                  type="button"
                  onClick={saveNewFly}
                  disabled={!newFlyForm.name.trim() || newFlySaving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E8923A] py-3 text-white font-semibold hover:bg-[#d4822f] disabled:opacity-50 transition-colors"
                >
                  <Check className="h-4 w-4" /> {newFlySaving ? "Creating…" : "Create & Select"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sticky save bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#161B22] border-t border-[#21262D] px-4 py-3 flex gap-3 z-50 shadow-lg">
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="flex items-center justify-center rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 flex-shrink-0">
            {deleting ? "…" : <Trash2 className="h-4 w-4" />}
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 rounded-xl bg-[#E8923A] py-3 text-white font-semibold text-sm hover:bg-[#d4822f] transition-colors disabled:opacity-60 shadow-sm">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}
