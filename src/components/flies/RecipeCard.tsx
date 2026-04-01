'use client';

import { useState } from 'react';
import type { RecipeIngredient } from '@/types/materials';
import { ArrowRightLeft } from 'lucide-react';

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
  className?: string;
}

export function RecipeCard({ flyName, flyType, flySize, ingredients, substitutionMap, className = '' }: RecipeCardProps) {
  if (ingredients.length === 0) return null;

  const sorted = [...ingredients].sort((a, b) => a.step_position - b.step_position);

  return (
    <div className={`bg-[#161B22] border border-[#21262D] rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#21262D] bg-gradient-to-r from-[#E8923A]/5 to-transparent">
        <h4 className="font-heading text-lg text-[#F0F6FC]">{flyName}</h4>
        {(flyType || flySize) && (
          <div className="text-xs text-[#A8B2BD] mt-0.5">
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
}: {
  ingredient: RecipeIngredient;
  index: number;
  substitutionMap?: Record<string, SubstituteMaterial>;
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

  return (
    <div className="px-5 py-3 flex items-start gap-4">
      {/* Step number */}
      <div className="w-6 h-6 rounded-full bg-[#E8923A]/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs font-bold text-[#E8923A]">{idx + 1}</span>
      </div>

      <div className="flex-1 min-w-0">
        {/* Role */}
        <div className="text-[10px] text-[#6E7681] uppercase tracking-wide mb-0.5">
          {ing.role}
          {ing.is_optional && <span className="ml-1 text-[#E8923A]">(optional)</span>}
        </div>

        {/* Material name */}
        <div className="text-sm text-[#F0F6FC] font-medium flex items-center gap-2">
          <span>{ing.material?.name || ing.material_name || 'Not specified'}</span>
          {hasSubs && (
            <button
              onClick={() => setShowSubs(!showSubs)}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#0BA5C7]/10 text-[#0BA5C7] hover:bg-[#0BA5C7]/20 transition-colors"
              title="View substitutions"
            >
              <ArrowRightLeft className="h-2.5 w-2.5" />
              {substitutes.length} alt{substitutes.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-[#A8B2BD]">
          {ing.material?.brand && <span>{ing.material.brand}</span>}
          {ing.size_choice && <span>Size: {ing.size_choice}</span>}
          {ing.color_choice && <span>Color: {ing.color_choice}</span>}
          {ing.quantity && <span>Qty: {ing.quantity}</span>}
        </div>

        {/* Notes */}
        {ing.notes && (
          <div className="text-xs text-[#6E7681] italic mt-1">{ing.notes}</div>
        )}

        {/* Substitutions panel */}
        {hasSubs && showSubs && (
          <div className="mt-2 pl-3 border-l-2 border-[#0BA5C7]/30 space-y-1.5">
            <div className="text-[10px] text-[#0BA5C7] uppercase tracking-wide font-semibold">Substitutions</div>
            {substitutes.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2">
                <ArrowRightLeft className="h-3 w-3 text-[#0BA5C7]/50 shrink-0" />
                <div>
                  <span className="text-xs text-[#F0F6FC]">{sub.name}</span>
                  {sub.brand && <span className="text-[10px] text-[#6E7681] ml-1.5">{sub.brand}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
