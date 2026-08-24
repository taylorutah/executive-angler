'use client';

import { useState } from 'react';
import type { RecipeIngredient } from '@/types/materials';
import { ArrowRightLeft } from 'lucide-react';
import type { ResolvedRecipeRow } from '@/lib/flies/resolveFlyForViewer';
import ProvenanceBadge from './ProvenanceBadge';

/** Minimal material info needed for substitution display */
export interface SubstituteMaterial {
  id: string;
  name: string;
  brand?: string;
  category?: string;
}

interface RecipeCardProps {
  flyName: string;
  flyType?: string;
  flySize?: string;
  ingredients: RecipeIngredient[];
  /** Pre-resolved substitution materials keyed by material ID */
  substitutionMap?: Record<string, SubstituteMaterial>;
  /**
   * When the canonical fly is in the viewer's box, this carries the resolved
   * (yours-or-canonical) row data — keyed by lower-snake slot. Each
   * IngredientRow uses it to swap text + render a "Yours" badge.
   */
  resolvedBySlot?: Record<string, ResolvedRecipeRow>;
  className?: string;
}

export function RecipeCard({ flyName, flyType, flySize, ingredients, substitutionMap, resolvedBySlot, className = '' }: RecipeCardProps) {
  if (ingredients.length === 0) return null;

  const sorted = [...ingredients].sort((a, b) => a.step_position - b.step_position);

  return (
    <div className={`bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-rule)] bg-gradient-to-r from-[var(--action)]/5 to-transparent">
        <h4 className="font-heading text-lg text-[var(--text-primary)]">{flyName}</h4>
        {(flyType || flySize) && (
          <div className="text-xs text-[var(--text-body)] mt-0.5">
            {flyType && <span className="capitalize">{flyType}</span>}
            {flyType && flySize && <span> — </span>}
            {flySize && <span>Size {flySize}</span>}
          </div>
        )}
      </div>

      {/* Ingredients list */}
      <div className="divide-y divide-[#21262D]">
        {sorted.map((ing, idx) => (
          <IngredientRow
            key={ing.id || idx}
            ingredient={ing}
            index={idx}
            substitutionMap={substitutionMap}
            resolved={resolvedBySlot?.[String(ing.role || '').toLowerCase()]}
          />
        ))}
      </div>
    </div>
  );
}

function IngredientRow({
  ingredient: ing,
  index: idx,
  substitutionMap,
  resolved,
}: {
  ingredient: RecipeIngredient;
  index: number;
  substitutionMap?: Record<string, SubstituteMaterial>;
  resolved?: ResolvedRecipeRow;
}) {
  const [showSubs, setShowSubs] = useState(false);

  // Resolve substitutions from the pre-loaded map
  const substitutes: SubstituteMaterial[] = [];
  if (substitutionMap && ing.substitute_ids?.length) {
    for (const subId of ing.substitute_ids) {
      const mat = substitutionMap[subId];
      if (mat) substitutes.push(mat);
    }
  }

  const hasSubs = substitutes.length > 0;
  const isYours = resolved?.source === 'yours';
  const yoursDetails = resolved?.yoursDetails;

  // Choose the headline material name. When Yours, prefer the user's brand+model
  // if they supplied one; otherwise stick with the canonical material name.
  const yoursName = isYours
    ? [yoursDetails?.brand, yoursDetails?.style, yoursDetails?.model].filter(Boolean).join(' ').trim()
    : '';
  const headline = (isYours && yoursName)
    ? yoursName
    : (ing.material?.name || ing.material_name || 'Not specified');

  return (
    <div className={`px-5 py-3 flex items-start gap-4 ${isYours ? 'bg-[var(--action)]/[0.04]' : ''}`}>
      {/* Step number */}
      <div className="w-6 h-6 rounded-full bg-[var(--action)]/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs font-bold text-[var(--action)]">{idx + 1}</span>
      </div>

      <div className="flex-1 min-w-0">
        {/* Role */}
        <div className="text-[10px] text-[var(--text-meta)] uppercase tracking-wide mb-0.5 flex items-center gap-1.5">
          <span>{ing.role}</span>
          {ing.is_optional && <span className="text-[var(--action)]">(optional)</span>}
          {isYours && <ProvenanceBadge size="xs" />}
        </div>

        {/* Material name */}
        <div className={`text-sm font-medium flex items-center gap-2 ${isYours ? 'text-[var(--action)]' : 'text-[var(--text-primary)]'}`}>
          <span>{headline}</span>
          {hasSubs && (
            <button
              onClick={() => setShowSubs(!showSubs)}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--signal-live)]/10 text-[var(--signal-live)] hover:bg-[var(--signal-live)]/20 transition-colors"
              title="View substitutions"
            >
              <ArrowRightLeft className="h-2.5 w-2.5" />
              {substitutes.length} alt{substitutes.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-[var(--text-body)]">
          {isYours ? (
            <>
              {yoursDetails?.size && <span>Size: {yoursDetails.size}</span>}
              {yoursDetails?.color && <span>Color: {yoursDetails.color}</span>}
              {yoursDetails?.denier && <span>{yoursDetails.denier}</span>}
              {/* Show canonical default in muted strikethrough so the user sees what they replaced. */}
              {resolved?.canonicalText && resolved.canonicalText !== headline && (
                <span className="text-[var(--text-meta)] line-through" title="Library default">
                  {resolved.canonicalText}
                </span>
              )}
            </>
          ) : (
            <>
              {ing.material?.brand && <span>{ing.material.brand}</span>}
              {ing.size_choice && <span>Size: {ing.size_choice}</span>}
              {ing.color_choice && <span>Color: {ing.color_choice}</span>}
              {ing.quantity && <span>Qty: {ing.quantity}</span>}
            </>
          )}
        </div>

        {/* Notes */}
        {ing.notes && (
          <div className="text-xs text-[var(--text-meta)] italic mt-1">{ing.notes}</div>
        )}

        {/* Substitutions panel */}
        {hasSubs && showSubs && (
          <div className="mt-2 pl-3 border-l-2 border-[var(--signal-live)]/30 space-y-1.5">
            <div className="text-[10px] text-[var(--signal-live)] uppercase tracking-wide font-semibold">Substitutions</div>
            {substitutes.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2">
                <ArrowRightLeft className="h-3 w-3 text-[var(--signal-live)]/50 shrink-0" />
                <div>
                  <span className="text-xs text-[var(--text-primary)]">{sub.name}</span>
                  {sub.brand && <span className="text-[10px] text-[var(--text-meta)] ml-1.5">{sub.brand}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
