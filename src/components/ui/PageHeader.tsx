/**
 * Executive Angler — Page Header
 *
 * Minimal sub-page header used across journal, dashboard, account, etc.
 * Field-journal voice: small caps eyebrow, serif title, optional muted meta,
 * optional right slot for action buttons. No giant subtitle, no back-link
 * banner (the global nav handles navigation).
 *
 * Use this instead of one-off h1 + paragraph + back-link patterns.
 */

import * as React from "react";

interface PageHeaderProps {
  /** Small caps label above the title (e.g. "Journal", "Pro"). Optional. */
  eyebrow?: React.ReactNode;
  /** The page title — kept short. Serif font is applied automatically. */
  title: React.ReactNode;
  /** Optional one-line meta. Mono, muted. Skip if you have nothing to say. */
  meta?: React.ReactNode;
  /** Optional right slot — typically Button/StatPill actions. */
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ eyebrow, title, meta, actions, className = "" }: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4 mb-5 ${className}`}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="ea-overline mb-1.5">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-1)] leading-tight tracking-[-0.01em]">
          {title}
        </h1>
        {meta && (
          <div className="num text-xs text-[var(--text-3)] mt-1.5">{meta}</div>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
