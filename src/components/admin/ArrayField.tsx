"use client";

import { Plus, X } from "@/icons";

interface ArrayFieldProps {
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
}

export default function ArrayField({ value, onChange, placeholder }: ArrayFieldProps) {
  function handleChange(index: number, newVal: string) {
    const updated = [...value];
    updated[index] = newVal;
    onChange(updated);
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleAdd() {
    onChange([...value, ""]);
  }

  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => handleChange(i, e.target.value)}
            placeholder={placeholder}
            className="ea-input flex-1"
          />
          <button
            type="button"
            onClick={() => handleRemove(i)}
            className="shrink-0 p-1.5 rounded-[var(--radius-md)] text-[var(--text-3)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors duration-150 ease-standard"
            aria-label="Remove item"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-2)] border border-dashed border-[var(--border)] rounded-[var(--radius-md)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-colors duration-150 ease-standard"
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </button>
    </div>
  );
}
