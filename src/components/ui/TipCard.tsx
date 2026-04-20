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
      ? "from-[#E8923A]/15 to-[#00B4D8]/10 border-[#E8923A]/30"
      : "from-[#00B4D8]/10 to-[#00B4D8]/5 border-[#00B4D8]/25";

  const iconColor = tone === "premium" ? "text-[#E8923A]" : "text-[#00B4D8]";

  return (
    <div
      className={`relative rounded-xl border bg-gradient-to-br ${accent} p-4 pr-10`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${iconColor}`}>
          <Sparkles size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-sm font-semibold text-[#F0F6FC]">
            {title}
          </h3>
          <div className="mt-1 text-sm text-[#A8B2BD] leading-relaxed space-y-1.5">
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
        className="absolute top-3 right-3 p-1 rounded text-[#6E7681] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
