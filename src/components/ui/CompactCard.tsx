import Link from "next/link";
import type { CardData } from "@/types/list-config";
import CardActionSlot from "@/components/flies/CardActionSlot";
import SafeEntityImage from "@/components/media/SafeEntityImage";

export default function CompactCard({ href, imageUrl, imageAlt, title, subtitle, badges, actionSlot }: CardData) {
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
      <div className="photo-lift relative h-36">
        <SafeEntityImage
          src={imageUrl}
          alt={imageAlt}
          title={title}
          meta={subtitle}
          loading="eager"
          placeholderEmpty
          className="object-cover card-image-zoom"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
        />
        {badges && badges.length > 0 && (
          <div className="absolute top-2 left-2">
            <span className="rounded-chip bg-[var(--surface-raised)] px-2 py-0.5 text-xs font-medium text-[var(--action)]">
              {badges[0]}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="hover-copper font-heading text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--action)] line-clamp-1">
          {title}
        </h3>
      </div>
    </Link>
  );
}
