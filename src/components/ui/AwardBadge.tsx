import type { UserAward } from "@/types/awards";

// Map every award_key to its emoji
export const AWARD_EMOJI_MAP: Record<string, string> = {
  first_timer: "🪝",
  sessions_10: "🪝",
  regular: "🎣",
  sessions_50: "🎣",
  veteran: "🥾",
  sessions_100: "🥾",
  legend: "👑",
  sessions_500: "👑",
  centurion: "💯",
  catches_100: "💯",
  master_angler: "🐋",
  catches_1000: "🐋",
  consistent_producer: "🔥",
  catches_500: "🔥",
  species_hunter: "🦎",
  species_5: "🦎",
  species_15: "🌊",
  species_30: "🏔️",
  rivers_5: "🗺️",
  rivers_15: "🧭",
  rivers_30: "🌍",
  streak_4: "⚡",
  streak_12: "💎",
};

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
    sm: { cls: "w-8 h-8", text: "text-sm" },
    md: { cls: "w-12 h-12", text: "text-xl" },
    lg: { cls: "w-16 h-16", text: "text-2xl" },
  };

  const { cls, text } = sizeMap[size];
  const emoji = AWARD_EMOJI_MAP[award.award_key] || award.metadata.badge_icon || "🏆";
  const borderColor = award.metadata.badge_color || "#E8923A";

  const containerClasses = showDetails ? "flex items-start gap-3" : "inline-flex";

  return (
    <div className={containerClasses}>
      <div
        className={`${cls} rounded-full flex-shrink-0 flex items-center justify-center bg-[#0D1117] border-2`}
        style={{ borderColor }}
        title={award.metadata.display_name}
      >
        <span className={`${text} leading-none`}>{emoji}</span>
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
