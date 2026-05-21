/**
 * Workspace shared types + virtual-view definitions.
 *
 * Lives outside `src/lib/db/` so client components can import it without
 * pulling in `next/headers` (which the server Supabase client uses).
 *
 * Server query functions live in `src/lib/db/fly-workspace.ts`.
 */
import type { Fly, FlyConfiguration } from "@/types/flies";

export type WorkspaceSource = "all" | "canonical" | "custom";
export type WorkspaceTag = "favorite" | "tie-next" | "in-box" | "restock";
export type WorkspaceSortField =
  | "name"
  | "created_at"
  | "last_used_at"
  | "deficit";
export type WorkspaceSortDirection = "asc" | "desc";
export type WorkspaceViewType = "grid" | "table" | "kanban" | "group-by-box";

export interface WorkspaceFilter {
  source?: WorkspaceSource;
  categories?: string[];
  box_ids?: string[];
  tags?: WorkspaceTag[];
  search?: string;
}

export interface WorkspaceSort {
  field: WorkspaceSortField;
  direction: WorkspaceSortDirection;
}

/** One unified row in the workspace — fly identity + the user's rolled-up data. */
export interface WorkspaceRow {
  fly: Fly;
  is_custom: boolean;
  versions: FlyConfiguration[];
  tied_total: number;
  bought_total: number;
  target_total: number;
  deficit: number;
  tie_next_count: number;
  favorite_any: boolean;
  box_ids: string[];
  in_box_count: number;
  last_used_at: string | null;
}

export type VirtualViewId =
  | "all"
  | "created-by-me"
  | "favorites"
  | "tie-next"
  | "in-a-box"
  | "restock";

export interface FlyViewDescriptor {
  id: string;
  name: string;
  filter: WorkspaceFilter;
  sort: WorkspaceSort;
  view_type: WorkspaceViewType;
  is_virtual: boolean;
  is_pinned: boolean;
}

/** Default views every user sees. Order is the rail's render order. */
export const VIRTUAL_VIEWS: FlyViewDescriptor[] = [
  {
    id: "all",
    name: "All my flies",
    filter: {},
    sort: { field: "name", direction: "asc" },
    view_type: "grid",
    is_virtual: true,
    is_pinned: true,
  },
  {
    id: "created-by-me",
    name: "Created by me",
    filter: { source: "custom" },
    sort: { field: "created_at", direction: "desc" },
    view_type: "grid",
    is_virtual: true,
    is_pinned: false,
  },
  {
    id: "favorites",
    name: "Favorites",
    filter: { tags: ["favorite"] },
    sort: { field: "name", direction: "asc" },
    view_type: "grid",
    is_virtual: true,
    is_pinned: false,
  },
  {
    id: "tie-next",
    name: "Tie next",
    filter: { tags: ["tie-next"] },
    sort: { field: "deficit", direction: "desc" },
    view_type: "kanban",
    is_virtual: true,
    is_pinned: false,
  },
  {
    id: "in-a-box",
    name: "In a box",
    filter: { tags: ["in-box"] },
    sort: { field: "name", direction: "asc" },
    view_type: "group-by-box",
    is_virtual: true,
    is_pinned: false,
  },
  {
    id: "restock",
    name: "Need to restock",
    filter: { tags: ["restock"] },
    sort: { field: "deficit", direction: "desc" },
    view_type: "table",
    is_virtual: true,
    is_pinned: false,
  },
];

export function getVirtualView(id: string): FlyViewDescriptor | null {
  return VIRTUAL_VIEWS.find((v) => v.id === id) ?? null;
}
