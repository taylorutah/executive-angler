"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft } from "@/icons";
import type { FieldConfig } from "@/lib/admin/field-types";
import FieldRenderer from "./FieldRenderer";

interface EntityFormProps {
  fields: FieldConfig[];
  initialData?: Record<string, unknown>;
  entityType: string;
  mode: "create" | "edit";
  onSave: (data: Record<string, unknown>) => Promise<void>;
  relationOptions?: Record<string, { id: string; label: string }[]>;
  submissionIdPrefix?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function EntityForm({
  fields,
  initialData,
  entityType,
  mode,
  onSave,
  relationOptions,
  submissionIdPrefix,
}: EntityFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data from initialData, mapping dbColumn -> key when needed
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const data: Record<string, unknown> = {};
    for (const field of fields) {
      if (initialData) {
        // Try key first, then dbColumn
        const raw =
          initialData[field.key] !== undefined
            ? initialData[field.key]
            : initialData[field.dbColumn];
        if (raw !== undefined) {
          // <input type="date"> requires YYYY-MM-DD; DB often returns a full
          // ISO timestamp. Trim to the date portion so the control renders
          // the existing value instead of showing empty + failing required.
          data[field.key] =
            field.type === "date" && typeof raw === "string" && raw.length >= 10
              ? raw.slice(0, 10)
              : raw;
        } else {
          data[field.key] =
            field.type === "boolean"
              ? false
              : field.type === "string-array"
              ? []
              : field.type === "json"
              ? null
              : "";
        }
      } else {
        data[field.key] =
          field.type === "boolean"
            ? false
            : field.type === "string-array"
            ? []
            : field.type === "json"
            ? null
            : "";
      }
    }
    return data;
  });

  // Auto-generate slug from name or title in create mode
  useEffect(() => {
    if (mode !== "create") return;
    const nameField = fields.find((f) => f.key === "name" || f.key === "title" || f.key === "commonName");
    const slugField = fields.find((f) => f.key === "slug");
    if (!nameField || !slugField) return;

    const nameValue = formData[nameField.key];
    if (typeof nameValue === "string" && nameValue) {
      setFormData((prev) => ({ ...prev, slug: slugify(nameValue) }));
    }
  }, [formData.name, formData.title, formData.commonName, mode, fields]);

  function handleFieldChange(key: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate required fields
    for (const field of fields) {
      if (field.required && field.type !== "hidden" && !field.readOnly) {
        const val = formData[field.key];
        if (val === "" || val === null || val === undefined) {
          setError(`${field.label} is required.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed. Please try again.");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="px-4 py-3 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-[var(--radius-md)] text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {/* Fields grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {fields
          .filter((f) => f.type !== "hidden")
          .map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              value={formData[field.key]}
              onChange={handleFieldChange}
              relationOptions={relationOptions?.[field.key]}
              formData={formData}
              submissionIdPrefix={submissionIdPrefix}
            />
          ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
        <button
          type="submit"
          disabled={saving}
          className="ea-btn ea-btn-primary"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : mode === "create" ? `Create ${entityType}` : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="ea-btn ea-btn-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}
