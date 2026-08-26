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
      className="border border-[var(--border-rule)] bg-[var(--surface-raised)] p-5"
      style={{ borderRadius: "var(--radius-surface)" }}
    >
      <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
        Your record on {riverName}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-body)]">
        With an account this page would show your catches on the hydrograph,
        your scorecard here, and the flow window you actually catch fish in.
        Those numbers stay private. We do not invent them for you.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href="/signup"
          className="inline-flex items-center bg-[var(--action)] px-3 py-1.5 text-sm font-semibold text-[var(--on-action)] transition-colors hover:bg-[var(--action-hover)]"
          style={{ borderRadius: "var(--radius-instrument)" }}
        >
          Create a free account
        </Link>
        <Link
          href="/login"
          className="text-sm font-semibold text-[var(--text-primary)] underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--action)] hover:decoration-[var(--action)]"
        >
          Sign in
        </Link>
      </div>
      <p className="mt-2 text-[11px] text-[var(--text-body)]">
        Free — every feature on Executive Angler costs nothing.
      </p>
    </div>
  );
}
