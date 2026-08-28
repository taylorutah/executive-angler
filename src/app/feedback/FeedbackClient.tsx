"use client";

import { useState } from "react";
import Link from "next/link";

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
  { key: "feature", label: "Feature", description: "Something the desk does not do yet." },
  { key: "improvement", label: "Improvement", description: "Something that could be quieter." },
  { key: "bug", label: "Bug", description: "Something that is broken." },
  { key: "other", label: "Note", description: "Anything else." },
];

const STATUS_LABEL: Record<string, string> = {
  submitted: "Received",
  in_review: "Under review",
  approved: "Planned",
  published: "Shipped",
  rejected: "Not planned",
  needs_info: "Need more",
};

const fieldClass =
  "w-full rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-card)] px-4 py-3 font-ui text-[15px] text-[var(--ink)] placeholder:text-[var(--slate)] outline-none focus:border-[var(--action)]";

export default function FeedbackClient({
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
          short_description: CATEGORIES.find((c) => c.key === category)?.label || category,
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
    <div className="bg-[var(--paper)]">
      <div className="desk-sheet">
        <div className="desk-form">
          <p className="desk-eyebrow">House</p>
          <h1
            className="mt-4 font-heading text-[32px] font-semibold leading-[36px] text-[var(--ink)] sm:text-[48px] sm:leading-[56px]"
            style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
          >
            Feedback
          </h1>
          <p className="desk-dek-ui mt-3">The desk is built from the water out. Tell us what is missing.</p>

          {success ? (
            <div className="mt-8 space-y-4">
              <p className="font-ui text-[15px] text-[var(--ink)]">Received. We read every note.</p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="bg-[var(--action)] px-[18px] py-2.5 font-ui text-[13px] font-semibold text-[var(--on-action)] hover:bg-[var(--action-hover)]"
              >
                Write another
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              <fieldset>
                <legend className="mb-2 font-ui text-[13px] text-[var(--ink)]">What kind?</legend>
                <ul className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <li key={cat.key}>
                      <button
                        type="button"
                        onClick={() => setCategory(cat.key)}
                        className={`flex w-full items-baseline justify-between border px-3 py-2 text-left font-ui text-[14px] ${
                          category === cat.key
                            ? "border-[var(--ink)] bg-[var(--vellum)] text-[var(--ink)]"
                            : "border-[var(--border-rule)] bg-[var(--paper)] text-[var(--graphite)]"
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span className="text-[12px] text-[var(--slate)]">{cat.description}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </fieldset>

              {category ? (
                <>
                  <div>
                    <label htmlFor="feedback-title" className="mb-1.5 block font-ui text-sm text-[var(--ink)]">
                      Title
                    </label>
                    <input
                      id="feedback-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={fieldClass}
                      maxLength={120}
                    />
                  </div>
                  <div>
                    <label htmlFor="feedback-details" className="mb-1.5 block font-ui text-sm text-[var(--ink)]">
                      Details
                    </label>
                    <textarea
                      id="feedback-details"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      rows={5}
                      className={`${fieldClass} resize-none`}
                    />
                  </div>
                  {error ? (
                    <p className="border border-[var(--border-rule)] bg-[var(--vellum)] px-4 py-2 font-ui text-sm text-[var(--ink)]">
                      {error}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !title.trim()}
                    className="w-full bg-[var(--action)] py-3 font-ui text-[14px] font-semibold text-[var(--on-action)] hover:bg-[var(--action-hover)] disabled:cursor-not-allowed"
                  >
                    {submitting ? "Sending…" : "Send"}
                  </button>
                </>
              ) : null}
            </div>
          )}

          {existing.length > 0 ? (
            <div className="mt-10">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="hover-copper font-ui text-[13px] text-[var(--copper)]"
              >
                {showHistory ? "Hide" : "Show"} your notes ({existing.length})
              </button>
              {showHistory ? (
                <ul className="desk-rule-list mt-4">
                  {existing.map((fb) => (
                    <li key={fb.id}>
                      <span className="text-[15px] text-[var(--ink)]">{fb.name}</span>
                      <span className="shrink-0 text-[13px] text-[var(--graphite)]">
                        {STATUS_LABEL[fb.status] || fb.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <p className="mt-8 font-ui text-sm text-[var(--graphite)]">
            <Link href="/today" className="hover-copper text-[var(--copper)] underline underline-offset-4">
              Back to Today
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
