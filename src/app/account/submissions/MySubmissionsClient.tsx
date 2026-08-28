"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, CheckCircle, XCircle, AlertCircle,
  Send, FileEdit, Eye, Trash2, Loader2, Shield,
  Waves, Store, User, Home, Compass, Fish, Feather, FileText,
} from "@/icons";

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

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  draft: { label: "Draft", icon: <FileEdit className="h-3.5 w-3.5" />, cls: "bg-[var(--paper-deep)] text-[var(--text-2)]" },
  submitted: { label: "Submitted", icon: <Send className="h-3.5 w-3.5" />, cls: "bg-[var(--accent-soft)] text-[var(--accent)]" },
  in_review: { label: "In Review", icon: <Eye className="h-3.5 w-3.5" />, cls: "bg-[var(--accent-soft)] text-[var(--accent)]" },
  needs_info: { label: "Needs Info", icon: <AlertCircle className="h-3.5 w-3.5" />, cls: "bg-[var(--warning)]/10 border border-[var(--warning)]/30 text-[var(--warning)]" },
  approved: { label: "Approved", icon: <CheckCircle className="h-3.5 w-3.5" />, cls: "bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)]" },
  rejected: { label: "Rejected", icon: <XCircle className="h-3.5 w-3.5" />, cls: "bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)]" },
  published: { label: "Published", icon: <CheckCircle className="h-3.5 w-3.5" />, cls: "bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)]" },
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  river: Waves,
  fly_shop: Store,
  guide: User,
  lodge: Home,
  destination: Compass,
  species: Fish,
  fly_pattern: Feather,
};

const TRUST_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "New Contributor", color: "text-[var(--text-2)]" },
  contributor: { label: "Contributor", color: "text-[var(--accent)]" },
  trusted: { label: "Trusted Contributor", color: "text-[var(--success)]" },
  verified: { label: "Verified", color: "text-[var(--accent)]" },
  moderator: { label: "Moderator", color: "text-[var(--text-1)]" },
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
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Header bar — mirrors Gear Locker */}
      <div className="border-b border-[var(--border)]">
        <div className="max-w-[var(--container)] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-2)] hover:text-[var(--accent)] transition-colors duration-150 ease-standard mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Account
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-1)]">My Submissions</h1>
            </div>
            <Link href="/contribute" className="ea-btn ea-btn-primary ea-btn-sm shrink-0">
              <Plus className="h-4 w-4" />
              New Submission
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[var(--container)] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
        {/* Contributor stats */}
        <div className="ea-card mb-6">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--accent-soft)] flex items-center justify-center shrink-0" aria-hidden>
              <Shield className="h-4 w-4 text-[var(--accent)]" />
            </span>
            <div>
              <p className={`text-sm font-semibold ${trustInfo.color}`}>{trustInfo.label}</p>
              <p className="text-xs text-[var(--text-3)] num">
                {stats.submissions_approved} approved · {stats.submissions_rejected} rejected · {stats.submissions_total} total
              </p>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-4">
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
              aria-pressed={filter === tab.key}
              className={`rounded-[var(--radius-pill)] border px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 ease-standard ${
                filter === tab.key
                  ? "border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--border-strong)] hover:text-[var(--text-1)]"
              }`}
            >
              {tab.label}
              {tab.key !== "all" && (
                <span className="ml-1 opacity-60 num">
                  {submissions.filter(s => s.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Submissions list */}
        {filtered.length === 0 ? (
          <div className="ea-card p-12 text-center">
            <p className="text-sm text-[var(--text-2)] mb-3">
              {filter === "all" ? "No submissions yet" : `No ${filter} submissions`}
            </p>
            <Link href="/contribute" className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-150 ease-standard">
              Start contributing →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => {
              const statusCfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.draft;
              const TypeIcon = TYPE_ICONS[s.entity_type] || FileText;
              const canEdit = ["draft", "needs_info", "rejected"].includes(s.status);
              const canDelete = s.status === "draft";

              return (
                <div key={s.id} className="ea-card card-hover p-4">
                  <div className="flex items-start gap-3">
                    {/* Entity type mark */}
                    <span className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--accent-soft)] flex items-center justify-center shrink-0 mt-0.5" aria-hidden>
                      <TypeIcon className="h-4 w-4 text-[var(--accent)]" />
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-[var(--text-1)]">{s.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-pill)] text-xs font-medium ${statusCfg.cls}`}>
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-3)] mt-1">
                        {s.entity_type.replace("_", " ")} · v{s.version} · Updated {formatDate(s.updated_at)}
                      </p>

                      {/* Admin feedback for needs_info */}
                      {s.status === "needs_info" && s.admin_feedback && (
                        <div className="mt-2 px-3 py-2 bg-[var(--warning)]/10 border border-[var(--warning)]/30 rounded-[var(--radius-md)]">
                          <p className="text-xs text-[var(--warning)]"><strong>Admin feedback:</strong> {s.admin_feedback}</p>
                        </div>
                      )}

                      {/* Rejection reason */}
                      {s.status === "rejected" && s.rejection_reason && (
                        <div className="mt-2 px-3 py-2 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-[var(--radius-md)]">
                          <p className="text-xs text-[var(--danger)]"><strong>Reason:</strong> {s.rejection_reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0">
                      {canEdit && (
                        <Link
                          href={`/contribute/${s.entity_type}?edit=${s.id}`}
                          className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-3)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors duration-150 ease-standard"
                          title="Edit"
                        >
                          <FileEdit className="h-4 w-4" />
                        </Link>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={deleting === s.id}
                          className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-3)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors duration-150 ease-standard disabled:opacity-50"
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
