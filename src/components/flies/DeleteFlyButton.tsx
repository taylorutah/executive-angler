"use client";
/**
 * DeleteFlyButton — owner-only soft-delete control for the fly detail page.
 *
 * Behavior:
 *   1. Click the trash icon → confirmation dialog.
 *   2. Confirm → DELETE /api/fishing/flies/{id}.
 *   3. Server soft-archives (sets deleted_at = now()) and the workspace
 *      query filters it out, so the fly disappears from every list.
 *   4. Page redirects to /flies/workspace with `?undo={flyId}` so an Undo
 *      banner can offer one-click restore.
 *
 * Catches that reference this fly via fly_pattern_id stay intact — the
 * row still exists, it's just hidden. Restore = clear deleted_at.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  flyId: string;
  flyName: string;
  /** Where to navigate after a successful delete. Defaults to the workspace. */
  redirectTo?: string;
}

export default function DeleteFlyButton({
  flyId,
  flyName,
  redirectTo = "/flies/workspace",
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/fishing/flies/${flyId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body.error ?? `Delete failed (HTTP ${res.status})`;
        setError(msg);
        setBusy(false);
        return;
      }
      // Carry the id forward so the destination can render an Undo toast.
      const dest = `${redirectTo}?undo=${encodeURIComponent(flyId)}`;
      startTransition(() => router.push(dest));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setBusy(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="destructive"
          size="sm"
          icon={Trash2}
         
          aria-label={`Delete ${flyName}`}
          title="Delete this fly"
        >
          Delete
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="font-heading text-lg font-semibold text-[var(--color-text-primary)]">
                Delete this fly?
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-[var(--color-text-muted)]">
                <span className="font-medium text-[var(--color-text-primary)]">
                  {flyName}
                </span>{" "}
                will be archived. Catches that reference it stay intact, and
                you can restore it from the toast on the next page.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Cancel"
                className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {error && (
            <p className="mt-3 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
              {error}
            </p>
          )}

          <div className="mt-5 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                disabled={busy}
                className="rounded-md px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
              >
                Cancel
              </button>
            </Dialog.Close>
            <Button
              onClick={handleDelete}
              disabled={busy}
              loading={busy}
              variant="destructive"
              size="md"
              icon={!busy ? Trash2 : undefined}
             
            >
              {busy ? "Deleting…" : "Delete fly"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
