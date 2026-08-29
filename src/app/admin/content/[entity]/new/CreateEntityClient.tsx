"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@/icons";
import Link from "next/link";
import type { FieldConfig } from "@/lib/admin/field-types";
import EntityForm from "@/components/admin/EntityForm";

interface CreateEntityClientProps {
  entitySlug: string;
  entityLabel: string;
  fields: FieldConfig[];
  table: string;
}

export default function CreateEntityClient({
  entitySlug,
  entityLabel,
  fields,
  table,
}: CreateEntityClientProps) {
  const router = useRouter();
  const [relationOptions, setRelationOptions] = useState<
    Record<string, { id: string; label: string }[]>
  >({});

  // Fetch relation options (e.g., destinations for destinationId fields)
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
          // Map options to each field that uses this relation table
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
          /* ignore — form still usable */
        });
    }
  }, [fields]);

  /** Convert camelCase form data to snake_case DB columns and POST */
  async function handleSave(formData: Record<string, unknown>) {
    const dbData: Record<string, unknown> = {};
    for (const field of fields) {
      if (field.readOnly) continue;
      if (field.type === "hidden" && field.key === "id") continue; // skip auto-generated id
      const val = formData[field.key];
      if (val !== undefined && val !== "") {
        dbData[field.dbColumn] = val;
      }
    }

    const res = await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, data: dbData }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? `Create failed: ${res.status}`);
    }

    router.push(`/admin/content/${entitySlug}`);
  }

  return (
    <div className="min-h-screen text-[var(--text-1)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] px-6 py-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/content/${entitySlug}`}
            className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--paper-deep)] transition-colors duration-150 ease-standard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-1)]">
              New {entityLabel}
            </h1>
            <p className="mt-0.5 text-sm text-[var(--text-2)]">
              Create a new {entityLabel.toLowerCase()} record.
            </p>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 max-w-5xl">
        <div className="ea-card">
          <EntityForm
            fields={fields}
            entityType={entityLabel}
            mode="create"
            onSave={handleSave}
            relationOptions={relationOptions}
            submissionIdPrefix={`admin-${table}-new`}
          />
        </div>
      </div>
    </div>
  );
}
