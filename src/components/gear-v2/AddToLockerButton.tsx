"use client";
import { useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
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
      <span className="inline-flex items-center gap-1 rounded bg-[#0BA5C7]/15 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#0BA5C7]">
        <Check className="h-3 w-3" /> In locker
      </span>
    );
  }

  return (
    <span className="relative">
      <button
        type="button"
        onClick={click}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-md bg-[#1F2937] border border-[#30363D] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#F0F6FC] hover:bg-[#E8923A] hover:border-[#E8923A] hover:text-white transition-colors disabled:opacity-60"
      >
        <Plus className="h-3 w-3" /> {pending ? "Adding…" : "Add"}
      </button>
      {error && (
        <span className="absolute right-0 top-full mt-1 z-10 whitespace-nowrap rounded bg-[#7F1D1D] px-1.5 py-0.5 text-[10px] text-white shadow-lg">
          {error}
        </span>
      )}
    </span>
  );
}
