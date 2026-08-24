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
 * Square, hairline border, no fill-on-hover shadow — the Water Desk chip,
 * not the rounded-pill filter used elsewhere on the site.
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
      className={`ea-focus-ring ${FOCUS_VISIBLE} border px-3 py-1.5 text-[13px] font-medium transition-colors duration-[120ms] ease-out ${
        pressed
          ? "border-[var(--action)] bg-[var(--action)] text-[var(--on-action)]"
          : "border-[var(--border-rule)] bg-[var(--surface-card)] text-[var(--text-body)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
      }`}
    >
      {label}
    </button>
  );
}
