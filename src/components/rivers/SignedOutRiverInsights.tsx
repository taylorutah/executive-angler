"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface Props {
  riverName: string;
}

/**
 * One signed-out invitation per river dossier. The three owner-only
 * panels (flow overlay, scorecard, best window) stay silent until
 * there is a session — they are not a second, third, and fourth CTA.
 */
export default function SignedOutRiverInsights({ riverName }: Props) {
  const { user, isLoading } = useAuth();
  if (isLoading || user) return null;

  return (
    <div
      className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <h3 className="font-heading text-base font-semibold text-[var(--text-1)]">
        Your record on {riverName}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">
        With an account this page would show your catches on the hydrograph,
        your scorecard here, and the flow window you actually catch fish in.
        Those numbers stay private. We do not invent them for you.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href="/signup"
          className="ea-btn ea-btn-sm ea-btn-primary"
        >
          Create a free account
        </Link>
      </div>
      <p className="mt-2 text-xs text-[var(--text-3)]">
        Free — every feature on Executive Angler costs nothing.
      </p>
    </div>
  );
}
