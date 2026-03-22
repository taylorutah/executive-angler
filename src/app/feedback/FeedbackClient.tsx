"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lightbulb, Bug, Sparkles, MessageSquarePlus, Send,
  Loader2, CheckCircle, ChevronDown, Clock, AlertCircle,
  ThumbsUp, Wrench
} from "lucide-react";

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
  { key: "feature", label: "Feature Request", icon: <Lightbulb className="h-5 w-5" />, color: "text-[#E8923A]", bg: "bg-[#E8923A]/10 border-[#E8923A]/30", description: "I wish Executive Angler could..." },
  { key: "improvement", label: "Improvement", icon: <Sparkles className="h-5 w-5" />, color: "text-[#0BA5C7]", bg: "bg-[#0BA5C7]/10 border-[#0BA5C7]/30", description: "This exists but could be better..." },
  { key: "bug", label: "Bug Report", icon: <Bug className="h-5 w-5" />, color: "text-red-400", bg: "bg-red-400/10 border-red-400/30", description: "Something isn't working right..." },
  { key: "other", label: "General Feedback", icon: <MessageSquarePlus className="h-5 w-5" />, color: "text-[#2EA44F]", bg: "bg-[#2EA44F]/10 border-[#2EA44F]/30", description: "Anything else on your mind..." },
];

const STATUS_DISPLAY: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  submitted: { label: "Received", color: "text-[#0BA5C7]", icon: <Clock className="h-3 w-3" /> },
  in_review: { label: "Under Review", color: "text-[#E8923A]", icon: <Wrench className="h-3 w-3" /> },
  approved: { label: "Planned", color: "text-[#2EA44F]", icon: <ThumbsUp className="h-3 w-3" /> },
  published: { label: "Shipped!", color: "text-[#2EA44F]", icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: "Not Planned", color: "text-[#6E7681]", icon: <AlertCircle className="h-3 w-3" /> },
  needs_info: { label: "Need More Details", color: "text-yellow-400", icon: <AlertCircle className="h-3 w-3" /> },
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
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E8923A]/10 mb-4">
            <Lightbulb className="h-7 w-7 text-[#E8923A]" />
          </div>
          <h1 className="font-serif text-3xl text-[#F0F6FC] mb-2">Ideas & Feedback</h1>
          <p className="text-[#A8B2BD] max-w-md mx-auto">
            Executive Angler is built by anglers, for anglers. Your ideas shape what we build next.
          </p>
        </div>

        {/* Success state */}
        {success ? (
          <div className="bg-[#161B22] border border-[#2EA44F]/30 rounded-xl p-8 text-center">
            <CheckCircle className="h-12 w-12 text-[#2EA44F] mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#F0F6FC] mb-2">Thanks for the feedback!</h2>
            <p className="text-sm text-[#A8B2BD] mb-6">
              We read every submission. If we have questions, we&apos;ll reach out through the app.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setSuccess(false)}
                className="px-5 py-2.5 bg-[#E8923A] text-white rounded-lg text-sm font-semibold hover:bg-[#F0A65A] transition-colors"
              >
                Submit Another
              </button>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-[#21262D] text-[#F0F6FC] rounded-lg text-sm font-semibold hover:bg-[#2D333B] transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Category picker */}
            <div className="mb-6">
              <p className="text-xs font-bold text-[#A8B2BD] uppercase tracking-wider mb-3">What kind of feedback?</p>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setCategory(cat.key)}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-all text-left ${
                      category === cat.key
                        ? cat.bg + " border-opacity-100"
                        : "bg-[#161B22] border-[#21262D] hover:border-[#6E7681]"
                    }`}
                  >
                    <span className={category === cat.key ? cat.color : "text-[#6E7681]"}>
                      {cat.icon}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${category === cat.key ? "text-[#F0F6FC]" : "text-[#A8B2BD]"}`}>
                        {cat.label}
                      </p>
                      <p className="text-[10px] text-[#6E7681] mt-0.5">{cat.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            {category && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-[#A8B2BD] uppercase tracking-wider mb-2">
                    Title <span className="text-red-400">*</span>
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
                    className="w-full px-4 py-3 bg-[#161B22] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]"
                    maxLength={120}
                  />
                  <p className="text-[10px] text-[#6E7681] mt-1 text-right">{title.length}/120</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A8B2BD] uppercase tracking-wider mb-2">
                    Details <span className="text-[#6E7681]">(optional)</span>
                  </label>
                  <textarea
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    placeholder="Give us the full picture. What problem does this solve? How would it work? The more detail, the better we can build it."
                    rows={5}
                    className="w-full px-4 py-3 bg-[#161B22] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A] resize-none"
                  />
                </div>

                {error && (
                  <div className="px-4 py-3 bg-red-950/30 border border-red-800 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !title.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#E8923A] text-white text-base font-bold rounded-xl hover:bg-[#F0A65A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="h-5 w-5" /> Submit Feedback</>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Previous submissions */}
        {existing.length > 0 && (
          <div className="mt-10">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors mb-3"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${showHistory ? "rotate-180" : ""}`} />
              Your previous feedback ({existing.length})
            </button>

            {showHistory && (
              <div className="space-y-2">
                {existing.map(fb => {
                  const statusCfg = STATUS_DISPLAY[fb.status] || STATUS_DISPLAY.submitted;
                  const catInfo = CATEGORIES.find(c => c.key === fb.entity_data?.category);

                  return (
                    <div key={fb.id} className="bg-[#161B22] border border-[#21262D] rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={catInfo?.color || "text-[#A8B2BD]"}>
                              {catInfo?.icon || <MessageSquarePlus className="h-4 w-4" />}
                            </span>
                            <h3 className="text-sm font-semibold text-[#F0F6FC]">{fb.name}</h3>
                          </div>
                          <p className="text-xs text-[#6E7681] mt-1">
                            {new Date(fb.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                          {fb.admin_feedback && (
                            <div className="mt-2 px-3 py-2 bg-[#E8923A]/5 border border-[#E8923A]/20 rounded-lg">
                              <p className="text-xs text-[#E8923A]"><strong>Team response:</strong> {fb.admin_feedback}</p>
                            </div>
                          )}
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${statusCfg.color} bg-current/10 shrink-0`}>
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
