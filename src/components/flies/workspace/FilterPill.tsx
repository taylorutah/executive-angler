"use client";
/**
 * FilterPill — a multi-select facet pill rendered as a Radix Popover with
 * a checkbox list inside. One per facet on the workspace FilterBar
 * (Source, Category, Box, Tags).
 *
 * Keyboard navigation, focus management, and outside-click are handled by
 * Radix. The pill button shows the facet label + an active-count chip when
 * any options are selected.
 */
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, X } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
  /** Optional count to render next to the label (e.g., "Nymph (12)"). */
  count?: number;
}

interface Props {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  /** When true, the popover renders even with no options (shows empty state). */
  alwaysOpen?: boolean;
}

export default function FilterPill({ label, options, selected, onChange }: Props) {
  const activeCount = selected.length;

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function clear() {
    onChange([]);
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={[
            "inline-flex items-center gap-1.5 rounded-control border px-2.5 py-1.5 text-xs font-medium transition-colors",
            activeCount > 0
              ? "border-[var(--action)]/40 bg-[var(--action)]/10 text-[var(--action)] hover:bg-[var(--action)]/15"
              : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)]/40",
          ].join(" ")}
        >
          {label}
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-control bg-[var(--action)] text-white text-[10px] font-semibold tabular-nums">
              {activeCount}
            </span>
          )}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-60 max-h-[60vh] overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-lg outline-none"
        >
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {label}
            </span>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
          {options.length === 0 ? (
            <p className="px-2 py-3 text-xs text-[var(--color-text-muted)]">
              No options.
            </p>
          ) : (
            <ul role="listbox" aria-multiselectable className="space-y-0.5">
              {options.map((opt) => {
                const checked = selected.includes(opt.value);
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={checked}
                      onClick={() => toggle(opt.value)}
                      className={[
                        "flex items-center w-full gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-left",
                        checked
                          ? "bg-[var(--action)]/10 text-[var(--color-text-primary)]"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-4 w-4 items-center justify-center rounded border flex-shrink-0",
                          checked
                            ? "bg-[var(--action)] border-[var(--action)] text-white"
                            : "border-[var(--color-border)]",
                        ].join(" ")}
                      >
                        {checked && <Check className="h-3 w-3" />}
                      </span>
                      <span className="flex-1 truncate">{opt.label}</span>
                      {opt.count !== undefined && (
                        <span className="text-[10px] font-[var(--font-mono)] tabular-nums text-[var(--color-text-muted)]">
                          {opt.count}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
