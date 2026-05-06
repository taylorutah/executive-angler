"use client";

/**
 * CustomFlyImageDropzone — Pro-gated personal photo upload for canonical flies.
 *
 * Renders an overlay on the canonical fly hero image when the viewer is in
 * "Yours" mode. Free users see a Pro lockup; Pro users get a button that
 * opens the file picker and uploads via PATCH /api/fly-box (multipart).
 *
 * Reuses the existing fly-pattern-images storage bucket, namespaced under
 * `{userId}/canonical-{flyId}/...`.
 */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Lock, X } from "lucide-react";

interface Props {
  canonicalFlyId: string;
  isPro: boolean;
  /** True if a custom photo is already set — switches button label. */
  hasCustomPhoto: boolean;
  /** Called after a successful upload OR removal so the parent can refresh. */
  onChanged?: () => void;
}

export default function CustomFlyImageDropzone({
  canonicalFlyId,
  isPro,
  hasCustomPhoto,
  onChanged,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState<null | "upload" | "remove">(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file) return;
    setBusy("upload");
    setError(null);
    try {
      const fd = new FormData();
      fd.append("canonical_fly_id", canonicalFlyId);
      fd.append("image", file);
      const res = await fetch("/api/fly-box", {
        method: "PATCH",
        body: fd,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Upload failed");
        return;
      }
      onChanged?.();
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(null);
    }
  }

  async function handleRemove() {
    setBusy("remove");
    setError(null);
    try {
      const res = await fetch("/api/fly-box", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canonical_fly_id: canonicalFlyId,
          custom_image_url: null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Couldn't remove");
        return;
      }
      onChanged?.();
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(null);
    }
  }

  if (!isPro) {
    return (
      <div
        className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/70 text-white text-[10px] font-semibold py-1.5"
        title="Pro feature — upload your own fly photo"
      >
        <Lock className="h-3 w-3" />
        Add your photo · Pro
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.currentTarget.value = "";
        }}
      />
      <div className="absolute inset-x-0 bottom-0 flex">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => inputRef.current?.click()}
          className="flex-1 inline-flex items-center justify-center gap-1 bg-black/70 hover:bg-[#E8923A] text-white text-[10px] font-semibold py-1.5 transition-colors disabled:opacity-60"
          title={hasCustomPhoto ? "Replace your fly photo" : "Upload your fly photo"}
        >
          {busy === "upload" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
          {hasCustomPhoto ? "Replace your photo" : "Add your photo"}
        </button>
        {hasCustomPhoto && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={handleRemove}
            className="px-2 bg-black/70 hover:bg-red-500/80 text-white py-1.5 transition-colors disabled:opacity-60"
            title="Remove your photo"
          >
            {busy === "remove" ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
          </button>
        )}
      </div>
      {error && (
        <div className="absolute -bottom-6 inset-x-0 text-[10px] text-red-400 text-center">
          {error}
        </div>
      )}
    </>
  );
}
