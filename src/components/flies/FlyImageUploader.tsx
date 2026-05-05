"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import Image from "next/image";
import { Camera, Crop, Loader2, Upload, X, CheckCircle } from "lucide-react";

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

  const [cropMode, setCropMode] = useState(false);
  const [rawImageUrl, setRawImageUrl] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropProcessing, setCropProcessing] = useState(false);

  useEffect(() => {
    setPreviewUrl(existingUrl ?? null);
  }, [existingUrl]);

  useEffect(() => {
    return () => {
      if (lastBlobUrl.current) URL.revokeObjectURL(lastBlobUrl.current);
      if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
    };
  }, [rawImageUrl]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image (JPEG, PNG, or WebP)");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("Image too large. Maximum 15 MB.");
      return;
    }
    setError(null);

    const localUrl = URL.createObjectURL(file);
    setRawImageUrl(localUrl);
    setCropMode(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  async function handleCropConfirm() {
    if (!croppedAreaPixels || !rawImageUrl) return;
    setCropProcessing(true);
    setError(null);

    try {
      const blob = await getCroppedImage(rawImageUrl, croppedAreaPixels);
      const croppedFile = new File([blob], `fly-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      if (lastBlobUrl.current) URL.revokeObjectURL(lastBlobUrl.current);
      const newPreview = URL.createObjectURL(blob);
      lastBlobUrl.current = newPreview;
      setPreviewUrl(newPreview);

      onFileChange(croppedFile);

      URL.revokeObjectURL(rawImageUrl);
      setRawImageUrl("");
      setCropMode(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Crop failed");
    } finally {
      setCropProcessing(false);
    }
  }

  function handleCropCancel() {
    setCropMode(false);
    if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
    setRawImageUrl("");
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

  if (cropMode && rawImageUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-[#161B22] border-b border-[#21262D]">
          <div className="flex items-center gap-2">
            <Crop className="h-5 w-5 text-[#E8923A]" />
            <h2 className="text-sm font-bold text-[#F0F6FC]">Crop & Position</h2>
            <span className="text-[10px] text-[#6E7681] ml-2">
              Drag to reposition · Scroll to zoom
            </span>
          </div>
          <button
            type="button"
            onClick={handleCropCancel}
            className="text-[#6E7681] hover:text-[#F0F6FC]"
            aria-label="Cancel crop"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 relative">
          <Cropper
            image={rawImageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid
            cropShape="rect"
            style={{
              containerStyle: { background: "#000" },
              cropAreaStyle: { border: "2px solid #E8923A" },
            }}
          />
        </div>
        <div className="px-6 py-4 bg-[#161B22] border-t border-[#21262D]">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs text-[#A8B2BD]">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-[#E8923A]"
              aria-label="Zoom level"
            />
            <span className="text-xs text-[#A8B2BD] font-mono w-10 text-right">
              {zoom.toFixed(1)}×
            </span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCropCancel}
              className="flex-1 px-4 py-3 bg-[#21262D] text-[#F0F6FC] rounded-xl text-sm font-semibold hover:bg-[#2D333B] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCropConfirm}
              disabled={cropProcessing || !croppedAreaPixels}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#E8923A] text-white rounded-xl text-sm font-bold hover:bg-[#F0A65A] transition-colors disabled:opacity-50"
            >
              {cropProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {cropProcessing ? "Processing..." : "Apply Crop"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="space-y-3">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-[#21262D] bg-[#0D1117]">
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
        <label
          className="flex flex-col items-center justify-center w-full aspect-square bg-[#0D1117] border-2 border-dashed border-[#21262D] rounded-xl cursor-pointer hover:border-[#E8923A]/40 transition-colors"
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
            const f = e.dataTransfer.files[0];
            if (f) handleFileSelect(f);
          }}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
              e.target.value = "";
            }}
          />
          <Camera className="h-8 w-8 text-[#6E7681] mb-2" />
          <span className="text-sm text-[#A8B2BD] font-medium">
            Drop photo here or click to browse
          </span>
          <span className="text-[10px] text-[#6E7681] mt-1">
            Crop & zoom · 1:1 · JPEG/PNG/WebP · 15 MB max
          </span>
        </label>
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
        <p className="text-[10px] text-[#6E7681] flex items-center gap-1">
          <Upload className="h-3 w-3" /> 1:1 looks best in the fly box
        </p>
      ) : null}
    </div>
  );
}

async function getCroppedImage(imageSrc: string, area: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");

  const maxWidth = 1600;
  const scale = Math.min(maxWidth / area.width, 1);
  canvas.width = Math.round(area.width * scale);
  canvas.height = Math.round(area.height * scale);

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      "image/jpeg",
      0.85,
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}
