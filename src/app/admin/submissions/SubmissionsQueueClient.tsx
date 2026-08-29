"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, CheckCircle, XCircle, MessageCircle, Shield,
  Waves, Store, User, Home, Compass, Fish, Feather, FileText, Camera,
} from "@/icons";
import { Button } from "@/components/ui/Button";

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
  entity_data?: Record<string, string> | null;
  profiles: { username: string | null; display_name: string | null } | null;
  reviewed_at?: string;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  river: Waves,
  fly_shop: Store,
  guide: User,
  lodge: Home,
  destination: Compass,
  species: Fish,
  fly_pattern: Feather,
  photo_update: Camera,
};

function statusPillCls(status: string): string {
  if (status === "submitted" || status === "in_review") {
    return "bg-[var(--accent-soft)] text-[var(--accent)]";
  }
  return "bg-[var(--warning)]/10 border border-[var(--warning)]/30 text-[var(--warning)]";
}

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
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="max-w-[var(--container)] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors duration-150 ease-standard">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <Shield className="h-5 w-5 text-[var(--accent)]" />
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-1)]">Submissions Queue</h1>
          <span className="ea-badge ml-auto bg-[var(--accent-soft)] text-[var(--accent)]">
            {pending.length} pending
          </span>
        </div>

        {message && (
          <div className={`mb-4 px-4 py-3 rounded-[var(--radius-md)] border text-sm ${
            message.type === "success"
              ? "bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success)]"
              : "bg-[var(--danger)]/10 border-[var(--danger)]/30 text-[var(--danger)]"
          }`}>
            {message.text}
          </div>
        )}

        {/* Pending submissions */}
        {pending.length === 0 ? (
          <div className="ea-card ea-empty">
            <CheckCircle className="h-10 w-10 text-[var(--success)]" />
            <p className="text-[var(--text-1)] font-semibold">Queue is clear!</p>
            <p>No pending submissions to review.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-10">
            {pending.map(s => {
              const isExpanded = expandedId === s.id;
              const submitter = s.profiles?.display_name || s.profiles?.username || s.user_id.slice(0, 8);
              const isLoading = (action: string) => actionLoading === `${s.id}-${action}`;
              const TypeIcon = TYPE_ICONS[s.entity_type] ?? FileText;

              return (
                <div key={s.id} className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                  {/* Main row */}
                  <div className="px-5 py-4 flex items-center gap-3">
                    <span
                      className="h-9 w-9 shrink-0 rounded-[var(--radius-md)] bg-[var(--accent-soft)] flex items-center justify-center"
                      aria-hidden
                    >
                      <TypeIcon className="h-4 w-4 text-[var(--accent)]" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[var(--text-1)] truncate">{s.name}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusPillCls(s.status)}`}>
                          {s.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-3)] mt-0.5">
                        {s.entity_type === "photo_update" ? (
                          <>
                            <span className="text-[var(--accent)] font-medium">PHOTO UPDATE</span>
                            {s.entity_data?.target_entity_type && (
                              <> · updating {s.entity_data.target_entity_type.replace("_", " ")} <span className="text-[var(--text-2)]">{s.entity_data.target_slug}</span></>
                            )}
                          </>
                        ) : (
                          s.entity_type.replace("_", " ")
                        )}
                        {" "}· by {submitter} · {formatDate(s.submitted_at || s.created_at)} · v{s.version}
                        {s.source !== "manual" && ` · via ${s.source.replace("_", " ")}`}
                      </p>
                    </div>

                    {/* Quick actions */}
                    <div className="flex gap-1.5 shrink-0">
                      <Button
                        onClick={() => handleAction(s.id, "approve")}
                        disabled={!!actionLoading}
                        variant="solid"
                        size="sm"
                        icon={CheckCircle}
                        loading={isLoading("approve")}
                        title="Approve"

                      >
                        Approve
                      </Button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        className="p-2 rounded-[var(--radius-md)] text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--paper-deep)] transition-colors duration-150 ease-standard"
                        title="More options"
                      >
                        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-4 border-t border-[var(--border)] pt-4 space-y-3">
                      {s.hero_image_url && (
                        <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--border)]">
                          {/* User-supplied URL — host may not be in next/image allowlist */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.hero_image_url} alt={`${s.name} hero photo`} className="w-full h-40 object-cover" />
                        </div>
                      )}

                      <Link
                        href={`/admin/submissions/${s.id}`}
                        className="text-xs text-[var(--accent)] hover:underline"
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
                          className="ea-input"
                        />
                        <Button
                          onClick={() => handleAction(s.id, "needs_info", { feedback: feedback[s.id] || "" })}
                          disabled={!!actionLoading || !feedback[s.id]?.trim()}
                          variant="outline"
                          size="sm"
                          icon={MessageCircle}
                          loading={isLoading("needs_info")}

                        >
                          Need Info
                        </Button>
                        <Button
                          onClick={() => handleAction(s.id, "reject", { reason: feedback[s.id] || "Does not meet quality standards" })}
                          disabled={!!actionLoading}
                          variant="destructive"
                          size="sm"
                          icon={XCircle}
                          loading={isLoading("reject")}

                        >
                          Reject
                        </Button>
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
            <h2 className="ea-overline mb-3">Recent Decisions</h2>
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
              {recent.map(s => {
                const TypeIcon = TYPE_ICONS[s.entity_type] ?? FileText;
                return (
                  <div key={s.id} className="px-5 py-3 flex items-center gap-3">
                    <TypeIcon className="h-4 w-4 text-[var(--text-3)] shrink-0" />
                    <span className="text-sm text-[var(--text-1)] flex-1 truncate">{s.name}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.status === "approved"
                        ? "bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)]"
                        : "bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)]"
                    }`}>
                      {s.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-[var(--text-3)]">{formatDate(s.reviewed_at || s.updated_at)}</span>
                  </div>
                );
              })}
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
