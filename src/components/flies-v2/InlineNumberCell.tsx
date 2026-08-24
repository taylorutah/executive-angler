"use client";
/**
 * Inline-editable numeric cell for the Variant table.
 *
 * Click to edit, type new value, blur or Enter to save. Esc to cancel.
 * Optimistic update so the cell reflects the edit immediately;
 * on error, reverts and shows a brief flash.
 */
import { useEffect, useRef, useState, useTransition } from "react";

interface Props {
  value: number;
  onSave: (next: number) => Promise<{ ok: boolean; error?: string }>;
  /** Faded text when value is 0 (matches existing cell style). */
  fadeZero?: boolean;
  /** Tooltip on hover (helps when value is 0 and meaning isn't obvious). */
  title?: string;
  /** Right-align numerics. */
  align?: "left" | "right" | "center";
}

export default function InlineNumberCell({
  value,
  onSave,
  fadeZero = true,
  title,
  align = "right",
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value.toString());
  const [optimistic, setOptimistic] = useState(value);
  const [flash, setFlash] = useState<"none" | "saved" | "error">("none");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => { setOptimistic(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    const n = parseInt(draft, 10);
    if (Number.isNaN(n) || n < 0) {
      setEditing(false);
      setDraft(optimistic.toString());
      return;
    }
    if (n === optimistic) {
      setEditing(false);
      return;
    }
    const previous = optimistic;
    setOptimistic(n);
    setEditing(false);
    startTransition(async () => {
      const r = await onSave(n);
      if (!r.ok) {
        setOptimistic(previous);
        setFlash("error");
        setTimeout(() => setFlash("none"), 1500);
      } else {
        setFlash("saved");
        setTimeout(() => setFlash("none"), 800);
      }
    });
  };

  const cancel = () => {
    setEditing(false);
    setDraft(optimistic.toString());
  };

  const alignClass =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  const flashClass =
    flash === "saved" ? "ring-1 ring-[var(--state-positive)]/50 bg-[rgba(46,164,79,0.05)]" :
    flash === "error" ? "ring-1 ring-[#F87171]/50 bg-[rgba(248,113,113,0.05)]" : "";

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={0}
        step={1}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          else if (e.key === "Escape") cancel();
        }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full bg-[var(--surface-page)] border border-[var(--action)] rounded px-1 py-0 ${alignClass} font-['IBM_Plex_Mono'] text-[13px] text-[var(--text-primary)] outline-none`}
      />
    );
  }

  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        setDraft(optimistic.toString());
        setEditing(true);
      }}
      disabled={isPending}
      className={`w-full ${alignClass} px-1 py-0 rounded transition-all hover:bg-[rgba(255,255,255,0.05)] ${flashClass} ${isPending ? "opacity-60" : ""}`}
    >
      <span
        className={
          fadeZero && optimistic === 0
            ? "text-[#484F58]"
            : "text-[var(--text-primary)]"
        }
      >
        {optimistic}
      </span>
    </button>
  );
}
