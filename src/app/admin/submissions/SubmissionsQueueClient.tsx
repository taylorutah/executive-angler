"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, MessageCircle,
  Clock, Send, AlertCircle, Loader2, Shield
} from "lucide-react";

interface Submission {
  id: string;
  entity_type: string;
  status: string;
  name: string;
  short_description: string | null;
  hero_image_url: string | null;
  source: string;
  created_at: string;
  submitted_at: string | null;
  updated_at: string;
  user_id: string;
  version: number;
  profiles: { username: string | null; display_name: string | null } | null;
  reviewed_at?: string;
}

const TYPE_EMOJI: Record<string, string> = {
  river: "🏞️", fly_shop: "🏪", guide: "🎣", lodge: "🏡", destination: "🗺️", species: "🐟",
};

export default function SubmissionsQueueClient({ pending, recent }: { pending: Submission[]; recent: Submission[] }) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleAction(id: string, action: string, extra: Record<string, string> = {}) {
    setActionLoading(`${id}-${action}`);
    setMessage(null);
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: result.message || `${action} successful` });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage({ type: "error", text: result.error || "Action failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
    setActionLoading(null);
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <Shield className="h-5 w-5 text-[#E8923A]" />
          <h1 className="font-serif text-2xl text-[#F0F6FC]">Submissions Queue</h1>
          <span className="ml-auto px-3 py-1 bg-[#E8923A]/15 text-[#E8923A] rounded-full text-xs font-bold">
            {pending.length} pending
          </span>
        </div>

        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg border text-sm ${
            message.type === "success" ? "bg-green-950/30 border-green-800 text-green-400" : "bg-red-950/30 border-red-800 text-red-400"
          }`}>
            {message.text}
          </div>
        )}

        {/* Pending submissions */}
        {pending.length === 0 ? (
          <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-12 text-center">
            <CheckCircle className="h-10 w-10 text-[#2EA44F] mx-auto mb-3" />
            <p className="text-[#F0F6FC] font-semibold">Queue is clear!</p>
            <p className="text-sm text-[#A8B2BD] mt-1">No pending submissions to review.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-10">
            {pending.map(s => {
              const isExpanded = expandedId === s.id;
              const submitter = s.profiles?.display_name || s.profiles?.username || s.user_id.slice(0, 8);
              const isLoading = (action: string) => actionLoading === `${s.id}-${action}`;

              return (
                <div key={s.id} className="bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden">
                  {/* Main row */}
                  <div className="px-5 py-4 flex items-center gap-3">
                    <span className="text-2xl">{TYPE_EMOJI[s.entity_type] || "📄"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#F0F6FC] truncate">{s.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.status === "submitted" ? "bg-[#0BA5C7]/15 text-[#0BA5C7]"
                            : s.status === "in_review" ? "bg-[#E8923A]/15 text-[#E8923A]"
                              : "bg-yellow-400/15 text-yellow-400"
                        }`}>
                          {s.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-[#6E7681] mt-0.5">
                        {s.entity_type.replace("_", " ")} · by {submitter} · {formatDate(s.submitted_at || s.created_at)} · v{s.version}
                        {s.source !== "manual" && ` · via ${s.source.replace("_", " ")}`}
                      </p>
                    </div>

                    {/* Quick actions */}
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleAction(s.id, "approve")}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1 px-3 py-2 bg-[#2EA44F]/15 text-[#2EA44F] rounded-lg text-xs font-bold hover:bg-[#2EA44F]/25 disabled:opacity-50"
                        title="Approve"
                      >
                        {isLoading("approve") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                        Approve
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        className="p-2 bg-[#21262D] text-[#A8B2BD] rounded-lg hover:text-[#F0F6FC] transition-colors"
                        title="More options"
                      >
                        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-4 border-t border-[#21262D] pt-4 space-y-3">
                      {s.hero_image_url && (
                        <div className="rounded-lg overflow-hidden border border-[#21262D]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.hero_image_url} alt="" className="w-full h-40 object-cover" />
                        </div>
                      )}

                      <Link
                        href={`/admin/submissions/${s.id}`}
                        className="text-xs text-[#0BA5C7] hover:underline"
                      >
                        View full submission details →
                      </Link>

                      {/* Reject with reason */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={feedback[s.id] || ""}
                          onChange={e => setFeedback(prev => ({ ...prev, [s.id]: e.target.value }))}
                          placeholder="Reason / feedback..."
                          className="flex-1 px-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-lg text-xs text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]"
                        />
                        <button
                          onClick={() => handleAction(s.id, "needs_info", { feedback: feedback[s.id] || "" })}
                          disabled={!!actionLoading || !feedback[s.id]?.trim()}
                          className="px-3 py-2 bg-yellow-400/15 text-yellow-400 rounded-lg text-xs font-bold hover:bg-yellow-400/25 disabled:opacity-50"
                        >
                          {isLoading("needs_info") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5 inline mr-1" />}
                          Need Info
                        </button>
                        <button
                          onClick={() => handleAction(s.id, "reject", { reason: feedback[s.id] || "Does not meet quality standards" })}
                          disabled={!!actionLoading}
                          className="px-3 py-2 bg-red-950/30 text-red-400 rounded-lg text-xs font-bold hover:bg-red-950/50 disabled:opacity-50"
                        >
                          {isLoading("reject") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5 inline mr-1" />}
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Recent decisions */}
        {recent.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-[#A8B2BD] uppercase tracking-wider mb-3">Recent Decisions</h2>
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl divide-y divide-[#21262D]">
              {recent.map(s => (
                <div key={s.id} className="px-5 py-3 flex items-center gap-3">
                  <span>{TYPE_EMOJI[s.entity_type]}</span>
                  <span className="text-sm text-[#F0F6FC] flex-1 truncate">{s.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    s.status === "approved" ? "bg-[#2EA44F]/15 text-[#2EA44F]" : "bg-red-400/15 text-red-400"
                  }`}>
                    {s.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-[#6E7681]">{formatDate(s.reviewed_at || s.updated_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
