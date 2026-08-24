"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
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

  const accent =
    tone === "premium"
      ? "from-[var(--action)]/15 to-[var(--signal-live)]/10 border-[var(--action)]/30"
      : "from-[var(--signal-live)]/10 to-[var(--signal-live)]/5 border-[var(--signal-live)]/25";

  const iconColor = tone === "premium" ? "text-[var(--action)]" : "text-[var(--signal-live)]";

  return (
    <div
      className={`relative rounded-xl border bg-gradient-to-br ${accent} p-4 pr-10`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${iconColor}`}>
          <Sparkles size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-sm font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
          <div className="mt-1 text-sm text-[var(--text-body)] leading-relaxed space-y-1.5">
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
        className="absolute top-3 right-3 p-1 rounded text-[var(--text-meta)] hover:text-[var(--text-primary)] hover:bg-[var(--border-rule)] transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
