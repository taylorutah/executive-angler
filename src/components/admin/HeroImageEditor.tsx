"use client";

import { useEffect, useState } from "react";
import {
  X, Save, Loader2, CheckCircle, Pencil, Image as ImageIcon,
} from "@/icons";
import ImageField, { type ImageFieldPatch } from "./ImageField";

interface HeroImageEditorProps {
  entityType: string;
  entityId: string;
  currentImageUrl?: string;
  currentAlt?: string;
  currentCredit?: string;
  currentCreditUrl?: string;
  /** Crop aspect ratio passed to ImageField. Defaults to 21/9. */
  aspectRatio?: number;
}

export default function HeroImageEditor({
  entityType,
  entityId,
  currentImageUrl,
  currentAlt,
  currentCredit,
  currentCreditUrl,
  aspectRatio = 21 / 9,
}: HeroImageEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl ?? "");
  const [altText, setAltText] = useState(currentAlt || "");
  const [credit, setCredit] = useState(currentCredit || "");
  const [creditUrl, setCreditUrl] = useState(currentCreditUrl || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear stale errors/success when the modal is re-opened so a failed save
  // from a previous session doesn't appear to be a fresh error on next open.
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  function applyPatch(patch: ImageFieldPatch) {
    // Any edit clears any stale error from a prior failed save attempt.
    if (error) setError(null);
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

    let stage = "init";
    try {
      const cleanCreditUrl = creditUrl.trim();
      if (cleanCreditUrl) {
        stage = "validate credit URL";
        try {
          new URL(cleanCreditUrl);
        } catch {
          throw new Error(
            `Photo credit URL isn't a valid URL: "${cleanCreditUrl}". Include https:// or leave blank.`,
          );
        }
      }

      stage = "validate image URL";
      try {
        new URL(imageUrl);
      } catch {
        throw new Error(
          `Stored image URL isn't a valid URL: "${imageUrl}". Re-upload the image or paste a fresh URL.`,
        );
      }

      stage = "serialize body";
      const body = JSON.stringify({
        entity_type: entityType,
        entity_id: entityId,
        hero_image_url: imageUrl,
        hero_image_alt: altText.trim(),
        hero_image_credit: credit.trim() || null,
        hero_image_credit_url: cleanCreditUrl || null,
      });

      stage = "fetch /api/admin/hero-image";
      const res = await fetch("/api/admin/hero-image", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
      });

      stage = `parse response (HTTP ${res.status})`;
      let result: { error?: string; success?: boolean } = {};
      try {
        result = await res.json();
      } catch {
        // Non-JSON response — fall through with res.ok check
      }
      if (!res.ok) {
        throw new Error(
          result.error || `Save failed (HTTP ${res.status})`,
        );
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
        window.location.reload();
      }, 1500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[HeroImageEditor] save failed at "${stage}":`, e, {
        entityType, entityId, imageUrl, altText, credit, creditUrl,
      });
      setError(`${msg} (stage: ${stage})`);
    }
    setSaving(false);
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ink)] text-[var(--paper)] rounded-full text-xs font-medium hover:opacity-90 transition-opacity duration-150 ease-standard"
        title="Edit hero image (admin)"
      >
        <Pencil className="h-3 w-3" />
        Edit Hero
      </button>
    );
  }

  return (
    <div
      className="ea-modal-overlay z-50 flex items-center justify-center p-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="ea-modal max-w-lg max-h-[90vh] overflow-y-auto p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="font-display text-lg font-semibold text-[var(--text-1)]">Edit Hero Image</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors duration-150 ease-standard"
            aria-label="Close"
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
            aspectRatio={aspectRatio}
          />

          {error ? (
            <div className="px-4 py-3 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-[var(--radius-md)] text-sm text-[var(--danger)]">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="px-4 py-3 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-[var(--radius-md)] text-sm text-[var(--success)] flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Saved! Reloading...
            </div>
          ) : null}

          <button
            onClick={handleSave}
            disabled={saving || !imageUrl || !altText.trim()}
            className="ea-btn ea-btn-primary w-full"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Hero Image
          </button>
        </div>
      </div>
    </div>
  );
}
