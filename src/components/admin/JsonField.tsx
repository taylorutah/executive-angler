"use client";

import { useState, useEffect } from "react";

interface JsonFieldProps {
  value: unknown;
  onChange: (val: unknown) => void;
  label?: string;
}

export default function JsonField({ value, onChange, label }: JsonFieldProps) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2) ?? "");
  const [error, setError] = useState<string | null>(null);

  // Sync when external value changes (e.g., form reset)
  useEffect(() => {
    try {
      const formatted = JSON.stringify(value, null, 2) ?? "";
      setText(formatted);
      setError(null);
    } catch {
      // If value can't be stringified, leave text as-is
    }
  }, [value]);

  function handleBlur() {
    const trimmed = text.trim();
    if (!trimmed) {
      setError(null);
      onChange(null);
      return;
    }
    try {
      const parsed = JSON.parse(trimmed);
      const pretty = JSON.stringify(parsed, null, 2);
      setText(pretty);
      setError(null);
      onChange(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }

  return (
    <div>
      {label && (
        <label className="block text-xs font-bold text-[#A8B2BD] uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (error) setError(null);
        }}
        onBlur={handleBlur}
        rows={8}
        spellCheck={false}
        className={`w-full px-3 py-2 bg-[#0D1117] rounded-lg text-sm text-[#F0F6FC] placeholder-[#6E7681] font-mono focus:outline-none transition-colors ${
          error
            ? "border-2 border-red-500"
            : "border border-[#21262D] focus:border-[#E8923A]"
        }`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
