"use client";

import { useEffect, useRef, useState } from "react";
import type { FlyBoxEntry } from "@/lib/db/fly-patterns";

type TieNextStatus = "none" | "wanted" | "at_vise" | "done";

/**
 * Debounced numeric stepper for table cells (In Box / Target). Optimistically
 * updates local state, then PATCHes /api/fly-box. On HTTP error the value
 * snaps back and an aria-live message is set so screen readers catch it.
 */
export function NumericCell({
  entryId,
  field,
  value,
  min = 0,
}: {
  entryId: string;
  field: "tied_count" | "target_count";
  value: number;
  min?: number;
}) {
  const [local, setLocal] = useState(value);
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const lastCommittedRef = useRef(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocal(value);
    lastCommittedRef.current = value;
  }, [value]);

  function commit(next: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setPending(true);
      try {
        const res = await fetch(`/api/fly-box?id=${entryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: next }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }
        lastCommittedRef.current = next;
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "Save failed");
        setLocal(lastCommittedRef.current);
      } finally {
        setPending(false);
      }
    }, 200);
  }

  function bump(delta: number) {
    const next = Math.max(min, local + delta);
    setLocal(next);
    commit(next);
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => bump(-1)}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] px-1"
        aria-label="Decrement"
      >
        −
      </button>
      <span
        className={[
          "min-w-[2ch] text-right tabular-nums font-[var(--font-mono)]",
          pending ? "opacity-60" : "",
        ].join(" ")}
      >
        {local}
      </span>
      <button
        type="button"
        onClick={() => bump(1)}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] px-1"
        aria-label="Increment"
      >
        +
      </button>
      {errorMsg ? (
        <span role="alert" className="sr-only">
          {errorMsg}
        </span>
      ) : null}
    </div>
  );
}

const STATUS_OPTIONS: { value: TieNextStatus; label: string }[] = [
  { value: "none", label: "—" },
  { value: "wanted", label: "Wanted" },
  { value: "at_vise", label: "At vise" },
  { value: "done", label: "Done" },
];

export function TieNextCell({
  entry,
}: {
  entry: Pick<FlyBoxEntry, "id" | "tie_next_status">;
}) {
  const [value, setValue] = useState<TieNextStatus>(
    (entry.tie_next_status ?? "none") as TieNextStatus,
  );
  const [pending, setPending] = useState(false);

  async function handleChange(next: TieNextStatus) {
    const prev = value;
    setValue(next);
    setPending(true);
    try {
      const res = await fetch(`/api/fly-box?id=${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tie_next_status: next }),
      });
      if (!res.ok) {
        setValue(prev);
      }
    } catch {
      setValue(prev);
    } finally {
      setPending(false);
    }
  }

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value as TieNextStatus)}
      className={[
        "bg-transparent border border-[var(--color-border)] rounded px-1.5 py-0.5 text-xs",
        value === "wanted" || value === "at_vise"
          ? "text-[#E8923A]"
          : "text-[var(--color-text-secondary)]",
      ].join(" ")}
    >
      {STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
