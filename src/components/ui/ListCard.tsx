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
      className="group -mx-2 flex items-start gap-4 border-b border-[var(--border-rule)] px-2 py-4 transition-colors last:border-b-0 hover:bg-[var(--surface-card)]/60"
    >
      <div
        className="relative h-20 w-20 shrink-0 overflow-hidden bg-[var(--surface-card)] sm:h-24 sm:w-24"
        style={{ borderRadius: "var(--radius-instrument)" }}
      >
        <SafeEntityImage
          src={imageUrl}
          alt={imageAlt}
          title={title}
          meta={subtitle || meta}
          loading="eager"
          className="object-cover"
          sizes="96px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading line-clamp-1 text-base font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--action)]">
            {title}
          </h3>
          <div className="flex shrink-0 items-center gap-3">
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
          <p className="mt-0.5 line-clamp-1 text-sm text-[var(--text-body)]">{subtitle}</p>
        )}
        {description && (
          <p className="mt-1 line-clamp-1 hidden text-sm text-[var(--text-body)] sm:block">
            {description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {badges && badges.length > 0 && (
            <span className="rounded-chip bg-[var(--action)]/5 px-2 py-0.5 text-xs font-medium text-[var(--action)]">
              {badges[0]}
            </span>
          )}
          {meta && (
            <span className="text-xs uppercase tracking-wider text-[var(--text-meta)]">{meta}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
