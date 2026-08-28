"use client";

import { GROUP_ORDER, type SearchType } from "@/lib/search";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";
import { TYPE_LABELS } from "./meta";

interface Props {
  selected: SearchType | "all";
  onSelect: (next: SearchType | "all") => void;
  counts?: Partial<Record<SearchType, number>>;
}

/**
 * Chips narrow a query. They are never the only view — All stays first,
 * and an empty field still teaches rather than becoming a type catalog.
 * Filter chips are pills per the design system (chips and tags are the
 * only pill shapes), active state mirrors FilterChip.
 */
export default function SearchTypeChips({ selected, onSelect, counts }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Narrow by type"
      className="flex flex-wrap gap-2"
    >
      <Chip
        pressed={selected === "all"}
        onClick={() => onSelect("all")}
        label="All"
      />
      {GROUP_ORDER.map((type) => {
        const n = counts?.[type];
        const label =
          n != null && n > 0 ? `${TYPE_LABELS[type]} ${n}` : TYPE_LABELS[type];
        return (
          <Chip
            key={type}
            pressed={selected === type}
            onClick={() => onSelect(type)}
            label={label}
          />
        );
      })}
    </div>
  );
}

function Chip({
  pressed,
  onClick,
  label,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={pressed}
      onClick={onClick}
      className={`ea-focus-ring ${FOCUS_VISIBLE} rounded-[var(--radius-pill)] border px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ease-standard ${
        pressed
          ? "border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--border-strong)] hover:text-[var(--text-1)]"
      }`}
    >
      {label}
    </button>
  );
}
