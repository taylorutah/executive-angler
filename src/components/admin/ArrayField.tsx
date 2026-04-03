"use client";

import { Plus, X } from "lucide-react";

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
            className="flex-1 px-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A] transition-colors"
          />
          <button
            type="button"
            onClick={() => handleRemove(i)}
            className="shrink-0 p-1.5 rounded-lg text-[#6E7681] hover:text-red-400 hover:bg-red-950/30 transition-colors"
            aria-label="Remove item"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#A8B2BD] border border-dashed border-[#21262D] rounded-lg hover:border-[#E8923A] hover:text-[#E8923A] transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </button>
    </div>
  );
}
