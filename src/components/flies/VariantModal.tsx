"use client";

/**
 * VariantModal — unified creator for single and bulk fly variants.
 *
 * Opens from a "Create Variant" CTA on:
 *   - /flies/[slug]         (canonical fly detail)
 *   - /journal/flies/[id]/edit (personal pattern detail) — future
 *   - MyFliesClient fly cards
 *
 * Modes:
 *   - "single" — name + per-axis overrides, inserts one variant
 *   - "bulk"   — axis chips (sizes × colors × bead_colors), inserts many
 *
 * Parent is passed in as `parent={{ patternId | canonicalId, name, heroImageUrl?, category? }}`.
 * On success, triggers onCreated() + optional redirect to /my-flies.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, Loader2, Plus, Sparkles, Wand2 } from "lucide-react";

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

const SUGGESTED_SIZES = ["10", "12", "14", "16", "18", "20", "22"];
const SUGGESTED_COLORS = ["Olive", "Black", "Brown", "Tan", "Rust", "Orange", "Pink", "Purple"];
const SUGGESTED_BEADS = ["Copper", "Gold", "Silver", "Black Nickel", "Tungsten"];

const BEAD_MATERIALS = [
  { value: "", label: "— inherit —" },
  { value: "none", label: "None" },
  { value: "brass", label: "Brass" },
  { value: "tungsten", label: "Tungsten" },
  { value: "slotted_tungsten", label: "Slotted tungsten" },
  { value: "copper", label: "Copper" },
];
const COMMON_BEAD_SIZES_MM = ["2.0", "2.4", "2.8", "3.2", "3.5", "3.8", "4.0"];

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

  // Single mode state
  const [single, setSingle] = useState({
    name: "",
    size: parent.defaultSize ?? "",
    fly_color: parent.defaultColor ?? "",
    bead_color: parent.defaultBeadColor ?? "",
    bead_material: "",
    bead_size_mm: "",
    body_color: "",
    tail_color: "",
    thorax_color: "",
    collar_color: "",
    hook: "",
    description: "",
    type: "",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Bulk mode state
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [beads, setBeads] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [beadInput, setBeadInput] = useState("");

  const parentSpec =
    parent.patternId !== undefined
      ? { patternId: parent.patternId }
      : { canonicalId: parent.canonicalId };

  const bulkCount = Math.max(
    (sizes.length || 1) * (colors.length || 1) * (beads.length || 1),
    sizes.length + colors.length + beads.length > 0 ? 1 : 0
  );
  const overLimit = bulkCount > 48;

  function chipAdd(
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    setInput: (v: string) => void
  ) {
    const v = value.trim();
    if (!v) return;
    if (list.includes(v)) return setInput("");
    setList([...list, v]);
    setInput("");
  }

  function chipRemove(value: string, list: string[], setList: (v: string[]) => void) {
    setList(list.filter((x) => x !== value));
  }

  async function submitSingle() {
    const hasAnyChange =
      single.name.trim() ||
      single.size ||
      single.fly_color ||
      single.bead_color ||
      single.bead_material ||
      single.bead_size_mm ||
      single.body_color ||
      single.tail_color ||
      single.thorax_color ||
      single.collar_color;
    if (!hasAnyChange) {
      setError("Give this variant a name or change at least one spec.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/fishing/flies/variant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent: parentSpec,
          mode: "single",
          overrides: {
            name: single.name.trim() || undefined,
            size: single.size.trim() || undefined,
            fly_color: single.fly_color.trim() || undefined,
            bead_color: single.bead_color.trim() || undefined,
            bead_material: single.bead_material || undefined,
            bead_size_mm: single.bead_size_mm.trim() || undefined,
            body_color: single.body_color.trim() || undefined,
            tail_color: single.tail_color.trim() || undefined,
            thorax_color: single.thorax_color.trim() || undefined,
            collar_color: single.collar_color.trim() || undefined,
            hook: single.hook.trim() || undefined,
            description: single.description.trim() || undefined,
            type: single.type || undefined,
          },
        }),
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
      setError("Add at least one size, color, or bead color.");
      return;
    }
    if (overLimit) {
      setError("Too many variants — keep it under 48.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/fishing/flies/variant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent: parentSpec,
          mode: "bulk",
          axes: {
            sizes: sizes.length ? sizes : undefined,
            colors: colors.length ? colors : undefined,
            bead_colors: beads.length ? beads : undefined,
          },
        }),
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0D1117]/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl bg-[#161B22] border border-[#21262D] sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[#21262D]">
          <div className="flex items-center gap-3 min-w-0">
            {parent.heroImageUrl && (
              <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-[#21262D] flex-shrink-0">
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
              <p className="text-xs uppercase tracking-wide text-[#6E7681]">Create variant of</p>
              <h2 className="font-heading text-lg font-bold text-[#F0F6FC] truncate">
                {parent.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6E7681] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="px-5 pt-4">
          <div className="inline-flex rounded-lg border border-[#21262D] bg-[#0D1117] p-1 text-xs">
            <button
              onClick={() => setMode("single")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                mode === "single"
                  ? "bg-[#E8923A] text-[#0D1117]"
                  : "text-[#A8B2BD] hover:text-[#F0F6FC]"
              }`}
            >
              <Sparkles className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
              Single variant
            </button>
            <button
              onClick={() => setMode("bulk")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                mode === "bulk"
                  ? "bg-[#E8923A] text-[#0D1117]"
                  : "text-[#A8B2BD] hover:text-[#F0F6FC]"
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
              value={single}
              onChange={(patch) => setSingle((s) => ({ ...s, ...patch }))}
              showAdvanced={showAdvanced}
              onToggleAdvanced={() => setShowAdvanced((v) => !v)}
            />
          ) : (
            <BulkForm
              sizes={sizes}
              colors={colors}
              beads={beads}
              sizeInput={sizeInput}
              colorInput={colorInput}
              beadInput={beadInput}
              setSizeInput={setSizeInput}
              setColorInput={setColorInput}
              setBeadInput={setBeadInput}
              onAddSize={(v) => chipAdd(v, sizes, setSizes, setSizeInput)}
              onAddColor={(v) => chipAdd(v, colors, setColors, setColorInput)}
              onAddBead={(v) => chipAdd(v, beads, setBeads, setBeadInput)}
              onRemoveSize={(v) => chipRemove(v, sizes, setSizes)}
              onRemoveColor={(v) => chipRemove(v, colors, setColors)}
              onRemoveBead={(v) => chipRemove(v, beads, setBeads)}
              parentName={parent.name}
              count={bulkCount}
              overLimit={overLimit}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#21262D] px-5 py-3 bg-[#0D1117]">
          {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/my-flies?tab=box"
              className="text-xs text-[#6E7681] hover:text-[#E8923A] transition-colors"
            >
              View fly box →
            </Link>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={saving}
                className="rounded-lg px-4 py-2 text-sm text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={mode === "single" ? submitSingle : submitBulk}
                disabled={saving || (mode === "bulk" && (overLimit || bulkCount === 0))}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-4 py-2 text-sm font-semibold text-[#0D1117] hover:bg-[#F0A45A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {mode === "bulk"
                  ? `Create ${bulkCount} variant${bulkCount === 1 ? "" : "s"}`
                  : "Create variant"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Single form ─── */
type SingleValue = {
  name: string;
  size: string;
  fly_color: string;
  bead_color: string;
  bead_material: string;
  bead_size_mm: string;
  body_color: string;
  tail_color: string;
  thorax_color: string;
  collar_color: string;
  hook: string;
  description: string;
  type: string;
};

function SingleForm({
  value,
  onChange,
  showAdvanced,
  onToggleAdvanced,
}: {
  value: SingleValue;
  onChange: (patch: Partial<SingleValue>) => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}) {
  const input =
    "w-full rounded-lg border border-[#21262D] bg-[#0D1117] px-3 py-2 text-sm text-[#F0F6FC] placeholder:text-[#6E7681] focus:border-[#E8923A] focus:outline-none";
  const label = "block text-xs font-semibold uppercase tracking-wide text-[#A8B2BD] mb-1";

  return (
    <div className="space-y-3">
      <div>
        <label className={label}>Name (optional)</label>
        <input
          className={input}
          placeholder="Leave blank to auto-name from changes"
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Size</label>
          <input
            className={input}
            placeholder="#16"
            value={value.size}
            onChange={(e) => onChange({ size: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Fly color</label>
          <input
            className={input}
            placeholder="Olive"
            value={value.fly_color}
            onChange={(e) => onChange({ fly_color: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Bead color</label>
          <input
            className={input}
            placeholder="Copper"
            value={value.bead_color}
            onChange={(e) => onChange({ bead_color: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Hook</label>
          <input
            className={input}
            placeholder="Hanak 300"
            value={value.hook}
            onChange={(e) => onChange({ hook: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <label className={label}>Type (optional override)</label>
          <select
            className={input}
            value={value.type}
            onChange={(e) => onChange({ type: e.target.value })}
          >
            <option value="">— inherit from parent —</option>
            {FLY_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced nymph variation fields */}
      <button
        type="button"
        onClick={onToggleAdvanced}
        className="text-xs font-medium text-[#00B4D8] hover:text-[#E8923A] transition-colors"
      >
        {showAdvanced ? "– Hide bead + body variations" : "+ Vary bead material, body, tail, thorax…"}
      </button>

      {showAdvanced && (
        <div className="space-y-3 rounded-lg border border-[#21262D] bg-[#0D1117] p-3">
          <p className="text-[11px] text-[#6E7681] leading-snug">
            Great for nymph riffs — same pattern, tungsten vs brass, or different body/thorax color.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Bead material</label>
              <select
                className={input}
                value={value.bead_material}
                onChange={(e) => onChange({ bead_material: e.target.value })}
              >
                {BEAD_MATERIALS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Bead size (mm)</label>
              <input
                className={input}
                list="variant-bead-mm"
                inputMode="decimal"
                placeholder="3.2"
                value={value.bead_size_mm}
                onChange={(e) => onChange({ bead_size_mm: e.target.value })}
              />
              <datalist id="variant-bead-mm">
                {COMMON_BEAD_SIZES_MM.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div>
              <label className={label}>Body color</label>
              <input
                className={input}
                placeholder="Olive"
                value={value.body_color}
                onChange={(e) => onChange({ body_color: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Tail color</label>
              <input
                className={input}
                placeholder="CDL"
                value={value.tail_color}
                onChange={(e) => onChange({ tail_color: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Thorax color</label>
              <input
                className={input}
                placeholder="Black"
                value={value.thorax_color}
                onChange={(e) => onChange({ thorax_color: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Collar color</label>
              <input
                className={input}
                placeholder="Partridge"
                value={value.collar_color}
                onChange={(e) => onChange({ collar_color: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className={label}>Tying notes (optional)</label>
        <textarea
          rows={2}
          className={input}
          placeholder="What's different about this variant…"
          value={value.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>
    </div>
  );
}

/* ─── Bulk form ─── */
function BulkForm({
  sizes,
  colors,
  beads,
  sizeInput,
  colorInput,
  beadInput,
  setSizeInput,
  setColorInput,
  setBeadInput,
  onAddSize,
  onAddColor,
  onAddBead,
  onRemoveSize,
  onRemoveColor,
  onRemoveBead,
  parentName,
  count,
  overLimit,
}: {
  sizes: string[];
  colors: string[];
  beads: string[];
  sizeInput: string;
  colorInput: string;
  beadInput: string;
  setSizeInput: (v: string) => void;
  setColorInput: (v: string) => void;
  setBeadInput: (v: string) => void;
  onAddSize: (v: string) => void;
  onAddColor: (v: string) => void;
  onAddBead: (v: string) => void;
  onRemoveSize: (v: string) => void;
  onRemoveColor: (v: string) => void;
  onRemoveBead: (v: string) => void;
  parentName: string;
  count: number;
  overLimit: boolean;
}) {
  return (
    <div className="space-y-4">
      <AxisField
        label="Sizes"
        placeholder="14, 16, 18…"
        values={sizes}
        input={sizeInput}
        setInput={setSizeInput}
        onAdd={onAddSize}
        onRemove={onRemoveSize}
        suggestions={SUGGESTED_SIZES}
      />
      <AxisField
        label="Colors"
        placeholder="Olive, black, rust…"
        values={colors}
        input={colorInput}
        setInput={setColorInput}
        onAdd={onAddColor}
        onRemove={onRemoveColor}
        suggestions={SUGGESTED_COLORS}
      />
      <AxisField
        label="Bead colors"
        placeholder="Copper, gold, silver…"
        values={beads}
        input={beadInput}
        setInput={setBeadInput}
        onAdd={onAddBead}
        onRemove={onRemoveBead}
        suggestions={SUGGESTED_BEADS}
      />

      <div className="rounded-lg border border-[#21262D] bg-[#0D1117] px-3 py-2.5 text-xs text-[#A8B2BD]">
        <p className="font-medium text-[#F0F6FC] mb-0.5">
          Will create <span className="text-[#E8923A]">{count}</span> variant
          {count === 1 ? "" : "s"}
        </p>
        <p className="text-[#6E7681]">
          Example name:{" "}
          <span className="text-[#A8B2BD]">
            {parentName}
            {sizes[0] ? ` #${sizes[0]}` : ""}
            {colors[0] ? ` ${colors[0]}` : ""}
            {beads[0] ? ` · ${beads[0]} bead` : ""}
          </span>
        </p>
        {overLimit && (
          <p className="mt-1 text-red-400">
            Cap is 48 per batch. Trim one of the axes.
          </p>
        )}
      </div>
    </div>
  );
}

function AxisField({
  label,
  placeholder,
  values,
  input,
  setInput,
  onAdd,
  onRemove,
  suggestions,
}: {
  label: string;
  placeholder: string;
  values: string[];
  input: string;
  setInput: (v: string) => void;
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  suggestions: string[];
}) {
  const inputCls =
    "flex-1 rounded-lg border border-[#21262D] bg-[#0D1117] px-3 py-2 text-sm text-[#F0F6FC] placeholder:text-[#6E7681] focus:border-[#E8923A] focus:outline-none";

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-[#A8B2BD] mb-1.5">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          className={inputCls}
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
          className="rounded-lg border border-[#21262D] bg-[#161B22] px-3 text-sm text-[#A8B2BD] hover:text-[#E8923A] hover:border-[#E8923A]/40 transition-colors"
        >
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {values.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onRemove(v)}
              className="group inline-flex items-center gap-1 rounded-full border border-[#E8923A]/30 bg-[#E8923A]/10 px-2.5 py-1 text-xs text-[#E8923A] hover:bg-[#E8923A]/20 transition-colors"
            >
              {v}
              <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {suggestions
            .filter((s) => !values.includes(s))
            .slice(0, 7)
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onAdd(s)}
                className="rounded-full border border-[#21262D] bg-[#161B22] px-2 py-0.5 text-[11px] text-[#6E7681] hover:text-[#E8923A] hover:border-[#E8923A]/30 transition-colors"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
