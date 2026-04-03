"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import type { FieldConfig } from "@/lib/admin/field-types";
import EntityTable from "@/components/admin/EntityTable";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

interface EntityListClientProps {
  entitySlug: string;
  entityLabel: string;
  fields: FieldConfig[];
  table: string;
}

/** Convert snake_case DB row to camelCase keys based on field config */
function mapRowToFields(
  row: Record<string, unknown>,
  fields: FieldConfig[]
): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};
  for (const field of fields) {
    // Prefer dbColumn key from the raw row, fall back to camelCase key
    if (row[field.dbColumn] !== undefined) {
      mapped[field.key] = row[field.dbColumn];
    } else if (row[field.key] !== undefined) {
      mapped[field.key] = row[field.key];
    }
  }
  // Always carry over id
  if (row.id !== undefined) mapped.id = row.id;
  if (row.slug !== undefined && !mapped.slug) mapped.slug = row.slug;
  return mapped;
}

export default function EntityListClient({
  entitySlug,
  entityLabel,
  fields,
  table,
}: EntityListClientProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/entities?table=${table}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      const json = await res.json();
      const data: Record<string, unknown>[] = json.data ?? json;
      setRows(data.map((row) => mapRowToFields(row, fields)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data.");
    }
    setLoading(false);
  }, [table, fields]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build columns from fields marked as tableColumn
  const columns = fields
    .filter((f) => f.tableColumn)
    .map((f) => ({
      key: f.key,
      label: f.label,
      render:
        f.type === "boolean"
          ? (val: unknown) =>
              val ? (
                <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-green-950/40 text-green-400 border border-green-800/50">
                  Yes
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-[#21262D] text-[#6E7681]">
                  No
                </span>
              )
          : undefined,
    }));

  function handleDeleteClick(id: string) {
    const row = rows.find((r) => String(r.id ?? r.slug) === id);
    const name = String(
      row?.name ?? row?.title ?? row?.commonName ?? row?.slug ?? id
    );
    setDeleteId(id);
    setDeleteName(name);
  }

  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/entities/${deleteId}?table=${table}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        throw new Error(`Delete failed: ${res.status}`);
      }
      setRows((prev) =>
        prev.filter((r) => String(r.id ?? r.slug) !== deleteId)
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    }
    setDeleting(false);
    setDeleteId(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen text-[#F0F6FC]">
        <header className="border-b border-[#21262D] px-6 py-6">
          <h1 className="text-2xl font-bold tracking-tight">{entityLabel}</h1>
        </header>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-[#6E7681]" />
          <span className="ml-3 text-sm text-[#6E7681]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#F0F6FC]">
      {/* Header */}
      <header className="border-b border-[#21262D] px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {entityLabel}
            </h1>
            <p className="mt-1 text-sm text-[#A8B2BD]">
              {rows.length} record{rows.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href={`/admin/content/${entitySlug}/new`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E8923A] text-white rounded-lg text-sm font-bold hover:bg-[#F0A65A] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New {entityLabel.replace(/s$/, "")}
          </Link>
        </div>
      </header>

      <div className="px-6 py-6">
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-950/30 border border-red-800 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <EntityTable
          columns={columns}
          rows={rows}
          entitySlug={entitySlug}
          onDelete={handleDeleteClick}
        />
      </div>

      <DeleteConfirmModal
        isOpen={deleteId !== null}
        entityName={deleteName}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
