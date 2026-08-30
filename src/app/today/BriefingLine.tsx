"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "@/icons";

type Props = {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Mobile: one collapsible briefing line.
 * Desktop (md+): static module header. Content stays open. No click required.
 */
export default function BriefingLine({
  title,
  summary,
  defaultOpen = true,
  className,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`border-t border-[var(--border)] md:border-t-0 ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="ea-focus-ring flex w-full items-start justify-between gap-4 py-5 text-left md:hidden"
      >
        <span className="min-w-0">
          <span className="ea-overline block">{title}</span>
          {summary ? (
            <span className="mt-1 block leading-snug text-[var(--text-2)]">{summary}</span>
          ) : null}
        </span>
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 text-[var(--text-3)] transition-transform duration-150 ease-standard ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>
      <header className="hidden md:block">
        <p className="ea-overline">{title}</p>
      </header>
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-150 ease-standard md:mt-4 md:max-h-none md:overflow-visible md:opacity-100 md:pb-0 ${
          open ? "max-h-[20000px] opacity-100 pb-6" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </section>
  );
}
