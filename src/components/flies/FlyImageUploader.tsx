"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Crop, Upload, X } from "lucide-react";
import ImageEditor, { validateImageFile } from "@/components/ui/ImageEditor";

interface FlyImageUploaderProps {
  existingUrl?: string | null;
  onFileChange: (file: File | null) => void;
}

export default function FlyImageUploader({
  existingUrl,
  onFileChange,
}: FlyImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl ?? null);
  const lastBlobUrl = useRef<string | null>(null);

  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);

  useEffect(() => {
    setPreviewUrl(existingUrl ?? null);
  }, [existingUrl]);

  useEffect(() => {
    return () => {
      if (lastBlobUrl.current) URL.revokeObjectURL(lastBlobUrl.current);
      if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
    };
  }, [rawImageUrl]);

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

  function handleEditorApply(blob: Blob) {
    if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
    setRawImageUrl(null);

    const croppedFile = new File([blob], `fly-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    if (lastBlobUrl.current) URL.revokeObjectURL(lastBlobUrl.current);
    const newPreview = URL.createObjectURL(blob);
    lastBlobUrl.current = newPreview;
    setPreviewUrl(newPreview);

    onFileChange(croppedFile);
  }

  function handleEditorCancel() {
    if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
    setRawImageUrl(null);
  }

  function handleRemove() {
    if (lastBlobUrl.current) {
      URL.revokeObjectURL(lastBlobUrl.current);
      lastBlobUrl.current = null;
    }
    setPreviewUrl(null);
    setError(null);
    onFileChange(null);
  }

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="space-y-3">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-[var(--border-rule)] bg-[var(--surface-page)]">
            <Image
              src={previewUrl}
              alt="Fly preview"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 340px"
              unoptimized={previewUrl.startsWith("blob:")}
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
                onClick={handleRemove}
                className="px-2.5 py-1 bg-red-900/70 text-red-200 rounded-lg text-xs font-semibold hover:bg-red-900/90 transition-colors"
                aria-label="Remove photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center w-full aspect-square bg-[var(--surface-page)] border-2 border-dashed border-[var(--border-rule)] rounded-xl cursor-pointer hover:border-[var(--action)]/40 transition-colors"
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("border-[var(--action)]");
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove("border-[var(--action)]");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("border-[var(--action)]");
            const f = e.dataTransfer.files[0];
            if (f) handleFileSelect(f);
          }}
        >
          <Camera className="h-8 w-8 text-[var(--text-meta)] mb-2" />
          <span className="text-sm text-[var(--text-body)] font-medium">
            Drop photo here or click to browse
          </span>
          <span className="text-[10px] text-[var(--text-meta)] mt-1">
            Crop · zoom · rotate · 1:1 · JPEG/PNG/WebP · 15 MB max
          </span>
        </button>
      )}

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

      {error ? (
        <div className="px-3 py-2 bg-red-950/30 border border-red-800 rounded-lg text-xs text-red-400">
          {error}
        </div>
      ) : null}

      {!previewUrl && !error ? (
        <p className="text-[10px] text-[var(--text-meta)] flex items-center gap-1">
          <Upload className="h-3 w-3" /> 1:1 looks best in the fly box
        </p>
      ) : null}

      <ImageEditor
        open={!!rawImageUrl}
        imageSrc={rawImageUrl ?? ""}
        aspect={1}
        maxOutputPx={1600}
        title="Crop fly photo"
        onCancel={handleEditorCancel}
        onApply={handleEditorApply}
      />
    </div>
  );
}
