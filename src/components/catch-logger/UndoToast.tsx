"use client";
/**
 * Slide-in toast confirming a catch was logged. Shows fly name + species,
 * provides 5-second Undo button. Auto-dismisses after the timer.
 */
import { useEffect, useState, useTransition } from "react";
import { Check, Undo2 } from "lucide-react";
import { deleteCatchAction } from "@/app/journal/[id]/actions";

export interface UndoToastInfo {
  catchId: string;
  flyName: string;
  size: string;
  species: string;
}

interface Props {
  sessionId: string;
  info: UndoToastInfo | null;
  onDone: () => void;
}

const DISMISS_MS = 5000;

export default function UndoToast({ sessionId, info, onDone }: Props) {
  const [undone, setUndone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!info) return;
    setUndone(false);
    setError(null);
    const t = setTimeout(() => onDone(), DISMISS_MS);
    return () => clearTimeout(t);
  }, [info, onDone]);

  if (!info) return null;

  const undo = () => {
    if (!info.catchId || pending) return;
    startTransition(async () => {
      const r = await deleteCatchAction({ catch_id: info.catchId, session_id: sessionId });
      if (!r.ok) {
        setError(r.error ?? "Undo failed.");
        setTimeout(() => onDone(), 1500);
        return;
      }
      setUndone(true);
      setTimeout(() => onDone(), 800);
    });
  };

  const sizeLabel = info.size ? ` #${info.size}` : "";

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)]">
      <div className="rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] shadow-2xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {undone ? (
            <span className="text-[var(--text-body)] text-sm">Undone.</span>
          ) : error ? (
            <span className="text-[#F87171] text-sm">{error}</span>
          ) : (
            <>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--state-positive)]/15 text-[var(--state-positive)] flex-shrink-0">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="text-[var(--text-primary)] text-sm truncate">
                Logged {info.species} on{" "}
                <span className="text-[var(--action)]">{info.flyName}</span>
                <span className="font-['IBM_Plex_Mono'] text-xs text-[var(--text-body)]">{sizeLabel}</span>
              </span>
            </>
          )}
        </div>
        {!undone && !error && info.catchId && (
          <button
            type="button"
            onClick={undo}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--border-strong)] px-2.5 py-1 text-xs font-medium text-[var(--text-body)] hover:bg-[var(--surface-card)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-60"
          >
            <Undo2 className="h-3 w-3" />
            {pending ? "…" : "Undo"}
          </button>
        )}
      </div>
    </div>
  );
}
