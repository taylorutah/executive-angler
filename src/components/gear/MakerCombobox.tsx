"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Maker {
  name: string;
  slug: string;
}

interface Props {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const inputCls =
  "w-full rounded-lg border border-[#21262D] bg-[#0D1117] px-3 py-2.5 text-[#F0F6FC] text-sm focus:border-[#E8923A] focus:outline-none focus:ring-1 focus:ring-[#E8923A]";

export default function MakerCombobox({ value, onChange, disabled, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [makers, setMakers] = useState<Maker[]>([]);
  const [loaded, setLoaded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/gear/makers");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setMakers(data.makers ?? []);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) setLoaded(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const filtered = value
    ? makers.filter((m) => m.name.toLowerCase().includes(value.toLowerCase()))
    : makers;

  const exact = makers.some((m) => m.name.toLowerCase() === value.toLowerCase());

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          className={`${inputCls} pr-8 ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          placeholder={placeholder ?? "e.g. Sage"}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => !disabled && setOpen((o) => !o)}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6E7681] hover:text-[#F0F6FC] transition-colors"
          tabIndex={-1}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && loaded && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg bg-[#161B22] border border-[#21262D] shadow-2xl">
          {filtered.map((m) => {
            const selected = m.name.toLowerCase() === value.toLowerCase();
            return (
              <button
                key={m.slug}
                type="button"
                onClick={() => {
                  onChange(m.name);
                  setOpen(false);
                }}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm text-left transition-colors ${
                  selected
                    ? "bg-[#E8923A]/10 text-[#E8923A]"
                    : "text-[#A8B2BD] hover:bg-[#0D1117] hover:text-[#F0F6FC]"
                }`}
              >
                <span>{m.name}</span>
                {selected && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
          {value && !exact && (
            <div className="px-3 py-2 text-xs text-[#6E7681] border-t border-[#21262D]">
              Press Enter to use <span className="text-[#F0F6FC] font-semibold">&ldquo;{value}&rdquo;</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
