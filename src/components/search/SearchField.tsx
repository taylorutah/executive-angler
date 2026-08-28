"use client";

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
        className={`ea-focus-ring ${FOCUS_VISIBLE} w-full border border-[var(--border-rule)] bg-[var(--surface-card)] py-4 ${value ? "px-4 pr-16" : "px-4"} text-[18px] text-[var(--text-primary)] placeholder:text-[var(--text-body)] outline-none [&::-webkit-search-cancel-button]:hidden`}
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className={`ea-focus-ring ${FOCUS_VISIBLE} hover-copper absolute right-3 top-1/2 -translate-y-1/2 font-ui text-[13px] text-[var(--copper)]`}
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
