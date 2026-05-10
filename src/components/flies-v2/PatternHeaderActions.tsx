"use client";
/**
 * Pattern detail header actions: Edit (admin/owner) + "Tie your own version"
 * + "+ New Variant" buttons.
 *
 * Lives in its own client component so the v2 page itself stays an RSC.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitFork, Loader2 } from "lucide-react";
import NewVariantModal from "@/components/flies-v2/NewVariantModal";
import EditPatternButton from "@/components/flies-v2/EditPatternButton";
import { findOrForkPersonalPattern } from "@/lib/flies/forkCanonical";
import type { Pattern, FlyBoxV2 } from "@/types/fly-v2";

interface Props {
  patternId: string;
  patternSlug: string;
  /** Full pattern row, only passed when the current user can edit it. */
  editablePattern?: Pattern | null;
  /** User's existing boxes — passed only to enable the bulk-variant builder. */
  userBoxes?: FlyBoxV2[];
  /** Whether the current user is an admin (controls canonical-only options). */
  isAdmin?: boolean;
  /**
   * Whether this pattern is a canonical (no owner). Only canonicals support
   * the "Tie your own version" fork CTA — for personal patterns it's
   * meaningless.
   */
  isCanonical?: boolean;
}

export default function PatternHeaderActions({
  patternId,
  patternSlug,
  editablePattern,
  userBoxes,
  isAdmin,
  isCanonical = true,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [forking, setForking] = useState(false);
  const [forkError, setForkError] = useState<string | null>(null);

  async function handleTieYourOwn() {
    setForking(true);
    setForkError(null);
    const outcome = await findOrForkPersonalPattern({
      canonicalFlyId: patternId,
      personalizations: {},
      loginRedirectTo: `/flies/${patternSlug}`,
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

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {editablePattern && (
          <EditPatternButton
            pattern={editablePattern}
            boxes={userBoxes ?? []}
            isAdmin={!!isAdmin}
          />
        )}
        {isCanonical && (
          <button
            type="button"
            onClick={handleTieYourOwn}
            disabled={forking}
            title="Make this the starting point for your own named pattern"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#0BA5C7]/40 bg-[#0BA5C7]/10 px-3 py-1.5 text-xs font-medium text-[#0BA5C7] hover:bg-[#0BA5C7]/20 transition-colors disabled:opacity-60"
          >
            {forking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <GitFork className="h-3.5 w-3.5" />
            )}
            {forking ? "Opening…" : "Tie your own version"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="Same recipe, different size or bead"
          className="inline-flex items-center gap-1.5 rounded-md bg-[#E8923A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#d17d28] transition-colors"
        >
          + New Variant
        </button>
      </div>
      {forkError && (
        <p className="text-[11px] text-red-400">{forkError}</p>
      )}
      <NewVariantModal
        patternId={patternId}
        patternSlug={patternSlug}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
