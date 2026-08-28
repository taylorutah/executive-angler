"use client";

import { useState } from "react";

export default function RiverAlertToggle({
  riverId,
  initialOn,
}: {
  riverId: string;
  initialOn: boolean;
}) {
  const [on, setOn] = useState(initialOn);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const next = !on;
    setOn(next);
    try {
      const res = await fetch(
        next ? "/api/river-alerts/subscribe" : "/api/river-alerts/unsubscribe",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ riverId }),
        },
      );
      if (!res.ok) setOn(!next);
    } catch {
      setOn(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={on ? "Turn off water alerts" : "Turn on water alerts"}
      disabled={busy}
      onClick={toggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-[var(--radius-md)] transition-colors duration-150 ease-standard ${
        on ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-[var(--radius-sm)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-transform duration-150 ease-standard ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
