"use client";
/**
 * EditPatternButton — opens the PatternEditDrawer.
 *
 * Mounted only when canEditPattern() returned true server-side. The drawer
 * itself is dynamically imported to keep its weight (RecipeBuilder, Bulk
 * builder, photo uploaders) off the initial pattern detail bundle.
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import { Pencil } from "lucide-react";
import type { Pattern, FlyBoxV2 } from "@/types/fly-v2";

const PatternEditDrawer = dynamic(
  () => import("@/components/flies-v2/PatternEditDrawer"),
  { ssr: false },
);

interface Props {
  pattern: Pattern;
  boxes: FlyBoxV2[];
  isAdmin: boolean;
}

export default function EditPatternButton({ pattern, boxes, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Pattern>(pattern);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-[#30363D] bg-[#161B22] px-3 py-1.5 text-xs font-medium text-[#F0F6FC] hover:border-[#E8923A] hover:text-[#E8923A] transition-colors"
        title="Edit pattern"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </button>
      {open && (
        <PatternEditDrawer
          pattern={current}
          boxes={boxes}
          isAdmin={isAdmin}
          open={open}
          onClose={() => setOpen(false)}
          onPatternChanged={setCurrent}
        />
      )}
    </>
  );
}
