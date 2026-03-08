"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, MapPin, X, Check, Fish, Feather } from "lucide-react";

interface Catch {
  id?: string;
  species: string;
  length_inches: string;
  quantities: number;
  fly_position: string;
  fly_size: string;
  bead_size: string;
  time_caught: string;
  notes: string;
}

interface Spot { id: string; name: string; latitude?: number; longitude?: number; description?: string; }

const SPECIES = ["Brown Trout", "Rainbow Trout", "Cutthroat Trout", "Brook Trout", "Mountain Whitefish", "Tiger Trout", "Bull Trout"];
const CLARITY = ["Crystal Clear", "Clear", "Slightly Cloudy", "Cloudy", "Murky"];
const POSITIONS = ["On Point", "Dropper", "Tag", "Single"];

const emptyCatch = (): Catch => ({
  species: "", length_inches: "", quantities: 1,
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
  const [catches, setCatches] = useState<Catch[]>([]);
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
        fetch(`/api/fishing/session?id=${id}`),
        fetch("/api/fishing/session?autocomplete=rivers"),
        fetch("/api/fishing/session?autocomplete=locations"),
        fetch("/api/fishing/spots"),
      ]);

      if (sessionRes.ok) {
        const session = await sessionRes.json();
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
          trip_tags: (session.trip_tags || session.tags || []).join(", "),
        });
        setCatches(
          (session.catches || []).map((c: Catch) => ({
            id: (c as Catch & { id?: string }).id,
            species: c.species || "",
            length_inches: c.length_inches || "",
            quantities: c.quantities || 1,
            fly_position: c.fly_position || "",
            fly_size: c.fly_size || "",
            bead_size: c.bead_size || "",
            time_caught: c.time_caught || "",
            notes: c.notes || "",
          }))
        );
      }

      if (riversRes.ok) setRivers(await riversRes.json());
      if (locsRes.ok) setLocations(await locsRes.json());
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
    if (!confirm("Delete this session permanently? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/fishing/session?id=${id}`, { method: "DELETE" });
    if (res.ok) router.push("/journal");
    else { setDeleting(false); setError("Failed to delete"); }
  }

  const input = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest";
  const label = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1";
  const section = "bg-white rounded-xl border border-slate-100 p-5 mb-4";

  if (loading) return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center pt-20">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-forest animate-spin" />
        <p className="text-sm">Loading session…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-32">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href={`/journal/${id}`} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-forest transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="font-heading text-xl font-bold text-slate-900">Edit Session</h1>
          <div className="w-16" />
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-0">

          {/* Basic Info */}
          <div className={section}>
            <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">📋 Basic Info</h2>
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
                  <input list="rivers-list" className={input} placeholder="Middle Provo River" value={form.river_name} onChange={(e) => updateForm("river_name", e.target.value)} />
                  <datalist id="rivers-list">{rivers.map((r) => <option key={r} value={r} />)}</datalist>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={label + " mb-0"}>Location</label>
                    <button type="button" onClick={() => { setEditingSpotId(null); setSpotForm({ name: form.location || "", latitude: "", longitude: "", description: "" }); setShowSpotManager(true); }}
                      className="text-[10px] text-forest font-semibold flex items-center gap-0.5 hover:text-forest-dark">
                      <MapPin className="h-3 w-3" /> Manage
                    </button>
                  </div>
                  <input ref={locationInputRef} list="locations-list" className={input} placeholder="Below Jordanelle" value={form.location} onChange={(e) => updateForm("location", e.target.value)} />
                  {form.location && (() => { const s = spots.find(sp => sp.name === form.location); return s?.latitude ? (
                    <p className="text-[10px] text-slate-400 mt-1">{s.latitude.toFixed(5)}, {s.longitude?.toFixed(5)}</p>
                  ) : null; })()}
                  <datalist id="locations-list">
                    {spots.map(s => <option key={s.id} value={s.name} />)}
                    {locations.filter(l => !spots.find(s => s.name === l)).map((l) => <option key={l} value={l} />)}
                  </datalist>
                </div>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className={section}>
            <h2 className="text-sm font-bold text-slate-700 mb-4">🌊 Conditions</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={label}>Water Temp</label>
                <input className={input} placeholder="52°F" value={form.water_temp_f} onChange={(e) => updateForm("water_temp_f", e.target.value)} />
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

          {/* Fish Caught */}
          <div className={section}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Fish className="h-4 w-4 text-forest" /> Fish Caught ({catches.filter(c => c.species).reduce((s, c) => s + (c.quantities || 1), 0)})</h2>
              <button type="button" onClick={() => setCatches((p) => [...p, emptyCatch()])}
                className="flex items-center gap-1 text-xs font-semibold text-forest hover:text-forest-dark">
                <Plus className="h-3.5 w-3.5" /> Add Fish
              </button>
            </div>

            {catches.length === 0 ? (
              <button type="button" onClick={() => setCatches([emptyCatch()])}
                className="w-full rounded-lg border-2 border-dashed border-slate-200 py-6 text-sm text-slate-400 hover:border-forest/40 hover:text-forest transition-colors">
                + Log a fish
              </button>
            ) : (
              <div className="space-y-3">
                {catches.map((c, i) => (
                  <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-500">Fish #{i + 1}</span>
                      <button type="button" onClick={() => setCatches((p) => p.filter((_, idx) => idx !== i))}
                        className="text-slate-300 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className={label}>Species</label>
                        <input list={`species-list-${i}`} className={input} placeholder="Brown Trout" value={c.species} onChange={(e) => updateCatch(i, "species", e.target.value)} />
                        <datalist id={`species-list-${i}`}>{SPECIES.map((s) => <option key={s} value={s} />)}</datalist>
                      </div>
                      <div>
                        <label className={label}>Length</label>
                        <input className={input} placeholder='14"' value={c.length_inches} onChange={(e) => updateCatch(i, "length_inches", e.target.value)} />
                      </div>
                      <div>
                        <label className={label}>Qty</label>
                        <input type="number" min={1} className={input} value={c.quantities} onChange={(e) => updateCatch(i, "quantities", parseInt(e.target.value) || 1)} />
                      </div>
                      <div>
                        <label className={label}>Position</label>
                        <select className={input} value={c.fly_position} onChange={(e) => updateCatch(i, "fly_position", e.target.value)}>
                          <option value="">—</option>
                          {POSITIONS.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={label}>Fly Size</label>
                        <input className={input} placeholder="#14" value={c.fly_size} onChange={(e) => updateCatch(i, "fly_size", e.target.value)} />
                      </div>
                      <div>
                        <label className={label}>Bead</label>
                        <input className={input} placeholder="2.8mm" value={c.bead_size} onChange={(e) => updateCatch(i, "bead_size", e.target.value)} />
                      </div>
                      <div>
                        <label className={label}>Time</label>
                        <input type="time" className={input} value={c.time_caught} onChange={(e) => updateCatch(i, "time_caught", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className={label}>Notes</label>
                        <input className={input} placeholder="What worked…" value={c.notes} onChange={(e) => updateCatch(i, "notes", e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flies & Rig */}
          <div className={section}>
            <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Feather className="h-4 w-4 text-amber-500" /> Flies & Rig</h2>
            <textarea rows={3} className={input} placeholder="Perdigon #16 with 2.8mm tungsten on point, Silver Bullet dropper. 5x tippet, 9ft 5wt…" value={form.flies_notes} onChange={(e) => updateForm("flies_notes", e.target.value)} />
          </div>

          {/* Notes */}
          <div className={section}>
            <h2 className="text-sm font-bold text-slate-700 mb-3">📝 Session Notes</h2>
            <textarea rows={5} className={input} placeholder="How did the day go? What worked, what didn't, water conditions, hatch activity…" value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} />
          </div>

          {/* Tags */}
          <div className={section}>
            <h2 className="text-sm font-bold text-slate-700 mb-3">🏷 Tags</h2>
            <input className={input} placeholder="utah, provo, nymphing, spring runoff" value={form.trip_tags} onChange={(e) => updateForm("trip_tags", e.target.value)} />
            <p className="text-xs text-slate-400 mt-1.5">Separate tags with commas</p>
          </div>

        </form>

        {/* Spot Manager Modal */}
        {showSpotManager && (
          <div className="fixed inset-0 z-[200] bg-black/50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">{editingSpotId ? "Edit Spot" : "Add Location"}</h3>
                <button onClick={() => { setShowSpotManager(false); setEditingSpotId(null); }}>
                  <X className="h-5 w-5 text-slate-400" />
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
                <p className="text-xs text-slate-400">Tip: long-press a spot in Google Maps → copy coordinates</p>
                <div>
                  <label className={label}>Notes (optional)</label>
                  <input className={input} placeholder="Public access, park at turnout" value={spotForm.description} onChange={e => setSpotForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <button onClick={saveSpot} disabled={!spotForm.name || spotSaving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest py-3 text-white font-semibold hover:bg-forest-dark disabled:opacity-50 transition-colors">
                  <Check className="h-4 w-4" /> {spotSaving ? "Saving…" : editingSpotId ? "Save Changes" : "Add Location"}
                </button>
              </div>
              {spots.length > 0 && (
                <div className="border-t border-slate-100 px-5 pb-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide pt-4 mb-2">Your Spots</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {spots.map(s => (
                      <div key={s.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50 text-sm">
                        <div>
                          <button type="button" onClick={() => { updateForm("location", s.name); setShowSpotManager(false); }} className="font-medium text-slate-800 hover:text-forest text-left">{s.name}</button>
                          {s.latitude && <p className="text-xs text-slate-400">{s.latitude.toFixed(4)}, {s.longitude?.toFixed(4)}</p>}
                        </div>
                        <div className="flex items-center gap-3 ml-2">
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

        {/* Sticky save bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex gap-3 z-50 shadow-lg">
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="flex items-center justify-center rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 flex-shrink-0">
            {deleting ? "…" : <Trash2 className="h-4 w-4" />}
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 rounded-xl bg-forest py-3 text-white font-semibold text-sm hover:bg-forest-dark transition-colors disabled:opacity-60 shadow-sm">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}
