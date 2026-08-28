"use client";
/**
 * CatchLoggerEntry — banner + button + sheet + undo toast, rendered above
 * the legacy Session detail content. Handles picking the active fly box,
 * opening the CatchLogger sheet, and showing the Undo toast on success.
 */
import { useState, useTransition } from "react";
import { Box, Plus } from "@/icons";
import CatchLogger from "@/components/catch-logger/CatchLogger";
import UndoToast, { type UndoToastInfo } from "@/components/catch-logger/UndoToast";
import type { VariantRow } from "@/types/fly-v2";
import { setActiveBoxAction } from "@/app/journal/[id]/actions";

export interface CatchLoggerEntryProps {
  sessionId: string;
  /** All boxes the user owns (for the picker). */
  myBoxes: { id: string; name: string; tier: string; is_default: boolean }[];
  activeBoxId: string | null;
  activeBoxName: string | null;
  activeBoxVariants: VariantRow[];
  lastCatch?: {
    variant_id: string | null;
    fly_name: string | null;
    fly_size: string | null;
    species: string | null;
    length_inches: number | null;
  } | null;
  defaultSpecies?: string;
}

export default function CatchLoggerEntry({
  sessionId,
  myBoxes,
  activeBoxId,
  activeBoxName,
  activeBoxVariants,
  lastCatch,
  defaultSpecies,
}: CatchLoggerEntryProps) {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [toast, setToast] = useState<UndoToastInfo | null>(null);
  const [pending, startTransition] = useTransition();

  const pickBox = (boxId: string) => {
    startTransition(async () => {
      await setActiveBoxAction({ session_id: sessionId, box_id: boxId });
      setPickerOpen(false);
    });
  };

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 mb-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 flex-shrink-0 rounded-[var(--radius-md)] bg-[var(--paper-deep)] flex items-center justify-center">
            <Box className="h-4 w-4 text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <p className="ea-overline">
              Active box
            </p>
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              className="text-[var(--text-1)] text-sm font-medium truncate hover:text-[var(--accent)] transition-colors"
            >
              {activeBoxName ?? "Pick a box…"}
              <span className="ml-1 text-[var(--text-3)] text-xs">change</span>
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={!activeBoxId || activeBoxVariants.length === 0}
          className="ea-btn ea-btn-primary ea-btn-sm"
        >
          <Plus className="h-4 w-4" /> Log catch
        </button>
      </div>

      {pickerOpen && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-[var(--border)] pt-3">
          {myBoxes.length === 0 ? (
            <p className="text-xs text-[var(--text-3)]">No boxes yet. Add variants on a Pattern detail page first.</p>
          ) : (
            myBoxes.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => pickBox(b.id)}
                disabled={pending}
                className={`text-left rounded-[var(--radius-md)] border px-3 py-2 transition-colors ${
                  b.id === activeBoxId
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
                }`}
              >
                <p className="text-[var(--text-1)] text-sm font-medium truncate">
                  {b.name}
                  {b.is_default && (
                    <span className="ea-badge ml-2">
                      Default
                    </span>
                  )}
                </p>
                <p className="ea-overline mt-0.5">
                  {b.tier}
                </p>
              </button>
            ))
          )}
        </div>
      )}

      {activeBoxId && activeBoxVariants.length === 0 && !pickerOpen && (
        <p className="mt-2 text-xs text-[var(--text-3)]">
          This box is empty. Pick another box above, or add variants from a Pattern detail page.
        </p>
      )}

      <CatchLogger
        sessionId={sessionId}
        activeBoxVariants={activeBoxVariants}
        activeBoxName={activeBoxName}
        lastCatch={lastCatch}
        defaultSpecies={defaultSpecies}
        open={open}
        onClose={() => setOpen(false)}
        onLogged={(info) => setToast(info)}
      />

      <UndoToast sessionId={sessionId} info={toast} onDone={() => setToast(null)} />
    </div>
  );
}
