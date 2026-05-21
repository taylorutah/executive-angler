"use client";
/**
 * SortMenu — popover button that exposes the four supported sort fields
 * and a direction toggle. Compact by default; expands on click.
 */
import * as Popover from "@radix-ui/react-popover";
import { ArrowUpDown, Check } from "lucide-react";
import type {
  WorkspaceSort,
  WorkspaceSortField,
} from "@/lib/flies/workspace-shared";

const FIELDS: { value: WorkspaceSortField; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "created_at", label: "Recently added" },
  { value: "last_used_at", label: "Recently used" },
  { value: "deficit", label: "Restock urgency" },
];

interface Props {
  sort: WorkspaceSort;
  onChange: (next: WorkspaceSort) => void;
}

export default function SortMenu({ sort, onChange }: Props) {
  const activeLabel =
    FIELDS.find((f) => f.value === sort.field)?.label ?? "Name";
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)]/40 transition-colors"
        >
          <ArrowUpDown className="h-3 w-3 opacity-60" />
          Sort: {activeLabel} {sort.direction === "desc" ? "↓" : "↑"}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-lg outline-none"
        >
          <p className="px-2 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Sort by
          </p>
          <ul className="space-y-0.5">
            {FIELDS.map((f) => {
              const active = f.value === sort.field;
              return (
                <li key={f.value}>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ field: f.value, direction: sort.direction })
                    }
                    className={[
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left transition-colors",
                      active
                        ? "bg-[#E8923A]/10 text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]",
                    ].join(" ")}
                  >
                    <span className="h-3 w-3 flex-shrink-0">
                      {active && <Check className="h-3 w-3 text-[#E8923A]" />}
                    </span>
                    {f.label}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="my-1 border-t border-[var(--color-border)]" />
          <div className="flex items-center gap-1 px-2 py-1">
            <button
              type="button"
              onClick={() => onChange({ field: sort.field, direction: "asc" })}
              className={[
                "flex-1 rounded-md px-2 py-1 text-xs",
                sort.direction === "asc"
                  ? "bg-[#E8923A] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]",
              ].join(" ")}
            >
              Asc ↑
            </button>
            <button
              type="button"
              onClick={() => onChange({ field: sort.field, direction: "desc" })}
              className={[
                "flex-1 rounded-md px-2 py-1 text-xs",
                sort.direction === "desc"
                  ? "bg-[#E8923A] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]",
              ].join(" ")}
            >
              Desc ↓
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
