import type { ReactNode } from "react";

interface Props {
  overline: string;
  title: string;
  dek?: string;
  children?: ReactNode;
}

/**
 * Compact catalog header for Lane L indexes.
 * Overline + count title + one dek. Featured chips or notebook links as children.
 */
export default function EntityListHeader({ overline, title, dek, children }: Props) {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--paper)]">
      <div className="mx-auto max-w-[var(--container)] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <p className="ea-overline">{overline}</p>
        <h1 className="mt-2 text-[var(--text-1)]">{title}</h1>
        {dek ? (
          <p className="mt-3 max-w-[var(--prose)] text-[var(--text-16)] leading-relaxed text-[var(--text-2)]">
            {dek}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
