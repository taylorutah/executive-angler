import Image from "next/image";
import Link from "next/link";
import type { CardData } from "@/types/list-config";
import { MapPin } from "lucide-react";

export default function CompactCard({ href, imageUrl, imageAlt, title, badges, iconOnly }: CardData) {
  return (
    <Link href={href} className="group block card-hover rounded-lg overflow-hidden bg-[#161B22] shadow-sm">
      {imageUrl && !iconOnly ? (
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
      ) : (
        <div className="h-24 bg-[#E8923A]/5 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#E8923A]/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-[#E8923A]" />
          </div>
        </div>
      )}
      <div className="p-3">
        <h3 className="font-heading text-sm font-semibold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors line-clamp-1">
          {title}
        </h3>
      </div>
    </Link>
  );
}
