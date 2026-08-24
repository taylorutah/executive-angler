"use client";
/**
 * ConfigureSheet — drawer for creating or editing a fly version.
 *
 * Each option field is a free-text input with autocomplete suggestions
 * drawn from the fly's option_envelope. Free text always wins — the
 * envelope is editorial guidance, not enforcement.
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import type { Fly, FlyConfiguration, OptionEnvelope, SlotOverrides } from "@/types/flies";

interface BoxOption { id: string; name: string; }

interface Props {
  fly: Fly;
  existing?: FlyConfiguration;
  boxes?: BoxOption[];
  /** Initial box id to add to (only honored when creating). */
  initialBoxId?: string;
  open: boolean;
  onClose: () => void;
  onSaved?: (configurationId: string) => void;
}

type FieldKey = "size" | "bead_size_mm" | "bead_color" | "bead_material" | "body_color";

const FIELD_LABELS: Record<FieldKey, string> = {
  size: "Size",
  bead_size_mm: "Bead size (mm)",
  bead_color: "Bead color",
  bead_material: "Bead material",
  body_color: "Body color",
};

function suggestions(env: OptionEnvelope, key: FieldKey): string[] {
  switch (key) {
    case "size":
      return (env.sizes ?? []).map(String);
    case "bead_size_mm":
      return (env.bead?.sizes_mm ?? []).map(String);
    case "bead_color":
      return env.bead?.colors ?? [];
    case "bead_material":
      return env.bead?.materials ?? [];
    case "body_color":
      return env.colors?.body ?? [];
  }
}

function readField(overrides: SlotOverrides, size: string | null | undefined, key: FieldKey): string {
  switch (key) {
    case "size":          return size ?? "";
    case "bead_size_mm":  return overrides.bead?.size_mm != null ? String(overrides.bead.size_mm) : "";
    case "bead_color":    return String(overrides.bead?.color ?? "");
    case "bead_material": return String(overrides.bead?.material ?? "");
    case "body_color":    return String(overrides.body?.color ?? "");
  }
}

export default function ConfigureSheet({
  fly,
  existing,
  boxes,
  initialBoxId,
  open,
  onClose,
  onSaved,
}: Props) {
  const router = useRouter();
  const [nickname, setNickname]     = useState(existing?.nickname ?? "");
  const [size, setSize]             = useState(existing?.size ?? "");
  const [beadSizeMm, setBeadSizeMm] = useState(readField((existing?.slot_overrides ?? {}) as SlotOverrides, existing?.size ?? null, "bead_size_mm"));
  const [beadColor, setBeadColor]   = useState(readField((existing?.slot_overrides ?? {}) as SlotOverrides, existing?.size ?? null, "bead_color"));
  const [beadMaterial, setBeadMaterial] = useState(readField((existing?.slot_overrides ?? {}) as SlotOverrides, existing?.size ?? null, "bead_material"));
  const [bodyColor, setBodyColor]   = useState(readField((existing?.slot_overrides ?? {}) as SlotOverrides, existing?.size ?? null, "body_color"));
  const [tied, setTied]             = useState(String(existing?.tied_count ?? 0));
  const [target, setTarget]         = useState(String(existing?.target_count ?? 0));
  const [pickedBoxId, setPickedBoxId] = useState(initialBoxId ?? boxes?.[0]?.id ?? "");
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const env = fly.option_envelope ?? {};

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  const autoSummary = useMemo(() => {
    const parts: string[] = [];
    if (size) parts.push(`#${size}`);
    const beadParts: string[] = [];
    if (beadSizeMm) beadParts.push(`${beadSizeMm}mm`);
    if (beadColor) beadParts.push(beadColor);
    if (beadParts.length) parts.push(beadParts.join(" "));
    if (bodyColor) parts.push(`${bodyColor} body`);
    return parts.length ? parts.join(" · ") : "Default version";
  }, [size, beadSizeMm, beadColor, bodyColor]);

  if (!open) return null;

  function buildSlotOverrides(): SlotOverrides {
    const out: SlotOverrides = {};
    if (beadSizeMm || beadColor || beadMaterial) {
      out.bead = {};
      if (beadSizeMm) {
        const n = Number(beadSizeMm);
        if (!Number.isNaN(n)) out.bead.size_mm = n;
      }
      if (beadColor)     out.bead.color    = beadColor;
      if (beadMaterial)  out.bead.material = beadMaterial;
    }
    if (bodyColor) out.body = { color: bodyColor };
    return out;
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        nickname: nickname.trim() || null,
        size: size.trim() || null,
        slot_overrides: buildSlotOverrides(),
        tied_count: Math.max(0, Number(tied) || 0),
        target_count: Math.max(0, Number(target) || 0),
      };
      let configurationId: string | null = null;

      if (existing) {
        const res = await fetch("/api/fishing/fly-configurations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existing.id, ...payload }),
        });
        const j = await res.json();
        if (!res.ok) {
          setError(j.error ?? "Failed to save");
          setSaving(false);
          return;
        }
        configurationId = j.configuration?.id ?? existing.id;
      } else {
        const res = await fetch("/api/fishing/fly-configurations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fly_id: fly.id, box_id: pickedBoxId || undefined, ...payload }),
        });
        const j = await res.json();
        if (!res.ok) {
          setError(j.error ?? "Failed to create");
          setSaving(false);
          return;
        }
        configurationId = j.configuration?.id ?? null;
      }
      onSaved?.(configurationId ?? "");
      router.refresh();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-[var(--color-surface,#fff)] dark:bg-[var(--surface-raised)] rounded-t-xl sm:rounded-xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between px-5 pt-5 pb-3 bg-[var(--color-surface,#fff)] dark:bg-[var(--surface-raised)]">
          <div>
            <h2 className="text-base font-semibold">{existing ? "Edit version" : "Add a version"}</h2>
            <p className="text-xs text-[var(--color-text-muted)]">{fly.name}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[var(--border-rule)]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          <label className="block">
            <span className="text-xs font-medium block mb-1">Nickname (optional)</span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={autoSummary}
              className="w-full rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[var(--border-strong)] bg-transparent px-3 py-2 text-sm"
            />
          </label>

          <Row label={FIELD_LABELS.size}        value={size}         onChange={setSize}         suggestions={suggestions(env, "size")}         placeholder="16" />
          <Row label={FIELD_LABELS.bead_size_mm}value={beadSizeMm}   onChange={setBeadSizeMm}   suggestions={suggestions(env, "bead_size_mm")} placeholder="3.0" />
          <Row label={FIELD_LABELS.bead_color}  value={beadColor}    onChange={setBeadColor}    suggestions={suggestions(env, "bead_color")}   placeholder="copper" />
          <Row label={FIELD_LABELS.bead_material} value={beadMaterial} onChange={setBeadMaterial} suggestions={suggestions(env, "bead_material")} placeholder="tungsten" />
          <Row label={FIELD_LABELS.body_color}  value={bodyColor}    onChange={setBodyColor}    suggestions={suggestions(env, "body_color")}   placeholder="olive" />

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium block mb-1">Tied count</span>
              <input
                type="number"
                min={0}
                value={tied}
                onChange={(e) => setTied(e.target.value)}
                className="w-full rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[var(--border-strong)] bg-transparent px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium block mb-1">Target count</span>
              <input
                type="number"
                min={0}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[var(--border-strong)] bg-transparent px-3 py-2 text-sm"
              />
            </label>
          </div>

          {!existing && boxes && boxes.length >= 2 && (
            <label className="block">
              <span className="text-xs font-medium block mb-1">Add to box</span>
              <select
                value={pickedBoxId}
                onChange={(e) => setPickedBoxId(e.target.value)}
                className="w-full rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[var(--border-strong)] bg-transparent px-3 py-2 text-sm"
              >
                {boxes.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
                <option value="">(no box yet)</option>
              </select>
            </label>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[var(--border-strong)] px-3 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--action)] px-3 py-2 text-xs font-medium text-white hover:bg-[#d17d28] disabled:opacity-60"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {existing ? "Save changes" : "Save version"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  placeholder?: string;
}) {
  const id = `field-${label.replace(/\W+/g, "-").toLowerCase()}`;
  const listId = `${id}-list`;
  return (
    <label htmlFor={id} className="block">
      <span className="text-xs font-medium block mb-1">{label}</span>
      <input
        id={id}
        type="text"
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[var(--border-strong)] bg-transparent px-3 py-2 text-sm"
      />
      {suggestions.length > 0 && (
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </label>
  );
}
