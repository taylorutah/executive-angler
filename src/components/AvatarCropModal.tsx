"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Check } from "lucide-react";

interface Props {
  imageSrc: string;
  onSave: (blob: Blob) => void;
  onCancel: () => void;
}

function centerAspectCrop(width: number, height: number) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, 1, width, height),
    width,
    height
  );
}

export default function AvatarCropModal({ imageSrc, onSave, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [saving, setSaving] = useState(false);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setCrop(centerAspectCrop(naturalWidth, naturalHeight));
  }, []);

  async function handleSave() {
    if (!imgRef.current || !crop) return;
    setSaving(true);

    const img = imgRef.current;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const canvas = document.createElement("canvas");
    const size = 400; // output 400x400
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setSaving(false); return; }

    // crop coords in natural image pixels
    const cropX = (crop.unit === "%" ? (crop.x / 100) * img.width : crop.x) * scaleX;
    const cropY = (crop.unit === "%" ? (crop.y / 100) * img.height : crop.y) * scaleY;
    const cropW = (crop.unit === "%" ? (crop.width / 100) * img.width : crop.width) * scaleX;
    const cropH = (crop.unit === "%" ? (crop.height / 100) * img.height : crop.height) * scaleY;

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, size, size);

    canvas.toBlob(
      (blob) => {
        if (blob) onSave(blob);
        setSaving(false);
      },
      "image/jpeg",
      0.92
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#161B22] rounded-2xl border border-[#21262D] shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262D]">
          <div>
            <h2 className="text-sm font-bold text-[#F0F6FC]">Crop Profile Photo</h2>
            <p className="text-xs text-[#6E7681] mt-0.5">Drag to reposition · Resize the square</p>
          </div>
          <button onClick={onCancel} className="text-[#6E7681] hover:text-[#F0F6FC] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Crop area */}
        <div className="flex items-center justify-center bg-[#0D1117] p-4 min-h-64 max-h-96 overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            aspect={1}
            minWidth={60}
            className="max-h-80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              style={{ maxHeight: "320px", maxWidth: "100%", objectFit: "contain" }}
            />
          </ReactCrop>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 py-4 border-t border-[#21262D]">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-[#21262D] px-4 py-2.5 text-sm font-medium text-[#A8B2BD] hover:text-[#F0F6FC] hover:border-[#6E7681] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!crop || saving}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#E8923A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#E8923A]/80 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <><Check className="h-4 w-4" /> Use Photo</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
