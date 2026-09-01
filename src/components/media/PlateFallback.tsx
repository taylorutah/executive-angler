import { cn } from "@/lib/utils";

interface PlateFallbackProps {
  title: string;
  /** Distinguishing metadata: water type + state, fly category + sizes, etc. */
  meta?: string;
  className?: string;
  /** Vellum field with a hairline — not a blank white hole, no inner title. */
  quiet?: boolean;
}

/**
 * Typographic stand-in for a missing or broken entity image.
 * Fills its parent (use inside a sized `relative` frame). Existing tokens only.
 */
export default function PlateFallback({
  title,
  meta,
  className,
  quiet = false,
}: PlateFallbackProps) {
  const label = meta ? `${title}, ${meta}` : title;
  if (quiet) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-[var(--paper-deep)] px-1.5 py-1 text-center ring-1 ring-inset ring-[var(--border)]",
          className,
        )}
        role="img"
        aria-label={label ? `${label}, no photograph` : "No photograph"}
      >
        <p className="font-ui text-[11px] leading-tight text-[var(--text-3)]">No photograph</p>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col justify-end bg-[var(--paper-deep)] px-3 py-2.5",
        className,
      )}
      role="img"
      aria-label={label}
    >
      <p className="font-heading text-base font-semibold leading-tight text-[var(--text-1)] line-clamp-3 sm:text-lg">
        {title}
      </p>
      {meta ? (
        <p className="ea-overline mt-1 line-clamp-2">
          {meta}
        </p>
      ) : null}
    </div>
  );
}
