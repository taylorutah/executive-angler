"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  entityName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  entityName,
  onConfirm,
  onCancel,
  loading,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-2xl max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 space-y-4">
          {/* Icon + message */}
          <div className="flex items-start gap-3">
            <div className="shrink-0 p-2 bg-red-950/40 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Delete Confirmation
              </h3>
              <p className="mt-1 text-sm text-[var(--text-body)]">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[var(--text-primary)]">{entityName}</span>?
                This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Deleting..." : "Delete"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[var(--border-rule)] text-[var(--text-body)] rounded-lg text-sm font-semibold hover:bg-[#2D333B] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
