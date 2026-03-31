'use client';

import { useState, useEffect, useRef } from 'react';
import type { TyingMaterial, MaterialCategory } from '@/types/materials';
import { Search, X } from 'lucide-react';

interface MaterialAutocompleteProps {
  category?: MaterialCategory;
  value?: TyingMaterial | null;
  freeText?: string;
  onSelect: (material: TyingMaterial | null, freeText?: string) => void;
  placeholder?: string;
}

export function MaterialAutocomplete({
  category,
  value,
  freeText: initialFreeText,
  onSelect,
  placeholder = 'Search materials...',
}: MaterialAutocompleteProps) {
  const [query, setQuery] = useState(value?.name || initialFreeText || '');
  const [results, setResults] = useState<TyingMaterial[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useFreeText, setUseFreeText] = useState(!!initialFreeText && !value);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    if (!query || query.length < 2 || useFreeText) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query, limit: '8' });
        if (category) params.set('category', category);
        const res = await fetch(`/api/materials/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [query, category, useFreeText]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (material: TyingMaterial) => {
    setQuery(material.name);
    setIsOpen(false);
    setUseFreeText(false);
    onSelect(material);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setUseFreeText(false);
    onSelect(null);
  };

  const handleFreeTextToggle = () => {
    setUseFreeText(true);
    setIsOpen(false);
    setResults([]);
    onSelect(null, query);
  };

  const handleInputChange = (val: string) => {
    setQuery(val);
    if (useFreeText) {
      onSelect(null, val);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 focus-within:border-[#E8923A]">
        <Search className="w-4 h-4 text-[#6E7681] shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => !useFreeText && query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#6E7681] outline-none"
        />
        {loading && (
          <div className="w-4 h-4 border-2 border-[#E8923A] border-t-transparent rounded-full animate-spin" />
        )}
        {query && (
          <button onClick={handleClear} className="text-[#6E7681] hover:text-[#F0F6FC]">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {useFreeText && (
        <div className="mt-1 text-xs text-[#E8923A]">
          Free text mode —{' '}
          <button
            type="button"
            onClick={() => { setUseFreeText(false); setIsOpen(true); }}
            className="underline hover:text-[#F0F6FC]"
          >
            search database
          </button>
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-[#161B22] border border-[#21262D] rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {results.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleSelect(m)}
              className="w-full text-left px-3 py-2 hover:bg-[#21262D] transition-colors border-b border-[#21262D] last:border-0"
            >
              <div className="text-sm text-[#F0F6FC] font-medium">{m.name}</div>
              <div className="text-xs text-[#6E7681]">
                {m.brand && <span>{m.brand} — </span>}
                <span className="capitalize">{m.category}</span>
                {m.subcategory && <span> / {m.subcategory}</span>}
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={handleFreeTextToggle}
            className="w-full text-left px-3 py-2 text-xs text-[#E8923A] hover:bg-[#21262D]"
          >
            Can&apos;t find it? Type it in as free text
          </button>
        </div>
      )}

      {isOpen && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full bg-[#161B22] border border-[#21262D] rounded-lg shadow-xl p-3">
          <div className="text-sm text-[#6E7681]">No materials found</div>
          <button
            type="button"
            onClick={handleFreeTextToggle}
            className="mt-1 text-xs text-[#E8923A] hover:underline"
          >
            Use free text instead
          </button>
        </div>
      )}
    </div>
  );
}
