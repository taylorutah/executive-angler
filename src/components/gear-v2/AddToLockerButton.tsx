"use client";
import { useState, useTransition } from "react";
import { Check, Plus } from "@/icons";
import { addProductToLockerAction } from "@/app/gear/actions";

interface Props {
  productId: string;
  /** Already in user's locker (from server-side join) — short-circuits to ✓. */
  initiallyInLocker: boolean;
}

export default function AddToLockerButton({ productId, initiallyInLocker }: Props) {
  const [inLocker, setInLocker] = useState(initiallyInLocker);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const click = () => {
    if (inLocker || pending) return;
    setError(null);
    startTransition(async () => {
      const r = await addProductToLockerAction({ product_id: productId });
      if (!r.ok) {
        setError(r.error ?? "Failed.");
        setTimeout(() => setError(null), 2500);
        return;
      }
      setInLocker(true);
    });
  };

  if (inLocker) {
    return (
      <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
        <Check className="h-3.5 w-3.5" /> In locker
      </span>
    );
  }

  return (
    <span className="relative">
      <button
        type="button"
        onClick={click}
        disabled={pending}
        className="ea-btn ea-btn-secondary ea-btn-sm"
      >
        <Plus className="h-3.5 w-3.5" /> {pending ? "Adding…" : "Add"}
      </button>
      {error && (
        <span className="absolute right-0 top-full mt-1 z-10 whitespace-nowrap rounded-[var(--radius-md)] bg-[var(--danger)] px-2 py-1 text-xs text-white shadow-[var(--shadow-float)]">
          {error}
        </span>
      )}
    </span>
  );
}
