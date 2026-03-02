import Image from "next/image";
import Link from "next/link";
import type { CardData } from "@/types/list-config";
import EntityCard from "./EntityCard";
import { MapPin } from "lucide-react";

interface MagazineGridProps {
  items: CardData[];
}

function FeaturedCard({ href, imageUrl, imageAlt, title, subtitle, meta, badges, description, iconOnly }: CardData) {
  return (
    <Link
      href={href}
      className="group block card-hover rounded-xl overflow-hidden bg-white shadow-lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        {imageUrl && !iconOnly ? (
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
                    className="px-2.5 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm text-forest-dark rounded-full"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 md:h-auto bg-forest/5 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-forest" />
            </div>
          </div>
        )}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-forest text-white text-xs font-medium rounded-full uppercase">
              Featured
            </span>
            {meta && (
              <span className="text-xs text-slate-400 uppercase tracking-wider">{meta}</span>
            )}
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-forest-dark group-hover:text-forest transition-colors">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-lg text-slate-500 italic">{subtitle}</p>
          )}
          {description && (
            <p className="mt-3 text-slate-600 line-clamp-3">{description}</p>
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
              imageUrl={item.imageUrl || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80"}
              imageAlt={item.imageAlt}
              title={item.title}
              subtitle={item.subtitle}
              meta={item.meta}
              badges={item.badges}
              iconOnly={item.iconOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}
