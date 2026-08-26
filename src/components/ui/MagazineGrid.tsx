import Link from "next/link";
import type { CardData } from "@/types/list-config";
import EntityCard from "./EntityCard";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import ScrollAnimation from "./ScrollAnimation";

interface MagazineGridProps {
  items: CardData[];
}

function FeaturedCard({ href, imageUrl, imageAlt, title, subtitle, meta, badges, description, tags, accent }: CardData) {
  return (
    <Link
      href={href}
      className="group block card-hover rounded-xl overflow-hidden bg-[var(--surface-raised)] shadow-lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative h-64 md:h-auto min-h-[16rem] overflow-hidden">
          <SafeEntityImage
            src={imageUrl}
            alt={imageAlt}
            title={title}
            meta={meta}
            className="object-cover card-image-zoom"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {badges && badges.length > 0 && (
            <div className="absolute top-3 left-3 flex gap-1.5">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="px-2.5 py-1 text-xs font-medium bg-[var(--surface-raised)]/90 backdrop-blur-sm text-[var(--action)] rounded-chip"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-[var(--action)] text-white text-xs font-medium rounded-chip uppercase">
              Featured
            </span>
            {meta && (
              <span className="text-xs text-[var(--text-meta)] uppercase tracking-wider">{meta}</span>
            )}
            {accent && (
              <span className="text-lg font-semibold text-[var(--action)] shrink-0 ml-auto">{accent}</span>
            )}
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)] group-hover:text-[var(--action)] transition-colors">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-lg text-[var(--text-body)] italic">{subtitle}</p>
          )}
          {description && (
            <p className="mt-3 text-[var(--text-body)] line-clamp-3">{description}</p>
          )}
          {((badges && badges.length > 0) || (tags && tags.length > 0)) && (
            <div className="mt-5 flex flex-wrap gap-2 md:hidden">
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
      </div>
    </Link>
  );
}

export default function MagazineGrid({ items }: MagazineGridProps) {
  // Featured items get the large treatment
  const featured = items.filter((item) => item.featured);
  const rest = items.filter((item) => !item.featured);

  // If no featured items, take the first 1-2 items as featured
  const displayFeatured = featured.length > 0 ? featured.slice(0, 2) : items.slice(0, 1);
  const displayRest =
    featured.length > 0
      ? rest
      : items.slice(1);

  return (
    <div>
      {/* Featured cards */}
      {displayFeatured.length > 0 && (
        <div className={`mb-8 ${displayFeatured.length > 1 ? "space-y-6" : ""}`}>
          {displayFeatured.map((item, i) => (
            <ScrollAnimation key={item.href} index={i}>
              <FeaturedCard {...item} />
            </ScrollAnimation>
          ))}
        </div>
      )}

      {/* Rest in standard grid */}
      {displayRest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                tags={item.tags}
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
