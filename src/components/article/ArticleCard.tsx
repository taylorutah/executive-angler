import Link from "next/link";
import type { CardData } from "@/types/list-config";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { MOTION_SAFE } from "@/components/layout/nav/links";

/**
 * Field Notes card: photo at the sanctioned 4:3 card ratio, category
 * overline, Fraunces title — nothing else on the face (client ruling
 * 2026-08-28: no teaser line, no author/read-time meta row).
 *
 * Hover or keyboard focus flips the WHOLE card — photo and text zone
 * together — to a solid paper-deep panel carrying the excerpt in the
 * base reading style (16px/1.55): one surface, one opacity crossfade at
 * the token duration and easing, never a scrim and never a zoom. The
 * panel is aria-hidden so the link's accessible name stays the title;
 * the excerpt is a preview of the linked page, which carries it in full.
 */
export default function ArticleCard({
  href,
  imageUrl,
  imageAlt,
  title,
  meta,
  badges,
  description,
}: CardData) {
  const category = badges?.[0];

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
        {category && <p className="ea-overline">{category}</p>}
        <h3 className="mt-2 font-heading text-[var(--text-20)] font-semibold text-[var(--text-1)] transition-colors group-hover:text-[var(--accent)]">
          {title}
        </h3>
      </div>
      {description && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 flex items-center bg-[var(--paper-deep)] p-6 opacity-0 transition-opacity duration-200 ease-standard group-hover:opacity-100 group-focus-visible:opacity-100 ${MOTION_SAFE}`}
        >
          <p className="text-[var(--text-1)] line-clamp-8">{description}</p>
        </div>
      )}
    </Link>
  );
}
