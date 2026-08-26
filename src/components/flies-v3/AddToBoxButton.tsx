"use client";
/**
 * AddToBoxButton — primary "+ Add to my box" CTA on the fly detail page.
 *
 * Flow:
 *   - Anonymous user → redirect to /login?redirect=current.
 *   - User with 0 or 1 box (or has a default-flagged box) → one click creates
 *     a default version and adds it to that box. Toast confirms.
 *   - User with 2+ boxes and no default → opens a box-picker drawer.
 *
 * After success, a follow-up "Customize" link lets the user tweak size/bead/etc.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Check } from "@/icons";

interface BoxOption {
  id: string;
  name: string;
  tier: string;
  is_default: boolean;
}

interface Props {
  flyId: string;
  /** Optional initial label override. */
  label?: string;
  /** Called after a successful add, with the new configuration id. */
  onAdded?: (configurationId: string, boxId: string) => void;
  /** When true, renders compact (icon + short label). */
  compact?: boolean;
  /** When the viewer is anonymous, button redirects to login with this path. */
  loginRedirectPath: string;
}

export default function AddToBoxButton({
  flyId,
  label = "+ Add to my box",
  onAdded,
  compact,
  loginRedirectPath,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [picker, setPicker] = useState<BoxOption[] | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function attemptAdd(boxId?: string) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/fishing/fly-configurations/quick-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fly_id: flyId, box_id: boxId }),
      });
      if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(loginRedirectPath)}`);
        return;
      }
      const json = await res.json();
      if (res.status === 409 && json.needsBoxPicker) {
        setPicker(json.boxes ?? []);
        setPending(false);
        return;
      }
      if (!res.ok) {
        setError(json.error ?? "Could not add to box");
        setPending(false);
        return;
      }
      setDone(true);
      setPicker(null);
      onAdded?.(json.configurationId, json.boxId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setPending(false);
    }
  }

  const buttonClass = compact
    ? "inline-flex items-center gap-1.5 rounded-md bg-[var(--action)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#d17d28] transition-colors disabled:opacity-60"
    : "inline-flex items-center gap-2 rounded-md bg-[var(--action)] px-4 py-2 text-sm font-medium text-white hover:bg-[#d17d28] transition-colors disabled:opacity-60";

  if (done) {
    return (
      <span
        className={
          compact
            ? "inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500"
            : "inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-500"
        }
      >
        <Check className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        Added to your box
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => attemptAdd()}
        className={buttonClass}
        title="Add this fly to one of your boxes"
      >
        {pending ? (
          <Loader2 className={compact ? "h-3.5 w-3.5 animate-spin" : "h-4 w-4 animate-spin"} />
        ) : (
          <Plus className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        )}
        {label}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {picker && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="box-picker-title"
          onClick={() => setPicker(null)}
        >
          <div
            className="w-full sm:max-w-md bg-[var(--color-surface,#fff)] dark:bg-[var(--surface-raised)] rounded-t-xl sm:rounded-xl p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="box-picker-title" className="text-base font-semibold mb-1">
              Which box?
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mb-4">
              Choose a box to add this fly to. You can move it later.
            </p>
            <ul className="space-y-1">
              {picker.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => attemptAdd(b.id)}
                    disabled={pending}
                    className="w-full flex items-center justify-between gap-3 rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[var(--border-strong)] px-3 py-2.5 text-sm hover:border-[var(--action)] hover:bg-[var(--action)]/5 transition-colors text-left disabled:opacity-60"
                  >
                    <span className="font-medium">{b.name}</span>
                    <span className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                      {b.tier}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setPicker(null)}
              className="mt-4 w-full rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[var(--border-strong)] px-3 py-2 text-xs hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[var(--border-rule)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
