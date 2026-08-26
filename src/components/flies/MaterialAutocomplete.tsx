'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import type { TyingMaterial, MaterialCategory } from '@/types/materials';
import { Search, X, Plus } from "@/icons";
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
  const instanceIdRef = useRef<string>(`mac-${Math.random().toString(36).slice(2, 9)}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debounceRef = useRef<any>(null);

  // Global single-open coordination: when any instance opens its dropdown,
  // every other instance hears the event and closes itself. Prevents the
  // "two recipe rows stacking dropdowns at the same coordinate" bug.
  useEffect(() => {
    const onOtherOpened = (e: Event) => {
      const ce = e as CustomEvent<{ id: string }>;
      if (ce.detail?.id !== instanceIdRef.current) {
        setIsOpen(false);
      }
    };
    window.addEventListener('material-autocomplete-opened', onOtherOpened);
    return () => window.removeEventListener('material-autocomplete-opened', onOtherOpened);
  }, []);

  // Notify other instances when this one opens.
  useEffect(() => {
    if (!isOpen) return;
    window.dispatchEvent(
      new CustomEvent('material-autocomplete-opened', {
        detail: { id: instanceIdRef.current },
      }),
    );
  }, [isOpen]);

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
  // input box moves (scroll, resize, parent layout change). Bails out if
  // the input has zero size (e.g. it's a hidden mobile twin on desktop
  // via Tailwind `md:hidden`) — otherwise the portaled dropdown would
  // render at the page origin (0,0) as a ghost.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const update = () => {
      const el = inputBoxRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) {
        // Element is detached or display:none. Force-close so we don't
        // render an orphan dropdown and so the global "one-open" channel
        // doesn't think this instance is still claiming the slot.
        setIsOpen(false);
        setDropdownRect(null);
        return;
      }
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
      // Walk up looking for the portal sentinel. The attribute is set as
      // an empty string, which is falsy via dataset — must check presence.
      let node: Node | null = target;
      while (node && node instanceof HTMLElement) {
        if (node.hasAttribute('data-material-autocomplete-dropdown')) return;
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
            className="bg-[var(--surface-raised)] border border-[var(--border-strong)] rounded-md shadow-2xl max-h-64 overflow-y-auto"
          >
            {results.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelect(m)}
                className="w-full text-left px-3 py-2 hover:bg-[var(--border-rule)] transition-colors border-b border-[var(--border-rule)] last:border-0"
              >
                <div className="text-sm text-[var(--text-primary)] font-medium">{m.name}</div>
                <div className="text-xs text-[var(--text-meta)]">
                  {m.brand && <span>{m.brand} — </span>}
                  <span className="capitalize">{m.category}</span>
                  {m.subcategory && <span> / {m.subcategory}</span>}
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={handleFreeTextToggle}
              className="w-full text-left px-3 py-2 text-xs text-[var(--action)] hover:bg-[var(--border-rule)]"
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
            className="bg-[var(--surface-raised)] border border-[var(--border-strong)] rounded-md shadow-2xl p-3"
          >
            <div className="text-sm text-[var(--text-meta)]">No materials found</div>
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={handleFreeTextToggle}
                className="text-xs text-[var(--action)] hover:underline"
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
                className="flex items-center gap-1 text-xs text-[var(--signal-live)] hover:underline"
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
            ? 'flex items-center gap-1.5 bg-[var(--surface-page)] border border-[var(--border-strong)] rounded-md px-2 h-8 focus-within:border-[var(--action)]'
            : 'flex items-center gap-2 bg-[var(--surface-page)] border border-[var(--border-rule)] rounded-lg px-3 py-2 focus-within:border-[var(--action)]'
        }
      >
        <Search
          className={
            compact
              ? 'w-3 h-3 text-[var(--text-meta)] shrink-0'
              : 'w-4 h-4 text-[var(--text-meta)] shrink-0'
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
              ? 'flex-1 bg-transparent text-[13px] text-[var(--text-primary)] placeholder-[#6E7681] outline-none min-w-0'
              : 'flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[#6E7681] outline-none min-w-0'
          }
        />
        {loading && (
          <div className="w-3 h-3 border-2 border-[var(--action)] border-t-transparent rounded-full animate-spin" />
        )}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[var(--text-meta)] hover:text-[var(--text-primary)]"
          >
            <X className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </button>
        )}
      </div>

      {useFreeText && (
        <div className="mt-1 text-[10px] text-[var(--action)]">
          Free text —{' '}
          <button
            type="button"
            onClick={() => {
              setUseFreeText(false);
              setIsOpen(true);
            }}
            className="underline hover:text-[var(--text-primary)]"
          >
            search db
          </button>
        </div>
      )}

      {/* Portal the results dropdown so it escapes any overflow:hidden /
          stacking-context ancestor (recipe table rows, sheet panels, etc). */}
      {dropdown && createPortal(dropdown, document.body)}

      {showSubmitForm && (
        <div className="mt-2 rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] p-4">
          <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Submit a New Material</h4>
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
