"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera, Upload, Loader2, Info,
  Image as ImageIcon, Type, User, Link as LinkIcon, Crop, X,
} from "lucide-react";
import ImageEditor, { validateImageFile } from "@/components/ui/ImageEditor";

export interface ImageFieldPatch {
  url?: string;
  alt?: string;
  credit?: string;
  creditUrl?: string;
}

interface ImageFieldProps {
  urlValue: string;
  altValue?: string;
  creditValue?: string;
  creditUrlValue?: string;
  onChange: (patch: ImageFieldPatch) => void;
  aspectRatio?: number;          // default 21/9
  showAlt?: boolean;             // default true
  showCredit?: boolean;          // default true
  submissionIdPrefix?: string;   // upload grouping — default "admin-image"
  uploadEndpoint?: string;       // default "/api/submissions/upload"
  label?: string;                // optional label above preview
}

export default function ImageField({
  urlValue,
  altValue,
  creditValue,
  creditUrlValue,
  onChange,
  aspectRatio = 21 / 9,
  showAlt = true,
  showCredit = true,
  submissionIdPrefix = "admin-image",
  uploadEndpoint = "/api/submissions/upload",
  label,
}: ImageFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);

  function handleFileSelect(file: File) {
    try {
      validateImageFile(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid image");
      return;
    }
    setError(null);
    setRawImageUrl(URL.createObjectURL(file));
  }

  async function handleEditorApply(blob: Blob) {
    if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
    setRawImageUrl(null);

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", blob, "cropped.jpg");
      formData.append(
        "submission_id",
        `${submissionIdPrefix}-${Date.now()}`,
      );
      const res = await fetch(uploadEndpoint, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");
      onChange({ url: result.url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleEditorCancel() {
    if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
    setRawImageUrl(null);
  }

  return (
    <div className="space-y-4">
      {label ? (
        <label className="text-xs font-bold text-[#A8B2BD] uppercase tracking-wider flex items-center gap-1">
          <ImageIcon className="h-3 w-3" />
          {label}
        </label>
      ) : null}

      {/* Image preview or drop zone */}
      {urlValue ? (
        <div className="relative rounded-xl overflow-hidden border border-[#21262D]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlValue}
            alt={altValue || "Preview"}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-2.5 py-1 bg-black/70 text-white rounded-lg text-xs font-semibold hover:bg-black/90 transition-colors flex items-center gap-1"
            >
              <Crop className="h-3 w-3" />
              Replace & Crop
            </button>
            <button
              type="button"
              onClick={() => onChange({ url: "" })}
              className="px-2.5 py-1 bg-red-900/70 text-red-200 rounded-lg text-xs font-semibold hover:bg-red-900/90 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center w-full h-48 bg-[#0D1117] border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
            uploading
              ? "border-[#E8923A] bg-[#E8923A]/5"
              : "border-[#21262D] hover:border-[#6E7681]"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("border-[#E8923A]");
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove("border-[#E8923A]");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("border-[#E8923A]");
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelect(file);
          }}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
              e.target.value = "";
            }}
          />
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-[#E8923A] animate-spin mb-2" />
              <span className="text-sm text-[#E8923A] font-medium">
                Uploading...
              </span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-[#6E7681] mb-2" />
              <span className="text-sm text-[#A8B2BD] font-medium">
                Drop image here or click to browse
              </span>
              <span className="text-[10px] text-[#6E7681] mt-1">
                Drag & crop · JPEG/PNG/WebP · 15 MB max
              </span>
            </>
          )}
        </label>
      )}

      {/* Hidden file input for Replace button */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileSelect(f);
          e.target.value = "";
        }}
      />

      <ImageEditor
        open={!!rawImageUrl}
        imageSrc={rawImageUrl ?? ""}
        aspect={aspectRatio}
        maxOutputPx={2400}
        title="Crop & position"
        onCancel={handleEditorCancel}
        onApply={handleEditorApply}
      />

      {/* Raw URL field — lets editors paste a URL or audit the stored value */}
      <div>
        <label className="text-[10px] font-semibold text-[#6E7681] uppercase tracking-wider block mb-1">
          URL
        </label>
        <input
          type="url"
          value={urlValue}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://… (or use upload above)"
          className="w-full px-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-lg text-xs text-[#A8B2BD] font-mono focus:outline-none focus:border-[#E8923A]"
        />
      </div>

      {/* Alt text */}
      {showAlt ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#A8B2BD] uppercase tracking-wider flex items-center gap-1">
              <Type className="h-3 w-3" />
              Alt Text
            </label>
            <AltTextTipsPopover />
          </div>
          <input
            type="text"
            value={altValue ?? ""}
            onChange={(e) => onChange({ alt: e.target.value })}
            placeholder="e.g., Fly fishing the Madison River at sunset, Montana"
            maxLength={200}
            className="w-full px-4 py-3 bg-[#0D1117] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]"
          />
          <div className="flex justify-between mt-1">
            <span
              className={`text-[10px] ${
                (altValue?.length ?? 0) >= 80 && (altValue?.length ?? 0) <= 125
                  ? "text-[#2EA44F]"
                  : (altValue?.length ?? 0) > 0
                  ? "text-[#E8923A]"
                  : "text-[#6E7681]"
              }`}
            >
              {(altValue?.length ?? 0) >= 80 && (altValue?.length ?? 0) <= 125
                ? "✓ Perfect length for SEO"
                : (altValue?.length ?? 0) > 125
                ? "A bit long — aim for 80–125"
                : "Aim for 80–125 characters"}
            </span>
            <span className="text-[10px] text-[#6E7681]">
              {altValue?.length ?? 0}/200
            </span>
          </div>
        </div>
      ) : null}

      {/* Credit */}
      {showCredit ? (
        <div>
          <label className="text-xs font-bold text-[#A8B2BD] uppercase tracking-wider flex items-center gap-1 mb-2">
            <Camera className="h-3 w-3" />
            Photo Credit{" "}
            <span className="text-[#6E7681] font-normal normal-case">(optional)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <User className="h-2.5 w-2.5 text-[#6E7681]" />
                <span className="text-[10px] text-[#6E7681]">Photographer</span>
              </div>
              <input
                type="text"
                value={creditValue ?? ""}
                onChange={(e) => onChange({ credit: e.target.value })}
                placeholder="Pat Ford Photography"
                className="w-full px-3 py-2.5 bg-[#0D1117] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]"
              />
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <LinkIcon className="h-2.5 w-2.5 text-[#6E7681]" />
                <span className="text-[10px] text-[#6E7681]">Portfolio URL</span>
              </div>
              <input
                type="url"
                value={creditUrlValue ?? ""}
                onChange={(e) => onChange({ creditUrl: e.target.value })}
                placeholder="https://patford.com"
                className="w-full px-3 py-2.5 bg-[#0D1117] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]"
              />
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="px-4 py-3 bg-red-950/30 border border-red-800 rounded-lg text-sm text-red-400">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function AltTextTipsPopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Hide alt text tips" : "Show alt text tips"}
        aria-expanded={open}
        className="text-[#6E7681] hover:text-[#F0F6FC] transition-colors p-0.5 -m-0.5"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-6 w-64 p-3 bg-[#0D1117] border border-[#21262D] rounded-lg text-[10px] text-[#A8B2BD] z-20 shadow-xl">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-bold text-[#F0F6FC]">SEO alt text tips:</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close tips"
              className="text-[#6E7681] hover:text-[#F0F6FC] -mt-0.5 -mr-0.5 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <ul className="space-y-0.5">
            <li>• Describe the scene: river, location, season</li>
            <li>• Include keywords: &quot;fly fishing&quot;, river name, state</li>
            <li>• 80–125 characters is ideal for Google</li>
          </ul>
        </div>
      )}
    </div>
  );
}

