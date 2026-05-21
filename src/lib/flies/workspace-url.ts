/**
 * URL <-> WorkspaceState encoder.
 *
 * Single source of truth for serializing filter + sort + view_type + search
 * to URLSearchParams and back. Lets the workspace use the URL as the canonical
 * source of state — bookmarkable, shareable, back-button-friendly.
 *
 * Param keys (kept short for readable URLs):
 *   view     — view id (virtual or saved-view UUID)
 *   source   — 'canonical' | 'custom'
 *   cat      — comma-separated categories
 *   box      — comma-separated box ids
 *   tag      — comma-separated tags
 *   q        — search string
 *   sort     — `<field>:<direction>` e.g. "name:asc"
 *   display  — 'grid' | 'table' | 'kanban' | 'group-by-box'
 */
import type {
  WorkspaceFilter,
  WorkspaceSort,
  WorkspaceSortField,
  WorkspaceSortDirection,
  WorkspaceSource,
  WorkspaceTag,
  WorkspaceViewType,
} from "@/lib/flies/workspace-shared";

const VALID_SORT_FIELDS: WorkspaceSortField[] = [
  "name",
  "created_at",
  "last_used_at",
  "deficit",
];
const VALID_VIEW_TYPES: WorkspaceViewType[] = [
  "grid",
  "table",
  "kanban",
  "group-by-box",
];
const VALID_TAGS: WorkspaceTag[] = [
  "favorite",
  "tie-next",
  "in-box",
  "restock",
];

export interface DecodedWorkspaceState {
  viewId: string;
  filter: WorkspaceFilter;
  sort: WorkspaceSort | null;
  display: WorkspaceViewType | null;
}

export function decodeWorkspaceParams(
  params: URLSearchParams | Record<string, string | undefined>,
): DecodedWorkspaceState {
  const get = (key: string): string | undefined => {
    if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
    return params[key];
  };

  const viewId = get("view") ?? "all";

  const sourceRaw = get("source");
  const source: WorkspaceSource | undefined =
    sourceRaw === "custom" || sourceRaw === "canonical"
      ? sourceRaw
      : undefined;

  const cat = get("cat")?.split(",").filter(Boolean);
  const box = get("box")?.split(",").filter(Boolean);
  const tagsRaw = get("tag")?.split(",").filter(Boolean);
  const tags = tagsRaw?.filter((t): t is WorkspaceTag =>
    (VALID_TAGS as string[]).includes(t),
  );
  const search = get("q");

  const filter: WorkspaceFilter = {};
  if (source) filter.source = source;
  if (cat && cat.length) filter.categories = cat;
  if (box && box.length) filter.box_ids = box;
  if (tags && tags.length) filter.tags = tags;
  if (search) filter.search = search;

  // sort
  let sort: WorkspaceSort | null = null;
  const sortRaw = get("sort");
  if (sortRaw) {
    const [field, direction] = sortRaw.split(":");
    if (
      (VALID_SORT_FIELDS as string[]).includes(field) &&
      (direction === "asc" || direction === "desc")
    ) {
      sort = {
        field: field as WorkspaceSortField,
        direction: direction as WorkspaceSortDirection,
      };
    }
  }

  // display
  const displayRaw = get("display");
  const display: WorkspaceViewType | null =
    displayRaw && (VALID_VIEW_TYPES as string[]).includes(displayRaw)
      ? (displayRaw as WorkspaceViewType)
      : null;

  return { viewId, filter, sort, display };
}

export function encodeWorkspaceParams(state: {
  viewId?: string;
  filter?: WorkspaceFilter;
  sort?: WorkspaceSort | null;
  display?: WorkspaceViewType | null;
}): URLSearchParams {
  const sp = new URLSearchParams();
  if (state.viewId && state.viewId !== "all") sp.set("view", state.viewId);

  const f = state.filter ?? {};
  if (f.source && f.source !== "all") sp.set("source", f.source);
  if (f.categories && f.categories.length) sp.set("cat", f.categories.join(","));
  if (f.box_ids && f.box_ids.length) sp.set("box", f.box_ids.join(","));
  if (f.tags && f.tags.length) sp.set("tag", f.tags.join(","));
  if (f.search?.trim()) sp.set("q", f.search.trim());

  if (state.sort) {
    sp.set("sort", `${state.sort.field}:${state.sort.direction}`);
  }
  if (state.display) sp.set("display", state.display);

  return sp;
}
