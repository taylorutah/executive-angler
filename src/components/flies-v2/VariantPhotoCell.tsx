"use client";
/**
 * VariantPhotoCell — primary photo display with drag-drop / click upload.
 *
 * No photo: dashed placeholder with "+" icon. Click or drag-drop a file to
 * upload. While uploading: spinner + 60% opacity. After upload: revalidates
 * the page so the new primary photo renders.
 *
 * Used in VariantTable's photo column.
 */
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { uploadVariantPhotoAction } from "@/app/flies/v2/actions";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://qlasxtfbodyxbcuchvxz.supabase.co";

interface Props {
  variantId: string;
  patternSlug: string;
  /** Existing primary photo storage path. */
  storagePath?: string | null;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

export default function VariantPhotoCell({ variantId, patternSlug, storagePath }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [optimisticUrl, setOptimisticUrl] = useState<string | null>(null);

  const url = optimisticUrl
    ?? (storagePath ? `${SUPABASE_URL}/storage/v1/object/public/variant-photos/${storagePath}` : null);

  const upload = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Image only.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Over 10 MB.");
      return;
    }

    // Optimistic preview from local FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      const r = e.target?.result;
      if (typeof r === "string") setOptimisticUrl(r);
    };
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("variant_id", variantId);
    fd.append("pattern_slug", patternSlug);

    startTransition(async () => {
      const r = await uploadVariantPhotoAction(fd);
      if (!r.ok) {
        setOptimisticUrl(null);
        setError(r.error ?? "Upload failed.");
        setTimeout(() => setError(null), 3000);
      }
      // On success: server action revalidates the page; the next render
      // shows the real public URL. Optimistic URL clears naturally.
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileRef.current?.click();
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={onClick}
      title={url ? "Drop or click to replace" : "Drop or click to upload"}
      className={`relative h-8 w-8 cursor-pointer overflow-hidden rounded transition-all ${
        dragging
          ? "ring-2 ring-[#E8923A] ring-offset-1 ring-offset-[#0D1117]"
          : "ring-0"
      } ${pending ? "opacity-60" : ""}`}
    >
      {url ? (
        <>
          <Image src={url} alt="" fill sizes="32px" className="object-cover" unoptimized={url.startsWith("data:")} />
          {pending && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="font-['IBM_Plex_Mono'] text-[8px] text-white">…</span>
            </div>
          )}
        </>
      ) : (
        <div className={`h-full w-full flex items-center justify-center text-[12px] ${
          dragging ? "bg-[#E8923A]/10 text-[#E8923A]" : "bg-[#161B22] text-[#484F58] hover:bg-[#1F2937]"
        }`}>
          {pending ? "…" : "+"}
        </div>
      )}
      {error && (
        <div className="absolute -top-7 left-0 z-10 rounded bg-[#7F1D1D] px-1.5 py-0.5 text-[10px] text-white whitespace-nowrap shadow-lg">
          {error}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = ""; // allow re-uploading same file
        }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
