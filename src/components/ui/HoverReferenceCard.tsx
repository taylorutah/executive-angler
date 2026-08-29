import Link from "next/link";
import type { CardData } from "@/types/list-config";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { MOTION_SAFE } from "@/components/layout/nav/links";

/**
 * Listing card with a desktop-only hover/focus reference panel.
 * Default face matches EntityCard (photo, name, one key line).
 * The panel crossfades the whole card to paper-deep: stat chips,
 * a sans brief, a footer line. Mobile never shows the panel.
 */
export default function HoverReferenceCard({
  href,
  imageUrl,
  imageAlt,
  title,
  subtitle,
  meta,
  badges,
  hoverPanel,
  imageContain,
}: CardData) {
  const chips = hoverPanel?.chips ?? [];
  const brief = hoverPanel?.brief?.trim() ?? "";
  const footer = hoverPanel?.footer?.trim() ?? "";
  const showPanel = chips.length > 0 || brief || footer;

  return (
    <Link
      href={href}
      className="group relative block card-hover overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]"
    >
      <div className={`relative h-44 overflow-hidden${imageContain ? " bg-[var(--paper-deep)]" : ""}`}>
        <SafeEntityImage
          src={imageUrl}
          alt={imageAlt}
          title={title}
          meta={[meta, subtitle].filter(Boolean).join(" · ") || undefined}
          contain={imageContain}
          loading="eager"
          className={imageContain ? "object-contain p-3" : "ea-photo"}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        />
        {badges && badges.length > 0 && (
          <div className="absolute top-3 left-3">
            <span className="rounded-[var(--radius-sm)] bg-[var(--ink)] px-2 py-1 text-xs font-medium text-[var(--paper)]">
              {badges[0]}
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold text-[var(--text-1)] group-hover:text-[var(--accent)] transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1.5 text-sm text-[var(--text-2)] line-clamp-2">{subtitle}</p>
        )}
        {meta && (
          <p className="ea-overline mt-2">
            {meta}
          </p>
        )}
      </div>
      {showPanel && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 hidden flex-col bg-[var(--paper-deep)] p-5 opacity-0 transition-opacity duration-200 ease-standard md:flex group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:group-hover:opacity-0 ${MOTION_SAFE}`}
        >
          {chips.length > 0 && (
            <dl className={`grid gap-x-3 gap-y-2 shrink-0 ${chips.length === 2 || chips.length > 3 ? "grid-cols-2" : chips.length <= 1 ? "grid-cols-1" : "grid-cols-3"}`}>
              {chips.map((chip, i) => (
                <div key={`${chip.label}:${chip.value}:${i}`} className="min-w-0">
                  <dt className="ea-stat-label truncate">{chip.label}</dt>
                  <dd className="mt-0.5 num [font-size:var(--text-14)] leading-tight text-[var(--text-1)] truncate">
                    {chip.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {brief && (
            <p className="mt-3 min-h-0 flex-1 font-sans [font-size:var(--text-14)] leading-[1.45] text-[var(--text-1)] line-clamp-3">
              {brief}
            </p>
          )}
          {footer && (
            <p className="mt-auto pt-3 shrink-0 font-sans [font-size:var(--text-13)] text-[var(--text-2)] line-clamp-2">
              {footer}
            </p>
          )}
        </div>
      )}
    </Link>
  );
}
