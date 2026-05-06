"use client";

/**
 * PersonalizeSheet — slide-in drawer for editing the viewer's personalization
 * of a canonical fly. Rebuilt 2026-05-06 to fix: (a) blank slot rows when the
 * canonical only had `fly_recipe_ingredients`, not `materials_list`; and
 * (b) saved overrides not pre-filling on reopen.
 *
 * Data sources (loaded on open):
 *   - canonical_flies row (passed in via prop) — sizes, colors, bead_options,
 *     hook_styles, materials_list
 *   - fly_recipe_ingredients (fetched on open) — structured slot rows with
 *     role + material + size_choice + color_choice
 *   - user_fly_box row (fetched on open) — personalizations / preferred_sizes /
 *     personal_notes / custom_name
 *
 * Slot rows render in this priority order: structured ingredients first
 * (Hook → Bead → Thread → Tail → Body → …), falling back to the older
 * materials_list jsonb if no structured rows exist, with a final skeleton
 * if neither has data.
 */

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Loader2, Plus, Check, RotateCcw, Lock } from "lucide-react";
import { deriveSlotKey, type Personalizations } from "@/lib/flies/resolveFlyForViewer";
import PromoteToPatternPrompt from "./PromoteToPatternPrompt";

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

export type { Personalizations };

interface SlotRowDef {
  slot: string;
  label: string;
  /** Canonical default text shown to the user as "default: …". */
  canonicalDefault: string;
  /** True if from `fly_recipe_ingredients` (structured). */
  fromIngredient: boolean;
}

interface Props {
  open: boolean;
  fly: PersonalizeSheetCanonicalFly;
  /** True if the user already has this fly in their box. Drives POST vs PATCH. */
  isInBox: boolean;
  /** Whether the viewer has Pro — controls "+ Add slot" and free-text slot names. */
  isPro?: boolean;
  onClose: () => void;
  /** Called after a successful save with the saved row's data. */
  onSaved: (next: {
    personalizations: Personalizations;
    preferredSizes: string[];
    personalNotes: string;
    customName: string;
  }) => void;
}

export default function PersonalizeSheet({
  open,
  fly,
  isInBox,
  isPro = false,
  onClose,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [personalizations, setPersonalizations] = useState<Personalizations>({});
  const [preferredSizes, setPreferredSizes] = useState<string[]>([]);
  const [personalNotes, setPersonalNotes] = useState("");
  const [customName, setCustomName] = useState("");
  const [extraSlots, setExtraSlots] = useState<SlotRowDef[]>([]);
  const [ingredientRows, setIngredientRows] = useState<SlotRowDef[]>([]);

  // Load both halves of the picture in parallel: structured ingredients
  // (canonical recipe) + the user's saved fly-box row.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const [{ data: ingredients }, { data: userRow }] = await Promise.all([
          supabase
            .from("fly_recipe_ingredients")
            .select("id, role, material_name, color_choice, size_choice, is_optional, step_position, material:tying_materials(name, brand)")
            .eq("canonical_fly_id", fly.id)
            .order("step_position", { ascending: true }),
          supabase
            .from("user_fly_box")
            .select("personalizations, preferred_sizes, personal_notes, custom_name")
            .eq("canonical_fly_id", fly.id)
            .maybeSingle(),
        ]);

        if (cancelled) return;

        // Build slot rows from ingredients when present.
        const rows: SlotRowDef[] = [];
        const seen = new Set<string>();
        if (Array.isArray(ingredients) && ingredients.length > 0) {
          for (const ing of ingredients) {
            const slot = String(ing.role || "").toLowerCase();
            if (!slot || seen.has(slot)) continue;
            seen.add(slot);
            // Supabase returns a one-to-one join as either an object or an array
            // depending on relationship metadata — defensively unwrap both shapes.
            const materialField = ing.material as
              | { name?: string; brand?: string }
              | { name?: string; brand?: string }[]
              | null
              | undefined;
            const material = Array.isArray(materialField)
              ? materialField[0]
              : materialField;
            const canonicalText = [
              material?.name || ing.material_name,
              material?.brand,
              ing.size_choice,
              ing.color_choice,
            ]
              .filter(Boolean)
              .join(" ");
            rows.push({
              slot,
              label: slot.toUpperCase(),
              canonicalDefault: canonicalText,
              fromIngredient: true,
            });
          }
        }

        // Fall back to materials_list if no ingredients.
        if (rows.length === 0 && fly.materialsList?.length) {
          for (const m of fly.materialsList) {
            const slot = deriveSlotKey(m.material);
            if (seen.has(slot)) continue;
            seen.add(slot);
            rows.push({
              slot,
              label: m.material.toUpperCase(),
              canonicalDefault: m.description ?? "",
              fromIngredient: false,
            });
          }
        }

        // Final skeleton.
        if (rows.length === 0) {
          for (const label of ["Hook", "Bead", "Thread", "Body"]) {
            const slot = deriveSlotKey(label);
            seen.add(slot);
            rows.push({ slot, label: label.toUpperCase(), canonicalDefault: "", fromIngredient: false });
          }
        }

        setIngredientRows(rows);

        // Hydrate state from the saved fly-box row (or defaults).
        const saved = (userRow ?? null) as {
          personalizations?: Personalizations | null;
          preferred_sizes?: string[] | null;
          personal_notes?: string | null;
          custom_name?: string | null;
        } | null;
        const savedPersonalizations = saved?.personalizations ?? {};
        setPersonalizations(savedPersonalizations);
        setPreferredSizes(saved?.preferred_sizes ?? []);
        setPersonalNotes(saved?.personal_notes ?? "");
        setCustomName(saved?.custom_name ?? "");

        // Surface any "extra" slots the user has saved that aren't in
        // canonical's recipe — keeps reopens stable for power users.
        const extras: SlotRowDef[] = [];
        for (const slot of Object.keys(savedPersonalizations)) {
          if (seen.has(slot)) continue;
          seen.add(slot);
          extras.push({
            slot,
            label: slot.replace(/_/g, " ").toUpperCase(),
            canonicalDefault: "",
            fromIngredient: false,
          });
        }
        setExtraSlots(extras);
      } catch (e) {
        if (!cancelled) {
          console.error("[PersonalizeSheet] load error:", e);
          setError("Couldn't load this fly's recipe. Try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [open, fly.id, fly.materialsList]);

  const allRows = useMemo(() => [...ingredientRows, ...extraSlots], [ingredientRows, extraSlots]);

  const deviationCount = useMemo(() => {
    const slotCount = Object.values(personalizations).filter(
      (slot) => slot && Object.values(slot).some((v) => v && String(v).trim()),
    ).length;
    return (
      slotCount +
      (preferredSizes.length > 0 ? 1 : 0) +
      (customName.trim() ? 1 : 0)
    );
  }, [personalizations, preferredSizes, customName]);

  function updateSlot(slot: string, key: string, value: string) {
    setPersonalizations((prev) => {
      const next: Personalizations = { ...prev };
      const slotData = { ...(next[slot] ?? {}) } as Record<string, string | undefined>;
      const trimmed = value.trim();
      if (trimmed === "") delete slotData[key];
      else slotData[key] = trimmed;
      if (Object.keys(slotData).length === 0) delete next[slot];
      else next[slot] = slotData;
      return next;
    });
  }

  function clearSlot(slot: string) {
    setPersonalizations((prev) => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
  }

  function toggleSize(size: string) {
    setPreferredSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  }

  function addExtraSlot() {
    if (!isPro) return;
    const name = window.prompt("Slot name (e.g. hot collar, dubbing, post)?");
    if (!name) return;
    const slot = deriveSlotKey(name);
    if (allRows.some((r) => r.slot === slot)) return;
    setExtraSlots((prev) => [
      ...prev,
      { slot, label: name.toUpperCase(), canonicalDefault: "", fromIngredient: false },
    ]);
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
          personal_notes: personalNotes.trim() || null,
          custom_name: customName.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Save failed");
        return;
      }
      onSaved({
        personalizations,
        preferredSizes,
        personalNotes,
        customName,
      });
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
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="flex-1 bg-black/60 backdrop-blur-sm"
      />

      <div className="w-full max-w-lg bg-[#0D1117] border-l border-[#21262D] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262D]">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#E8923A]">
              {isInBox ? "Your version" : "Personalize"}
            </p>
            <h2 className="font-heading text-xl text-[#F0F6FC] truncate">{fly.name}</h2>
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
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#6E7681] py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading recipe…
            </div>
          ) : (
            <>
              <p className="text-xs text-[#6E7681] leading-relaxed">
                Same fly, your specs. Override hook brand, bead size, thread color, body
                material — anything you tie differently. Empty fields fall back to the
                library recipe.
              </p>

              {/* Deviation counter + promote prompt */}
              {deviationCount > 0 && (
                <div className="text-[11px] text-[#A8B2BD]">
                  <span className="font-semibold text-[#E8923A]">{deviationCount}</span>{" "}
                  {deviationCount === 1 ? "field" : "fields"} differ from the library version.
                </div>
              )}
              {deviationCount >= 3 && (
                <PromoteToPatternPrompt
                  canonicalFlyId={fly.id}
                  canonicalName={fly.name}
                  personalizations={personalizations}
                />
              )}

              {/* Custom name */}
              <section>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-1.5">
                  Your name for it
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={`e.g. "Madison ${fly.name}"`}
                  className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
                />
              </section>

              {/* Sizes */}
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

              {/* Slot rows */}
              <div className="space-y-4">
                {allRows.map((row) => (
                  <SlotRow
                    key={row.slot}
                    slot={row.slot}
                    label={row.label}
                    canonicalDefault={row.canonicalDefault}
                    value={personalizations[row.slot] ?? {}}
                    hookStyles={row.slot === "hook" ? fly.hookStyles : undefined}
                    beadOptions={row.slot === "bead" ? fly.beadOptions : undefined}
                    colors={
                      row.slot === "body" || row.slot === "thread" || row.slot === "tail"
                        ? fly.colors
                        : undefined
                    }
                    onUpdate={(key, value) => updateSlot(row.slot, key, value)}
                    onClear={() => clearSlot(row.slot)}
                    isCleared={!personalizations[row.slot]}
                  />
                ))}
              </div>

              {/* Add slot */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={addExtraSlot}
                  disabled={!isPro}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    isPro
                      ? "border border-[#E8923A]/30 text-[#E8923A] hover:bg-[#E8923A]/10"
                      : "border border-[#21262D] text-[#6E7681] cursor-not-allowed"
                  }`}
                  title={isPro ? "Add a custom slot" : "Pro only"}
                >
                  {isPro ? <Plus className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  Add a slot{!isPro && " · Pro"}
                </button>
              </div>

              {/* Personal notes */}
              <section>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-1.5">
                  Notes
                </label>
                <textarea
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  rows={3}
                  placeholder="Hot collar trick, where you fish it, what's working…"
                  className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
                />
              </section>
            </>
          )}
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
              disabled={saving || loading}
              className="flex-[2] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#E8923A] text-[#0D1117] text-sm font-semibold hover:bg-[#F0A65A] disabled:opacity-60 transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isInBox ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isInBox ? "Save changes" : "Add to my fly box"}
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
  onClear,
  isCleared,
}: {
  slot: string;
  label: string;
  canonicalDefault: string;
  value: Record<string, string | undefined>;
  hookStyles?: string[];
  beadOptions?: string[];
  colors?: string[];
  onUpdate: (key: string, value: string) => void;
  onClear: () => void;
  isCleared: boolean;
}) {
  const detailKey = slot === "bead" ? "size" : slot === "thread" ? "denier" : "model";
  const detailPlaceholder =
    slot === "bead" ? "size (e.g. 3.3mm)" : slot === "thread" ? "denier (e.g. 8/0)" : "model / detail";

  return (
    <section className="space-y-2 rounded-lg border border-[#21262D] bg-[#0D1117]/40 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#F0F6FC]">
          {label}
        </h3>
        {!isCleared && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-[10px] text-[#6E7681] hover:text-[#E8923A] transition-colors"
            title="Reset to library default"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>
      {canonicalDefault && (
        <p className="text-[11px] text-[#6E7681] truncate" title={canonicalDefault}>
          Library: <span className="text-[#A8B2BD]">{canonicalDefault}</span>
        </p>
      )}

      {(hookStyles?.length || beadOptions?.length) ? (
        <div className="flex flex-wrap gap-1.5">
          {(hookStyles ?? beadOptions ?? []).map((opt) => {
            const key = hookStyles ? "style" : "size";
            const active = value[key] === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onUpdate(key, active ? "" : opt)}
                className={`px-2 py-0.5 rounded-full text-[11px] transition-colors ${
                  active
                    ? "bg-[#E8923A] text-[#0D1117]"
                    : "bg-[#161B22] border border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/50"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : null}

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
                    ? "bg-[#E8923A] text-[#0D1117]"
                    : "bg-[#161B22] border border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/50"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

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
          placeholder={detailPlaceholder}
          value={value[detailKey] ?? value.model ?? value.size ?? value.denier ?? ""}
          onChange={(e) => onUpdate(detailKey, e.target.value)}
          className="bg-[#161B22] border border-[#21262D] rounded px-2 py-1.5 text-xs text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
        />
      </div>

      {/* Free-text color when canonical doesn't list options */}
      {!colors?.length && (
        <input
          type="text"
          placeholder="color (optional)"
          value={value.color ?? ""}
          onChange={(e) => onUpdate("color", e.target.value)}
          className="w-full bg-[#161B22] border border-[#21262D] rounded px-2 py-1.5 text-xs text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
        />
      )}
    </section>
  );
}
