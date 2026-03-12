"use client";

import { Star } from "lucide-react";
import type { GoogleReview } from "@/types/entities";

interface GoogleReviewsProps {
  rating?: number;
  reviewCount?: number;
  reviewsUrl?: string;
  reviews?: GoogleReview[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-[#484F58]"
          }`}
        />
      ))}
    </div>
  );
}

export default function GoogleReviews({
  rating,
  reviewCount,
  reviewsUrl,
  reviews,
}: GoogleReviewsProps) {
  if (!rating || !reviewCount) return null;

  return (
    <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
      {/* Rating Summary */}
      <div className="flex items-center gap-3 mb-4">
        <svg
          className="h-6 w-6 shrink-0"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#F0F6FC]">
              {rating.toFixed(1)}
            </span>
            <StarRating rating={rating} />
          </div>
          <p className="text-sm text-[#8B949E]">
            {reviewCount.toLocaleString()} Google reviews
          </p>
        </div>
      </div>

      {/* Individual Reviews */}
      {reviews && reviews.length > 0 && (
        <div className="space-y-4 mb-4">
          {reviews.slice(0, 3).map((review, i) => (
            <div
              key={i}
              className="border-t border-[#21262D] pt-4 first:border-0 first:pt-0"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-[#E8923A]/10 flex items-center justify-center text-xs font-bold text-[#E8923A]">
                  {review.authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F0F6FC]">
                    {review.authorName}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-[#484F58]">
                      {review.relativeTimeDescription}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#8B949E] leading-relaxed line-clamp-3">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* View on Google Link */}
      {reviewsUrl && (
        <a
          href={reviewsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#E8923A] hover:text-[#F0F6FC] transition-colors"
        >
          See all reviews on Google
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </a>
      )}
    </div>
  );
}
