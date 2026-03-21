"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, Plus, Clock, CheckCircle, XCircle, AlertCircle,
  Send, FileEdit, Eye, Trash2, Loader2, Shield
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
  rejection_reason: string | null;
  admin_feedback: string | null;
  version: number;
}

interface Stats {
  submissions_total: number;
  submissions_approved: number;
  submissions_rejected: number;
  trust_level: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  draft: { label: "Draft", color: "text-[#8B949E]", icon: <FileEdit className="h-3.5 w-3.5" />, bg: "bg-[#21262D]" },
  submitted: { label: "Submitted", color: "text-[#0BA5C7]", icon: <Send className="h-3.5 w-3.5" />, bg: "bg-[#0BA5C7]/15" },
  in_review: { label: "In Review", color: "text-[#E8923A]", icon: <Eye className="h-3.5 w-3.5" />, bg: "bg-[#E8923A]/15" },
  needs_info: { label: "Needs Info", color: "text-yellow-400", icon: <AlertCircle className="h-3.5 w-3.5" />, bg: "bg-yellow-400/15" },
  approved: { label: "Approved", color: "text-[#2EA44F]", icon: <CheckCircle className="h-3.5 w-3.5" />, bg: "bg-[#2EA44F]/15" },
  rejected: { label: "Rejected", color: "text-red-400", icon: <XCircle className="h-3.5 w-3.5" />, bg: "bg-red-400/15" },
  published: { label: "Published", color: "text-[#2EA44F]", icon: <CheckCircle className="h-3.5 w-3.5" />, bg: "bg-[#2EA44F]/15" },
};

const TYPE_EMOJI: Record<string, string> = {
  river: "🏞️", fly_shop: "🏪", guide: "🎣", lodge: "🏡", destination: "🗺️", species: "🐟",
};

const TRUST_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "New Contributor", color: "text-[#8B949E]" },
  contributor: { label: "Contributor", color: "text-[#0BA5C7]" },
  trusted: { label: "Trusted Contributor", color: "text-[#2EA44F]" },
  verified: { label: "Verified", color: "text-[#E8923A]" },
  moderator: { label: "Moderator", color: "text-purple-400" },
};

export default function MySubmissionsClient({ submissions, stats }: { submissions: Submission[]; stats: Stats }) {
  const [filter, setFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = filter === "all" ? submissions : submissions.filter(s => s.status === filter);
  const trustInfo = TRUST_LABELS[stats.trust_level] || TRUST_LABELS.new;

  async function handleDelete(id: string) {
    if (!confirm("Delete this draft?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/submissions/${id}`, { method: "DELETE" });
      window.location.reload();
    } catch { /* ignore */ }
    setDeleting(null);
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/account" className="text-[#8B949E] hover:text-[#F0F6FC] transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-serif text-2xl text-[#F0F6FC]">My Submissions</h1>
          </div>
          <Link
            href="/contribute"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#E8923A] text-white rounded-lg text-sm font-semibold hover:bg-[#F0A65A] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Submission
          </Link>
        </div>

        {/* Contributor stats */}
        <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-[#E8923A]" />
              <div>
                <p className={`text-sm font-semibold ${trustInfo.color}`}>{trustInfo.label}</p>
                <p className="text-[11px] text-[#484F58]">
                  {stats.submissions_approved} approved · {stats.submissions_rejected} rejected · {stats.submissions_total} total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {[
            { key: "all", label: "All" },
            { key: "draft", label: "Drafts" },
            { key: "submitted", label: "Submitted" },
            { key: "needs_info", label: "Needs Info" },
            { key: "approved", label: "Approved" },
            { key: "rejected", label: "Rejected" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === tab.key
                  ? "bg-[#E8923A] text-white"
                  : "bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC]"
              }`}
            >
              {tab.label}
              {tab.key !== "all" && (
                <span className="ml-1 opacity-60">
                  {submissions.filter(s => s.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Submissions list */}
        {filtered.length === 0 ? (
          <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-12 text-center">
            <p className="text-[#484F58] mb-3">
              {filter === "all" ? "No submissions yet" : `No ${filter} submissions`}
            </p>
            <Link href="/contribute" className="text-sm text-[#E8923A] hover:underline">
              Start contributing →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => {
              const statusCfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.draft;
              const canEdit = ["draft", "needs_info", "rejected"].includes(s.status);
              const canDelete = s.status === "draft";

              return (
                <div key={s.id} className="bg-[#161B22] border border-[#21262D] rounded-xl p-4 hover:border-[#484F58] transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Type emoji */}
                    <span className="text-2xl mt-0.5">{TYPE_EMOJI[s.entity_type] || "📄"}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-[#F0F6FC]">{s.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.color} ${statusCfg.bg}`}>
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </div>

                      <p className="text-xs text-[#484F58] mt-1">
                        {s.entity_type.replace("_", " ")} · v{s.version} · Updated {formatDate(s.updated_at)}
                      </p>

                      {/* Admin feedback for needs_info */}
                      {s.status === "needs_info" && s.admin_feedback && (
                        <div className="mt-2 px-3 py-2 bg-yellow-400/5 border border-yellow-400/20 rounded-lg">
                          <p className="text-xs text-yellow-400"><strong>Admin feedback:</strong> {s.admin_feedback}</p>
                        </div>
                      )}

                      {/* Rejection reason */}
                      {s.status === "rejected" && s.rejection_reason && (
                        <div className="mt-2 px-3 py-2 bg-red-400/5 border border-red-400/20 rounded-lg">
                          <p className="text-xs text-red-400"><strong>Reason:</strong> {s.rejection_reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 shrink-0">
                      {canEdit && (
                        <Link
                          href={`/contribute/${s.entity_type}?edit=${s.id}`}
                          className="p-2 bg-[#21262D] rounded-lg text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
                          title="Edit"
                        >
                          <FileEdit className="h-4 w-4" />
                        </Link>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={deleting === s.id}
                          className="p-2 bg-[#21262D] rounded-lg text-[#8B949E] hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Delete draft"
                        >
                          {deleting === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
