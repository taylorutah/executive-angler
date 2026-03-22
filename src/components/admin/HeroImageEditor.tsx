"use client";

import { useState, useRef } from "react";
import {
  Camera, Upload, X, Save, Loader2, CheckCircle, Info,
  Pencil, Image as ImageIcon, Type, User, Link as LinkIcon
} from "lucide-react";

interface HeroImageEditorProps {
  entityType: string; // "rivers", "destinations", "fly_shops", etc.
  entityId: string;   // slug or uuid
  currentImageUrl: string;
  currentAlt?: string;
  currentCredit?: string;
  currentCreditUrl?: string;
}

export default function HeroImageEditor({
  entityType,
  entityId,
  currentImageUrl,
  currentAlt,
  currentCredit,
  currentCreditUrl,
}: HeroImageEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [altText, setAltText] = useState(currentAlt || "");
  const [credit, setCredit] = useState(currentCredit || "");
  const [creditUrl, setCreditUrl] = useState(currentCreditUrl || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image (JPEG, PNG, or WebP)");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("Image too large. Maximum 15 MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("submission_id", `hero-${entityType}-${entityId}`);

      const res = await fetch("/api/submissions/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      setImageUrl(result.url);

      // Auto-generate alt text suggestion if empty
      if (!altText) {
        const name = entityId.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        setAltText(`${name} — fly fishing`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    }

    setUploading(false);
  }

  async function handleSave() {
    if (!imageUrl) {
      setError("No image selected");
      return;
    }
    if (!altText.trim()) {
      setError("Alt text is required for SEO. Describe what's in the image.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/hero-image", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          hero_image_url: imageUrl,
          hero_image_alt: altText.trim(),
          hero_image_credit: credit.trim() || null,
          hero_image_credit_url: creditUrl.trim() || null,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Save failed");

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
        window.location.reload();
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }

    setSaving(false);
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8923A] text-white rounded-lg text-xs font-semibold hover:bg-[#F0A65A] transition-colors shadow-lg"
        title="Edit hero image (admin)"
      >
        <Pencil className="h-3 w-3" />
        Edit Hero
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div className="bg-[#161B22] border border-[#21262D] rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262D]">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[#E8923A]" />
            <h2 className="text-base font-bold text-[#F0F6FC]">Edit Hero Image</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-[#484F58] hover:text-[#F0F6FC]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Image preview + upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">Image</label>
              <div className="group relative">
                <Info className="h-3.5 w-3.5 text-[#484F58] cursor-help" />
                <div className="absolute right-0 top-5 w-64 p-3 bg-[#0D1117] border border-[#21262D] rounded-lg text-[10px] text-[#8B949E] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                  <p className="font-bold text-[#F0F6FC] mb-1">Optimal image specs:</p>
                  <ul className="space-y-0.5">
                    <li>• <strong>Size:</strong> 2400 × 1000px (21:9 ratio)</li>
                    <li>• <strong>Format:</strong> JPEG or WebP</li>
                    <li>• <strong>File size:</strong> 200–500 KB ideal, 15 MB max</li>
                    <li>• <strong>Quality:</strong> 80% JPEG compression</li>
                    <li>• <strong>Content:</strong> Landscape, no text overlays</li>
                    <li>• <strong>Focus:</strong> Subject in center/left third (text overlays right)</li>
                  </ul>
                </div>
              </div>
            </div>

            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-[#21262D]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={altText || "Preview"} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="px-2.5 py-1 bg-black/70 text-white rounded-lg text-xs font-semibold hover:bg-black/90 transition-colors"
                  >
                    Replace
                  </button>
                  <button
                    onClick={() => setImageUrl("")}
                    className="px-2.5 py-1 bg-red-900/70 text-red-200 rounded-lg text-xs font-semibold hover:bg-red-900/90 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center w-full h-48 bg-[#0D1117] border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  uploading ? "border-[#E8923A] bg-[#E8923A]/5" : "border-[#21262D] hover:border-[#484F58]"
                }`}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-[#E8923A]"); }}
                onDragLeave={e => { e.currentTarget.classList.remove("border-[#E8923A]"); }}
                onDrop={async e => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-[#E8923A]");
                  const file = e.dataTransfer.files[0];
                  if (file) await handleFileUpload(file);
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (file) await handleFileUpload(file);
                  }}
                />
                {uploading ? (
                  <>
                    <Loader2 className="h-8 w-8 text-[#E8923A] animate-spin mb-2" />
                    <span className="text-sm text-[#E8923A] font-medium">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-[#484F58] mb-2" />
                    <span className="text-sm text-[#8B949E] font-medium">Drop image here or click to browse</span>
                    <span className="text-[10px] text-[#484F58] mt-1">2400×1000px ideal · JPEG/WebP · 15 MB max</span>
                  </>
                )}
              </label>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={async e => { const f = e.target.files?.[0]; if (f) await handleFileUpload(f); }} />
          </div>

          {/* Alt text — REQUIRED */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1">
                <Type className="h-3 w-3" />
                Alt Text <span className="text-red-400">*</span>
              </label>
              <div className="group relative">
                <Info className="h-3.5 w-3.5 text-[#484F58] cursor-help" />
                <div className="absolute right-0 top-5 w-64 p-3 bg-[#0D1117] border border-[#21262D] rounded-lg text-[10px] text-[#8B949E] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                  <p className="font-bold text-[#F0F6FC] mb-1">SEO alt text tips:</p>
                  <ul className="space-y-0.5">
                    <li>• Describe the scene: river, location, season, conditions</li>
                    <li>• Include keywords: "fly fishing", river name, state</li>
                    <li>• Be specific: "Fall brown trout fishing on the Madison River near Three Dollar Bridge" not "river photo"</li>
                    <li>• 80–125 characters is ideal for Google</li>
                  </ul>
                </div>
              </div>
            </div>
            <input
              type="text"
              value={altText}
              onChange={e => setAltText(e.target.value)}
              placeholder="e.g., Fly fishing the Madison River at sunset during fall caddis hatch, Montana"
              maxLength={200}
              className="w-full px-4 py-3 bg-[#0D1117] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#484F58] focus:outline-none focus:border-[#E8923A]"
            />
            <div className="flex justify-between mt-1">
              <span className={`text-[10px] ${altText.length >= 80 && altText.length <= 125 ? "text-[#2EA44F]" : altText.length > 0 ? "text-[#E8923A]" : "text-[#484F58]"}`}>
                {altText.length >= 80 && altText.length <= 125 ? "Perfect length for SEO" : altText.length > 125 ? "A bit long — aim for 80–125 chars" : "Aim for 80–125 characters"}
              </span>
              <span className="text-[10px] text-[#484F58]">{altText.length}/200</span>
            </div>
          </div>

          {/* Photo credit */}
          <div>
            <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1 mb-2">
              <Camera className="h-3 w-3" />
              Photo Credit <span className="text-[#484F58] font-normal normal-case">(optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <User className="h-2.5 w-2.5 text-[#484F58]" />
                  <span className="text-[10px] text-[#484F58]">Photographer</span>
                </div>
                <input
                  type="text"
                  value={credit}
                  onChange={e => setCredit(e.target.value)}
                  placeholder="Pat Ford Photography"
                  className="w-full px-3 py-2.5 bg-[#0D1117] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#484F58] focus:outline-none focus:border-[#E8923A]"
                />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <LinkIcon className="h-2.5 w-2.5 text-[#484F58]" />
                  <span className="text-[10px] text-[#484F58]">Portfolio URL</span>
                </div>
                <input
                  type="url"
                  value={creditUrl}
                  onChange={e => setCreditUrl(e.target.value)}
                  placeholder="https://patford.com"
                  className="w-full px-3 py-2.5 bg-[#0D1117] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#484F58] focus:outline-none focus:border-[#E8923A]"
                />
              </div>
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="px-4 py-3 bg-red-950/30 border border-red-800 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="px-4 py-3 bg-green-950/30 border border-green-800 rounded-lg text-sm text-green-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Saved! Reloading...
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !imageUrl || !altText.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#E8923A] text-white rounded-xl text-sm font-bold hover:bg-[#F0A65A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Hero Image
          </button>
        </div>
      </div>
    </div>
  );
}
