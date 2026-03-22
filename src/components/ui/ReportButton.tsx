"use client";

import { useState } from "react";
import { Flag, X, Send, Loader2, CheckCircle } from "lucide-react";

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
        className="flex items-center gap-1.5 text-xs text-[#6E7681] hover:text-[#A8B2BD] transition-colors"
        title="Report an issue"
      >
        <Flag className="h-3.5 w-3.5" />
        Report
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-[#161B22] border border-[#21262D] rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            {submitted ? (
              <div className="text-center py-4">
                <CheckCircle className="h-10 w-10 text-[#2EA44F] mx-auto mb-3" />
                <p className="text-[#F0F6FC] font-semibold">Report submitted</p>
                <p className="text-xs text-[#A8B2BD] mt-1">We&apos;ll review this shortly. Thank you.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[#F0F6FC]">Report an Issue</h3>
                  <button onClick={() => setIsOpen(false)} className="text-[#6E7681] hover:text-[#F0F6FC]">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <p className="text-xs text-[#A8B2BD]">What&apos;s wrong with this {entityType.replace("_", " ")}?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {REASONS.map(r => (
                      <button
                        key={r.key}
                        onClick={() => setReason(r.key)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                          reason === r.key
                            ? "bg-[#E8923A]/15 text-[#E8923A] border border-[#E8923A]/30"
                            : "bg-[#0D1117] text-[#A8B2BD] border border-[#21262D] hover:border-[#6E7681]"
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
                    className="w-full px-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-lg text-xs text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A] resize-none"
                  />
                </div>

                {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

                <button
                  onClick={handleSubmit}
                  disabled={!reason || submitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#E8923A] text-white rounded-lg text-sm font-bold hover:bg-[#F0A65A] disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit Report
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
