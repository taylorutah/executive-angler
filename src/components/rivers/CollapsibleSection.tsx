"use client";

import { useState, ReactNode } from "react";
import { ChevronDown } from "@/icons";

interface Props {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Collapsible disclosure section matching the native "CollapsibleSection"
 * component used on iOS/Android. Keeps content in the DOM (wrapped in a
 * client `useState`, but children render server-side so SEO crawlers see
 * everything — the wrapper is just visibility toggling).
 */
export default function CollapsibleSection({
  title,
  subtitle,
  icon,
  defaultOpen = false,
  children,
  className = "",
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 py-1 group"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <span className="shrink-0 text-[var(--action)]">{icon}</span>}
          <h2 className="font-heading text-2xl font-bold text-[var(--action)] text-left">
            {title}
          </h2>
          {subtitle && (
            <span className="text-xs text-[var(--text-meta)] font-mono tracking-wide uppercase truncate">
              {subtitle}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 text-[var(--text-body)] shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          open ? "max-h-[20000px] opacity-100 mt-5" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
