"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lightbulb, Bug, Sparkles, MessageSquarePlus, Send,
  Loader2, CheckCircle, ChevronDown, Clock, AlertCircle,
  ThumbsUp, Wrench
} from "@/icons";

interface Feedback {
  id: string;
  name: string;
  short_description: string | null;
  status: string;
  entity_data: { category?: string; priority?: string } | null;
  created_at: string;
  admin_feedback: string | null;
}

const CATEGORIES = [
  { key: "feature", label: "Feature Request", icon: <Lightbulb size={20} />, description: "I wish Executive Angler could..." },
  { key: "improvement", label: "Improvement", icon: <Sparkles size={20} />, description: "This exists but could be better..." },
  { key: "bug", label: "Bug Report", icon: <Bug size={20} />, description: "Something isn't working right..." },
  { key: "other", label: "General Feedback", icon: <MessageSquarePlus size={20} />, description: "Anything else on your mind..." },
];

const STATUS_DISPLAY: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  submitted: { label: "Received", color: "text-[var(--text-2)]", icon: <Clock size={12} /> },
  in_review: { label: "Under Review", color: "text-[var(--accent)]", icon: <Wrench size={12} /> },
  approved: { label: "Planned", color: "text-[var(--success)]", icon: <ThumbsUp size={12} /> },
  published: { label: "Shipped!", color: "text-[var(--success)]", icon: <CheckCircle size={12} /> },
  rejected: { label: "Not Planned", color: "text-[var(--text-3)]", icon: <AlertCircle size={12} /> },
  needs_info: { label: "Need More Details", color: "text-[var(--warning)]", icon: <AlertCircle size={12} /> },
};

export default function FeedbackClient({
  userId,
  userEmail,
  existing,
}: {
  userId: string;
  userEmail: string;
  existing: Feedback[];
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  async function handleSubmit() {
    if (!category || !title.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: "feedback",
          name: title.trim(),
          description: details.trim() || null,
          short_description: CATEGORIES.find(c => c.key === category)?.label || category,
          entity_data: { category },
          submit: true,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setSuccess(true);
      setTitle("");
      setDetails("");
      setCategory(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    }

    setSubmitting(false);
  }

  return (
    <div className="py-14 sm:py-24">
      <div className="mx-auto max-w-[var(--prose)] px-4 sm:px-6">
        {/* Header */}
        <p className="ea-overline">
          Ideas &amp; feedback
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-[var(--text-1)] sm:text-5xl">
          Ideas &amp; Feedback
        </h1>
        <p className="mt-4 text-lg text-[var(--text-2)]">
          Executive Angler is built by anglers, for anglers. Your ideas shape what we build next.
        </p>

        {/* Success state */}
        {success ? (
          <div className="ea-empty mt-10 rounded-card border border-[var(--border)] bg-[var(--surface)]">
            <CheckCircle size={24} className="text-[var(--success)]" />
            <h2 className="font-display text-xl font-semibold text-[var(--text-1)]">
              Thanks for the feedback!
            </h2>
            <p>
              We read every submission. If we have questions, we&apos;ll reach out through the app.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSuccess(false)}
                className="ea-btn ea-btn-primary"
              >
                Submit Another
              </button>
              <Link
                href="/dashboard"
                className="ea-btn ea-btn-secondary"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Category picker */}
            <div className="mt-10">
              <p className="ea-label">What kind of feedback?</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setCategory(cat.key)}
                    aria-pressed={category === cat.key}
                    className={`flex items-start gap-3 rounded-card border p-4 text-left transition-colors ${
                      category === cat.key
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    <span className={category === cat.key ? "text-[var(--accent)]" : "text-[var(--text-3)]"}>
                      {cat.icon}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${category === cat.key ? "text-[var(--text-1)]" : "text-[var(--text-2)]"}`}>
                        {cat.label}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--text-3)]">{cat.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            {category && (
              <div className="mt-8 space-y-6">
                <div>
                  <label className="ea-label">
                    Title <span className="text-[var(--danger)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={
                      category === "bug"
                        ? "e.g., Session timer doesn't pause when app backgrounds"
                        : category === "feature"
                          ? "e.g., Hatch calendar with insect emergence data"
                          : "e.g., Make the catch logging form faster"
                    }
                    className="ea-input"
                    maxLength={120}
                  />
                  <p className="num mt-1 text-right text-xs text-[var(--text-3)]">{title.length}/120</p>
                </div>

                <div>
                  <label className="ea-label">
                    Details <span className="font-normal normal-case tracking-normal text-[var(--text-3)]">(optional)</span>
                  </label>
                  <textarea
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    placeholder="Give us the full picture. What problem does this solve? How would it work? The more detail, the better we can build it."
                    rows={5}
                    className="ea-input resize-none"
                  />
                </div>

                {error && (
                  <div className="rounded-surface border border-[var(--danger)] bg-[var(--surface)] px-4 py-3">
                    <p className="text-sm text-[var(--danger)]">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !title.trim()}
                  className="ea-btn ea-btn-primary ea-btn-lg w-full"
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                  ) : (
                    <><Send size={16} /> Submit Feedback</>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Previous submissions */}
        {existing.length > 0 && (
          <div className="mt-12">
            <button
              onClick={() => setShowHistory(!showHistory)}
              aria-expanded={showHistory}
              className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--text-2)] underline-offset-4 transition-colors hover:text-[var(--text-1)] hover:underline"
            >
              <ChevronDown size={16} className={`transition-transform ${showHistory ? "rotate-180" : ""}`} />
              Your previous feedback ({existing.length})
            </button>

            {showHistory && (
              <div className="space-y-3">
                {existing.map(fb => {
                  const statusCfg = STATUS_DISPLAY[fb.status] || STATUS_DISPLAY.submitted;
                  const catInfo = CATEGORIES.find(c => c.key === fb.entity_data?.category);

                  return (
                    <div key={fb.id} className="ea-card">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[var(--text-3)]">
                              {catInfo?.icon || <MessageSquarePlus size={16} />}
                            </span>
                            <h3 className="text-sm font-semibold text-[var(--text-1)]">{fb.name}</h3>
                          </div>
                          <p className="mt-1 text-xs text-[var(--text-3)]">
                            {new Date(fb.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                          {fb.admin_feedback && (
                            <div className="mt-3 rounded-surface border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-2">
                              <p className="text-xs text-[var(--text-1)]"><strong>Team response:</strong> {fb.admin_feedback}</p>
                            </div>
                          )}
                        </div>
                        <span className={`ea-chip shrink-0 ${statusCfg.color}`}>
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
