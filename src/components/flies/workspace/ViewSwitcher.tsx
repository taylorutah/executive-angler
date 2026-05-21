"use client";
/**
 * ViewSwitcher — segmented control to pick the display mode for the
 * current workspace view.
 *
 *   Grid · Table · Kanban · Group by box
 *
 * Each option is rendered with an icon + label on desktop, icon-only on
 * narrow screens.
 */
import { LayoutGrid, Rows3, KanbanSquare, Boxes } from "lucide-react";
import type { WorkspaceViewType } from "@/lib/flies/workspace-shared";

const OPTIONS: {
  value: WorkspaceViewType;
  label: string;
  Icon: typeof LayoutGrid;
}[] = [
  { value: "grid", label: "Grid", Icon: LayoutGrid },
  { value: "table", label: "Table", Icon: Rows3 },
  { value: "kanban", label: "Kanban", Icon: KanbanSquare },
  { value: "group-by-box", label: "By box", Icon: Boxes },
];

interface Props {
  value: WorkspaceViewType;
  onChange: (next: WorkspaceViewType) => void;
}

export default function ViewSwitcher({ value, onChange }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Display mode"
      className="inline-flex items-center gap-0.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            title={opt.label}
            className={[
              "inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-[#E8923A] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)]",
            ].join(" ")}
          >
            <opt.Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
