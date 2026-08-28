"use client";
import { useState, useTransition } from "react";
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
    return <span className="font-ui text-[12px] text-[var(--ink)]">In locker</span>;
  }

  return (
    <span className="relative">
      <button
        type="button"
        onClick={click}
        disabled={pending}
        className="bg-[var(--action)] px-2.5 py-1 font-ui text-[12px] font-semibold text-[var(--on-action)] hover:bg-[var(--action-hover)] disabled:cursor-not-allowed"
      >
        {pending ? "Adding…" : "Add"}
      </button>
      {error ? (
        <span className="absolute right-0 top-full z-10 mt-1 whitespace-nowrap border border-[var(--border-rule)] bg-[var(--vellum)] px-1.5 py-0.5 font-ui text-[10px] text-[var(--ink)]">
          {error}
        </span>
      ) : null}
    </span>
  );
}
