import type { ReactNode } from "react";

/**
 * A wrapping row of atomic tokens. Each child stays on one line
 * (species names, short tags) so mobile never hyphenates a phrase.
 */
export default function TokenRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-baseline gap-x-2 gap-y-1.5 ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function Token({
  children,
  lead,
}: {
  children: ReactNode;
  /** Middot stays on this token so it never wraps alone. */
  lead?: boolean;
}) {
  return (
    <span className="whitespace-nowrap">
      {lead ? (
        <span className="select-none text-[var(--text-3)]" aria-hidden>
          ·{" "}
        </span>
      ) : null}
      {children}
    </span>
  );
}
