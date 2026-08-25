"use client";
/**
 * The workbench filter field.
 *
 * One field, one label, one `/` hint, so the filter looks and behaves the same
 * on every workbench surface. Hand the ref to `WorkbenchTable` and the grid's
 * `/` binding lands here.
 */
import { useId, type RefObject } from "react";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";

export interface WorkbenchFilterProps {
  value: string;
  onChange: (value: string) => void;
  /** Accessible label, e.g. "Filter your rivers". */
  label: string;
  inputRef: RefObject<HTMLInputElement | null>;
  placeholder?: string;
  className?: string;
}

export default function WorkbenchFilter({
  value,
  onChange,
  label,
  inputRef,
  placeholder = "Filter — press /",
  className = "",
}: WorkbenchFilterProps) {
  const id = useId();
  return (
    <div className={`relative w-full max-w-xs ${className}`}>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-workbench-filter="true"
        className={`ea-focus-ring w-full border border-[var(--border-rule)] bg-[var(--surface-raised)] px-2 py-1.5 pr-7 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-meta)] ${FOCUS_VISIBLE}`}
      />
      <kbd
        aria-hidden
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 border border-[var(--border-rule)] px-1 font-mono text-[10px] text-[var(--text-meta)]"
      >
        /
      </kbd>
    </div>
  );
}
