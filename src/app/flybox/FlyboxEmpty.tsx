"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FirstRunEmpty from "@/app/today/FirstRunEmpty";

export default function FlyboxEmpty() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createBox() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/fly-boxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Working box", tier: "custom" }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error || "Could not create a box");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not create a box");
    } finally {
      setBusy(false);
    }
  }

  return (
    <FirstRunEmpty
      surface="flybox"
      purpose="A box is the list of patterns you carry, not a public inventory."
      actionLabel="Create a box"
      example="The library already has a Pheasant Tail if you want a first card."
      action={
        <button
          type="button"
          data-empty-action
          onClick={createBox}
          disabled={busy}
          className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--accent)] hover:underline disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create a box"}
        </button>
      }
    >
      <p className="mt-4">
        <a
          href="/flies/pheasant-tail"
          className="text-[14px] text-[var(--text-2)] underline decoration-[var(--border)] hover:text-[var(--accent)]"
        >
          Pheasant Tail
        </a>
      </p>
      {error ? (
        <p className="ea-field-error mt-3">{error}</p>
      ) : null}
    </FirstRunEmpty>
  );
}
