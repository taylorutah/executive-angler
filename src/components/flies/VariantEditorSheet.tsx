"use client";

import { useEffect, useState } from "react";
import { Loader2, X, Trash2, Check } from "lucide-react";
import type { BeadMaterial, FlyBoxEntry } from "@/lib/db/fly-patterns";
import {
  BEAD_MATERIALS,
  BEAD_WEIGHT_OPTIONS,
  formatVariantLabel,
} from "@/lib/flies/variant-format";

type TieNextStatus = "none" | "wanted" | "at_vise" | "done";

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

  useEffect(() => {
    if (!open) return;
    setError(null);
    setHookSize(entry?.hook_size ?? "");
    setBeadWeight(typeof entry?.bead_weight_mm === "number" ? entry.bead_weight_mm : null);
    setBeadMaterial((entry?.bead_material ?? null) as BeadMaterial | null);
    setVariantLabel(entry?.variant_label ?? "");
    setStocked(typeof entry?.tied_count === "number" ? entry.tied_count : 0);
    setTarget(typeof entry?.target_count === "number" ? entry.target_count : 0);
    setStatus((entry?.tie_next_status ?? "none") as TieNextStatus);
  }, [open, entry]);

  if (!open) return null;

  const previewLabel = formatVariantLabel({
    hook_size: hookSize || null,
    bead_weight_mm: beadWeight,
    bead_material: beadMaterial,
    variant_label: variantLabel || null,
  });

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        hook_size: hookSize.trim() || null,
        bead_weight_mm: beadWeight,
        bead_material: beadMaterial,
        variant_label: variantLabel.trim() || null,
        tied_count: stocked,
        target_count: target,
        tie_next_status: status,
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
