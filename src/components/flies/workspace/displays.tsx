"use client";
/**
 * Display-mode renderers for the Flies Workspace. Each component takes the
 * already-filtered rows and renders them in a different shape.
 *
 *   GridDisplay        — responsive grid of FlyCards. Virtualizes when
 *                        rows > VIRTUALIZE_THRESHOLD so 1000-row inventories
 *                        scroll at 60fps.
 *   TableDisplay       — dense, scannable table for inventory work.
 *                        Also virtualizes past the threshold.
 *   KanbanDisplay      — columns by tie-next status: wanted · at vise · done.
 *   GroupByBoxDisplay  — accordion sections, one per box plus an "Unsorted" bucket.
 */
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronDown, Wrench, Heart, Sparkles } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import FlyCard from "./FlyCard";
import type { WorkspaceRow } from "@/lib/flies/workspace-shared";

// Small isomorphic-safe useLayoutEffect alias to avoid the SSR warning.
const useMemoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Below this row count, the browser handles things fine — skip the
 *  measurement/layout overhead of virtualization. */
const VIRTUALIZE_THRESHOLD = 100;

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
  if (rows.length <= VIRTUALIZE_THRESHOLD) {
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
  return <VirtualGrid rows={rows} viewerUsername={viewerUsername} />;
}

/**
 * Virtualized grid for large inventories.
 *
 * Computes columns from viewport width (1 / 2 / 3) and renders only the
 * rows in the viewport via @tanstack/react-virtual. Each "virtual row"
 * holds up to 3 cards. Estimated row height ~180px; the virtualizer
 * dynamically measures actual heights as cards render.
 */
function VirtualGrid({ rows, viewerUsername }: BaseProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(3);

  // Recompute column count on resize.
  useMemoLayoutEffect(() => {
    function compute() {
      const w = window.innerWidth;
      setColumns(w < 640 ? 1 : w < 1024 ? 2 : 3);
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const virtualRows = useMemo(() => {
    const buckets: WorkspaceRow[][] = [];
    for (let i = 0; i < rows.length; i += columns) {
      buckets.push(rows.slice(i, i + columns));
    }
    return buckets;
  }, [rows, columns]);

  const v = useVirtualizer({
    count: virtualRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 4,
  });

  return (
    <div
      ref={parentRef}
      className="overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 320px)" }}
    >
      <div
        style={{
          height: v.getTotalSize(),
          position: "relative",
          width: "100%",
        }}
      >
        {v.getVirtualItems().map((vi) => {
          const bucket = virtualRows[vi.index];
          return (
            <div
              key={vi.key}
              ref={v.measureElement}
              data-index={vi.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${vi.start}px)`,
              }}
            >
              <ul
                className="grid gap-3 mb-3"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {bucket.map((r) => (
                  <li key={r.fly.id}>
                    <FlyCard row={r} viewerUsername={viewerUsername} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
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
            // Single URL scheme for every fly. /flies/[slug] resolves
            // approved canonicals AND the viewer's own private/pending flies
            // (RLS-gated submitter peek inside getFlyBySlug). The old
            // /anglers/{username}/flies/{slug} path is a deprecated
            // redirect-only handler.
            const href = `/flies/${r.fly.slug}`;
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
// Kanban — columns by tie_next_status (drag-and-drop enabled)
// ────────────────────────────────────────────────────────────────────────────

type KanbanColumnId = "wanted" | "at_vise" | "done";

const KANBAN_COLUMNS: { id: KanbanColumnId; label: string }[] = [
  { id: "wanted", label: "Wanted" },
  { id: "at_vise", label: "At vise" },
  { id: "done", label: "Done" },
];

export function KanbanDisplay({ rows, viewerUsername }: BaseProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Optimistic per-configuration status overrides applied on top of the
  // server `rows`. A successful PATCH leaves the override in place until
  // the next router.refresh() reconciles with fresh server data; a failed
  // PATCH clears the affected overrides so the UI snaps back.
  const [overrides, setOverrides] = useState<Record<string, KanbanColumnId>>({});

  // Track drag state for visual feedback.
  const [draggingFlyId, setDraggingFlyId] = useState<string | null>(null);
  const [dragSourceCol, setDragSourceCol] = useState<KanbanColumnId | null>(null);
  const [dragOverCol, setDragOverCol] = useState<KanbanColumnId | null>(null);

  // Effective status for a given configuration (override wins over server).
  function statusOf(configId: string, serverStatus: string | null | undefined): KanbanColumnId | null {
    if (overrides[configId]) return overrides[configId];
    if (serverStatus === "wanted" || serverStatus === "at_vise" || serverStatus === "done") {
      return serverStatus;
    }
    return null;
  }

  // A fly appears in a column if ANY of its configurations have that
  // effective status. Same rule as the read-only version, but with overrides.
  const columns = useMemo(() => {
    const buckets: Record<KanbanColumnId, WorkspaceRow[]> = {
      wanted: [],
      at_vise: [],
      done: [],
    };
    for (const r of rows) {
      const statuses = new Set<KanbanColumnId>();
      for (const v of r.versions) {
        const s = statusOf(v.id, v.tie_next_status);
        if (s) statuses.add(s);
      }
      for (const s of statuses) buckets[s].push(r);
    }
    return KANBAN_COLUMNS.map((c) => ({ ...c, rows: buckets[c.id] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, overrides]);

  async function handleMove(
    row: WorkspaceRow,
    from: KanbanColumnId,
    to: KanbanColumnId,
  ) {
    if (from === to) return;
    // Find every version of this fly currently in the source column. Those
    // are the configurations we'll re-tag with `to`.
    const targets = row.versions.filter(
      (v) => statusOf(v.id, v.tie_next_status) === from,
    );
    if (targets.length === 0) return;

    // Apply optimistic overrides for every targeted configuration.
    setOverrides((prev) => {
      const next = { ...prev };
      for (const v of targets) next[v.id] = to;
      return next;
    });

    // Fire PATCHes in parallel. Keep is_tie_next=true so the row stays
    // visible across all three columns (matches TieNextHub behavior).
    const results = await Promise.allSettled(
      targets.map((v) =>
        fetch("/api/fishing/fly-configurations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: v.id,
            tie_next_status: to,
            is_tie_next: true,
          }),
        }).then(async (res) => {
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body?.error ?? `PATCH failed (${res.status})`);
          }
          return res.json();
        }),
      ),
    );

    const anyFailed = results.some((r) => r.status === "rejected");
    if (anyFailed) {
      // Roll back the affected overrides so the user sees the failure.
      setOverrides((prev) => {
        const next = { ...prev };
        for (const v of targets) delete next[v.id];
        return next;
      });
      // Surface a console error — toast infra in this view is up to the
      // caller; an alert is jarring during fast drags.
      // eslint-disable-next-line no-console
      console.error(
        "Failed to move fly",
        row.fly.name,
        results.filter((r) => r.status === "rejected"),
      );
      return;
    }

    // Reconcile with server (refresh re-renders with new `rows`; the
    // override is still applied until the prop change settles, then the
    // override is no longer needed because the server matches it).
    startTransition(() => router.refresh());
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {columns.map((col) => {
        const isDropTarget = dragOverCol === col.id && dragSourceCol !== col.id;
        return (
          <section
            key={col.id}
            onDragOver={(e) => {
              // Only accept drops if a card is being dragged. preventDefault
              // is required to enable the drop event to fire.
              if (!draggingFlyId) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (dragOverCol !== col.id) setDragOverCol(col.id);
            }}
            onDragLeave={(e) => {
              // Only clear when leaving the column container itself, not a
              // child element within it.
              if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
              if (dragOverCol === col.id) setDragOverCol(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverCol(null);
              // Safari sometimes drops the custom MIME type; fall back to
              // text/plain which we also stash the JSON payload in.
              const raw =
                e.dataTransfer.getData("application/x-ea-fly") ||
                e.dataTransfer.getData("text/plain");
              setDraggingFlyId(null);
              setDragSourceCol(null);
              if (!raw) return;
              try {
                const parsed = JSON.parse(raw) as {
                  flyId: string;
                  sourceColumn: KanbanColumnId;
                };
                const row = rows.find((r) => r.fly.id === parsed.flyId);
                if (!row) return;
                void handleMove(row, parsed.sourceColumn, col.id);
              } catch {
                /* ignore malformed payloads */
              }
            }}
            className={[
              "rounded-lg border bg-[var(--color-surface)]/40 p-3 transition-colors",
              isDropTarget
                ? "border-[#E8923A] bg-[#E8923A]/[0.06] ring-2 ring-[#E8923A]/30"
                : "border-[var(--color-border)]",
            ].join(" ")}
            data-kanban-column={col.id}
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
                {isDropTarget ? "Drop to move here." : "Empty."}
              </p>
            ) : (
              <ul className="space-y-2">
                {col.rows.map((r) => {
                  const isBeingDragged =
                    draggingFlyId === r.fly.id && dragSourceCol === col.id;
                  return (
                    <li
                      key={r.fly.id}
                      draggable
                      onDragStart={(e) => {
                        const payload = JSON.stringify({
                          flyId: r.fly.id,
                          sourceColumn: col.id,
                        });
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("application/x-ea-fly", payload);
                        // Safari sometimes won't round-trip custom MIME
                        // types — stash the same JSON in text/plain as a
                        // fallback the drop handler can read.
                        e.dataTransfer.setData("text/plain", payload);

                        // Use the whole card as the drag image. Without
                        // this, the browser defaults to dragging the inner
                        // <a> (FlyCard wraps in a Link), which produces a
                        // messy URL/text preview. setDragImage overrides
                        // the default regardless of which child element
                        // originated the drag.
                        const node = e.currentTarget as HTMLLIElement;
                        const rect = node.getBoundingClientRect();
                        e.dataTransfer.setDragImage(
                          node,
                          e.clientX - rect.left,
                          e.clientY - rect.top,
                        );

                        setDraggingFlyId(r.fly.id);
                        setDragSourceCol(col.id);
                      }}
                      onDragEnd={() => {
                        setDraggingFlyId(null);
                        setDragSourceCol(null);
                        setDragOverCol(null);
                      }}
                      className={[
                        "cursor-grab active:cursor-grabbing transition-opacity",
                        // Disable native drag on inner <a>/<img> so the
                        // <li> wins as the drag source — Safari otherwise
                        // makes the link the source and ignores
                        // setDragImage, producing a messy URL preview.
                        "[&_a]:[-webkit-user-drag:none] [&_img]:[-webkit-user-drag:none] [&_a]:[user-drag:none] [&_img]:[user-drag:none]",
                        isBeingDragged ? "opacity-40" : "opacity-100",
                      ].join(" ")}
                      data-kanban-card={r.fly.id}
                      data-kanban-source={col.id}
                    >
                      <FlyCard row={r} viewerUsername={viewerUsername} />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
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
