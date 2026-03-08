"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, MapPin, X, Check } from "lucide-react";

interface Catch {
  id?: string;
  species: string;
  length_inches: string;
  quantities: number;
  fly_position: string;
  fly_size: string;
  bead_size: string;
  time_caught: string;
}

const emptyCatch = (): Catch => ({
  species: "", length_inches: "", quantities: 1,
  fly_position: "", fly_size: "", bead_size: "", time_caught: "",
});

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  interface Spot { id: string; name: string; latitude?: number; longitude?: number; description?: string; river_id?: string; }

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [rivers, setRivers] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [catches, setCatches] = useState<Catch[]>([]);
  // Location spot management
  const [showSpotManager, setShowSpotManager] = useState(false);
  const [spotForm, setSpotForm] = useState({ name: "", latitude: "", longitude: "", description: "" });
  const [editingSpotId, setEditingSpotId] = useState<string | null>(null);
  const [spotSaving, setSpotSaving] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "", date: "", river_name: "", location: "",
    water_temp_f: "", water_clarity: "", weather: "",
    flies_notes: "", notes: "", trip_tags: "",
  });

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
      const [sessionRes, riversRes, locsRes, spotsRes] = await Promise.all([
        fetch(`/api/fishing/session`),
        fetch("/api/fishing/session?autocomplete=rivers"),
        fetch("/api/fishing/session?autocomplete=locations"),
        fetch("/api/fishing/spots"),
      ]);
      const sessions = await sessionRes.json();
      const session = sessions.find((s: { id: string }) => s.id === id);
      if (session) {
        setForm({
          title: session.title || "",
          date: session.date || "",
          river_name: session.river_name || "",
          location: session.location || "",
          water_temp_f: session.water_temp_f || "",
          water_clarity: session.water_clarity || "",
          weather: session.weather || "",
          flies_notes: session.flies_notes || "",
          notes: session.notes || "",
          trip_tags: (session.trip_tags || []).join(", "),
        });
        setCatches(
          (session.catches || []).map((c: Catch) => ({
            id: c.id,
            species: c.species || "",
            length_inches: c.length_inches || "",
            quantities: c.quantities || 1,
            fly_position: c.fly_position || "",
            fly_size: c.fly_size || "",
            bead_size: c.bead_size || "",
            time_caught: c.time_caught || "",
          }))
        );
      }
      setRivers(await riversRes.json());
      setLocations(await locsRes.json());
      if (spotsRes.ok) setSpots(await spotsRes.json());
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/fishing/session?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          trip_tags: form.trip_tags ? form.trip_tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          catches: catches.filter((c) => c.species),
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      router.push(`/journal/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/fishing/session?id=${id}`, { method: "DELETE" });
    if (res.ok) router.push("/journal");
    else { setDeleting(false); setError("Failed to delete"); }
  }

  const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1";

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <p className="text-slate-500">Loading…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-24">
        <Link href={`/journal/${id}`} className="inline-flex items-center gap-1 text-forest text-sm mb-6 hover:text-forest-dark">
          <ArrowLeft className="h-4 w-4" /> Back to Session
        </Link>
        <h1 className="font-heading text-forest-dark text-3xl font-bold mb-8">Edit Session</h1>

        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelCls}>Title</label>
            <input className={inputCls} value={form.title} onChange={(e) => updateForm("title", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Date <span className="text-red-500">*</span></label>
            <input type="date" required className={inputCls} value={form.date} onChange={(e) => updateForm("date", e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>River</label>
              <input list="rivers-list" className={inputCls} value={form.river_name} onChange={(e) => updateForm("river_name", e.target.value)} />
              <datalist id="rivers-list">{rivers.map((r) => <option key={r} value={r} />)}</datalist>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls + " mb-0"}>Location / Access Point</label>
                <button type="button" onClick={() => { setEditingSpotId(null); setSpotForm({ name: form.location || "", latitude: "", longitude: "", description: "" }); setShowSpotManager(true); }}
                  className="flex items-center gap-1 text-xs text-forest hover:text-forest-dark font-medium">
                  <MapPin className="h-3.5 w-3.5" /> + Manage spots
                </button>
              </div>
              <div className="relative">
                <input
                  ref={locationInputRef}
                  list="locations-list"
                  className={inputCls}
                  value={form.location}
                  onChange={(e) => updateForm("location", e.target.value)}
                  placeholder="Select or type a location"
                />
                {/* Show coords if spot has them */}
                {form.location && (() => { const s = spots.find(sp => sp.name === form.location); return s?.latitude ? (
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {s.latitude.toFixed(5)}, {s.longitude?.toFixed(5)}
                    <button type="button" onClick={() => startEditSpot(s)} className="ml-1 text-forest hover:underline">edit</button>
                  </p>
                ) : null; })()}
              </div>
              <datalist id="locations-list">
                {spots.map(s => <option key={s.id} value={s.name} />)}
                {locations.filter(l => !spots.find(s => s.name === l)).map((l) => <option key={l} value={l} />)}
              </datalist>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Water Temp</label>
              <input className={inputCls} placeholder="52°F" value={form.water_temp_f} onChange={(e) => updateForm("water_temp_f", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Clarity</label>
              <select className={inputCls} value={form.water_clarity} onChange={(e) => updateForm("water_clarity", e.target.value)}>
                <option value="">—</option>
                {["Clear","Slightly Cloudy","Cloudy","Murky"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Weather</label>
              <input className={inputCls} value={form.weather} onChange={(e) => updateForm("weather", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Flies / Rig Notes</label>
            <textarea rows={2} className={inputCls} value={form.flies_notes} onChange={(e) => updateForm("flies_notes", e.target.value)} />
          </div>

          {/* Catches */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls + " mb-0"}>Fish Caught</label>
              <button type="button" onClick={() => setCatches((p) => [...p, emptyCatch()])}
                className="inline-flex items-center gap-1 text-forest text-sm font-medium hover:text-forest-dark">
                <Plus className="h-4 w-4" /> Add Fish
              </button>
            </div>
            <div className="space-y-3">
              {catches.map((c, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Fish #{i + 1}</span>
                    <button type="button" onClick={() => setCatches((p) => p.filter((_, idx) => idx !== i))}
                      className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Species</label>
                      <input list="species-list" className={inputCls} value={c.species} onChange={(e) => updateCatch(i, "species", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Length</label>
                      <input className={inputCls} placeholder='14"' value={c.length_inches} onChange={(e) => updateCatch(i, "length_inches", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Qty</label>
                      <input type="number" min={1} className={inputCls} value={c.quantities} onChange={(e) => updateCatch(i, "quantities", parseInt(e.target.value) || 1)} />
                    </div>
                    <div>
                      <label className={labelCls}>Position</label>
                      <select className={inputCls} value={c.fly_position} onChange={(e) => updateCatch(i, "fly_position", e.target.value)}>
                        <option value="">—</option>
                        {["On Point","Dropper","Tag"].map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Fly Size</label>
                      <input className={inputCls} placeholder="#14" value={c.fly_size} onChange={(e) => updateCatch(i, "fly_size", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Time Caught</label>
                      <input type="time" className={inputCls} value={c.time_caught} onChange={(e) => updateCatch(i, "time_caught", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <datalist id="species-list">
              {["Brown Trout","Rainbow Trout","Cutthroat Trout","Brook Trout","Whitefish"].map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div>
            <label className={labelCls}>Session Notes</label>
            <textarea rows={4} className={inputCls} value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Tags</label>
            <input className={inputCls} placeholder="utah, provo" value={form.trip_tags} onChange={(e) => updateForm("trip_tags", e.target.value)} />
          </div>

          {/* Spot Manager Modal */}
          {showSpotManager && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900">{editingSpotId ? "Edit Location" : "Add Location"}</h3>
                  <button onClick={() => { setShowSpotManager(false); setEditingSpotId(null); setSpotForm({ name: "", latitude: "", longitude: "", description: "" }); }}>
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className={labelCls}>Location Name <span className="text-red-500">*</span></label>
                    <input className={inputCls} placeholder="Below Jordanelle" value={spotForm.name} onChange={e => setSpotForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Latitude</label>
                      <input className={inputCls} placeholder="40.5732" type="number" step="any" value={spotForm.latitude} onChange={e => setSpotForm(p => ({ ...p, latitude: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Longitude</label>
                      <input className={inputCls} placeholder="-111.4285" type="number" step="any" value={spotForm.longitude} onChange={e => setSpotForm(p => ({ ...p, longitude: e.target.value }))} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">Tip: long-press a location in Google Maps → copy coordinates</p>
                  <div>
                    <label className={labelCls}>Notes (optional)</label>
                    <input className={inputCls} placeholder="Public access, park at turnout" value={spotForm.description} onChange={e => setSpotForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <button onClick={saveSpot} disabled={!spotForm.name || spotSaving}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest py-3 text-white font-semibold hover:bg-forest-dark disabled:opacity-50 transition-colors">
                    <Check className="h-4 w-4" /> {spotSaving ? "Saving…" : editingSpotId ? "Save Changes" : "Add Location"}
                  </button>
                </div>
                {/* Existing spots list */}
                {spots.length > 0 && (
                  <div className="border-t border-slate-100 px-5 pb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide pt-3 mb-2">Your Spots</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {spots.map(s => (
                        <div key={s.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50 text-sm">
                          <div>
                            <button type="button" onClick={() => { updateForm("location", s.name); setShowSpotManager(false); }} className="font-medium text-slate-800 hover:text-forest text-left">{s.name}</button>
                            {s.latitude && <p className="text-xs text-slate-400">{s.latitude.toFixed(4)}, {s.longitude?.toFixed(4)}</p>}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <button type="button" onClick={() => startEditSpot(s)} className="text-xs text-slate-400 hover:text-forest">Edit</button>
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

          <div className="sticky bottom-4 pt-4 space-y-3">
            <button type="submit" disabled={saving}
              className="w-full rounded-xl bg-forest py-4 text-white font-semibold text-lg shadow-lg hover:bg-forest-dark transition-colors disabled:opacity-60">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button type="button" onClick={handleDelete} disabled={deleting}
              className="w-full rounded-xl border border-red-200 py-3 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-60">
              {deleting ? "Deleting…" : "Delete Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
