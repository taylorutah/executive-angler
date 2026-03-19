import Image from "next/image";
import type { UserAward } from "@/types/awards";

// Map award_key → SVG badge file in /public/badges/
const BADGE_SVG_MAP: Record<string, string> = {
  first_timer: "/badges/sessions_10.svg",
  regular: "/badges/sessions_50.svg",
  veteran: "/badges/sessions_100.svg",
  legend: "/badges/sessions_500.svg",
  centurion: "/badges/catches_100.svg",
  master_angler: "/badges/catches_1000.svg",
  consistent_producer: "/badges/catches_500.svg",
  species_hunter: "/badges/species_5.svg",
  sessions_10: "/badges/sessions_10.svg",
  sessions_50: "/badges/sessions_50.svg",
  sessions_100: "/badges/sessions_100.svg",
  sessions_500: "/badges/sessions_500.svg",
  catches_100: "/badges/catches_100.svg",
  catches_500: "/badges/catches_500.svg",
  catches_1000: "/badges/catches_1000.svg",
  species_5: "/badges/species_5.svg",
  species_15: "/badges/species_15.svg",
  species_30: "/badges/species_30.svg",
  rivers_5: "/badges/rivers_5.svg",
  rivers_15: "/badges/rivers_15.svg",
  rivers_30: "/badges/rivers_30.svg",
  streak_4: "/badges/streak_4.svg",
  streak_12: "/badges/streak_12.svg",
};

export function getBadgeSrc(awardKey: string): string | null {
  return BADGE_SVG_MAP[awardKey] || null;
}

interface AwardBadgeProps {
  award: UserAward;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
}

export function AwardBadge({
  award,
  size = "md",
  showDetails = false,
}: AwardBadgeProps) {
  const sizeMap = {
    sm: { cls: "w-8 h-8", px: 32 },
    md: { cls: "w-12 h-12", px: 48 },
    lg: { cls: "w-16 h-16", px: 64 },
  };

  const { cls, px } = sizeMap[size];
  const badgeSrc = getBadgeSrc(award.award_key);

  const containerClasses = showDetails ? "flex items-start gap-3" : "inline-flex";

  return (
    <div className={containerClasses}>
      <div
        className={`${cls} rounded-full flex-shrink-0 overflow-hidden`}
        title={award.metadata.display_name}
      >
        {badgeSrc ? (
          <Image
            src={badgeSrc}
            alt={award.metadata.display_name || award.award_key}
            width={px}
            height={px}
            className="w-full h-full"
          />
        ) : (
          <div
            className="w-full h-full rounded-full flex items-center justify-center border-2"
            style={{
              backgroundColor: award.metadata.badge_color || "#E8923A",
              borderColor: award.metadata.badge_color || "#E8923A",
            }}
          >
            <span className="filter drop-shadow-sm">
              {award.metadata.badge_icon || "🏆"}
            </span>
          </div>
        )}
      </div>
      {showDetails && (
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[#F0F6FC]">
            {award.metadata.display_name}
          </div>
          <div className="text-sm text-[#8B949E]">
            {award.metadata.description}
          </div>
          {award.awarded_at && (
            <div className="text-xs text-[#484F58] mt-1">
              Earned {new Date(award.awarded_at).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
