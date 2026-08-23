import Link from "next/link";
import type { CardData } from "@/types/list-config";
import CardActionSlot from "@/components/flies/CardActionSlot";
import SafeEntityImage from "@/components/media/SafeEntityImage";

export default function CompactCard({ href, imageUrl, imageAlt, title, subtitle, badges, actionSlot }: CardData) {
  return (
    <Link href={href} className="group relative block card-hover rounded-lg overflow-hidden bg-[#161B22] shadow-sm">
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
