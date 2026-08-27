"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "@/icons";

type Props = {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

/**
 * One collapsible briefing line on /today. Headers stay visible; content
 * collapses. No entrance animation — the briefing is not a dashboard.
 */
export default function BriefingLine({ title, summary, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-t border-[var(--border-rule)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="ea-focus-ring flex w-full items-start justify-between gap-4 py-5 text-left"
      >
        <span className="min-w-0">
          <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-meta)]">
            {title}
          </span>
          {summary ? (
            <span className="mt-1 block text-[15px] leading-snug text-[var(--text-body)]">
              {summary}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 text-[var(--text-meta)] transition-transform duration-[140ms] ease-out ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-[140ms] ease-out ${
          open ? "max-h-[20000px] opacity-100 pb-6" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </section>
  );
}
