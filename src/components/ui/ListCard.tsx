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
  accent,
  actionSlot,
}: CardData) {
  return (
    <Link
      href={href}
      className="group -mx-2 flex items-start gap-4 border-b border-[var(--border)] px-2 py-4 transition-colors last:border-b-0 hover:bg-[var(--paper-deep)]"
    >
      <div
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-surface bg-[var(--paper-deep)] sm:h-24 sm:w-24"
      >
        <SafeEntityImage
          src={imageUrl}
          alt={imageAlt}
          title={title}
          meta={subtitle || meta}
          loading="eager"
          className="ea-photo"
          sizes="96px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading line-clamp-1 text-base font-semibold text-[var(--text-1)] transition-colors group-hover:text-[var(--accent)]">
            {title}
          </h3>
          <div className="flex shrink-0 items-center gap-3">
            {accent && (
              <span className="text-sm font-semibold text-[var(--accent)]">{accent}</span>
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
          <p className="mt-0.5 line-clamp-1 text-sm text-[var(--text-2)]">{subtitle}</p>
        )}
        {description && (
          <p className="mt-1 line-clamp-1 hidden text-sm text-[var(--text-2)] sm:block">
            {description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {badges && badges.length > 0 && (
            <span className="rounded-chip bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
              {badges[0]}
            </span>
          )}
          {meta && (
            <span className="ea-overline">{meta}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
