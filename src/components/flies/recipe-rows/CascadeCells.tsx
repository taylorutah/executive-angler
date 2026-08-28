'use client';

import { useEffect, useState, useMemo } from 'react';
import type { TyingMaterial, MaterialCategory } from '@/types/materials';

// Module-level cache so brand dropdowns don't refetch per row.
const brandsCache = new Map<MaterialCategory, { brand: string; count: number }[]>();
const inflight = new Map<MaterialCategory, Promise<{ brand: string; count: number }[]>>();

function fetchBrands(category: MaterialCategory) {
  if (brandsCache.has(category)) return Promise.resolve(brandsCache.get(category)!);
  if (inflight.has(category)) return inflight.get(category)!;
  const p = fetch(`/api/materials/brands?category=${encodeURIComponent(category)}`)
    .then((r) => (r.ok ? r.json() : []))
    .then((data: { brand: string; count: number }[]) => {
      brandsCache.set(category, data);
      inflight.delete(category);
      return data;
    })
    .catch(() => {
      inflight.delete(category);
      return [] as { brand: string; count: number }[];
    });
  inflight.set(category, p);
  return p;
}

export function useBrands(category: MaterialCategory | undefined) {
  const [brands, setBrands] = useState<{ brand: string; count: number }[]>(
    category ? brandsCache.get(category) || [] : [],
  );
  useEffect(() => {
    if (!category) return;
    let cancel = false;
    fetchBrands(category).then((data) => {
      if (!cancel) setBrands(data);
    });
    return () => {
      cancel = true;
    };
  }, [category]);
  return brands;
}

// Borderless select intended to live inside a shared bordered container with
// its sibling cascade picker, so the two read as one cell.
const groupedSelect =
  'w-full h-8 bg-transparent px-2 text-xs text-[var(--text-1)] placeholder:text-[var(--text-3)] outline-none appearance-none cursor-pointer pr-5';

interface BrandSelectProps {
  category: MaterialCategory;
  value: string;
  onChange: (brand: string) => void;
  ariaLabel: string;
}

export function BrandSelect({ category, value, onChange, ariaLabel }: BrandSelectProps) {
  const brands = useBrands(category);
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={groupedSelect}
        aria-label={ariaLabel}
      >
        <option value="">brand…</option>
        {brands.map((b) => (
          <option key={b.brand} value={b.brand}>
            {b.brand}
          </option>
        ))}
      </select>
    </div>
  );
}

interface BrandFilteredMaterialSelectProps {
  category: MaterialCategory;
  brand: string;
  value: TyingMaterial | null;
  onSelect: (material: TyingMaterial | null) => void;
  placeholder: string;
  ariaLabel: string;
}

// Loads ALL materials for (category, brand) once; user picks via select. The
// catalog is small enough per brand (≤30 rows for the biggest like Hareline
// hooks) that a flat dropdown beats a search box for discovery. When no brand
// is picked yet, renders a static placeholder line — no chevron, no select,
// because there's nothing to open.
export function BrandFilteredMaterialSelect({
  category,
  brand,
  value,
  onSelect,
  placeholder,
  ariaLabel,
}: BrandFilteredMaterialSelectProps) {
  const [materials, setMaterials] = useState<TyingMaterial[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!brand) {
      setMaterials([]);
      return;
    }
    let cancel = false;
    setLoading(true);
    const params = new URLSearchParams({ category, brand, limit: '60' });
    fetch(`/api/materials/search?${params}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: TyingMaterial[]) => {
        if (cancel) return;
        // Sort alphabetically by name within brand
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setMaterials(sorted);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [category, brand]);

  const options = useMemo(() => {
    return materials.map((m) => {
      // Compose a label that surfaces the denier/weight when the name doesn't already include it
      const weight = m.weight && !m.name.toLowerCase().includes(m.weight.toLowerCase()) ? ` (${m.weight})` : '';
      return { id: m.id, label: `${m.name}${weight}` };
    });
  }, [materials]);

  if (!brand) {
    return (
      <div
        className="h-8 px-2 flex items-center text-xs text-[var(--text-3)]"
        aria-label={ariaLabel}
        aria-disabled="true"
      >
        pick a brand first
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={value?.id || ''}
        onChange={(e) => {
          const id = e.target.value;
          const next = materials.find((m) => m.id === id) || null;
          onSelect(next);
        }}
        className={groupedSelect}
        aria-label={ariaLabel}
        disabled={loading}
      >
        <option value="">{loading ? 'loading…' : placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
