"use client";

/**
 * InYourBoxStrip — the identity strip pinned to the top of every canonical
 * fly page.
 *
 * States:
 *   1. Anonymous            — sign-in prompt.
 *   2. Signed in, 0 variants — "Add to Fly Box" CTA → opens PersonalizeSheet.
 *   3. Signed in, 1 variant  — full strip with Card + Edit; "+ Add variant"
 *                              link in the footer.
 *   4. Signed in, 2+ variants — variant chip strip above the strip; the
 *                               active variant drives the body content.
 *
 * The component does NOT decide what the recipe rows show — that's the job of
 * resolveFlyForViewer + the page. This component owns the variant selector,
 * action surface (Card/Edit), and the "view library reference" affordance.
 */

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { findOrForkPersonalPattern } from "@/lib/flies/forkCanonical";
import {
  Plus,
  Edit3,
  Layers,
  Loader2,
  Check,
  ListChecks,
  CreditCard,
  Library,
  GitFork,
} from "lucide-react";
import PersonalizeSheet, {
  type PersonalizeSheetCanonicalFly,
} from "./PersonalizeSheet";
import FlyCardModal from "./FlyCardModal";
import ManageMembershipSheet from "./ManageMembershipSheet";
import {
  summarizePersonalization,
  type FlyBoxRow,
  type ResolvedFly,
} from "@/lib/flies/resolveFlyForViewer";
import { resolveVariantLabel } from "@/lib/flies/variantLabel";

interface Props {
  fly: PersonalizeSheetCanonicalFly;
  /** Resolved view from the server — drives the Card payload + view toggle. */
  resolved: ResolvedFly;
  /** All variants the user has of this canonical fly, primary first. */
  variants?: FlyBoxRow[];
  /** The active variant's id (the one currently driving the page). */
  activeVariantId?: string | null;
  /** Whether the viewer has Pro — passed to PersonalizeSheet. */
  isPro: boolean;
  /** Username for Card footer credit. */
  username?: string | null;
  /**
   * Whether the viewer is signed in. Authoritative — the page knows from
   * its server-side `user` object. Without this, we can't tell "logged in
   * with 0 variants" apart from "anonymous", and the strip shows the wrong
   * empty state.
   */
  viewerSignedIn?: boolean;
}

export default function InYourBoxStrip({
  fly,
  resolved,
  variants: initialVariants,
  activeVariantId: initialActiveVariantId,
  isPro,
  username,
  viewerSignedIn,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // When the page told us auth state, trust it. Otherwise infer from variants
  // (back-compat) and call refresh() to detect.
  const initialAuthed =
    typeof viewerSignedIn === "boolean"
      ? viewerSignedIn
      : (initialVariants?.length ?? 0) > 0;
  const [loading, setLoading] = useState(
    initialVariants === undefined && viewerSignedIn === undefined,
  );
  const [authed, setAuthed] = useState(initialAuthed);
  const [variants, setVariants] = useState<FlyBoxRow[]>(initialVariants ?? []);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("edit");
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [membershipOpen, setMembershipOpen] = useState<string | null>(null);
  const [forking, setForking] = useState(false);
  const [forkError, setForkError] = useState<string | null>(null);

  /**
   * "Open full editor" — eager fork. If the user already has a fly_patterns
   * row with parent_canonical_id = fly.id, navigate there. Otherwise POST
   * to forkPersonalizationToPattern with the active variant's
   * personalizations and navigate to the fresh edit page.
   */
  async function openFullEditor() {
    setForking(true);
    setForkError(null);
    const outcome = await findOrForkPersonalPattern({
      canonicalFlyId: fly.id,
      personalizations: activeRow?.personalizations ?? {},
      loginRedirectTo: `/flies/${fly.id}`,
    });
    if (outcome.kind === "needs_login") {
      router.push(outcome.redirectTo);
      return;
    }
    if (outcome.kind === "error") {
      setForkError(outcome.message);
      setForking(false);
      return;
    }
    const suffix = outcome.isNewFork ? "?just_forked=1" : "";
    router.push(`/journal/flies/${outcome.patternId}/edit${suffix}`);
  }

  const activeRow: FlyBoxRow | null =
    variants.find((v) => v.id === initialActiveVariantId) ??
    variants.find((v) => v.is_primary === true) ??
    variants[0] ??
    null;

  function flipView(next: "yours" | "library") {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (next === "library") params.set("view", "library");
    else params.delete("view");
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function selectVariant(variantId: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("variant", variantId);
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function openCreateSheet() {
    setSheetMode("create");
    setEditingVariantId(null);
    setSheetOpen(true);
  }

  function openEditSheet(variantId: string) {
    setSheetMode("edit");
    setEditingVariantId(variantId);
    setSheetOpen(true);
  }

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setAuthed(false);
      setVariants([]);
      setLoading(false);
      return;
    }
    setAuthed(true);
    const { data } = await supabase
      .from("user_fly_box")
      .select(
        "id, personalizations, preferred_sizes, preferred_colors, personal_notes, custom_image_url, custom_name, is_favorite, is_tie_next, variant_label, is_primary, variant_sort_order, tied_count, tie_next_status, tie_next_target_qty, tie_next_notes",
      )
      .eq("user_id", user.id)
      .eq("canonical_fly_id", fly.id)
      .order("is_primary", { ascending: false })
      .order("variant_sort_order", { ascending: true })
      .order("added_at", { ascending: true });
    setVariants(((data as FlyBoxRow[] | null) ?? []));
    setLoading(false);
  }, [fly.id]);

  useEffect(() => {
    // Skip the initial fetch when the server already supplied variants —
    // saves a roundtrip and prevents a flash of "checking your fly box…".
    if (initialVariants !== undefined) {
      setLoading(false);
      return;
    }
    refresh();
  }, [refresh, initialVariants]);

  // Sync state when server props change (e.g. after a hard refresh)
  useEffect(() => {
    if (initialVariants !== undefined) {
      setVariants(initialVariants);
      // Auth state: prefer the explicit viewerSignedIn signal from the page;
      // fall back to "has variants" only when no signal was provided.
      if (typeof viewerSignedIn === "boolean") {
        setAuthed(viewerSignedIn);
      } else {
        setAuthed(initialVariants.length > 0 ? true : authed);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVariants, viewerSignedIn]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#21262D] bg-[#161B22] px-4 py-3 flex items-center gap-2 text-sm text-[#6E7681]">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking your fly box…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="rounded-xl border border-[#21262D] bg-[#161B22] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-[#A8B2BD]">
          Save flies, customise the recipe, log catches against your version.
        </p>
        <a
          href={`/login?redirect=/flies/${fly.id}`}
          className="px-4 py-1.5 rounded-lg bg-[#E8923A] text-[#0D1117] text-sm font-semibold hover:bg-[#F0A65A] transition-colors text-center sm:text-left"
        >
          Sign in
        </a>
      </div>
    );
  }

  // Empty box — first-time add prompt.
  if (variants.length === 0 || !activeRow) {
    return (
      <>
        <div className="rounded-xl border border-[#21262D] bg-[#161B22] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-[#A8B2BD]">
            Save this fly with your specs — color, size, hook, bead, thread.
          </p>
          <button
            onClick={openCreateSheet}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#E8923A] text-[#0D1117] text-sm font-semibold hover:bg-[#F0A65A] transition-colors"
          >
            <Plus className="h-4 w-4" /> Add to Fly Box
          </button>
        </div>
        <PersonalizeSheet
          open={sheetOpen}
          fly={fly}
          mode="create"
          variantId={null}
          isPro={isPro}
          onClose={() => setSheetOpen(false)}
          onSaved={onSheetSaved}
        />
      </>
    );
  }

  // In box — possibly with multiple variants.
  const isLibraryView = resolved.viewMode === "library";
  const summary = summarizePersonalization(
    activeRow.personalizations ?? {},
    activeRow.preferred_sizes ?? null,
  );
  const flyForCard = buildFlyForCard(resolved);
  const showChipStrip = variants.length >= 2;

  return (
    <>
      {isLibraryView && (
        <div className="mb-3 rounded-xl border border-[#0BA5C7]/30 bg-[#0BA5C7]/5 px-4 py-2.5 flex items-center gap-3 text-xs">
          <Library className="h-4 w-4 text-[#0BA5C7] shrink-0" />
          <p className="text-[#A8B2BD] flex-1">
            You&rsquo;re viewing the{" "}
            <span className="font-semibold text-[#F0F6FC]">library reference</span>.
            {variants.length > 1
              ? " Your variants have been hidden."
              : " Your version of this fly has been hidden."}
          </p>
          <button
            type="button"
            onClick={() => flipView("yours")}
            className="text-[#0BA5C7] font-semibold hover:underline shrink-0"
          >
            Back to your version
          </button>
        </div>
      )}

      {showChipStrip && !isLibraryView && (
        <div className="mb-3 rounded-xl border border-[#21262D] bg-[#161B22] px-3 py-2.5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8B2BD]">
              Your Variants
            </span>
            <span className="text-[10px] text-[#6E7681]">
              · {variants.length} in your box
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {variants.map((v) => (
              <VariantChip
                key={v.id}
                variant={v}
                active={v.id === activeRow.id}
                onClick={() => selectVariant(v.id)}
              />
            ))}
            <button
              type="button"
              onClick={openCreateSheet}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-[#21262D] text-xs text-[#A8B2BD] hover:text-[#E8923A] hover:border-[#E8923A]/40 transition-colors"
            >
              <Plus className="h-3 w-3" /> Add variant
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[#E8923A]/30 bg-[#E8923A]/5 px-4 py-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#E8923A]">
                <Check className="h-3 w-3" /> In your fly box
              </span>
              {activeRow.tie_next_status &&
                activeRow.tie_next_status !== "none" &&
                activeRow.tie_next_status !== "done" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#0BA5C7]">
                    <ListChecks className="h-3 w-3" />
                    {tieNextLabel(activeRow)}
                  </span>
                )}
              {resolved.deviationCount > 0 && (
                <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-[#A8B2BD]">
                  · {resolved.deviationCount}{" "}
                  {resolved.deviationCount === 1 ? "tweak" : "tweaks"}
                </span>
              )}
            </div>
            <p className="text-sm text-[#F0F6FC] truncate" title={summary || undefined}>
              {summary ||
                "No specs saved yet — tap Edit to record your hook, bead, thread."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => setCardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#21262D] bg-[#161B22] text-[#A8B2BD] hover:text-[#F0F6FC] hover:border-[#E8923A]/40 text-xs font-semibold transition-colors"
              title="Open recipe card"
            >
              <CreditCard className="h-3.5 w-3.5" /> Card
            </button>
            <button
              onClick={() => setMembershipOpen(activeRow.id)}
              title="Add or remove from boxes"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#21262D] bg-[#161B22] text-[#A8B2BD] hover:text-[#F0F6FC] hover:border-[#E8923A]/40 text-xs font-semibold transition-colors"
            >
              <Layers className="h-3.5 w-3.5" /> Boxes
            </button>
            <button
              onClick={() => openEditSheet(activeRow.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8923A]/40 bg-[#E8923A]/10 text-[#E8923A] hover:bg-[#E8923A]/20 text-xs font-semibold transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              onClick={openFullEditor}
              disabled={forking}
              title="Open the full personal-pattern editor"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0BA5C7]/40 bg-[#0BA5C7]/10 text-[#0BA5C7] hover:bg-[#0BA5C7]/20 text-xs font-semibold transition-colors disabled:opacity-60"
            >
              {forking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <GitFork className="h-3.5 w-3.5" />
              )}
              {forking ? "Opening…" : "Open full editor"}
            </button>
          </div>
        </div>
        {forkError && (
          <p className="mt-2 text-[11px] text-red-400">{forkError}</p>
        )}
        {!isLibraryView && (
          <div className="mt-2 pt-2 border-t border-[#E8923A]/15 flex items-center justify-between gap-2 flex-wrap">
            {!showChipStrip ? (
              <button
                type="button"
                onClick={openCreateSheet}
                className="inline-flex items-center gap-1 text-[10px] text-[#6E7681] hover:text-[#E8923A] transition-colors"
                title="Add another color/size variant"
              >
                <Plus className="h-3 w-3" />
                Add another variant
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => flipView("library")}
              className="inline-flex items-center gap-1 text-[10px] text-[#6E7681] hover:text-[#A8B2BD] transition-colors"
              title="View the original library recipe"
            >
              <Library className="h-3 w-3" />
              View library reference
            </button>
          </div>
        )}
      </div>

      <PersonalizeSheet
        open={sheetOpen}
        fly={fly}
        mode={sheetMode}
        variantId={editingVariantId}
        isPro={isPro}
        onClose={() => setSheetOpen(false)}
        onSaved={onSheetSaved}
      />

      <FlyCardModal
        open={cardOpen}
        onClose={() => setCardOpen(false)}
        fly={flyForCard}
        imageUrl={resolved.heroImageUrl.value ?? null}
        username={username ?? null}
      />

      {membershipOpen && (
        <ManageMembershipSheet
          userFlyBoxId={membershipOpen}
          flyName={
            (activeRow && resolveVariantLabel({
              variantLabel: activeRow.variant_label ?? undefined,
              preferredColors: activeRow.preferred_colors ?? undefined,
              preferredSizes: activeRow.preferred_sizes ?? undefined,
              personalizations: activeRow.personalizations ?? undefined,
            })) || fly.name
          }
          onClose={() => setMembershipOpen(null)}
          onChange={() => {
            // Refresh page-level data after box membership changes.
            if (typeof window !== "undefined") window.location.reload();
          }}
        />
      )}
    </>
  );

  function onSheetSaved() {
    // Hard-reload so the server component re-resolves with the latest
    // variants and the chip strip + recipe + Pattern Details all update
    // together. Soft router.refresh() doesn't re-run the page's data
    // fetch reliably on Next 16 in this layout.
    if (typeof window !== "undefined") window.location.reload();
  }
}

interface VariantChipProps {
  variant: FlyBoxRow;
  active: boolean;
  onClick: () => void;
}

function VariantChip({ variant, active, onClick }: VariantChipProps) {
  const label =
    resolveVariantLabel({
      variantLabel: variant.variant_label,
      preferredColors: variant.preferred_colors ?? null,
      preferredSizes: variant.preferred_sizes ?? null,
      personalizations: variant.personalizations ?? {},
    }) || "Untitled";

  const tieNext = tieNextLabel(variant);
  const swatchColor = colorSwatchFromVariant(variant);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
        active
          ? "bg-[#E8923A] text-[#0D1117] border-[#E8923A]"
          : "bg-[#161B22] text-[#A8B2BD] border-[#21262D] hover:text-[#F0F6FC] hover:border-[#E8923A]/40"
      }`}
    >
      {swatchColor && (
        <span
          aria-hidden
          className="inline-block h-2.5 w-2.5 rounded-full border border-[#21262D]"
          style={{ backgroundColor: swatchColor }}
        />
      )}
      <span className="truncate max-w-[14rem]">{label}</span>
      {tieNext && (
        <span
          className={`inline-flex items-center text-[10px] uppercase tracking-wider ${
            active ? "text-[#0D1117]/70" : "text-[#0BA5C7]"
          }`}
        >
          · {tieNext}
        </span>
      )}
    </button>
  );
}

function tieNextLabel(row: FlyBoxRow): string | null {
  const status = row.tie_next_status;
  if (!status || status === "none") return null;
  if (status === "done") return null;
  const target = row.tie_next_target_qty ?? 0;
  const tied = row.tied_count ?? 0;
  if (target > 0) {
    if (tied >= target) return "Done";
    if (tied > 0) return `Tied ${tied}/${target}`;
    return `Tie ${target}`;
  }
  return status === "wanted" ? "Queued" : status === "at_vise" ? "At vise" : null;
}

/**
 * Map a variant's color choice to a CSS color for the chip swatch. Best-effort
 * — covers common fly colors but falls through to no swatch when unrecognised.
 */
function colorSwatchFromVariant(row: FlyBoxRow): string | null {
  const candidates = [
    row.preferred_colors?.[0],
    row.personalizations?.body?.color,
    row.personalizations?.body?.material,
    row.personalizations?.thread?.color,
  ].filter((s): s is string => Boolean(s && s.trim()));
  for (const c of candidates) {
    const swatch = NAMED_COLORS[c.toLowerCase().trim()];
    if (swatch) return swatch;
  }
  return null;
}

const NAMED_COLORS: Record<string, string> = {
  black: "#0F0F0F",
  white: "#F4F4F4",
  cream: "#E9D9B8",
  tan: "#C9A06A",
  brown: "#5C3B1F",
  rust: "#A24E22",
  red: "#9C1A1A",
  pink: "#D984A6",
  orange: "#E8923A",
  copper: "#B87333",
  yellow: "#E8C547",
  chartreuse: "#A8D85F",
  olive: "#6B7A3C",
  green: "#4A6B3A",
  blue: "#2F5D8A",
  purple: "#5E3F73",
  grey: "#7A7A7A",
  gray: "#7A7A7A",
  silver: "#C0C0C0",
  gold: "#D4AF37",
  natural: "#D9C9A8",
  bleached: "#EFE6CF",
};

/**
 * Flatten a ResolvedFly into the FlyCardModal's expected shape. Pulls hook,
 * bead, body, etc. from the resolved recipe rows so the card reflects the
 * viewer's current view (Yours or Library).
 */
function buildFlyForCard(resolved: ResolvedFly): {
  id: string;
  name: string;
  type: string;
  size: string;
  hook?: string;
  bead_size?: string;
  bead_color?: string;
  bead_material?: string;
  body_color?: string;
  body_material?: string;
  tail_color?: string;
  thorax_color?: string;
  collar_color?: string;
  rib_material?: string;
  wing_material?: string;
  fly_color?: string;
  materials?: string;
  description?: string;
  tags?: string;
  image_url?: string | null;
} {
  const slotMap: Record<string, string> = {};
  for (const row of resolved.recipe) {
    if (row.text) slotMap[row.slot] = row.text;
  }

  return {
    id: resolved.id,
    name: resolved.displayName.value,
    type: resolved.category,
    size: resolved.sizes.value.join(", "),
    hook: slotMap.hook,
    bead_size: slotMap.bead,
    body_color: slotMap.body,
    tail_color: slotMap.tail,
    thorax_color: slotMap.thorax,
    collar_color: slotMap.collar,
    rib_material: slotMap.rib,
    wing_material: slotMap.wing,
    materials: resolved.recipe
      .filter((r) => r.text)
      .map((r) => `${r.label}: ${r.text}`)
      .join("\n"),
    description: resolved.personalNotes || resolved.description,
    image_url: resolved.heroImageUrl.value ?? null,
  };
}
