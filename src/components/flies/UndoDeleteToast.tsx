"use client";
/**
 * UndoDeleteToast — shown when the URL contains `?undo={flyId}` after a
 * soft-delete. Offers one-click restore for ~10 seconds, then auto-dismisses.
 *
 * Mounted by /flies/workspace (and any future cleanup destinations) so the
 * post-delete UX feels reversible without a permanent banner.
 */
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Undo2, X } from "lucide-react";

const AUTO_DISMISS_MS = 12_000;

export default function UndoDeleteToast() {
  const router = useRouter();
  const params = useSearchParams();
  const undoId = params?.get("undo") ?? null;

  const [visible, setVisible] = useState<boolean>(!!undoId);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"restored" | null>(null);

  useEffect(() => {
    setVisible(!!undoId);
    setDone(null);
  }, [undoId]);

  // Auto-dismiss after the timeout — also strips the param from the URL so
  // a page refresh doesn't re-show the toast.
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      setVisible(false);
      stripUndoParam();
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function stripUndoParam() {
    const sp = new URLSearchParams(params?.toString() ?? "");
    sp.delete("undo");
    const qs = sp.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }

  async function handleRestore() {
    if (!undoId || busy) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/fishing/flies/${encodeURIComponent(undoId)}?restore=1`,
        { method: "DELETE" },
      );
      if (res.ok) {
        setDone("restored");
        setTimeout(() => {
          setVisible(false);
          stripUndoParam();
          router.refresh();
        }, 1200);
      } else {
        setBusy(false);
      }
    } catch {
      setBusy(false);
    }
  }

  if (!visible || !undoId) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-2xl flex items-center gap-3 max-w-[92vw]"
    >
      <p className="text-sm text-[var(--color-text-primary)]">
        {done === "restored" ? "Fly restored." : "Fly deleted."}
      </p>
      {done !== "restored" && (
        <button
          type="button"
          onClick={handleRestore}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md bg-[var(--action)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--action-hover)] disabled:opacity-60"
        >
          <Undo2 className="h-3.5 w-3.5" />
          {busy ? "Restoring…" : "Undo"}
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          stripUndoParam();
        }}
        aria-label="Dismiss"
        className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
