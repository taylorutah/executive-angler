import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

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
  imageZoom,
  tags,
  accent,
  description,
}: EntityCardProps) {
  // Text-only card when no image and not icon-only mode
  if (!imageUrl && !iconOnly) {
    return (
      <Link
        href={href}
        className="group block rounded-xl overflow-hidden bg-[#161B22] border-l-4 border-[#E8923A] shadow-md hover:bg-[#1C2128] hover:shadow-lg transition-all"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-lg font-semibold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">
                {title}
              </h3>
              {subtitle && (
                <p className="mt-1 text-sm text-[#A8B2BD]">{subtitle}</p>
              )}
            </div>
            {accent && (
              <span className="text-sm font-semibold text-[#E8923A] shrink-0">
                {accent}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-3 text-sm text-[#6E7681] line-clamp-2">{description}</p>
          )}
          {meta && (
            <p className="mt-2 text-xs font-medium text-[#6E7681] uppercase tracking-wider">
              {meta}
            </p>
          )}
          {((badges && badges.length > 0) || (tags && tags.length > 0)) && (
            <div className="mt-4 flex flex-wrap gap-1.5">
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
    <Link href={href} className="group block card-hover rounded-xl overflow-hidden bg-[#161B22] shadow-md">
      {iconOnly ? (
        <div className="h-40 bg-[#E8923A]/5 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[#E8923A]/10 flex items-center justify-center">
            <MapPin className="h-6 w-6 text-[#E8923A]" />
          </div>
        </div>
      ) : (
        <div className={`relative h-44 overflow-hidden${imageContain ? " bg-[#F5F0EA]" : ""}`}>
          <Image
            src={imageUrl!}
            alt={imageAlt}
            fill
            unoptimized
            className={imageContain ? "object-contain p-3" : "object-cover card-image-zoom"}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {badges && badges.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
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
      )}
      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1.5 text-sm text-[#A8B2BD] line-clamp-2">{subtitle}</p>
        )}
        {meta && (
          <p className="mt-2 text-xs font-medium text-[#6E7681] uppercase tracking-wider">
            {meta}
          </p>
        )}
      </div>
    </Link>
  );
}
