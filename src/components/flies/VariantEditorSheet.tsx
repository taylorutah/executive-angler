"use client";

import { useEffect, useState } from "react";
import { Loader2, X, Trash2, Check, Plus, ChevronDown, ChevronRight } from "lucide-react";
import type { BeadMaterial, FlyBoxEntry } from "@/lib/db/fly-patterns";
import {
  BEAD_MATERIALS,
  BEAD_WEIGHT_OPTIONS,
  formatVariantLabel,
} from "@/lib/flies/variant-format";
import {
  ROLE_FIELDS,
  RECIPE_ROLES,
  getRoleFields,
  detailLabel,
} from "@/lib/flies/role-field-config";
import type { RecipeRole, TyingMaterial } from "@/types/materials";
import { MaterialAutocomplete } from "./MaterialAutocomplete";

type TieNextStatus = "none" | "wanted" | "at_vise" | "done";

type SlotOverride = {
  size?: string;
  color?: string;
  weight?: string;
  materialType?: string;
  finish?: string;
  quantity?: string;
  materialName?: string;
  materialId?: string;
};

type Personalizations = Record<string, SlotOverride>;

const RESERVED_KEYS: (keyof SlotOverride)[] = [
  "size",
  "color",
  "weight",
  "materialType",
  "finish",
  "quantity",
  "materialName",
  "materialId",
];

interface VariantEditorSheetProps {
  /** When true the sheet is open. */
  open: boolean;
  /** Variant to edit. When omitted, the sheet creates a new variant. */
  entry?: FlyBoxEntry;
  /** Required when creating: the canonical fly the variant belongs to. */
  canonicalFlyId?: string;
  /** Optional: auto-assign new variant to a box on create. */
  boxId?: string;
  /** Display name shown in the header. */
  patternName?: string;
  onClose: () => void;
  /** Fired after a successful save with the persisted entry. */
  onSaved?: (entry: FlyBoxEntry) => void;
  /** Fired after a successful delete. */
  onDeleted?: (entryId: string) => void;
}

/**
 * VariantEditorSheet — single source of truth for editing a per-row variant
 * on `user_fly_box`. Used both inline (table view kebab) and from the box
 * detail "Add fly" flow. Bottom sheet on mobile, side drawer on desktop.
 */
export default function VariantEditorSheet({
  open,
  entry,
  canonicalFlyId,
  boxId,
  patternName,
  onClose,
  onSaved,
  onDeleted,
}: VariantEditorSheetProps) {
  const isEdit = Boolean(entry?.id);
  const [hookSize, setHookSize] = useState("");
  const [beadWeight, setBeadWeight] = useState<number | null>(null);
  const [beadMaterial, setBeadMaterial] = useState<BeadMaterial | null>(null);
  const [variantLabel, setVariantLabel] = useState("");
  const [stocked, setStocked] = useState(0);
  const [target, setTarget] = useState(0);
  const [status, setStatus] = useState<TieNextStatus>("none");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [personalizations, setPersonalizations] = useState<Personalizations>({});
  const [showAddSlot, setShowAddSlot] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    const p = (entry?.personalizations ?? {}) as Personalizations;
    // Prefer personalizations.hook.size; fall back to legacy hook_size column.
    const hookFromP = p.hook?.size;
    const beadWeightFromP = p.bead?.weight ? Number(p.bead.weight) : null;
    const beadMatFromP = p.bead?.materialType as BeadMaterial | undefined;
    setHookSize(hookFromP ?? entry?.hook_size ?? "");
    setBeadWeight(
      Number.isFinite(beadWeightFromP)
        ? (beadWeightFromP as number)
        : typeof entry?.bead_weight_mm === "number"
        ? entry.bead_weight_mm
        : null,
    );
    setBeadMaterial((beadMatFromP ?? entry?.bead_material ?? null) as BeadMaterial | null);
    setVariantLabel(entry?.variant_label ?? "");
    setStocked(typeof entry?.tied_count === "number" ? entry.tied_count : 0);
    setTarget(typeof entry?.target_count === "number" ? entry.target_count : 0);
    setStatus((entry?.tie_next_status ?? "none") as TieNextStatus);
    setPersonalizations(p);
    setShowAddSlot(false);
    // Auto-open Customize when there are slots beyond hook/bead.
    const hasExtraSlots = Object.keys(p).some(
      (k) => k !== "hook" && k !== "bead" && p[k] && Object.keys(p[k]!).length > 0,
    );
    setCustomizeOpen(hasExtraSlots);
  }, [open, entry]);

  if (!open) return null;

  const previewLabel = formatVariantLabel({
    hook_size: hookSize || null,
    bead_weight_mm: beadWeight,
    bead_material: beadMaterial,
    variant_label: variantLabel || null,
    personalizations,
  });

  const customSlots = Object.keys(personalizations).filter(
    (k) => k !== "hook" && k !== "bead" && personalizations[k] && Object.keys(personalizations[k]!).length > 0,
  ) as RecipeRole[];

  const availableSlots = (RECIPE_ROLES.filter(
    (r) => r !== "hook" && r !== "bead" && !customSlots.includes(r),
  )) as RecipeRole[];

  function setSlot(role: string, patch: Partial<SlotOverride>) {
    setPersonalizations((prev) => {
      const cur = prev[role] ?? {};
      const next = { ...cur, ...patch };
      // Strip empty strings to keep the jsonb tidy.
      for (const k of RESERVED_KEYS) {
        if (next[k] === "" || next[k] === undefined) delete next[k];
      }
      const out = { ...prev, [role]: next };
      if (Object.keys(out[role]).length === 0) delete out[role];
      return out;
    });
  }

  function removeSlot(role: string) {
    setPersonalizations((prev) => {
      const out = { ...prev };
      delete out[role];
      return out;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      // Build the personalizations map. Hook + bead get top-level fast-path
      // entries; any custom slots the user added carry through.
      const mergedPersonalizations: Personalizations = { ...personalizations };
      const hookOverride: SlotOverride = { ...(mergedPersonalizations.hook ?? {}) };
      if (hookSize.trim()) hookOverride.size = hookSize.trim();
      else delete hookOverride.size;
      if (Object.keys(hookOverride).length > 0) mergedPersonalizations.hook = hookOverride;
      else delete mergedPersonalizations.hook;

      const beadOverride: SlotOverride = { ...(mergedPersonalizations.bead ?? {}) };
      if (beadWeight !== null) beadOverride.weight = String(beadWeight);
      else delete beadOverride.weight;
      if (beadMaterial) beadOverride.materialType = beadMaterial;
      else delete beadOverride.materialType;
      if (Object.keys(beadOverride).length > 0) mergedPersonalizations.bead = beadOverride;
      else delete mergedPersonalizations.bead;

      const body: Record<string, unknown> = {
        // Legacy columns kept as a back-compat mirror so existing queries
        // (variant chips, label formatters that don't yet read jsonb) keep
        // working until the codebase fully migrates to personalizations-only.
        hook_size: hookSize.trim() || null,
        bead_weight_mm: beadWeight,
        bead_material: beadMaterial,
        variant_label: variantLabel.trim() || null,
        tied_count: stocked,
        target_count: target,
        tie_next_status: status,
        personalizations: mergedPersonalizations,
      };
      let res: Response;
      if (isEdit && entry?.id) {
        res = await fetch(`/api/fly-box?id=${entry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        if (!canonicalFlyId) {
          throw new Error("canonicalFlyId required to create a variant");
        }
        const createBody: Record<string, unknown> = { ...body, canonical_fly_id: canonicalFlyId };
        if (boxId) createBody.box_ids = [boxId];
        res = await fetch(`/api/fly-box`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createBody),
        });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const saved = (await res.json()) as FlyBoxEntry;
      onSaved?.(saved);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!entry?.id) return;
    if (!window.confirm("Delete this variant? Stock counts and history will be removed.")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/fly-box?id=${entry.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      onDeleted?.(entry.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:justify-end">
      <div className="w-full max-w-md bg-[var(--color-surface)] border-t sm:border-l sm:border-t-0 border-[var(--color-border)] rounded-t-2xl sm:rounded-none sm:rounded-l-xl max-h-[90vh] sm:max-h-screen sm:h-screen overflow-y-auto">
        <div className="sticky top-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">
              {isEdit ? "Edit variant" : "New variant"}
            </p>
            <h3 className="font-[family-name:var(--font-heading)] text-lg text-[var(--color-text-primary)] truncate">
              {patternName ?? previewLabel}
            </h3>
            {patternName ? (
              <p className="text-xs text-[var(--color-text-secondary)] font-[var(--font-mono)] tabular-nums">
                {previewLabel}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-5">
          <Field label="Hook size">
            <input
              type="text"
              value={hookSize}
              onChange={(e) => setHookSize(e.target.value)}
              placeholder="e.g. 14"
              className="w-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#E8923A]"
            />
          </Field>

          <Field label="Bead weight (mm)">
            <ChipGroup<number>
              items={[null, ...BEAD_WEIGHT_OPTIONS] as (number | null)[]}
              value={beadWeight}
              onChange={setBeadWeight}
              renderLabel={(v) => (v === null ? "None" : v.toFixed(1))}
            />
          </Field>

          <Field label="Bead material">
            <ChipGroup<BeadMaterial>
              items={[null, ...BEAD_MATERIALS] as (BeadMaterial | null)[]}
              value={beadMaterial}
              onChange={setBeadMaterial}
              renderLabel={(v) =>
                v === null ? "Unset" : v.charAt(0).toUpperCase() + v.slice(1)
              }
            />
          </Field>

          <Field label="Variant label (optional)">
            <input
              type="text"
              value={variantLabel}
              onChange={(e) => setVariantLabel(e.target.value)}
              placeholder={previewLabel === "Variant" ? "e.g. Olive Tungsten" : previewLabel}
              className="w-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#E8923A]"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="In box">
              <Stepper value={stocked} onChange={setStocked} min={0} />
            </Field>
            <Field label="Target">
              <Stepper value={target} onChange={setTarget} min={0} />
            </Field>
          </div>

          <Field label="Tie-next">
            <ChipGroup
              items={["none", "wanted", "at_vise", "done"] as TieNextStatus[]}
              value={status}
              onChange={(v) => setStatus(v ?? "none")}
              renderLabel={(v) => (v === "at_vise" ? "At vise" : v ? v.charAt(0).toUpperCase() + v.slice(1) : "—")}
            />
          </Field>

          {/* Customize materials — collapsed by default. Hook + bead are
              already covered by the fast-path inputs above; this section
              lets the user override any other slot (Tail, Wing, Body, Rib,
              etc.) and works for nymphs, dries, and streamers alike. */}
          <div className="border border-[var(--color-border)] rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => setCustomizeOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 bg-[var(--color-surface-raised)] hover:bg-[#21262D] transition-colors"
            >
              <span className="flex items-center gap-2">
                {customizeOpen ? (
                  <ChevronDown size={14} className="text-[var(--color-text-muted)]" />
                ) : (
                  <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
                )}
                <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                  Customize materials
                </span>
                {customSlots.length > 0 && (
                  <span className="text-[10px] font-mono text-[#E8923A]">
                    {customSlots.length}
                  </span>
                )}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Tail · Wing · Body · …
              </span>
            </button>

            {customizeOpen && (
              <div className="border-t border-[var(--color-border)] p-3 space-y-2 bg-[#0D1117]">
                {customSlots.length === 0 && !showAddSlot && (
                  <p className="text-[11px] text-[var(--color-text-muted)] italic">
                    No custom slots yet. Add one to override colors or materials beyond hook + bead.
                  </p>
                )}

                {customSlots.map((slot) => (
                  <SlotRow
                    key={slot}
                    role={slot}
                    value={personalizations[slot] ?? {}}
                    onChange={(patch) => setSlot(slot, patch)}
                    onRemove={() => removeSlot(slot)}
                  />
                ))}

                {showAddSlot ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {availableSlots.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setSlot(r, {});
                          setShowAddSlot(false);
                          // Initialize with placeholder structure
                          setPersonalizations((prev) => ({
                            ...prev,
                            [r]: prev[r] ?? {},
                          }));
                        }}
                        className="text-[11px] px-2 h-6 rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:border-[#E8923A] hover:text-[#E8923A] transition-colors"
                      >
                        {ROLE_FIELDS[r].label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowAddSlot(false)}
                      className="text-[11px] px-2 h-6 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddSlot(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[#E8923A] transition-colors"
                  >
                    <Plus size={12} /> Add slot
                  </button>
                )}
              </div>
            )}
          </div>

          {error ? (
            <p className="text-xs text-[#DA3633]" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="sticky bottom-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] px-4 py-3 flex items-center gap-3">
          {isEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="inline-flex items-center gap-1 text-sm text-[#DA3633] hover:text-[#DA3633]/80 disabled:opacity-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          ) : null}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#E8923A] text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {isEdit ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}

function ChipGroup<T>({
  items,
  value,
  onChange,
  renderLabel,
}: {
  items: (T | null)[];
  value: T | null;
  onChange: (v: T | null) => void;
  renderLabel: (v: T | null) => string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it, idx) => {
        const selected = it === value;
        return (
          <button
            key={`${idx}-${String(it)}`}
            type="button"
            onClick={() => onChange(it)}
            className={[
              "inline-flex items-center rounded-md px-2 py-1 text-xs font-[var(--font-mono)] tabular-nums border transition-colors",
              selected
                ? "border-[#E8923A] bg-[#E8923A]/15 text-[#E8923A]"
                : "border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
            ].join(" ")}
          >
            {renderLabel(it)}
          </button>
        );
      })}
    </div>
  );
}

function SlotRow({
  role,
  value,
  onChange,
  onRemove,
}: {
  role: RecipeRole;
  value: SlotOverride;
  onChange: (patch: Partial<SlotOverride>) => void;
  onRemove: () => void;
}) {
  const cfg = getRoleFields(role);
  const [material, setMaterial] = useState<TyingMaterial | null>(null);
  const cellInputClass =
    "w-full h-7 bg-[#0D1117] border border-[var(--color-border)] rounded px-2 text-[12px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#E8923A]";
  const cellSelectClass = `${cellInputClass} appearance-none cursor-pointer pr-5`;

  const renderSize = () => {
    const placeholder = cfg.placeholders?.size ?? "";
    const options = material?.sizes ?? [];
    return options.length > 0 ? (
      <select
        value={value.size ?? ""}
        onChange={(e) => onChange({ size: e.target.value })}
        className={cellSelectClass}
      >
        <option value="">—</option>
        {options.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    ) : (
      <input
        type="text"
        value={value.size ?? ""}
        onChange={(e) => onChange({ size: e.target.value })}
        placeholder={placeholder}
        className={cellInputClass}
      />
    );
  };

  const renderColor = () => {
    const placeholder = cfg.placeholders?.color ?? "";
    const options = material?.colors ?? [];
    return options.length > 0 ? (
      <select
        value={value.color ?? ""}
        onChange={(e) => onChange({ color: e.target.value })}
        className={cellSelectClass}
      >
        <option value="">—</option>
        {options.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    ) : (
      <input
        type="text"
        value={value.color ?? ""}
        onChange={(e) => onChange({ color: e.target.value })}
        placeholder={placeholder}
        className={cellInputClass}
      />
    );
  };

  const renderDetail = () => {
    if (!cfg.detail) return null;
    const placeholder = cfg.placeholders?.detail ?? "";
    switch (cfg.detail) {
      case "weight":
        return (
          <input
            type="text"
            value={value.weight ?? material?.weight ?? ""}
            onChange={(e) => onChange({ weight: e.target.value })}
            placeholder={placeholder}
            className={cellInputClass}
          />
        );
      case "materialType":
        return (
          <input
            type="text"
            value={value.materialType ?? material?.material_type ?? ""}
            onChange={(e) => onChange({ materialType: e.target.value })}
            placeholder={placeholder}
            className={cellInputClass}
          />
        );
      case "finish":
        return (
          <input
            type="text"
            value={value.finish ?? material?.finish ?? ""}
            onChange={(e) => onChange({ finish: e.target.value })}
            placeholder={placeholder}
            className={cellInputClass}
          />
        );
      case "quantity":
        return (
          <input
            type="text"
            value={value.quantity ?? ""}
            onChange={(e) => onChange({ quantity: e.target.value })}
            placeholder={placeholder}
            className={cellInputClass}
          />
        );
      case "length":
        return (
          <input
            type="text"
            value={value.size ?? ""}
            onChange={(e) => onChange({ size: e.target.value })}
            placeholder={placeholder}
            className={cellInputClass}
          />
        );
    }
  };

  return (
    <div className="border border-[var(--color-border)] rounded bg-[#161B22] p-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
          {cfg.label}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
          aria-label={`Remove ${cfg.label}`}
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <MaterialAutocomplete
            category={cfg.materialCategory}
            value={material}
            freeText={value.materialName ?? ""}
            onSelect={(mat, freeText) => {
              setMaterial(mat);
              onChange({
                materialId: mat?.id,
                materialName: freeText || mat?.name || "",
              });
            }}
            placeholder={`Search ${cfg.label.toLowerCase()}…`}
            compact
          />
        </div>
        {cfg.showSize && (
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">
              Size
            </label>
            {renderSize()}
          </div>
        )}
        {cfg.showColor && (
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">
              Color
            </label>
            {renderColor()}
          </div>
        )}
        {cfg.detail && (
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">
              {detailLabel(cfg.detail)}
            </label>
            {renderDetail()}
          </div>
        )}
      </div>
    </div>
  );
}

function Stepper({
  value,
  onChange,
  min = 0,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="px-2 py-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(Math.max(min, Math.floor(n)));
        }}
        className="w-12 bg-transparent text-center text-sm font-[var(--font-mono)] tabular-nums text-[var(--color-text-primary)] focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="px-2 py-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      >
        +
      </button>
    </div>
  );
}
