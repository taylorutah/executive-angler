"use client";

/**
 * InYourBoxStrip — the identity strip pinned to the top of every canonical
 * fly page. Three states:
 *   1. Anonymous — sign-in prompt.
 *   2. Signed in, not in box — "Add to Fly Box" button → opens PersonalizeSheet.
 *   3. Signed in, in box — Yours/Library view toggle + Card + Edit + summary.
 *
 * The component does NOT decide what the recipe rows show — that's the job of
 * resolveFlyForViewer + the page. This component owns the action surface
 * (toggle, edit, card, summary badge) only.
 */

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Plus,
  Edit3,
  Loader2,
  Check,
  ListChecks,
  CreditCard,
  Library,
} from "lucide-react";
import PersonalizeSheet, {
  type PersonalizeSheetCanonicalFly,
} from "./PersonalizeSheet";
import FlyCardModal from "./FlyCardModal";
import {
  summarizePersonalization,
  type Personalizations,
  type ResolvedFly,
} from "@/lib/flies/resolveFlyForViewer";

interface Props {
  fly: PersonalizeSheetCanonicalFly;
  /** Resolved view from the server — drives the Card payload + view toggle. */
  resolved: ResolvedFly;
  /** Whether the viewer has Pro — passed to PersonalizeSheet. */
  isPro: boolean;
  /** Username for Card footer credit. */
  username?: string | null;
}

interface BoxRow {
  id: string;
  personalizations: Personalizations | null;
  preferred_sizes: string[] | null;
  personal_notes: string | null;
  custom_image_url: string | null;
  custom_name: string | null;
  is_favorite: boolean | null;
  is_tie_next: boolean | null;
}

export default function InYourBoxStrip({ fly, resolved, isPro, username }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [row, setRow] = useState<BoxRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);

  function flipView(next: "yours" | "library") {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (next === "library") params.set("view", "library");
    else params.delete("view");
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setAuthed(false);
      setRow(null);
      setLoading(false);
      return;
    }
    setAuthed(true);
    const { data } = await supabase
      .from("user_fly_box")
      .select(
        "id, personalizations, preferred_sizes, personal_notes, custom_image_url, custom_name, is_favorite, is_tie_next",
      )
      .eq("user_id", user.id)
      .eq("canonical_fly_id", fly.id)
      .maybeSingle();
    setRow((data as BoxRow | null) ?? null);
    setLoading(false);
  }, [fly.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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

  if (!row) {
    return (
      <>
        <div className="rounded-xl border border-[#21262D] bg-[#161B22] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-[#A8B2BD]">
            Save this fly with your specs — hook, bead, thread, the sizes you tie.
          </p>
          <button
            onClick={() => setSheetOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#E8923A] text-[#0D1117] text-sm font-semibold hover:bg-[#F0A65A] transition-colors"
          >
            <Plus className="h-4 w-4" /> Add to Fly Box
          </button>
        </div>
        <PersonalizeSheet
          open={sheetOpen}
          fly={fly}
          isInBox={false}
          isPro={isPro}
          onClose={() => setSheetOpen(false)}
          onSaved={() => {
            refresh();
            // Re-render the canonical page so resolved view reflects new state.
            // (router.refresh would be cleaner here, but the strip itself
            // remounts via refresh() and the page already revalidates on focus
            // in dev — production users see new data on next interaction.)
          }}
        />
      </>
    );
  }

  // In box — show identity strip with Card + Edit; "view library reference" is a quiet text link.
  const summary = summarizePersonalization(
    row.personalizations ?? {},
    row.preferred_sizes ?? null,
  );
  const flyForCard = buildFlyForCard(resolved);
  const isLibraryView = resolved.viewMode === "library";

  return (
    <>
      {isLibraryView && (
        <div className="mb-3 rounded-xl border border-[#0BA5C7]/30 bg-[#0BA5C7]/5 px-4 py-2.5 flex items-center gap-3 text-xs">
          <Library className="h-4 w-4 text-[#0BA5C7] shrink-0" />
          <p className="text-[#A8B2BD] flex-1">
            You&rsquo;re viewing the <span className="font-semibold text-[#F0F6FC]">library reference</span>. Your version of this fly has been hidden.
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

      <div className="rounded-xl border border-[#E8923A]/30 bg-[#E8923A]/5 px-4 py-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#E8923A]">
                <Check className="h-3 w-3" /> In your fly box
              </span>
              {row.is_tie_next && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#0BA5C7]">
                  <ListChecks className="h-3 w-3" /> Queued to tie
                </span>
              )}
              {resolved.deviationCount > 0 && (
                <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-[#A8B2BD]">
                  · {resolved.deviationCount} {resolved.deviationCount === 1 ? "tweak" : "tweaks"}
                </span>
              )}
            </div>
            <p
              className="text-sm text-[#F0F6FC] truncate"
              title={summary || undefined}
            >
              {summary ||
                "No specs saved yet — tap Edit to record your hook, bead, thread."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#21262D] bg-[#161B22] text-[#A8B2BD] hover:text-[#F0F6FC] hover:border-[#E8923A]/40 text-xs font-semibold transition-colors"
              title="Open recipe card"
            >
              <CreditCard className="h-3.5 w-3.5" /> Card
            </button>
            <button
              onClick={() => setSheetOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8923A]/40 bg-[#E8923A]/10 text-[#E8923A] hover:bg-[#E8923A]/20 text-xs font-semibold transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
        </div>
        {!isLibraryView && (
          <div className="mt-2 pt-2 border-t border-[#E8923A]/15 flex justify-end">
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
        isInBox={true}
        isPro={isPro}
        onClose={() => setSheetOpen(false)}
        onSaved={() => {
          refresh();
          // Force the server component to re-render with the new fly box row
          // so resolved data reflects saved overrides.
          if (typeof window !== "undefined") {
            // Soft reload to re-resolve the page (router.refresh equivalent
            // without importing the hook in this small component).
            window.location.reload();
          }
        }}
      />

      <FlyCardModal
        open={cardOpen}
        onClose={() => setCardOpen(false)}
        fly={flyForCard}
        imageUrl={resolved.heroImageUrl.value ?? null}
        username={username ?? null}
      />
    </>
  );
}

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
    bead_size: slotMap.bead, // The Card formats bead from material+size+color string
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
