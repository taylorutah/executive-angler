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

import { useState, useEffect, useRef, FormEvent, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, ExternalLink, BookOpen, User } from "@/icons";
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
  "Midge",
  "Terrestrial",
  "Egg",
  "Other",
];

const FLY_SOURCES = ["tied", "bought", "gifted"] as const;
type FlySource = (typeof FLY_SOURCES)[number];

const inputClass =
  "w-full h-9 bg-[var(--surface-page)] border border-[var(--border-strong)] rounded-md px-2.5 text-[13px] text-[var(--text-primary)] placeholder-[#6E7681] outline-none focus:border-[var(--action)] transition-colors";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-widest text-[var(--text-meta)] mb-1";

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
  mode: "new" | "edit" | "canonical-edit";
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
  const errorRef = useRef<HTMLDivElement | null>(null);

  // When a save error appears, scroll it into view so it isn't hidden below
  // the fold on a long form.
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);
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

    // Hook sizes are stored without the leading `#` — display layers
    // (variant chips, fly cards) prepend it when rendering. Strip any
    // `#` the user typed so we don't end up with "##16".
    const rawSize = formData.get("size");
    if (typeof rawSize === "string") {
      const cleaned = rawSize
        .split(",")
        .map((s) => s.trim().replace(/^#+/, ""))
        .filter(Boolean)
        .join(", ");
      formData.set("size", cleaned);
    }

    if (!isCanonical) formData.set("source", source);

    if (showCaptcha && turnstileToken) {
      formData.set("turnstile_token", turnstileToken);
    }

    if (!useSimpleMode && recipeSteps.length > 0) {
      // Strip user-typed `#` from hook sizeChoice so we store bare numbers.
      const normalized = recipeSteps.map((s) =>
        s.role === "hook" && s.sizeChoice
          ? { ...s, sizeChoice: s.sizeChoice.replace(/^#+/, "") }
          : s,
      );
      formData.set(
        "recipe_steps",
        JSON.stringify(
          normalized.map((s, i) => ({
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
      // Canonical edit needs every structured field (materialTypeChoice,
      // finishChoice, brandChoice, …) to round-trip through
      // recipeStepsToMaterialSlots. The DTO above drops those, so we also
      // ship the raw RecipeStep[] state. Legacy POSTs ignore this field.
      formData.set("recipe_steps_structured", JSON.stringify(normalized));
      formData.set("has_structured_recipe", "true");
    } else if (mode === "edit" || isCanonical) {
      // Edit explicitly clearing structured recipe: send empty array so PATCH
      // wipes existing rows.
      formData.set("recipe_steps", JSON.stringify([]));
      formData.set("recipe_steps_structured", JSON.stringify([]));
    }

    await onSubmit(formData, useSimpleMode ? [] : recipeSteps);
  }

  async function handleDelete() {
    // The parent now drives the confirmation flow via
    // <DeleteFlyPatternDialog>, which surfaces affected journal catches and
    // offers reassign / keep / delete-catches modes. The form just fires
    // the click and lets the parent decide what to render next.
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  }

  const isCanonical = mode === "canonical-edit";
  const formId =
    mode === "new"
      ? "new-fly-form"
      : isCanonical
      ? "canonical-fly-form"
      : "edit-fly-form";
  const topLabel = mode === "new"
    ? "New Pattern"
    : isCanonical
    ? "Edit Canonical Fly"
    : "Edit Pattern";
  const titleText = mode === "new"
    ? "New Fly Pattern"
    : isCanonical
    ? "Edit Canonical Fly"
    : "Edit Fly Pattern";
  const subtitleText = mode === "new"
    ? "Build your recipe from 500+ tying materials"
    : isCanonical
    ? "Library entry — edits appear on /flies/<slug> for everyone"
    : "Refine your pattern — recipe, photo, notes";
  const submitLabel = mode === "new"
    ? "Create Pattern"
    : isCanonical
    ? "Save Library Entry"
    : "Save Changes";
  const submitBusyLabel = mode === "new" ? "Creating…" : "Saving…";
  const backLabel = isCanonical ? "Back to library" : "Fly Patterns";

  return (
    <div className={`min-h-screen pt-4 pb-32 ${isCanonical ? "bg-[#1a1208]" : "bg-[var(--surface-page)]"}`}>
      {isCanonical && (
        <div className="bg-[var(--action)] text-[var(--surface-page)] border-b-2 border-[#D17D28]">
          <div className="mx-auto max-w-6xl px-4 lg:px-6 py-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 shrink-0" />
            <p className="text-[12px] font-semibold uppercase tracking-wider">
              Library entry — visible to every angler
            </p>
            <span className="ml-auto text-[11px] font-medium opacity-80">
              Admin · Canonical fly
            </span>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3 mt-2">
          <Link
            href={cancelHref}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-body)] hover:text-[var(--action)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {backLabel}
          </Link>
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${
              isCanonical
                ? "text-[var(--action)]"
                : "text-[var(--signal-live)]"
            }`}
          >
            {isCanonical ? (
              <BookOpen className="w-3 h-3" />
            ) : mode === "edit" ? (
              <User className="w-3 h-3" />
            ) : null}
            {isCanonical
              ? "Library Entry"
              : mode === "edit"
              ? "Your Pattern"
              : topLabel}
          </span>
        </div>

        {/* Title row */}
        <div
          className={`flex items-end justify-between pb-3 mb-4 gap-3 border-b-2 ${
            isCanonical ? "border-[var(--action)]/40" : "border-[var(--border-rule)]"
          }`}
        >
          <div className="min-w-0">
            <h1 className="font-heading text-2xl text-[var(--text-primary)] leading-tight">
              {titleText}
            </h1>
            <p className="text-[12px] text-[var(--text-meta)] mt-0.5">
              {subtitleText}
            </p>
          </div>
          {topRight && (
            <div className="flex items-center gap-1.5 shrink-0">{topRight}</div>
          )}
        </div>

        {error && (
          <div
            ref={errorRef}
            role="alert"
            aria-live="assertive"
            className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-md mb-3 text-[13px]"
          >
            <span className="font-semibold">Save failed.</span> {error}
          </div>
        )}

        {banner && <div className="mb-3">{banner}</div>}

        <form id={formId} onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-3">
              {/* Pattern Info */}
              <section className="border border-[var(--border-strong)] rounded-md bg-[var(--surface-raised)]">
                <header className="flex items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-page)] px-3 py-1.5">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-body)]">
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
                        defaultValue={
                          initial?.type
                            ? FLY_TYPES.find(
                                (t) => t.toLowerCase() === initial.type!.toLowerCase(),
                              ) ?? ""
                            : ""
                        }
                      >
                        <option value="">Select…</option>
                        {FLY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
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
                      placeholder="14, 16, 18"
                      className={inputClass}
                    />
                  </div>
                  {!isCanonical && (
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
                                ? "bg-[var(--action)] text-white"
                                : "bg-[var(--surface-page)] border border-[var(--border-strong)] text-[var(--text-body)] hover:border-[var(--action)]/60"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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
              <section className="border border-[var(--border-strong)] rounded-md bg-[var(--surface-raised)]">
                <header className="flex items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-page)] px-3 py-1.5">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-body)]">
                      Tying Recipe
                    </h2>
                    <span className="text-[11px] text-[var(--text-meta)]">
                      {useSimpleMode
                        ? "Free-text materials list"
                        : "Search 500+ materials by name or brand"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseSimpleMode(!useSimpleMode)}
                    className="text-[11px] text-[var(--text-body)] hover:text-[var(--action)] transition-colors px-2 h-6 rounded border border-[var(--border-strong)] hover:border-[var(--action)]/40"
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
                          <p className="mt-1 text-[10px] text-[var(--text-meta)]">
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
              <section className="border border-[var(--border-strong)] rounded-md bg-[var(--surface-raised)]">
                <header className="flex items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-page)] px-3 py-1.5">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-body)]">
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

              {/* Photo — full-width section, uploader constrained so the 1:1
                  dropzone doesn't dominate the layout. */}
              <section className="border border-[var(--border-strong)] rounded-md bg-[var(--surface-raised)]">
                <header className="flex items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-page)] px-3 py-1.5">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-body)]">
                    Photo
                  </h2>
                </header>
                <div className="p-3">
                  <div className="max-w-[260px]">
                    <FlyImageUploader
                      existingUrl={initial?.imageUrl ?? null}
                      onFileChange={(f) => {
                        setImageFile(f);
                        if (f === null) setImageRemoved(true);
                        else setImageRemoved(false);
                      }}
                    />
                  </div>
                </div>
              </section>

              {initial?.parentCanonical && (
                <section className="border border-[var(--signal-live)]/30 bg-[var(--signal-live)]/5 rounded-md">
                  <header className="border-b border-[var(--signal-live)]/20 bg-[var(--signal-live)]/5 px-3 py-1.5">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--signal-live)]">
                      Library Lineage
                    </h2>
                  </header>
                  <div className="p-3 flex items-center justify-between gap-3">
                    <p className="text-[12px] text-[var(--text-body)] leading-snug">
                      Forked from{" "}
                      <span className="font-semibold text-[var(--text-primary)]">
                        {initial.parentCanonical.name}
                      </span>
                    </p>
                    <Link
                      href={`/flies/${initial.parentCanonical.slug}`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--signal-live)] hover:text-[#3FBED7] transition-colors shrink-0"
                    >
                      <ExternalLink className="w-3 h-3" /> View library reference
                    </Link>
                  </div>
                </section>
              )}

              {extras}
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
              <div className="border border-[var(--border-strong)] rounded-md bg-[var(--surface-raised)] p-3">
                <p className="text-[11px] text-[var(--text-body)] mb-2">
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
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 border-t-2 ${
            isCanonical
              ? "bg-[#1a1208] border-[var(--action)]"
              : "bg-[var(--surface-page)] border-[var(--border-rule)]"
          }`}
        >
          <div className="mx-auto max-w-6xl px-3 py-2 flex items-center gap-2">
            {isCanonical && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--action)]/15 border border-[var(--action)]/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--action)]">
                <BookOpen className="w-3 h-3" />
                Editing library entry
              </span>
            )}
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
                className="px-3 h-9 inline-flex items-center text-[12px] text-[var(--text-body)] hover:text-[var(--text-primary)] border border-[var(--border-strong)] rounded-md hover:border-[var(--action)]/40 transition-colors"
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
              className="ml-auto h-9 px-4 inline-flex items-center bg-[var(--action)] text-white text-[12px] font-semibold rounded-md hover:bg-[#d17d28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                showCaptcha && captchaAvailable && !turnstileToken
                  ? "Complete the captcha to continue"
                  : undefined
              }
            >
              {busy ? submitBusyLabel : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
