import { Star, ExternalLink } from "lucide-react";

interface FeaturedReview {
  reviewer_name: string;
  rating: number;
  text: string;
}

interface GoogleReviewsProps {
  googleRating: number | null;
  googleReviewCount: number | null;
  featuredReviews: FeaturedReview[] | null;
  googleReviewsUrl: string | null;
}

function Stars({ rating }: { rating: number }) {
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

function LargeStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-6 w-6 ${
            star <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-[#484F58]"
          }`}
        />
      ))}
    </div>
  );
}

const GoogleIcon = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
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
);

export default function GoogleReviews({
  googleRating,
  googleReviewCount,
  featuredReviews,
  googleReviewsUrl,
}: GoogleReviewsProps) {
  if (googleRating == null) return null;

  return (
    <section>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <LargeStars rating={googleRating} />
        <span className="text-2xl font-bold text-[#E8923A]">
          {googleRating.toFixed(1)}
        </span>
        <span className="text-[#8B949E]">/5 on Google</span>
        {googleReviewCount != null && (
          <span className="text-sm text-[#484F58]">
            ({googleReviewCount.toLocaleString()} reviews)
          </span>
        )}
      </div>

      <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-6 mb-6">
        What Anglers Say
      </h2>

      {/* Review Cards */}
      {featuredReviews && featuredReviews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredReviews.slice(0, 3).map((review, i) => (
            <div
              key={i}
              className="bg-[#161B22] rounded-xl shadow-sm p-5 flex flex-col"
            >
              <Stars rating={review.rating} />
              <p className="text-[#8B949E] text-sm leading-relaxed mt-3 flex-1 line-clamp-5">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#21262D]">
                <span className="text-sm font-medium text-[#E8923A]">
                  {review.reviewer_name}
                </span>
                <GoogleIcon />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Link */}
      {googleReviewsUrl && (
        <div className="mt-6">
          <a
            href={googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#E8923A] hover:text-[#F0F6FC] transition-colors"
          >
            Read all Google reviews
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </section>
  );
}
