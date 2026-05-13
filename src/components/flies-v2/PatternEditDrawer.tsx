"use client";
/**
 * PatternEditDrawer — full-pattern editor for canonical (admin) and personal
 * (owner) flies. Centered full-screen modal (max-w-7xl) on desktop with 24px
 * gutter, full-screen on mobile. Tabular tabs (Recipe/Steps/Variants) use
 * the full body width; text-heavy tabs (Identity/Editorial/Danger) constrain
 * to max-w-3xl/2xl for readable line length.
 *
 * Tabs:
 *   1. Identity   — name, slug, category, hook style, hero image
 *   2. Recipe     — base materials slot/role grid (RecipeBuilder)
 *   3. Steps      — ordered tying steps with photos (TyingStepsEditor)
 *   4. Editorial  — description, history, tying overview, fishing tips
 *   5. Variants   — bulk variant builder (BulkVariantBuilder)
 *   6. Danger     — soft-delete pattern (typed confirmation)
 *
 * Per-tab dirty tracking + per-tab Save: one bad field doesn't block another.
 *
 * Permissions are gated server-side; this component is mounted only when
 * canEditPattern() returned true on the server, so we don't re-check here.
 */
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { X, Upload, AlertTriangle } from "lucide-react";
import { RecipeBuilder, type RecipeStep } from "@/components/flies/RecipeBuilder";
import TyingStepsEditor from "@/components/flies-v2/TyingStepsEditor";
import BulkVariantBuilder from "@/components/flies-v2/BulkVariantBuilder";
import {
  updatePatternAction,
  uploadPatternHeroAction,
} from "@/app/flies/v2/actions";
import type { Pattern, MaterialSlot, TyingStep, FlyBoxV2 } from "@/types/fly-v2";
import type { RecipeRole } from "@/types/materials";
import { parseBeadSpec } from "@/lib/flies/parseBeadSpec";

interface Props {
  pattern: Pattern;
  boxes: FlyBoxV2[];
  isAdmin: boolean;
  open: boolean;
  onClose: () => void;
  onPatternChanged?: (pattern: Pattern) => void;
}

type TabKey = "identity" | "recipe" | "steps" | "editorial" | "variants" | "danger";

const TABS: { key: TabKey; label: string }[] = [
  { key: "identity", label: "Identity" },
  { key: "recipe", label: "Recipe" },
  { key: "steps", label: "Steps" },
  { key: "editorial", label: "Editorial" },
  { key: "variants", label: "Variants" },
  { key: "danger", label: "Danger" },
];

const KNOWN_ROLES = new Set<RecipeRole>([
  "hook", "bead", "thread", "tail", "body", "ribbing",
  "wing", "hackle", "head", "tag", "hotspot", "eye",
  "collar", "thorax", "abdomen", "shellback", "legs", "antennae", "post",
]);

// Slot-name aliases: legacy/abbreviated names users sometimes use that should
// map to the canonical RecipeRole. Keep this list tight — only obvious synonyms.
const SLOT_ALIASES: Record<string, RecipeRole> = {
  rib: "ribbing",
  abdom: "abdomen",
  collr: "collar",
};

function resolveRole(slot: string | null | undefined): RecipeRole {
  if (!slot) return "body";
  if (KNOWN_ROLES.has(slot as RecipeRole)) return slot as RecipeRole;
  const aliased = SLOT_ALIASES[slot.toLowerCase()];
  if (aliased) return aliased;
  return "body";
}

function slotsToSteps(slots: MaterialSlot[]): RecipeStep[] {
  return (slots ?? []).map((s, i) => {
    const role = resolveRole(s.slot);
    const step: RecipeStep = {
      id: `slot-${i}-${s.slot}`,
      role,
      material: null,
      materialName: s.material ?? "",
      colorChoice: "",
      sizeChoice: "",
      quantity: "",
      weightChoice: "",
      materialTypeChoice: "",
      finishChoice: "",
      brandChoice: "",
      notes: s.description ?? "",
      isOptional: !!s.is_optional,
    };

    // For bead rows, parse the free-text material string into structured
    // fields so the BeadMaterial/Shape/Size/Color cells render the real
    // values instead of blank placeholders.
    if (role === "bead" && s.material) {
      const parsed = parseBeadSpec(s.material);
      if (parsed.material) step.materialTypeChoice = parsed.material;
      if (parsed.finish) step.finishChoice = parsed.finish;
      if (parsed.weight_mm != null) step.sizeChoice = String(parsed.weight_mm);
      if (parsed.color) step.colorChoice = parsed.color;
      // Clear materialName so the bead row's structured controls own the
      // cell. composeBeadName() rebuilds it on save via stepsToSlots.
      if (parsed.material || parsed.finish || parsed.weight_mm != null || parsed.color) {
        step.materialName = "";
      }
    }

    return step;
  });
}

function stepsToSlots(steps: RecipeStep[]): MaterialSlot[] {
  return steps.map((s) => {
    // Bead row: recompose the canonical "<finish> <material>, <color>, <size>mm"
    // string from structured fields so base_materials stays in sync with what
    // the user picked. Falls through to materialName when no structured fields
    // are set (e.g. legacy patterns that haven't been touched).
    if (s.role === "bead") {
      const parts: string[] = [];
      const finish = s.finishChoice?.trim();
      const material = s.materialTypeChoice?.trim();
      const color = s.colorChoice?.trim();
      const size = s.sizeChoice?.trim();
      if (finish && material) parts.push(`${capitalize(finish)} ${material}`);
      else if (material) parts.push(capitalize(material));
      else if (finish) parts.push(capitalize(finish));
      if (color) parts.push(color);
      if (size) parts.push(/mm$/i.test(size) ? size : `${size}mm`);
      const composed = parts.join(", ");
      return {
        slot: s.role,
        material: composed || s.materialName || s.material?.name || "",
        description: s.notes || undefined,
        brand: s.material?.brand || undefined,
        is_optional: s.isOptional || undefined,
      };
    }
    return {
      slot: s.role,
      material: s.materialName || s.material?.name || "",
      description: s.notes || undefined,
      brand: s.material?.brand || undefined,
      is_optional: s.isOptional || undefined,
    };
  });
}

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

const inputCls =
  "w-full rounded-md border border-[#30363D] bg-[#0D1117] px-2.5 py-1.5 text-sm text-[#F0F6FC] placeholder-[#484F58] focus:border-[#E8923A] outline-none";
const labelCls =
  "block text-[10px] font-bold uppercase tracking-widest text-[#6E7681] mb-1";

const CATEGORY_OPTIONS = [
  "nymph", "dry", "emerger", "streamer", "wet", "terrestrial",
  "saltwater", "warmwater", "salmon", "steelhead", "egg", "worm",
];

export default function PatternEditDrawer({
  pattern,
  boxes,
  isAdmin,
  open,
  onClose,
  onPatternChanged,
}: Props) {
  const [tab, setTab] = useState<TabKey>("identity");
  const [current, setCurrent] = useState<Pattern>(pattern);

  // Per-tab dirty state (each tab tracks its own draft).
  const [identity, setIdentity] = useState({
    name: pattern.name,
    slug: pattern.slug ?? "",
    category: pattern.category ?? "",
    hook_style: pattern.hook_style ?? "",
    hero_image_url: pattern.hero_image_url ?? "",
    active_variant_axes: pattern.active_variant_axes ?? null,
  });
  const [recipe, setRecipe] = useState<RecipeStep[]>(slotsToSteps(pattern.base_materials));
  const [steps, setSteps] = useState<TyingStep[]>(pattern.tying_steps ?? []);
  const [editorial, setEditorial] = useState({
    description: pattern.description ?? "",
    history: pattern.history ?? "",
    tying_overview: pattern.tying_overview ?? "",
    fishing_tips: pattern.fishing_tips ?? "",
  });

  // Reset drafts when the pattern prop changes (e.g. after a successful save).
  useEffect(() => {
    setCurrent(pattern);
    setIdentity({
      name: pattern.name,
      slug: pattern.slug ?? "",
      category: pattern.category ?? "",
      hook_style: pattern.hook_style ?? "",
      hero_image_url: pattern.hero_image_url ?? "",
      active_variant_axes: pattern.active_variant_axes ?? null,
    });
    setRecipe(slotsToSteps(pattern.base_materials));
    setSteps(pattern.tying_steps ?? []);
    setEditorial({
      description: pattern.description ?? "",
      history: pattern.history ?? "",
      tying_overview: pattern.tying_overview ?? "",
      fishing_tips: pattern.fishing_tips ?? "",
    });
  }, [pattern]);

  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ tone: "info" | "error"; msg: string } | null>(null);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showStatus = (msg: string, tone: "info" | "error" = "info") => {
    setStatus({ msg, tone });
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatus(null), tone === "error" ? 5000 : 2500);
  };
  useEffect(() => () => { if (statusTimer.current) clearTimeout(statusTimer.current); }, []);

  const patternIsCanonical = current.owner_user_id === null;
  const canRenameSlug = isAdmin && patternIsCanonical;

  // Esc closes; Cmd+S saves current tab.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveCurrentTab();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab, identity, recipe, steps, editorial]);

  const saveIdentity = () => {
    if (!identity.name.trim()) {
      showStatus("Name is required.", "error");
      return;
    }
    const slugTrimmed = identity.slug.trim();
    startTransition(async () => {
      const r = await updatePatternAction({
        pattern_id: current.id,
        pattern_slug: current.slug ?? "",
        fields: {
          name: identity.name.trim(),
          slug: canRenameSlug ? (slugTrimmed || null) : undefined,
          category: identity.category || null,
          hook_style: identity.hook_style || null,
          active_variant_axes: identity.active_variant_axes,
          // hero_image_url is updated by the upload action — don't double-write here.
        },
      });
      if (!r.ok) { showStatus(r.error ?? "Save failed.", "error"); return; }
      const next: Pattern = {
        ...current,
        name: identity.name.trim(),
        slug: canRenameSlug ? (slugTrimmed || null) : current.slug,
        category: identity.category || null,
        hook_style: identity.hook_style || null,
        active_variant_axes: identity.active_variant_axes,
      };
      setCurrent(next);
      onPatternChanged?.(next);
      showStatus(r.newSlug && r.newSlug !== current.slug ? `Saved. New URL: /flies/${r.newSlug}` : "Identity saved.");
    });
  };

  const saveRecipe = () => {
    startTransition(async () => {
      const slots = stepsToSlots(recipe);
      const r = await updatePatternAction({
        pattern_id: current.id,
        pattern_slug: current.slug ?? "",
        fields: { base_materials: slots },
      });
      if (!r.ok) { showStatus(r.error ?? "Save failed.", "error"); return; }
      const next = { ...current, base_materials: slots };
      setCurrent(next);
      onPatternChanged?.(next);
      showStatus(`Recipe saved (${slots.length} slot${slots.length === 1 ? "" : "s"}).`);
    });
  };

  const saveSteps = () => {
    startTransition(async () => {
      const r = await updatePatternAction({
        pattern_id: current.id,
        pattern_slug: current.slug ?? "",
        fields: { tying_steps: steps },
      });
      if (!r.ok) { showStatus(r.error ?? "Save failed.", "error"); return; }
      const next = { ...current, tying_steps: steps };
      setCurrent(next);
      onPatternChanged?.(next);
      showStatus(`Saved ${steps.length} step${steps.length === 1 ? "" : "s"}.`);
    });
  };

  const saveEditorial = () => {
    startTransition(async () => {
      const r = await updatePatternAction({
        pattern_id: current.id,
        pattern_slug: current.slug ?? "",
        fields: {
          description: editorial.description || null,
          history: editorial.history || null,
          tying_overview: editorial.tying_overview || null,
          fishing_tips: editorial.fishing_tips || null,
        },
      });
      if (!r.ok) { showStatus(r.error ?? "Save failed.", "error"); return; }
      const next = {
        ...current,
        description: editorial.description || null,
        history: editorial.history || null,
        tying_overview: editorial.tying_overview || null,
        fishing_tips: editorial.fishing_tips || null,
      };
      setCurrent(next);
      onPatternChanged?.(next);
      showStatus("Editorial saved.");
    });
  };

  const saveCurrentTab = () => {
    if (tab === "identity") saveIdentity();
    else if (tab === "recipe") saveRecipe();
    else if (tab === "steps") saveSteps();
    else if (tab === "editorial") saveEditorial();
  };

  // Hero upload
  const heroFileRef = useRef<HTMLInputElement | null>(null);
  const onHeroFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { showStatus("File over 5 MB.", "error"); return; }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("pattern_id", current.id);
      fd.set("pattern_slug", current.slug ?? "");
      const r = await uploadPatternHeroAction(fd);
      if (!r.ok || !r.url) { showStatus(r.error ?? "Upload failed.", "error"); return; }
      setIdentity((s) => ({ ...s, hero_image_url: r.url! }));
      const next = { ...current, hero_image_url: r.url! };
      setCurrent(next);
      onPatternChanged?.(next);
      showStatus("Hero image uploaded.");
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center bg-black/60 sm:p-6">
      {/* Backdrop — click to close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close editor"
        className="absolute inset-0"
      />
      {/* Panel — centered, near-full-screen, capped at 7xl on wide displays */}
      <div className="relative w-full max-w-7xl h-full sm:h-[calc(100vh-3rem)] bg-[#0D1117] border border-[#21262D] sm:rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#21262D] px-5 py-3 bg-[#161B22]">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0BA5C7] mb-0.5">
              Edit pattern · {patternIsCanonical ? "Canonical" : "Personal"}
            </p>
            <h2 className="font-['DM_Serif_Display'] text-lg text-[#F0F6FC] truncate">
              {current.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6E7681] hover:text-[#F0F6FC] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#21262D] bg-[#0D1117] overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                tab === t.key
                  ? "border-[#E8923A] text-[#F0F6FC]"
                  : "border-transparent text-[#6E7681] hover:text-[#A8B2BD]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body — text-heavy tabs (identity/editorial/danger) get a max-width
            for readable line length. Tabular tabs (recipe/steps/variants)
            stay full-width to use the modal's extra room. */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === "identity" && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div>
                <label className={labelCls}>Name</label>
                <input
                  type="text"
                  value={identity.name}
                  onChange={(e) => setIdentity((s) => ({ ...s, name: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Slug{" "}
                  <span className="normal-case tracking-normal text-[#484F58]">
                    /flies/<span className="text-[#0BA5C7]">{identity.slug || "—"}</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={identity.slug}
                  onChange={(e) => setIdentity((s) => ({ ...s, slug: e.target.value }))}
                  disabled={!canRenameSlug}
                  className={`${inputCls} ${!canRenameSlug ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder="silver-bullet-baetis"
                />
                {canRenameSlug && identity.slug !== (current.slug ?? "") && (
                  <p className="mt-1 text-[11px] text-[#E8923A] flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 mt-0.5" />
                    Old URL <code className="bg-[#161B22] px-1 rounded">/flies/{current.slug}</code> will 301-redirect to the new one.
                  </p>
                )}
                {!canRenameSlug && !patternIsCanonical && (
                  <p className="mt-1 text-[11px] text-[#6E7681]">Slug is fixed for personal patterns.</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    value={identity.category}
                    onChange={(e) => setIdentity((s) => ({ ...s, category: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">—</option>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    {identity.category && !CATEGORY_OPTIONS.includes(identity.category) && (
                      <option value={identity.category}>{identity.category}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Hook style</label>
                  <input
                    type="text"
                    value={identity.hook_style}
                    onChange={(e) => setIdentity((s) => ({ ...s, hook_style: e.target.value }))}
                    placeholder="jig, scud, dry, streamer…"
                    className={inputCls}
                  />
                </div>
              </div>
              {isAdmin && patternIsCanonical && (
                <div>
                  <label className={labelCls}>Variant axis columns</label>
                  <p className="mt-0.5 mb-2 text-[11px] text-[#6E7681]">
                    Which option columns to show on the variants table. Leave on
                    auto to use the category default ({identity.category || "—"}).
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(["size","bead","body","rib","tail","wing","thorax","collar","hackle","hook"] as const).map((axis) => {
                      const active = identity.active_variant_axes?.includes(axis) ?? false;
                      const customized = identity.active_variant_axes != null;
                      // size is always shown — disable toggle so admins can't break it.
                      const isLocked = axis === "size";
                      return (
                        <button
                          key={axis}
                          type="button"
                          disabled={isLocked}
                          onClick={() => {
                            setIdentity((s) => {
                              const current = s.active_variant_axes ?? ["size","bead","body"];
                              const next = active
                                ? current.filter((a) => a !== axis)
                                : [...current, axis];
                              return { ...s, active_variant_axes: next };
                            });
                          }}
                          className={`inline-flex items-center rounded border px-2 py-1 text-[11px] transition-colors ${
                            (customized && active) || (!customized && (axis === "size" || axis === "bead" || axis === "body"))
                              ? "border-[#E8923A]/60 bg-[#E8923A]/15 text-[#E8923A]"
                              : "border-[#21262D] bg-[#161B22] text-[#A8B2BD] hover:border-[#E8923A]/40 hover:text-[#F0F6FC]"
                          } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          {axis}
                        </button>
                      );
                    })}
                    {identity.active_variant_axes != null && (
                      <button
                        type="button"
                        onClick={() => setIdentity((s) => ({ ...s, active_variant_axes: null }))}
                        className="inline-flex items-center rounded border border-[#21262D] bg-[#0D1117] px-2 py-1 text-[11px] text-[#6E7681] hover:text-[#F0F6FC]"
                        title="Revert to per-category default"
                      >
                        Reset to auto
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div>
                <label className={labelCls}>Hero image</label>
                <div className="flex items-start gap-3">
                  <div className="relative w-32 h-32 rounded-md overflow-hidden border border-[#21262D] bg-[#161B22] flex-shrink-0">
                    {identity.hero_image_url ? (
                      <Image
                        src={identity.hero_image_url}
                        alt="Hero"
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[#484F58] text-xs">
                        no image
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => heroFileRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#161B22] border border-[#30363D] px-3 py-1.5 text-xs text-[#F0F6FC] hover:border-[#E8923A] transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {identity.hero_image_url ? "Replace" : "Upload"}
                    </button>
                    {identity.hero_image_url && (
                      <button
                        type="button"
                        onClick={() => {
                          setIdentity((s) => ({ ...s, hero_image_url: "" }));
                          startTransition(async () => {
                            const r = await updatePatternAction({
                              pattern_id: current.id,
                              pattern_slug: current.slug ?? "",
                              fields: { hero_image_url: null },
                            });
                            if (!r.ok) showStatus(r.error ?? "Save failed.", "error");
                            else {
                              const next = { ...current, hero_image_url: null };
                              setCurrent(next);
                              onPatternChanged?.(next);
                              showStatus("Hero removed.");
                            }
                          });
                        }}
                        className="block text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-[10px] text-[#6E7681] max-w-[200px]">
                      JPG / PNG / WebP up to 5 MB.
                    </p>
                    <input
                      ref={heroFileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onHeroFile(f);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "recipe" && (
            <div className="space-y-3">
              <p className="text-[12px] text-[#A8B2BD]">
                The base recipe — slot, role, and material per row. Per-fly choices like exact size,
                color, and bead weight live on each <strong className="text-[#F0F6FC]">variant</strong>{" "}
                (Variants tab).
              </p>
              <RecipeBuilder initialSteps={recipe} onChange={setRecipe} />
            </div>
          )}

          {tab === "steps" && (
            <div className="space-y-3">
              <p className="text-[12px] text-[#A8B2BD]">
                Ordered tying instructions. Drag to reorder. Each step can have a photo
                (uploaded to <code className="text-[10px] bg-[#161B22] px-1 rounded">pattern-step-photos</code>).
              </p>
              <TyingStepsEditor patternId={current.id} value={steps} onChange={setSteps} />
            </div>
          )}

          {tab === "editorial" && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div>
                <label className={labelCls}>
                  Description{" "}
                  <span className="normal-case tracking-normal text-[#484F58]">
                    {editorial.description.length} chars
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={editorial.description}
                  onChange={(e) => setEditorial((s) => ({ ...s, description: e.target.value }))}
                  className={`${inputCls} resize-y min-h-[60px]`}
                />
              </div>
              <div>
                <label className={labelCls}>History</label>
                <textarea
                  rows={4}
                  value={editorial.history}
                  onChange={(e) => setEditorial((s) => ({ ...s, history: e.target.value }))}
                  className={`${inputCls} resize-y min-h-[80px]`}
                />
              </div>
              <div>
                <label className={labelCls}>Tying overview</label>
                <textarea
                  rows={4}
                  value={editorial.tying_overview}
                  onChange={(e) => setEditorial((s) => ({ ...s, tying_overview: e.target.value }))}
                  className={`${inputCls} resize-y min-h-[80px]`}
                />
              </div>
              <div>
                <label className={labelCls}>Fishing tips</label>
                <textarea
                  rows={4}
                  value={editorial.fishing_tips}
                  onChange={(e) => setEditorial((s) => ({ ...s, fishing_tips: e.target.value }))}
                  className={`${inputCls} resize-y min-h-[80px]`}
                />
              </div>
            </div>
          )}

          {tab === "variants" && (
            <BulkVariantBuilder
              patternId={current.id}
              patternSlug={current.slug ?? ""}
              boxes={boxes}
              isAdmin={isAdmin}
              patternIsCanonical={patternIsCanonical}
              onCreated={(n, added) => {
                showStatus(
                  added > 0
                    ? `Created ${n} variant${n === 1 ? "" : "s"}, added ${added} to box.`
                    : `Created ${n} variant${n === 1 ? "" : "s"}.`,
                );
              }}
            />
          )}

          {tab === "danger" && (
            <DangerTab pattern={current} onDeleted={onClose} />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#21262D] bg-[#161B22] px-5 py-3 flex items-center justify-between gap-3">
          <div aria-live="polite" className="text-xs min-h-[18px]">
            {status && (
              <span className={status.tone === "error" ? "text-red-400" : "text-[#0BA5C7]"}>
                {status.msg}
              </span>
            )}
          </div>
          {tab !== "variants" && tab !== "danger" && (
            <button
              type="button"
              onClick={saveCurrentTab}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#E8923A] px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-[#d17d28] transition-colors"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DangerTab({ pattern, onDeleted }: { pattern: Pattern; onDeleted: () => void }) {
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirm.trim() === pattern.name;

  const submit = () => {
    if (!canDelete) return;
    setError(null);
    startTransition(async () => {
      // Soft-delete by clearing slug + name suffix would lose audit trail;
      // instead we set hero_image_url=null AND slug=null AND name+="(deleted)".
      // Hard delete should go through admin tooling, not the public drawer.
      const { updatePatternAction } = await import("@/app/flies/v2/actions");
      const r = await updatePatternAction({
        pattern_id: pattern.id,
        pattern_slug: pattern.slug ?? "",
        fields: {
          name: `${pattern.name} (archived)`,
          slug: null,
        },
      });
      if (!r.ok) { setError(r.error ?? "Failed to archive."); return; }
      onDeleted();
    });
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="rounded-md border border-red-500/40 bg-red-500/5 p-4">
        <h3 className="text-red-300 font-semibold text-sm mb-1 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          Archive pattern
        </h3>
        <p className="text-xs text-[#A8B2BD] mb-3">
          Archiving renames this pattern with an &ldquo;(archived)&rdquo; suffix and removes its slug
          (so the public URL 404s). Variants and catches are preserved. To fully delete a pattern,
          use the admin Supabase dashboard.
        </p>
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E7681]">
            Type the pattern name to confirm:{" "}
            <span className="text-[#E8923A] normal-case tracking-normal">{pattern.name}</span>
          </label>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-md border border-[#30363D] bg-[#0D1117] px-2.5 py-1.5 text-sm text-[#F0F6FC] focus:border-red-400 outline-none"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="button"
            onClick={submit}
            disabled={!canDelete || isPending}
            className="inline-flex items-center rounded-md bg-red-500/80 px-4 py-2 text-sm font-medium text-white disabled:opacity-30 hover:bg-red-500 transition-colors"
          >
            {isPending ? "Archiving…" : "Archive pattern"}
          </button>
        </div>
      </div>
    </div>
  );
}
