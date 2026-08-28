"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "@/icons";
import type { ReactNode } from "react";

/**
 * Dismissible, localStorage-backed tip card. Use for empty-state guidance
 * and first-time explainers on a surface (workbench tab, insights page,
 * trophy wall, etc).
 *
 * <TipCard storageKey="workbench-intro" title="New to the Workbench?">
 *   Add materials you own → browse the library → see What Can I Tie.
 * </TipCard>
 */
export default function TipCard({
  storageKey,
  title,
  children,
  tone = "default",
}: {
  /** Unique key (persisted to localStorage as `tip:${key}`) */
  storageKey: string;
  title: string;
  children: ReactNode;
  tone?: "default" | "premium";
}) {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(`tip:${storageKey}`) === "1");
    } catch {
      setDismissed(false);
    }
  }, [storageKey]);

  if (dismissed !== false) return null;

  // Flat tint panel — gradients are banned (DESIGN.md §8). `tone` is kept for
  // API compatibility; both tones render the same lawful surface.
  void tone;

  return (
    <div
      className="relative rounded-card border border-[var(--border)] bg-[var(--paper-deep)] p-4 pr-12"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-[var(--accent)]">
          <Sparkles size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm font-semibold text-[var(--text-1)]">
            {title}
          </h3>
          <div className="mt-1 text-sm text-[var(--text-2)] leading-relaxed space-y-2">
            {children}
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label="Dismiss tip"
        onClick={() => {
          try {
            localStorage.setItem(`tip:${storageKey}`, "1");
          } catch {}
          setDismissed(true);
        }}
        className="absolute top-3 right-3 rounded-instrument p-2 text-[var(--text-3)] transition-colors hover:bg-[var(--border)] hover:text-[var(--text-1)]"
      >
        <X size={16} />
      </button>
    </div>
  );
}
