"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen } from "@/icons";
import { useAuth } from "@/lib/auth-context";
import { fetchOnce } from "./fetch-once";
import type { PersonalRiverScorecard } from "@/app/api/insights/personal-river/[riverId]/route";

interface Props {
  riverId: string;
  riverName: string;
}

type LoadState = "loading" | "failed" | "ready";

/**
 * Owner-only strip under the live inset. Client-rendered after auth —
 * never in cached HTML, never visible to anyone else. Signed-out visitors
 * do not see this block (the designed signed-out overlay/window stay below).
 */
export default function YourRecordHere({ riverId, riverName }: Props) {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<PersonalRiverScorecard | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    fetchOnce(`/api/insights/personal-river/${riverId}`)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) return setLoadState("failed");
        setData((await res.json()) as PersonalRiverScorecard);
        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("failed");
      });
    return () => {
      cancelled = true;
    };
  }, [riverId, user, authLoading]);

  if (authLoading || !user) return null;
  if (loadState === "failed" || loadState === "loading" || !data) return null;

  const timesFished = data.totalSessions ?? 0;
  const bestMonth = data.bestMonth?.month ?? "—";
  const topFly = data.topFlyName ?? "—";

  return (
    <section
      className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
      aria-label="Your record here"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold text-[var(--text-1)]">
            Your record here
          </h2>
          <p className="mt-1 text-xs text-[var(--text-3)]">
            From your private journal on {riverName} — only you can see this.
          </p>
        </div>
        <Link
          href="/journal/new"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          Log a session here
        </Link>
      </div>

      {timesFished === 0 ? (
        <p className="text-sm text-[var(--text-2)]">
          No sessions logged on {riverName} yet. The first one you save will fill in times fished, your best month, and your top fly.
        </p>
      ) : (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Times fished" value={String(timesFished)} />
          <Stat label="Your best month here" value={bestMonth} />
          <Stat label="Your top fly" value={topFly} />
        </dl>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--paper-deep)] px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--text-3)]">
        {label}
      </dt>
      <dd className="num mt-1 font-heading text-xl font-semibold text-[var(--text-1)]">
        {value}
      </dd>
    </div>
  );
}
