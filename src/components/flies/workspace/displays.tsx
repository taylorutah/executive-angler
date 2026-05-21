"use client";
/**
 * Display-mode renderers for the Flies Workspace. Each component takes the
 * already-filtered rows and renders them in a different shape.
 *
 *   GridDisplay        — responsive grid of FlyCards (default).
 *   TableDisplay       — dense, scannable table for inventory work.
 *   KanbanDisplay      — columns by tie-next status: wanted · at vise · done.
 *   GroupByBoxDisplay  — accordion sections, one per box plus an "Unsorted" bucket.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronDown, Wrench, Heart, Sparkles } from "lucide-react";
import FlyCard from "./FlyCard";
import type { WorkspaceRow } from "@/lib/flies/workspace-shared";

const CATEGORY_LABELS: Record<string, string> = {
  nymph: "Nymph",
  dry: "Dry Fly",
  streamer: "Streamer",
  emerger: "Emerger",
  wet: "Wet Fly",
  terrestrial: "Terrestrial",
  egg: "Egg",
  midge: "Midge",
  other: "Other",
};

interface BoxMeta {
  id: string;
  name: string;
}

interface BaseProps {
  rows: WorkspaceRow[];
  viewerUsername: string | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Grid
// ────────────────────────────────────────────────────────────────────────────

export function GridDisplay({ rows, viewerUsername }: BaseProps) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {rows.map((r) => (
        <li key={r.fly.id}>
          <FlyCard row={r} viewerUsername={viewerUsername} />
        </li>
      ))}
    </ul>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Table
// ────────────────────────────────────────────────────────────────────────────

export function TableDisplay({ rows, viewerUsername }: BaseProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--color-surface)] text-left text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
          <tr>
            <th className="px-3 py-2 font-semibold">Fly</th>
            <th className="px-3 py-2 font-semibold">Type</th>
            <th className="px-3 py-2 font-semibold text-right">Tied</th>
            <th className="px-3 py-2 font-semibold text-right">Bought</th>
            <th className="px-3 py-2 font-semibold text-right">Target</th>
            <th className="px-3 py-2 font-semibold text-right">Restock</th>
            <th className="px-3 py-2 font-semibold text-right">In box</th>
            <th className="px-3 py-2 font-semibold text-right">Tie next</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const flyStatus = (r.fly as { status?: string | null }).status ?? null;
            const privateRoute =
              r.is_custom && (flyStatus === "private" || flyStatus === "pending");
            const href =
              privateRoute && viewerUsername
                ? `/anglers/${viewerUsername}/flies/${r.fly.slug}`
                : `/flies/${r.fly.slug}`;
            return (
              <tr
                key={r.fly.id}
                className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface)]/50"
              >
                <td className="px-3 py-2">
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 hover:text-[#E8923A]"
                  >
                    <span className="relative h-7 w-7 overflow-hidden rounded bg-[var(--color-bg)] flex-shrink-0">
                      {r.fly.hero_image_url && (
                        <Image
                          src={r.fly.hero_image_url}
                          alt={r.fly.name}
                          fill
                          sizes="28px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <span className="font-medium truncate max-w-[200px]">
                      {r.fly.name}
                    </span>
                    {r.is_custom && (
                      <Sparkles className="h-3 w-3 text-[#0BA5C7] flex-shrink-0" />
                    )}
                    {r.favorite_any && (
                      <Heart
                        className="h-3 w-3 text-rose-500 flex-shrink-0"
                        fill="currentColor"
                      />
                    )}
                  </Link>
                </td>
                <td className="px-3 py-2 text-[var(--color-text-muted)]">
                  {CATEGORY_LABELS[(r.fly.category as string) ?? ""] ??
                    r.fly.category ??
                    "—"}
                </td>
                <td className="px-3 py-2 text-right font-[var(--font-mono)] tabular-nums">
                  {r.tied_total}
                </td>
                <td className="px-3 py-2 text-right font-[var(--font-mono)] tabular-nums">
                  {r.bought_total}
                </td>
                <td className="px-3 py-2 text-right font-[var(--font-mono)] tabular-nums">
                  {r.target_total}
                </td>
                <td
                  className={[
                    "px-3 py-2 text-right font-[var(--font-mono)] tabular-nums",
                    r.deficit > 0 ? "text-[#E8923A] font-semibold" : "text-[var(--color-text-muted)]",
                  ].join(" ")}
                >
                  {r.deficit}
                </td>
                <td className="px-3 py-2 text-right font-[var(--font-mono)] tabular-nums text-[var(--color-text-muted)]">
                  {r.in_box_count}
                </td>
                <td className="px-3 py-2 text-right">
                  {r.tie_next_count > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-[#E8923A]/40 bg-[#E8923A]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#E8923A]">
                      <Wrench className="h-3 w-3" /> {r.tie_next_count}
                    </span>
                  ) : (
                    <span className="text-[var(--color-text-muted)]">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Kanban — columns by tie_next_status
// ────────────────────────────────────────────────────────────────────────────

export function KanbanDisplay({ rows, viewerUsername }: BaseProps) {
  // A fly appears in a column if ANY of its configurations have that status.
  const columns = useMemo(() => {
    const wanted: WorkspaceRow[] = [];
    const atVise: WorkspaceRow[] = [];
    const done: WorkspaceRow[] = [];
    for (const r of rows) {
      const statuses = new Set(
        r.versions.map((v) => v.tie_next_status).filter(Boolean) as string[],
      );
      if (statuses.has("wanted")) wanted.push(r);
      if (statuses.has("at_vise")) atVise.push(r);
      if (statuses.has("done")) done.push(r);
    }
    return [
      { id: "wanted", label: "Wanted", rows: wanted },
      { id: "at_vise", label: "At vise", rows: atVise },
      { id: "done", label: "Done", rows: done },
    ];
  }, [rows]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {columns.map((col) => (
        <section
          key={col.id}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-3"
        >
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              {col.label}
            </h3>
            <span className="text-[10px] font-[var(--font-mono)] tabular-nums text-[var(--color-text-muted)]">
              {col.rows.length}
            </span>
          </header>
          {col.rows.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] py-6 text-center">
              Empty.
            </p>
          ) : (
            <ul className="space-y-2">
              {col.rows.map((r) => (
                <li key={r.fly.id}>
                  <FlyCard row={r} viewerUsername={viewerUsername} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Group by box — accordion sections
// ────────────────────────────────────────────────────────────────────────────

interface GroupByBoxProps extends BaseProps {
  boxes: BoxMeta[];
}

export function GroupByBoxDisplay({ rows, viewerUsername, boxes }: GroupByBoxProps) {
  const groups = useMemo(() => {
    const byBox = new Map<string, WorkspaceRow[]>();
    const unsorted: WorkspaceRow[] = [];
    for (const r of rows) {
      if (r.box_ids.length === 0) {
        unsorted.push(r);
        continue;
      }
      for (const boxId of r.box_ids) {
        const arr = byBox.get(boxId) ?? [];
        arr.push(r);
        byBox.set(boxId, arr);
      }
    }
    const named = boxes
      .filter((b) => byBox.has(b.id))
      .map((b) => ({ id: b.id, label: b.name, rows: byBox.get(b.id)! }));
    // Append any box ids we didn't have metadata for.
    for (const [id, rs] of byBox.entries()) {
      if (!boxes.some((b) => b.id === id)) {
        named.push({ id, label: "Unnamed box", rows: rs });
      }
    }
    if (unsorted.length > 0) {
      named.push({ id: "__unsorted__", label: "Not in any box", rows: unsorted });
    }
    return named;
  }, [rows, boxes]);

  return (
    <div className="space-y-2">
      {groups.map((g) => (
        <GroupBlock
          key={g.id}
          label={g.label}
          rows={g.rows}
          viewerUsername={viewerUsername}
        />
      ))}
    </div>
  );
}

function GroupBlock({
  label,
  rows,
  viewerUsername,
}: {
  label: string;
  rows: WorkspaceRow[];
  viewerUsername: string | null;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-[var(--color-bg)] rounded-t-lg"
      >
        <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {label}
        </span>
        <span className="text-[11px] font-[var(--font-mono)] tabular-nums text-[var(--color-text-muted)]">
          {rows.length}
        </span>
      </button>
      {open && (
        <div className="p-3 pt-2">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rows.map((r) => (
              <li key={r.fly.id}>
                <FlyCard row={r} viewerUsername={viewerUsername} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
