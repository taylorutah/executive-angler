"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Upload, Trash2, X, Sparkles } from "lucide-react";
import VariantModal from "@/components/flies/VariantModal";
import VariantTree from "@/components/flies/VariantTree";
import HelpHint from "@/components/ui/HelpHint";

const FLY_TYPES = ["Nymph", "Dry Fly", "Streamer", "Wet Fly", "Emerger", "Terrestrial", "Egg", "Other"];

const BEAD_MATERIALS = [
  { value: "", label: "—" },
  { value: "none", label: "None (unweighted)" },
  { value: "brass", label: "Brass" },
  { value: "tungsten", label: "Tungsten" },
  { value: "slotted_tungsten", label: "Slotted tungsten" },
  { value: "copper", label: "Copper" },
  { value: "other", label: "Other" },
];

const COMMON_BEAD_SIZES_MM = ["2.0", "2.4", "2.8", "3.2", "3.5", "3.8", "4.0", "4.6"];

/** Normalize array fields from DB — handles real arrays, JSON strings, and plain strings */
function normalizeArrayField(val: unknown): string {
  if (!val) return "";
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.join(", ");
      } catch { /* fall through */ }
    }
    return trimmed;
  }
  return String(val);
}

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
    bead_size: "", bead_color: "", bead_material: "", bead_size_mm: "",
    fly_color: "",
    body_color: "", body_material: "", tail_color: "",
    thorax_color: "", collar_color: "",
    rib_material: "", wing_material: "",
    materials: "", description: "", video_url: "", tags: "",
  });
  const [variantOpen, setVariantOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/fishing/flies?id=${id}`)
      .then(r => r.json())
      .then(fly => {
        if (fly.error) return;
        setForm({
          name: fly.name || "",
          type: fly.type || "",
          size: normalizeArrayField(fly.size),
          hook: fly.hook || "",
          bead_size: normalizeArrayField(fly.bead_size),
          bead_color: fly.bead_color || "",
          bead_material: fly.bead_material || "",
          bead_size_mm: fly.bead_size_mm != null ? String(fly.bead_size_mm) : "",
          fly_color: fly.fly_color || "",
          body_color: fly.body_color || "",
          body_material: fly.body_material || "",
          tail_color: fly.tail_color || "",
          thorax_color: fly.thorax_color || "",
          collar_color: fly.collar_color || "",
          rib_material: fly.rib_material || "",
          wing_material: fly.wing_material || "",
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
      router.push(`/my-flies?tab=box`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this fly pattern permanently?")) return;
    setDeleting(true);
    const res = await fetch(`/api/fishing/flies?id=${id}`, { method: "DELETE" });
    if (res.ok) router.push("/my-flies?tab=box");
    else { setDeleting(false); setError("Failed to delete"); }
  }

  const input = "w-full rounded-lg border border-[#21262D] bg-[#161B22] px-3 py-2.5 text-sm text-[#F0F6FC] placeholder:text-[#6E7681] focus:border-[#E8923A] focus:outline-none focus:ring-1 focus:ring-[#E8923A]";
  const label = "flex items-center gap-1 text-xs font-semibold text-[#A8B2BD] uppercase tracking-wide mb-1";
  const section = "bg-[#161B22] rounded-xl border border-[#21262D] p-5";
  const sectionTitle = "flex items-center gap-2 text-sm font-bold text-[#F0F6FC] mb-4";
  const displayImage = preview || existingImage;
  const isNymphLike = form.type === "Nymph" || form.type === "Wet Fly" || form.type === "Emerger" || form.type === "";

  if (loading) return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-[#6E7681]">
        <div className="h-8 w-8 rounded-full border-2 border-[#21262D] border-t-[#E8923A] animate-spin" />
        <p className="text-sm">Loading fly pattern…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-32">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/my-flies" className="flex items-center gap-1.5 text-sm text-[#A8B2BD] hover:text-[#E8923A] transition-colors">
            <ArrowLeft className="h-4 w-4" /> My Flies
          </Link>
          <h1 className="font-heading text-xl font-bold text-[#F0F6FC]">Edit Fly Pattern</h1>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setVariantOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#00B4D8]/40 bg-[#00B4D8]/10 px-3 py-1.5 text-xs font-medium text-[#00B4D8] hover:bg-[#00B4D8]/20 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Variant
            </button>
            <HelpHint label="What's a variant?">
              <p className="text-[#F0F6FC] font-semibold">Fork this fly into a child pattern</p>
              <p>Change one or two specs (size, bead, color) and we&apos;ll auto-name it and link it back to this parent so you can track what works.</p>
              <p className="text-[#6E7681] text-xs">Use &quot;Spawn by axis&quot; to create a whole size or color run at once.</p>
            </HelpHint>
          </div>
        </div>

        {variantOpen && (
          <VariantModal
            open={variantOpen}
            onClose={() => setVariantOpen(false)}
            parent={{
              patternId: id,
              name: form.name || "This pattern",
              heroImageUrl: existingImage,
            }}
          />
        )}

        {error && <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">{error}</div>}

        {/* Desktop 2-col layout: form (main) + sticky sidebar (photo + variant tree) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 lg:gap-6">

          {/* MAIN COLUMN — form */}
          <form onSubmit={handleSubmit} className="space-y-4 min-w-0">

            {/* Pattern basics */}
            <div className={section}>
              <h2 className={sectionTitle}><span>🪰</span> Pattern Info</h2>
              <div className="space-y-3">
                <div>
                  <label className={label}>Pattern Name <span className="text-red-400">*</span></label>
                  <input required className={input} placeholder="Perdigon, CDC Caddis…" value={form.name} onChange={e => updateForm("name", e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={label}>
                      Type
                      <HelpHint label="Pattern type">
                        <p>Classification drives suggestions and filtering. Nymphs unlock bead + body variation fields below.</p>
                      </HelpHint>
                    </label>
                    <select className={input} value={form.type} onChange={e => updateForm("type", e.target.value)}>
                      <option value="">—</option>
                      {FLY_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label}>
                      Hook Sizes
                      <HelpHint label="How to enter sizes">
                        <p className="text-[#F0F6FC] font-semibold">Comma-separate all sizes you tie this in</p>
                        <p>Example: <span className="text-[#E8923A]">#14, #16, #18</span></p>
                        <p className="text-[#6E7681] text-xs">We parse these into an array so filters and Tie Next can target specific sizes.</p>
                      </HelpHint>
                    </label>
                    <input className={input} placeholder="#14, #16, #18" value={form.size} onChange={e => updateForm("size", e.target.value)} />
                  </div>
                  <div>
                    <label className={label}>Fly Color</label>
                    <input className={input} placeholder="Olive, black, orange…" value={form.fly_color} onChange={e => updateForm("fly_color", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Hook & Bead */}
            <div className={section}>
              <h2 className={sectionTitle}><span>⚙️</span> Hook &amp; Bead</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className={label}>Hook Model</label>
                  <input className={input} placeholder="Hanak 300, Fulling Mill 5050…" value={form.hook} onChange={e => updateForm("hook", e.target.value)} />
                </div>
                <div>
                  <label className={label}>
                    Bead Material
                    <HelpHint label="Bead material">
                      <p className="text-[#F0F6FC] font-semibold">Tungsten vs brass changes sink rate</p>
                      <p>Tungsten is ~1.7× denser than brass — same size sinks faster. Slotted tungsten is for jig hooks.</p>
                      <p className="text-[#6E7681] text-xs">This lets us treat &quot;Frenchie tungsten 3.2mm&quot; and &quot;Frenchie brass 3.5mm&quot; as distinct variants.</p>
                    </HelpHint>
                  </label>
                  <select className={input} value={form.bead_material} onChange={e => updateForm("bead_material", e.target.value)}>
                    {BEAD_MATERIALS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={label}>
                    Bead Size (mm)
                    <HelpHint label="Common bead sizes">
                      <p className="text-[#F0F6FC] font-semibold">Common nymph bead sizes</p>
                      <ul className="text-xs space-y-0.5">
                        <li><span className="text-[#E8923A]">2.0–2.4mm</span> — #18–20 small nymphs</li>
                        <li><span className="text-[#E8923A]">2.8–3.2mm</span> — #14–16 standard</li>
                        <li><span className="text-[#E8923A]">3.5–3.8mm</span> — #12 heavy anchor</li>
                        <li><span className="text-[#E8923A]">4.0–4.6mm</span> — streamer / big stones</li>
                      </ul>
                    </HelpHint>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    list="bead-sizes-mm"
                    className={input}
                    placeholder="3.2"
                    value={form.bead_size_mm}
                    onChange={e => updateForm("bead_size_mm", e.target.value)}
                  />
                  <datalist id="bead-sizes-mm">
                    {COMMON_BEAD_SIZES_MM.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>
                <div>
                  <label className={label}>Bead Size (label)</label>
                  <input className={input} placeholder="e.g. 1/8&quot;, small" value={form.bead_size} onChange={e => updateForm("bead_size", e.target.value)} />
                </div>
                <div>
                  <label className={label}>Bead Color</label>
                  <input className={input} placeholder="Copper, gold, black nickel…" value={form.bead_color} onChange={e => updateForm("bead_color", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Body / Tail / Thorax / Collar — nymph variation fields */}
            <div className={section}>
              <h2 className={sectionTitle}>
                <span>🧵</span>
                Body, Tail &amp; Thorax
                <HelpHint label="Why these matter">
                  <p className="text-[#F0F6FC] font-semibold">First-class variation fields</p>
                  <p>Changing just the thorax color or rib material creates a new variant. Filling these out makes diffing and auto-naming sharper.</p>
                  <p className="text-[#6E7681] text-xs">Leave blank if not applicable — they&apos;re most useful on nymphs, emergers, and wet flies.</p>
                </HelpHint>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <div>
                  <label className={label}>Body Color</label>
                  <input className={input} placeholder="Olive" value={form.body_color} onChange={e => updateForm("body_color", e.target.value)} />
                </div>
                <div>
                  <label className={label}>Body Material</label>
                  <input className={input} placeholder="UV resin, dubbing…" value={form.body_material} onChange={e => updateForm("body_material", e.target.value)} />
                </div>
                <div>
                  <label className={label}>Tail Color</label>
                  <input className={input} placeholder="CDL, pheasant…" value={form.tail_color} onChange={e => updateForm("tail_color", e.target.value)} />
                </div>
                <div>
                  <label className={label}>Thorax Color</label>
                  <input className={input} placeholder="Black, hot spot…" value={form.thorax_color} onChange={e => updateForm("thorax_color", e.target.value)} />
                </div>
                <div>
                  <label className={label}>Collar Color</label>
                  <input className={input} placeholder="Partridge, ice dub…" value={form.collar_color} onChange={e => updateForm("collar_color", e.target.value)} />
                </div>
                <div>
                  <label className={label}>Rib Material</label>
                  <input className={input} placeholder="Copper wire, flash…" value={form.rib_material} onChange={e => updateForm("rib_material", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className={label}>Wing Material</label>
                  <input className={input} placeholder="CDC, deer hair, EP fiber…" value={form.wing_material} onChange={e => updateForm("wing_material", e.target.value)} />
                </div>
              </div>
              {!isNymphLike && (
                <p className="mt-3 text-xs text-[#6E7681]">
                  These fields are most useful on nymphs and wets — fill in what applies to your {form.type.toLowerCase()}.
                </p>
              )}
            </div>

            {/* Tying Recipe */}
            <div className={section}>
              <h2 className={sectionTitle}>
                <span>📋</span>
                Tying Recipe
                <HelpHint label="Recipe vs fields above">
                  <p>Use this free-form field for step-by-step notes, thread size, and anything that doesn&apos;t fit the structured fields above.</p>
                  <p className="text-[#6E7681] text-xs">Structured Recipe Builder (coming from the workbench) will eventually replace this for library-matched materials.</p>
                </HelpHint>
              </h2>
              <textarea rows={5} className={input} placeholder="Thread: 8/0 black&#10;Body: UV resin over thread&#10;Rib: copper wire&#10;Bead: 2.8mm tungsten" value={form.materials} onChange={e => updateForm("materials", e.target.value)} />
            </div>

            {/* Notes & Video */}
            <div className={section}>
              <h2 className={sectionTitle}><span>📝</span> Notes &amp; Video</h2>
              <div className="space-y-3">
                <div>
                  <label className={label}>Notes</label>
                  <textarea rows={3} className={input} placeholder="When to use, rivers it works best on, tips…" value={form.description} onChange={e => updateForm("description", e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={label}>Tying Video URL</label>
                    <input type="url" className={input} placeholder="https://youtube.com/…" value={form.video_url} onChange={e => updateForm("video_url", e.target.value)} />
                  </div>
                  <div>
                    <label className={label}>
                      Tags
                      <HelpHint label="How tags work">
                        <p>Free-form labels used for filtering and Tie Next suggestions. Commas separate them.</p>
                        <p className="text-[#6E7681] text-xs">Common: euro, tungsten, fast-water, winter, tailwater, hopper-dropper.</p>
                      </HelpHint>
                    </label>
                    <input className={input} placeholder="euro, tungsten, nymph, fast-water" value={form.tags} onChange={e => updateForm("tags", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

          </form>

          {/* SIDEBAR — photo + variant tree (sticky on desktop) */}
          <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            {/* Photo */}
            <div className={section}>
              <h2 className="text-xs font-bold text-[#A8B2BD] uppercase tracking-wide mb-3">Photo</h2>
              {displayImage ? (
                <div className="space-y-3">
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-[#21262D]">
                    <Image src={displayImage} alt="Fly" fill className="object-cover" sizes="340px" />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-[#E8923A] border border-[#E8923A]/30 rounded-lg px-3 py-2 hover:bg-[#E8923A]/10 transition-colors">
                      <Upload className="h-3.5 w-3.5" /> Replace
                    </button>
                    <button type="button" onClick={removeImage}
                      className="flex items-center justify-center gap-1.5 text-xs font-medium text-red-400 border border-red-500/30 rounded-lg px-3 py-2 hover:bg-red-500/10 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#21262D] rounded-xl py-10 text-[#6E7681] hover:border-[#E8923A]/40 hover:text-[#E8923A] transition-colors">
                  <Upload className="h-6 w-6" />
                  <span className="text-sm font-medium">Upload fly photo</span>
                  <span className="text-xs">JPG, PNG — 1:1 looks best</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>

            {/* Variant tree — lineage + children */}
            <VariantTree patternId={id} />
          </aside>

        </div>

        {/* Sticky save bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#161B22] border-t border-[#21262D] px-4 py-3 z-50 shadow-lg">
          <div className="mx-auto max-w-6xl flex gap-3">
            <button type="button" onClick={handleDelete} disabled={deleting}
              className="flex items-center justify-center rounded-xl border border-red-500/30 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 flex-shrink-0">
              {deleting ? "…" : <Trash2 className="h-4 w-4" />}
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 rounded-xl bg-[#E8923A] py-3 text-[#0D1117] font-semibold text-sm hover:bg-[#F0A45A] transition-colors disabled:opacity-60 shadow-sm">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
