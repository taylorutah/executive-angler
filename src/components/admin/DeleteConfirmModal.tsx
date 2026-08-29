"use client";

import { AlertTriangle, Loader2 } from "@/icons";

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
      className="ea-modal-overlay z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="ea-modal max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          {/* Icon + message */}
          <div className="flex items-start gap-3">
            <div className="shrink-0 p-2 bg-[var(--danger)]/10 rounded-[var(--radius-md)]">
              <AlertTriangle className="h-5 w-5 text-[var(--danger)]" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-[var(--text-1)]">
                Delete Confirmation
              </h3>
              <p className="mt-1 text-sm text-[var(--text-2)]">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[var(--text-1)]">{entityName}</span>?
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
              className="ea-btn ea-btn-danger flex-1"
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
              className="ea-btn ea-btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
