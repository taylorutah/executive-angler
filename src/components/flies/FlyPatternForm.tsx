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

const inputClass = "ea-input";
const labelClass = "ea-label";

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
    <div className="min-h-screen pt-4 pb-32 bg-[var(--paper)]">
      {isCanonical && (
        <div className="bg-[var(--accent)] text-[var(--on-action)] border-b border-[var(--accent-hover)]">
          <div className="mx-auto max-w-[var(--container)] px-4 lg:px-6 py-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 shrink-0" />
            <p className="text-[12px] font-medium uppercase tracking-[0.06em]">
              Library entry — visible to every angler
            </p>
            <span className="ml-auto text-xs font-medium opacity-80">
              Admin · Canonical fly
            </span>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-[var(--container)] px-4 lg:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3 mt-2">
          <Link
            href={cancelHref}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-2)] hover:text-[var(--accent)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {backLabel}
          </Link>
          <span className="ea-overline inline-flex items-center gap-1.5 text-[var(--accent)]">
            {isCanonical ? (
              <BookOpen className="w-3.5 h-3.5" />
            ) : mode === "edit" ? (
              <User className="w-3.5 h-3.5" />
            ) : null}
            {isCanonical
              ? "Library Entry"
              : mode === "edit"
              ? "Your Pattern"
              : topLabel}
          </span>
        </div>

        {/* Title row */}
        <div className="flex items-end justify-between pb-3 mb-4 gap-3 border-b border-[var(--border)]">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold text-[var(--text-1)] leading-tight lg:text-3xl">
              {titleText}
            </h1>
            <p className="text-[13px] text-[var(--text-3)] mt-0.5">
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
            className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] px-3 py-2 rounded-[var(--radius-md)] mb-3 text-[13px]"
          >
            <span className="font-semibold">Save failed.</span> {error}
          </div>
        )}

        {banner && <div className="mb-3">{banner}</div>}

        <form id={formId} onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-3">
              {/* Pattern Info */}
              <section className="border border-[var(--border)] rounded-[var(--radius-card)] bg-[var(--surface)]">
                <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--paper-deep)] px-4 py-2.5 rounded-t-[var(--radius-card)]">
                  <h2 className="ea-overline">
                    Pattern Info
                  </h2>
                </header>
                <div className="p-3 grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-6">
                    <label htmlFor="name" className={labelClass}>
                      Name <span className="text-[var(--danger)]">*</span>
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
                      Type <span className="text-[var(--danger)]">*</span>
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
                      <div className="ea-segmented">
                        {FLY_SOURCES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSource(s)}
                            aria-pressed={source === s}
                            className="ea-segment capitalize"
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
              <section className="border border-[var(--border)] rounded-[var(--radius-card)] bg-[var(--surface)]">
                <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--paper-deep)] px-4 py-2.5 rounded-t-[var(--radius-card)]">
                  <div className="flex items-baseline gap-2">
                    <h2 className="ea-overline">
                      Tying Recipe
                    </h2>
                    <span className="text-xs text-[var(--text-3)]">
                      {useSimpleMode
                        ? "Free-text materials list"
                        : "Search 500+ materials by name or brand"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseSimpleMode(!useSimpleMode)}
                    className="ea-btn ea-btn-secondary ea-btn-sm"
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
                          <p className="ea-field-helper">
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
              <section className="border border-[var(--border)] rounded-[var(--radius-card)] bg-[var(--surface)]">
                <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--paper-deep)] px-4 py-2.5 rounded-t-[var(--radius-card)]">
                  <h2 className="ea-overline">
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
              <section className="border border-[var(--border)] rounded-[var(--radius-card)] bg-[var(--surface)]">
                <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--paper-deep)] px-4 py-2.5 rounded-t-[var(--radius-card)]">
                  <h2 className="ea-overline">
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
                <section className="border border-[var(--accent)]/30 bg-[var(--accent-soft)] rounded-[var(--radius-card)]">
                  <header className="border-b border-[var(--accent)]/20 px-4 py-2.5">
                    <h2 className="ea-overline text-[var(--accent)]">
                      Library Lineage
                    </h2>
                  </header>
                  <div className="p-3 flex items-center justify-between gap-3">
                    <p className="text-[13px] text-[var(--text-2)] leading-snug">
                      Forked from{" "}
                      <span className="font-semibold text-[var(--text-1)]">
                        {initial.parentCanonical.name}
                      </span>
                    </p>
                    <Link
                      href={`/flies/${initial.parentCanonical.slug}`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors shrink-0"
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
              <div className="border border-[var(--border)] rounded-[var(--radius-card)] bg-[var(--surface)] p-4">
                <p className="text-xs text-[var(--text-2)] mb-2">
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
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-[var(--container)] px-3 py-2 flex items-center gap-2">
            {isCanonical && (
              <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] px-3 py-1 text-[12px] font-medium text-[var(--accent)]">
                <BookOpen className="w-3.5 h-3.5" />
                Editing library entry
              </span>
            )}
            {onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="ea-btn px-3 border-[var(--danger)]/40 text-[var(--danger)] hover:bg-[var(--danger)]/10"
                aria-label="Delete pattern"
              >
                {deleting ? "…" : <Trash2 className="h-4 w-4" />}
              </button>
            ) : (
              <Link
                href={cancelHref}
                className="ea-btn ea-btn-secondary"
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
              className="ea-btn ea-btn-primary ml-auto"
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
