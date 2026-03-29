import Image from "next/image";
import Link from "next/link";
import type { CardData } from "@/types/list-config";

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
  // Text-only row when no image
  if (!imageUrl) {
    return (
      <Link
        href={href}
        className="group block py-4 px-4 -mx-4 rounded-lg hover:bg-[#1C2128] transition-colors border-b border-[#21262D] last:border-b-0"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-base font-semibold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-[#A8B2BD] mt-0.5">{subtitle}</p>
            )}
            {description && (
              <p className="text-sm text-[#6E7681] line-clamp-1 mt-1 hidden sm:block">{description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {badges && badges.length > 0 && badges.map((badge) => (
                <span
                  key={badge}
                  className="px-2 py-0.5 text-xs font-medium bg-[#E8923A]/10 text-[#E8923A] rounded-full"
                >
                  {badge}
                </span>
              ))}
              {tags && tags.length > 0 && tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-[#0D1117] text-[#E8923A] rounded-full border border-[#21262D]"
                >
                  {tag}
                </span>
              ))}
              {meta && (
                <span className="text-xs text-[#6E7681] uppercase tracking-wider">{meta}</span>
              )}
            </div>
          </div>
          {accent && (
            <span className="text-sm font-semibold text-[#E8923A] shrink-0">{accent}</span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex items-start gap-4 py-4 px-2 -mx-2 rounded-lg hover:bg-[#1F2937]/60 transition-colors border-b border-[#21262D] last:border-b-0"
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors line-clamp-1">
            {title}
          </h3>
          {accent && (
            <span className="text-sm font-semibold text-[#E8923A] shrink-0">{accent}</span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-[#A8B2BD] line-clamp-1 mt-0.5">{subtitle}</p>
        )}
        {description && (
          <p className="text-sm text-[#A8B2BD] line-clamp-1 mt-1 hidden sm:block">{description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {badges && badges.length > 0 && badges.map((badge) => (
            <span
              key={badge}
              className="px-2 py-0.5 text-xs font-medium bg-[#E8923A]/5 text-[#E8923A] rounded-full"
            >
              {badge}
            </span>
          ))}
          {tags && tags.length > 0 && tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-[#1F2937] text-[#E8923A] rounded-full"
            >
              {tag}
            </span>
          ))}
          {meta && (
            <span className="text-xs text-[#6E7681] uppercase tracking-wider">{meta}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
