"use client";
/**
 * EditVariantModal — dialog for editing an existing variant's spec fields.
 *
 * Mirrors NewVariantModal's layout (size, bead material/weight/color, body
 * color, rib color) but pre-fills from the variant and calls
 * updateVariantAction instead of createVariantAction.
 *
 * Permission gating happens server-side: creator-only, admin-override.
 */
import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { updateVariantAction } from "@/app/flies/v2/actions";
import type { Variant } from "@/types/fly-v2";

interface Props {
  variant: Variant;
  patternSlug: string;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const BEAD_MATERIALS = ["tungsten", "brass", "glass", "none"] as const;

export default function EditVariantModal({ variant, patternSlug, open, onClose, onSaved }: Props) {
  const [size, setSize] = useState(variant.size ?? "");
  const [beadMaterial, setBeadMaterial] = useState<string>(variant.bead_material ?? "");
  const [beadWeight, setBeadWeight] = useState(variant.bead_weight_mm == null ? "" : String(variant.bead_weight_mm));
  const [beadColor, setBeadColor] = useState(variant.bead_color ?? "");
  const [bodyColor, setBodyColor] = useState(variant.body_color ?? "");
  const [ribColor, setRibColor] = useState(variant.rib_color ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const submit = () => {
    setError(null);
    if (!size.trim()) { setError("Size is required."); return; }
    startTransition(async () => {
      const r = await updateVariantAction({
        variant_id: variant.id,
        pattern_slug: patternSlug,
        size: size.trim(),
        bead_material: beadMaterial ? (beadMaterial as "tungsten" | "brass" | "glass" | "none") : null,
        bead_weight_mm: beadWeight ? parseFloat(beadWeight) : null,
        bead_color: beadColor ? beadColor : null,
        body_color: bodyColor ? bodyColor : null,
        rib_color: ribColor ? ribColor : null,
      });
      if (!r.ok) { setError(r.error ?? "Failed to save."); return; }
      onSaved?.();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-xl border border-[#21262D] bg-[#161B22] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#21262D] px-5 py-3">
          <h3 className="text-[#F0F6FC] font-semibold text-sm">Edit variant</h3>
          <button type="button" onClick={onClose} className="text-[#6E7681] hover:text-[#F0F6FC]" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E7681] mb-1">
              Size <span className="text-[#E8923A]">*</span>
            </label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              autoFocus
              className="w-full rounded-md border border-[#30363D] bg-[#0D1117] px-2.5 py-1.5 text-sm text-[#F0F6FC] focus:border-[#E8923A] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E7681] mb-1">
                Bead material
              </label>
              <select
                value={beadMaterial}
                onChange={(e) => setBeadMaterial(e.target.value)}
                className="w-full rounded-md border border-[#30363D] bg-[#0D1117] px-2.5 py-1.5 text-sm text-[#F0F6FC] focus:border-[#E8923A] outline-none"
              >
                <option value="">—</option>
                {BEAD_MATERIALS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E7681] mb-1">
                Bead weight (mm)
              </label>
              <input
                type="number"
                step="0.1"
                value={beadWeight}
                onChange={(e) => setBeadWeight(e.target.value)}
                placeholder="2.8"
                className="w-full rounded-md border border-[#30363D] bg-[#0D1117] px-2.5 py-1.5 text-sm text-[#F0F6FC] focus:border-[#E8923A] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E7681] mb-1">
              Bead color
            </label>
            <input
              type="text"
              value={beadColor}
              onChange={(e) => setBeadColor(e.target.value)}
              placeholder="silver, gold, copper, black, …"
              className="w-full rounded-md border border-[#30363D] bg-[#0D1117] px-2.5 py-1.5 text-sm text-[#F0F6FC] focus:border-[#E8923A] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E7681] mb-1">
                Body color
              </label>
              <input
                type="text"
                value={bodyColor}
                onChange={(e) => setBodyColor(e.target.value)}
                placeholder="olive, black, …"
                className="w-full rounded-md border border-[#30363D] bg-[#0D1117] px-2.5 py-1.5 text-sm text-[#F0F6FC] focus:border-[#E8923A] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E7681] mb-1">
                Rib color
              </label>
              <input
                type="text"
                value={ribColor}
                onChange={(e) => setRibColor(e.target.value)}
                placeholder="copper, red, …"
                className="w-full rounded-md border border-[#30363D] bg-[#0D1117] px-2.5 py-1.5 text-sm text-[#F0F6FC] focus:border-[#E8923A] outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-[#F87171]">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#21262D] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#1F2937]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="rounded-md bg-[#E8923A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#d17d28] disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
