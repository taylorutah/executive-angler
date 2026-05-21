"use client";
/**
 * WorkspaceClient — Phase 2 fully-wired workspace.
 *
 * Composes ViewRail · FilterBar · SortMenu · ViewSwitcher · display panels.
 * Owns local UI state for filter/sort/display, mirrors it into the URL so
 * the page is bookmarkable and back-button-friendly. Persists user views
 * via the /api/fishing/fly-views endpoints.
 */
import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import FilterBar from "@/components/flies/workspace/FilterBar";
import type { FilterOption } from "@/components/flies/workspace/FilterPill";
import SortMenu from "@/components/flies/workspace/SortMenu";
import ViewSwitcher from "@/components/flies/workspace/ViewSwitcher";
import ViewRail from "@/components/flies/workspace/ViewRail";
import {
  GridDisplay,
  TableDisplay,
  KanbanDisplay,
  GroupByBoxDisplay,
} from "@/components/flies/workspace/displays";

import type {
  WorkspaceRow,
  WorkspaceFilter,
  WorkspaceSort,
  WorkspaceViewType,
  FlyViewDescriptor,
} from "@/lib/flies/workspace-shared";
import { getVirtualView } from "@/lib/flies/workspace-shared";
import { encodeWorkspaceParams } from "@/lib/flies/workspace-url";

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

interface Props {
  rows: WorkspaceRow[];
  boxes: { id: string; name: string }[];
  allViews: FlyViewDescriptor[];
  activeViewId: string;
  activeFilter: WorkspaceFilter;
  activeSort: WorkspaceSort;
  activeDisplay: WorkspaceViewType;
  viewerUserId: string;
  viewerUsername: string | null;
}

export default function WorkspaceClient({
  rows,
  boxes,
  allViews: initialViews,
  activeViewId,
  activeFilter,
  activeSort,
  activeDisplay,
  viewerUsername,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [filter, setFilter] = useState<WorkspaceFilter>(activeFilter);
  const [sort, setSort] = useState<WorkspaceSort>(activeSort);
  const [display, setDisplay] = useState<WorkspaceViewType>(activeDisplay);
  const [views, setViews] = useState<FlyViewDescriptor[]>(initialViews);
  const [currentViewId, setCurrentViewId] = useState<string>(activeViewId);

  // Resync from server-side props when the URL changes (e.g. user back-button).
  useEffect(() => {
    setFilter(activeFilter);
    setSort(activeSort);
    setDisplay(activeDisplay);
    setCurrentViewId(activeViewId);
  }, [activeFilter, activeSort, activeDisplay, activeViewId]);

  // Push state changes to URL — server re-renders with new rows.
  function syncUrl(next: {
    viewId?: string;
    filter?: WorkspaceFilter;
    sort?: WorkspaceSort;
    display?: WorkspaceViewType;
  }) {
    const sp = encodeWorkspaceParams({
      viewId: next.viewId ?? currentViewId,
      filter: next.filter ?? filter,
      sort: next.sort ?? sort,
      display: next.display ?? display,
    });
    const qs = sp.toString();
    const url = qs ? `/flies/workspace?${qs}` : "/flies/workspace";
    startTransition(() => router.replace(url, { scroll: false }));
  }

  function selectView(viewId: string) {
    const v = getVirtualView(viewId) ?? views.find((x) => x.id === viewId);
    if (!v) return;
    setCurrentViewId(viewId);
    setFilter(v.filter);
    setSort(v.sort);
    setDisplay(v.view_type);
    syncUrl({
      viewId,
      filter: v.filter,
      sort: v.sort,
      display: v.view_type,
    });
  }

  function updateFilter(next: WorkspaceFilter) {
    setFilter(next);
    syncUrl({ filter: next });
  }
  function updateSort(next: WorkspaceSort) {
    setSort(next);
    syncUrl({ sort: next });
  }
  function updateDisplay(next: WorkspaceViewType) {
    setDisplay(next);
    syncUrl({ display: next });
  }

  // ── Saved-view CRUD wiring ────────────────────────────────────────────────

  async function saveCurrentAsView(name: string) {
    try {
      const res = await fetch("/api/fishing/fly-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          filter,
          sort,
          view_type: display,
        }),
      });
      const body = await res.json();
      if (!res.ok) return { ok: false, error: body.error ?? "Save failed" };
      const v = body.view;
      const newView: FlyViewDescriptor = {
        id: v.id,
        name: v.name,
        filter: v.filter ?? {},
        sort: v.sort ?? { field: "name", direction: "asc" },
        view_type: v.view_type ?? "grid",
        is_virtual: false,
        is_pinned: !!v.is_pinned,
      };
      setViews((arr) => [...arr, newView]);
      setCurrentViewId(newView.id);
      syncUrl({ viewId: newView.id });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Save failed" };
    }
  }

  async function renameView(id: string, name: string) {
    try {
      const res = await fetch(`/api/fishing/fly-views/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await res.json();
      if (!res.ok) return { ok: false, error: body.error };
      setViews((arr) => arr.map((v) => (v.id === id ? { ...v, name } : v)));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Rename failed" };
    }
  }

  async function deleteView(id: string) {
    try {
      const res = await fetch(`/api/fishing/fly-views/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json();
        return { ok: false, error: body.error };
      }
      setViews((arr) => arr.filter((v) => v.id !== id));
      if (currentViewId === id) selectView("all");
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Delete failed" };
    }
  }

  async function togglePin(id: string, pinned: boolean) {
    try {
      const res = await fetch(`/api/fishing/fly-views/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_pinned: pinned }),
      });
      const body = await res.json();
      if (!res.ok) return { ok: false, error: body.error };
      setViews((arr) =>
        arr.map((v) => (v.id === id ? { ...v, is_pinned: pinned } : v)),
      );
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Pin failed" };
    }
  }

  // ── Filter pill option lists ─────────────────────────────────────────────

  const categoryOptions: FilterOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      const c = (r.fly.category ?? "").toString();
      if (!c) continue;
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, count]) => ({
        value,
        label: CATEGORY_LABELS[value] ?? value,
        count,
      }));
  }, [rows]);

  const boxOptions: FilterOption[] = useMemo(
    () =>
      boxes.map((b) => ({
        value: b.id,
        label: b.name,
      })),
    [boxes],
  );

  // Detect "unsaved changes" relative to the active view's stored config.
  const hasUnsavedChanges = useMemo(() => {
    const v = getVirtualView(currentViewId) ?? views.find((x) => x.id === currentViewId);
    if (!v) return false;
    return (
      JSON.stringify(v.filter) !== JSON.stringify(filter) ||
      JSON.stringify(v.sort) !== JSON.stringify(sort) ||
      v.view_type !== display
    );
  }, [currentViewId, views, filter, sort, display]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-20">
        {/* Header */}
        <header className="mb-5 sm:mb-6">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            Flies
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            <span className="font-[var(--font-mono)] tabular-nums">
              {rows.length}
            </span>{" "}
            patterns in your collection
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href="/flies/library"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[#E8923A]/40 transition-colors"
            >
              Browse Library
            </Link>
            <Link
              href="/journal/flies/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0A65A] transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> New Pattern
            </Link>
          </div>
        </header>

        {/* Persistent sub-nav — Boxes stays one click away */}
        <FliesSubNav active="workspace" />

        {/* View rail (virtual + saved views, with save/rename/delete) */}
        <ViewRail
          views={views}
          activeViewId={currentViewId}
          onSelect={selectView}
          onSaveCurrent={saveCurrentAsView}
          onRename={renameView}
          onDelete={deleteView}
          onTogglePin={togglePin}
          hasUnsavedChanges={hasUnsavedChanges}
        />

        {/* Filter + sort + display switcher */}
        <FilterBar
          filter={filter}
          onChange={updateFilter}
          categoryOptions={categoryOptions}
          boxOptions={boxOptions}
        />
        <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs text-[var(--color-text-muted)]">
            Showing <span className="font-[var(--font-mono)] tabular-nums">{rows.length}</span> flies
            {hasUnsavedChanges && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#E8923A]/10 text-[#E8923A] px-2 py-0.5 text-[10px]">
                Unsaved changes
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <SortMenu sort={sort} onChange={updateSort} />
            <ViewSwitcher value={display} onChange={updateDisplay} />
          </div>
        </div>

        {/* Display panel */}
        {rows.length === 0 ? (
          <EmptyState viewId={currentViewId} />
        ) : display === "table" ? (
          <TableDisplay rows={rows} viewerUsername={viewerUsername} />
        ) : display === "kanban" ? (
          <KanbanDisplay rows={rows} viewerUsername={viewerUsername} />
        ) : display === "group-by-box" ? (
          <GroupByBoxDisplay
            rows={rows}
            viewerUsername={viewerUsername}
            boxes={boxes}
          />
        ) : (
          <GridDisplay rows={rows} viewerUsername={viewerUsername} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ viewId }: { viewId: string }) {
  const copy =
    viewId === "created-by-me"
      ? "You haven't created any flies yet. Clone a canonical pattern or start a new one."
      : viewId === "favorites"
        ? "No favorited flies yet."
        : viewId === "tie-next"
          ? "Your tie-next queue is empty."
          : viewId === "in-a-box"
            ? "Add a fly to a box to see it here."
            : viewId === "restock"
              ? "Inventory looks healthy — nothing to restock."
              : "No flies match your filters. Adjust them or clear all.";
  return (
    <p className="text-sm text-[var(--color-text-muted)] py-12 text-center">
      {copy}
    </p>
  );
}

/**
 * Persistent flies sub-nav. Boxes stays equally prominent — one click from
 * anywhere in the workspace.
 */
function FliesSubNav({
  active,
}: {
  active: "workspace" | "boxes" | "workbench" | "tie-next" | "shared";
}) {
  const items: { key: typeof active; label: string; href: string }[] = [
    { key: "workspace", label: "Workspace", href: "/flies/workspace" },
    { key: "boxes", label: "Boxes", href: "/flies?tab=boxes" },
    { key: "workbench", label: "Workbench", href: "/flies?tab=workbench" },
    { key: "tie-next", label: "Tie Next", href: "/flies?tab=tie-next" },
    { key: "shared", label: "Shared", href: "/flies?tab=shared" },
  ];
  return (
    <nav
      aria-label="Flies sections"
      className="mb-5 -mx-4 sm:mx-0 px-4 sm:px-0 flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 min-w-max">
        {items.map((it) => (
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
