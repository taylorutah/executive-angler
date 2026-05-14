"use client";
/**
 * NewVariantModal — minimal dialog for adding a user-owned variant to a pattern.
 *
 * Required: size. Optional: bead material/weight/color, body color, rib color,
 * notes. Submits via createVariantAction; on success, closes + revalidates RSC.
 */
import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { createVariantAction } from "@/app/flies/v2/actions";
import type { ParsedBeadSpec } from "@/lib/flies/parseBeadSpec";

interface Props {
  patternId: string;
  patternSlug: string;
  open: boolean;
  onClose: () => void;
  /**
   * Default bead spec parsed from the parent pattern's base_materials.
   * Pre-fills the modal so users only need to type what they're varying.
   */
  defaultBeadSpec?: ParsedBeadSpec;
  /**
   * Admin viewers can flip the "Add as curated" switch to create a variant
   * with `created_by_user_id = null` — visible to everyone, not just them.
   * Default-on for admins so the catalog actually grows when admin uses this
   * modal; uncheck for a personal-only variant. Hidden entirely for non-admins
   * (server-side guard in createUserVariant downgrades the flag regardless).
   */
  isAdmin?: boolean;
}

const BEAD_MATERIALS = ["tungsten", "brass", "glass", "none"] as const;

export default function NewVariantModal({ patternId, patternSlug, open, onClose, defaultBeadSpec, isAdmin }: Props) {
  const [size, setSize] = useState("");
  const [beadMaterial, setBeadMaterial] = useState<string>(defaultBeadSpec?.material ?? "");
  const [beadWeight, setBeadWeight] = useState(defaultBeadSpec?.weight_mm != null ? String(defaultBeadSpec.weight_mm) : "");
  const [beadColor, setBeadColor] = useState(defaultBeadSpec?.color ?? "");
  const [bodyColor, setBodyColor] = useState("");
  const [ribColor, setRibColor] = useState("");
  // Default to curated when admin opens the modal — that's the entire point
  // of having the toggle here. They can uncheck for a personal-only variant.
  const [asCanonical, setAsCanonical] = useState<boolean>(!!isAdmin);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const reset = () => {
    setSize("");
    setBeadMaterial(defaultBeadSpec?.material ?? "");
    setBeadWeight(defaultBeadSpec?.weight_mm != null ? String(defaultBeadSpec.weight_mm) : "");
    setBeadColor(defaultBeadSpec?.color ?? "");
    setBodyColor(""); setRibColor(""); setError(null);
    setAsCanonical(!!isAdmin);
  };

  const submit = () => {
    setError(null);
    if (!size.trim()) { setError("Size is required."); return; }
    startTransition(async () => {
      const r = await createVariantAction({
        pattern_id: patternId,
        pattern_slug: patternSlug,
        size: size.trim(),
        bead_material: beadMaterial ? (beadMaterial as "tungsten" | "brass" | "glass" | "none") : undefined,
        bead_weight_mm: beadWeight ? parseFloat(beadWeight) : undefined,
        bead_color: beadColor || undefined,
        body_color: bodyColor || undefined,
        rib_color: ribColor || undefined,
        as_canonical: isAdmin ? asCanonical : undefined,
      });
      if (!r.ok) { setError(r.error ?? "Failed to create variant."); return; }
      reset();
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
          <h3 className="text-[#F0F6FC] font-semibold text-sm">Add variant</h3>
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
              placeholder="e.g. 16"
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

          {isAdmin && (
            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={asCanonical}
                onChange={(e) => setAsCanonical(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 rounded border-[#30363D] bg-[#0D1117] accent-[#E8923A]"
              />
              <span className="text-[11px] leading-snug text-[#A8B2BD]">
                <span className="text-[#F0F6FC] font-medium">Add as curated</span>
                <span className="text-[#6E7681]"> — visible to everyone (admin)</span>
              </span>
            </label>
          )}

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
            {isPending ? "Creating…" : "Add variant"}
          </button>
        </div>
      </div>
    </div>
  );
}
