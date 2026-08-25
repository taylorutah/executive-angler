/**
 * The workbench keyboard map.
 *
 * One specification, shared by every workbench surface, so that `j` means the
 * same thing on /journal as it does in the fly box. The map is data and the
 * reducer is pure, so the contract is pinned by tests rather than by a
 * screenshot of a table.
 *
 *   ↑ ↓ / j k   move
 *   Space       select
 *   ↵           activate
 *   /           focus the filter
 *   Esc         cancel
 *   ⌘K          search
 */

export type WorkbenchAction =
  | "move-up"
  | "move-down"
  | "select"
  | "activate"
  | "focus-filter"
  | "cancel"
  | "search";

/** Printable bindings, for the shortcut legend and for tests. */
export const WORKBENCH_KEYMAP: { keys: string[]; action: WorkbenchAction; label: string }[] = [
  { keys: ["↑", "k"], action: "move-up", label: "Move up" },
  { keys: ["↓", "j"], action: "move-down", label: "Move down" },
  { keys: ["Space"], action: "select", label: "Select" },
  { keys: ["↵"], action: "activate", label: "Activate" },
  { keys: ["/"], action: "focus-filter", label: "Focus filter" },
  { keys: ["Esc"], action: "cancel", label: "Cancel" },
  { keys: ["⌘K"], action: "search", label: "Search" },
];

export interface KeyEventLike {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

/**
 * Whether the event came from somewhere that owns its own keystrokes. A `j`
 * typed into a filter box must stay a `j`, and `/` must not steal focus from
 * a textarea. Escape is the exception — it has to reach the grid to cancel.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as (HTMLElement & { isContentEditable?: boolean }) | null;
  if (!el || typeof el.tagName !== "string") return false;
  const tag = el.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  return el.isContentEditable === true;
}

/**
 * Resolve a key event to a workbench action, or null when the map does not
 * claim it. Modified keystrokes fall through untouched so that browser and
 * assistive-technology shortcuts keep working — the one exception is ⌘K/Ctrl+K,
 * which the map does claim.
 */
export function resolveWorkbenchAction(
  event: KeyEventLike,
  options: { typing?: boolean } = {},
): WorkbenchAction | null {
  const { key, metaKey, ctrlKey, altKey, shiftKey } = event;
  const typing = options.typing === true;

  if ((metaKey || ctrlKey) && (key === "k" || key === "K")) return "search";

  // Escape has to escape, even out of a filter field.
  if (key === "Escape" || key === "Esc") return "cancel";

  if (typing) return null;
  if (metaKey || ctrlKey || altKey) return null;

  switch (key) {
    case "ArrowUp":
      return "move-up";
    case "ArrowDown":
      return "move-down";
    case "k":
      return shiftKey ? null : "move-up";
    case "j":
      return shiftKey ? null : "move-down";
    case " ":
    case "Spacebar":
      return "select";
    case "Enter":
      return "activate";
    case "/":
      return "focus-filter";
    default:
      return null;
  }
}

export interface CursorState {
  /** Index of the focused row, or -1 when the grid has no rows. */
  active: number;
  /** Row ids the angler has selected. */
  selected: Set<string>;
}

export function emptyCursor(): CursorState {
  return { active: -1, selected: new Set() };
}

/**
 * Move the cursor. Clamps at both ends rather than wrapping — a workbench
 * list is a finite set of rows, and wrapping makes it impossible to tell
 * "I am at the bottom" from "I have looped".
 */
export function moveCursor(state: CursorState, delta: number, rowCount: number): CursorState {
  if (rowCount <= 0) return { ...state, active: -1 };
  const from = state.active < 0 ? (delta > 0 ? -1 : rowCount) : state.active;
  const next = Math.max(0, Math.min(rowCount - 1, from + delta));
  return next === state.active ? state : { ...state, active: next };
}

/** Toggle selection of one row id. */
export function toggleSelection(state: CursorState, id: string): CursorState {
  const selected = new Set(state.selected);
  if (selected.has(id)) selected.delete(id);
  else selected.add(id);
  return { ...state, selected };
}

/** Esc clears the selection first, and only then gives up the cursor. */
export function cancel(state: CursorState): CursorState {
  if (state.selected.size > 0) return { ...state, selected: new Set() };
  return { ...state, active: -1 };
}

/** Drop ids that are no longer present, so a refresh cannot strand a selection. */
export function reconcileSelection(state: CursorState, ids: string[]): CursorState {
  const present = new Set(ids);
  let changed = false;
  const selected = new Set<string>();
  for (const id of state.selected) {
    if (present.has(id)) selected.add(id);
    else changed = true;
  }
  const active = state.active >= ids.length ? ids.length - 1 : state.active;
  if (!changed && active === state.active) return state;
  return { active, selected };
}

/** "3 rows selected" — announced to screen readers on the bulk toolbar. */
export function selectionLabel(count: number): string {
  if (count === 0) return "No rows selected";
  return `${count} ${count === 1 ? "row" : "rows"} selected`;
}
