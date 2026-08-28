"use client";

import { useEffect, useId, useMemo, useRef, useState, useCallback } from "react";
import { Check, ChevronDown, Search, X } from "@/icons";
import { FOCUS_VISIBLE, MOTION_SAFE } from "@/components/layout/nav/links";
import { useModalChrome } from "@/components/layout/nav/useModalChrome";

export type FilterOption = {
  value: string;
  label: string;
  count?: number;
  meta?: string;
};

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  align?: "start" | "end";
  emptyMessage?: string;
  maxHeight?: number;
  className?: string;
}

export default function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  placeholder,
  searchable,
  align = "start",
  emptyMessage = "Nothing to filter by yet",
  maxHeight = 320,
  className = "",
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focusIdx, setFocusIdx] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const isSearchable = searchable ?? options.length > 8;
  const isEmpty = options.length === 0;
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  // Sort: selected first (preserving prop order within each group), then the rest.
  const orderedOptions = useMemo(() => {
    if (!open) {
      // When closed, ordering doesn't matter — caller sees what they pass in.
      return options;
    }
    const picked: FilterOption[] = [];
    const rest: FilterOption[] = [];
    for (const opt of options) {
      if (selectedSet.has(opt.value)) picked.push(opt);
      else rest.push(opt);
    }
    return [...picked, ...rest];
  }, [options, selectedSet, open]);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return orderedOptions;
    const q = query.toLowerCase();
    return orderedOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [orderedOptions, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setFocusIdx(0);
  }, []);

  useModalChrome({
    open,
    containerRef: popoverRef,
    onClose: close,
    returnFocusTo: triggerRef,
    lockScroll: false,
  });

  // Outside click. Escape / Tab cycle / return-focus live in useModalChrome.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
    };
  }, [open, close]);

  // Focus search when popover opens (desktop)
  useEffect(() => {
    if (open && isSearchable) {
      const t = setTimeout(() => searchRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open, isSearchable]);

  // Reset focus when filter changes
  useEffect(() => {
    setFocusIdx(0);
  }, [query]);

  function toggle(value: string) {
    if (selectedSet.has(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIdx((i) => Math.min(i + 1, filteredOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusIdx(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocusIdx(filteredOptions.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = filteredOptions[focusIdx];
      if (opt) toggle(opt.value);
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
      e.preventDefault();
      const all = filteredOptions.map((o) => o.value);
      const merged = Array.from(new Set([...selected, ...all]));
      onChange(merged);
    }
  }

  const triggerLabel = selected.length === 0
    ? (placeholder ?? label)
    : selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label ?? label
      : `${label} · ${selected.length}`;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !isEmpty && setOpen((o) => !o)}
        disabled={isEmpty}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={isEmpty ? `${label}: ${emptyMessage}` : `${label} filter, ${selected.length} selected`}
        title={isEmpty ? emptyMessage : undefined}
        className={`ea-focus-ring ${FOCUS_VISIBLE} ${MOTION_SAFE} inline-flex items-center gap-1.5 px-3 py-1.5 rounded-chip text-sm font-medium transition-colors whitespace-nowrap border ${
          selected.length > 0
            ? "bg-[var(--action)]/10 border-[var(--action)]/40 text-[var(--action)]"
            : "bg-[var(--surface-raised)] border-[var(--border-rule)] text-[var(--text-body)] hover:border-[var(--action)]/30 hover:text-[var(--text-primary)]"
        } ${isEmpty ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className="truncate max-w-[140px]">{triggerLabel}</span>
        {selected.length > 0 && (
          <span className="font-mono text-[10px] bg-[var(--action)] text-white rounded-chip min-w-[16px] h-4 inline-flex items-center justify-center px-1">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${MOTION_SAFE} ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div
          ref={popoverRef}
          className={`absolute z-50 mt-2 ${align === "end" ? "right-0" : "left-0"} w-[280px] sm:w-[300px] bg-[var(--surface)] border border-[var(--border)] rounded-card shadow-xl overflow-hidden`}
        >
          <p role="status" aria-live="polite" className="sr-only">
            {filteredOptions.length === 1
              ? `1 ${label} option`
              : `${filteredOptions.length} ${label} options`}
          </p>
          {isSearchable && (
            <div className="relative border-b border-[var(--border-rule)]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-meta)]" aria-hidden />
              <input
                ref={searchRef}
                data-autofocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onListKeyDown}
                placeholder={`Search ${label.toLowerCase()}...`}
                className={`ea-focus-ring ${FOCUS_VISIBLE} w-full bg-transparent pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-meta)] outline-none`}
                aria-label={`Search ${label}`}
              />
            </div>
          )}

          <ul
            id={listboxId}
            role="listbox"
            aria-multiselectable
            aria-label={label}
            tabIndex={0}
            onKeyDown={onListKeyDown}
            className="overflow-y-auto py-1"
            style={{ maxHeight }}
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-[var(--text-meta)]">
                {query ? "No matches" : emptyMessage}
              </li>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = selectedSet.has(opt.value);
                const isFocused = idx === focusIdx;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggle(opt.value)}
                    onMouseEnter={() => setFocusIdx(idx)}
                    className={`flex items-center justify-between gap-3 px-3 py-2 cursor-pointer text-sm ${
                      isFocused ? "bg-[var(--surface-raised)]" : ""
                    } ${isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-body)]"}`}
                  >
                    <span className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className={`flex items-center justify-center w-4 h-4 rounded border shrink-0 ${
                          isSelected
                            ? "bg-[var(--action)] border-[var(--action)]"
                            : "border-[var(--border-strong)] bg-[var(--surface-page)]"
                        }`}
                        aria-hidden
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <span className="truncate" title={opt.label}>{opt.label}</span>
                      {opt.meta && (
                        <span className="text-xs text-[var(--text-meta)] truncate">{opt.meta}</span>
                      )}
                    </span>
                    {typeof opt.count === "number" && (
                      <span className="font-mono text-xs text-[var(--text-meta)] tabular-nums shrink-0">
                        {opt.count}
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>

          <div className="border-t border-[var(--border-rule)] px-3 py-2 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => onChange([])}
              disabled={selected.length === 0}
              className={`ea-focus-ring ${FOCUS_VISIBLE} text-[var(--text-meta)] hover:text-[var(--text-body)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={close}
              className={`ea-focus-ring ${FOCUS_VISIBLE} text-[var(--action)] hover:text-[var(--action-hover)] font-medium transition-colors`}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-chip bg-[var(--action)]/10 border border-[var(--action)]/40 text-[var(--action)] text-xs">
      <span className="truncate max-w-[180px]">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className={`ea-focus-ring ${FOCUS_VISIBLE} hover:text-[var(--text-primary)] transition-colors`}
      >
        <X className="h-3 w-3" aria-hidden />
      </button>
    </span>
  );
}
