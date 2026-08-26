"use client";

/**
 * VariantModal — unified creator for single and bulk fly variants.
 *
 * Every flat material role on fly_patterns is variantable: hook, bead
 * (including "no bead"), thread, body, rib, tail, thorax, collar, wing,
 * hot spot, plus the cosmetic axes size/type/fly_color. Bulk mode exposes
 * a dynamic axis picker; single mode exposes sectioned overrides.
 *
 * Parent is passed in as `parent={{ patternId | canonicalId, name, ... }}`.
 * On success, triggers onCreated() + redirect to /my-flies.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, Loader2, Plus, Sparkles, Wand2, Trash2 } from "@/icons";
import { Button } from "@/components/ui/Button";

export type VariantParentSpec = {
  patternId?: string;
  canonicalId?: string;
  name: string;
  heroImageUrl?: string | null;
  category?: string | null;
  defaultSize?: string | null;
  defaultColor?: string | null;
  defaultBeadColor?: string | null;
};

type Props = {
  parent: VariantParentSpec;
  open: boolean;
  onClose: () => void;
  onCreated?: (count: number) => void;
  initialMode?: "single" | "bulk";
};

/* ─── Field catalog: every role a variant can override ─── */

type FieldKey =
  | "size"
  | "type"
  | "hook"
  | "fly_color"
  | "bead_material"
  | "bead_color"
  | "bead_size"
  | "bead_size_mm"
  | "body_material"
  | "body_color"
  | "thread_color"
  | "tail_color"
  | "thorax_color"
  | "collar_color"
  | "rib_material"
  | "rib_color"
  | "wing_material"
  | "wing_color"
  | "hot_spot_color";

type FieldDef = {
  key: FieldKey;
  label: string;
  placeholder: string;
  suggestions: string[];
  group: "core" | "bead" | "body" | "tail" | "wing" | "accent";
};

const FLY_TYPES = [
  "Nymph",
  "Dry Fly",
  "Streamer",
  "Wet Fly",
  "Emerger",
  "Terrestrial",
  "Egg",
  "Midge",
];

const FIELDS: Record<FieldKey, FieldDef> = {
  size:            { key: "size",            label: "Size",            placeholder: "14, 16, 18…",          suggestions: ["10", "12", "14", "16", "18", "20", "22"], group: "core" },
  type:            { key: "type",            label: "Type",            placeholder: "Nymph / Dry Fly…",     suggestions: FLY_TYPES,                                 group: "core" },
  hook:            { key: "hook",            label: "Hook",            placeholder: "Hanak 300, TMC 2488…", suggestions: ["Hanak 300", "Hanak 400", "Firehole 516", "TMC 2488", "TMC 100", "Gamakatsu C12-BM", "Fulling Mill Jig Force"], group: "core" },
  fly_color:       { key: "fly_color",       label: "Fly color",       placeholder: "Olive, black, rust…",  suggestions: ["Olive", "Black", "Brown", "Tan", "Rust", "Orange", "Pink", "Purple", "Chartreuse"], group: "core" },

  bead_material:   { key: "bead_material",   label: "Bead material",   placeholder: "tungsten, brass, none", suggestions: ["tungsten", "slotted_tungsten", "brass", "copper", "none"], group: "bead" },
  bead_color:      { key: "bead_color",      label: "Bead color",      placeholder: "Copper, gold, silver", suggestions: ["Copper", "Gold", "Silver", "Black Nickel", "Tungsten", "Rainbow"], group: "bead" },
  bead_size:       { key: "bead_size",       label: "Bead size (#)",   placeholder: "S, M, L",             suggestions: ["XS", "S", "M", "L", "XL"],              group: "bead" },
  bead_size_mm:    { key: "bead_size_mm",    label: "Bead size (mm)",  placeholder: "2.8, 3.2, 3.8",       suggestions: ["2.0", "2.4", "2.8", "3.2", "3.5", "3.8", "4.0"], group: "bead" },

  body_material:   { key: "body_material",   label: "Body material",   placeholder: "pheasant tail, dubbing", suggestions: ["pheasant_tail", "dubbing", "biot", "tinsel", "hare's_ear"], group: "body" },
  body_color:      { key: "body_color",      label: "Body color",      placeholder: "Olive, tan, orange",  suggestions: ["Olive", "Tan", "Black", "Brown", "Orange", "Pink"], group: "body" },
  thread_color:    { key: "thread_color",    label: "Thread color",    placeholder: "Black, olive, red",   suggestions: ["Black", "Olive", "Red", "White", "Brown", "Orange", "Fluorescent Pink"], group: "body" },
  rib_material:    { key: "rib_material",    label: "Rib material",    placeholder: "wire, tinsel, mono",  suggestions: ["copper_wire", "gold_wire", "tinsel", "mono"], group: "body" },
  rib_color:       { key: "rib_color",       label: "Rib color",       placeholder: "Copper, gold, red",   suggestions: ["Copper", "Gold", "Silver", "Red", "Black"], group: "body" },

  tail_color:      { key: "tail_color",      label: "Tail color",      placeholder: "CDL, brown, black",    suggestions: ["CDL", "Brown", "Black", "Olive", "White"], group: "tail" },
  thorax_color:    { key: "thorax_color",    label: "Thorax color",    placeholder: "Black, peacock, UV",   suggestions: ["Black", "Peacock", "UV Tan", "Orange"], group: "tail" },
  collar_color:    { key: "collar_color",    label: "Collar color",    placeholder: "Partridge, starling",  suggestions: ["Partridge", "Starling", "CDC", "Hungarian Partridge"], group: "tail" },

  wing_material:   { key: "wing_material",   label: "Wing material",   placeholder: "CDC, elk, polyyarn",   suggestions: ["CDC", "Elk", "Deer", "Poly Yarn", "Z-Lon"], group: "wing" },
  wing_color:      { key: "wing_color",      label: "Wing color",      placeholder: "Natural, white, tan",  suggestions: ["Natural", "White", "Tan", "Grey", "Black"], group: "wing" },

  hot_spot_color:  { key: "hot_spot_color",  label: "Hot spot color",  placeholder: "Fl. pink, red, chartreuse", suggestions: ["Fl. Pink", "Fl. Orange", "Red", "Chartreuse", "UV"], group: "accent" },
};

const ALL_FIELD_KEYS = Object.keys(FIELDS) as FieldKey[];

/* ─── Component ─── */

export default function VariantModal({
  parent,
  open,
  onClose,
  onCreated,
  initialMode = "single",
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"single" | "bulk">(initialMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Single mode: every field lives in one flat map; empty string = inherit.
  const makeBlank = (): Record<FieldKey, string> =>
    ALL_FIELD_KEYS.reduce(
      (acc, k) => ({ ...acc, [k]: "" }),
      {} as Record<FieldKey, string>
    );
  const [single, setSingle] = useState<Record<FieldKey, string>>(() => {
    const b = makeBlank();
    b.size = parent.defaultSize ?? "";
    b.fly_color = parent.defaultColor ?? "";
    b.bead_color = parent.defaultBeadColor ?? "";
    return b;
  });
  const [singleName, setSingleName] = useState("");
  const [singleNotes, setSingleNotes] = useState("");
  const [singleNoBead, setSingleNoBead] = useState(false);
  const [showAllMaterials, setShowAllMaterials] = useState(false);

  // Bulk mode: ordered list of axes.
  const [bulkAxes, setBulkAxes] = useState<Array<{ field: FieldKey; values: string[]; input: string }>>(
    [
      { field: "size", values: [], input: "" },
      { field: "fly_color", values: [], input: "" },
      { field: "bead_color", values: [], input: "" },
    ]
  );
  const [addAxisOpen, setAddAxisOpen] = useState(false);

  // Backdrop close via mousedown+mouseup on backdrop only.
  const mouseDownOnBackdropRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, saving, onClose]);

  function handleBackdropMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    mouseDownOnBackdropRef.current = e.target === e.currentTarget;
  }
  function handleBackdropMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    const wasBackdropDown = mouseDownOnBackdropRef.current;
    mouseDownOnBackdropRef.current = false;
    if (wasBackdropDown && e.target === e.currentTarget && !saving) {
      onClose();
    }
  }

  const parentSpec =
    parent.patternId !== undefined
      ? { patternId: parent.patternId }
      : { canonicalId: parent.canonicalId };

  const bulkCount = bulkAxes.reduce(
    (acc, a) => (a.values.length > 0 ? acc * a.values.length : acc),
    bulkAxes.some((a) => a.values.length > 0) ? 1 : 0
  );
  const overLimit = bulkCount > 64;
  const usedAxisKeys = new Set(bulkAxes.map((a) => a.field));
  const availableAxisKeys = ALL_FIELD_KEYS.filter((k) => !usedAxisKeys.has(k));

  async function submitSingle() {
    const anyFieldSet = ALL_FIELD_KEYS.some((k) => single[k] && single[k].trim() !== "");
    if (!singleName.trim() && !anyFieldSet && !singleNoBead && !singleNotes.trim()) {
      setError("Give this variant a name or change at least one spec.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const overrides: Record<string, unknown> = {};
      for (const k of ALL_FIELD_KEYS) {
        const v = single[k]?.trim();
        if (v) overrides[k] = v;
      }
      if (singleName.trim()) overrides.name = singleName.trim();
      if (singleNotes.trim()) overrides.description = singleNotes.trim();
      if (singleNoBead) overrides.no_bead = true;

      const res = await fetch("/api/fishing/flies/variant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parent: parentSpec, mode: "single", overrides }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create variant");
      onCreated?.(1);
      onClose();
      router.push("/my-flies?tab=box");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create variant");
    } finally {
      setSaving(false);
    }
  }

  async function submitBulk() {
    if (bulkCount === 0) {
      setError("Add at least one value to one axis.");
      return;
    }
    if (overLimit) {
      setError(`Too many variants (${bulkCount}) — cap is 64. Trim an axis.`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const custom = bulkAxes
        .filter((a) => a.values.length > 0)
        .map((a) => ({ field: a.field, values: a.values }));
      const res = await fetch("/api/fishing/flies/variant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parent: parentSpec, mode: "bulk", axes: { custom } }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to spawn variants");
      onCreated?.(json.count ?? bulkCount);
      onClose();
      router.push("/my-flies?tab=box");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to spawn variants");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--surface-page)]/80 backdrop-blur-sm"
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
      role="presentation"
    >
      <div
        className="w-full sm:max-w-2xl bg-[var(--surface-raised)] border border-[var(--border-rule)] sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={`Create variant of ${parent.name}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[var(--border-rule)]">
          <div className="flex items-center gap-3 min-w-0">
            {parent.heroImageUrl && (
              <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-[var(--border-rule)] flex-shrink-0">
                <Image
                  src={parent.heroImageUrl}
                  alt={parent.name}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-[var(--text-meta)]">Create variant of</p>
              <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] truncate">
                {parent.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-meta)] hover:text-[var(--text-primary)] hover:bg-[var(--border-rule)] transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="px-5 pt-4">
          <div className="inline-flex rounded-lg border border-[var(--border-rule)] bg-[var(--surface-page)] p-1 text-xs">
            <button
              onClick={() => setMode("single")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                mode === "single"
                  ? "bg-[var(--action)] text-[var(--surface-page)]"
                  : "text-[var(--text-body)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Sparkles className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
              Single variant
            </button>
            <button
              onClick={() => setMode("bulk")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                mode === "bulk"
                  ? "bg-[var(--action)] text-[var(--surface-page)]"
                  : "text-[var(--text-body)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Wand2 className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
              Spawn by axis
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {mode === "single" ? (
            <SingleForm
              single={single}
              setSingle={setSingle}
              name={singleName}
              setName={setSingleName}
              notes={singleNotes}
              setNotes={setSingleNotes}
              noBead={singleNoBead}
              setNoBead={setSingleNoBead}
              showAll={showAllMaterials}
              setShowAll={setShowAllMaterials}
            />
          ) : (
            <BulkForm
              axes={bulkAxes}
              setAxes={setBulkAxes}
              addAxisOpen={addAxisOpen}
              setAddAxisOpen={setAddAxisOpen}
              availableAxisKeys={availableAxisKeys}
              parentName={parent.name}
              count={bulkCount}
              overLimit={overLimit}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-rule)] px-5 py-3 bg-[var(--surface-page)]">
          {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/my-flies?tab=box"
              className="text-xs text-[var(--text-meta)] hover:text-[var(--action)] transition-colors"
            >
              View fly box →
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button
                variant="solid"
                size="sm"
               
                icon={saving ? undefined : Plus}
                loading={saving}
                onClick={mode === "single" ? submitSingle : submitBulk}
                disabled={saving || (mode === "bulk" && (overLimit || bulkCount === 0))}
              >
                {mode === "bulk"
                  ? `Create ${bulkCount} variant${bulkCount === 1 ? "" : "s"}`
                  : "Create variant"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Single form ─── */

function SingleForm({
  single,
  setSingle,
  name,
  setName,
  notes,
  setNotes,
  noBead,
  setNoBead,
  showAll,
  setShowAll,
}: {
  single: Record<FieldKey, string>;
  setSingle: React.Dispatch<React.SetStateAction<Record<FieldKey, string>>>;
  name: string;
  setName: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  noBead: boolean;
  setNoBead: (v: boolean) => void;
  showAll: boolean;
  setShowAll: (v: boolean) => void;
}) {
  function patch(k: FieldKey, v: string) {
    setSingle((s) => ({ ...s, [k]: v }));
  }
  const coreKeys: FieldKey[] = ["size", "fly_color", "hook", "type"];
  const advancedKeys = ALL_FIELD_KEYS.filter((k) => !coreKeys.includes(k));
  const beadKeys = advancedKeys.filter((k) => FIELDS[k].group === "bead");
  const bodyKeys = advancedKeys.filter((k) => FIELDS[k].group === "body");
  const tailKeys = advancedKeys.filter((k) => FIELDS[k].group === "tail");
  const wingKeys = advancedKeys.filter((k) => FIELDS[k].group === "wing");
  const accentKeys = advancedKeys.filter((k) => FIELDS[k].group === "accent");

  const inputCls =
    "w-full rounded-lg border border-[var(--border-rule)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-meta)] focus:border-[var(--action)] focus:outline-none";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-[var(--text-body)] mb-1";

  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className={labelCls}>Name (optional)</label>
        <input
          className={inputCls}
          placeholder="Leave blank to auto-name from changes"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Core (always visible) */}
      <div className="grid grid-cols-2 gap-3">
        {coreKeys.map((k) => (
          <VariantFieldInput
            key={k}
            def={FIELDS[k]}
            value={single[k]}
            onChange={(v) => patch(k, v)}
          />
        ))}
      </div>

      {/* No-bead toggle — above bead section so its intent is clear */}
      <label className="flex items-start gap-2.5 rounded-lg border border-[var(--border-rule)] bg-[var(--surface-page)] px-3 py-2.5 cursor-pointer hover:border-[var(--action)]/40 transition-colors">
        <input
          type="checkbox"
          checked={noBead}
          onChange={(e) => setNoBead(e.target.checked)}
          className="mt-0.5 accent-[var(--action)]"
        />
        <span className="text-sm">
          <span className="font-medium text-[var(--text-primary)]">Tie this variant without a bead</span>
          <span className="block text-xs text-[var(--text-meta)] mt-0.5">
            Forces bead_material = none and clears bead color/size. Useful for a stillwater or swinging riff.
          </span>
        </span>
      </label>

      {/* Material groups */}
      <button
        type="button"
        onClick={() => setShowAll(!showAll)}
        className="text-xs font-medium text-[var(--signal-live)] hover:text-[var(--action)] transition-colors"
      >
        {showAll
          ? "– Hide material fields"
          : "+ Vary every material (bead, body, thread, rib, tail, wing, hot spot…)"}
      </button>

      {showAll && (
        <div className="space-y-4">
          <FieldGroup label="Bead" disabled={noBead} keys={beadKeys} single={single} patch={patch} />
          <FieldGroup label="Body / thread / rib" keys={bodyKeys} single={single} patch={patch} />
          <FieldGroup label="Tail, thorax, collar" keys={tailKeys} single={single} patch={patch} />
          <FieldGroup label="Wing" keys={wingKeys} single={single} patch={patch} />
          <FieldGroup label="Hot spot & accent" keys={accentKeys} single={single} patch={patch} />
        </div>
      )}

      {/* Notes */}
      <div>
        <label className={labelCls}>Tying notes (optional)</label>
        <textarea
          rows={2}
          className={inputCls}
          placeholder="What's different about this variant…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
}

function FieldGroup({
  label,
  keys,
  single,
  patch,
  disabled,
}: {
  label: string;
  keys: FieldKey[];
  single: Record<FieldKey, string>;
  patch: (k: FieldKey, v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`rounded-lg border border-[var(--border-rule)] bg-[var(--surface-page)] p-3 ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-meta)] mb-2">{label}</div>
      <div className="grid grid-cols-2 gap-3">
        {keys.map((k) => (
          <VariantFieldInput
            key={k}
            def={FIELDS[k]}
            value={single[k]}
            onChange={(v) => patch(k, v)}
          />
        ))}
      </div>
    </div>
  );
}

function VariantFieldInput({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputCls =
    "w-full rounded-lg border border-[var(--border-rule)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-meta)] focus:border-[var(--action)] focus:outline-none";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-[var(--text-body)] mb-1";
  const listId = `variant-dl-${def.key}`;

  // Type gets a select since we have an enumerated list
  if (def.key === "type") {
    return (
      <div>
        <label className={labelCls}>{def.label}</label>
        <select
          className={inputCls}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— inherit —</option>
          {FLY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <label className={labelCls}>{def.label}</label>
      <input
        className={inputCls}
        list={listId}
        placeholder={def.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {def.suggestions.length > 0 && (
        <datalist id={listId}>
          {def.suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  );
}

/* ─── Bulk form ─── */

function BulkForm({
  axes,
  setAxes,
  addAxisOpen,
  setAddAxisOpen,
  availableAxisKeys,
  parentName,
  count,
  overLimit,
}: {
  axes: Array<{ field: FieldKey; values: string[]; input: string }>;
  setAxes: React.Dispatch<React.SetStateAction<Array<{ field: FieldKey; values: string[]; input: string }>>>;
  addAxisOpen: boolean;
  setAddAxisOpen: (v: boolean) => void;
  availableAxisKeys: FieldKey[];
  parentName: string;
  count: number;
  overLimit: boolean;
}) {
  function updateAxis(idx: number, patch: Partial<{ values: string[]; input: string }>) {
    setAxes((list) => list.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  }
  function addValue(idx: number, raw: string) {
    const v = raw.trim();
    if (!v) return;
    setAxes((list) =>
      list.map((a, i) =>
        i === idx
          ? { ...a, values: a.values.includes(v) ? a.values : [...a.values, v], input: "" }
          : a
      )
    );
  }
  function removeValue(idx: number, v: string) {
    setAxes((list) =>
      list.map((a, i) => (i === idx ? { ...a, values: a.values.filter((x) => x !== v) } : a))
    );
  }
  function removeAxis(idx: number) {
    setAxes((list) => list.filter((_, i) => i !== idx));
  }
  function addAxis(field: FieldKey) {
    setAxes((list) => [...list, { field, values: [], input: "" }]);
    setAddAxisOpen(false);
  }

  const sampleBits: string[] = [parentName];
  for (const a of axes) {
    if (a.values.length > 0) {
      if (a.field === "size") sampleBits.push(`#${a.values[0]}`);
      else if (a.field === "bead_material" && a.values[0] === "none") sampleBits.push("no bead");
      else sampleBits.push(a.values[0]);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-meta)] leading-snug">
        Pick one or more material dimensions, add the values you want, and we'll spawn every
        combination. Every material role can be an axis — hook, bead (including
        <span className="text-[var(--action)]">&nbsp;"none"</span> for no-bead), thread, body, rib, tail,
        thorax, collar, wing, hot spot.
      </p>

      {axes.map((axis, idx) => (
        <AxisRow
          key={`${axis.field}-${idx}`}
          def={FIELDS[axis.field]}
          values={axis.values}
          input={axis.input}
          onInputChange={(v) => updateAxis(idx, { input: v })}
          onAdd={(v) => addValue(idx, v)}
          onRemove={(v) => removeValue(idx, v)}
          onRemoveAxis={() => removeAxis(idx)}
        />
      ))}

      {/* Add axis picker */}
      {availableAxisKeys.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setAddAxisOpen(!addAxisOpen)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--border-rule)] bg-[var(--surface-page)] px-3 py-2 text-xs text-[var(--text-body)] hover:text-[var(--action)] hover:border-[var(--action)]/40 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Vary another material (bead, body, thread, rib, tail, wing, hot spot…)
          </button>
          {addAxisOpen && (
            <div className="absolute z-10 mt-1 w-full sm:w-80 rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] shadow-2xl max-h-72 overflow-y-auto">
              {(["core", "bead", "body", "tail", "wing", "accent"] as const).map((g) => {
                const inGroup = availableAxisKeys.filter((k) => FIELDS[k].group === g);
                if (inGroup.length === 0) return null;
                return (
                  <div key={g} className="py-1.5">
                    <div className="px-3 pb-1 text-[10px] uppercase tracking-wider text-[var(--text-meta)]">
                      {groupLabel(g)}
                    </div>
                    {inGroup.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => addAxis(k)}
                        className="w-full text-left px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--border-rule)] transition-colors"
                      >
                        {FIELDS[k].label}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-[var(--border-rule)] bg-[var(--surface-page)] px-3 py-2.5 text-xs text-[var(--text-body)]">
        <p className="font-medium text-[var(--text-primary)] mb-0.5">
          Will create <span className="text-[var(--action)]">{count}</span> variant
          {count === 1 ? "" : "s"}
        </p>
        <p className="text-[var(--text-meta)]">
          Example name: <span className="text-[var(--text-body)]">{sampleBits.join(" ")}</span>
        </p>
        {overLimit && (
          <p className="mt-1 text-red-400">Cap is 64 per batch — trim an axis.</p>
        )}
      </div>
    </div>
  );
}

function AxisRow({
  def,
  values,
  input,
  onInputChange,
  onAdd,
  onRemove,
  onRemoveAxis,
}: {
  def: FieldDef;
  values: string[];
  input: string;
  onInputChange: (v: string) => void;
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  onRemoveAxis: () => void;
}) {
  const inputCls =
    "flex-1 rounded-lg border border-[var(--border-rule)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-meta)] focus:border-[var(--action)] focus:outline-none";
  const listId = `variant-axis-dl-${def.key}`;

  return (
    <div className="rounded-lg border border-[var(--border-rule)] bg-[var(--surface-page)]/60 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-body)]">
          {def.label}
        </span>
        <button
          type="button"
          onClick={onRemoveAxis}
          className="text-[var(--text-meta)] hover:text-red-400 transition-colors"
          aria-label={`Remove ${def.label} axis`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex gap-2">
        <input
          className={inputCls}
          list={listId}
          placeholder={def.placeholder}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              onAdd(input);
            }
          }}
        />
        <button
          type="button"
          onClick={() => onAdd(input)}
          className="rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text-body)] hover:text-[var(--action)] hover:border-[var(--action)]/40 transition-colors"
        >
          Add
        </button>
      </div>
      {def.suggestions.length > 0 && (
        <datalist id={listId}>
          {def.suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {values.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onRemove(v)}
              className="group inline-flex items-center gap-1 rounded-full border border-[var(--action)]/30 bg-[var(--action)]/10 px-2.5 py-1 text-xs text-[var(--action)] hover:bg-[var(--action)]/20 transition-colors"
            >
              {v === "none" ? "no bead" : v}
              <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      )}
      {def.suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {def.suggestions
            .filter((s) => !values.includes(s))
            .slice(0, 8)
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onAdd(s)}
                className="rounded-full border border-[var(--border-rule)] bg-[var(--surface-raised)] px-2 py-0.5 text-[11px] text-[var(--text-meta)] hover:text-[var(--action)] hover:border-[var(--action)]/30 transition-colors"
              >
                + {s === "none" ? "no bead" : s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function groupLabel(g: FieldDef["group"]): string {
  switch (g) {
    case "core": return "Core";
    case "bead": return "Bead";
    case "body": return "Body / thread / rib";
    case "tail": return "Tail, thorax, collar";
    case "wing": return "Wing";
    case "accent": return "Hot spot";
  }
}
