"use client";

import type { FieldConfig } from "@/lib/admin/field-types";
import ArrayField from "./ArrayField";
import JsonField from "./JsonField";

interface FieldRendererProps {
  field: FieldConfig;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
  relationOptions?: { id: string; label: string }[];
}

export default function FieldRenderer({
  field,
  value,
  onChange,
  relationOptions,
}: FieldRendererProps) {
  if (field.type === "hidden") return null;

  const inputBase =
    "w-full px-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A] transition-colors";

  function handleChange(val: unknown) {
    onChange(field.key, val);
  }

  function renderInput() {
    switch (field.type) {
      case "text":
      case "url":
      case "email":
        return (
          <input
            type={field.type}
            value={(value as string) ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={inputBase}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value != null ? String(value) : ""}
            onChange={(e) =>
              handleChange(e.target.value === "" ? null : Number(e.target.value))
            }
            placeholder={field.placeholder}
            required={field.required}
            className={inputBase}
          />
        );

      case "textarea":
        return (
          <textarea
            value={(value as string) ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={inputBase}
          />
        );

      case "richtext":
        return (
          <textarea
            value={(value as string) ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={12}
            className={inputBase}
          />
        );

      case "select":
        return (
          <select
            value={(value as string) ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            required={field.required}
            className={inputBase}
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "boolean":
        return (
          <label className="inline-flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              role="switch"
              aria-checked={!!value}
              onClick={() => handleChange(!value)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                value ? "bg-[#E8923A]" : "bg-[#21262D]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  value ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm text-[#A8B2BD]">
              {value ? "Yes" : "No"}
            </span>
          </label>
        );

      case "string-array":
        return (
          <ArrayField
            value={Array.isArray(value) ? (value as string[]) : []}
            onChange={(val) => handleChange(val)}
            placeholder={field.placeholder}
          />
        );

      case "json":
        return (
          <JsonField
            value={value ?? null}
            onChange={(val) => handleChange(val)}
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            required={field.required}
            className={inputBase}
          />
        );

      case "relation":
        return (
          <select
            value={(value as string) ?? ""}
            onChange={(e) => handleChange(e.target.value || null)}
            required={field.required}
            className={inputBase}
          >
            <option value="">Select...</option>
            {relationOptions?.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={(value as string) ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            className={inputBase}
          />
        );
    }
  }

  return (
    <div className={field.fullWidth ? "col-span-2" : ""}>
      <label className="block text-xs font-bold text-[#A8B2BD] uppercase tracking-wider mb-2">
        {field.label}
        {field.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {renderInput()}
    </div>
  );
}
