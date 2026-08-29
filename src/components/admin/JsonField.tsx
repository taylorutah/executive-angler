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
        <label className="ea-label">
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
        aria-invalid={error ? true : undefined}
        className="ea-input font-mono text-[13px]"
      />
      {error && (
        <p className="ea-field-error">{error}</p>
      )}
    </div>
  );
}
