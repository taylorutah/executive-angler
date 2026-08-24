"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  /** What the panel would show once there is an account behind it. */
  description: string;
}

export default function SignedOutInsight({ icon, title, description }: Props) {
  return (
    <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-sm font-bold text-[var(--text-primary)]">{title}</h3>
      </div>
      <p className="text-sm text-[var(--text-body)] leading-relaxed">{description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href="/signup"
          className="inline-flex items-center rounded-lg bg-[var(--action)] px-3 py-1.5 text-sm font-semibold text-[var(--on-action)] transition-opacity hover:opacity-90"
        >
          Create a free account
        </Link>
        <Link
          href="/login"
          className="text-sm font-semibold text-[var(--action)] hover:underline"
        >
          Sign in
        </Link>
      </div>
      <p className="mt-2 text-[11px] text-[var(--text-meta)]">
        Free — every feature on Executive Angler costs nothing.
      </p>
    </div>
  );
}
