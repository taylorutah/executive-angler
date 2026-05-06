"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

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

const PAGE_SIZE = 25;

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
    if (!trimmed) return rows;
    const queryWords = trimmed.split(/\s+/).filter(Boolean);
    if (queryWords.length === 0) return rows;
    return rows.filter((row) => rowMatchesQuery(row, queryWords));
  }, [rows, search]);

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
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = sorted.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6E7681]" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#0D1117] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A] transition-colors"
        />
      </div>

      {/* Table */}
      {paged.length === 0 ? (
        <div className="rounded-xl border border-[#21262D] bg-[#161B22] px-6 py-12 text-center">
          <p className="text-sm text-[#6E7681]">
            {search ? "No results match your search." : "No records found."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#21262D] bg-[#161B22]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#21262D] text-xs uppercase tracking-wider text-[#6E7681]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-5 py-3 font-semibold cursor-pointer select-none hover:text-[#A8B2BD] transition-colors"
                    onClick={() => handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key && (
                        sortDir === "asc" ? (
                          <ChevronUp className="h-3 w-3 text-[#E8923A]" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-[#E8923A]" />
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
                  <tr key={id} className="transition-colors hover:bg-[#21262D]/40">
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-3 text-[#F0F6FC]">
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key] != null
                          ? String(row[col.key])
                          : <span className="text-[#6E7681]">&mdash;</span>}
                      </td>
                    ))}
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/admin/content/${entitySlug}/${id}`}
                          className="p-1.5 rounded-lg text-[#A8B2BD] hover:text-[#E8923A] hover:bg-[#E8923A]/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(id)}
                          className="p-1.5 rounded-lg text-[#A8B2BD] hover:text-red-400 hover:bg-red-950/30 transition-colors"
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
          <span className="text-[#6E7681]">
            {sorted.length} result{sorted.length !== 1 ? "s" : ""}
            {" "}· Page {currentPage + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#21262D] text-[#A8B2BD] rounded-lg text-xs font-semibold hover:bg-[#2D333B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#21262D] text-[#A8B2BD] rounded-lg text-xs font-semibold hover:bg-[#2D333B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
