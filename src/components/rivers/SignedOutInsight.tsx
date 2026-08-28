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
    <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] p-5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-sm font-semibold text-[var(--text-1)]">{title}</h3>
      </div>
      <p className="text-sm text-[var(--text-2)] leading-relaxed">{description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href="/signup"
          className="ea-btn ea-btn-sm ea-btn-primary"
        >
          Create a free account
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </div>
      <p className="mt-2 text-xs text-[var(--text-3)]">
        Free — every feature on Executive Angler costs nothing.
      </p>
    </div>
  );
}
