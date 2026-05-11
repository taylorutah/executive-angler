"use client";
/**
 * Pattern detail header actions: Edit (admin/owner) + "Tie your own version"
 * + "+ New Variant" buttons.
 *
 * Lives in its own client component so the v2 page itself stays an RSC.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GitFork, Loader2, Pencil } from "lucide-react";
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
  /**
   * For personal patterns: link target for the Edit button. When set, renders
   * a Link (to the legacy /journal/flies/[id]/edit form) instead of the v2
   * EditPatternButton modal. The legacy form is still the source of truth for
   * editing fly_patterns row content.
   */
  personalEditHref?: string;
  /**
   * Viewer's own profile username — needed to land a fork on the personal
   * detail page at /anglers/[username]/flies/[slug]. Falls back to the edit
   * form when not provided.
   */
  viewerUsername?: string | null;
}

export default function PatternHeaderActions({
  patternId,
  patternSlug,
  editablePattern,
  userBoxes,
  isAdmin,
  isCanonical = true,
  personalEditHref,
  viewerUsername,
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
    // Prefer the personal detail page (parity with canonical layout). Need
    // both username and slug — fall back to the edit form if either is
    // missing so the user still lands somewhere usable.
    if (viewerUsername && outcome.slug) {
      router.push(`/anglers/${viewerUsername}/flies/${outcome.slug}${suffix}`);
    } else {
      router.push(`/journal/flies/${outcome.patternId}/edit${suffix}`);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {personalEditHref ? (
          <Link
            href={personalEditHref}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#30363D] bg-[#161B22] px-3 py-1.5 text-xs font-medium text-[#F0F6FC] hover:border-[#E8923A] hover:text-[#E8923A] transition-colors"
            title="Edit pattern recipe, photo, notes"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Link>
        ) : editablePattern ? (
          <EditPatternButton
            pattern={editablePattern}
            boxes={userBoxes ?? []}
            isAdmin={!!isAdmin}
          />
        ) : null}
        {isCanonical && (
          <button
            type="button"
            onClick={handleTieYourOwn}
            disabled={forking}
            title="Branch off and create your own named pattern based on this recipe"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#0BA5C7]/40 bg-[#0BA5C7]/10 px-3 py-1.5 text-xs font-medium text-[#0BA5C7] hover:bg-[#0BA5C7]/20 transition-colors disabled:opacity-60"
          >
            {forking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <GitFork className="h-3.5 w-3.5" />
            )}
            {forking ? "Opening…" : "Branch as new pattern"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="Add a new size/bead/color configuration to this pattern"
          className="inline-flex items-center gap-1.5 rounded-md bg-[#E8923A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#d17d28] transition-colors"
        >
          + My configuration
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
