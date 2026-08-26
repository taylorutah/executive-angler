import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Contained Dusk instrument on a Daylight page.
 *
 * Contract — Brand Bible v4.1 §5.7 Rule 5 / §12:
 * inset from the page gutter on all four sides; ≥24px paper above and below;
 * --radius-instrument (4px); 1px --border-rule; --elev-1 only.
 * `.register-dusk` lives on this panel, never on the section that contains it.
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
        "register-dusk border border-[var(--border-rule)] bg-[var(--surface-page)] text-[var(--text-primary)] shadow-[var(--elev-1)]",
        className,
      )}
      style={{
        borderRadius: "var(--radius-instrument)",
        backgroundColor: "var(--surface-page)",
      }}
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
    <section className={cn("bg-[var(--surface-page)]", className)}>
      <div
        className="mx-auto max-w-7xl"
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
