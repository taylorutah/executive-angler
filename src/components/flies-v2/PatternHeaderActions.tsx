"use client";
/**
 * Pattern detail header actions: Edit (admin/owner) + "Tie your own version"
 * + "+ New Variant" buttons.
 *
 * Lives in its own client component so the v2 page itself stays an RSC.
 */
import Link from "next/link";
import { Pencil } from "lucide-react";
import EditPatternButton from "@/components/flies-v2/EditPatternButton";
import type { Pattern, FlyBoxV2 } from "@/types/fly-v2";
import type { ParsedBeadSpec } from "@/lib/flies/parseBeadSpec";

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
  /**
   * Pre-parsed bead spec from pattern.base_materials. Pre-fills the
   * "+ My configuration" modal so users only type what they're varying.
   */
  defaultBeadSpec?: ParsedBeadSpec;
}

export default function PatternHeaderActions({
  editablePattern,
  userBoxes,
  isAdmin,
  personalEditHref,
}: Props) {
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
        {/*
          Fork + configuration buttons hidden during the fly model reset
          (2026-05-15). Both flows created parallel fly entities — branching
          forged a personal pattern row with its own URL, configuration added
          a fly_variants row per size/bead/color combo. Both behaviors are
          being replaced by the canonical-with-options + user-configurations
          model. See plan: im-still-not-sure-elegant-hummingbird.md.
        */}
      </div>
    </div>
  );
}
