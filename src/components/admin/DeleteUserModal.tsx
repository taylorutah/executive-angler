"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X } from "@/icons";

interface Props {
  userId: string;
  username: string | null;
  displayName: string | null;
  email: string | null;
  sessionCount: number;
  catchCount: number;
  flyBoxCount: number;
  photoCount: number;
  onCancel: () => void;
  onDeleted: (userId: string) => void;
}

export default function DeleteUserModal({
  userId,
  username,
  displayName,
  email,
  sessionCount,
  catchCount,
  flyBoxCount,
  photoCount,
  onCancel,
  onDeleted,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Delete failed");
        setLoading(false);
        return;
      }
      onDeleted(userId);
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div
      className="ea-modal-overlay z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="ea-modal max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--danger)]/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-[var(--danger)]" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-[var(--text-1)]">Delete user permanently?</h2>
              <p className="text-xs text-[var(--text-2)] mt-0.5">
                {displayName || username || "No name"}
                {username && ` · @${username}`}
                {email && ` · ${email}`}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors duration-150 ease-standard shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-[var(--radius-md)] p-4 mb-4">
          <p className="ea-overline text-[var(--danger)] mb-2">
            This cannot be undone
          </p>
          <p className="text-xs text-[var(--text-2)] mb-2">The following will be deleted:</p>
          <ul className="text-xs text-[var(--text-2)] space-y-0.5 list-disc list-inside">
            <li>{sessionCount} fishing session{sessionCount === 1 ? "" : "s"}</li>
            <li>{catchCount} catch{catchCount === 1 ? "" : "es"}</li>
            <li>{flyBoxCount} fly pattern{flyBoxCount === 1 ? "" : "s"}</li>
            <li>{photoCount} photo{photoCount === 1 ? "" : "s"} (storage objects)</li>
            <li>Follows, kudos, comments, messages, awards</li>
            <li>Profile, device tokens, favorites</li>
            <li>The auth.users record itself</li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-[var(--radius-md)] text-xs text-[var(--danger)]">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="ea-btn ea-btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            autoFocus
            className="ea-btn ea-btn-danger"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Deleting..." : "Delete user"}
          </button>
        </div>
      </div>
    </div>
  );
}
