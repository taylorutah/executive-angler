"use client";

import { Search, X } from "lucide-react";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";

interface Props {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

/**
 * The query lives here — never in a heading. This is the page's primary control.
 */
export default function SearchField({ inputRef, value, onChange, onClear }: Props) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-meta)]"
        aria-hidden
      />
      <input
        ref={inputRef}
        id="search-q"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search a river, a fly, a hatch, a place."
        autoFocus
        autoComplete="off"
        spellCheck={false}
        aria-label="Search Executive Angler"
        className={`ea-focus-ring ${FOCUS_VISIBLE} w-full rounded-md border border-[var(--border-rule)] bg-[var(--surface-card)] py-4 pl-12 ${value ? "pr-12" : "pr-4"} text-[18px] text-[var(--text-primary)] placeholder:text-[var(--text-meta)] outline-none`}
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className={`ea-focus-ring ${FOCUS_VISIBLE} absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-sm text-[var(--text-meta)] hover:text-[var(--text-primary)]`}
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
