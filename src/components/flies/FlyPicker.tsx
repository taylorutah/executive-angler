"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Check, Feather, Loader2, X } from "lucide-react";

/**
 * Unified fly typeahead picker. Searches both canonical_flies (the library)
 * and the caller's own fly_patterns (their personal flies). Returns either
 * a canonical_fly_id or fly_pattern_id to the parent — never both.
 *
 * Used by the catch logging form so anglers can tag a catch with the same
 * fly identity whether it's from the library or their own patterns. Stats
 * roll up to the right surface either way.
 */

export interface FlyPickerSelection {
  source: "canonical" | "personal";
  id: string;
  name: string;
  category?: string | null;
}

interface SearchResult extends FlyPickerSelection {
  imageUrl?: string | null;
  isMine?: boolean;
}

interface Props {
  value?: FlyPickerSelection | null;
  onChange: (selection: FlyPickerSelection | null) => void;
  placeholder?: string;
  className?: string;
}

export default function FlyPicker({ value, onChange, placeholder = "Search flies…", className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced fetch
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/flies/search?q=${encodeURIComponent(query)}&limit=12`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
          setHighlight(0);
        }
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [query, open]);

  // Click outside closes
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const select = useCallback(
    (r: SearchResult) => {
      onChange({ source: r.source, id: r.id, name: r.name, category: r.category });
      setQuery("");
      setOpen(false);
    },
    [onChange]
  );

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && results[highlight]) {
      e.preventDefault();
      select(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Display: when value is set, show the chip + clear button; on click, open
  // the picker for replacement.
  if (value && !open) {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#161B22] border border-[#21262D] hover:border-[#E8923A]/40 text-left transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Feather className="h-3.5 w-3.5 text-[#E8923A] shrink-0" />
            <span className="text-sm text-[#F0F6FC] truncate">{value.name}</span>
            {value.source === "personal" && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#E8923A] bg-[#E8923A]/10 px-1.5 py-0.5 rounded-full shrink-0">
                Yours
              </span>
            )}
          </div>
          <X
            className="h-3.5 w-3.5 text-[#6E7681] hover:text-[#F0F6FC] shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
          />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6E7681] pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#161B22] border border-[#21262D] text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6E7681] animate-spin" />
        )}
      </div>

      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1 max-h-80 overflow-y-auto rounded-lg bg-[#0D1117] border border-[#21262D] shadow-xl">
          {results.length === 0 && !loading && (
            <p className="px-3 py-3 text-xs text-[#6E7681]">
              {query ? `No matches for "${query}"` : "Start typing to search…"}
            </p>
          )}
          {results.map((r, i) => (
            <button
              key={`${r.source}-${r.id}`}
              type="button"
              onMouseEnter={() => setHighlight(i)}
              onClick={() => select(r)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                i === highlight ? "bg-[#161B22]" : "hover:bg-[#161B22]"
              }`}
            >
              <div className="h-7 w-7 rounded bg-[#161B22] border border-[#21262D] overflow-hidden shrink-0 flex items-center justify-center">
                {r.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Feather className="h-3 w-3 text-[#6E7681]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#F0F6FC] truncate">{r.name}</p>
                {r.category && <p className="text-[10px] text-[#6E7681] capitalize">{r.category}</p>}
              </div>
              {r.isMine && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#E8923A] bg-[#E8923A]/10 px-1.5 py-0.5 rounded-full shrink-0">
                  Yours
                </span>
              )}
              {value?.source === r.source && value.id === r.id && (
                <Check className="h-3.5 w-3.5 text-[#E8923A] shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
