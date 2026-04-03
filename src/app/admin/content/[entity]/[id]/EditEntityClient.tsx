"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { FieldConfig } from "@/lib/admin/field-types";
import EntityForm from "@/components/admin/EntityForm";

interface EditEntityClientProps {
  entitySlug: string;
  entityLabel: string;
  fields: FieldConfig[];
  table: string;
  entityId: string;
}

export default function EditEntityClient({
  entitySlug,
  entityLabel,
  fields,
  table,
  entityId,
}: EditEntityClientProps) {
  const router = useRouter();
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [relationOptions, setRelationOptions] = useState<
    Record<string, { id: string; label: string }[]>
  >({});

  // Fetch entity data
  useEffect(() => {
    async function fetchEntity() {
      try {
        const res = await fetch(
          `/api/admin/entities/${entityId}?table=${table}`
        );
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const json = await res.json();
        const row = json.data ?? json;
        setInitialData(row);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load entity.");
      }
      setLoading(false);
    }
    fetchEntity();
  }, [entityId, table]);

  // Fetch relation options
  useEffect(() => {
    const relationFields = fields.filter(
      (f) => f.type === "relation" && f.relationTable
    );
    if (relationFields.length === 0) return;

    const seen = new Set<string>();
    for (const field of relationFields) {
      const relationTable = field.relationTable!;
      if (seen.has(relationTable)) continue;
      seen.add(relationTable);

      fetch(`/api/admin/entities?table=${relationTable}`)
        .then((res) => res.json())
        .then((json) => {
          const data: Record<string, unknown>[] = json.data ?? json;
          const options = data.map((row) => ({
            id: String(row.id),
            label: String(row[field.relationLabelKey ?? "name"] ?? row.id),
          }));
          setRelationOptions((prev) => {
            const next = { ...prev };
            for (const f of relationFields) {
              if (f.relationTable === relationTable) {
                next[f.key] = options;
              }
            }
            return next;
          });
        })
        .catch(() => {
          /* ignore */
        });
    }
  }, [fields]);

  /** Convert camelCase form data to snake_case DB columns and PATCH */
  async function handleSave(formData: Record<string, unknown>) {
    const dbData: Record<string, unknown> = {};
    for (const field of fields) {
      if (field.type === "hidden" && field.key === "id") continue;
      const val = formData[field.key];
      if (val !== undefined) {
        dbData[field.dbColumn] = val === "" ? null : val;
      }
    }

    const res = await fetch(`/api/admin/entities/${entityId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, data: dbData }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? `Update failed: ${res.status}`);
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-screen text-[#F0F6FC]">
        <header className="border-b border-[#21262D] px-6 py-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Edit {entityLabel}
          </h1>
        </header>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-[#6E7681]" />
          <span className="ml-3 text-sm text-[#6E7681]">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="min-h-screen text-[#F0F6FC]">
        <header className="border-b border-[#21262D] px-6 py-6">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/content/${entitySlug}`}
              className="p-1.5 rounded-lg text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit {entityLabel}
            </h1>
          </div>
        </header>
        <div className="px-6 py-12">
          <div className="px-4 py-3 bg-red-950/30 border border-red-800 rounded-lg text-sm text-red-400">
            {error ?? "Entity not found."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#F0F6FC]">
      {/* Header */}
      <header className="border-b border-[#21262D] px-6 py-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/content/${entitySlug}`}
            className="p-1.5 rounded-lg text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Edit {entityLabel}
            </h1>
            <p className="mt-0.5 text-sm text-[#A8B2BD]">
              ID: {entityId}
            </p>
          </div>
          {success && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-950/40 border border-green-800/50 rounded-lg text-sm text-green-400">
              <CheckCircle className="h-4 w-4" />
              Saved
            </div>
          )}
        </div>
      </header>

      <div className="px-6 py-6 max-w-5xl">
        <div className="rounded-xl border border-[#21262D] bg-[#161B22] p-6">
          <EntityForm
            fields={fields}
            initialData={initialData}
            entityType={entityLabel}
            mode="edit"
            onSave={handleSave}
            relationOptions={relationOptions}
          />
        </div>
      </div>
    </div>
  );
}
