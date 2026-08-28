import Link from "next/link";
import type { CardData } from "@/types/list-config";
import CardActionSlot from "@/components/flies/CardActionSlot";
import SafeEntityImage from "@/components/media/SafeEntityImage";

export default function CompactCard({ href, imageUrl, imageAlt, title, subtitle, badges, actionSlot }: CardData) {
  return (
    <Link
      href={href}
      className="group relative block card-hover overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]"
    >
      {actionSlot?.kind === "add-to-fly-box" && (
        <CardActionSlot
          canonicalFlyId={actionSlot.canonicalFlyId}
          flyName={actionSlot.flyName}
        />
      )}
      <div className="relative h-36 overflow-hidden">
        <SafeEntityImage
          src={imageUrl}
          alt={imageAlt}
          title={title}
          meta={subtitle}
          loading="eager"
          className="ea-photo"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
        />
        {badges && badges.length > 0 && (
          <div className="absolute top-2 left-2">
            <span className="rounded-[var(--radius-sm)] bg-[var(--ink)] px-2 py-1 text-xs font-medium text-[var(--paper)]">
              {badges[0]}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-heading text-sm font-semibold text-[var(--text-1)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
          {title}
        </h3>
      </div>
    </Link>
  );
}
