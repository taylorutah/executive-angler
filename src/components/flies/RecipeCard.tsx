'use client';

import type { RecipeIngredient } from '@/types/materials';

interface RecipeCardProps {
  flyName: string;
  flyType?: string;
  flySize?: string;
  ingredients: RecipeIngredient[];
  className?: string;
}

export function RecipeCard({ flyName, flyType, flySize, ingredients, className = '' }: RecipeCardProps) {
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
          <div key={ing.id || idx} className="px-5 py-3 flex items-start gap-4">
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
              <div className="text-sm text-[#F0F6FC] font-medium">
                {ing.material?.name || ing.material_name || 'Not specified'}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
