"use client";
/**
 * Tiny client wrapper — owns the open/closed state for QuickFlyAddSheet so
 * the box detail page can stay a Server Component.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import QuickFlyAddSheet from "./QuickFlyAddSheet";

interface Props {
  boxId: string;
  boxName: string;
}

export default function QuickFlyAddButton({ boxId, boxName }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-[#E8923A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#F0A65A] transition-colors shadow-sm"
        title="Search any fly and add sized variants to this box"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Quick Fly Add
      </button>
      {open && (
        <QuickFlyAddSheet
          boxId={boxId}
          boxName={boxName}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
