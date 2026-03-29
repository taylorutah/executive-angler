import Image from "next/image";
import Link from "next/link";
import type { CardData } from "@/types/list-config";

export default function CompactCard({ href, imageUrl, imageAlt, title, subtitle, badges, tags, accent }: CardData) {
  // Text-only compact card when no image
  if (!imageUrl) {
    return (
      <Link
        href={href}
        className="group block rounded-lg overflow-hidden bg-[#161B22] border-l-4 border-[#E8923A] shadow-sm hover:bg-[#1C2128] transition-colors"
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-sm font-semibold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors line-clamp-1">
              {title}
            </h3>
            {accent && (
              <span className="text-xs font-semibold text-[#E8923A] shrink-0">{accent}</span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-[#A8B2BD] line-clamp-1">{subtitle}</p>
          )}
          {((badges && badges.length > 0) || (tags && tags.length > 0)) && (
            <div className="mt-2 flex flex-wrap gap-1">
              {badges?.slice(0, 1).map((badge) => (
                <span
                  key={badge}
                  className="px-2 py-0.5 text-xs font-medium bg-[#E8923A]/10 text-[#E8923A] rounded-full"
                >
                  {badge}
                </span>
              ))}
              {tags?.slice(0, 1).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-[#0D1117] text-[#E8923A] rounded-full border border-[#21262D]"
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
    <Link href={href} className="group block card-hover rounded-lg overflow-hidden bg-[#161B22] shadow-sm">
      <div className="relative h-36 overflow-hidden">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover card-image-zoom"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        {badges && badges.length > 0 && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 text-xs font-medium bg-[#161B22]/90 backdrop-blur-sm text-[#E8923A] rounded-full">
              {badges[0]}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-heading text-sm font-semibold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors line-clamp-1">
          {title}
        </h3>
      </div>
    </Link>
  );
}
