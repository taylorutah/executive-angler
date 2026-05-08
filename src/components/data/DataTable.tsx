"use client";
/**
 * DataTable — dense, Salesforce/Linear-style table for the EA Workbench surfaces.
 *
 * Generic over T (row type). Columns are declarative and can render either
 * a plain value (via `accessor`) or a custom cell (via `render`). Inline
 * editing is opt-in per column.
 *
 * Defaults: 32px row height, sticky header, zebra rows, mono numerics, ↑/↓/j/k
 * keyboard nav, multi-select with shift-click. Bulk actions render in a
 * sticky bar above the header when 1+ rows are selected.
 *
 * Used by Pattern detail (variant table), Box view, Gear locker, sessions list.
 */
import {
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface DataTableColumn<T> {
  /** Stable key, used for React + sort state. */
  key: string;
  /** Header label. */
  label: string;
  /** Header CSS width (e.g. "80px", "1fr"). */
  width?: string;
  /** Right-align numerics. */
  align?: "left" | "right" | "center";
  /** Mono font for numeric columns. */
  mono?: boolean;
  /** Read a value from the row for default rendering and sorting. */
  accessor?: (row: T) => string | number | null | undefined;
  /** Custom cell render — overrides accessor. */
  render?: (row: T, ctx: { rowIndex: number; selected: boolean }) => ReactNode;
  /** Make this column sortable (default: true if accessor is defined). */
  sortable?: boolean;
  /** Row className contribution when this column is hovered (rare). */
  className?: string;
}

export interface DataTableBulkAction<T> {
  label: string;
  /** Optional icon component (e.g. lucide). */
  icon?: ReactNode;
  /** Click handler — receives the selected rows. */
  onClick: (selectedRows: T[]) => void | Promise<void>;
  /** Visual variant. */
  variant?: "default" | "primary" | "danger";
}

export interface DataTableProps<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  /** Stable id accessor (defaults to row.id if present). */
  rowKey?: (row: T) => string;
  /** Disable selection entirely. */
  selectable?: boolean;
  /** Bulk actions shown in sticky bar when selection > 0. */
  bulkActions?: DataTableBulkAction<T>[];
  /** Row click — receives row + index. */
  onRowClick?: (row: T, index: number) => void;
  /** Initial sort column key + direction. */
  defaultSort?: { key: string; dir: "asc" | "desc" };
  /** Empty state shown when rows.length === 0. */
  empty?: ReactNode;
  /** Density preset. */
  density?: "compact" | "comfortable";
  /** Optional toolbar above the table (left side). */
  toolbar?: ReactNode;
  /** Optional className passthrough. */
  className?: string;
}

const DEFAULT_ROW_KEY = <T,>(row: T): string => {
  const r = row as unknown as { id?: string };
  return r.id ?? JSON.stringify(row);
};

export function DataTable<T>({
  rows,
  columns,
  rowKey = DEFAULT_ROW_KEY,
  selectable = true,
  bulkActions,
  onRowClick,
  defaultSort,
  empty,
  density = "compact",
  toolbar,
  className = "",
}: DataTableProps<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(defaultSort?.key ?? null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSort?.dir ?? "asc");
  const [activeRow, setActiveRow] = useState<number>(0);

  // Reset selection if rows change underneath
  useEffect(() => {
    setSelected((prev) => {
      const valid = new Set<string>();
      const ids = new Set(rows.map(rowKey));
      for (const id of prev) if (ids.has(id)) valid.add(id);
      return valid;
    });
  }, [rows, rowKey]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.accessor) return rows;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = col.accessor!(a);
      const bv = col.accessor!(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [rows, columns, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleRow = (id: string, e: MouseEvent) => {
    if (!selectable) return;
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!selectable) return;
    setSelected((prev) =>
      prev.size === sortedRows.length
        ? new Set()
        : new Set(sortedRows.map(rowKey))
    );
  };

  const handleKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (sortedRows.length === 0) return;
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setActiveRow((i) => Math.min(i + 1, sortedRows.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveRow((i) => Math.max(i - 1, 0));
      } else if (e.key === " " && selectable) {
        e.preventDefault();
        const id = rowKey(sortedRows[activeRow]);
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      } else if (e.key === "Enter" && onRowClick) {
        e.preventDefault();
        onRowClick(sortedRows[activeRow], activeRow);
      }
    },
    [sortedRows, activeRow, selectable, rowKey, onRowClick]
  );

  const allSelected = selectable && sortedRows.length > 0 && selected.size === sortedRows.length;
  const partialSelected = selectable && selected.size > 0 && selected.size < sortedRows.length;
  const selectedRows = sortedRows.filter((r) => selected.has(rowKey(r)));

  const rowPadY = density === "compact" ? "py-1.5" : "py-2.5";
  const cellTextSize = "text-[13px]";

  // Sticky-top must match the toolbar's actual rendered height (40px) or zero
  // when it's hidden — position:sticky inside an overflow:hidden parent stops
  // acting like static-at-rest and offsets the header *down* by `top`, which
  // makes the header overlap the first data row. Repro: pattern detail with
  // rows and nothing selected — first row was occluded by the header.
  const showToolbar = !!(toolbar || (bulkActions && selected.size > 0));
  const headerStickyTop = showToolbar ? "top-[40px]" : "top-0";

  return (
    <div
      className={`relative w-full ${className}`}
      tabIndex={0}
      onKeyDown={handleKey}
    >
      {/* Toolbar */}
      {showToolbar && (
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[#21262D] bg-[#0D1117] px-3 py-2">
          <div className="flex items-center gap-3">
            {selected.size > 0 && (
              <span className="font-['IBM_Plex_Mono'] text-xs text-[#A8B2BD]">
                {selected.size} selected
              </span>
            )}
            {toolbar}
          </div>
          {bulkActions && selected.size > 0 && (
            <div className="flex items-center gap-2">
              {bulkActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => action.onClick(selectedRows)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    action.variant === "primary"
                      ? "bg-[#E8923A] text-white hover:bg-[#d17d28]"
                      : action.variant === "danger"
                        ? "bg-[#7F1D1D] text-white hover:bg-[#991B1B]"
                        : "bg-[#1F2937] text-[#F0F6FC] hover:bg-[#2D3748] border border-[#30363D]"
                  }`}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div
        className={`sticky ${headerStickyTop} z-10 grid items-center gap-0 border-b border-[#30363D] bg-[#161B22] text-[10px] font-bold uppercase tracking-widest text-[#6E7681]`}
        style={{
          gridTemplateColumns: [
            selectable ? "32px" : "",
            ...columns.map((c) => c.width ?? "minmax(0, 1fr)"),
          ]
            .filter(Boolean)
            .join(" "),
        }}
      >
        {selectable && (
          <div className="flex items-center justify-center px-2 py-1.5">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = partialSelected;
              }}
              onChange={toggleAll}
              className="h-3.5 w-3.5 cursor-pointer"
              aria-label="Select all rows"
            />
          </div>
        )}
        {columns.map((col) => {
          const sortable = col.sortable ?? !!col.accessor;
          const align =
            col.align === "right" ? "justify-end text-right" : col.align === "center" ? "justify-center text-center" : "justify-start text-left";
          return (
            <button
              key={col.key}
              type="button"
              disabled={!sortable}
              onClick={() => sortable && toggleSort(col.key)}
              className={`flex ${align} items-center gap-1 px-2 py-1.5 ${sortable ? "hover:text-[#E8923A] cursor-pointer" : "cursor-default"} transition-colors`}
            >
              {col.label}
              {sortKey === col.key && (
                <span className="text-[8px]">{sortDir === "asc" ? "▲" : "▼"}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Rows */}
      {sortedRows.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-[#6E7681]">
          {empty ?? "No rows."}
        </div>
      ) : (
        sortedRows.map((row, i) => {
          const id = rowKey(row);
          const isSelected = selected.has(id);
          const isActive = i === activeRow;
          return (
            <div
              key={id}
              onClick={() => onRowClick?.(row, i)}
              onMouseEnter={() => setActiveRow(i)}
              className={`grid items-center border-b border-[#21262D] transition-colors ${
                isSelected
                  ? "bg-[rgba(232,146,58,0.08)]"
                  : i % 2 === 1
                    ? "bg-[#0D1117]"
                    : "bg-[#161B22]"
              } ${isActive ? "ring-1 ring-inset ring-[#E8923A]/20" : ""} ${onRowClick ? "cursor-pointer" : ""} hover:bg-[rgba(232,146,58,0.05)]`}
              style={{
                gridTemplateColumns: [
                  selectable ? "32px" : "",
                  ...columns.map((c) => c.width ?? "minmax(0, 1fr)"),
                ]
                  .filter(Boolean)
                  .join(" "),
              }}
            >
              {selectable && (
                <div className="flex items-center justify-center px-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => undefined}
                    onClick={(e) => toggleRow(id, e)}
                    className="h-3.5 w-3.5 cursor-pointer"
                    aria-label="Select row"
                  />
                </div>
              )}
              {columns.map((col) => {
                const align =
                  col.align === "right" ? "justify-end text-right" : col.align === "center" ? "justify-center text-center" : "justify-start text-left";
                const fontClass = col.mono ? "font-['IBM_Plex_Mono']" : "";
                const value = col.render
                  ? col.render(row, { rowIndex: i, selected: isSelected })
                  : col.accessor?.(row) ?? "";
                return (
                  <div
                    key={col.key}
                    className={`flex ${align} ${rowPadY} ${cellTextSize} ${fontClass} text-[#F0F6FC] px-2 ${col.className ?? ""} truncate`}
                  >
                    {value}
                  </div>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}
