'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import type { TyingMaterial, MaterialCategory } from '@/types/materials';
import { Search, X, Plus } from 'lucide-react';
import { SubmitMaterialForm } from './SubmitMaterialForm';

interface MaterialAutocompleteProps {
  category?: MaterialCategory;
  value?: TyingMaterial | null;
  freeText?: string;
  onSelect: (material: TyingMaterial | null, freeText?: string) => void;
  placeholder?: string;
  /** Compact 32-px row style for use inside dense recipe tables. */
  compact?: boolean;
}

export function MaterialAutocomplete({
  category,
  value,
  freeText: initialFreeText,
  onSelect,
  placeholder = 'Search materials...',
  compact = false,
}: MaterialAutocompleteProps) {
  const [query, setQuery] = useState(value?.name || initialFreeText || '');
  const [results, setResults] = useState<TyingMaterial[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useFreeText, setUseFreeText] = useState(!!initialFreeText && !value);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputBoxRef = useRef<HTMLDivElement>(null);
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

  // Compute portal-relative position whenever the dropdown opens or the
  // input box moves (scroll, resize, parent layout change).
  useLayoutEffect(() => {
    if (!isOpen) return;
    const update = () => {
      const el = inputBoxRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setDropdownRect({
        top: r.bottom + window.scrollY + 4,
        left: r.left + window.scrollX,
        width: r.width,
      });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen]);

  // Close dropdown on outside click. Need to also include the portaled
  // dropdown node so clicking inside it doesn't close the menu.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current && containerRef.current.contains(target)) return;
      // Walk up looking for the portal sentinel.
      let node: Node | null = target;
      while (node && node instanceof HTMLElement) {
        if (node.dataset?.materialAutocompleteDropdown) return;
        node = node.parentElement;
      }
      setIsOpen(false);
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

  const dropdown =
    typeof window !== 'undefined' && isOpen && dropdownRect ? (
      <>
        {results.length > 0 && (
          <div
            data-material-autocomplete-dropdown=""
            style={{
              position: 'absolute',
              top: dropdownRect.top,
              left: dropdownRect.left,
              width: Math.max(dropdownRect.width, 280),
              zIndex: 9999,
            }}
            className="bg-[#161B22] border border-[#30363D] rounded-md shadow-2xl max-h-64 overflow-y-auto"
          >
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
        {!loading && results.length === 0 && query.length >= 2 && !showSubmitForm && (
          <div
            data-material-autocomplete-dropdown=""
            style={{
              position: 'absolute',
              top: dropdownRect.top,
              left: dropdownRect.left,
              width: Math.max(dropdownRect.width, 280),
              zIndex: 9999,
            }}
            className="bg-[#161B22] border border-[#30363D] rounded-md shadow-2xl p-3"
          >
            <div className="text-sm text-[#6E7681]">No materials found</div>
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={handleFreeTextToggle}
                className="text-xs text-[#E8923A] hover:underline"
              >
                Use free text instead
              </button>
              <span className="text-xs text-[#484F58]">or</span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowSubmitForm(true);
                }}
                className="flex items-center gap-1 text-xs text-[#0BA5C7] hover:underline"
              >
                <Plus className="w-3 h-3" />
                Submit a new material
              </button>
            </div>
          </div>
        )}
      </>
    ) : null;

  return (
    <div ref={containerRef} className="relative">
      <div
        ref={inputBoxRef}
        className={
          compact
            ? 'flex items-center gap-1.5 bg-[#0D1117] border border-[#30363D] rounded-md px-2 h-8 focus-within:border-[#E8923A]'
            : 'flex items-center gap-2 bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 focus-within:border-[#E8923A]'
        }
      >
        <Search
          className={
            compact
              ? 'w-3 h-3 text-[#6E7681] shrink-0'
              : 'w-4 h-4 text-[#6E7681] shrink-0'
          }
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => !useFreeText && query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className={
            compact
              ? 'flex-1 bg-transparent text-[13px] text-[#F0F6FC] placeholder-[#6E7681] outline-none min-w-0'
              : 'flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#6E7681] outline-none min-w-0'
          }
        />
        {loading && (
          <div className="w-3 h-3 border-2 border-[#E8923A] border-t-transparent rounded-full animate-spin" />
        )}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[#6E7681] hover:text-[#F0F6FC]"
          >
            <X className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </button>
        )}
      </div>

      {useFreeText && (
        <div className="mt-1 text-[10px] text-[#E8923A]">
          Free text —{' '}
          <button
            type="button"
            onClick={() => {
              setUseFreeText(false);
              setIsOpen(true);
            }}
            className="underline hover:text-[#F0F6FC]"
          >
            search db
          </button>
        </div>
      )}

      {/* Portal the results dropdown so it escapes any overflow:hidden /
          stacking-context ancestor (recipe table rows, sheet panels, etc). */}
      {dropdown && createPortal(dropdown, document.body)}

      {showSubmitForm && (
        <div className="mt-2 rounded-lg border border-[#21262D] bg-[#161B22] p-4">
          <h4 className="text-sm font-medium text-[#F0F6FC] mb-3">Submit a New Material</h4>
          <SubmitMaterialForm
            initialName={query}
            initialCategory={category}
            onSuccess={() => {
              setShowSubmitForm(false);
            }}
            onCancel={() => setShowSubmitForm(false)}
          />
        </div>
      )}
    </div>
  );
}
