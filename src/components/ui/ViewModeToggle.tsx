"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Rows3 } from "lucide-react";

export type ViewMode = "grid" | "table";

interface ViewModeToggleProps {
  /** Persistence key — usually "flies:view:<tab>" so each tab remembers separately. */
  storageKey: string;
  defaultMode?: ViewMode;
  onChange?: (mode: ViewMode) => void;
  className?: string;
}

/**
 * Two-button segmented control for swapping a tab between dense Grid and
 * Table views. Persists per-key to localStorage so a user's preference
 * sticks across reloads. Hydration-safe — initial render matches server,
 * then upgrades from storage on mount.
 */
export default function ViewModeToggle({
  storageKey,
  defaultMode = "grid",
  onChange,
  className,
}: ViewModeToggleProps) {
  const [mode, setMode] = useState<ViewMode>(defaultMode);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === "grid" || stored === "table") {
        setMode(stored);
        onChange?.(stored);
      }
    } catch {
      // localStorage unavailable — keep default.
    }
    // intentionally only on mount; storageKey is treated as stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (next: ViewMode) => {
    setMode(next);
    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      /* ignore */
    }
    onChange?.(next);
  };

  return (
    <div
      className={[
        "inline-flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5 text-xs",
        className ?? "",
      ].join(" ")}
      role="group"
      aria-label="View mode"
    >
      <button
        type="button"
        onClick={() => set("grid")}
        aria-pressed={mode === "grid"}
        className={[
          "inline-flex items-center gap-1 rounded px-2 py-1 transition-colors",
          mode === "grid"
            ? "bg-[#E8923A] text-white"
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
        ].join(" ")}
      >
        <LayoutGrid size={14} />
        <span>Grid</span>
      </button>
      <button
        type="button"
        onClick={() => set("table")}
        aria-pressed={mode === "table"}
        className={[
          "inline-flex items-center gap-1 rounded px-2 py-1 transition-colors",
          mode === "table"
            ? "bg-[#E8923A] text-white"
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
        ].join(" ")}
      >
        <Rows3 size={14} />
        <span>Table</span>
      </button>
    </div>
  );
}
