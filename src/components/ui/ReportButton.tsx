"use client";

import { useRef, useState } from "react";
import { Flag, X, Send, CheckCircle } from "@/icons";
import { Button } from "@/components/ui/Button";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";
import { useModalChrome } from "@/components/layout/nav/useModalChrome";

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalChrome({
    open: isOpen,
    containerRef: dialogRef,
    onClose: () => setIsOpen(false),
    returnFocusTo: triggerRef,
  });

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
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className={`ea-focus-ring ${FOCUS_VISIBLE} flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors`}
        title="Report an issue"
      >
        <Flag className="h-3.5 w-3.5" aria-hidden />
        Report
      </button>

      {isOpen && (
        <div className="ea-modal-overlay z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Report an issue"
            className="ea-modal max-w-md"
            onClick={e => e.stopPropagation()}
          >
            {submitted ? (
              <div className="text-center py-4">
                <CheckCircle className="h-10 w-10 text-[var(--success)] mx-auto mb-3" />
                <p className="text-[var(--text-1)] font-semibold">Report submitted</p>
                <p className="text-xs text-[var(--text-2)] mt-1">We&apos;ll review this shortly. Thank you.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-[var(--text-1)]">Report an Issue</h3>
                  <button
                    type="button"
                    data-autofocus
                    onClick={() => setIsOpen(false)}
                    aria-label="Close report form"
                    className={`ea-focus-ring ${FOCUS_VISIBLE} text-[var(--text-3)] hover:text-[var(--text-1)]`}
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <p className="text-xs text-[var(--text-2)]">What&apos;s wrong with this {entityType.replace("_", " ")}?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {REASONS.map(r => (
                      <button
                        key={r.key}
                        onClick={() => setReason(r.key)}
                        className={`px-3 py-2 rounded-[var(--radius-md)] text-xs font-medium text-left transition-colors ${
                          reason === r.key
                            ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]"
                            : "bg-[var(--surface)] text-[var(--text-2)] border border-[var(--border)] hover:border-[var(--border-strong)]"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="report-details" className="sr-only">
                    Additional details
                  </label>
                  <textarea
                    id="report-details"
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    placeholder="Additional details (optional)..."
                    rows={3}
                    className={`ea-focus-ring ${FOCUS_VISIBLE} w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] outline-none resize-none`}
                  />
                </div>

                {error && <p className="text-xs text-[var(--danger)] mb-3">{error}</p>}

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
