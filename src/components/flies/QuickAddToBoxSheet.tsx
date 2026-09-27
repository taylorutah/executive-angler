"use client";

/**
 * QuickAddToBoxSheet — the universal "add this fly to my box" sheet.
 *
 * Opens from any fly surface (catalog cards, hatch tables, search results,
 * river pages, etc.) and lets the angler in one screen:
 *   1. Pick size(s) — multi-select chips from canonical.sizes
 *   2. Pick bead spec — material + weight (mm) + color (only if canonical
 *      has bead_options OR the category implies a beadhead)
 *   3. Pick body color — suggestion chips + free-text (typed value wins)
 *   4. Set quantity + source (Tied | Bought)
 *   5. Pick destination box(es) — chips grouped by tier (Kill / Support /
 *      Archive / Custom); default box pre-checked; multi-select
 *   6. (Optional) expand "More options" for notes, tie-next target,
 *      custom name
 *
 * Name-first mode (no fly.id): resolve an approved catalog name, or POST
 * /api/fishing/flies as a private fly, then create configs. Default source
 * is Bought. Each selected size is its own configuration row — size is
 * never a comma-joined string.
 *
 * Saves via POST /api/fishing/fly-configurations (user_fly_configurations).
 * Body color persists as slot_overrides.body.color; bead color as
 * slot_overrides.bead.color. Both are free-text. Suggestion chips are
 * guidance, not an enum.
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
} from "@/icons";
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
const FALLBACK_SIZES = ["12", "14", "16", "18", "20", "22"];

const TIER_ORDER = ["kill", "support", "archive", "custom"] as const;
const TIER_LABELS: Record<string, string> = {
  kill: "Kill — your top box",
  support: "Support",
  archive: "Archive",
  custom: "Custom",
};
const chipBase =
  "px-3 py-1.5 rounded-[var(--radius-md)] text-xs border transition-colors";
const chipOn =
  "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)] font-medium";
const chipOff =
  "bg-[var(--surface)] border-[var(--border)] text-[var(--text-2)] hover:border-[var(--border-strong)]";

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
  fly?: QuickAddFly | null;
  /** Catalog cards default Tied; name-first / buyer path defaults Bought. */
  defaultQtySource?: "tied" | "bought";
  initialBoxId?: string;
  onClose: () => void;
  onSaved: (result: SaveResult) => void;
}

export default function QuickAddToBoxSheet({
  open,
  fly: flyProp,
  defaultQtySource,
  initialBoxId,
  onClose,
  onSaved,
}: Props) {
  // Sheet may be opened with sparse data (just id + name from a card click).
  // We hydrate sizes / colors / bead_options / hero from canonical_flies on
  // open so chip pickers populate properly.
  const isNameFirst = !flyProp?.id;
  const qtySourceDefault: "tied" | "bought" =
    defaultQtySource ?? (isNameFirst ? "bought" : "tied");
  const [fly, setFly] = useState<QuickAddFly>(flyProp ?? { id: "", name: "" });
  const [enteredName, setEnteredName] = useState(flyProp?.name ?? "");
  useEffect(() => {
    setFly(flyProp ?? { id: "", name: "" });
    setEnteredName(flyProp?.name ?? "");
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
  const [qtyBySize, setQtyBySize] = useState<Record<string, number>>({});
  const [qtySource, setQtySource] = useState<"tied" | "bought">(qtySourceDefault);
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
  const isPersonal = flyProp?.kind === "personal";
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setAuthError(false);
      setQtySource(qtySourceDefault);
      try {
        const needsHydration =
          !isNameFirst &&
          !isPersonal &&
          !!flyProp?.id &&
          (!flyProp.sizes ||
            !flyProp.colors ||
            !flyProp.beadOptions ||
            !flyProp.heroImageUrl ||
            !flyProp.slug);
        const supabase = createClient();
        const variantsQuery =
          isNameFirst || !flyProp?.id
            ? null
            : isPersonal
              ? `fly_pattern_id=${encodeURIComponent(flyProp.id)}`
              : `canonical_fly_id=${encodeURIComponent(flyProp.id)}`;

        const [boxesRes, variantsRes, canonicalRes] = await Promise.all([
          fetch("/api/fly-boxes", { credentials: "same-origin" }),
          variantsQuery
            ? fetch(`/api/fly-box?${variantsQuery}`, {
                credentials: "same-origin",
              })
            : Promise.resolve(null),
          needsHydration
            ? supabase
                .from("canonical_flies")
                .select(
                  "id, slug, name, category, sizes, colors, bead_options, hook_styles, hero_image_url",
                )
                .eq("id", flyProp!.id)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);
        if (cancelled) return;

        if (boxesRes.status === 401 || variantsRes?.status === 401) {
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
          (initialBoxId && fetchedBoxes.some((b) => b.id === initialBoxId)
            ? initialBoxId
            : null) ??
          fetchedBoxes.find((b) => b.is_default)?.id ??
          fetchedBoxes.find((b) => b.tier === "kill")?.id ??
          fetchedBoxes[0]?.id;
        if (initial) setSelectedBoxIds([initial]);

        if (variantsRes?.ok) {
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
    flyProp?.id,
    flyProp?.sizes,
    flyProp?.colors,
    flyProp?.beadOptions,
    flyProp?.heroImageUrl,
    flyProp?.slug,
    isPersonal,
    isNameFirst,
    initialBoxId,
    qtySourceDefault,
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
    setQtyBySize({});
    setQtySource(qtySourceDefault);
    setEnteredName(flyProp?.name ?? "");
    setAdvancedOpen(false);
    setNotes("");
    setCustomName("");
    setTieNextTarget("");
    setError(null);
  }, [open, qtySourceDefault, flyProp?.name]);

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
    setSelectedSizes((prev) => {
      if (prev.includes(s)) {
        setQtyBySize((q) => {
          const next = { ...q };
          delete next[s];
          return next;
        });
        return prev.filter((x) => x !== s);
      }
      setQtyBySize((q) => ({ ...q, [s]: q[s] ?? (quantity > 0 ? quantity : 0) }));
      return [...prev, s];
    });
  }

  function qtyForSize(size: string): number {
    return qtyBySize[size] ?? quantity;
  }

  function setQtyForSize(size: string, next: number) {
    const n = Math.max(0, next);
    setQtyBySize((q) => ({ ...q, [size]: n }));
  }
  function toggleBox(id: string) {
    setSelectedBoxIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }
  function addSizes(raw: string[]) {
    const parts = raw
      .map((s) => s.replace(/^#/, "").trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setSelectedSizes((prev) => {
      const next = [...prev];
      for (const s of parts) {
        if (!next.includes(s)) next.push(s);
      }
      return next;
    });
    setQtyBySize((q) => {
      const next = { ...q };
      for (const s of parts) {
        if (next[s] == null) next[s] = quantity > 0 ? quantity : 0;
      }
      return next;
    });
  }

  async function resolveFly(): Promise<{ id: string; name: string; slug?: string } | null> {
    if (fly.id) return { id: fly.id, name: fly.name, slug: fly.slug };
    const name = enteredName.trim();
    if (!name) {
      setError("Enter a fly name.");
      return null;
    }
    const supabase = createClient();
    const { data: approved } = await supabase
      .from("flies")
      .select("id, name, slug")
      .eq("status", "approved")
      .is("deleted_at", null)
      .ilike("name", name)
      .limit(1)
      .maybeSingle();
    if (approved) {
      return { id: approved.id as string, name: approved.name as string, slug: (approved.slug as string) ?? undefined };
    }
    const res = await fetch("/api/fishing/flies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, skip_auto_config: true }),
      credentials: "same-origin",
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "Couldn't add that fly.");
      return null;
    }
    const created = (await res.json()) as { id?: string; name?: string; slug?: string };
    if (!created.id) {
      setError("Couldn't add that fly.");
      return null;
    }
    return { id: created.id, name: created.name ?? name, slug: created.slug };
  }

  async function handleSave() {
    if (selectedBoxIds.length === 0) {
      setError("Pick at least one box.");
      return;
    }
    setSaving(true);
    setError(null);

    const colorToSave = selectedColor?.trim() || "";
    const beadColorToSave = beadColor?.trim() || "";

    // Live persist slot (user_fly_configurations.slot_overrides).
    // preferred_colors / personalizations were the old /api/fly-box payload;
    // that route and user_fly_box were dropped in the May-15 fly-model reset.
    const slot_overrides: Record<string, Record<string, unknown>> = {};
    if (colorToSave) {
      slot_overrides.body = { color: colorToSave };
    }
    if (beadMaterial && beadMaterial !== "none") {
      const bead: Record<string, unknown> = { material: beadMaterial };
      if (beadWeight) {
        const n = Number(beadWeight);
        if (!Number.isNaN(n)) bead.size_mm = n;
      }
      if (beadColorToSave) bead.color = beadColorToSave;
      slot_overrides.bead = bead;
    } else if (beadMaterial === "none") {
      slot_overrides.bead = { material: "none" };
    }

    const sizesToSave: Array<string | null> = selectedSizes.length > 0 ? selectedSizes : [null];
    const labelToSave =
      suggestedLabel ||
      [colorToSave, selectedSizes[0] && `#${selectedSizes[0]}`, beadWeight && `${beadWeight}mm`]
        .filter(Boolean)
        .join(" · ");

    try {
      const resolved = await resolveFly();
      if (!resolved) return;

      let firstConfigurationId: string | null = null;
      for (const size of sizesToSave) {
        const qty = size ? qtyForSize(size) : quantity;
        const tied_count = qtySource === "tied" ? qty : 0;
        const bought_count = qtySource === "bought" ? qty : 0;
        const payload: Record<string, unknown> = {
          fly_id: resolved.id,
          box_id: selectedBoxIds[0],
          size,
          slot_overrides,
          nickname: customName.trim() || null,
          personal_notes: notes.trim() || null,
          tied_count,
          bought_count,
          target_count:
            typeof tieNextTarget === "number" && tieNextTarget > 0 ? tieNextTarget : 0,
          is_tie_next:
            typeof tieNextTarget === "number" &&
            tieNextTarget > 0 &&
            qty < tieNextTarget,
        };

        const res = await fetch("/api/fishing/fly-configurations", {
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
        const data = (await res.json()) as { configuration?: { id: string } };
        const configurationId = data.configuration?.id;
        if (!configurationId) {
          setError("Save failed.");
          return;
        }
        if (!firstConfigurationId) firstConfigurationId = configurationId;
        for (const boxId of selectedBoxIds.slice(1)) {
          const boxRes = await fetch("/api/fishing/fly-configurations/box", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              configuration_id: configurationId,
              box_id: boxId,
            }),
            credentials: "same-origin",
          });
          if (!boxRes.ok) {
            setError("Saved the version, but couldn't add it to every box.");
            return;
          }
        }
      }
      if (!firstConfigurationId) {
        setError("Save failed.");
        return;
      }
      const boxNames = boxes
        .filter((b) => selectedBoxIds.includes(b.id))
        .map((b) => b.name);
      onSaved({
        variantId: firstConfigurationId,
        variantLabel: labelToSave || resolved.name,
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
        className="ea-modal-overlay absolute inset-0"
      />

      <div className="relative w-full sm:ml-auto sm:max-w-lg sm:h-full bg-[var(--paper)] sm:border-l border-t sm:border-t-0 border-[var(--border)] flex flex-col shadow-[var(--shadow-float)] rounded-t-[var(--radius-card)] sm:rounded-none max-h-[92vh] sm:max-h-full">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-[var(--border)]">
          {fly.heroImageUrl ? (
            <div className="relative flex-shrink-0 h-12 w-12 rounded-[var(--radius-md)] overflow-hidden border border-[var(--border)] bg-[var(--paper-deep)]">
              <Image
                src={fly.heroImageUrl}
                alt={fly.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper-deep)] text-[var(--accent)] flex-shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="ea-overline text-[var(--accent)]">
              Add to fly box
            </p>
            {isNameFirst ? (
              <input
                id="qa-fly-name"
                type="text"
                value={enteredName}
                onChange={(e) => setEnteredName(e.target.value)}
                placeholder="Fly name, e.g. Steve's Hot Head"
                className="ea-input mt-1 font-display text-lg font-semibold"
                aria-label="Fly name"
              />
            ) : (
              <>
                <h2 id="qa-fly-name" className="font-display text-lg font-semibold text-[var(--text-1)] truncate">
                  {fly.name}
                </h2>
                {fly.category && (
                  <p className="text-xs text-[var(--text-3)] capitalize truncate">{fly.category}</p>
                )}
              </>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--paper-deep)] rounded-[var(--radius-md)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[var(--text-3)] py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading your boxes…
            </div>
          ) : authError ? (
            <SignInPrompt flySlug={fly.slug} />
          ) : (
            <>
              {hasExisting && (
                <div className="rounded-[var(--radius-md)] border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-3 text-xs text-[var(--text-2)] flex items-start gap-2">
                  <Star className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    You already have {existingVariants.length}{" "}
                    {existingVariants.length === 1 ? "variant" : "variants"} of this fly.
                    {fly.slug && (
                      <>
                        {" "}
                        <Link
                          href={`/flies/${fly.slug}`}
                          className="text-[var(--accent)] hover:underline inline-flex items-center gap-0.5"
                        >
                          Manage <ExternalLink className="h-3 w-3" />
                        </Link>
                      </>
                    )}
                    . Saving below adds another variant.
                  </div>
                </div>
              )}

              {/* Sizes — each selected size becomes its own configuration row. */}
              <Section label="Size">
                <div className="flex flex-wrap gap-1.5">
                  {(fly.sizes && fly.sizes.length > 0 ? fly.sizes : FALLBACK_SIZES).map((s) => {
                    const active = selectedSizes.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSize(s)}
                        className={`${chipBase} num ${active ? chipOn : chipOff}`}
                      >
                        {active && <Check className="inline h-3 w-3 mr-0.5" />}#{s}
                      </button>
                    );
                  })}
                </div>
                {(!fly.sizes || fly.sizes.length === 0) && (
                  <input
                    type="text"
                    placeholder="Other size, e.g. 10"
                    className="ea-input mt-2"
                    aria-label="Other size"
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      e.preventDefault();
                      addSizes((e.currentTarget.value || "").split(/[,\s]+/));
                      e.currentTarget.value = "";
                    }}
                  />
                )}
                <p className="ea-field-helper">
                  Each size is saved as its own stock row. Leave blank to add sizes later.
                </p>
              </Section>

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
                          className={`${chipBase} ${active ? chipOn : chipOff}`}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                  {beadMaterial && beadMaterial !== "none" && (
                    <>
                      <p className="ea-overline mb-1">
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
                              className={`${chipBase} num ${active ? chipOn : chipOff}`}
                            >
                              {w}mm
                            </button>
                          );
                        })}
                      </div>
                      <p className="ea-overline mb-1">
                        Color
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {BEAD_COLORS.map((c) => {
                          const active =
                            (beadColor ?? "").trim().toLowerCase() === c.toLowerCase();
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setBeadColor(active ? null : c)}
                              className={`${chipBase} capitalize ${active ? chipOn : chipOff}`}
                            >
                              {c}
                            </button>
                          );
                        })}
                      </div>
                      <input
                        type="text"
                        value={beadColor ?? ""}
                        onChange={(e) => setBeadColor(e.target.value || null)}
                        placeholder="UV olive, hot pink, jig pink"
                        className="ea-input"
                        aria-label="Bead color"
                      />
                    </>
                  )}
                </Section>
              )}

              {/* Body color — chips are suggestions; free text always wins. */}
              <Section label="Color">
                {fly.colors && fly.colors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {fly.colors.map((c) => {
                      const active =
                        (selectedColor ?? "").trim().toLowerCase() ===
                        c.trim().toLowerCase();
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(active ? null : c)}
                          className={`${chipBase} capitalize ${active ? chipOn : chipOff}`}
                        >
                          {active && <Check className="inline h-3 w-3 mr-0.5" />}
                          {c}
                        </button>
                      );
                    })}
                  </div>
                )}
                <input
                  type="text"
                  value={selectedColor ?? ""}
                  onChange={(e) => setSelectedColor(e.target.value || null)}
                  placeholder="olive, UV olive, pmd"
                  className="ea-input"
                  aria-label="Body color"
                />
              </Section>

              {/* Quantity source + counts */}
              <Section label="Quantity">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(["tied", "bought"] as const).map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setQtySource(src)}
                      className={`${chipBase} capitalize ${qtySource === src ? chipOn : chipOff}`}
                    >
                      {src}
                    </button>
                  ))}
                </div>
                {selectedSizes.length > 1 ? (
                  <div className="space-y-2">
                    {selectedSizes.map((s) => (
                      <div key={s} className="flex items-center gap-3">
                        <span className="w-10 num text-sm text-[var(--text-2)]">#{s}</span>
                        <QtyStepper
                          value={qtyForSize(s)}
                          onChange={(n) => setQtyForSize(s, n)}
                          ariaLabel={`Quantity for size ${s}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <QtyStepper
                    value={selectedSizes[0] ? qtyForSize(selectedSizes[0]) : quantity}
                    onChange={(n) => {
                      setQuantity(n);
                      if (selectedSizes[0]) setQtyForSize(selectedSizes[0], n);
                    }}
                    ariaLabel={qtySource === "bought" ? "How many bought" : "How many tied"}
                  />
                )}
                <p className="ea-field-helper">
                  {qtySource === "bought"
                    ? "Bought stock. Leave at 0 if you are adding the pattern without inventory yet."
                    : "Leave at 0 if you don't have any tied yet — you can still add it to a box."}
                </p>
              </Section>

              {/* Box picker */}
              <Section label="Add to box(es)" required>
                {boxes.length === 0 ? (
                  <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--text-2)] flex items-start gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                    <div>
                      You don&apos;t have any fly boxes yet.{" "}
                      <Link href="/flies/boxes" className="text-[var(--accent)] hover:underline">
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
                          <p className="ea-overline mb-1.5">
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
                                  className={`inline-flex items-center gap-1.5 ${chipBase} ${active ? chipOn : chipOff}`}
                                >
                                  {active ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <BoxIcon className="h-3 w-3" />
                                  )}
                                  {b.name}
                                  {b.is_default && (
                                    <Star className="h-3 w-3 fill-current" aria-label="Default box" />
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
                  className="text-xs text-[var(--text-3)] hover:text-[var(--accent)] inline-flex items-center gap-1 transition-colors"
                >
                  {advancedOpen ? "−" : "+"} More options
                  <span className="text-xs text-[var(--text-3)]">
                    (label, notes, tie-next target)
                  </span>
                </button>
                {advancedOpen && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="ea-label">
                        Custom name (optional)
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder={`e.g. "Madison ${fly.name}"`}
                        className="ea-input"
                      />
                    </div>
                    <div>
                      <label className="ea-label">
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
                        className="ea-input"
                      />
                      <p className="ea-field-helper">
                        Auto-queues for tying when stock drops below target.
                      </p>
                    </div>
                    <div>
                      <label className="ea-label">
                        Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder="Hot collar trick, where you fish it…"
                        className="ea-input"
                      />
                    </div>
                    {fly.slug && (
                      <p className="ea-field-helper">
                        Need to override hook brand, thread denier, or specific materials?{" "}
                        <Link
                          href={`/flies/${fly.slug}`}
                          className="text-[var(--accent)] hover:underline"
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
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-2.5 text-xs text-[var(--text-2)]">
                  Will save as:{" "}
                  <span className="text-[var(--text-1)] font-medium">{fly.name}</span>{" "}
                  <span className="text-[var(--accent)]">· {suggestedLabel}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--border)] bg-[var(--paper)] space-y-2">
          {error && (
            <p className="text-xs text-[var(--danger)] flex items-center gap-1.5">
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
                boxes.length === 0 ||
                (isNameFirst && !enteredName.trim())
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

function QtyStepper({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  ariaLabel: string;
}) {
  return (
    <div className="inline-flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value === 0}
        aria-label={`Decrease ${ariaLabel}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--paper-deep)] disabled:opacity-30 transition-colors"
      >
        −
      </button>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          onChange(Math.max(0, isNaN(v) ? 0 : v));
        }}
        aria-label={ariaLabel}
        className="w-14 bg-transparent text-center text-base font-semibold num text-[var(--text-1)] focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label={`Increase ${ariaLabel}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--paper-deep)] transition-colors"
      >
        +
      </button>
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
      <p className="ea-overline mb-2">
        {label}
        {required && <span className="text-[var(--danger)] ml-1">*</span>}
      </p>
      {children}
    </section>
  );
}

function SignInPrompt({ flySlug }: { flySlug?: string }) {
  const redirect = flySlug ? `/flies/${flySlug}` : "/flies";
  return (
    <div className="py-6 text-center space-y-3">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
        <BoxIcon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-[var(--text-1)] font-medium">Sign in to save flies</p>
        <p className="text-xs text-[var(--text-3)] mt-1">
          Your fly box, your tying queue, your catch journal — all synced.
        </p>
      </div>
      <Button variant="solid" href={`/login?redirect=${encodeURIComponent(redirect)}`}>
        Sign in
      </Button>
    </div>
  );
}
