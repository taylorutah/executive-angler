"use client";

/**
 * PromoteToPatternPrompt — soft inline alert that appears in PersonalizeSheet
 * once the viewer has overridden enough fields that this is "becoming its own
 * fly." Clicking forks their personalization into a fresh fly_patterns row at
 * /anglers/{username}/flies/{slug}/edit and routes there.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitFork, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Personalizations } from "@/lib/flies/resolveFlyForViewer";

interface Props {
  canonicalFlyId: string;
  canonicalName: string;
  personalizations: Personalizations;
}

export default function PromoteToPatternPrompt({
  canonicalFlyId,
  canonicalName,
  personalizations,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFork() {
    setBusy(true);
    setError(null);
    try {
      // Look up the user's username so we can navigate to the right URL.
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Sign in to fork as your own pattern.");
        setBusy(false);
        return;
      }

      const res = await fetch("/api/fishing/flies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "personalization",
          canonical_fly_id: canonicalFlyId,
          personalizations,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Couldn't fork. Try again.");
        return;
      }
      const { pattern_id } = (await res.json()) as { pattern_id?: string };
      if (!pattern_id) {
        setError("Fork succeeded but no pattern id returned.");
        return;
      }
      // Navigate to the personal pattern edit page so the user can refine it.
      router.push(`/journal/flies/${pattern_id}/edit`);
    } catch (e) {
      console.error("[PromoteToPatternPrompt] error:", e);
      setError("Network error");
    } finally {
      setBusy(false);
    }
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
              Your fly box entry stays put — catches won't reassign.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
