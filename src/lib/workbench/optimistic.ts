/**
 * Inline edit with optimistic update.
 *
 * The row changes the moment the angler commits the edit, then the write is
 * confirmed or rolled back. A confirmed write flashes green, a failed one
 * flashes red and restores the value that was there before — never a spinner
 * over a value that is already correct on screen.
 *
 * Kept as a pure reducer so the rollback path is testable without a network.
 */

export type FlashTone = "saved" | "error";

export interface PendingEdit<V> {
  rowId: string;
  field: string;
  /** What the row showed before the edit, for rollback. */
  previous: V;
  /** What the angler typed. */
  next: V;
}

export interface EditState<V> {
  /** Optimistic values, keyed `rowId:field`, layered over the server rows. */
  overrides: Record<string, V>;
  /** In-flight writes, keyed `rowId:field`. */
  pending: Record<string, PendingEdit<V>>;
  /** Flash tone per cell, cleared by the UI after its animation. */
  flash: Record<string, FlashTone>;
  /** Human-readable failure per cell, for the row's error text. */
  errors: Record<string, string>;
}

export function cellKey(rowId: string, field: string): string {
  return `${rowId}:${field}`;
}

export function emptyEditState<V>(): EditState<V> {
  return { overrides: {}, pending: {}, flash: {}, errors: {} };
}

/** The value to render: the optimistic override if there is one, else the server value. */
export function displayValue<V>(state: EditState<V>, rowId: string, field: string, serverValue: V): V {
  const key = cellKey(rowId, field);
  return key in state.overrides ? state.overrides[key] : serverValue;
}

/** Commit an edit optimistically. A no-op change is not a write. */
export function beginEdit<V>(state: EditState<V>, edit: PendingEdit<V>): EditState<V> {
  if (Object.is(edit.previous, edit.next)) return state;
  const key = cellKey(edit.rowId, edit.field);
  const errors = { ...state.errors };
  delete errors[key];
  const flash = { ...state.flash };
  delete flash[key];
  return {
    overrides: { ...state.overrides, [key]: edit.next },
    pending: { ...state.pending, [key]: edit },
    flash,
    errors,
  };
}

/**
 * The write landed. The override stays until the server rows catch up —
 * dropping it here would flash the stale value back for a frame.
 */
export function confirmEdit<V>(state: EditState<V>, rowId: string, field: string): EditState<V> {
  const key = cellKey(rowId, field);
  if (!(key in state.pending)) return state;
  const pending = { ...state.pending };
  delete pending[key];
  return { ...state, pending, flash: { ...state.flash, [key]: "saved" } };
}

/** The write failed. Restore what was there and say why. */
export function rejectEdit<V>(
  state: EditState<V>,
  rowId: string,
  field: string,
  message = "Could not save",
): EditState<V> {
  const key = cellKey(rowId, field);
  const edit = state.pending[key];
  const pending = { ...state.pending };
  delete pending[key];
  const overrides = { ...state.overrides };
  if (edit) overrides[key] = edit.previous;
  else delete overrides[key];
  return {
    overrides,
    pending,
    flash: { ...state.flash, [key]: "error" },
    errors: { ...state.errors, [key]: message },
  };
}

/** Called when the flash animation ends, so a re-render cannot replay it. */
export function clearFlash<V>(state: EditState<V>, rowId: string, field: string): EditState<V> {
  const key = cellKey(rowId, field);
  if (!(key in state.flash)) return state;
  const flash = { ...state.flash };
  delete flash[key];
  return { ...state, flash };
}

/**
 * Server rows have arrived. Any override the server now agrees with is
 * redundant and is dropped; a still-pending write keeps its override so an
 * in-flight edit is not stomped by a refetch that predates it.
 */
export function settle<V>(
  state: EditState<V>,
  serverValues: Record<string, V>,
): EditState<V> {
  const overrides: Record<string, V> = {};
  for (const [key, value] of Object.entries(state.overrides)) {
    if (key in state.pending) {
      overrides[key] = value;
      continue;
    }
    if (key in serverValues && Object.is(serverValues[key], value)) continue;
    overrides[key] = value;
  }
  return { ...state, overrides };
}

export function isPending<V>(state: EditState<V>, rowId: string, field: string): boolean {
  return cellKey(rowId, field) in state.pending;
}
