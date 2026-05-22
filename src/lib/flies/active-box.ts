"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Active fly box for the catch-logging picker. Persisted to localStorage so
 * the choice carries across sessions, mirroring the iOS FlyBoxStore key.
 *
 * `null` means "All Flies" (no box scoping). The hook is SSR-safe — the
 * initial render is always `null` and the persisted value rehydrates after
 * mount to avoid hydration mismatches.
 */
const STORAGE_KEY = "ea_active_fly_box_id";

export function useActiveBox(): {
  activeBoxId: string | null;
  setActiveBoxId: (id: string | null) => void;
} {
  const [activeBoxId, setActiveBoxIdState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setActiveBoxIdState(stored);
    } catch {
      // localStorage unavailable (private mode, SSR) — stay on All Flies.
    }
  }, []);

  const setActiveBoxId = useCallback((id: string | null) => {
    setActiveBoxIdState(id);
    try {
      if (id) window.localStorage.setItem(STORAGE_KEY, id);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { activeBoxId, setActiveBoxId };
}
