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

  if (authLoading) return null;
  if (!user) {
    return (
      <div>
        <p className="font-ui text-[11px] font-medium uppercase tracking-[1.4px] text-[var(--slate)]">
          Your record
        </p>
        <p className="prose mt-1.5 text-[14px] leading-[22px] text-[var(--graphite)]">
          Sign in. The river stays public. The day does not.
        </p>
      </div>
    );
  }
  if (loadState === "failed" || loadState === "loading" || !data) return null;

  const timesFished = data.totalSessions ?? 0;
  const bestMonth = data.bestMonth?.month ?? "—";
  const topFly = data.topFlyName ?? "—";

  return (
    <section
      className="border border-[var(--border-rule)] bg-[var(--surface-card)] p-5 sm:p-6"
      aria-label="Your record here"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-[var(--text-primary)]">
            Your record here
          </h2>
          <p className="mt-1 text-[12px] text-[var(--text-meta)]">
            From your private journal on {riverName} — only you can see this.
          </p>
        </div>
        <Link
          href="/journal/new"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)] underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--action)] hover:decoration-[var(--action)]"
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          Log a session here
        </Link>
      </div>

      {timesFished === 0 ? (
        <p className="text-sm text-[var(--text-body)]">
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
    <div className="border border-[var(--border-rule)] bg-[var(--surface-raised)] px-4 py-3">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-meta)]">
        {label}
      </dt>
      <dd className="num mt-1 font-heading text-xl font-semibold text-[var(--text-primary)]">
        {value}
      </dd>
    </div>
  );
}
