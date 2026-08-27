import Link from "next/link";
import type { CardData } from "@/types/list-config";
import CardActionSlot from "@/components/flies/CardActionSlot";
import SafeEntityImage from "@/components/media/SafeEntityImage";

interface EntityCardProps {
  href: string;
  imageUrl?: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  meta?: string;
  badges?: string[];
  /** When true, shows a MapPin icon instead of an image (for guides, fly shops) */
  iconOnly?: boolean;
  /** Use object-contain + cream bg for illustrations (fish species) */
  imageContain?: boolean;
  /** Scale the image beyond its natural size to eliminate padding baked into product photos (e.g. 1.6 = 160%) */
  imageZoom?: number;
  /** Tags/chips displayed as pills */
  tags?: string[];
  /** Secondary accent text (e.g., daily rate) */
  accent?: string;
  /** Extra description text */
  description?: string;
  /** Optional inline action overlay (e.g., AddToFlyBoxButton) */
  actionSlot?: CardData["actionSlot"];
}

export default function EntityCard({
  href,
  imageUrl,
  imageAlt,
  title,
  subtitle,
  meta,
  badges,
  iconOnly,
  imageContain,
  tags,
  accent,
  description,
  actionSlot,
}: EntityCardProps) {
  // Guides / shops that opt into icon-only keep that treatment.
  if (iconOnly) {
    return (
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-surface border border-[var(--border-rule)] bg-[var(--surface-raised)] border-l-4 border-l-[var(--action)]"
      >
        {actionSlot?.kind === "add-to-fly-box" && (
          <CardActionSlot
            canonicalFlyId={actionSlot.canonicalFlyId}
            flyName={actionSlot.flyName}
          />
        )}
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--action)] transition-colors">
                {title}
              </h3>
              {subtitle && (
                <p className="mt-1 text-sm text-[var(--text-body)]">{subtitle}</p>
              )}
            </div>
            {accent && (
              <span className="text-sm font-semibold text-[var(--action)] shrink-0">
                {accent}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-3 text-sm text-[var(--text-meta)] line-clamp-2">{description}</p>
          )}
          {meta && (
            <p className="mt-2 text-xs font-medium text-[var(--text-meta)] uppercase tracking-wider">
              {meta}
            </p>
          )}
          {((badges && badges.length > 0) || (tags && tags.length > 0)) && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {badges?.map((badge) => (
                <span
                  key={badge}
                  className="px-2.5 py-1 text-xs font-medium bg-[var(--action)]/10 text-[var(--action)] rounded-chip"
                >
                  {badge}
                </span>
              ))}
              {tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs bg-[var(--surface-page)] text-[var(--action)] rounded-chip border border-[var(--border-rule)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group relative block card-hover overflow-hidden rounded-surface border border-[var(--border-rule)] bg-[var(--surface-raised)]"
    >
      {actionSlot?.kind === "add-to-fly-box" && (
        <CardActionSlot
          canonicalFlyId={actionSlot.canonicalFlyId}
          flyName={actionSlot.flyName}
        />
      )}
      <div className={`photo-lift relative h-44${imageContain ? " bg-[var(--surface-card)]" : ""}`}>
        <SafeEntityImage
          src={imageUrl}
          alt={imageAlt}
          title={title}
          meta={[meta, subtitle].filter(Boolean).join(" · ") || undefined}
          contain={imageContain}
          loading="eager"
          placeholderEmpty
          className={imageContain ? "object-contain p-3" : "object-cover"}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        />
        {badges && badges.length > 0 && (
          <div className="absolute top-3 left-3">
            <span className="rounded-chip bg-[var(--surface-raised)] px-2.5 py-1 text-xs font-medium text-[var(--action)]">
              {badges[0]}
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--action)] transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1.5 text-sm text-[var(--text-body)] line-clamp-2">{subtitle}</p>
        )}
        {meta && (
          <p className="mt-2 text-xs font-medium text-[var(--text-meta)] uppercase tracking-wider">
            {meta}
          </p>
        )}
      </div>
    </Link>
  );
}
