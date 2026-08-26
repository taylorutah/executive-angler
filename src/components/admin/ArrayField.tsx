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
            className="flex-1 px-3 py-2 bg-[var(--surface-page)] border border-[var(--border-rule)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[#6E7681] focus:outline-none focus:border-[var(--action)] transition-colors"
          />
          <button
            type="button"
            onClick={() => handleRemove(i)}
            className="shrink-0 p-1.5 rounded-lg text-[var(--text-meta)] hover:text-red-400 hover:bg-red-950/30 transition-colors"
            aria-label="Remove item"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text-body)] border border-dashed border-[var(--border-rule)] rounded-lg hover:border-[var(--action)] hover:text-[var(--action)] transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </button>
    </div>
  );
}
