"use client";

import { useEffect, useState } from "react";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";

const KEY = "ea-today-dismissed";

function read(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export default function Dismissible({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (read().has(id)) setHidden(true);
  }, [id]);

  if (hidden) return null;

  function dismiss() {
    const next = read();
    next.add(id);
    window.localStorage.setItem(KEY, JSON.stringify([...next]));
    setHidden(true);
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">{children}</div>
      <button
        type="button"
        onClick={dismiss}
        className={`shrink-0 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-meta)] hover:text-[var(--text-primary)] ${FOCUS_VISIBLE}`}
      >
        Dismiss
      </button>
    </div>
  );
}
