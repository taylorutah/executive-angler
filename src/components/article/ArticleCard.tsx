import Link from "next/link";
import type { CardData } from "@/types/list-config";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { MOTION_SAFE } from "@/components/layout/nav/links";

/**
 * Field Notes card: photo at the sanctioned 4:3 card ratio, category
 * overline, Fraunces title, one-line teaser, author · read-time meta.
 * Exactly three type sizes (12 / 20 / 14).
 *
 * Hover or keyboard focus reveals the excerpt on a solid paper panel over
 * the photo — a surface reveal (opacity + transform at the token duration
 * and easing), never a scrim and never a zoom. The panel is aria-hidden:
 * the same excerpt reaches assistive tech via the card's text content.
 */
export default function ArticleCard({
  href,
  imageUrl,
  imageAlt,
  title,
  subtitle,
  meta,
  badges,
  description,
}: CardData) {
  const category = badges?.[0];
  const teaser = subtitle ?? description;

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
        {description && (
          <div
            aria-hidden="true"
            className={`absolute inset-0 flex flex-col justify-center gap-2 bg-[var(--paper)] p-5 opacity-0 translate-y-2 transition-[opacity,transform] duration-200 ease-standard group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 ${MOTION_SAFE}`}
          >
            {category && <p className="ea-overline">{category}</p>}
            <p className="text-[var(--text-14)] leading-relaxed text-[var(--text-2)] line-clamp-4">
              {description}
            </p>
          </div>
        )}
      </div>
      <div className="p-5">
        {category && <p className="ea-overline">{category}</p>}
        <h3 className="mt-2 font-heading text-[var(--text-20)] font-semibold text-[var(--text-1)] transition-colors group-hover:text-[var(--accent)]">
          {title}
        </h3>
        {teaser && (
          <p className="mt-2 text-[var(--text-14)] text-[var(--text-2)] line-clamp-1">
            {teaser}
          </p>
        )}
        {meta && (
          <p className="mt-2 text-[var(--text-14)] text-[var(--text-3)]">{meta}</p>
        )}
      </div>
    </Link>
  );
}
