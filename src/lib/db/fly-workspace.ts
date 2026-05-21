/**
 * Workspace query layer — drives the unified Flies Workspace UI.
 *
 * The workspace shows one filterable list of "your flies." A row is included
 * if EITHER:
 *   (a) the user has a `user_fly_configurations` row for the fly, OR
 *   (b) the user created the fly (`submitted_by_user_id = user.id`) and its
 *       status is in ('private', 'pending', 'approved')
 *
 * Each row carries identity + counts + flags so the UI can render every
 * default view (All, Created by me, Favorites, Tie next, In a box, Need to
 * restock) and every display mode (grid, table, kanban, group-by-box)
 * against the same shape.
 *
 * iOS contract: this module is web-only and reads only `flies`,
 * `user_fly_configurations`, and `fly_box_entries_v3`. No schema changes,
 * no behavior changes for iOS API consumers.
 */
import { createClient } from "@/lib/supabase/server";
import type { Fly, FlyConfiguration } from "@/types/flies";
import type {
  FlyViewDescriptor,
  WorkspaceFilter,
  WorkspaceRow,
  WorkspaceSort,
} from "@/lib/flies/workspace-shared";

// Re-export shared types so existing imports from this module keep working.
export type {
  WorkspaceFilter,
  WorkspaceRow,
  WorkspaceSort,
  WorkspaceSortField,
  WorkspaceSortDirection,
  WorkspaceSource,
  WorkspaceTag,
  WorkspaceViewType,
  VirtualViewId,
  FlyViewDescriptor,
} from "@/lib/flies/workspace-shared";
export {
  VIRTUAL_VIEWS,
  getVirtualView,
} from "@/lib/flies/workspace-shared";

// ────────────────────────────────────────────────────────────────────────────
// Main query
// ────────────────────────────────────────────────────────────────────────────

/**
 * Read the user's full workspace dataset, then apply filter + sort in memory.
 *
 * In-memory filter is correct for current scale (≤ a few hundred rows per
 * user). When inventories grow we can push facets into Postgres views; for
 * now, server-side simplicity beats a premature query optimization.
 */
export async function listFlyWorkspaceRows(
  filter: WorkspaceFilter = {},
  sort: WorkspaceSort = { field: "name", direction: "asc" },
): Promise<WorkspaceRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // 1. Configurations the user owns.
  const { data: configsData, error: cErr } = await supabase
    .from("user_fly_configurations")
    .select("*")
    .eq("user_id", user.id);
  if (cErr) {
    console.error("[listFlyWorkspaceRows configs]", cErr);
    return [];
  }
  const configs = (configsData ?? []) as FlyConfiguration[];

  // 2. Flies the user created — surfaced even without configs.
  // Filter out soft-deleted rows (deleted_at IS NOT NULL).
  const { data: createdData, error: createdErr } = await supabase
    .from("flies")
    .select("*")
    .eq("submitted_by_user_id", user.id)
    .in("status", ["private", "pending", "approved"])
    .is("deleted_at", null);
  if (createdErr) {
    console.error("[listFlyWorkspaceRows created]", createdErr);
  }
  const created = (createdData ?? []) as Fly[];

  // 3. Union of fly ids to fetch.
  const flyIds = new Set<string>();
  for (const c of configs) flyIds.add(c.fly_id);
  for (const f of created) flyIds.add(f.id);
  if (flyIds.size === 0) return [];

  // 4. Fetch the fly rows (we already have `created`; just need configured-but-not-created).
  const createdById = new Map(created.map((f) => [f.id, f]));
  const missingIds = Array.from(flyIds).filter((id) => !createdById.has(id));

  let configuredFlies: Fly[] = [];
  if (missingIds.length > 0) {
    const { data: extra, error: fErr } = await supabase
      .from("flies")
      .select("*")
      .in("id", missingIds)
      .is("deleted_at", null);
    if (fErr) {
      console.error("[listFlyWorkspaceRows flies]", fErr);
      return [];
    }
    configuredFlies = (extra ?? []) as Fly[];
  }
  const fliesById = new Map<string, Fly>([
    ...created.map((f) => [f.id, f] as const),
    ...configuredFlies.map((f) => [f.id, f] as const),
  ]);

  // 5. Box-membership lookup per configuration.
  const cfgIds = configs.map((c) => c.id);
  let entries: Array<{ configuration_id: string; box_id: string }> = [];
  if (cfgIds.length > 0) {
    const { data: entriesData } = await supabase
      .from("fly_box_entries_v3")
      .select("configuration_id, box_id")
      .in("configuration_id", cfgIds);
    entries = (entriesData ?? []) as typeof entries;
  }
  const boxesByCfg = new Map<string, string[]>();
  for (const e of entries) {
    const arr = boxesByCfg.get(e.configuration_id) ?? [];
    arr.push(e.box_id);
    boxesByCfg.set(e.configuration_id, arr);
  }

  // 6. Roll up.
  const rowsByFly = new Map<string, WorkspaceRow>();
  // Seed with created-by-me flies so flies without configs still emit a row.
  for (const fly of created) {
    rowsByFly.set(fly.id, {
      fly,
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
    });
  }
  for (const cfg of configs) {
    const fly = fliesById.get(cfg.fly_id);
    if (!fly) continue;
    let row = rowsByFly.get(cfg.fly_id);
    if (!row) {
      row = {
        fly,
        is_custom: fly.submitted_by_user_id === user.id,
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
      };
      rowsByFly.set(cfg.fly_id, row);
    }
    row.versions.push(cfg);
    row.tied_total += cfg.tied_count;
    row.bought_total += cfg.bought_count;
    row.target_total += cfg.target_count;
    const shortfall = cfg.target_count - cfg.tied_count - cfg.bought_count;
    if (shortfall > 0) row.deficit += shortfall;
    if (cfg.is_tie_next) row.tie_next_count += 1;
    if (cfg.is_favorite) row.favorite_any = true;

    const boxes = boxesByCfg.get(cfg.id) ?? [];
    for (const b of boxes) {
      if (!row.box_ids.includes(b)) row.box_ids.push(b);
    }

    if (cfg.last_used_at) {
      if (!row.last_used_at || cfg.last_used_at > row.last_used_at) {
        row.last_used_at = cfg.last_used_at;
      }
    }
  }
  // Finalize in_box_count after dedup.
  for (const row of rowsByFly.values()) {
    row.in_box_count = row.box_ids.length;
  }

  // 7. Filter.
  let rows = Array.from(rowsByFly.values());
  rows = applyFilter(rows, filter, user.id);

  // 8. Sort.
  rows = applySort(rows, sort);

  return rows;
}

// ────────────────────────────────────────────────────────────────────────────
// Filter + sort helpers
// ────────────────────────────────────────────────────────────────────────────

function applyFilter(
  rows: WorkspaceRow[],
  filter: WorkspaceFilter,
  _viewerId: string,
): WorkspaceRow[] {
  const search = filter.search?.trim().toLowerCase() ?? "";
  const cats = filter.categories?.length ? new Set(filter.categories) : null;
  const boxes = filter.box_ids?.length ? new Set(filter.box_ids) : null;
  const tags = filter.tags?.length ? new Set(filter.tags) : null;
  const source = filter.source ?? "all";

  return rows.filter((r) => {
    if (search && !r.fly.name.toLowerCase().includes(search)) return false;
    if (cats) {
      const c = (r.fly.category ?? "").toString();
      if (!cats.has(c)) return false;
    }
    if (source === "custom" && !r.is_custom) return false;
    if (source === "canonical" && r.is_custom) return false;
    if (boxes) {
      if (!r.box_ids.some((b) => boxes.has(b))) return false;
    }
    if (tags) {
      if (tags.has("favorite") && !r.favorite_any) return false;
      if (tags.has("tie-next") && r.tie_next_count === 0) return false;
      if (tags.has("in-box") && r.in_box_count === 0) return false;
      if (tags.has("restock") && r.deficit === 0) return false;
    }
    return true;
  });
}

function applySort(rows: WorkspaceRow[], sort: WorkspaceSort): WorkspaceRow[] {
  const sign = sort.direction === "desc" ? -1 : 1;
  const sorted = [...rows];
  sorted.sort((a, b) => {
    switch (sort.field) {
      case "name":
        return sign * a.fly.name.localeCompare(b.fly.name);
      case "created_at": {
        const av = a.fly.created_at ?? "";
        const bv = b.fly.created_at ?? "";
        return sign * av.localeCompare(bv);
      }
      case "last_used_at": {
        // Null sorts last regardless of direction.
        const av = a.last_used_at;
        const bv = b.last_used_at;
        if (!av && !bv) return 0;
        if (!av) return 1;
        if (!bv) return -1;
        return sign * av.localeCompare(bv);
      }
      case "deficit":
        return sign * (a.deficit - b.deficit);
      default:
        return 0;
    }
  });
  return sorted;
}

// ────────────────────────────────────────────────────────────────────────────
// Saved views
// ────────────────────────────────────────────────────────────────────────────

/**
 * Saved views from `user_fly_views`. Returns [] gracefully if the table
 * doesn't exist yet (Phase 1 deploys before the migration is applied) — log
 * once and move on.
 */
export async function listSavedFlyViews(): Promise<FlyViewDescriptor[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_fly_views")
    .select("*")
    .eq("user_id", user.id)
    .order("is_pinned", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    // Missing table is expected before the migration is applied.
    if (error.code === "42P01") return [];
    console.error("[listSavedFlyViews]", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const r = row as {
      id: string;
      name: string;
      filter: WorkspaceFilter;
      sort: WorkspaceSort;
      view_type: "grid" | "table" | "kanban" | "group-by-box";
      is_pinned: boolean;
    };
    return {
      id: r.id,
      name: r.name,
      filter: r.filter ?? {},
      sort: r.sort ?? { field: "name", direction: "asc" },
      view_type: r.view_type ?? "grid",
      is_virtual: false,
      is_pinned: !!r.is_pinned,
    };
  });
}

/** Full list: virtual views first, then user's saved views. */
export async function listAllFlyViews(): Promise<FlyViewDescriptor[]> {
  const { VIRTUAL_VIEWS } = await import("@/lib/flies/workspace-shared");
  const saved = await listSavedFlyViews();
  return [...VIRTUAL_VIEWS, ...saved];
}
