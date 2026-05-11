"use client";

import { useEffect, useState } from "react";
import { Box, Check } from "lucide-react";

/**
 * Inline chip-list of a pattern's variants, shown beneath the FlyPicker on
 * the catch logger. Lets the angler tap a specific variant — "size 16
 * peacock 3mm copper" — so the catch is tied to fly_variants.id, not just
 * to the pattern. Variants already in the user's boxes float to the top.
 *
 * Renders nothing when there are no variants for the pattern.
 */
export interface VariantOption {
  id: string;
  size: string;
  bead_material: string | null;
  bead_weight_mm: number | null;
  bead_color: string | null;
  body_color: string | null;
  rib_color: string | null;
  is_stocked: boolean;
  in_box_count: number;
}

interface Props {
  /** Canonical pattern id — variants under fly_variants where pattern_id = X. */
  patternId: string | null;
  /** Currently-selected variant id (highlighted in the chip list). */
  selectedVariantId: string | null;
  onSelect: (variant: VariantOption) => void;
  onClear: () => void;
}

function formatVariant(v: VariantOption): string {
  const parts: string[] = [v.size];
  if (v.bead_material && v.bead_material !== "none") {
    const bead: string[] = [v.bead_material];
    if (v.bead_weight_mm) bead.push(`${v.bead_weight_mm}mm`);
    if (v.bead_color) bead.push(v.bead_color);
    parts.push(bead.join(" "));
  }
  if (v.body_color) parts.push(v.body_color);
  return parts.join(" · ");
}

export default function VariantQuickPick({
  patternId,
  selectedVariantId,
  onSelect,
  onClear,
}: Props) {
  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patternId) {
      setVariants([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/flies/variants?pattern_id=${encodeURIComponent(patternId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const list = (data.variants ?? []) as VariantOption[];
        // Sort: stocked first, then in-box count, then size.
        list.sort((a, b) => {
          if (a.is_stocked !== b.is_stocked) return a.is_stocked ? -1 : 1;
          if (a.in_box_count !== b.in_box_count) return b.in_box_count - a.in_box_count;
          return Number(a.size) - Number(b.size);
        });
        setVariants(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [patternId]);

  if (!patternId) return null;
  if (!loading && variants.length === 0) return null;

  return (
    <div className="mt-1.5">
      <p className="text-[10px] uppercase tracking-wider text-[#6E7681] mb-1">
        Configurations {loading ? "…" : `(${variants.length})`}
      </p>
      <div className="flex flex-wrap gap-1">
        {selectedVariantId && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center rounded border border-[#21262D] bg-[#0D1117] px-2 py-0.5 text-[10px] text-[#6E7681] hover:text-[#F0F6FC] hover:border-[#E8923A]/40"
          >
            Clear
          </button>
        )}
        {variants.map((v) => {
          const selected = v.id === selectedVariantId;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v)}
              title={v.in_box_count > 0 ? `In ${v.in_box_count} of your boxes` : v.is_stocked ? "Stocked" : "Spec only"}
              className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] transition-colors ${
                selected
                  ? "border-[#E8923A]/60 bg-[#E8923A]/15 text-[#E8923A]"
                  : v.in_box_count > 0
                  ? "border-[#0BA5C7]/40 bg-[#0BA5C7]/10 text-[#0BA5C7] hover:bg-[#0BA5C7]/20"
                  : "border-[#21262D] bg-[#161B22] text-[#A8B2BD] hover:border-[#E8923A]/40 hover:text-[#F0F6FC]"
              }`}
            >
              {selected && <Check className="h-3 w-3" />}
              {v.in_box_count > 0 && !selected && <Box className="h-3 w-3" />}
              <span>{formatVariant(v)}</span>
              {v.in_box_count > 0 && (
                <span className="font-['IBM_Plex_Mono'] text-[10px] opacity-70">{v.in_box_count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
