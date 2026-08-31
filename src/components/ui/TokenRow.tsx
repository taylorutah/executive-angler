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

export function Token({ children }: { children: ReactNode }) {
  return <span className="whitespace-nowrap">{children}</span>;
}

export function TokenSep() {
  return (
    <span className="select-none text-[var(--text-3)]" aria-hidden>
      ·
    </span>
  );
}
