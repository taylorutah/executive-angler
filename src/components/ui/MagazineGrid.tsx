import Image from "next/image";
import Link from "next/link";
import type { CardData } from "@/types/list-config";
import EntityCard from "./EntityCard";

interface MagazineGridProps {
  items: CardData[];
}

function FeaturedCard({ href, imageUrl, imageAlt, title, subtitle, meta, badges, description, tags, accent }: CardData) {
  // Text-only editorial card when no image
  if (!imageUrl) {
    return (
      <Link
        href={href}
        className="group block rounded-xl overflow-hidden bg-[#161B22] border-l-4 border-[#E8923A] shadow-lg hover:bg-[#1C2128] transition-colors"
      >
        <div className="p-8 md:p-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-0.5 bg-[#E8923A] text-white text-xs font-medium rounded-full uppercase">
              Featured
            </span>
            {meta && (
              <span className="text-xs text-[#6E7681] uppercase tracking-wider">{meta}</span>
            )}
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 text-lg text-[#A8B2BD] italic">{subtitle}</p>
              )}
            </div>
            {accent && (
              <span className="text-lg font-semibold text-[#E8923A] shrink-0">{accent}</span>
            )}
          </div>
          {description && (
            <p className="mt-4 text-[#A8B2BD] line-clamp-3">{description}</p>
          )}
          {((badges && badges.length > 0) || (tags && tags.length > 0)) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {badges?.map((badge) => (
                <span
                  key={badge}
                  className="px-2.5 py-1 text-xs font-medium bg-[#E8923A]/10 text-[#E8923A] rounded-full"
                >
                  {badge}
                </span>
              ))}
              {tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs bg-[#0D1117] text-[#E8923A] rounded-full border border-[#21262D]"
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
      className="group block card-hover rounded-xl overflow-hidden bg-[#161B22] shadow-lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative h-64 md:h-auto overflow-hidden">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover card-image-zoom"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {badges && badges.length > 0 && (
            <div className="absolute top-3 left-3 flex gap-1.5">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="px-2.5 py-1 text-xs font-medium bg-[#161B22]/90 backdrop-blur-sm text-[#E8923A] rounded-full"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-[#E8923A] text-white text-xs font-medium rounded-full uppercase">
              Featured
            </span>
            {meta && (
              <span className="text-xs text-[#6E7681] uppercase tracking-wider">{meta}</span>
            )}
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-lg text-[#A8B2BD] italic">{subtitle}</p>
          )}
          {description && (
            <p className="mt-3 text-[#A8B2BD] line-clamp-3">{description}</p>
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
          {displayFeatured.map((item) => (
            <FeaturedCard key={item.href} {...item} />
          ))}
        </div>
      )}

      {/* Rest in standard grid */}
      {displayRest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayRest.map((item) => (
            <EntityCard
              key={item.href}
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
          ))}
        </div>
      )}
    </div>
  );
}
