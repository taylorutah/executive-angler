import { Star } from "@/icons";

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: "sm" | "md";
  /** Extra label after the count, e.g. "on Google". */
  suffix?: string;
}

/**
 * Five five-pointed stars. A single sparkle plus a number is not a rank.
 */
export default function RatingStars({
  rating,
  count,
  size = "sm",
  suffix,
}: RatingStarsProps) {
  const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const filledThrough = Math.round(rating);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1" aria-label={`${rating.toFixed(1)} out of 5`}>
      <div className="flex items-center gap-px" aria-hidden>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= filledThrough
                ? "fill-[var(--accent)] text-[var(--accent)]"
                : "text-[var(--text-3)]"
            }`}
          />
        ))}
      </div>
      <span className="num text-sm font-medium text-[var(--text-1)]">
        {Number.isInteger(rating) ? rating.toFixed(0) : rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="font-ui text-sm text-[var(--text-2)]">
          ({count.toLocaleString()} {count === 1 ? "review" : "reviews"}
          {suffix ? ` ${suffix}` : ""})
        </span>
      )}
    </div>
  );
}
