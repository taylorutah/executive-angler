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

const STEPPER_BTN =
  "inline-flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] text-sm font-semibold hover:bg-[var(--paper-deep)] disabled:opacity-40 h-11 w-11 min-h-11 min-w-11 md:h-8 md:w-8 md:min-h-8 md:min-w-8";

const QTY_INPUT =
  "min-w-0 shrink bg-transparent text-center text-sm font-semibold num text-[var(--text-1)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] rounded-[var(--radius-sm)] h-11 min-h-11 md:h-8 md:min-h-8 w-12 md:w-10";

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
    <div className="flex flex-col gap-1 w-full min-w-0">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-2)]">
        {label}
      </span>
      <div className="inline-flex items-center gap-1 w-full min-w-0 max-w-full">
        <button
          type="button"
          disabled={disabled || value <= 0}
          onClick={() => onCommit(Math.max(0, value - 1))}
          className={STEPPER_BTN}
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
          aria-label={`${label} quantity`}
          className={QTY_INPUT}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => onCommit(value + 1)}
          className={STEPPER_BTN}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function BoxEntryStockControl({
  configurationId,
  tied,
  bought,
  layout = "column",
}: {
  configurationId: string;
  tied: number;
  bought: number;
  /** `row` = stacked block under the table row on small screens */
  layout?: "column" | "row";
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

  const wrapClass =
    layout === "row"
      ? "flex flex-col gap-3 w-full min-w-0 items-stretch"
      : "flex flex-col gap-2 w-full min-w-0 md:items-end md:max-w-[11rem]";

  return (
    <div className={wrapClass} data-box-stock-control>
      <MiniQty label="Tied" value={optimisticTied} disabled={busy} onCommit={setTied} />
      <MiniQty label="Bought" value={optimisticBought} disabled={busy} onCommit={setBought} />
      <button
        type="button"
        disabled={busy || (optimisticTied === 0 && optimisticBought === 0)}
        onClick={resetStock}
        title="Reset tied and bought to zero"
        className="inline-flex items-center justify-center gap-1.5 self-start md:self-end text-xs text-[var(--text-3)] hover:text-[var(--accent)] disabled:opacity-40 min-h-11 md:min-h-8 px-1"
      >
        <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Reset
      </button>
    </div>
  );
}
