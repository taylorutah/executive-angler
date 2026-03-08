"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Upload } from "lucide-react";

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
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", type: "", size: "", hook: "",
    bead_size: "", bead_color: "", fly_color: "",
    materials: "", description: "", video_url: "", tags: "",
  });

  useEffect(() => {
    fetch("/api/fishing/flies")
      .then((r) => r.json())
      .then((flies) => {
        const fly = flies.find((f: { id: string }) => f.id === id);
        if (fly) {
          setForm({
            name: fly.name || "",
            type: fly.type || "",
            size: (fly.size || []).join(", "),
            hook: fly.hook || "",
            bead_size: fly.bead_size || "",
            bead_color: (fly.bead_color || []).join(", "),
            fly_color: (fly.fly_color || []).join(", "),
            materials: fly.materials || "",
            description: fly.description || "",
            video_url: fly.video_url || "",
            tags: (fly.tags || []).join(", "),
          });
          if (fly.image_url) setExistingImage(fly.image_url);
        }
        setLoading(false);
      });
  }, [id]);

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setExistingImage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const file = fileRef.current?.files?.[0];
      let res: Response;
      const url = `/api/fishing/flies?id=${id}`;

      if (file) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append("image", file);
        // For PATCH with file, use POST-style via a dedicated endpoint
        res = await fetch(url, { method: "PATCH", body: JSON.stringify(form), headers: { "Content-Type": "application/json" } });
      } else {
        res = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      router.push("/journal/flies");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this fly pattern?")) return;
    setDeleting(true);
    const res = await fetch(`/api/fishing/flies?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/journal/flies");
    } else {
      const d = await res.json();
      setError(d.error || "Failed to delete");
      setDeleting(false);
    }
  }

  const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1";

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <p className="text-slate-500">Loading…</p>
    </div>
  );

  const displayImage = preview || existingImage;

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-24">
        <Link href="/journal/flies" className="inline-flex items-center gap-1 text-forest text-sm mb-6 hover:text-forest-dark">
          <ArrowLeft className="h-4 w-4" /> Back to Fly Patterns
        </Link>
        <h1 className="font-heading text-forest-dark text-3xl font-bold mb-8">Edit Fly Pattern</h1>

        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Pattern Name <span className="text-red-500">*</span></label>
              <input required className={inputCls} value={form.name} onChange={(e) => updateForm("name", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select className={inputCls} value={form.type} onChange={(e) => updateForm("type", e.target.value)}>
                <option value="">—</option>
                {["Nymph","Dry Fly","Streamer","Wet Fly","Emerger","Terrestrial","Egg","Other"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>Hook Sizes</label>
              <input className={inputCls} placeholder="#14, #16" value={form.size} onChange={(e) => updateForm("size", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Hook</label>
              <input className={inputCls} value={form.hook} onChange={(e) => updateForm("hook", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Bead Size</label>
              <input className={inputCls} placeholder="2.5mm" value={form.bead_size} onChange={(e) => updateForm("bead_size", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Bead Color</label>
              <input className={inputCls} value={form.bead_color} onChange={(e) => updateForm("bead_color", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Fly Color</label>
              <input className={inputCls} value={form.fly_color} onChange={(e) => updateForm("fly_color", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Tags</label>
              <input className={inputCls} placeholder="euro, tight-line" value={form.tags} onChange={(e) => updateForm("tags", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Materials / Tying Recipe</label>
            <textarea rows={4} className={inputCls} value={form.materials} onChange={(e) => updateForm("materials", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Description / Notes</label>
            <textarea rows={2} className={inputCls} value={form.description} onChange={(e) => updateForm("description", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Video URL</label>
            <input type="url" className={inputCls} value={form.video_url} onChange={(e) => updateForm("video_url", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Photo</label>
            <div className="flex gap-4 items-start">
              {displayImage && (
                <div className="relative h-24 w-24 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                  <Image src={displayImage} alt="Fly" fill className="object-cover" />
                </div>
              )}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-forest hover:text-forest transition-colors">
                <Upload className="h-4 w-4" />
                {displayImage ? "Replace Photo" : "Upload Photo"}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          <div className="sticky bottom-4 pt-4 space-y-3">
            <button type="submit" disabled={saving}
              className="w-full rounded-xl bg-forest py-4 text-white font-semibold text-lg shadow-lg hover:bg-forest-dark transition-colors disabled:opacity-60">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button type="button" onClick={handleDelete} disabled={deleting}
              className="w-full rounded-xl border border-red-200 py-3 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-60">
              {deleting ? "Deleting…" : "Delete Pattern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
