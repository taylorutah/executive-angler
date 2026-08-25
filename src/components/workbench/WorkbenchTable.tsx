"use client";
/**
 * WorkbenchTable — the one instrument table for the workbench surfaces.
 *
 * Replaces two abandoned table components (`components/data/DataTable` and
 * `components/ui/DataTable`), neither of which was imported anywhere. The
 * standard, in one place so `j` means the same thing on every surface:
 *
 *   32px rows · zebra on Pool / Riverbed · tabular numerics via `.num`,
 *   right-aligned · inline edit with optimistic update, green on save and red
 *   on error · a bulk-action toolbar that appears on selection · the keyboard
 *   map from `@/lib/workbench/keymap`.
 *
 * The keyboard behaviour and the rollback path live in tested pure modules;
 * this component is the rendering and the wiring.
 *
 * Rows are real focus stops: roving tabindex, DOM focus, and `ea-focus-ring`
 * at every stop. A drawn highlight is not a keyboard stop — screen readers and
 * browser focus tracking both need the row to actually hold focus.
 */
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  emptyCursor,
  isTypingTarget,
  moveCursor,
  reconcileSelection,
  resolveWorkbenchAction,
  selectionLabel,
  toggleSelection,
  cancel as cancelCursor,
  type CursorState,
} from "@/lib/workbench/keymap";
import {
  beginEdit,
  clearFlash,
  confirmEdit,
  displayValue,
  emptyEditState,
  isPending,
  rejectEdit,
  type EditState,
} from "@/lib/workbench/optimistic";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";

export interface WorkbenchColumn<T> {
  key: string;
  label: string;
  /** Grid track, e.g. "120px" or "minmax(0,1fr)". */
  width?: string;
  /** Numerics are right-aligned and set in `.num`. */
  numeric?: boolean;
  accessor?: (row: T) => string | number | null | undefined;
  render?: (row: T) => ReactNode;
  /** Opt this column into inline editing. */
  editable?: boolean;
  /** Persist an edit. Throw or reject to roll the cell back. */
  onCommit?: (row: T, value: string) => Promise<void>;
}

export interface WorkbenchBulkAction<T> {
  label: string;
  icon?: ReactNode;
  tone?: "default" | "primary" | "danger";
  onClick: (rows: T[]) => void | Promise<void>;
}

export interface WorkbenchTableProps<T> {
  rows: T[];
  columns: WorkbenchColumn<T>[];
  rowId: (row: T) => string;
  /** Accessible name for the grid. */
  label: string;
  onActivate?: (row: T) => void;
  bulkActions?: WorkbenchBulkAction<T>[];
  selectable?: boolean;
  /** Rendered when there are no rows. A surface with nothing in it is still designed. */
  empty?: ReactNode;
  /** Bound to `/`. */
  filterRef?: React.RefObject<HTMLInputElement | null>;
  className?: string;
}

function cellText<T>(col: WorkbenchColumn<T>, row: T): string {
  const raw = col.accessor?.(row);
  return raw == null ? "" : String(raw);
}

export default function WorkbenchTable<T>({
  rows,
  columns,
  rowId,
  label,
  onActivate,
  bulkActions,
  selectable = true,
  empty,
  filterRef,
  className = "",
}: WorkbenchTableProps<T>) {
  const [cursor, setCursor] = useState<CursorState>(emptyCursor);
  const [edits, setEdits] = useState<EditState<string>>(emptyEditState<string>);
  const [editing, setEditing] = useState<{ rowId: string; field: string } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** Set when the cursor moved by keyboard, so focus follows without stealing it from a click. */
  const pullFocus = useRef(false);
  const statusId = useId();

  const ids = useMemo(() => rows.map(rowId), [rows, rowId]);
  const idsKey = ids.join("\u0000");

  // A refresh must not strand a selection on rows that have gone away.
  useEffect(() => {
    setCursor((c) => reconcileSelection(c, idsKey ? idsKey.split("\u0000") : []));
  }, [idsKey]);

  // Roving tabindex: the active row is the only tab stop (`tabIndex={0}`),
  // and keyboard movement calls `.focus()` so `document.activeElement` is
  // that row — a painted ring is not focus. scrollIntoView keeps a long
  // list from leaving the cursor off-screen.
  //
  // `editing` is a dependency because Esc-cancel leaves `active` unchanged.
  // The cell input unmounts and focus would fall to body unless this effect
  // runs after the row is a tab stop again.
  useEffect(() => {
    if (!pullFocus.current) return;
    if (editing) return;
    pullFocus.current = false;
    if (cursor.active < 0) return;
    const el = rowRefs.current[cursor.active];
    el?.focus();
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor.active, editing]);

  const commit = useCallback(
    async (row: T, col: WorkbenchColumn<T>, next: string) => {
      const id = rowId(row);
      const previous = displayValue(edits, id, col.key, cellText(col, row));
      setEditing(null);
      if (previous === next) return;
      setEdits((s) => beginEdit(s, { rowId: id, field: col.key, previous, next }));
      try {
        await col.onCommit?.(row, next);
        setEdits((s) => confirmEdit(s, id, col.key));
      } catch (err) {
        setEdits((s) =>
          rejectEdit(s, id, col.key, err instanceof Error ? err.message : "Could not save"),
        );
      }
    },
    [edits, rowId],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const action = resolveWorkbenchAction(e, { typing: isTypingTarget(e.target) });
      if (!action) return;

      // ⌘K belongs to the site command palette, which already listens on the
      // document. The grid names the binding so the legend is complete, then
      // lets the event through rather than opening a second search.
      if (action === "search") return;

      // Everything else the grid claims must stop here: the palette also
      // listens for `/` and would pull focus to the header search instead of
      // this surface's filter.
      e.stopPropagation();

      switch (action) {
        case "move-up":
        case "move-down": {
          e.preventDefault();
          pullFocus.current = true;
          setCursor((c) => moveCursor(c, action === "move-down" ? 1 : -1, rows.length));
          break;
        }
        case "select": {
          if (!selectable) return;
          e.preventDefault();
          setCursor((c) => (c.active >= 0 ? toggleSelection(c, ids[c.active]) : c));
          break;
        }
        case "activate": {
          if (!onActivate) return;
          e.preventDefault();
          setCursor((c) => {
            if (c.active >= 0) onActivate(rows[c.active]);
            return c;
          });
          break;
        }
        case "focus-filter": {
          if (!filterRef?.current) return;
          e.preventDefault();
          filterRef.current.focus();
          break;
        }
        case "cancel": {
          e.preventDefault();
          if (editing) {
            pullFocus.current = true;
            setEditing(null);
            return;
          }
          setCursor(cancelCursor);
          break;
        }
      }
    },
    [rows, ids, selectable, onActivate, filterRef, editing],
  );

  const gridTemplate = [
    selectable ? "32px" : "",
    ...columns.map((c) => c.width ?? "minmax(0, 1fr)"),
  ]
    .filter(Boolean)
    .join(" ");

  const selectedRows = rows.filter((r) => cursor.selected.has(rowId(r)));
  const showBulk = !!bulkActions?.length && selectedRows.length > 0;

  return (
    <div className={`relative w-full ${className}`}>
      {/* Selection count is announced, not just drawn. */}
      <p id={statusId} role="status" aria-live="polite" className="sr-only">
        {selectionLabel(cursor.selected.size)}
      </p>

      {showBulk && (
        <div
          data-workbench-bulkbar
          className="sticky top-0 z-20 flex h-10 items-center justify-between gap-3 border-b border-[var(--border-strong)] bg-[var(--surface-card)] px-3"
        >
          <span className="num text-xs text-[var(--text-body)]">
            {selectionLabel(cursor.selected.size)}
          </span>
          <div className="flex items-center gap-2">
            {bulkActions!.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => a.onClick(selectedRows)}
                className={`ea-focus-ring inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors ${FOCUS_VISIBLE} ${
                  a.tone === "primary"
                    ? "bg-[var(--action)] text-[var(--on-action)] hover:bg-[var(--action-hover)]"
                    : a.tone === "danger"
                      ? "border border-[var(--state-negative)] text-[var(--state-negative)] hover:bg-[var(--surface-raised)]"
                      : "border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-raised)]"
                }`}
              >
                {a.icon}
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        ref={gridRef}
        role="grid"
        aria-label={label}
        aria-describedby={statusId}
        aria-rowcount={rows.length + 1}
        onKeyDown={onKeyDown}
        className="outline-none"
      >
        <div
          role="row"
          aria-rowindex={1}
          className="grid h-8 items-center border-b border-[var(--border-strong)] bg-[var(--surface-card)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-meta)]"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {/* Must occupy the 32px track, not be pulled out of flow: `sr-only`
              is absolutely positioned, which dropped every following header
              one column left and truncated "River" to "R…". */}
          {selectable && (
            <span role="columnheader" aria-label="Selected" className="block h-full" />
          )}
          {columns.map((c) => (
            <span
              key={c.key}
              role="columnheader"
              className={`truncate px-2 ${c.numeric ? "text-right" : "text-left"}`}
            >
              {c.label}
            </span>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-[var(--text-meta)]">
            {empty ?? "Nothing here yet."}
          </div>
        ) : (
          rows.map((row, i) => {
            const id = rowId(row);
            const isSelected = cursor.selected.has(id);
            const isActive = cursor.active === i;
            // Zebra on Pool / Riverbed — surface-raised is Pool, surface-page is Riverbed.
            const zebra = i % 2 === 1 ? "bg-[var(--surface-page)]" : "bg-[var(--surface-raised)]";
            return (
              <div
                key={id}
                role="row"
                aria-rowindex={i + 2}
                aria-selected={selectable ? isSelected : undefined}
                data-workbench-row={i}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                tabIndex={isActive || (cursor.active < 0 && i === 0) ? 0 : -1}
                onFocus={() => setCursor((c) => (c.active === i ? c : { ...c, active: i }))}
                onClick={() => setCursor((c) => ({ ...c, active: i }))}
                onDoubleClick={() => onActivate?.(row)}
                className={`ea-wb-row ea-focus-ring grid h-8 items-center border-b border-[var(--border-rule)] ${zebra} ${
                  isActive ? "ring-1 ring-inset ring-[var(--signal-live)]" : ""
                }`}
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {selectable && (
                  <span role="gridcell" className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => setCursor((c) => toggleSelection(c, id))}
                      aria-label={`Select row ${i + 1}`}
                      tabIndex={isActive ? 0 : -1}
                      onClick={(e) => e.stopPropagation()}
                      className={`ea-focus-ring h-3.5 w-3.5 cursor-pointer ${FOCUS_VISIBLE}`}
                    />
                  </span>
                )}
                {columns.map((col) => {
                  const flash = edits.flash[`${id}:${col.key}`];
                  const pending = isPending(edits, id, col.key);
                  const value = displayValue(edits, id, col.key, cellText(col, row));
                  const tone =
                    flash === "saved"
                      ? "text-[var(--state-positive)]"
                      : flash === "error"
                        ? "text-[var(--state-negative)]"
                        : "text-[var(--text-primary)]";
                  const isEditingCell =
                    editing?.rowId === id && editing?.field === col.key && col.editable;

                  return (
                    <span
                      key={col.key}
                      role="gridcell"
                      onAnimationEnd={() => setEdits((s) => clearFlash(s, id, col.key))}
                      className={`truncate px-2 text-[13px] ${tone} ${
                        col.numeric ? "num text-right" : "text-left"
                      } ${pending ? "opacity-70" : ""} ${
                        flash === "saved"
                          ? "ea-wb-flash-saved"
                          : flash === "error"
                            ? "ea-wb-flash-error"
                            : ""
                      }`}
                      title={edits.errors[`${id}:${col.key}`]}
                    >
                      {isEditingCell ? (
                        <input
                          autoFocus
                          defaultValue={value}
                          onBlur={(e) => void commit(row, col, e.currentTarget.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void commit(row, col, e.currentTarget.value);
                            }
                          }}
                          aria-label={`${col.label}, row ${i + 1}`}
                          className={`ea-focus-ring w-full bg-[var(--surface-card)] px-1 text-[13px] text-[var(--text-primary)] ${FOCUS_VISIBLE}`}
                        />
                      ) : col.editable ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditing({ rowId: id, field: col.key });
                          }}
                          tabIndex={isActive ? 0 : -1}
                          aria-label={`Edit ${col.label}, row ${i + 1}`}
                          className={`ea-focus-ring w-full text-left ${col.numeric ? "text-right" : ""} ${FOCUS_VISIBLE}`}
                        >
                          {col.render ? col.render(row) : value}
                        </button>
                      ) : col.render ? (
                        col.render(row)
                      ) : (
                        value
                      )}
                    </span>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
