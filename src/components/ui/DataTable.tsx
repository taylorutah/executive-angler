"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface Column<T> {
  id: string;
  header: string;
  accessor: (row: T) => string | number | null | undefined;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  numeric?: boolean;
  width?: string;
  className?: string;
  /** Hide on small screens — set when the column is non-essential. */
  hideOnSm?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  defaultSort?: { id: string; dir: "asc" | "desc" };
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  /** Optional rendered above the table (filter row). */
  toolbar?: React.ReactNode;
  /**
   * When provided, renders a leading checkbox column for multi-select.
   * The owner state lives in the parent so bulk actions can read it.
   * `selectable(row)` lets the table skip rows that can't be acted on.
   */
  selection?: {
    selectedKeys: Set<string>;
    onToggleKey: (key: string) => void;
    onToggleAllVisible: () => void;
    selectable?: (row: T) => boolean;
  };
}

/**
 * Generic dense table for the Flies hub. Brand-styled — DM Sans body,
 * IBM Plex Mono for numerics, copper accents, dark/light themes via
 * CSS vars in globals.css. Sort is in-memory; intended for ≤500 rows.
 *
 * On small screens (<sm) columns marked `hideOnSm` collapse out so the
 * table fits without horizontal scroll.
 */
export default function DataTable<T>({
  columns,
  rows,
  getRowKey,
  defaultSort,
  onRowClick,
  emptyMessage = "No rows.",
  toolbar,
  selection,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(
    defaultSort ?? null,
  );

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.id === sort.id);
    if (!col) return rows;
    const dir = sort.dir === "asc" ? 1 : -1;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = col.accessor(a);
      const bv = col.accessor(b);
      // Nulls always sink.
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * dir;
      }
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
    });
    return copy;
  }, [rows, sort, columns]);

  const handleSort = (id: string) => {
    setSort((prev) => {
      if (prev?.id !== id) return { id, dir: "asc" };
      if (prev.dir === "asc") return { id, dir: "desc" };
      return null;
    });
  };

  const visibleSelectableKeys = selection
    ? sorted
        .filter((r) => (selection.selectable ? selection.selectable(r) : true))
        .map((r) => getRowKey(r))
    : [];
  const allVisibleSelected =
    selection != null &&
    visibleSelectableKeys.length > 0 &&
    visibleSelectableKeys.every((k) => selection.selectedKeys.has(k));

  return (
    <div className="w-full">
      {toolbar ? <div className="mb-3">{toolbar}</div> : null}
      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/40">
              {selection && (
                <th
                  className="h-9 px-3 text-left w-[36px]"
                  style={{ width: "36px" }}
                >
                  <input
                    type="checkbox"
                    aria-label={allVisibleSelected ? "Deselect all" : "Select all"}
                    checked={allVisibleSelected}
                    onChange={selection.onToggleAllVisible}
                    className="h-3.5 w-3.5 rounded border-[var(--color-border)] bg-[var(--color-surface)] cursor-pointer accent-[#E8923A]"
                  />
                </th>
              )}
              {columns.map((c) => {
                const isSorted = sort?.id === c.id;
                return (
                  <th
                    key={c.id}
                    style={c.width ? { width: c.width } : undefined}
                    className={[
                      "h-9 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]",
                      c.numeric ? "text-right" : "text-left",
                      c.hideOnSm ? "hidden sm:table-cell" : "",
                      c.className ?? "",
                    ].join(" ")}
                  >
                    {c.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(c.id)}
                        className="inline-flex items-center gap-1 hover:text-[var(--color-text-primary)]"
                      >
                        <span>{c.header}</span>
                        <span className="inline-block w-3">
                          {isSorted ? (
                            sort?.dir === "asc" ? (
                              <ChevronUp size={12} />
                            ) : (
                              <ChevronDown size={12} />
                            )
                          ) : null}
                        </span>
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selection ? 1 : 0)}
                  className="h-24 px-3 text-center text-sm text-[var(--color-text-muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sorted.map((row) => {
                const key = getRowKey(row);
                const rowSelectable = selection
                  ? selection.selectable
                    ? selection.selectable(row)
                    : true
                  : false;
                return (
                  <tr
                    key={key}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={[
                      "h-9 border-b border-[var(--color-border)] last:border-b-0",
                      onRowClick ? "cursor-pointer hover:bg-[var(--color-surface-raised)]/30" : "",
                    ].join(" ")}
                  >
                    {selection && (
                      <td className="px-3 py-1.5 align-middle" style={{ width: "36px" }}>
                        {rowSelectable ? (
                          <input
                            type="checkbox"
                            aria-label="Select row"
                            checked={selection.selectedKeys.has(key)}
                            onChange={() => selection.onToggleKey(key)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-3.5 w-3.5 rounded border-[var(--color-border)] bg-[var(--color-surface)] cursor-pointer accent-[#E8923A]"
                          />
                        ) : null}
                      </td>
                    )}
                    {columns.map((c) => (
                      <td
                        key={c.id}
                        className={[
                          "px-3 py-1.5 align-middle text-[var(--color-text-primary)]",
                          c.numeric
                            ? "text-right font-[var(--font-mono)] tabular-nums"
                            : "",
                          c.hideOnSm ? "hidden sm:table-cell" : "",
                          c.className ?? "",
                        ].join(" ")}
                      >
                        {c.render ? c.render(row) : (c.accessor(row) ?? "—")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
