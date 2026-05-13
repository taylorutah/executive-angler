"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

export interface QuickAction {
  href: string;
  label: string;
  icon: LucideIcon;
  /** When true, render with primary (filled) styling. At most one per row. */
  primary?: boolean;
  /** Optional hint shown under the label on larger viewports. */
  hint?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
  /** Compact pill row vs. expanded tile layout. Default "expanded". */
  variant?: "expanded" | "compact";
  /** Optional eyebrow shown above the row (e.g. "Quick actions"). */
  eyebrow?: string;
}

export default function QuickActions({
  actions,
  className = "",
  variant = "expanded",
  eyebrow,
}: QuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <section className={className} aria-label={eyebrow ?? "Quick actions"}>
      {eyebrow && (
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6E7681] mb-2">
          {eyebrow}
        </p>
      )}
      <div
        className={
          variant === "expanded"
            ? "grid grid-cols-2 sm:grid-cols-4 gap-2"
            : "flex flex-wrap gap-2"
        }
      >
        {actions.map((a) => {
          const Icon = a.icon;
          const isPrimary = a.primary;
          const tileClasses = isPrimary
            ? "bg-[#E8923A] text-white border border-[#E8923A] hover:bg-[#F0A65A]"
            : "bg-[#161B22] text-[#F0F6FC] border border-[#21262D] hover:border-[#E8923A] hover:text-[#E8923A]";

          if (variant === "compact") {
            return (
              <Link
                key={a.href}
                href={a.href}
                aria-label={a.label}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${tileClasses}`}
              >
                <Icon className="h-4 w-4" />
                {a.label}
              </Link>
            );
          }

          return (
            <Link
              key={a.href}
              href={a.href}
              aria-label={a.label}
              className={`group flex flex-col gap-1 p-3 sm:p-4 rounded-xl transition-colors ${tileClasses}`}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="text-sm font-semibold">{a.label}</span>
              </span>
              {a.hint && (
                <span
                  className={`text-[11px] leading-tight ${
                    isPrimary ? "text-white/80" : "text-[#A8B2BD] group-hover:text-[#E8923A]/80"
                  }`}
                >
                  {a.hint}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
