"use client";
/**
 * FliesShell — shared chrome for every /flies/* route.
 *
 * Provides the page header (title · counts · Browse Library · New Pattern)
 * and the persistent sub-nav (Workspace · Boxes · Workbench · Tie Next ·
 * Shared) so every section under /flies looks identical.
 *
 * Used by `src/app/flies/layout.tsx` to wrap all nested routes. Each route
 * still owns its own data fetching and inner UI.
 */
import Link from "next/link";
import { Plus } from "lucide-react";

export type FliesSection =
  | "workspace"
  | "boxes"
  | "workbench"
  | "tie-next"
  | "shared";

interface Props {
  active: FliesSection;
  /** Top-line counts shown under the page title. Each value is optional —
   *  if omitted, that segment is hidden. */
  counts?: {
    patterns?: number;
    boxes?: number;
    tieNext?: number;
    shared?: number;
  };
  /** Hide the Workbench tab for users who tagged `ties_own_flies = false`. */
  showWorkbench?: boolean;
  children: React.ReactNode;
}

export default function FliesShell({
  active,
  counts,
  showWorkbench = true,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-20">
        {/* Page header */}
        <header className="mb-5 sm:mb-6">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            Flies
          </h1>
          {counts && (
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              <CountSegment value={counts.patterns} label="patterns" />
              <CountSegment value={counts.boxes} label="boxes" />
              <CountSegment value={counts.tieNext} label="in tie-next" />
              <CountSegment value={counts.shared} label="shared" />
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href="/flies/library"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--action)]/40 transition-colors"
            >
              Browse Library
            </Link>
            <Link
              href="/journal/flies/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--action)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0A65A] transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> New Pattern
            </Link>
          </div>
        </header>

        {/* Persistent sub-nav */}
        <FliesSubNav active={active} showWorkbench={showWorkbench} />

        {children}
      </div>
    </div>
  );
}

function CountSegment({ value, label }: { value?: number; label: string }) {
  if (value === undefined) return null;
  return (
    <>
      <span className="font-[var(--font-mono)] tabular-nums">{value}</span>{" "}
      {label}
      {" · "}
    </>
  );
}

function FliesSubNav({
  active,
  showWorkbench,
}: {
  active: FliesSection;
  showWorkbench: boolean;
}) {
  const items: { key: FliesSection; label: string; href: string; visible: boolean }[] = [
    { key: "workspace", label: "Workspace", href: "/flies/workspace", visible: true },
    { key: "boxes", label: "Boxes", href: "/flies/boxes", visible: true },
    { key: "workbench", label: "Workbench", href: "/flies/workbench", visible: showWorkbench },
    { key: "tie-next", label: "Tie Next", href: "/flies/tie-next", visible: showWorkbench },
    { key: "shared", label: "Shared", href: "/flies/shared", visible: true },
  ];
  return (
    <nav
      aria-label="Flies sections"
      className="mb-5 -mx-4 sm:mx-0 px-4 sm:px-0 flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 min-w-max">
        {items
          .filter((it) => it.visible)
          .map((it) => (
            <Link
              key={it.key}
              href={it.href}
              className={[
                "rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                active === it.key
                  ? "bg-[var(--color-bg)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
              ].join(" ")}
            >
              {it.label}
            </Link>
          ))}
      </div>
    </nav>
  );
}
