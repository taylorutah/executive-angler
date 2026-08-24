"use client";

/**
 * QuickAddToBoxSheet — the universal "add this fly to my box" sheet.
 *
 * Opens from any fly surface (catalog cards, hatch tables, search results,
 * river pages, etc.) and lets the angler in one screen:
 *   1. Pick size(s) — multi-select chips from canonical.sizes
 *   2. Pick bead spec — material + weight (mm) + color (only if canonical
 *      has bead_options OR the category implies a beadhead)
 *   3. Pick body color — chips from canonical.colors
 *   4. Set quantity tied (stepper)
 *   5. Pick destination box(es) — chips grouped by tier (Kill / Support /
 *      Archive / Custom); default box pre-checked; multi-select
 *   6. (Optional) expand "More options" for notes, tie-next target,
 *      custom name, free-text slot overrides
 *
 * The sheet always creates a NEW variant row (matches POST /api/fly-box
 * semantics post-2026-05-07 multi-variant migration). For full per-slot
 * material overrides (brand, model, denier, etc.), the user still uses the
 * existing PersonalizeSheet on /flies/[slug]; this sheet handles the 90%
 * case where they just want size + bead + color + box.
 */

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Loader2,
  Plus,
  Check,
  ExternalLink,
  Box as BoxIcon,
  Sparkles,
  Star,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { Personalizations } from "@/lib/flies/resolveFlyForViewer";
import { suggestVariantLabel } from "@/lib/flies/variantLabel";

// Standard tungsten/brass bead weight presets used in fly tying.
const BEAD_WEIGHT_PRESETS = ["1.5", "2.0", "2.4", "2.8", "3.3", "3.8", "4.6"];
const BEAD_MATERIALS = [
  { id: "tungsten", label: "Tungsten" },
  { id: "brass", label: "Brass" },
  { id: "glass", label: "Glass" },
  { id: "none", label: "No bead" },
];
const BEAD_COLORS = ["copper", "gold", "silver", "black", "olive", "red"];

const TIER_ORDER = ["kill", "support", "archive", "custom"] as const;
const TIER_LABELS: Record<string, string> = {
  kill: "Kill — your top box",
  support: "Support",
  archive: "Archive",
  custom: "Custom",
};
const TIER_ACCENT: Record<string, string> = {
  kill: "#E8923A",
  support: "#0BA5C7",
  archive: "#8957E5",
  custom: "#A8B2BD",
};

export interface QuickAddFly {
  /** Canonical fly id OR personal fly_pattern id. `kind` disambiguates. */
  id: string;
  /**
   * "canonical" → from canonical_flies (library entry). Chip pickers load
   *               sizes/colors/bead options from canonical metadata.
   * "personal"  → from fly_patterns (user-owned). No canonical recipe;
   *               sheet skips the bead picker and uses a free-text size
   *               input so the angler can record what they tied.
   */
  kind?: "canonical" | "personal";
  slug?: string;
  name: string;
  category?: string | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  beadOptions?: string[] | null;
  hookStyles?: string[] | null;
  heroImageUrl?: string | null;
}

interface BoxRow {
  id: string;
  name: string;
  tier: string;
  is_default: boolean;
  fly_count?: number;
}

interface ExistingVariant {
  id: string;
  variant_label: string | null;
  is_primary: boolean;
  preferred_sizes: string[] | null;
}

interface SaveResult {
  variantId: string;
  variantLabel: string;
  boxNames: string[];
  boxIds: string[];
}

interface Props {
  open: boolean;
  fly: QuickAddFly;
  onClose: () => void;
  onSaved: (result: SaveResult) => void;
}

export default function QuickAddToBoxSheet({ open, fly: flyProp, onClose, onSaved }: Props) {
  // Sheet may be opened with sparse data (just id + name from a card click).
  // We hydrate sizes / colors / bead_options / hero from canonical_flies on
  // open so chip pickers populate properly.
  const [fly, setFly] = useState<QuickAddFly>(flyProp);
  useEffect(() => {
    setFly(flyProp);
  }, [flyProp]);

  const [boxes, setBoxes] = useState<BoxRow[]>([]);
  const [existingVariants, setExistingVariants] = useState<ExistingVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  // Form state
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [beadMaterial, setBeadMaterial] = useState<string | null>(null);
  const [beadWeight, setBeadWeight] = useState<string | null>(null);
  const [beadColor, setBeadColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [selectedBoxIds, setSelectedBoxIds] = useState<string[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [customName, setCustomName] = useState("");
  const [tieNextTarget, setTieNextTarget] = useState<number | "">("");

  // Heuristic: show the bead picker when canonical declares bead_options OR
  // category suggests a bead-headed pattern. Anglers expect to pick a bead
  // size on nymphs/euros/jigs even when canonical didn't enumerate options.
  const showBead = useMemo(() => {
    if (fly.beadOptions && fly.beadOptions.length > 0) return true;
    const cat = (fly.category ?? "").toLowerCase();
    return /(nymph|euro|jig|attractor|stonefly|caddis pupa)/.test(cat);
  }, [fly.beadOptions, fly.category]);

  // Suggested label updates live as the user picks.
  const suggestedLabel = useMemo(() => {
    const personalizations: Personalizations = {};
    if (beadMaterial && beadMaterial !== "none") {
      personalizations.bead = {
        ...(beadWeight ? { size: `${beadWeight}mm` } : {}),
        ...(beadColor ? { color: beadColor } : {}),
        model: beadMaterial,
      };
    }
    return suggestVariantLabel({
      preferredColors: selectedColor ? [selectedColor] : [],
      preferredSizes: selectedSizes,
      personalizations,
    });
  }, [beadMaterial, beadWeight, beadColor, selectedColor, selectedSizes]);

  // Load user's boxes + existing variants when sheet opens. Also hydrate
  // canonical fly fields if the caller only passed sparse data. For personal
  // patterns we skip canonical hydration entirely — there's no canonical row
  // and the angler types in their own size/bead/color.
  const isPersonal = flyProp.kind === "personal";
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setAuthError(false);
      try {
        const needsHydration =
          !isPersonal &&
          (!flyProp.sizes ||
            !flyProp.colors ||
            !flyProp.beadOptions ||
            !flyProp.heroImageUrl ||
            !flyProp.slug);
        const supabase = createClient();
        const variantsQuery = isPersonal
          ? `fly_pattern_id=${encodeURIComponent(flyProp.id)}`
          : `canonical_fly_id=${encodeURIComponent(flyProp.id)}`;

        const [boxesRes, variantsRes, canonicalRes] = await Promise.all([
          fetch("/api/fly-boxes", { credentials: "same-origin" }),
          fetch(`/api/fly-box?${variantsQuery}`, {
            credentials: "same-origin",
          }),
          needsHydration
            ? supabase
                .from("canonical_flies")
                .select(
                  "id, slug, name, category, sizes, colors, bead_options, hook_styles, hero_image_url",
                )
                .eq("id", flyProp.id)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);
        if (cancelled) return;

        if (boxesRes.status === 401 || variantsRes.status === 401) {
          setAuthError(true);
          return;
        }
        if (!boxesRes.ok) {
          setError("Couldn't load your fly boxes.");
          return;
        }

        const boxesData = (await boxesRes.json()) as { boxes: BoxRow[] };
        const fetchedBoxes = boxesData.boxes ?? [];
        setBoxes(fetchedBoxes);

        // Pre-select the default box. If no default, pick the first kill-tier
        // box. If no kill box either, pick whatever's first.
        const initial =
          fetchedBoxes.find((b) => b.is_default)?.id ??
          fetchedBoxes.find((b) => b.tier === "kill")?.id ??
          fetchedBoxes[0]?.id;
        if (initial) setSelectedBoxIds([initial]);

        if (variantsRes.ok) {
          const v = (await variantsRes.json()) as ExistingVariant[];
          setExistingVariants(Array.isArray(v) ? v : []);
        }

        // Merge hydrated canonical fields back into local fly state.
        const canonicalRow = (canonicalRes as { data?: Record<string, unknown> | null })
          .data;
        if (canonicalRow && !cancelled) {
          setFly((prev) => ({
            ...prev,
            slug: prev.slug ?? (canonicalRow.slug as string | undefined),
            category:
              prev.category ?? (canonicalRow.category as string | null | undefined) ?? null,
            sizes: prev.sizes ?? (canonicalRow.sizes as string[] | null | undefined) ?? null,
            colors:
              prev.colors ?? (canonicalRow.colors as string[] | null | undefined) ?? null,
            beadOptions:
              prev.beadOptions ??
              (canonicalRow.bead_options as string[] | null | undefined) ??
              null,
            hookStyles:
              prev.hookStyles ??
              (canonicalRow.hook_styles as string[] | null | undefined) ??
              null,
            heroImageUrl:
              prev.heroImageUrl ??
              (canonicalRow.hero_image_url as string | null | undefined) ??
              null,
          }));
        }
      } catch (e) {
        if (!cancelled) {
          console.error("[QuickAddToBoxSheet] load error:", e);
          setError("Network error loading your boxes.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [
    open,
    flyProp.id,
    flyProp.sizes,
    flyProp.colors,
    flyProp.beadOptions,
    flyProp.heroImageUrl,
    flyProp.slug,
    isPersonal,
  ]);

  // Reset form when sheet closes (so reopening for a different fly starts clean).
  useEffect(() => {
    if (open) return;
    setSelectedSizes([]);
    setSelectedColor(null);
    setBeadMaterial(null);
    setBeadWeight(null);
    setBeadColor(null);
    setQuantity(0);
    setAdvancedOpen(false);
    setNotes("");
    setCustomName("");
    setTieNextTarget("");
    setError(null);
  }, [open]);

  // Group boxes by tier for the picker.
  const boxesByTier = useMemo(() => {
    const grouped: Record<string, BoxRow[]> = {};
    for (const b of boxes) {
      const tier = TIER_ORDER.includes(b.tier as (typeof TIER_ORDER)[number])
        ? b.tier
        : "custom";
      if (!grouped[tier]) grouped[tier] = [];
      grouped[tier].push(b);
    }
    return grouped;
  }, [boxes]);

  function toggleSize(s: string) {
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }
  function toggleBox(id: string) {
    setSelectedBoxIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }
  function bumpQty(delta: number) {
    setQuantity((q) => Math.max(0, q + delta));
  }

  async function handleSave() {
    if (selectedBoxIds.length === 0) {
      setError("Pick at least one box.");
      return;
    }
    setSaving(true);
    setError(null);

    // Build personalizations jsonb from bead picks.
    const personalizations: Personalizations = {};
    if (beadMaterial && beadMaterial !== "none") {
      personalizations.bead = {
        model: beadMaterial,
        ...(beadWeight ? { size: `${beadWeight}mm` } : {}),
        ...(beadColor ? { color: beadColor } : {}),
      };
    } else if (beadMaterial === "none") {
      personalizations.bead = { model: "none" };
    }

    const labelToSave =
      suggestedLabel ||
      [selectedColor, selectedSizes[0] && `#${selectedSizes[0]}`, beadWeight && `${beadWeight}mm`]
        .filter(Boolean)
        .join(" · ");

    const payload: Record<string, unknown> = {
      ...(isPersonal
        ? { fly_pattern_id: fly.id }
        : { canonical_fly_id: fly.id }),
      preferred_sizes: selectedSizes.length ? selectedSizes : null,
      preferred_colors: selectedColor ? [selectedColor] : null,
      personalizations,
      variant_label: labelToSave || null,
      custom_name: customName.trim() || null,
      personal_notes: notes.trim() || null,
      tied_count: quantity > 0 ? quantity : 0,
      box_ids: selectedBoxIds,
    };
    if (beadMaterial && beadMaterial !== "none") {
      payload.bead_material = beadMaterial;
      if (beadWeight) payload.bead_weight_mm = Number(beadWeight);
    }
    if (typeof tieNextTarget === "number" && tieNextTarget > 0) {
      payload.tie_next_target_qty = tieNextTarget;
      payload.tie_next_status = quantity >= tieNextTarget ? "done" : "wanted";
    }

    try {
      const res = await fetch("/api/fly-box", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Save failed.");
        return;
      }
      const data = (await res.json()) as { id: string };
      const boxNames = boxes
        .filter((b) => selectedBoxIds.includes(b.id))
        .map((b) => b.name);
      onSaved({
        variantId: data.id,
        variantLabel: labelToSave || fly.name,
        boxNames,
        boxIds: selectedBoxIds,
      });
      onClose();
    } catch (e) {
      console.error("[QuickAddToBoxSheet] save error:", e);
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const hasExisting = existingVariants.length > 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex sm:items-stretch items-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qa-fly-name"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative w-full sm:ml-auto sm:max-w-lg sm:h-full bg-[var(--surface-page)] sm:border-l border-t sm:border-t-0 border-[var(--border-rule)] flex flex-col shadow-2xl rounded-t-2xl sm:rounded-none max-h-[92vh] sm:max-h-full">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-[var(--border-rule)]">
          {fly.heroImageUrl ? (
            <div className="relative flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden border border-[var(--border-rule)] bg-[var(--surface-raised)]">
              <Image
                src={fly.heroImageUrl}
                alt={fly.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] text-[var(--action)] flex-shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--action)]">
              Add to fly box
            </p>
            <h2 id="qa-fly-name" className="font-heading text-lg text-[var(--text-primary)] truncate">
              {fly.name}
            </h2>
            {fly.category && (
              <p className="text-xs text-[var(--text-meta)] capitalize truncate">{fly.category}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-[var(--text-body)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[var(--text-meta)] py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading your boxes…
            </div>
          ) : authError ? (
            <SignInPrompt flySlug={fly.slug} />
          ) : (
            <>
              {hasExisting && (
                <div className="rounded-lg border border-[var(--action)]/25 bg-[var(--action)]/5 p-3 text-xs text-[var(--text-body)] flex items-start gap-2">
                  <Star className="h-3.5 w-3.5 text-[var(--action)] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    You already have {existingVariants.length}{" "}
                    {existingVariants.length === 1 ? "variant" : "variants"} of this fly.
                    {fly.slug && (
                      <>
                        {" "}
                        <Link
                          href={`/flies/${fly.slug}`}
                          className="text-[var(--action)] hover:underline inline-flex items-center gap-0.5"
                        >
                          Manage <ExternalLink className="h-3 w-3" />
                        </Link>
                      </>
                    )}
                    . Saving below adds another variant.
                  </div>
                </div>
              )}

              {/* Sizes */}
              {fly.sizes && fly.sizes.length > 0 ? (
                <Section label="Size">
                  <div className="flex flex-wrap gap-1.5">
                    {fly.sizes.map((s) => {
                      const active = selectedSizes.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSize(s)}
                          className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors ${
                            active
                              ? "bg-[var(--action)] text-[var(--surface-page)] font-semibold"
                              : "bg-[var(--surface-raised)] border border-[var(--border-rule)] text-[var(--text-body)] hover:border-[var(--action)]/50"
                          }`}
                        >
                          {active && <Check className="inline h-3 w-3 mr-0.5" />}#{s}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-[var(--text-meta)] mt-1.5">
                    Pick one or more. You can also leave blank and add sizes later.
                  </p>
                </Section>
              ) : (
                // Personal pattern (or canonical with no sizes set yet) — free-text input.
                <Section label="Sizes (comma-separated)">
                  <input
                    type="text"
                    placeholder="e.g. 14, 16, 18"
                    value={selectedSizes.join(", ")}
                    onChange={(e) => {
                      const parts = e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      setSelectedSizes(parts);
                    }}
                    className="w-full bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[#6E7681] focus:outline-none focus:border-[var(--action)]/50"
                  />
                </Section>
              )}

              {/* Bead */}
              {showBead && (
                <Section label="Bead">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {BEAD_MATERIALS.map((m) => {
                      const active = beadMaterial === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setBeadMaterial(active ? null : m.id);
                            if (m.id === "none") {
                              setBeadWeight(null);
                              setBeadColor(null);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                            active
                              ? "bg-[var(--signal-live)] text-[var(--surface-page)] font-semibold"
                              : "bg-[var(--surface-raised)] border border-[var(--border-rule)] text-[var(--text-body)] hover:border-[var(--signal-live)]/50"
                          }`}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                  {beadMaterial && beadMaterial !== "none" && (
                    <>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-meta)] mb-1">
                        Weight
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {BEAD_WEIGHT_PRESETS.map((w) => {
                          const active = beadWeight === w;
                          return (
                            <button
                              key={w}
                              type="button"
                              onClick={() => setBeadWeight(active ? null : w)}
                              className={`px-2.5 py-1 rounded-full text-xs font-mono transition-colors ${
                                active
                                  ? "bg-[var(--signal-live)] text-[var(--surface-page)] font-semibold"
                                  : "bg-[var(--surface-raised)] border border-[var(--border-rule)] text-[var(--text-body)] hover:border-[var(--signal-live)]/50"
                              }`}
                            >
                              {w}mm
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-meta)] mb-1">
                        Color
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {BEAD_COLORS.map((c) => {
                          const active = beadColor === c;
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setBeadColor(active ? null : c)}
                              className={`px-2.5 py-1 rounded-full text-xs capitalize transition-colors ${
                                active
                                  ? "bg-[var(--signal-live)] text-[var(--surface-page)] font-semibold"
                                  : "bg-[var(--surface-raised)] border border-[var(--border-rule)] text-[var(--text-body)] hover:border-[var(--signal-live)]/50"
                              }`}
                            >
                              {c}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </Section>
              )}

              {/* Body color */}
              {fly.colors && fly.colors.length > 0 && (
                <Section label="Color">
                  <div className="flex flex-wrap gap-1.5">
                    {fly.colors.map((c) => {
                      const active = selectedColor === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(active ? null : c)}
                          className={`px-3 py-1.5 rounded-full text-xs capitalize transition-colors ${
                            active
                              ? "bg-[var(--action)] text-[var(--surface-page)] font-semibold"
                              : "bg-[var(--surface-raised)] border border-[var(--border-rule)] text-[var(--text-body)] hover:border-[var(--action)]/50"
                          }`}
                        >
                          {active && <Check className="inline h-3 w-3 mr-0.5" />}
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </Section>
              )}

              {/* Quantity */}
              <Section label="How many tied?">
                <div className="inline-flex items-center gap-3 bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-lg px-3 py-1.5">
                  <button
                    type="button"
                    onClick={() => bumpQty(-1)}
                    disabled={quantity === 0}
                    aria-label="Decrease quantity"
                    className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--text-body)] hover:text-[var(--text-primary)] hover:bg-[var(--border-rule)] disabled:opacity-30 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={quantity}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setQuantity(Math.max(0, isNaN(v) ? 0 : v));
                    }}
                    className="w-14 bg-transparent text-center text-base font-semibold text-[var(--text-primary)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => bumpQty(1)}
                    aria-label="Increase quantity"
                    className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--text-body)] hover:text-[var(--text-primary)] hover:bg-[var(--border-rule)] transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-[10px] text-[var(--text-meta)] mt-1.5">
                  Leave at 0 if you don&apos;t have any tied yet — you can still add it to a box.
                </p>
              </Section>

              {/* Box picker */}
              <Section label="Add to box(es)" required>
                {boxes.length === 0 ? (
                  <div className="rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] p-3 text-xs text-[var(--text-body)] flex items-start gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-[var(--action)] flex-shrink-0 mt-0.5" />
                    <div>
                      You don&apos;t have any fly boxes yet.{" "}
                      <Link href="/flies/boxes" className="text-[var(--action)] hover:underline">
                        Create one
                      </Link>{" "}
                      to organize your flies.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {TIER_ORDER.map((tier) => {
                      const inTier = boxesByTier[tier];
                      if (!inTier || inTier.length === 0) return null;
                      return (
                        <div key={tier}>
                          <p
                            className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                            style={{ color: TIER_ACCENT[tier] }}
                          >
                            {TIER_LABELS[tier]}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {inTier.map((b) => {
                              const active = selectedBoxIds.includes(b.id);
                              return (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => toggleBox(b.id)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${
                                    active
                                      ? "text-[var(--surface-page)] font-semibold"
                                      : "bg-[var(--surface-raised)] border border-[var(--border-rule)] text-[var(--text-body)] hover:border-[var(--action)]/50"
                                  }`}
                                  style={
                                    active
                                      ? { backgroundColor: TIER_ACCENT[tier] }
                                      : undefined
                                  }
                                >
                                  {active ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <BoxIcon className="h-3 w-3" />
                                  )}
                                  {b.name}
                                  {b.is_default && (
                                    <span className="text-[9px] uppercase tracking-wider opacity-70">
                                      default
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Section>

              {/* Advanced disclosure */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((p) => !p)}
                  className="text-xs text-[var(--text-meta)] hover:text-[var(--action)] inline-flex items-center gap-1 transition-colors"
                >
                  {advancedOpen ? "−" : "+"} More options
                  <span className="text-[10px] opacity-70">
                    (label, notes, tie-next target)
                  </span>
                </button>
                {advancedOpen && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-body)] mb-1.5">
                        Custom name (optional)
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder={`e.g. "Madison ${fly.name}"`}
                        className="w-full bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[#6E7681] focus:outline-none focus:border-[var(--action)]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-body)] mb-1.5">
                        Tie-next target qty
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={tieNextTarget === "" ? "" : String(tieNextTarget)}
                        onChange={(e) =>
                          setTieNextTarget(
                            e.target.value === ""
                              ? ""
                              : Math.max(0, parseInt(e.target.value, 10) || 0),
                          )
                        }
                        placeholder="e.g. 8"
                        className="w-full bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[#6E7681] focus:outline-none focus:border-[var(--action)]/50"
                      />
                      <p className="text-[10px] text-[var(--text-meta)] mt-1">
                        Auto-queues for tying when stock drops below target.
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-body)] mb-1.5">
                        Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder="Hot collar trick, where you fish it…"
                        className="w-full bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[#6E7681] focus:outline-none focus:border-[var(--action)]/50"
                      />
                    </div>
                    {fly.slug && (
                      <p className="text-[10px] text-[var(--text-meta)]">
                        Need to override hook brand, thread denier, or specific materials?{" "}
                        <Link
                          href={`/flies/${fly.slug}`}
                          className="text-[var(--action)] hover:underline"
                        >
                          Open full personalize
                        </Link>
                        .
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Live label preview */}
              {suggestedLabel && (
                <div className="rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)]/60 p-2.5 text-[11px] text-[var(--text-body)]">
                  Will save as:{" "}
                  <span className="text-[var(--text-primary)] font-medium">{fly.name}</span>{" "}
                  <span className="text-[var(--action)]">· {suggestedLabel}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--border-rule)] bg-[var(--surface-page)] space-y-2">
          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3" /> {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="solid"
             
              icon={saving ? undefined : Plus}
              loading={saving}
              className="flex-[2]"
              onClick={handleSave}
              disabled={
                saving ||
                loading ||
                authError ||
                selectedBoxIds.length === 0 ||
                boxes.length === 0
              }
            >
              {saving
                ? "Saving…"
                : selectedBoxIds.length > 1
                ? `Add to ${selectedBoxIds.length} boxes`
                : "Add to box"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-2">
        {label}
        {required && <span className="text-[var(--action)] ml-1">*</span>}
      </p>
      {children}
    </section>
  );
}

function SignInPrompt({ flySlug }: { flySlug?: string }) {
  const redirect = flySlug ? `/flies/${flySlug}` : "/flies";
  return (
    <div className="py-6 text-center space-y-3">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[var(--action)]/10 text-[var(--action)]">
        <BoxIcon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-[var(--text-primary)] font-medium">Sign in to save flies</p>
        <p className="text-xs text-[var(--text-meta)] mt-1">
          Your fly box, your tying queue, your catch journal — all synced.
        </p>
      </div>
      <Button variant="solid" href={`/login?redirect=${encodeURIComponent(redirect)}`}>
        Sign in
      </Button>
    </div>
  );
}
