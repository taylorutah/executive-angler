"use client";
/**
 * TyingStepsEditor — controlled list editor for fly_patterns_v2.tying_steps.
 *
 * Each step:
 *   - body (required textarea)
 *   - tip (optional one-liner)
 *   - image_url (uploaded via uploadTyingStepPhotoAction)
 *
 * Drag handles use native HTML5 drag-and-drop (matches RecipeBuilder.tsx).
 * The editor renormalizes step numbers on every change so the array index
 * always matches `step.step`.
 */
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { GripVertical, Plus, Trash2, Upload, X } from "lucide-react";
import { uploadTyingStepPhotoAction } from "@/app/flies/v2/actions";
import type { TyingStep } from "@/types/fly-v2";

interface Props {
  patternId: string;
  value: TyingStep[];
  onChange: (next: TyingStep[]) => void;
}

function renumber(steps: TyingStep[]): TyingStep[] {
  return steps.map((s, i) => ({ ...s, step: i + 1 }));
}

export default function TyingStepsEditor({ patternId, value, onChange }: Props) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});

  const update = (idx: number, patch: Partial<TyingStep>) => {
    const next = [...value];
    next[idx] = { ...next[idx], ...patch };
    onChange(renumber(next));
  };

  const remove = (idx: number) => {
    onChange(renumber(value.filter((_, i) => i !== idx)));
  };

  const add = () => {
    onChange(renumber([...value, { step: value.length + 1, body: "" }]));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(renumber(next));
  };

  const onDragStart = (idx: number) => setDragIdx(idx);
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      move(dragIdx, idx);
      setDragIdx(idx);
    }
  };
  const onDragEnd = () => setDragIdx(null);

  const handleFile = (idx: number, file: File) => {
    setError(null);
    if (file.size > 5 * 1024 * 1024) {
      setError("File over 5 MB.");
      return;
    }
    setUploading(idx);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("pattern_id", patternId);
      const result = await uploadTyingStepPhotoAction(fd);
      setUploading(null);
      if (!result.ok || !result.url) {
        setError(result.error ?? "Upload failed.");
        return;
      }
      update(idx, { image_url: result.url });
    });
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      {value.length === 0 && (
        <div className="rounded-md border border-dashed border-[#30363D] bg-[#0D1117] px-4 py-6 text-center text-sm text-[#6E7681]">
          No tying steps yet. Add the first step below.
        </div>
      )}

      {value.map((step, idx) => (
        <div
          key={idx}
          draggable
          onDragStart={() => onDragStart(idx)}
          onDragOver={(e) => onDragOver(e, idx)}
          onDragEnd={onDragEnd}
          className={`grid grid-cols-[24px_36px_1fr_72px_24px] gap-2 items-start rounded-md border border-[#21262D] bg-[#161B22] p-3 ${
            dragIdx === idx ? "opacity-60 ring-1 ring-[#E8923A]" : ""
          }`}
        >
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing text-[#484F58] hover:text-[#A8B2BD] mt-1"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <div className="text-center font-mono text-sm text-[#0BA5C7] mt-1">
            {step.step}
          </div>

          <div className="space-y-1.5 min-w-0">
            <textarea
              value={step.body}
              onChange={(e) => update(idx, { body: e.target.value })}
              placeholder="Describe this step…"
              rows={2}
              className="w-full rounded-md border border-[#30363D] bg-[#0D1117] px-2.5 py-1.5 text-sm text-[#F0F6FC] placeholder-[#484F58] focus:border-[#E8923A] outline-none resize-y min-h-[44px]"
            />
            <input
              type="text"
              value={step.tip ?? ""}
              onChange={(e) => update(idx, { tip: e.target.value || undefined })}
              placeholder="Optional tip (60-character pinch, sparse dub…)"
              className="w-full rounded-md border border-[#30363D] bg-[#0D1117] px-2.5 py-1 text-xs text-[#A8B2BD] placeholder-[#484F58] focus:border-[#E8923A] outline-none"
            />
          </div>

          {/* Photo cell */}
          <div className="relative h-[72px] w-[72px] rounded-md overflow-hidden border border-dashed border-[#30363D] bg-[#0D1117] group">
            {step.image_url ? (
              <>
                <Image
                  src={step.image_url}
                  alt={`Step ${step.step}`}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => update(idx, { image_url: undefined })}
                  className="absolute top-0.5 right-0.5 rounded-full bg-black/70 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputs.current[idx]?.click()}
                className="h-full w-full flex flex-col items-center justify-center text-[#484F58] hover:text-[#E8923A] transition-colors"
              >
                {uploading === idx ? (
                  <span className="text-[9px]">Uploading…</span>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mb-0.5" />
                    <span className="text-[9px]">Photo</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={(el) => {
                fileInputs.current[idx] = el;
              }}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(idx, f);
                e.target.value = "";
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => remove(idx)}
            className="text-[#484F58] hover:text-red-400 transition-colors mt-1"
            aria-label="Delete step"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="w-full rounded-md border border-dashed border-[#30363D] bg-[#0D1117] px-3 py-2 text-xs font-medium text-[#A8B2BD] hover:border-[#E8923A] hover:text-[#E8923A] transition-colors inline-flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        Add step
      </button>
    </div>
  );
}
