"use client";
/**
 * CatchLoggerEntry — banner + button + sheet, rendered above the legacy
 * Session detail content. Handles picking the active fly box and opening
 * the CatchLogger sheet.
 */
import { useState, useTransition } from "react";
import { Box, Plus } from "lucide-react";
import CatchLogger from "@/components/catch-logger/CatchLogger";
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
  const [pending, startTransition] = useTransition();

  const pickBox = (boxId: string) => {
    startTransition(async () => {
      await setActiveBoxAction({ session_id: sessionId, box_id: boxId });
      setPickerOpen(false);
    });
  };

  return (
    <div className="rounded-lg border border-[#21262D] bg-[#161B22] p-3 sm:p-4 mb-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 flex-shrink-0 rounded bg-[#0D1117] flex items-center justify-center">
            <Box className="h-4 w-4 text-[#0BA5C7]" />
          </div>
          <div className="min-w-0">
            <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-widest text-[#6E7681]">
              Active box
            </p>
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              className="text-[#F0F6FC] text-sm font-medium truncate hover:text-[#E8923A] transition-colors"
            >
              {activeBoxName ?? "Pick a box…"}
              <span className="ml-1 text-[#6E7681] text-xs">change</span>
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={!activeBoxId || activeBoxVariants.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#E8923A] px-3 py-2 text-sm font-medium text-white hover:bg-[#d17d28] transition-colors disabled:bg-[#1F2937] disabled:text-[#6E7681] disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" /> Log catch
        </button>
      </div>

      {pickerOpen && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-[#21262D] pt-3">
          {myBoxes.length === 0 ? (
            <p className="text-xs text-[#6E7681]">No boxes yet. Add variants on a Pattern detail page first.</p>
          ) : (
            myBoxes.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => pickBox(b.id)}
                disabled={pending}
                className={`text-left rounded-md border px-3 py-2 transition-colors ${
                  b.id === activeBoxId
                    ? "border-[#E8923A] bg-[#E8923A]/10"
                    : "border-[#30363D] bg-[#0D1117] hover:border-[#6E7681]"
                }`}
              >
                <p className="text-[#F0F6FC] text-sm font-medium truncate">
                  {b.name}
                  {b.is_default && (
                    <span className="ml-2 rounded bg-[#0BA5C7]/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-[#0BA5C7]">
                      Default
                    </span>
                  )}
                </p>
                <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-widest text-[#6E7681]">
                  {b.tier}
                </p>
              </button>
            ))
          )}
        </div>
      )}

      {activeBoxId && activeBoxVariants.length === 0 && !pickerOpen && (
        <p className="mt-2 text-xs text-[#6E7681]">
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
      />
    </div>
  );
}
