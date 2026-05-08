"use client";
/**
 * Pattern detail header actions: "+ New Variant" button + modal trigger.
 *
 * Lives in its own client component so the v2 page itself stays an RSC.
 */
import { useState } from "react";
import NewVariantModal from "@/components/flies-v2/NewVariantModal";

interface Props {
  patternId: string;
  patternSlug: string;
}

export default function PatternHeaderActions({ patternId, patternSlug }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
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
    </>
  );
}
