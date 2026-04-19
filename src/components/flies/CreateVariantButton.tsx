"use client";

/**
 * CreateVariantButton — thin wrapper that opens VariantModal.
 *
 * Props accept either a canonical parent (canonicalId) or a personal pattern
 * parent (patternId). For unauthenticated users on public canonical pages we
 * route to /login?redirect=... on click.
 */
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sparkles } from "lucide-react";
import VariantModal, { VariantParentSpec } from "./VariantModal";

type Props = {
  parent: VariantParentSpec;
  compact?: boolean;
  label?: string;
  redirectPath?: string;
};

export default function CreateVariantButton({
  parent,
  compact = false,
  label,
  redirectPath,
}: Props) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  function handleClick() {
    if (authed === false) {
      window.location.href = `/login?redirect=${encodeURIComponent(
        redirectPath || "/my-flies"
      )}`;
      return;
    }
    setOpen(true);
  }

  const copy = label ?? (compact ? "Variant" : "Create variant");

  return (
    <>
      <button
        onClick={handleClick}
        disabled={authed === null}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#00B4D8]/40 bg-[#00B4D8]/10 text-[#00B4D8] hover:bg-[#00B4D8]/20 transition-colors ${
          compact ? "px-3 py-1.5 text-xs" : "px-5 py-3 text-sm font-medium w-full"
        } ${authed === null ? "opacity-50 cursor-wait" : ""}`}
      >
        <Sparkles className="h-4 w-4" />
        {copy}
      </button>
      {open && (
        <VariantModal
          parent={parent}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
