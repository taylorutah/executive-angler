"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Trash2, Edit3, User } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title?: string;
  body: string;
  visit_date?: string;
  created_at: string;
  author_name: string;
  author_avatar?: string;
}

interface Props {
  entityType: string;
  entityId: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${
            n <= rating
              ? "fill-[#E8923A] text-[#E8923A]"
              : "text-[#21262D]"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewForm({
  entityType,
  entityId,
  existingReview,
  onSaved,
  onCancel,
}: {
  entityType: string;
  entityId: string;
  existingReview?: Review;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [body, setBody] = useState(existingReview?.body || "");
  const [visitDate, setVisitDate] = useState(existingReview?.visit_date || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating"); return; }
    if (!body.trim()) { setError("Please write a review"); return; }
    setSaving(true);
    setError("");

    try {
      const isEdit = !!existingReview;
      const url = isEdit
        ? `/api/reviews?id=${existingReview.id}`
        : "/api/reviews";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEdit ? {} : { entityType, entityId }),
          rating,
          title: title.trim() || null,
          body: body.trim(),
          visitDate: visitDate || null,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save review");
      }
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const input = "w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] focus:outline-none focus:border-[#E8923A]/50";

  return (
    <form onSubmit={handleSubmit} className="bg-[#161B22] rounded-xl border border-[#21262D] p-5 space-y-4">
      <h3 className="font-heading text-base font-semibold text-[#F0F6FC]">
        {existingReview ? "Edit Your Review" : "Write a Review"}
      </h3>

      {/* Star picker */}
      <div>
        <label className="block text-xs font-medium text-[#A8B2BD] mb-2">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(n)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={`h-6 w-6 ${
                  n <= (hoverRating || rating)
                    ? "fill-[#E8923A] text-[#E8923A]"
                    : "text-[#6E7681]"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-[#A8B2BD] mb-1">Title (optional)</label>
        <input
          className={input}
          placeholder="Sum up your experience"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-medium text-[#A8B2BD] mb-1">Your Review</label>
        <textarea
          className={input}
          rows={4}
          placeholder="What was your experience like?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </div>

      {/* Visit Date */}
      <div>
        <label className="block text-xs font-medium text-[#A8B2BD] mb-1">Date of Visit (optional)</label>
        <input type="date" className={input} value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-[#E8923A] text-white text-sm font-semibold rounded-lg hover:bg-[#D4801F] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : existingReview ? "Update Review" : "Submit Review"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function UserReviews({ entityType, entityId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | undefined>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    const res = await fetch(`/api/reviews?entityType=${entityType}&entityId=${entityId}`);
    if (res.ok) {
      const data = await res.json();
      setReviews(data);
    }
    setLoading(false);
  }, [entityType, entityId]);

  useEffect(() => {
    fetchReviews();
    // Check if user is logged in
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, [fetchReviews]);

  const hasOwnReview = reviews.some(r => r.user_id === currentUserId);

  async function handleDelete(id: string) {
    if (!confirm("Delete your review?")) return;
    setDeleting(id);
    const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setReviews(prev => prev.filter(r => r.id !== id));
    }
    setDeleting(null);
  }

  function handleSaved() {
    setShowForm(false);
    setEditingReview(undefined);
    fetchReviews();
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-6 w-32 bg-[#21262D] rounded" />
        <div className="h-24 bg-[#161B22] rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading text-2xl font-bold text-[#E8923A]">
          Reviews {reviews.length > 0 && <span className="text-base font-normal text-[#6E7681]">({reviews.length})</span>}
        </h2>
        {currentUserId && !hasOwnReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-1.5 bg-[#E8923A] text-white text-sm font-semibold rounded-lg hover:bg-[#D4801F] transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Form */}
      {(showForm || editingReview) && (
        <div className="mb-6">
          <ReviewForm
            entityType={entityType}
            entityId={entityId}
            existingReview={editingReview}
            onSaved={handleSaved}
            onCancel={() => { setShowForm(false); setEditingReview(undefined); }}
          />
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 && !showForm ? (
        <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-8 text-center">
          <p className="text-sm text-[#6E7681]">No reviews yet. Be the first to share your experience.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-[#161B22] rounded-xl border border-[#21262D] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {review.author_avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={review.author_avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#21262D] flex items-center justify-center">
                      <User className="h-4 w-4 text-[#6E7681]" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#F0F6FC]">{review.author_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={review.rating} />
                      {review.visit_date && (
                        <span className="text-[10px] text-[#6E7681]">
                          Visited {new Date(review.visit_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit/Delete for own reviews */}
                {review.user_id === currentUserId && (
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => { setEditingReview(review); setShowForm(false); }}
                      className="p-1.5 text-[#6E7681] hover:text-[#E8923A] transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={deleting === review.id}
                      className="p-1.5 text-[#6E7681] hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {review.title && (
                <h4 className="text-sm font-semibold text-[#F0F6FC] mt-3">{review.title}</h4>
              )}
              <p className="text-sm text-[#A8B2BD] mt-2 leading-relaxed">{review.body}</p>

              <p className="text-[10px] text-[#6E7681] mt-3">
                {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Not logged in prompt */}
      {!currentUserId && reviews.length > 0 && (
        <div className="mt-4 text-center">
          <a href="/login" className="text-sm text-[#E8923A] hover:underline">
            Sign in to leave a review
          </a>
        </div>
      )}
    </div>
  );
}
