"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "@/icons";

/** Whole-number stock qty >= 0 for inline editors. */
export function clampStockQty(raw: string | number): number {
  const n = typeof raw === "number" ? raw : parseInt(String(raw).trim(), 10);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function MiniQty({
  label,
  value,
  disabled,
  onCommit,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onCommit: (n: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commitFromDraft() {
    onCommit(clampStockQty(draft));
  }

  return (
    <span className="inline-flex items-center gap-0.5 min-w-0 max-w-full">
      <span className="sr-only">{label}</span>
      <button
        type="button"
        disabled={disabled || value <= 0}
        onClick={() => onCommit(Math.max(0, value - 1))}
        className="h-6 w-6 shrink-0 rounded-[var(--radius-sm)] border border-[var(--border-strong)] text-[10px] hover:bg-[var(--paper-deep)] disabled:opacity-40"
        aria-label={`Decrease ${label}`}
      >
        −
      </button>
      <input
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitFromDraft}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitFromDraft();
          }
        }}
        aria-label={label}
        className="w-9 min-w-0 shrink bg-transparent text-center text-xs font-semibold num text-[var(--text-1)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] rounded-[var(--radius-sm)]"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => onCommit(value + 1)}
        className="h-6 w-6 shrink-0 rounded-[var(--radius-sm)] border border-[var(--border-strong)] text-[10px] hover:bg-[var(--paper-deep)] disabled:opacity-40"
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </span>
  );
}

export default function BoxEntryStockControl({
  configurationId,
  tied,
  bought,
}: {
  configurationId: string;
  tied: number;
  bought: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [optimisticTied, setOptimisticTied] = useState(tied);
  const [optimisticBought, setOptimisticBought] = useState(bought);

  useEffect(() => {
    setOptimisticTied(tied);
    setOptimisticBought(bought);
  }, [tied, bought]);

  async function patch(patch: { tied_count?: number; bought_count?: number }) {
    setBusy(true);
    try {
      const res = await fetch("/api/fishing/fly-configurations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: configurationId, ...patch }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      setOptimisticTied(tied);
      setOptimisticBought(bought);
    } finally {
      setBusy(false);
    }
  }

  async function setTied(next: number) {
    const v = clampStockQty(next);
    setOptimisticTied(v);
    await patch({ tied_count: v });
  }

  async function setBought(next: number) {
    const v = clampStockQty(next);
    setOptimisticBought(v);
    await patch({ bought_count: v });
  }

  async function resetStock() {
    if (!confirm("Reset tied and bought counts to zero for this version?")) return;
    setOptimisticTied(0);
    setOptimisticBought(0);
    await patch({ tied_count: 0, bought_count: 0 });
  }

  return (
    <div className="flex flex-col items-end gap-1 min-w-0 max-w-[7.5rem] ml-auto">
      <MiniQty label="Tied count" value={optimisticTied} disabled={busy} onCommit={setTied} />
      <MiniQty label="Bought count" value={optimisticBought} disabled={busy} onCommit={setBought} />
      <button
        type="button"
        disabled={busy || (optimisticTied === 0 && optimisticBought === 0)}
        onClick={resetStock}
        title="Reset tied and bought to zero"
        className="inline-flex items-center gap-1 text-[10px] text-[var(--text-3)] hover:text-[var(--accent)] disabled:opacity-40 whitespace-nowrap"
      >
        <RotateCcw className="h-3 w-3 shrink-0" aria-hidden />
        Reset
      </button>
    </div>
  );
}
