import type { ReactNode } from "react";

/** Specimen well: paper field, white JPEG knocked out. Never a grey plate. */
export default function GazetteFlyWell({
  children,
  emptyLabel,
}: {
  children?: ReactNode;
  emptyLabel?: string;
}) {
  return (
    <div className="relative isolate aspect-square w-full bg-[var(--paper)]">
      {children ? (
        <div className="absolute inset-0 mix-blend-multiply">{children}</div>
      ) : emptyLabel ? (
        <p className="absolute inset-x-0 bottom-0 p-3 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--ink)]">
          {emptyLabel}
        </p>
      ) : null}
    </div>
  );
}
