import { Star } from "lucide-react";

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
                ? "text-[#E8923A] fill-[#E8923A]"
                : "text-[#6E7681]"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-[#F0F6FC]">
        {rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-sm text-[#A8B2BD]">({count} reviews)</span>
      )}
    </div>
  );
}
