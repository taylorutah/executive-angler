import { Star } from "@/icons";

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: "sm" | "md";
}

export default function RatingStars({ rating, count, size = "sm" }: RatingStarsProps) {
  const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= Math.round(rating)
                ? "text-[var(--accent)] fill-[var(--accent)]"
                : "text-[var(--text-3)]"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-[var(--text-1)]">
        {rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-sm text-[var(--text-2)]">({count} reviews)</span>
      )}
    </div>
  );
}
