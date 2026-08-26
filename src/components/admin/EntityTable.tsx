"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown, Pencil, Trash2, ChevronLeft, ChevronRight, X } from "@/icons";

interface Column {
  key: string;
  label: string;
  render?: (val: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface EntityTableProps {
  columns: Column[];
  rows: Record<string, unknown>[];
  entitySlug: string;
  onDelete: (id: string) => void;
}

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250, 500];
const DEFAULT_PAGE_SIZE = 25;
// Columns whose distinct value count is ≤ this threshold get a filter dropdown.
const FILTER_CARDINALITY_LIMIT = 20;

/**
 * Returns true if `a` and `b` differ by at most one edit (insert, delete,
 * or substitute one character). Linear-time, no DP table needed since we
 * only care about distance ≤ 1.
 */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a === b) return true;
  // Ensure a is the shorter (or equal-length).
  if (a.length > b.length) {
    const tmp = a;
    a = b;
    b = tmp;
  }
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length === b.length) {
      // substitution
      i++;
      j++;
    } else {
      // insertion in b — advance b only
      j++;
    }
  }
  // Any leftover char in b counts as one more edit; fine if total is ≤ 1.
  return true;
}

/**
 * Test whether a row matches every word in the query. Each query word can
 * match either as a substring of any field, or fuzzily (≤ 1 edit) against
 * any word inside any field.
 */
function rowMatchesQuery(
  row: Record<string, unknown>,
  queryWords: string[],
): boolean {
  // Pre-flatten all string values once per row.
  const fieldsLower: string[] = [];
  for (const v of Object.values(row)) {
    if (typeof v === "string" && v.length > 0) fieldsLower.push(v.toLowerCase());
  }
  if (fieldsLower.length === 0) return false;

  // Pre-tokenize for fuzzy comparisons.
  const tokenSets: string[][] = fieldsLower.map((f) =>
    f.split(/[^a-z0-9]+/).filter((t) => t.length >= 3),
  );

  for (const q of queryWords) {
    let matched = false;
    for (let i = 0; i < fieldsLower.length; i++) {
      if (fieldsLower[i].includes(q)) {
        matched = true;
        break;
      }
      if (q.length >= 4) {
        for (const tok of tokenSets[i]) {
          if (withinOneEdit(tok, q)) {
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
    }
    if (!matched) return false;
  }
  return true;
}

export default function EntityTable({ columns, rows, entitySlug, onDelete }: EntityTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  // Per-column filter values. Empty string / null = no filter.
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  // Auto-detect which columns should get a filter dropdown: those with at
  // least 2 and at most FILTER_CARDINALITY_LIMIT distinct non-empty values.
  // Each entry = { key, label, options: [{ value, count }] }.
  const filterableColumns = useMemo(() => {
    const out: Array<{ key: string; label: string; options: { value: string; count: number }[] }> = [];
    for (const col of columns) {
      const counts = new Map<string, number>();
      for (const row of rows) {
        const v = row[col.key];
        if (v == null || v === "") continue;
        // Skip arrays/objects — render-only complex types don't filter well.
        if (typeof v === "object") continue;
        const key = typeof v === "boolean" ? (v ? "Yes" : "No") : String(v);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      const distinct = counts.size;
      if (distinct >= 2 && distinct <= FILTER_CARDINALITY_LIMIT) {
        const options = Array.from(counts.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
        out.push({ key: col.key, label: col.label, options });
      }
    }
    return out;
  }, [columns, rows]);

  // Apply column filters first, then text search.
  const afterColumnFilters = useMemo(() => {
    const activeKeys = Object.entries(columnFilters)
      .filter(([, v]) => v && v.trim() !== "")
      .map(([k, v]) => [k, v] as const);
    if (activeKeys.length === 0) return rows;
    return rows.filter((row) =>
      activeKeys.every(([key, value]) => {
        const cell = row[key];
        const cellStr =
          typeof cell === "boolean"
            ? cell
              ? "Yes"
              : "No"
            : cell == null
              ? ""
              : String(cell);
        return cellStr === value;
      }),
    );
  }, [rows, columnFilters]);

  // Filter rows by search across all string values.
  // Strategy:
  //   1) Split the query into words (whitespace-separated). Match requires
  //      every query word to appear somewhere in the row's text.
  //   2) Each word matches if (a) it's a substring of any field value, OR
  //      (b) any whitespace-tokenized word in any field is within edit
  //      distance 1 of the query word — handles typos like "wolly" → "woolly".
  //   3) Fuzzy fallback only fires for query words of length >= 4 to avoid
  //      false positives on short tokens.
  const filtered = useMemo(() => {
    const trimmed = search.trim().toLowerCase();
    if (!trimmed) return afterColumnFilters;
    const queryWords = trimmed.split(/\s+/).filter(Boolean);
    if (queryWords.length === 0) return afterColumnFilters;
    return afterColumnFilters.filter((row) => rowMatchesQuery(row, queryWords));
  }, [afterColumnFilters, search]);

  // Sort filtered rows
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = sorted.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const activeFilterCount = Object.values(columnFilters).filter(
    (v) => v && v.trim() !== "",
  ).length;
  const hasSearch = search.trim() !== "";

  function setColumnFilter(key: string, value: string) {
    setColumnFilters((prev) => {
      const next = { ...prev };
      if (!value) delete next[key];
      else next[key] = value;
      return next;
    });
    setPage(0);
  }

  function clearAllFilters() {
    setColumnFilters({});
    setSearch("");
    setPage(0);
  }

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-meta)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search… (typo-tolerant — try 'wolly bugger')"
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-page)] border border-[var(--border-rule)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[#6E7681] focus:outline-none focus:border-[var(--action)] transition-colors"
        />
      </div>

      {/* Filters + page size + clear */}
      {(filterableColumns.length > 0 || rows.length > DEFAULT_PAGE_SIZE) && (
        <div className="flex items-center gap-2 flex-wrap">
          {filterableColumns.map((col) => {
            const active = columnFilters[col.key] ?? "";
            return (
              <div key={col.key} className="relative inline-flex">
                <select
                  value={active}
                  onChange={(e) => setColumnFilter(col.key, e.target.value)}
                  className={`appearance-none pl-3 pr-8 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                    active
                      ? "border-[var(--action)] bg-[var(--action)]/10 text-[var(--action)] font-semibold"
                      : "border-[var(--border-rule)] bg-[var(--surface-page)] text-[var(--text-body)] hover:border-[var(--action)]/40"
                  }`}
                  title={`Filter by ${col.label}`}
                >
                  <option value="">All {col.label.toLowerCase()}</option>
                  {col.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.value} ({opt.count})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
          {(activeFilterCount > 0 || hasSearch) && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[var(--text-body)] hover:text-[var(--text-primary)] transition-colors"
              title="Clear all filters and search"
            >
              <X className="h-3 w-3" /> Clear
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
          )}
          <div className="ml-auto inline-flex items-center gap-2">
            <span className="text-xs text-[var(--text-meta)]">
              {sorted.length === rows.length
                ? `${rows.length} ${rows.length === 1 ? "record" : "records"}`
                : `${sorted.length} of ${rows.length}`}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(0);
              }}
              className="text-xs px-2 py-1 rounded-lg border border-[var(--border-rule)] bg-[var(--surface-page)] text-[var(--text-body)] focus:outline-none focus:border-[var(--action)] cursor-pointer"
              title="Rows per page"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}/page
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      {paged.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-rule)] bg-[var(--surface-raised)] px-6 py-12 text-center">
          <p className="text-sm text-[var(--text-meta)]">
            {search ? "No results match your search." : "No records found."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border-rule)] bg-[var(--surface-raised)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-rule)] text-xs uppercase tracking-wider text-[var(--text-meta)]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-5 py-3 font-semibold cursor-pointer select-none hover:text-[var(--text-body)] transition-colors"
                    onClick={() => handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key && (
                        sortDir === "asc" ? (
                          <ChevronUp className="h-3 w-3 text-[var(--action)]" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-[var(--action)]" />
                        )
                      )}
                    </span>
                  </th>
                ))}
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262D]">
              {paged.map((row) => {
                const id = String(row.id ?? row.slug ?? "");
                return (
                  <tr key={id} className="transition-colors hover:bg-[var(--border-rule)]/40">
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-3 text-[var(--text-primary)]">
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key] != null
                          ? String(row[col.key])
                          : <span className="text-[var(--text-meta)]">&mdash;</span>}
                      </td>
                    ))}
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/admin/content/${entitySlug}/${id}`}
                          className="p-1.5 rounded-lg text-[var(--text-body)] hover:text-[var(--action)] hover:bg-[var(--action)]/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(id)}
                          className="p-1.5 rounded-lg text-[var(--text-body)] hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-meta)]">
            {sorted.length} result{sorted.length !== 1 ? "s" : ""}
            {" "}· Page {currentPage + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--border-rule)] text-[var(--text-body)] rounded-lg text-xs font-semibold hover:bg-[#2D333B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--border-rule)] text-[var(--text-body)] rounded-lg text-xs font-semibold hover:bg-[#2D333B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
