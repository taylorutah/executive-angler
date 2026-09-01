import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Contained instrument panel on a daylight page.
 *
 * Inset from the page gutter on all four sides; ≥24px paper above and below;
 * --radius-card (10px); 1px --border. Panels are bordered, never
 * shadowed (DESIGN.md § Elevation). Light theme only.
 */
interface Props {
  children: ReactNode;
  className?: string;
  /** Accessible name for the instrument. */
  label?: string;
}

export default function InstrumentWell({ children, className, label }: Props) {
  return (
    <div
      data-instrument
      role="region"
      aria-label={label}
      className={cn(
        "min-w-0 max-w-full overflow-x-clip rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--paper)] text-[var(--text-1)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Daylight section that insets an InstrumentWell on all four sides. */
export function InstrumentWellFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("bg-[var(--paper)]", className)}>
      <div
        className="mx-auto min-w-0 max-w-[var(--container)] overflow-x-clip"
        style={{
          paddingInline: "var(--gutter)",
          paddingBlock: "max(1.5rem, var(--gutter))",
        }}
      >
        {children}
      </div>
    </section>
  );
}
