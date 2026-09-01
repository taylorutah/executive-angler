import type { ReactNode } from "react";

interface Props {
  toolbar?: ReactNode;
  overline?: string;
  title: string;
  meta?: string;
  spec?: ReactNode;
  credit?: ReactNode;
  children?: ReactNode;
}

/**
 * Shared paper identity strip under a photograph (or alone).
 * Breadcrumbs + actions, title + meta, then a full-width fact rail.
 * Text never sits on imagery — DESIGN.md §6.
 */
export default function EntityIdentityBand({
  toolbar,
  overline,
  title,
  meta,
  spec,
  credit,
  children,
}: Props) {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--paper)]">
      <div className="mx-auto w-full min-w-0 max-w-[var(--container)] overflow-x-clip px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        {toolbar}
        <div className={toolbar ? "mt-2 sm:mt-3" : undefined}>
          {overline ? <p className="ea-overline">{overline}</p> : null}
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-[var(--text-1)]">{title}</h1>
            {meta ? (
              <p className="text-[var(--text-14)] text-[var(--text-2)]">{meta}</p>
            ) : null}
          </div>
          {children}
          {credit}
        </div>
        {spec ? (
          <div className="mt-3 border-t border-[var(--border)] pt-3">{spec}</div>
        ) : null}
      </div>
    </div>
  );
}
