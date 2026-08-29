"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";

/**
 * Logged-out convenience only. Signed-in anglers reach the notebook
 * from "My Flies" in the primary bar — don't repeat it on the catalogue.
 */
export default function LibraryNotebookLinks() {
  const { user, isLoading } = useAuth();
  if (isLoading || user) return null;

  const linkClass = `${FOCUS_VISIBLE} rounded-sm text-[var(--text-2)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]`;

  return (
    <p className="mt-4 text-[13px] leading-relaxed text-[var(--text-3)]">
      Your boxes, after you sign in —{" "}
      <Link href="/login?redirect=/flybox" className={linkClass}>
        My Fly Boxes
      </Link>
      <span aria-hidden> · </span>
      <Link href="/login?redirect=/my-flies" className={linkClass}>
        My Flies
      </Link>
    </p>
  );
}
