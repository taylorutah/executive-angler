"use client";

/**
 * Hover-revealed "Tie your own version" button on a canonical fly card.
 * Sits as an absolute-positioned sibling of the card's <Link>, intercepts
 * its own click so the fork action runs instead of card-link navigation.
 *
 * Parent must use `class="group relative"` for the hover reveal to fire.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitFork, Loader2 } from "lucide-react";
import { findOrForkPersonalPattern } from "@/lib/flies/forkCanonical";

interface Props {
  canonicalFlyId: string;
  flySlug: string;
}

export default function FlyCardForkOverlay({ canonicalFlyId, flySlug }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleFork(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    const outcome = await findOrForkPersonalPattern({
      canonicalFlyId,
      personalizations: {},
      loginRedirectTo: `/flies/${flySlug}`,
    });
    if (outcome.kind === "needs_login") {
      router.push(outcome.redirectTo);
      return;
    }
    if (outcome.kind === "error") {
      console.error("[FlyCardForkOverlay]", outcome.message);
      setBusy(false);
      return;
    }
    const suffix = outcome.isNewFork ? "?just_forked=1" : "";
    router.push(`/journal/flies/${outcome.patternId}/edit${suffix}`);
  }

  return (
    <button
      type="button"
      onClick={handleFork}
      disabled={busy}
      title="Make this the starting point for your own named pattern"
      className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-md border border-[#0BA5C7]/40 bg-[#0BA5C7]/15 backdrop-blur px-2 py-1 text-[10px] font-semibold text-[#0BA5C7] opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-[#0BA5C7]/25 disabled:opacity-60 transition-opacity"
    >
      {busy ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <GitFork className="h-3 w-3" />
      )}
      Tie your own
    </button>
  );
}
