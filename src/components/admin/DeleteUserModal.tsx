"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

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
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Require typing the username if present, otherwise "DELETE".
  const requiredText = username || "DELETE";
  const canDelete = confirmText.trim() === requiredText && !loading;

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="bg-[#161B22] border border-red-900/50 rounded-2xl shadow-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-950/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F0F6FC]">Delete user permanently?</h2>
              <p className="text-xs text-[#A8B2BD] mt-0.5">
                {displayName || username || "No name"}
                {username && ` · @${username}`}
                {email && ` · ${email}`}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-[#6E7681] hover:text-[#F0F6FC] shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-red-950/15 border border-red-900/40 rounded-lg p-4 mb-4">
          <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-2">
            This cannot be undone
          </p>
          <p className="text-xs text-[#A8B2BD] mb-2">The following will be deleted:</p>
          <ul className="text-xs text-[#A8B2BD] space-y-0.5 list-disc list-inside">
            <li>{sessionCount} fishing session{sessionCount === 1 ? "" : "s"}</li>
            <li>{catchCount} catch{catchCount === 1 ? "" : "es"}</li>
            <li>{flyBoxCount} fly pattern{flyBoxCount === 1 ? "" : "s"}</li>
            <li>{photoCount} photo{photoCount === 1 ? "" : "s"} (storage objects)</li>
            <li>Follows, kudos, comments, messages, awards</li>
            <li>Profile, device tokens, favorites</li>
            <li>The auth.users record itself</li>
          </ul>
        </div>

        <label className="block mb-4">
          <span className="text-xs text-[#A8B2BD]">
            Type <code className="text-[#E8923A] font-mono">{requiredText}</code> to confirm
          </span>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={requiredText}
            autoFocus
            className="mt-1 w-full px-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] font-mono placeholder-[#6E7681] focus:outline-none focus:border-red-400"
          />
        </label>

        {error && (
          <div className="mb-4 px-3 py-2 bg-red-950/30 border border-red-800 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-[#21262D] text-[#A8B2BD] rounded-lg text-sm font-bold hover:text-[#F0F6FC] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Deleting..." : "Delete user"}
          </button>
        </div>
      </div>
    </div>
  );
}
