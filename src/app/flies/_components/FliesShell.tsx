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
import { Plus } from "@/icons";

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
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 pt-6 pb-20">
        {/* Page header */}
        <header className="mb-5 sm:mb-6">
          <h1 className="font-display text-2xl font-semibold text-[var(--text-1)] lg:text-3xl">
            Flies
          </h1>
          {counts && (
            <p className="mt-1 text-sm text-[var(--text-2)]">
              <CountSegment value={counts.patterns} label="patterns" />
              <CountSegment value={counts.boxes} label="boxes" />
              <CountSegment value={counts.tieNext} label="in tie-next" />
              <CountSegment value={counts.shared} label="shared" />
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href="/flies/library"
              className="ea-btn ea-btn-secondary ea-btn-sm"
            >
              Browse Library
            </Link>
            <Link
              href="/journal/flies/new"
              className="ea-btn ea-btn-primary ea-btn-sm"
            >
              <Plus className="h-4 w-4" aria-hidden /> New Pattern
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
      <span className="num">{value}</span> {label}
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
      className="mb-5 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex items-center gap-1 border-b border-[var(--border)] min-w-max">
        {items
          .filter((it) => it.visible)
          .map((it) => (
            <Link
              key={it.key}
              href={it.href}
              aria-current={active === it.key ? "page" : undefined}
              className={[
                "px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                active === it.key
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--text-2)] hover:text-[var(--text-1)]",
              ].join(" ")}
            >
              {it.label}
            </Link>
          ))}
      </div>
    </nav>
  );
}
