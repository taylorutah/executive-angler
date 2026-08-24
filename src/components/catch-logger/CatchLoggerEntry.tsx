"use client";
/**
 * CatchLoggerEntry — banner + button + sheet + undo toast, rendered above
 * the legacy Session detail content. Handles picking the active fly box,
 * opening the CatchLogger sheet, and showing the Undo toast on success.
 */
import { useState, useTransition } from "react";
import { Box, Plus } from "lucide-react";
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
    <div className="rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] p-3 sm:p-4 mb-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 flex-shrink-0 rounded bg-[var(--surface-page)] flex items-center justify-center">
            <Box className="h-4 w-4 text-[var(--signal-live)]" />
          </div>
          <div className="min-w-0">
            <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-widest text-[var(--text-meta)]">
              Active box
            </p>
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              className="text-[var(--text-primary)] text-sm font-medium truncate hover:text-[var(--action)] transition-colors"
            >
              {activeBoxName ?? "Pick a box…"}
              <span className="ml-1 text-[var(--text-meta)] text-xs">change</span>
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={!activeBoxId || activeBoxVariants.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md bg-[var(--action)] px-3 py-2 text-sm font-medium text-white hover:bg-[#d17d28] transition-colors disabled:bg-[var(--surface-card)] disabled:text-[var(--text-meta)] disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" /> Log catch
        </button>
      </div>

      {pickerOpen && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-[var(--border-rule)] pt-3">
          {myBoxes.length === 0 ? (
            <p className="text-xs text-[var(--text-meta)]">No boxes yet. Add variants on a Pattern detail page first.</p>
          ) : (
            myBoxes.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => pickBox(b.id)}
                disabled={pending}
                className={`text-left rounded-md border px-3 py-2 transition-colors ${
                  b.id === activeBoxId
                    ? "border-[var(--action)] bg-[var(--action)]/10"
                    : "border-[var(--border-strong)] bg-[var(--surface-page)] hover:border-[var(--text-meta)]"
                }`}
              >
                <p className="text-[var(--text-primary)] text-sm font-medium truncate">
                  {b.name}
                  {b.is_default && (
                    <span className="ml-2 rounded bg-[var(--signal-live)]/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-[var(--signal-live)]">
                      Default
                    </span>
                  )}
                </p>
                <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-widest text-[var(--text-meta)]">
                  {b.tier}
                </p>
              </button>
            ))
          )}
        </div>
      )}

      {activeBoxId && activeBoxVariants.length === 0 && !pickerOpen && (
        <p className="mt-2 text-xs text-[var(--text-meta)]">
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
