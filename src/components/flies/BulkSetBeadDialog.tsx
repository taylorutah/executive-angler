"use client";

/**
 * BulkSetBeadDialog — set one bead spec across every bead-less variant of
 * a pattern in a single click. Used to backfill the migrated personal
 * patterns whose legacy `fly_patterns.bead_size` was empty.
 *
 * Posts to /api/flies/v2/patterns/<id>/apply-bead. Server skips variants
 * that already have a bead so existing per-variant edits aren't trampled.
 */
import { useState } from "react";
import { X, Loader2 } from "lucide-react";

type Material = "tungsten" | "brass" | "glass" | "none";
const MATERIALS: { value: Material; label: string }[] = [
  { value: "tungsten", label: "Tungsten" },
  { value: "brass",    label: "Brass" },
  { value: "glass",    label: "Glass" },
  { value: "none",     label: "No bead" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  /** v2 pattern id. */
  patternId: string;
  patternName: string;
  /** Number of variants currently without a bead — used to phrase the CTA. */
  beadlessCount: number;
  /** Called after a successful apply so the parent can refresh. */
  onApplied?: (updated: number) => void;
}

export default function BulkSetBeadDialog({
  open, onClose, patternId, patternName, beadlessCount, onApplied,
}: Props) {
  const [mm, setMm] = useState<string>("2.5");
  const [material, setMaterial] = useState<Material>("tungsten");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleApply() {
    setBusy(true);
    setError(null);
    const num = Number(mm);
    if (!Number.isFinite(num) || num <= 0 || num > 10) {
      setError("Bead size must be a positive number up to 10 mm.");
      setBusy(false);
      return;
    }
    try {
      const res = await fetch(`/api/flies/v2/patterns/${patternId}/apply-bead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mm: num, material }),
      });
      const data = (await res.json()) as { updated?: number; error?: string };
      if (!res.ok) {
        setError(data.error ?? `Apply failed (${res.status})`);
        setBusy(false);
        return;
      }
      onApplied?.(data.updated ?? 0);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-[#161B22] border border-[#21262D] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[#21262D]">
          <h3 className="text-sm font-semibold text-[#F0F6FC]">
            Set bead — {patternName}
          </h3>
          <button
            onClick={onClose}
            className="text-[#6E7681] hover:text-[#F0F6FC]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-3 space-y-3">
          <p className="text-xs text-[#A8B2BD]">
            Applies to <span className="font-semibold text-[#E8923A]">{beadlessCount}</span>{" "}
            variant{beadlessCount === 1 ? "" : "s"} that currently have no bead set.
            Variants that already have a bead are left alone.
          </p>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-1">
              Bead size (mm)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              value={mm}
              onChange={(e) => setMm(e.target.value)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-md px-2.5 py-1.5 text-sm text-[#F0F6FC] focus:outline-none focus:border-[#E8923A]/50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-1">
              Material
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {MATERIALS.map((m) => {
                const active = material === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMaterial(m.value)}
                    className={`text-xs py-1.5 rounded-md border transition-colors ${
                      active
                        ? "bg-[#E8923A] border-[#E8923A] text-[#0D1117] font-semibold"
                        : "bg-[#0D1117] border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/50"
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 pb-3 pt-1 border-t border-[#21262D]">
          <button
            onClick={onClose}
            disabled={busy}
            className="text-xs px-3 py-1.5 rounded-md text-[#A8B2BD] hover:bg-[#21262D]"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={busy || beadlessCount === 0}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-[#E8923A] text-[#0D1117] hover:bg-[#F2A04F] disabled:opacity-50"
          >
            {busy && <Loader2 className="h-3 w-3 animate-spin" />}
            Apply to {beadlessCount}
          </button>
        </div>
      </div>
    </div>
  );
}
