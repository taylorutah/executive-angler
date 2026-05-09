"use client";
/**
 * Pattern detail header actions: Edit (admin/owner) + "+ New Variant" buttons.
 *
 * Lives in its own client component so the v2 page itself stays an RSC.
 */
import { useState } from "react";
import NewVariantModal from "@/components/flies-v2/NewVariantModal";
import EditPatternButton from "@/components/flies-v2/EditPatternButton";
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
}

export default function PatternHeaderActions({
  patternId,
  patternSlug,
  editablePattern,
  userBoxes,
  isAdmin,
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-2">
      {editablePattern && (
        <EditPatternButton
          pattern={editablePattern}
          boxes={userBoxes ?? []}
          isAdmin={!!isAdmin}
        />
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-[#E8923A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#d17d28] transition-colors"
      >
        + New Variant
      </button>
      <NewVariantModal
        patternId={patternId}
        patternSlug={patternSlug}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
