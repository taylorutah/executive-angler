import Link from "next/link";
import type { CardData } from "@/types/list-config";
import EntityCard from "./EntityCard";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import ScrollAnimation from "./ScrollAnimation";

interface MagazineGridProps {
  items: CardData[];
}

function FeaturedCard({ href, imageUrl, imageAlt, title, subtitle, meta, badges, description, accent }: CardData) {
  return (
    <Link
      href={href}
      className="group block card-hover overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative h-64 min-h-[16rem] overflow-hidden md:h-auto">
          <SafeEntityImage
            src={imageUrl}
            alt={imageAlt}
            title={title}
            meta={meta}
            loading="eager"
            className="ea-photo"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {badges && badges.length > 0 && (
            <div className="absolute top-3 left-3">
              <span className="rounded-[var(--radius-sm)] bg-[var(--ink)] px-2 py-1 text-xs font-medium text-[var(--paper)]">
                {badges[0]}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center p-8 md:p-10">
          <div className="mb-2 flex items-center gap-2">
            <span className="ea-badge ea-badge-ember">
              Featured
            </span>
            {meta && (
              <span className="ea-overline">{meta}</span>
            )}
            {accent && (
              <span className="ml-auto shrink-0 text-lg font-semibold text-[var(--accent)]">{accent}</span>
            )}
          </div>
          <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)] transition-colors group-hover:text-[var(--accent)] md:text-3xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-lg italic text-[var(--text-2)]">{subtitle}</p>
          )}
          {description && (
            <p className="mt-3 line-clamp-3 text-[var(--text-2)]">{description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function MagazineGrid({ items }: MagazineGridProps) {
  const featured = items.filter((item) => item.featured);
  const rest = items.filter((item) => !item.featured);

  const displayFeatured = featured.length > 0 ? featured.slice(0, 2) : items.slice(0, 1);
  const displayRest = featured.length > 0 ? rest : items.slice(1);

  return (
    <div>
      {displayFeatured.length > 0 && (
        <div className={`mb-8 ${displayFeatured.length > 1 ? "space-y-6" : ""}`}>
          {displayFeatured.map((item, i) => (
            <ScrollAnimation key={item.href} index={i}>
              <FeaturedCard {...item} />
            </ScrollAnimation>
          ))}
        </div>
      )}

      {displayRest.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayRest.map((item, i) => (
            <ScrollAnimation key={item.href} index={i}>
              <EntityCard
                href={item.href}
                imageUrl={item.imageUrl}
                imageAlt={item.imageAlt}
                title={item.title}
                subtitle={item.subtitle}
                meta={item.meta}
                badges={item.badges}
                accent={item.accent}
                description={item.description}
              />
            </ScrollAnimation>
          ))}
        </div>
      )}
    </div>
  );
}
