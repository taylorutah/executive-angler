"use client";
/**
 * WorkspaceClient — Phase 2 fully-wired workspace.
 *
 * Composes ViewRail · FilterBar · SortMenu · ViewSwitcher · display panels.
 * Owns local UI state for filter/sort/display, mirrors it into the URL so
 * the page is bookmarkable and back-button-friendly. Persists user views
 * via the /api/fishing/fly-views endpoints.
 */
import { useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import FilterBar from "@/components/flies/workspace/FilterBar";
import type { FilterOption } from "@/components/flies/workspace/FilterPill";
import SortMenu from "@/components/flies/workspace/SortMenu";
import ViewSwitcher from "@/components/flies/workspace/ViewSwitcher";
import ViewRail from "@/components/flies/workspace/ViewRail";
import CloneDrawer from "@/components/flies/workspace/CloneDrawer";
import UndoDeleteToast from "@/components/flies/UndoDeleteToast";
import {
  GridDisplay,
  TableDisplay,
  KanbanDisplay,
  GroupByBoxDisplay,
} from "@/components/flies/workspace/displays";

import type { Fly } from "@/types/flies";
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
  const urlParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [filter, setFilter] = useState<WorkspaceFilter>(activeFilter);
  const [sort, setSort] = useState<WorkspaceSort>(activeSort);
  const [display, setDisplay] = useState<WorkspaceViewType>(activeDisplay);
  const [views, setViews] = useState<FlyViewDescriptor[]>(initialViews);
  const [currentViewId, setCurrentViewId] = useState<string>(activeViewId);

  // Clone drawer state — driven by ?clone={canonicalFlyId} URL param so the
  // canonical detail page can hand off cleanly via `<Link href="...?clone=...">`.
  const cloneParam = urlParams?.get("clone") ?? null;
  const [cloneOpen, setCloneOpen] = useState<boolean>(!!cloneParam);
  useEffect(() => {
    setCloneOpen(!!cloneParam);
  }, [cloneParam]);

  // Optimistic rows: lets us push a placeholder card the moment Clone is
  // saved, before the server resolves. Keys with negative pseudo-ids until
  // the real fly arrives.
  const [optimisticRows, addOptimisticRow] = useOptimistic(
    rows,
    (current, op: { kind: "add"; row: WorkspaceRow } | { kind: "remove"; id: string }) => {
      if (op.kind === "add") return [op.row, ...current];
      return current.filter((r) => r.fly.id !== op.id);
    },
  );

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

  // ── Clone drawer handlers ────────────────────────────────────────────────

  function closeCloneDrawer() {
    setCloneOpen(false);
    // Strip `clone` from the URL so back-button doesn't re-open it.
    const sp = new URLSearchParams(urlParams?.toString() ?? "");
    sp.delete("clone");
    const qs = sp.toString();
    router.replace(qs ? `/flies/workspace?${qs}` : "/flies/workspace", {
      scroll: false,
    });
  }

  function handleOptimisticClone(placeholderName: string) {
    const placeholderId = `optimistic-${Date.now()}`;
    addOptimisticRow({
      kind: "add",
      row: {
        fly: {
          id: placeholderId,
          slug: placeholderId,
          name: placeholderName,
          category: null,
          description: null,
          history: null,
          tying_overview: null,
          fishing_tips: null,
          recipe_notes: null,
          hero_image_url: null,
          gallery_image_urls: [],
          video_url: null,
          materials_list: [],
          option_envelope: {},
          status: "private",
          submitted_by_user_id: null,
          approved_by_user_id: null,
          approved_at: null,
          reject_reason: null,
          inspired_by_fly_id: null,
          origin_credit: null,
          imitates: [],
          effective_species_ids: [],
          water_types: [],
          is_featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as unknown as Fly,
        is_custom: true,
        versions: [],
        tied_total: 0,
        bought_total: 0,
        target_total: 0,
        deficit: 0,
        tie_next_count: 0,
        favorite_any: false,
        box_ids: [],
        in_box_count: 0,
        last_used_at: null,
      },
    });
  }

  function handleCloneCreated(_fly: Fly) {
    void _fly;
    // Refresh server data so the real row replaces the optimistic placeholder.
    // The optimistic row is automatically dropped when React re-renders with
    // the new server `rows` prop.
    startTransition(() => router.refresh());
  }

  function handleCloneFailure(_msg: string) {
    void _msg;
    // useOptimistic auto-rolls-back when the action throws / completes; we
    // also force a refresh to be safe.
    startTransition(() => router.refresh());
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
    for (const r of optimisticRows) {
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
  }, [optimisticRows]);

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

  // Header + sub-nav come from `src/app/flies/layout.tsx` (FliesShell).
  return (
    <>
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
            Showing <span className="font-[var(--font-mono)] tabular-nums">{optimisticRows.length}</span> flies
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
        {optimisticRows.length === 0 ? (
          <EmptyState viewId={currentViewId} />
        ) : display === "table" ? (
          <TableDisplay rows={optimisticRows} viewerUsername={viewerUsername} />
        ) : display === "kanban" ? (
          <KanbanDisplay rows={optimisticRows} viewerUsername={viewerUsername} />
        ) : display === "group-by-box" ? (
          <GroupByBoxDisplay
            rows={optimisticRows}
            viewerUsername={viewerUsername}
            boxes={boxes}
          />
        ) : (
          <GridDisplay rows={optimisticRows} viewerUsername={viewerUsername} />
        )}

      {/* Soft-delete Undo banner (shown when ?undo={id} is present). */}
      <UndoDeleteToast />

      {/* Inline Clone drawer — opens via ?clone={canonicalFlyId} URL param */}
      <CloneDrawer
        open={cloneOpen}
        canonicalFlyId={cloneParam}
        onOpenChange={(next) => {
          if (!next) closeCloneDrawer();
          else setCloneOpen(true);
        }}
        onOptimisticStart={handleOptimisticClone}
        onCreated={handleCloneCreated}
        onFailure={handleCloneFailure}
      />
    </>
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

// FliesSubNav now lives in src/app/flies/_components/FliesShell.tsx —
// single source of truth consumed by every /flies/* route via layout.tsx.
