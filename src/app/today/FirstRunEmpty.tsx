import type { ReactNode } from "react";
import Link from "next/link";

export const INSIGHTS_SESSION_FLOOR = 20;

export type FirstRunSurface =
  | "today"
  | "journal"
  | "flybox"
  | "rivers-mine"
  | "gear"
  | "insights";

type Props = {
  surface: FirstRunSurface;
  purpose: string;
  actionHref?: string;
  actionLabel: string;
  example?: string;
  /** Use instead of a link when the first action is on this page. Must include data-empty-action. */
  action?: ReactNode;
  children?: ReactNode;
};

/**
 * First-run empty: one sentence of purpose, one concrete action,
 * and — when we have one — a real public example. No wizard, no
 * exclamation marks, no invented counts.
 */
export default function FirstRunEmpty({
  surface,
  purpose,
  actionHref,
  actionLabel,
  example,
  action,
  children,
}: Props) {
  return (
    <section
      data-empty-state={surface}
      className="mt-10 max-w-xl border-t border-[var(--border-rule)] pt-8"
    >
      <p data-empty-purpose className="text-[17px] leading-relaxed text-[var(--text-body)]">
        {purpose}
      </p>
      <p className="mt-5">
        {action ?? (
          <Link
            data-empty-action
            href={actionHref ?? "/"}
            className="font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--action)] hover:underline"
          >
            {actionLabel}
          </Link>
        )}
      </p>
      {example ? (
        <p data-empty-example className="mt-4 text-[15px] leading-relaxed text-[var(--text-meta)]">
          {example}
        </p>
      ) : null}
      {children}
    </section>
  );
}
