"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Upload } from "lucide-react";

export default function NewFlyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    type: "",
    size: "",
    hook: "",
    bead_size: "",
    bead_color: "",
    fly_color: "",
    materials: "",
    description: "",
    video_url: "",
    tags: "",
  });

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const file = fileRef.current?.files?.[0];
      let res: Response;

      if (file) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append("image", file);
        res = await fetch("/api/fishing/flies", { method: "POST", body: fd });
      } else {
        res = await fetch("/api/fishing/flies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save");
      }

      router.push("/journal/flies");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-20">
        <Link href="/journal/flies" className="inline-flex items-center gap-1 text-forest text-sm mb-6 hover:text-forest-dark">
          <ArrowLeft className="h-4 w-4" /> Back to Fly Patterns
        </Link>

        <h1 className="font-heading text-forest-dark text-3xl font-bold mb-8">Add Fly Pattern</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Pattern Name <span className="text-red-500">*</span></label>
              <input required className={inputCls} placeholder="Perdigon" value={form.name} onChange={(e) => updateForm("name", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select className={inputCls} value={form.type} onChange={(e) => updateForm("type", e.target.value)}>
                <option value="">—</option>
                {["Nymph", "Dry Fly", "Streamer", "Wet Fly", "Emerger", "Terrestrial", "Egg", "Other"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
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
              <input className={inputCls} placeholder="Hanak 400" value={form.hook} onChange={(e) => updateForm("hook", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Bead Size</label>
              <input className={inputCls} placeholder="2.5mm" value={form.bead_size} onChange={(e) => updateForm("bead_size", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Bead Color</label>
              <input className={inputCls} placeholder="Gold" value={form.bead_color} onChange={(e) => updateForm("bead_color", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Fly Color</label>
              <input className={inputCls} placeholder="Black, Red" value={form.fly_color} onChange={(e) => updateForm("fly_color", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Tags</label>
              <input className={inputCls} placeholder="euro, tight-line" value={form.tags} onChange={(e) => updateForm("tags", e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Materials / Tying Recipe</label>
            <textarea rows={4} className={inputCls} placeholder="Hook: Hanak 400 BL #16&#10;Bead: 2.5mm tungsten gold&#10;Thread: 8/0 black..." value={form.materials} onChange={(e) => updateForm("materials", e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Description / Notes</label>
            <textarea rows={2} className={inputCls} placeholder="When and how to fish it..." value={form.description} onChange={(e) => updateForm("description", e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Video URL <span className="text-slate-400 font-normal">(YouTube)</span></label>
            <input type="url" className={inputCls} placeholder="https://youtube.com/..." value={form.video_url} onChange={(e) => updateForm("video_url", e.target.value)} />
          </div>

          {/* Image upload */}
          <div>
            <label className={labelCls}>Photo</label>
            <div className="flex gap-4 items-start">
              {preview && (
                <div className="relative h-24 w-24 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                  <Image src={preview} alt="Preview" fill className="object-cover" />
                </div>
              )}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-forest hover:text-forest transition-colors">
                <Upload className="h-4 w-4" />
                {preview ? "Change Photo" : "Upload Photo"}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          <div className="sticky bottom-4 pt-4">
            <button type="submit" disabled={saving}
              className="w-full rounded-xl bg-forest py-4 text-white font-semibold text-lg shadow-lg hover:bg-forest-dark transition-colors disabled:opacity-60">
              {saving ? "Saving…" : "Save Pattern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
