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
          className="font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--action)] hover:underline disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create a box"}
        </button>
      }
    >
      <p className="mt-4">
        <a
          href="/flies/pheasant-tail"
          className="text-[15px] text-[var(--text-body)] underline decoration-[var(--border-rule)] hover:text-[var(--action)]"
        >
          Pheasant Tail
        </a>
      </p>
      {error ? (
        <p className="mt-3 text-[13px] text-[var(--text-meta)]">{error}</p>
      ) : null}
    </FirstRunEmpty>
  );
}
