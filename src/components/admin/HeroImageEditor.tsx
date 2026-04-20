"use client";

import { useState } from "react";
import {
  X, Save, Loader2, CheckCircle, Pencil, Image as ImageIcon,
} from "lucide-react";
import ImageField, { type ImageFieldPatch } from "./ImageField";

interface HeroImageEditorProps {
  entityType: string;
  entityId: string;
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
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyPatch(patch: ImageFieldPatch) {
    if (patch.url !== undefined) setImageUrl(patch.url);
    if (patch.alt !== undefined) setAltText(patch.alt);
    if (patch.credit !== undefined) setCredit(patch.credit);
    if (patch.creditUrl !== undefined) setCreditUrl(patch.creditUrl);
  }

  async function handleSave() {
    if (!imageUrl) {
      setError("No image selected");
      return;
    }
    if (!altText.trim()) {
      setError("Alt text is required for SEO.");
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-[#161B22] border border-[#21262D] rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262D]">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[#E8923A]" />
            <h2 className="text-base font-bold text-[#F0F6FC]">Edit Hero Image</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#6E7681] hover:text-[#F0F6FC]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <ImageField
            urlValue={imageUrl}
            altValue={altText}
            creditValue={credit}
            creditUrlValue={creditUrl}
            onChange={applyPatch}
            submissionIdPrefix={`hero-${entityType}-${entityId}`}
            aspectRatio={21 / 9}
          />

          {error ? (
            <div className="px-4 py-3 bg-red-950/30 border border-red-800 rounded-lg text-sm text-red-400">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="px-4 py-3 bg-green-950/30 border border-green-800 rounded-lg text-sm text-green-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Saved! Reloading...
            </div>
          ) : null}

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
