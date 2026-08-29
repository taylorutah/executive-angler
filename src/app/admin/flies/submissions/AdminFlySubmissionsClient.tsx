"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "@/icons";
import { Button } from "@/components/ui/Button";

type Status = "pending" | "approved" | "rejected" | "needs_info";

interface Submission {
  id: string;
  user_id: string;
  source_pattern_id: string | null;
  parent_canonical_id: string | null;
  name: string;
  category: string | null;
  description: string | null;
  tying_steps: unknown;
  materials_list: unknown;
  sizes: string[] | null;
  colors: string[] | null;
  bead_options: string[] | null;
  hero_image_url: string | null;
  video_url: string | null;
  status: Status;
  admin_notes: string | null;
  reviewed_at: string | null;
  promoted_canonical_id: string | null;
  created_at: string;
  submitter: { username: string | null; display_name: string | null } | null;
}

const TABS: { key: Status; label: string; icon: typeof Clock }[] = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "needs_info", label: "Needs Info", icon: AlertCircle },
  { key: "approved", label: "Approved", icon: CheckCircle },
  { key: "rejected", label: "Rejected", icon: XCircle },
];

export default function AdminFlySubmissionsClient() {
  const [tab, setTab] = useState<Status>("pending");
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/flies/submissions?status=${tab}`);
      const json = await res.json();
      setRows(json.submissions ?? []);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: "approve" | "reject" | "needs_info") {
    setActingId(id);
    try {
      const res = await fetch("/api/admin/flies/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, admin_notes: notesById[id] || null }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(`Action failed: ${json.error ?? "unknown"}`);
        return;
      }
      await load();
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--text-1)]">
      <div className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-3">
          <Link
            href="/admin"
            className="text-sm text-[var(--text-2)] hover:text-[var(--text-1)] flex items-center gap-1.5 transition-colors duration-150 ease-standard"
          >
            <ArrowLeft className="w-4 h-4" /> Admin
          </Link>
          <span className="text-[var(--text-3)]">/</span>
          <h1 className="font-display text-xl font-semibold text-[var(--text-1)]">Fly Submissions</h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-2 rounded-[var(--radius-pill)] border px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 ease-standard ${
                  isActive
                    ? "border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--border-strong)] hover:text-[var(--text-1)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
          </div>
        ) : rows.length === 0 ? (
          <div className="ea-card ea-empty">
            <p>No {tab.replace("_", " ")} submissions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((sub) => (
              <div
                key={sub.id}
                className="ea-card flex gap-5"
              >
                {sub.hero_image_url ? (
                  <div className="relative w-32 h-32 flex-shrink-0 rounded-[var(--radius-md)] overflow-hidden bg-[var(--paper-deep)]">
                    <Image
                      src={sub.hero_image_url}
                      alt={sub.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 flex-shrink-0 rounded-[var(--radius-md)] bg-[var(--paper-deep)] flex items-center justify-center text-[var(--text-3)] text-xs">
                    no photo
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold leading-tight text-[var(--text-1)]">{sub.name}</h3>
                      <div className="text-xs text-[var(--text-3)] mt-0.5">
                        {sub.category ?? "uncategorized"}
                        {sub.parent_canonical_id && " · variant of canonical fly"}
                      </div>
                      <div className="text-xs text-[var(--text-3)] mt-0.5">
                        by {sub.submitter?.display_name ?? sub.submitter?.username ?? "unknown"}
                        {" · "}
                        {new Date(sub.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {sub.promoted_canonical_id && (
                      <Link
                        href={`/flies/${sub.promoted_canonical_id}`}
                        className="text-xs text-[var(--accent)] hover:underline"
                      >
                        view canonical →
                      </Link>
                    )}
                  </div>

                  {sub.description && (
                    <p className="text-sm text-[var(--text-2)] mt-2 line-clamp-3">{sub.description}</p>
                  )}

                  <div className="text-xs text-[var(--text-3)] mt-2 flex flex-wrap gap-3">
                    {sub.sizes?.length ? <span>sizes: {sub.sizes.join(", ")}</span> : null}
                    {sub.colors?.length ? <span>colors: {sub.colors.join(", ")}</span> : null}
                    {sub.bead_options?.length ? (
                      <span>beads: {sub.bead_options.join(", ")}</span>
                    ) : null}
                  </div>

                  {sub.admin_notes && (
                    <div className="text-xs text-[var(--text-2)] mt-2 italic">
                      admin notes: {sub.admin_notes}
                    </div>
                  )}

                  {(tab === "pending" || tab === "needs_info") && (
                    <div className="mt-4 space-y-2">
                      <textarea
                        placeholder="Admin notes (optional, sent to submitter on reject/needs-info)…"
                        value={notesById[sub.id] ?? ""}
                        onChange={(e) =>
                          setNotesById((m) => ({ ...m, [sub.id]: e.target.value }))
                        }
                        rows={2}
                        className="ea-input"
                      />
                      <div className="flex gap-2">
                        <Button
                          disabled={actingId === sub.id}
                          onClick={() => act(sub.id, "approve")}
                          variant="brand"
                          size="sm"
                          icon={CheckCircle}
                          loading={actingId === sub.id}
                        >
                          Approve → canonical
                        </Button>
                        <Button
                          disabled={actingId === sub.id}
                          onClick={() => act(sub.id, "needs_info")}
                          variant="outline"
                          size="sm"
                          icon={AlertCircle}
                         
                        >
                          Needs Info
                        </Button>
                        <Button
                          disabled={actingId === sub.id}
                          onClick={() => act(sub.id, "reject")}
                          variant="destructive"
                          size="sm"
                          icon={XCircle}
                         
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
