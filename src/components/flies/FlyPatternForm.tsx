"use client";

/**
 * Shared form for creating and editing fly patterns.
 * - Compact 2-column layout (form + photo sidebar)
 * - Structured RecipeBuilder by default, simple-text fallback
 * - Hook autocomplete via materials DB falls out of using RecipeBuilder
 * - Bead simplified to Material / Color / Size (mm) / Shape (no brand picker)
 * - Photo cropper preserved (1:1, 1×–3× zoom, 1600px max)
 *
 * Used by both `/journal/flies/new` and `/journal/flies/[id]/edit`.
 */

import { useState, useEffect, FormEvent, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Trash2, ExternalLink } from "lucide-react";
import { RecipeBuilder, type RecipeStep } from "@/components/flies/RecipeBuilder";
import FlyImageUploader from "@/components/flies/FlyImageUploader";
import TurnstileWidget from "@/components/ui/TurnstileWidget";

const TURNSTILE_SITE_KEY = "0x4AAAAAAACzmkL0lBFlfTsxp";

const FLY_TYPES = [
  "Nymph",
  "Dry Fly",
  "Streamer",
  "Wet Fly",
  "Emerger",
  "Terrestrial",
  "Egg",
  "Other",
];

const FLY_SOURCES = ["tied", "bought", "gifted"] as const;
type FlySource = (typeof FLY_SOURCES)[number];

const inputClass =
  "w-full h-9 bg-[#0D1117] border border-[#30363D] rounded-md px-2.5 text-[13px] text-[#F0F6FC] placeholder-[#6E7681] outline-none focus:border-[#E8923A] transition-colors";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-widest text-[#6E7681] mb-1";

export interface FlyPatternFormInitial {
  name?: string;
  type?: string;
  size?: string;
  source?: FlySource;
  tags?: string;
  description?: string;
  video_url?: string;
  materials?: string;
  fly_color?: string;
  imageUrl?: string | null;
  recipeSteps?: RecipeStep[];
  parentCanonical?: { id: string; slug: string; name: string } | null;
}

export interface FlyPatternFormProps {
  mode: "new" | "edit";
  initial?: FlyPatternFormInitial;
  /**
   * Submit handler. Receives the FormData (image included if changed) and the
   * structured recipe steps. The page is responsible for POST/PATCH routing.
   */
  onSubmit: (formData: FormData, recipeSteps: RecipeStep[]) => Promise<void>;
  /** Edit-only — renders the trash button on the sticky save bar. */
  onDelete?: () => Promise<void>;
  /** Edit-only — extras (Variant tree, Card/Variant action buttons). */
  extras?: ReactNode;
  /** Edit-only — rendered above the save bar (e.g. catch migration prompt). */
  banner?: ReactNode;
  busy?: boolean;
  error?: string | null;
  /** Where to send the user when they cancel. */
  cancelHref?: string;
  /** Top-right action area on the title bar (Card / Variant on edit). */
  topRight?: ReactNode;
  /**
   * When true, render Turnstile + honeypot. New-pattern pages set this to
   * false for admin users so the captcha never blocks Taylor's flow. Default
   * true for new mode, false for edit mode.
   */
  requireCaptcha?: boolean;
}

export default function FlyPatternForm({
  mode,
  initial,
  onSubmit,
  onDelete,
  extras,
  banner,
  busy,
  error,
  cancelHref = "/journal/flies",
  topRight,
  requireCaptcha,
}: FlyPatternFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>(
    initial?.recipeSteps ?? [],
  );
  const [source, setSource] = useState<FlySource>(initial?.source ?? "tied");
  const [useSimpleMode, setUseSimpleMode] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [captchaAvailable, setCaptchaAvailable] = useState(true);

  // Default to captcha for "new" mode; "edit" mode skips it (the user already
  // owns the row). Admin pages can pass requireCaptcha={false} explicitly.
  const showCaptcha = requireCaptcha ?? mode === "new";

  // Re-sync if the parent loads data asynchronously after first paint.
  useEffect(() => {
    if (initial?.recipeSteps && initial.recipeSteps.length > 0) {
      setRecipeSteps(initial.recipeSteps);
    }
    if (initial?.source) setSource(initial.source);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.recipeSteps, initial?.source]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    if (imageFile) {
      formData.set("image", imageFile);
    } else {
      formData.delete("image");
    }
    if (imageRemoved && !imageFile) {
      formData.set("image_removed", "true");
    }

    formData.set("source", source);

    if (showCaptcha && turnstileToken) {
      formData.set("turnstile_token", turnstileToken);
    }

    if (!useSimpleMode && recipeSteps.length > 0) {
      formData.set(
        "recipe_steps",
        JSON.stringify(
          recipeSteps.map((s, i) => ({
            role: s.role,
            material_id: s.material?.id || null,
            material_name: s.materialName || s.material?.name || "",
            step_position: i + 1,
            color_choice: s.colorChoice || null,
            size_choice: s.sizeChoice || null,
            quantity: s.quantity || null,
            notes: s.notes || null,
            is_optional: s.isOptional,
          })),
        ),
      );
      formData.set("has_structured_recipe", "true");
    } else if (mode === "edit") {
      // Edit explicitly clearing structured recipe: send empty array so PATCH
      // wipes existing rows.
      formData.set("recipe_steps", JSON.stringify([]));
    }

    await onSubmit(formData, useSimpleMode ? [] : recipeSteps);
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm("Delete this fly pattern permanently?")) return;
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  }

  const formId = mode === "new" ? "new-fly-form" : "edit-fly-form";

  return (
    <div className="min-h-screen bg-[#0D1117] pt-4 pb-32">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <Link
            href={cancelHref}
            className="inline-flex items-center gap-1.5 text-xs text-[#A8B2BD] hover:text-[#E8923A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Fly Patterns
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E7681]">
            {mode === "new" ? "New Pattern" : "Edit Pattern"}
          </span>
        </div>

        {/* Title row */}
        <div className="flex items-end justify-between border-b border-[#21262D] pb-3 mb-4 gap-3">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl text-[#F0F6FC] leading-tight">
              {mode === "new" ? "New Fly Pattern" : "Edit Fly Pattern"}
            </h1>
            <p className="text-[12px] text-[#6E7681] mt-0.5">
              {mode === "new"
                ? "Build your recipe from 500+ tying materials"
                : "Refine your pattern — recipe, photo, notes"}
            </p>
          </div>
          {topRight && (
            <div className="flex items-center gap-1.5 shrink-0">{topRight}</div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-md mb-3 text-[13px]">
            {error}
          </div>
        )}

        {banner && <div className="mb-3">{banner}</div>}

        <form id={formId} onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
            {/* MAIN COLUMN */}
            <div className="space-y-3 min-w-0">
              {/* Pattern Info */}
              <section className="border border-[#30363D] rounded-md bg-[#161B22]">
                <header className="flex items-center justify-between border-b border-[#30363D] bg-[#0D1117] px-3 py-1.5">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#A8B2BD]">
                    Pattern Info
                  </h2>
                </header>
                <div className="p-3 grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-6">
                    <label htmlFor="name" className={labelClass}>
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      defaultValue={initial?.name ?? ""}
                      placeholder="Perdigon, Pheasant Tail, Woolly Bugger"
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <label htmlFor="type" className={labelClass}>
                      Type <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="type"
                        name="type"
                        required
                        className={`${inputClass} appearance-none cursor-pointer pr-7`}
                        defaultValue={initial?.type ?? ""}
                      >
                        <option value="">Select…</option>
                        {FLY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6E7681] pointer-events-none" />
                    </div>
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <label htmlFor="size" className={labelClass}>
                      Hook Sizes
                    </label>
                    <input
                      type="text"
                      id="size"
                      name="size"
                      defaultValue={initial?.size ?? ""}
                      placeholder="#14, #16, #18"
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label className={labelClass}>Source</label>
                    <div className="flex gap-1">
                      {FLY_SOURCES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSource(s)}
                          className={`px-3 h-7 rounded-md text-[12px] font-medium transition-colors capitalize ${
                            source === s
                              ? "bg-[#E8923A] text-white"
                              : "bg-[#0D1117] border border-[#30363D] text-[#A8B2BD] hover:border-[#E8923A]/60"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label htmlFor="tags" className={labelClass}>
                      Tags
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      defaultValue={initial?.tags ?? ""}
                      placeholder="euro, tungsten, nymph, fast-water"
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-12">
                    <label htmlFor="fly_color" className={labelClass}>
                      Overall Fly Color
                    </label>
                    <input
                      type="text"
                      id="fly_color"
                      name="fly_color"
                      defaultValue={initial?.fly_color ?? ""}
                      placeholder="olive, brown, black"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              {/* Tying Recipe */}
              <section className="border border-[#30363D] rounded-md bg-[#161B22]">
                <header className="flex items-center justify-between border-b border-[#30363D] bg-[#0D1117] px-3 py-1.5">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#A8B2BD]">
                      Tying Recipe
                    </h2>
                    <span className="text-[11px] text-[#6E7681]">
                      {useSimpleMode
                        ? "Free-text materials list"
                        : "Search 500+ materials by name or brand"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseSimpleMode(!useSimpleMode)}
                    className="text-[11px] text-[#A8B2BD] hover:text-[#E8923A] transition-colors px-2 h-6 rounded border border-[#30363D] hover:border-[#E8923A]/40"
                  >
                    {useSimpleMode ? "Use recipe builder" : "Use simple text"}
                  </button>
                </header>

                <div className={useSimpleMode ? "p-3" : ""}>
                  {useSimpleMode ? (
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12">
                        <label htmlFor="materials" className={labelClass}>
                          Materials
                        </label>
                        <textarea
                          id="materials"
                          name="materials"
                          rows={6}
                          defaultValue={initial?.materials ?? ""}
                          placeholder="Hook: Tiemco TMC 2457 #16&#10;Bead: 3.2mm tungsten copper slotted&#10;Thread: 8/0 black&#10;Body: olive UV resin&#10;Rib: copper wire"
                          className={`${inputClass} h-auto py-2 resize-none`}
                        />
                        {initial?.materials && (
                          <p className="mt-1 text-[10px] text-[#6E7681]">
                            Legacy materials notes are preserved here. Switch to
                            the recipe builder to upgrade to structured rows.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <RecipeBuilder
                      initialSteps={recipeSteps.length > 0 ? recipeSteps : undefined}
                      onChange={(steps) => setRecipeSteps(steps)}
                    />
                  )}
                </div>
              </section>

              {/* Details */}
              <section className="border border-[#30363D] rounded-md bg-[#161B22]">
                <header className="flex items-center justify-between border-b border-[#30363D] bg-[#0D1117] px-3 py-1.5">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#A8B2BD]">
                    Details
                  </h2>
                </header>
                <div className="p-3 space-y-3">
                  <div>
                    <label htmlFor="description" className={labelClass}>
                      Description / Notes
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      defaultValue={initial?.description ?? ""}
                      placeholder="Fishing tips, when to use, tying notes…"
                      className={`${inputClass} h-auto py-2 resize-none`}
                    />
                  </div>
                  <div>
                    <label htmlFor="video_url" className={labelClass}>
                      Tying Video URL
                    </label>
                    <input
                      type="text"
                      id="video_url"
                      name="video_url"
                      defaultValue={initial?.video_url ?? ""}
                      placeholder="https://youtube.com/…"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* SIDEBAR — photo + lineage + extras */}
            <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
              <section className="border border-[#30363D] rounded-md bg-[#161B22]">
                <header className="flex items-center justify-between border-b border-[#30363D] bg-[#0D1117] px-3 py-1.5">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#A8B2BD]">
                    Photo
                  </h2>
                </header>
                <div className="p-3">
                  <FlyImageUploader
                    existingUrl={initial?.imageUrl ?? null}
                    onFileChange={(f) => {
                      setImageFile(f);
                      if (f === null) setImageRemoved(true);
                      else setImageRemoved(false);
                    }}
                  />
                </div>
              </section>

              {initial?.parentCanonical && (
                <section className="border border-[#0BA5C7]/30 bg-[#0BA5C7]/5 rounded-md">
                  <header className="border-b border-[#0BA5C7]/20 bg-[#0BA5C7]/5 px-3 py-1.5">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#0BA5C7]">
                      Library Lineage
                    </h2>
                  </header>
                  <div className="p-3 space-y-2">
                    <p className="text-[12px] text-[#A8B2BD] leading-snug">
                      Forked from{" "}
                      <span className="font-semibold text-[#F0F6FC]">
                        {initial.parentCanonical.name}
                      </span>
                    </p>
                    <Link
                      href={`/flies/${initial.parentCanonical.slug}`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0BA5C7] hover:text-[#3FBED7] transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> View library reference
                    </Link>
                  </div>
                </section>
              )}

              {extras}
            </aside>
          </div>

          {/* Submission gate: honeypot (hidden) + Turnstile widget. */}
          {showCaptcha && (
            <div className="mt-4">
              {/* Honeypot — real users won't fill this, bots will. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-10000px",
                  width: "1px",
                  height: "1px",
                  opacity: 0,
                }}
              />
              <div className="border border-[#30363D] rounded-md bg-[#161B22] p-3">
                <p className="text-[11px] text-[#A8B2BD] mb-2">
                  Patterns submitted by community members go through a quick
                  review before joining the public library. Your personal copy
                  stays in your box right away.
                </p>
                <TurnstileWidget
                  siteKey={TURNSTILE_SITE_KEY}
                  onToken={(t) => setTurnstileToken(t)}
                  onAvailabilityChange={(ok) => setCaptchaAvailable(ok)}
                />
              </div>
            </div>
          )}
        </form>

        {/* Sticky save bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0D1117] border-t border-[#21262D] z-40">
          <div className="mx-auto max-w-6xl px-3 py-2 flex items-center gap-2">
            {onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center justify-center rounded-md border border-red-500/30 px-3 h-9 text-[12px] font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                aria-label="Delete pattern"
              >
                {deleting ? "…" : <Trash2 className="h-4 w-4" />}
              </button>
            ) : (
              <Link
                href={cancelHref}
                className="px-3 h-9 inline-flex items-center text-[12px] text-[#A8B2BD] hover:text-[#F0F6FC] border border-[#30363D] rounded-md hover:border-[#E8923A]/40 transition-colors"
              >
                Cancel
              </Link>
            )}
            <button
              type="submit"
              form={formId}
              disabled={
                busy ||
                (showCaptcha && captchaAvailable && !turnstileToken)
              }
              className="ml-auto h-9 px-4 inline-flex items-center bg-[#E8923A] text-white text-[12px] font-semibold rounded-md hover:bg-[#d17d28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                showCaptcha && captchaAvailable && !turnstileToken
                  ? "Complete the captcha to continue"
                  : undefined
              }
            >
              {busy
                ? mode === "new"
                  ? "Creating…"
                  : "Saving…"
                : mode === "new"
                ? "Create Pattern"
                : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
