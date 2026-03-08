"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Upload, Trash2, X } from "lucide-react";

const FLY_TYPES = ["Nymph", "Dry Fly", "Streamer", "Wet Fly", "Emerger", "Terrestrial", "Egg", "Other"];

export default function EditFlyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", type: "", size: "", hook: "",
    bead_size: "", bead_color: "", fly_color: "",
    materials: "", description: "", video_url: "", tags: "",
  });

  useEffect(() => {
    fetch(`/api/fishing/flies?id=${id}`)
      .then(r => r.json())
      .then(fly => {
        if (fly.error) return;
        setForm({
          name: fly.name || "",
          type: fly.type || "",
          size: Array.isArray(fly.size) ? fly.size.join(", ") : fly.size || "",
          hook: fly.hook || "",
          bead_size: fly.bead_size || "",
          bead_color: fly.bead_color || "",
          fly_color: fly.fly_color || "",
          materials: fly.materials || "",
          description: fly.description || "",
          video_url: fly.video_url || "",
          tags: Array.isArray(fly.tags) ? fly.tags.join(", ") : fly.tags || "",
        });
        if (fly.image_url) setExistingImage(fly.image_url);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  function updateForm(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function removeImage() {
    setFile(null);
    setPreview(null);
    setExistingImage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let res: Response;
      if (file) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append("image", file);
        res = await fetch(`/api/fishing/flies?id=${id}`, { method: "PATCH", body: fd });
      } else {
        res = await fetch(`/api/fishing/flies?id=${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      router.push(`/journal/flies`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this fly pattern permanently?")) return;
    setDeleting(true);
    const res = await fetch(`/api/fishing/flies?id=${id}`, { method: "DELETE" });
    if (res.ok) router.push("/journal/flies");
    else { setDeleting(false); setError("Failed to delete"); }
  }

  const input = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest";
  const label = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1";
  const section = "bg-white rounded-xl border border-slate-100 p-5 mb-4";
  const displayImage = preview || existingImage;

  if (loading) return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center pt-20">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-forest animate-spin" />
        <p className="text-sm">Loading fly pattern…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-32">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/journal/flies" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-forest transition-colors">
            <ArrowLeft className="h-4 w-4" /> Fly Patterns
          </Link>
          <h1 className="font-heading text-xl font-bold text-slate-900">Edit Fly Pattern</h1>
          <div className="w-24" />
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* Photo */}
          <div className={section}>
            <h2 className="text-sm font-bold text-slate-700 mb-4">📸 Photo</h2>
            {displayImage ? (
              <div className="flex items-start gap-4">
                <div className="relative h-32 w-32 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                  <Image src={displayImage} alt="Fly" fill className="object-cover" />
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-medium text-forest border border-forest/30 rounded-lg px-3 py-2 hover:bg-forest/5">
                    <Upload className="h-3.5 w-3.5" /> Replace
                  </button>
                  <button type="button" onClick={removeImage}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50">
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-8 text-slate-400 hover:border-forest/40 hover:text-forest transition-colors">
                <Upload className="h-6 w-6" />
                <span className="text-sm font-medium">Upload fly photo</span>
                <span className="text-xs">JPG, PNG — looks great at 1:1</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          {/* Pattern Info */}
          <div className={section}>
            <h2 className="text-sm font-bold text-slate-700 mb-4">🪰 Pattern Info</h2>
            <div className="space-y-3">
              <div>
                <label className={label}>Pattern Name <span className="text-red-400">*</span></label>
                <input required className={input} placeholder="Perdigon, CDC Caddis…" value={form.name} onChange={e => updateForm("name", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Type</label>
                  <select className={input} value={form.type} onChange={e => updateForm("type", e.target.value)}>
                    <option value="">—</option>
                    {FLY_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={label}>Hook Sizes</label>
                  <input className={input} placeholder="#14, #16, #18" value={form.size} onChange={e => updateForm("size", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={label}>Fly Color</label>
                <input className={input} placeholder="Olive, black, orange…" value={form.fly_color} onChange={e => updateForm("fly_color", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Bead & Hook */}
          <div className={section}>
            <h2 className="text-sm font-bold text-slate-700 mb-4">⚙️ Bead & Hook</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={label}>Hook Model</label>
                <input className={input} placeholder="Hanak 300" value={form.hook} onChange={e => updateForm("hook", e.target.value)} />
              </div>
              <div>
                <label className={label}>Bead Size</label>
                <input className={input} placeholder="2.5mm" value={form.bead_size} onChange={e => updateForm("bead_size", e.target.value)} />
              </div>
              <div>
                <label className={label}>Bead Color</label>
                <input className={input} placeholder="Tungsten, gold…" value={form.bead_color} onChange={e => updateForm("bead_color", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Tying Recipe */}
          <div className={section}>
            <h2 className="text-sm font-bold text-slate-700 mb-3">📋 Tying Recipe</h2>
            <textarea rows={4} className={input} placeholder="Thread: 8/0 black&#10;Body: UV resin over thread&#10;Rib: copper wire&#10;Bead: 2.8mm tungsten" value={form.materials} onChange={e => updateForm("materials", e.target.value)} />
          </div>

          {/* Notes & Video */}
          <div className={section}>
            <h2 className="text-sm font-bold text-slate-700 mb-3">📝 Notes & Video</h2>
            <div className="space-y-3">
              <div>
                <label className={label}>Notes</label>
                <textarea rows={3} className={input} placeholder="When to use, rivers it works best on, tips…" value={form.description} onChange={e => updateForm("description", e.target.value)} />
              </div>
              <div>
                <label className={label}>Tying Video URL</label>
                <input type="url" className={input} placeholder="https://youtube.com/…" value={form.video_url} onChange={e => updateForm("video_url", e.target.value)} />
              </div>
              <div>
                <label className={label}>Tags</label>
                <input className={input} placeholder="euro, tungsten, nymph, fast-water" value={form.tags} onChange={e => updateForm("tags", e.target.value)} />
                <p className="text-xs text-slate-400 mt-1">Separate with commas</p>
              </div>
            </div>
          </div>

        </form>

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
