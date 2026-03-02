import Image from "next/image";
import Link from "next/link";
import type { CardData } from "@/types/list-config";
import { MapPin } from "lucide-react";

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
}: CardData) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 py-4 px-2 -mx-2 rounded-lg hover:bg-white/60 transition-colors border-b border-slate-100 last:border-b-0"
    >
      {/* Thumbnail */}
      {imageUrl && !iconOnly ? (
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
      ) : (
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-forest/5 flex items-center justify-center shrink-0">
          <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-forest" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold text-forest-dark group-hover:text-forest transition-colors line-clamp-1">
            {title}
          </h3>
          {accent && (
            <span className="text-sm font-semibold text-forest shrink-0">{accent}</span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{subtitle}</p>
        )}
        {description && (
          <p className="text-sm text-slate-600 line-clamp-1 mt-1 hidden sm:block">{description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {badges && badges.length > 0 && badges.map((badge) => (
            <span
              key={badge}
              className="px-2 py-0.5 text-xs font-medium bg-forest/5 text-forest-dark rounded-full"
            >
              {badge}
            </span>
          ))}
          {tags && tags.length > 0 && tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-cream text-forest-dark rounded-full"
            >
              {tag}
            </span>
          ))}
          {meta && (
            <span className="text-xs text-slate-400 uppercase tracking-wider">{meta}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
