"use client";

import { ReactNode } from "react";
import { FilterChip } from "./FilterDropdown";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";

interface FilterBarProps {
  children: ReactNode;
  activeChips?: { key: string; label: string; onRemove: () => void }[];
  onClearAll?: () => void;
  rightSlot?: ReactNode;
  sticky?: boolean;
  /** When true, render without the negative horizontal margin/full-bleed styling. Useful inside constrained columns. */
  inline?: boolean;
}

export default function FilterBar({
  children,
  activeChips = [],
  onClearAll,
  rightSlot,
  sticky = true,
  inline = false,
}: FilterBarProps) {
  const hasChips = activeChips.length > 0;

  const containerClasses = [
    sticky ? "sticky top-[var(--header-h)] z-30" : "",
    inline ? "" : "-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8",
    "py-3 bg-[var(--paper)] border-b border-[var(--border)] mb-4",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
            {children}
          </div>
          {rightSlot && <div className="flex items-center gap-2 shrink-0">{rightSlot}</div>}
        </div>

        {hasChips && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {activeChips.map((chip) => (
              <FilterChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
            ))}
            {onClearAll && (
              <button
                type="button"
                onClick={onClearAll}
                className={`ea-focus-ring ${FOCUS_VISIBLE} text-xs text-[var(--text-meta)] hover:text-[var(--text-body)] transition-colors px-2 py-1`}
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
