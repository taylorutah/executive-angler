"use client";

import type { FlyBoxEntry } from "@/lib/db/fly-patterns";
import { entryDeficit } from "@/lib/flies/box-stock";
import { formatVariantChip } from "@/lib/flies/variant-format";

interface VariantChipsProps {
  variants: FlyBoxEntry[];
  /** Cap how many chips to render before showing "+N". 0 = no cap. */
  max?: number;
  /** Click handler — receives the clicked variant (or undefined for the "+N" overflow). */
  onClick?: (v: FlyBoxEntry | undefined) => void;
  /** Whether to dim variants whose deficit is 0 (low-stock signal). */
  signalLowStock?: boolean;
}

/**
 * Read-only chip strip rendering each variant of a fly. IBM Plex Mono so
 * sizes/weights line up. Used in card grids and the Variants column of
 * the Patterns table.
 */
export default function VariantChips({
  variants,
  max = 4,
  onClick,
  signalLowStock = false,
}: VariantChipsProps) {
  if (!variants.length) {
    return <span className="text-[11px] text-[var(--color-text-muted)]">No variants</span>;
  }
  const shown = max > 0 ? variants.slice(0, max) : variants;
  const overflow = max > 0 ? Math.max(variants.length - max, 0) : 0;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((v) => {
        const deficit = entryDeficit(v);
        const dim = signalLowStock && deficit === 0;
        return (
          <button
            key={v.id}
            type="button"
            onClick={onClick ? () => onClick(v) : undefined}
            className={[
              "inline-flex items-center rounded px-1.5 py-0 text-[11px] tabular-nums font-[var(--font-mono)] border transition-colors",
              dim
                ? "border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)]"
                : deficit > 0
                  ? "border-[#E8923A]/40 bg-[#E8923A]/10 text-[#E8923A]"
                  : "border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]",
              onClick ? "cursor-pointer hover:border-[#E8923A]/60" : "cursor-default",
            ].join(" ")}
            title={
              deficit > 0
                ? `${formatVariantChip(v)} — ${deficit} short of target`
                : formatVariantChip(v)
            }
          >
            {formatVariantChip(v)}
          </button>
        );
      })}
      {overflow > 0 ? (
        <button
          type="button"
          onClick={onClick ? () => onClick(undefined) : undefined}
          className="inline-flex items-center rounded border border-dashed border-[var(--color-border)] px-1.5 py-0 text-[11px] tabular-nums font-[var(--font-mono)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          +{overflow}
        </button>
      ) : null}
    </div>
  );
}
