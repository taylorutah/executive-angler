"use client";
/**
 * QuickFlyAddSheet — modal for adding a fly to a specific box in one shot.
 *
 * Two-step flow:
 *   1. Search a pattern by name (canonical or personal).
 *   2. Pick size(s) + optional bead axes, set qty per variant, hit Add.
 *
 * Wraps bulkCreateVariantsAction so the new variants land in the target box
 * with stock seeded — same backend path as BulkVariantBuilder, just scoped
 * to a single box and reachable from the box detail page.
 */
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Search, X, Loader2, ArrowLeft, Check } from "lucide-react";
import { bulkCreateVariantsAction } from "@/app/flies/v2/actions";
import type { BeadMaterial } from "@/types/fly-v2";

interface PatternResult {
  id: string;
  slug: string | null;
  name: string;
  category: string | null;
  hero_image_url: string | null;
  source: "canonical" | "personal";
}

interface Props {
  boxId: string;
  boxName: string;
  onClose: () => void;
  onSuccess: (created: number, addedToBox: number) => void;
}

const SIZE_PRESETS = ["8", "10", "12", "14", "16", "18", "20", "22", "24", "26"];
const BEAD_WEIGHT_PRESETS = [1.5, 2.0, 2.4, 2.8, 3.0, 3.3, 3.8, 4.0];
const BEAD_COLOR_PRESETS = ["copper", "black", "silver", "gold", "white", "red", "hot pink", "olive"];
const BEAD_MATERIAL_OPTIONS: BeadMaterial[] = ["tungsten", "brass", "glass", "none"];

const chipBase =
  "inline-flex items-center px-2.5 h-7 rounded-full text-[12px] border transition-colors cursor-pointer select-none";
const chipOff =
  "border-[#30363D] bg-[#0D1117] text-[#A8B2BD] hover:border-[#484F58] hover:text-[#F0F6FC]";
const chipOn = "border-[#E8923A] bg-[rgba(232,146,58,0.15)] text-[#E8923A]";

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
            <span key={`custom-${String(v)}`} className={`${chipBase} ${chipOn}`}>
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
        )}
      </div>
    </div>
  );
}

export default function QuickFlyAddSheet({ boxId, boxName, onClose, onSuccess }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatternResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<PatternResult | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [sizes, setSizes] = useState<string[]>([]);
  const [beadWeights, setBeadWeights] = useState<number[]>([]);
  const [beadColors, setBeadColors] = useState<string[]>([]);
  const [beadMaterials, setBeadMaterials] = useState<BeadMaterial[]>([]);
  const [qty, setQty] = useState(3);

  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ tone: "info" | "error"; msg: string } | null>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (selected) return;
    const handle = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/flies/search-v2?q=${encodeURIComponent(query)}&limit=12`);
        if (res.ok) {
          const data = (await res.json()) as { results: PatternResult[] };
          setResults(data.results ?? []);
        }
      } catch {
        // ignore
      } finally {
        setSearching(false);
      }
    }, 180);
    return () => clearTimeout(handle);
  }, [query, selected]);

  const variantCount = useMemo(() => {
    if (sizes.length === 0) return 0;
    const a = beadWeights.length || 1;
    const b = beadColors.length || 1;
    const c = beadMaterials.length || 1;
    return sizes.length * a * b * c;
  }, [sizes, beadWeights, beadColors, beadMaterials]);

  const submit = () => {
    if (!selected) return;
    setStatus(null);
    if (sizes.length === 0) {
      setStatus({ tone: "error", msg: "Pick at least one size." });
      return;
    }
    startTransition(async () => {
      const result = await bulkCreateVariantsAction({
        pattern_id: selected.id,
        pattern_slug: selected.slug ?? "",
        sizes,
        bead_weights_mm: beadWeights.length ? beadWeights : undefined,
        bead_colors: beadColors.length ? beadColors : undefined,
        bead_materials: beadMaterials.length ? beadMaterials : undefined,
        add_to_box: { box_id: boxId, quantity_per_variant: Math.max(1, qty) },
      });
      if (!result.ok) {
        setStatus({ tone: "error", msg: result.error ?? "Failed to add." });
        return;
      }
      onSuccess(result.created ?? 0, result.addedToBox ?? 0);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-[#21262D] bg-[#161B22] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#21262D]">
          <div className="flex items-center gap-2 min-w-0">
            {selected && (
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setSizes([]);
                  setBeadWeights([]);
                  setBeadColors([]);
                  setBeadMaterials([]);
                  setStatus(null);
                }}
                className="text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors"
                aria-label="Back to search"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="min-w-0">
              <h2 className="font-heading text-base font-bold text-[#F0F6FC] truncate">
                Quick Fly Add
              </h2>
              <p className="text-[11px] text-[#6E7681] truncate">to {boxName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6E7681] hover:text-[#F0F6FC] transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step 1: search */}
        {!selected && (
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6E7681]" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search canonical & personal flies…"
                className="w-full rounded-md border border-[#30363D] bg-[#0D1117] py-2 pl-9 pr-9 text-sm text-[#F0F6FC] placeholder-[#484F58] outline-none focus:border-[#E8923A]"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#6E7681]" />
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto -mx-4 px-4">
              {results.length === 0 && !searching && (
                <p className="py-8 text-center text-xs text-[#6E7681]">
                  {query ? "No flies match." : "Type to search…"}
                </p>
              )}
              <ul className="space-y-1">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(r)}
                      className="flex w-full items-center gap-3 rounded-md border border-transparent hover:border-[#E8923A]/40 hover:bg-[#0D1117] p-2 text-left transition-colors"
                    >
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-[#0D1117]">
                        {r.hero_image_url ? (
                          <Image
                            src={r.hero_image_url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-base">
                            🪰
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#F0F6FC] truncate">
                          {r.name}
                        </p>
                        <p className="text-[10px] text-[#6E7681] truncate">
                          {r.category ?? "—"}
                          {r.source === "personal" && (
                            <span className="ml-1.5 rounded bg-[#0BA5C7]/15 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#0BA5C7]">
                              Mine
                            </span>
                          )}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: configure variants */}
        {selected && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3 rounded-md border border-[#21262D] bg-[#0D1117] p-2">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-[#161B22]">
                {selected.hero_image_url ? (
                  <Image
                    src={selected.hero_image_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg">🪰</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#F0F6FC] truncate">{selected.name}</p>
                <p className="text-[10px] text-[#6E7681] truncate">
                  {selected.category ?? "—"}
                  {selected.source === "personal" && (
                    <span className="ml-1.5 text-[#0BA5C7]">· personal</span>
                  )}
                </p>
              </div>
            </div>

            <MultiChipPicker
              label="Sizes (required)"
              presets={SIZE_PRESETS}
              value={sizes}
              onChange={setSizes}
              customPlaceholder="Add size"
            />

            <MultiChipPicker
              label="Bead size (mm)"
              presets={BEAD_WEIGHT_PRESETS}
              value={beadWeights}
              onChange={setBeadWeights}
              format={(n) => `${n}mm`}
              customPlaceholder="Add mm"
            />

            <MultiChipPicker
              label="Bead color"
              presets={BEAD_COLOR_PRESETS}
              value={beadColors}
              onChange={setBeadColors}
              customPlaceholder="Add color"
            />

            <MultiChipPicker<BeadMaterial>
              label="Bead material"
              presets={BEAD_MATERIAL_OPTIONS}
              value={beadMaterials}
              onChange={setBeadMaterials}
              allowCustom={false}
            />

            <div className="grid grid-cols-2 gap-3">
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
              <div className="rounded-md border border-[#21262D] bg-[#0D1117] px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6E7681]">
                  Will create
                </p>
                <p className="text-sm font-semibold text-[#E8923A]">
                  {variantCount} variant{variantCount === 1 ? "" : "s"} · {variantCount * qty} flies
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
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
                disabled={isPending || variantCount === 0}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#E8923A] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#d17d28] transition-colors"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {isPending
                  ? "Adding…"
                  : variantCount === 0
                  ? "Pick sizes"
                  : `Add to ${boxName}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
