"use client";

import { useState } from "react";
import { Flag, X, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ReportButtonProps {
  entityType: string;
  entityId: string;
}

const REASONS = [
  { key: "inaccurate", label: "Inaccurate information" },
  { key: "wrong_location", label: "Wrong location" },
  { key: "closed_permanently", label: "Permanently closed" },
  { key: "duplicate", label: "Duplicate entry" },
  { key: "inappropriate", label: "Inappropriate content" },
  { key: "spam", label: "Spam" },
  { key: "copyright", label: "Copyright issue" },
  { key: "other", label: "Other" },
];

export default function ReportButton({ entityType, entityId }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!reason) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          reason,
          details: details.trim() || null,
        }),
      });

      if (!res.ok) {
        const r = await res.json();
        throw new Error(r.error || "Failed to submit report");
      }

      setSubmitted(true);
      setTimeout(() => { setIsOpen(false); setSubmitted(false); setReason(""); setDetails(""); }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    }

    setSubmitting(false);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-xs text-[var(--text-body)] hover:text-[var(--text-primary)] transition-colors"
        title="Report an issue"
      >
        <Flag className="h-3.5 w-3.5" />
        Report
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            {submitted ? (
              <div className="text-center py-4">
                <CheckCircle className="h-10 w-10 text-[var(--state-positive)] mx-auto mb-3" />
                <p className="text-[var(--text-primary)] font-semibold">Report submitted</p>
                <p className="text-xs text-[var(--text-body)] mt-1">We&apos;ll review this shortly. Thank you.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Report an Issue</h3>
                  <button onClick={() => setIsOpen(false)} className="text-[var(--text-meta)] hover:text-[var(--text-primary)]">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <p className="text-xs text-[var(--text-body)]">What&apos;s wrong with this {entityType.replace("_", " ")}?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {REASONS.map(r => (
                      <button
                        key={r.key}
                        onClick={() => setReason(r.key)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                          reason === r.key
                            ? "bg-[var(--action)]/15 text-[var(--action)] border border-[var(--action)]/30"
                            : "bg-[var(--surface-page)] text-[var(--text-body)] border border-[var(--border-rule)] hover:border-[var(--text-meta)]"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <textarea
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    placeholder="Additional details (optional)..."
                    rows={3}
                    className="w-full px-3 py-2 bg-[var(--surface-page)] border border-[var(--border-rule)] rounded-lg text-xs text-[var(--text-primary)] placeholder-[#6E7681] focus:outline-none focus:border-[var(--action)] resize-none"
                  />
                </div>

                {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

                <Button
                  onClick={handleSubmit}
                  disabled={!reason || submitting}
                  loading={submitting}
                  variant="solid"
                  size="md"
                  icon={!submitting ? Send : undefined}
                  fullWidth
                 
                >
                  Submit Report
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
