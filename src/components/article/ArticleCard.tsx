import Link from "next/link";
import type { CardData } from "@/types/list-config";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { MOTION_SAFE } from "@/components/layout/nav/links";

/**
 * Field Notes card: photo at the sanctioned 4:3 card ratio, category
 * overline with reading time, Fraunces title — nothing else on the face
 * (no teaser, no author). Titles are one step below the prior 20px so
 * the longer overline and two-line clamp stay on clean lines.
 *
 * Hover or keyboard focus flips the WHOLE card — photo and text zone
 * together — to a solid paper-deep panel carrying the excerpt in
 * Fraunces italic, left-aligned, with a short accent rule above
 * (the pull-quote motif). One opacity crossfade at the token duration
 * and easing, never a scrim and never a zoom. The panel is aria-hidden
 * so the link's accessible name stays the title; the excerpt is a
 * preview of the linked page, which carries it in full.
 */
function overlineReadingTime(minutes: number): string {
  return `${Math.max(1, Math.round(minutes))} min read`;
}

export default function ArticleCard({
  href,
  imageUrl,
  imageAlt,
  title,
  meta,
  badges,
  description,
  readingTimeMinutes,
}: CardData) {
  const category = badges?.[0];
  const readLabel =
    typeof readingTimeMinutes === "number" && Number.isFinite(readingTimeMinutes)
      ? overlineReadingTime(readingTimeMinutes)
      : null;

  return (
    <Link
      href={href}
      className="group relative block card-hover overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]"
    >
      <div className="ea-photo-card relative overflow-hidden">
        <SafeEntityImage
          src={imageUrl}
          alt={imageAlt}
          title={title}
          meta={meta}
          className="ea-photo"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
        />
      </div>
      <div className="p-5">
        {(category || readLabel) && (
          <p className="ea-overline whitespace-nowrap">
            {category && (
              <span className="text-[var(--accent)]">{category}</span>
            )}
            {category && readLabel && (
              <span className="text-[var(--text-3)]"> · </span>
            )}
            {readLabel && (
              <span className="text-[var(--text-3)]">{readLabel}</span>
            )}
          </p>
        )}
        <h3 className="mt-2 line-clamp-2 font-heading [font-size:var(--text-18)] font-semibold leading-[1.2] text-[var(--text-1)] transition-colors group-hover:text-[var(--accent)]">
          {title}
        </h3>
      </div>
      {description && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 flex items-center bg-[var(--paper-deep)] p-6 opacity-0 transition-opacity duration-200 ease-standard group-hover:opacity-100 group-focus-visible:opacity-100 ${MOTION_SAFE}`}
        >
          <div className="w-full">
            <div
              data-excerpt-rule
              aria-hidden="true"
              className="mb-[var(--space-4)] h-[2px] w-[var(--space-6)] bg-[var(--accent)]"
            />
            <p className="line-clamp-4 text-left font-display [font-size:var(--text-20)] font-medium italic leading-[1.3] text-[var(--text-1)]">
              {description}
            </p>
          </div>
        </div>
      )}
    </Link>
  );
}
