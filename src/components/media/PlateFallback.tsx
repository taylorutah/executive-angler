import { cn } from "@/lib/utils";

interface PlateFallbackProps {
  title: string;
  /** Distinguishing metadata: water type + state, fly category + sizes, etc. */
  meta?: string;
  className?: string;
}

/**
 * Typographic stand-in for a missing or broken entity image.
 * Fills its parent (use inside a sized `relative` frame). Existing tokens only.
 */
export default function PlateFallback({
  title,
  meta,
  className,
}: PlateFallbackProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col justify-end bg-[var(--surface-card)] px-3 py-2.5",
        className,
      )}
      role="img"
      aria-label={meta ? `${title}, ${meta}` : title}
    >
      <p className="font-heading text-base font-semibold leading-tight text-[var(--text-primary)] line-clamp-3 sm:text-lg">
        {title}
      </p>
      {meta ? (
        <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#8B949E] line-clamp-2 sm:text-xs">
          {meta}
        </p>
      ) : null}
    </div>
  );
}
