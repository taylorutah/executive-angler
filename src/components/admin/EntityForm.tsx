"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import type { FieldConfig } from "@/lib/admin/field-types";
import FieldRenderer from "./FieldRenderer";

interface EntityFormProps {
  fields: FieldConfig[];
  initialData?: Record<string, unknown>;
  entityType: string;
  mode: "create" | "edit";
  onSave: (data: Record<string, unknown>) => Promise<void>;
  relationOptions?: Record<string, { id: string; label: string }[]>;
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
        data[field.key] =
          initialData[field.key] !== undefined
            ? initialData[field.key]
            : initialData[field.dbColumn] !== undefined
            ? initialData[field.dbColumn]
            : field.type === "boolean"
            ? false
            : field.type === "string-array"
            ? []
            : field.type === "json"
            ? null
            : "";
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
      if (field.required && field.type !== "hidden") {
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
        <div className="px-4 py-3 bg-red-950/30 border border-red-800 rounded-lg text-sm text-red-400">
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
            />
          ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-[#21262D]">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E8923A] text-white rounded-lg text-sm font-bold hover:bg-[#F0A65A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#21262D] text-[#A8B2BD] rounded-lg text-sm font-semibold hover:bg-[#2D333B] hover:text-[#F0F6FC] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}
