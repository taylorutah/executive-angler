"use client";

/**
 * PromoteToPatternPrompt — fork CTA shown in PersonalizeSheet. Two variants:
 *   - "inline" (default): compact card, used when 0–2 fields differ
 *   - "banner": prominent top-of-sheet alert when ≥3 fields differ — at this
 *     point the user is describing a different fly, not personalizing one
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitFork, Loader2 } from "lucide-react";
import { findOrForkPersonalPattern } from "@/lib/flies/forkCanonical";
import type { Personalizations } from "@/lib/flies/resolveFlyForViewer";

interface Props {
  canonicalFlyId: string;
  canonicalName: string;
  personalizations: Personalizations;
  variant?: "inline" | "banner";
}

export default function PromoteToPatternPrompt({
  canonicalFlyId,
  canonicalName,
  personalizations,
  variant = "inline",
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFork() {
    setBusy(true);
    setError(null);
    const outcome = await findOrForkPersonalPattern({
      canonicalFlyId,
      personalizations,
      loginRedirectTo: `/flies/${canonicalFlyId}`,
    });
    if (outcome.kind === "needs_login") {
      router.push(outcome.redirectTo);
      return;
    }
    if (outcome.kind === "error") {
      setError(outcome.message);
      setBusy(false);
      return;
    }
    const suffix = outcome.isNewFork ? "?just_forked=1" : "";
    router.push(`/journal/flies/${outcome.patternId}/edit${suffix}`);
  }

  if (variant === "banner") {
    return (
      <div className="rounded-xl border border-[#0BA5C7]/40 bg-[#0BA5C7]/10 px-4 py-3">
        <div className="flex items-start gap-3">
          <GitFork className="h-5 w-5 text-[#0BA5C7] mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#F0F6FC] font-semibold">
              This is becoming its own fly.
            </p>
            <p className="text-xs text-[#A8B2BD] mt-0.5 leading-relaxed">
              You&rsquo;ve overridden enough fields that you&rsquo;re describing a
              different fly than{" "}
              <span className="font-mono text-[#E8923A]">{canonicalName}</span>.
              Save it as your own named pattern instead — you&rsquo;ll get a full
              recipe page and proper catch attribution.
            </p>
            {error && <p className="text-[11px] text-red-400 mt-1.5">{error}</p>}
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleFork}
                disabled={busy}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-[#0BA5C7] text-[#0D1117] hover:bg-[#3FBED7] disabled:opacity-60 transition-colors"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <GitFork className="h-3.5 w-3.5" />}
                Create new pattern
              </button>
              <span className="text-[10px] text-[#6E7681]">
                Your fly box entry stays put — catches won&rsquo;t reassign.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#0BA5C7]/30 bg-[#0BA5C7]/5 px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        <GitFork className="h-4 w-4 text-[#0BA5C7] mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[#F0F6FC] leading-relaxed">
            <span className="font-semibold">This is becoming its own fly.</span>{" "}
            Want to fork your version of <span className="font-mono text-[#E8923A]">{canonicalName}</span> into your personal pattern library?
          </p>
          {error && <p className="text-[11px] text-red-400 mt-1.5">{error}</p>}
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleFork}
              disabled={busy}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#0BA5C7] text-[#0D1117] hover:bg-[#3FBED7] disabled:opacity-60 transition-colors"
            >
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <GitFork className="h-3 w-3" />}
              Fork as personal pattern
            </button>
            <span className="text-[10px] text-[#6E7681]">
              Your fly box entry stays put — catches won&rsquo;t reassign.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
