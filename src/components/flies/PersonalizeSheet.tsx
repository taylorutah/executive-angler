"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Loader2, Plus, Check } from "lucide-react";

/**
 * Personalize sheet — slides in from the right when an angler wants to
 * record their specific recipe choices for a canonical fly. The canonical
 * supplies option ranges (sizes, bead_options, hook_styles, colors) and a
 * materials_list; we render an editable row per slot. Personalizations are
 * stored as a free-form jsonb keyed by slot name on user_fly_box.
 */

export interface PersonalizeSheetCanonicalFly {
  id: string;
  name: string;
  category: string;
  sizes?: string[];
  colors?: string[];
  beadOptions?: string[];
  hookStyles?: string[];
  materialsList?: { material: string; description?: string }[];
}

export interface Personalizations {
  [slot: string]: Record<string, string | undefined> | undefined;
}

interface Props {
  open: boolean;
  fly: PersonalizeSheetCanonicalFly;
  initialPersonalizations?: Personalizations;
  initialPreferredSizes?: string[];
  isInBox: boolean;
  onClose: () => void;
  onSaved: (next: { personalizations: Personalizations; preferredSizes: string[] }) => void;
}

// Heuristic — pick the slot key for a material row from its label.
// "BEAD", "Bead", "Tungsten Slotted Bead 2.0mm Copper" all bucket as "bead".
function slotKeyFor(material: string): string {
  const lower = (material || "").toLowerCase();
  for (const slot of ["hook", "bead", "thread", "body", "tail", "wing", "hackle", "rib", "tag", "wingcase", "wing case", "hot spot", "hotspot", "collar", "dubbing"]) {
    if (lower.includes(slot)) return slot.replace(/\s+/g, "_");
  }
  return lower.split(/\s+/)[0] || "material";
}

export default function PersonalizeSheet({
  open,
  fly,
  initialPersonalizations,
  initialPreferredSizes,
  isInBox,
  onClose,
  onSaved,
}: Props) {
  const [personalizations, setPersonalizations] = useState<Personalizations>(initialPersonalizations ?? {});
  const [preferredSizes, setPreferredSizes] = useState<string[]>(initialPreferredSizes ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPersonalizations(initialPersonalizations ?? {});
      setPreferredSizes(initialPreferredSizes ?? []);
      setError(null);
    }
  }, [open, initialPersonalizations, initialPreferredSizes]);

  // Build the rows: one per material in the canonical's materials_list,
  // deduped by slot. If no materials_list, fall back to a basic set.
  const rows = useMemo(() => {
    const list = fly.materialsList?.length ? fly.materialsList : [
      { material: "Hook" }, { material: "Bead" }, { material: "Thread" }, { material: "Body" },
    ];
    const seen = new Set<string>();
    return list
      .map((m) => ({ slot: slotKeyFor(m.material), label: m.material, defaultValue: m.description ?? "" }))
      .filter((r) => {
        if (seen.has(r.slot)) return false;
        seen.add(r.slot);
        return true;
      });
  }, [fly.materialsList]);

  function updateSlot(slot: string, key: string, value: string) {
    setPersonalizations((prev) => {
      const next: Personalizations = { ...prev };
      const slotData: Record<string, string | undefined> = { ...(next[slot] ?? {}) };
      if (value.trim() === "") delete slotData[key];
      else slotData[key] = value.trim();
      if (Object.keys(slotData).length === 0) delete next[slot];
      else next[slot] = slotData;
      return next;
    });
  }

  function toggleSize(size: string) {
    setPreferredSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const method = isInBox ? "PATCH" : "POST";
      const res = await fetch("/api/fly-box", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canonical_fly_id: fly.id,
          personalizations,
          preferred_sizes: preferredSizes.length ? preferredSizes : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Save failed");
        return;
      }
      onSaved({ personalizations, preferredSizes });
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="flex-1 bg-black/60 backdrop-blur-sm"
      />

      {/* Drawer */}
      <div className="w-full max-w-md bg-[#0D1117] border-l border-[#21262D] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262D]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#E8923A]">
              {isInBox ? "Edit your version" : "Personalize"}
            </p>
            <h2 className="font-heading text-xl text-[#F0F6FC]">{fly.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#161B22] rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <p className="text-xs text-[#6E7681]">
            Record your hook brand, bead specifics, thread color and more. Same fly — your specs.
            Updates anytime; missing fields fall back to the canonical recipe.
          </p>

          {/* Sizes you tie */}
          {fly.sizes && fly.sizes.length > 0 && (
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-2">
                Sizes you tie
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {fly.sizes.map((s) => {
                  const active = preferredSizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`px-2.5 py-1 rounded-full text-xs font-mono transition-colors ${
                        active
                          ? "bg-[#E8923A] text-white"
                          : "bg-[#161B22] border border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/50"
                      }`}
                    >
                      {active && <Check className="inline h-3 w-3 mr-0.5" />}
                      {s}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Material rows */}
          {rows.map((row) => (
            <SlotRow
              key={row.slot}
              slot={row.slot}
              label={row.label}
              canonicalDefault={row.defaultValue}
              value={personalizations[row.slot] ?? {}}
              hookStyles={row.slot === "hook" ? fly.hookStyles : undefined}
              beadOptions={row.slot === "bead" ? fly.beadOptions : undefined}
              colors={row.slot === "body" || row.slot === "thread" ? fly.colors : undefined}
              onUpdate={(key, value) => updateSlot(row.slot, key, value)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#21262D] bg-[#0D1117]">
          {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-[#21262D] text-sm text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#161B22] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-[2] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#E8923A] text-white text-sm font-semibold hover:bg-[#F0A65A] disabled:opacity-60 transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isInBox ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isInBox ? "Save changes" : "Save to my fly box"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlotRow({
  slot,
  label,
  canonicalDefault,
  value,
  hookStyles,
  beadOptions,
  colors,
  onUpdate,
}: {
  slot: string;
  label: string;
  canonicalDefault: string;
  value: Record<string, string | undefined>;
  hookStyles?: string[];
  beadOptions?: string[];
  colors?: string[];
  onUpdate: (key: string, value: string) => void;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD]">{slot.replace(/_/g, " ")}</h3>
        {canonicalDefault && (
          <span className="text-[10px] text-[#6E7681] truncate max-w-[60%]" title={canonicalDefault}>
            default: {canonicalDefault}
          </span>
        )}
      </div>

      {/* Style/option chips when canonical provides them */}
      {(hookStyles || beadOptions) && (
        <div className="flex flex-wrap gap-1.5">
          {(hookStyles || beadOptions || []).map((opt) => {
            const key = hookStyles ? "style" : "size";
            const active = value[key] === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onUpdate(key, active ? "" : opt)}
                className={`px-2 py-0.5 rounded-full text-[11px] transition-colors ${
                  active
                    ? "bg-[#E8923A] text-white"
                    : "bg-[#161B22] border border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/50"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Color chips when relevant */}
      {colors && colors.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {colors.map((c) => {
            const active = value.color === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => onUpdate("color", active ? "" : c)}
                className={`px-2 py-0.5 rounded-full text-[11px] capitalize transition-colors ${
                  active
                    ? "bg-[#E8923A] text-white"
                    : "bg-[#161B22] border border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/50"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {/* Free-text fields */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="brand"
          value={value.brand ?? ""}
          onChange={(e) => onUpdate("brand", e.target.value)}
          className="bg-[#161B22] border border-[#21262D] rounded px-2 py-1.5 text-xs text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
        />
        <input
          type="text"
          placeholder={slot === "bead" ? "size (e.g. 2.0mm)" : slot === "thread" ? "denier (e.g. 30D)" : "model / detail"}
          value={value.model ?? value.size ?? value.denier ?? ""}
          onChange={(e) => onUpdate(slot === "bead" ? "size" : slot === "thread" ? "denier" : "model", e.target.value)}
          className="bg-[#161B22] border border-[#21262D] rounded px-2 py-1.5 text-xs text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
        />
      </div>
    </section>
  );
}
