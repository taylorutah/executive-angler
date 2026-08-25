import Link from "next/link";
import type { CardData } from "@/types/list-config";
import CardActionSlot from "@/components/flies/CardActionSlot";
import SafeEntityImage from "@/components/media/SafeEntityImage";

export default function ListCard({
  href,
  imageUrl,
  imageAlt,
  title,
  subtitle,
  meta,
  badges,
  description,
  iconOnly,
  tags,
  accent,
  actionSlot,
}: CardData) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 py-4 px-2 -mx-2 rounded-lg hover:bg-[var(--surface-card)]/60 transition-colors border-b border-[var(--border-rule)] last:border-b-0"
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-[var(--surface-card)]">
        <SafeEntityImage
          src={imageUrl}
          alt={imageAlt}
          title={title}
          meta={subtitle || meta}
          className="object-cover"
          sizes="96px"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--action)] transition-colors line-clamp-1">
            {title}
          </h3>
          <div className="flex items-center gap-3 shrink-0">
            {accent && (
              <span className="text-sm font-semibold text-[var(--action)]">{accent}</span>
            )}
            {actionSlot?.kind === "add-to-fly-box" && (
              <CardActionSlot
                canonicalFlyId={actionSlot.canonicalFlyId}
                flyName={actionSlot.flyName}
                placement="inline"
              />
            )}
          </div>
        </div>
        {subtitle && (
          <p className="text-sm text-[var(--text-body)] line-clamp-1 mt-0.5">{subtitle}</p>
        )}
        {description && (
          <p className="text-sm text-[var(--text-body)] line-clamp-1 mt-1 hidden sm:block">{description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {badges && badges.length > 0 && badges.map((badge) => (
            <span
              key={badge}
              className="px-2 py-0.5 text-xs font-medium bg-[var(--action)]/5 text-[var(--action)] rounded-control"
            >
              {badge}
            </span>
          ))}
          {tags && tags.length > 0 && tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-[var(--surface-card)] text-[var(--action)] rounded-control"
            >
              {tag}
            </span>
          ))}
          {meta && (
            <span className="text-xs text-[var(--text-meta)] uppercase tracking-wider">{meta}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
