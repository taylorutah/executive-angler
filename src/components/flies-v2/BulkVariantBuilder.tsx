"use client";
/**
 * BulkVariantBuilder — pick a size axis (and optional bead/body/weight axes),
 * preview the cartesian product, and create N variants in one transaction.
 * Optionally drop them all into a chosen fly box at a per-variant quantity in
 * the same submit.
 *
 * Used inside PatternEditDrawer's Variants tab and standalone from the
 * pattern header for admins/owners.
 */
import { useMemo, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { bulkCreateVariantsAction } from "@/app/flies/v2/actions";
import type { BeadMaterial, FlyBoxV2 } from "@/types/fly-v2";

interface Props {
  patternId: string;
  patternSlug: string;
  /** User's existing boxes (passed from server to avoid a fetch on open). */
  boxes: FlyBoxV2[];
  /** Whether the current user is admin (controls the as_canonical toggle). */
  isAdmin: boolean;
  /** Whether the parent pattern is canonical — only canonical accepts as_canonical. */
  patternIsCanonical: boolean;
  onCreated?: (count: number, addedToBox: number) => void;
}

const SIZE_PRESETS = ["8", "10", "12", "14", "16", "18", "20", "22", "24", "26"];
const BEAD_COLOR_PRESETS = ["copper", "black", "silver", "gold", "white", "red", "hot pink", "olive"];
const BODY_COLOR_PRESETS = ["olive", "black", "brown", "rust", "tan", "pink", "chartreuse", "white"];
const BEAD_WEIGHT_PRESETS = [1.5, 2.0, 2.5, 2.8, 3.2, 3.5, 4.0];
const BEAD_MATERIAL_OPTIONS: BeadMaterial[] = ["tungsten", "brass", "glass", "none"];

const chipBase =
  "inline-flex items-center px-2.5 h-7 rounded-full text-[12px] border transition-colors cursor-pointer select-none";
const chipOff =
  "border-[#30363D] bg-[#0D1117] text-[#A8B2BD] hover:border-[#484F58] hover:text-[#F0F6FC]";
const chipOn =
  "border-[#E8923A] bg-[rgba(232,146,58,0.15)] text-[#E8923A]";

function MultiChipPicker<T extends string | number>({
  label,
  presets,
  value,
  onChange,
  format,
  allowCustom = true,
  customPlaceholder,
}: {
  label: string;
  presets: readonly T[];
  value: T[];
  onChange: (next: T[]) => void;
  format?: (v: T) => string;
  allowCustom?: boolean;
  customPlaceholder?: string;
}) {
  const [custom, setCustom] = useState("");
  const selected = useMemo(() => new Set(value.map((v) => String(v))), [value]);
  const fmt = format ?? ((v: T) => String(v));

  const toggle = (v: T) => {
    if (selected.has(String(v))) {
      onChange(value.filter((x) => String(x) !== String(v)));
    } else {
      onChange([...value, v]);
    }
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (!trimmed) return;
    // Coerce: numbers stay numbers, everything else is a string preset
    const coerced = (typeof presets[0] === "number" ? Number(trimmed) : trimmed) as T;
    if (typeof coerced === "number" && Number.isNaN(coerced)) return;
    if (selected.has(String(coerced))) return;
    onChange([...value, coerced]);
    setCustom("");
  };

  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E7681] mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => {
          const on = selected.has(String(p));
          return (
            <button
              key={String(p)}
              type="button"
              onClick={() => toggle(p)}
              className={`${chipBase} ${on ? chipOn : chipOff}`}
            >
              {fmt(p)}
            </button>
          );
        })}
        {value
          .filter((v) => !presets.some((p) => String(p) === String(v)))
          .map((v) => (
            <span
              key={`custom-${String(v)}`}
              className={`${chipBase} ${chipOn}`}
            >
              {fmt(v)}
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => String(x) !== String(v)))}
                className="ml-1.5 text-current/70 hover:text-current"
                aria-label={`Remove ${fmt(v)}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        {allowCustom && (
          <div className="inline-flex items-center gap-1">
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder={customPlaceholder ?? "Add…"}
              className="h-7 w-24 rounded-full border border-[#30363D] bg-[#0D1117] px-2.5 text-[12px] text-[#F0F6FC] placeholder-[#484F58] outline-none focus:border-[#E8923A]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function BulkVariantBuilder({
  patternId,
  patternSlug,
  boxes,
  isAdmin,
  patternIsCanonical,
  onCreated,
}: Props) {
  const [sizes, setSizes] = useState<string[]>([]);
  const [showOptionalAxes, setShowOptionalAxes] = useState(false);
  const [beadColors, setBeadColors] = useState<string[]>([]);
  const [bodyColors, setBodyColors] = useState<string[]>([]);
  const [beadWeights, setBeadWeights] = useState<number[]>([]);
  const [beadMaterials, setBeadMaterials] = useState<BeadMaterial[]>([]);
  const [asCanonical, setAsCanonical] = useState(false);

  const [addToBox, setAddToBox] = useState(true);
  const [boxId, setBoxId] = useState<string>(boxes[0]?.id ?? "");
  const [qty, setQty] = useState(4);

  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ tone: "info" | "error"; msg: string } | null>(null);

  const variantCount = useMemo(() => {
    if (sizes.length === 0) return 0;
    const a = beadColors.length || 1;
    const b = bodyColors.length || 1;
    const c = beadWeights.length || 1;
    const d = beadMaterials.length || 1;
    return sizes.length * a * b * c * d;
  }, [sizes, beadColors, bodyColors, beadWeights, beadMaterials]);

  const needsConfirm = variantCount > 50;
  const confirmOk = !needsConfirm || confirmText.trim() === String(variantCount);

  const previewRows = useMemo(() => {
    if (sizes.length === 0) return [];
    const a = beadColors.length ? beadColors : [undefined];
    const b = bodyColors.length ? bodyColors : [undefined];
    const c = beadWeights.length ? beadWeights : [undefined];
    const d = beadMaterials.length ? beadMaterials : [undefined];
    const rows: { size: string; bead_color?: string; body_color?: string; bead_weight_mm?: number; bead_material?: BeadMaterial }[] = [];
    for (const size of sizes) {
      for (const bead_color of a) {
        for (const body_color of b) {
          for (const bead_weight_mm of c) {
            for (const bead_material of d) {
              rows.push({ size, bead_color, body_color, bead_weight_mm, bead_material });
              if (rows.length >= 25) return rows; // preview cap
            }
          }
        }
      }
    }
    return rows;
  }, [sizes, beadColors, bodyColors, beadWeights, beadMaterials]);

  const submit = () => {
    setStatus(null);
    if (sizes.length === 0) {
      setStatus({ tone: "error", msg: "Pick at least one size." });
      return;
    }
    if (!confirmOk) {
      setStatus({ tone: "error", msg: `Type ${variantCount} to confirm a large batch.` });
      return;
    }
    if (addToBox && !boxId) {
      setStatus({ tone: "error", msg: "Pick a box or turn off 'Also add to box'." });
      return;
    }
    startTransition(async () => {
      const result = await bulkCreateVariantsAction({
        pattern_id: patternId,
        pattern_slug: patternSlug,
        sizes,
        bead_colors: beadColors.length ? beadColors : undefined,
        body_colors: bodyColors.length ? bodyColors : undefined,
        bead_weights_mm: beadWeights.length ? beadWeights : undefined,
        bead_materials: beadMaterials.length ? beadMaterials : undefined,
        as_canonical: isAdmin && patternIsCanonical && asCanonical,
        add_to_box: addToBox && boxId
          ? { box_id: boxId, quantity_per_variant: Math.max(1, qty) }
          : undefined,
      });
      if (!result.ok) {
        setStatus({ tone: "error", msg: result.error ?? "Failed to create variants." });
        return;
      }
      const created = result.created ?? 0;
      const added = result.addedToBox ?? 0;
      setStatus({
        tone: "info",
        msg: addToBox
          ? `Created ${created} variant${created === 1 ? "" : "s"}, added ${added} to box.`
          : `Created ${created} variant${created === 1 ? "" : "s"}.`,
      });
      onCreated?.(created, added);
      // Clear sizes so the user can immediately do another batch.
      setSizes([]);
      setConfirmText("");
    });
  };

  return (
    <div className="space-y-5">
      <MultiChipPicker
        label="Sizes (required)"
        presets={SIZE_PRESETS}
        value={sizes}
        onChange={setSizes}
        customPlaceholder="Add size"
      />

      <button
        type="button"
        onClick={() => setShowOptionalAxes((v) => !v)}
        className="text-[11px] font-medium text-[#A8B2BD] hover:text-[#E8923A] transition-colors inline-flex items-center gap-1"
      >
        <Plus className="w-3 h-3" />
        {showOptionalAxes ? "Hide optional axes" : "Add optional axes (bead, body, weight…)"}
      </button>

      {showOptionalAxes && (
        <div className="space-y-4 rounded-md border border-[#21262D] bg-[#0D1117] p-3">
          <MultiChipPicker
            label="Bead colors"
            presets={BEAD_COLOR_PRESETS}
            value={beadColors}
            onChange={setBeadColors}
            customPlaceholder="Add color"
          />
          <MultiChipPicker
            label="Body colors"
            presets={BODY_COLOR_PRESETS}
            value={bodyColors}
            onChange={setBodyColors}
            customPlaceholder="Add color"
          />
          <MultiChipPicker
            label="Bead weights (mm)"
            presets={BEAD_WEIGHT_PRESETS}
            value={beadWeights}
            onChange={setBeadWeights}
            format={(n) => `${n}mm`}
            customPlaceholder="Add mm"
          />
          <MultiChipPicker<BeadMaterial>
            label="Bead materials"
            presets={BEAD_MATERIAL_OPTIONS}
            value={beadMaterials}
            onChange={setBeadMaterials}
            allowCustom={false}
          />
        </div>
      )}

      {/* Preview */}
      <div className="rounded-md border border-[#21262D] bg-[#161B22] p-3">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E7681]">
            Will create
          </span>
          <span className="text-[#E8923A] font-semibold text-base">
            {variantCount} variant{variantCount === 1 ? "" : "s"}
          </span>
        </div>
        {variantCount > 0 && (
          <div className="max-h-32 overflow-auto rounded border border-[#21262D] bg-[#0D1117]">
            <table className="w-full text-[11px] text-[#A8B2BD]">
              <thead className="text-[#6E7681] uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="text-left px-2 py-1">Size</th>
                  {beadColors.length > 0 && <th className="text-left px-2 py-1">Bead</th>}
                  {bodyColors.length > 0 && <th className="text-left px-2 py-1">Body</th>}
                  {beadWeights.length > 0 && <th className="text-left px-2 py-1">Wt</th>}
                  {beadMaterials.length > 0 && <th className="text-left px-2 py-1">Mat</th>}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((r, i) => (
                  <tr key={i} className="border-t border-[#21262D]">
                    <td className="px-2 py-0.5 font-mono text-[#F0F6FC]">{r.size}</td>
                    {beadColors.length > 0 && <td className="px-2 py-0.5">{r.bead_color}</td>}
                    {bodyColors.length > 0 && <td className="px-2 py-0.5">{r.body_color}</td>}
                    {beadWeights.length > 0 && <td className="px-2 py-0.5">{r.bead_weight_mm}mm</td>}
                    {beadMaterials.length > 0 && <td className="px-2 py-0.5">{r.bead_material}</td>}
                  </tr>
                ))}
                {variantCount > previewRows.length && (
                  <tr className="border-t border-[#21262D]">
                    <td colSpan={5} className="px-2 py-0.5 text-center text-[#6E7681] italic">
                      + {variantCount - previewRows.length} more…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {needsConfirm && (
          <div className="mt-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E7681] mb-1">
              Type <span className="text-[#E8923A]">{variantCount}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full rounded-md border border-[#30363D] bg-[#0D1117] px-2.5 py-1.5 text-sm text-[#F0F6FC] focus:border-[#E8923A] outline-none"
            />
          </div>
        )}
      </div>

      {/* Add to box */}
      <div className="rounded-md border border-[#21262D] bg-[#0D1117] p-3 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={addToBox}
            onChange={(e) => setAddToBox(e.target.checked)}
            className="rounded border-[#30363D] bg-[#0D1117] text-[#E8923A] h-4 w-4"
          />
          <span className="text-sm text-[#F0F6FC] font-medium">Also add to a fly box</span>
        </label>
        {addToBox && (
          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E7681] mb-1">
                Box
              </label>
              <select
                value={boxId}
                onChange={(e) => setBoxId(e.target.value)}
                className="w-full rounded-md border border-[#30363D] bg-[#0D1117] px-2.5 py-1.5 text-sm text-[#F0F6FC] focus:border-[#E8923A] outline-none"
              >
                {boxes.length === 0 && <option value="">No boxes — create one in /flies/boxes</option>}
                {boxes.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.tier})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E7681] mb-1">
                Qty / variant
              </label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
                className="w-full rounded-md border border-[#30363D] bg-[#0D1117] px-2.5 py-1.5 text-sm text-[#F0F6FC] focus:border-[#E8923A] outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Admin: produce as canonical (visible to all users, not user-private) */}
      {isAdmin && patternIsCanonical && (
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={asCanonical}
            onChange={(e) => setAsCanonical(e.target.checked)}
            className="mt-0.5 rounded border-[#30363D] bg-[#0D1117] text-[#E8923A] h-4 w-4"
          />
          <span className="text-xs text-[#A8B2BD]">
            <span className="text-[#F0F6FC] font-medium">Create as canonical</span>
            <span className="text-[#6E7681]"> — visible to all users in the library. Off = user-owned variants only you see.</span>
          </span>
        </label>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between gap-3">
        <div aria-live="polite" className="text-xs">
          {status && (
            <span className={status.tone === "error" ? "text-red-400" : "text-[#0BA5C7]"}>
              {status.msg}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={isPending || variantCount === 0 || !confirmOk}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#E8923A] px-4 py-2 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#d17d28] transition-colors"
        >
          {isPending
            ? "Creating…"
            : variantCount === 0
            ? "Pick sizes"
            : addToBox
            ? `Create ${variantCount} + add to box`
            : `Create ${variantCount} variant${variantCount === 1 ? "" : "s"}`}
        </button>
      </div>
    </div>
  );
}
