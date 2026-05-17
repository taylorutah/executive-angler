"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import {
  CheckCircle,
  Crop as CropIcon,
  FlipHorizontal,
  Loader2,
  RotateCcw,
  RotateCw,
  Undo2,
  X,
} from "lucide-react";

export interface ImageEditorProps {
  open: boolean;
  imageSrc: string;
  /** Aspect ratio (number) or "free" for unconstrained crop. */
  aspect: number | "free";
  /** Longest edge of exported image, in pixels. */
  maxOutputPx?: number;
  outputQuality?: number;
  outputType?: "image/jpeg" | "image/webp";
  cropShape?: "rect" | "round";
  /** Optional title shown in modal header. */
  title?: string;
  onCancel: () => void;
  onApply: (blob: Blob, dataUrl: string) => void;
}

const DEFAULT_MAX = 1600;

export default function ImageEditor({
  open,
  imageSrc,
  aspect,
  maxOutputPx = DEFAULT_MAX,
  outputQuality = 0.9,
  outputType = "image/jpeg",
  cropShape = "rect",
  title = "Crop & Position",
  onCancel,
  onApply,
}: ImageEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState(false);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [naturalAspect, setNaturalAspect] = useState<number>(1);

  // Reset state whenever a new image is loaded.
  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlip(false);
    setError(null);
    setCroppedArea(null);
  }, [open, imageSrc]);

  // Detect intrinsic aspect for "free" mode so the crop frame defaults to the
  // image's natural shape instead of a forced square.
  useEffect(() => {
    if (!open || aspect !== "free" || !imageSrc) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setNaturalAspect(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = imageSrc;
  }, [open, aspect, imageSrc]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  const apply = useCallback(async () => {
    if (!croppedArea) return;
    setProcessing(true);
    setError(null);
    try {
      const blob = await exportCrop(imageSrc, croppedArea, {
        rotation,
        flip,
        maxOutputPx,
        outputQuality,
        outputType,
      });
      const dataUrl = URL.createObjectURL(blob);
      onApply(blob, dataUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Crop failed");
    } finally {
      setProcessing(false);
    }
  }, [
    croppedArea,
    imageSrc,
    rotation,
    flip,
    maxOutputPx,
    outputQuality,
    outputType,
    onApply,
  ]);

  // Keyboard: Esc cancel, Enter apply, R rotate CW, Shift+R rotate CCW, F flip.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (!processing && croppedArea) apply();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        setRotation((r) => (e.shiftKey ? r - 90 : r + 90));
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setFlip((f) => !f);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel, apply, processing, croppedArea]);

  if (!open || typeof document === "undefined") return null;

  const effectiveAspect = aspect === "free" ? naturalAspect : aspect;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-4xl max-h-[calc(100vh-1.5rem)] flex flex-col bg-[#161B22] rounded-2xl overflow-hidden border border-[#21262D] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262D] flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <CropIcon className="h-5 w-5 text-[#E8923A] flex-shrink-0" />
            <h2 className="text-sm font-bold text-[#F0F6FC] truncate">{title}</h2>
            <span className="hidden sm:inline text-[10px] text-[#6E7681] ml-2">
              Drag · Scroll to zoom · R rotate · F flip
            </span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-[#6E7681] hover:text-[#F0F6FC] flex-shrink-0"
            aria-label="Cancel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Crop canvas — sized to a generous viewing area, NOT the target crop
            aspect. react-easy-crop overlays the crop frame at `aspect` on top
            of the image, so a portrait source on a 21:9 hero crop still
            renders the full image at usable size. */}
        <div
          className="relative w-full bg-black flex-shrink-0"
          style={{ height: "min(65vh, 560px)" }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={
              effectiveAspect && Number.isFinite(effectiveAspect) && effectiveAspect > 0
                ? effectiveAspect
                : 1
            }
            cropShape={cropShape}
            transform={`translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom}) scaleX(${flip ? -1 : 1})`}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            showGrid
            style={{
              containerStyle: { background: "#000" },
              cropAreaStyle: { border: "2px solid #E8923A" },
            }}
          />
        </div>

        {/* Controls */}
        <div className="px-4 py-3 border-t border-[#21262D] flex-shrink-0 space-y-3">
          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#A8B2BD] w-10">Zoom</span>
            <input
              type="range"
              min={1}
              max={4}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-[#E8923A]"
              aria-label="Zoom level"
            />
            <span className="text-xs text-[#A8B2BD] font-mono w-12 text-right">
              {zoom.toFixed(2)}×
            </span>
          </div>

          {/* Transform buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <ToolButton
              onClick={() => setRotation((r) => r - 90)}
              label="Rotate left 90°"
            >
              <RotateCcw className="h-4 w-4" />
            </ToolButton>
            <ToolButton
              onClick={() => setRotation((r) => r + 90)}
              label="Rotate right 90°"
            >
              <RotateCw className="h-4 w-4" />
            </ToolButton>
            <ToolButton
              onClick={() => setFlip((f) => !f)}
              label="Flip horizontal"
              active={flip}
            >
              <FlipHorizontal className="h-4 w-4" />
            </ToolButton>
            <ToolButton
              onClick={() => {
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setRotation(0);
                setFlip(false);
              }}
              label="Reset all transforms"
            >
              <Undo2 className="h-4 w-4" />
              <span className="text-xs ml-1">Reset</span>
            </ToolButton>
          </div>

          {error ? (
            <div className="px-3 py-2 bg-red-950/30 border border-red-800 rounded-lg text-xs text-red-400">
              {error}
            </div>
          ) : null}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-[#21262D] text-[#F0F6FC] rounded-xl text-sm font-semibold hover:bg-[#2D333B] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={apply}
              disabled={processing || !croppedArea}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E8923A] text-white rounded-xl text-sm font-bold hover:bg-[#F0A65A] transition-colors disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {processing ? "Processing…" : "Apply"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ToolButton({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex items-center px-2.5 py-1.5 rounded-lg border text-[#F0F6FC] transition-colors ${
        active
          ? "border-[#E8923A] bg-[#E8923A]/15 text-[#E8923A]"
          : "border-[#21262D] bg-[#0D1117] hover:border-[#E8923A]/50 hover:text-[#E8923A]"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* File validation + crop export                                          */
/* ---------------------------------------------------------------------- */

const HEIC_TYPES = new Set(["image/heic", "image/heif"]);

export interface ValidateImageOptions {
  /** Maximum file size in bytes. Default 15 MB. */
  maxSizeBytes?: number;
  /** Accepted MIME types. Default JPEG/PNG/WebP. */
  acceptedTypes?: string[];
}

/**
 * Validates a user-selected image before opening the editor. Throws a friendly
 * Error on rejection — caller catches it and surfaces the message.
 */
export function validateImageFile(
  file: File,
  opts: ValidateImageOptions = {},
): void {
  const maxSize = opts.maxSizeBytes ?? 15 * 1024 * 1024;
  const accepted =
    opts.acceptedTypes ?? ["image/jpeg", "image/png", "image/webp"];

  // Treat HEIC specially — phones default to it but browsers can't decode it.
  if (HEIC_TYPES.has(file.type)) {
    throw new Error(
      "HEIC isn't supported in the browser yet. On iPhone: Settings → Camera → Formats → Most Compatible, or share the photo (which auto-converts to JPEG).",
    );
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (JPEG, PNG, or WebP).");
  }
  if (accepted.length && !accepted.includes(file.type)) {
    throw new Error(
      `That image type isn't supported. Try JPEG, PNG, or WebP.`,
    );
  }
  if (file.size > maxSize) {
    const actualMb = (file.size / (1024 * 1024)).toFixed(1);
    const limitMb = Math.round(maxSize / (1024 * 1024));
    throw new Error(`Image is ${actualMb} MB — max is ${limitMb} MB.`);
  }
}

interface ExportOpts {
  rotation: number;
  flip: boolean;
  maxOutputPx: number;
  outputQuality: number;
  outputType: "image/jpeg" | "image/webp";
}

async function exportCrop(
  imageSrc: string,
  area: Area,
  opts: ExportOpts,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const { rotation, flip, maxOutputPx, outputQuality, outputType } = opts;

  const rad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));

  // Render the rotated/flipped image to a working canvas, then read out the
  // crop region. This keeps coordinates sane regardless of rotation step.
  const rotatedW = image.width * cos + image.height * sin;
  const rotatedH = image.width * sin + image.height * cos;

  const work = document.createElement("canvas");
  work.width = Math.round(rotatedW);
  work.height = Math.round(rotatedH);
  const wctx = work.getContext("2d");
  if (!wctx) throw new Error("Canvas unavailable");

  wctx.translate(rotatedW / 2, rotatedH / 2);
  wctx.rotate(rad);
  wctx.scale(flip ? -1 : 1, 1);
  wctx.drawImage(image, -image.width / 2, -image.height / 2);

  // Now read the cropped region (coords are in rotated-image space, which is
  // exactly what react-easy-crop reports).
  const out = document.createElement("canvas");
  const longest = Math.max(area.width, area.height);
  const scale = longest > maxOutputPx ? maxOutputPx / longest : 1;
  out.width = Math.max(1, Math.round(area.width * scale));
  out.height = Math.max(1, Math.round(area.height * scale));
  const octx = out.getContext("2d");
  if (!octx) throw new Error("Canvas unavailable");

  octx.drawImage(
    work,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    out.width,
    out.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    out.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Couldn't export crop")),
      outputType,
      outputQuality,
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () =>
      reject(new Error("Image couldn't be loaded")),
    );
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}
