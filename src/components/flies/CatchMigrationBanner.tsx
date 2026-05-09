"use client";

/**
 * Shown on /journal/flies/[id]/edit when the pattern has a parent_canonical_id
 * and the user has past catches still referencing that canonical. Lets them
 * one-click move those catches onto this personal pattern so stats line up.
 *
 * Forward-only: no undo. The component dismisses itself locally on either
 * "migrate" or "skip" so it doesn't nag.
 */
import { useEffect, useState } from "react";
import { ArrowRightLeft, X, Loader2 } from "lucide-react";

interface Props {
  patternId: string;
  parentCanonicalName: string;
}

export default function CatchMigrationBanner({
  patternId,
  parentCanonicalName,
}: Props) {
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [migratedMsg, setMigratedMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const dismissKey = `fly-catch-migrate-dismiss-${patternId}`;
    if (typeof window !== "undefined" && window.localStorage.getItem(dismissKey)) {
      setDismissed(true);
      return;
    }
    fetch(`/api/fishing/flies/migrate-catches?pattern_id=${patternId}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setCount(d?.count ?? 0);
      })
      .catch(() => {
        /* fail silently — banner just stays hidden */
      });
    return () => {
      cancelled = true;
    };
  }, [patternId]);

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(`fly-catch-migrate-dismiss-${patternId}`, "1");
    } catch {
      /* ignore quota / private mode */
    }
  }

  async function migrate() {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/fishing/flies/migrate-catches?pattern_id=${patternId}`,
        { method: "POST" },
      );
      const d = await res.json();
      if (res.ok) {
        setMigratedMsg(`Moved ${d.migrated} ${d.migrated === 1 ? "catch" : "catches"} onto this pattern.`);
        setTimeout(() => dismiss(), 3000);
      } else {
        setMigratedMsg(d.error || "Couldn't migrate. Try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (dismissed) return null;
  if (count === null) return null;
  if (count === 0 && !migratedMsg) return null;

  if (migratedMsg) {
    return (
      <div className="rounded-md border border-[#0BA5C7]/30 bg-[#0BA5C7]/5 px-3 py-2.5 text-[12px] text-[#A8B2BD]">
        {migratedMsg}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[#E8923A]/30 bg-[#E8923A]/5 px-3 py-2.5 flex items-start gap-2.5">
      <ArrowRightLeft className="h-4 w-4 text-[#E8923A] mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-[#F0F6FC] leading-snug">
          You have <span className="font-bold text-[#E8923A]">{count}</span>{" "}
          past {count === 1 ? "catch" : "catches"} on{" "}
          <span className="font-mono text-[#E8923A]">{parentCanonicalName}</span>.
          Move {count === 1 ? "it" : "them"} to this personal pattern so your stats line up?
        </p>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={migrate}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#E8923A] text-[#0D1117] hover:bg-[#F0A65A] disabled:opacity-60 transition-colors"
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRightLeft className="h-3 w-3" />}
            {busy ? "Moving…" : `Move ${count} ${count === 1 ? "catch" : "catches"}`}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center gap-1 text-[11px] text-[#6E7681] hover:text-[#A8B2BD] transition-colors"
          >
            <X className="h-3 w-3" /> Skip
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-[#6E7681]">
          Forward-only — past catches will reference this pattern instead of the library version.
        </p>
      </div>
    </div>
  );
}
