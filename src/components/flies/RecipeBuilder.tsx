'use client';

import { useState, useCallback } from 'react';
import { MaterialAutocomplete } from './MaterialAutocomplete';
import type { TyingMaterial, RecipeRole, MaterialCategory } from '@/types/materials';
import { Plus, GripVertical, Trash2, ChevronDown } from 'lucide-react';

export interface RecipeStep {
  id: string;
  role: RecipeRole;
  material: TyingMaterial | null;
  materialName: string; // free text fallback
  colorChoice: string;
  sizeChoice: string;
  quantity: string;
  notes: string;
  isOptional: boolean;
}

const ROLES: { value: RecipeRole; label: string; defaultCategory?: MaterialCategory }[] = [
  { value: 'hook', label: 'Hook', defaultCategory: 'hook' },
  { value: 'bead', label: 'Bead', defaultCategory: 'bead' },
  { value: 'thread', label: 'Thread', defaultCategory: 'thread' },
  { value: 'tail', label: 'Tail' },
  { value: 'abdomen', label: 'Abdomen' },
  { value: 'body', label: 'Body' },
  { value: 'ribbing', label: 'Ribbing' },
  { value: 'thorax', label: 'Thorax' },
  { value: 'shellback', label: 'Shellback / Wing Case' },
  { value: 'wing', label: 'Wing' },
  { value: 'hackle', label: 'Hackle' },
  { value: 'legs', label: 'Legs' },
  { value: 'collar', label: 'Collar' },
  { value: 'head', label: 'Head' },
  { value: 'hotspot', label: 'Hotspot' },
  { value: 'tag', label: 'Tag' },
  { value: 'eye', label: 'Eyes', defaultCategory: 'eye' },
  { value: 'post', label: 'Post' },
  { value: 'antennae', label: 'Antennae' },
];

interface RecipeBuilderProps {
  initialSteps?: RecipeStep[];
  onChange: (steps: RecipeStep[]) => void;
}

let nextId = 1;
function genId() {
  return `step-${Date.now()}-${nextId++}`;
}

function createEmptyStep(role: RecipeRole = 'hook'): RecipeStep {
  return {
    id: genId(),
    role,
    material: null,
    materialName: '',
    colorChoice: '',
    sizeChoice: '',
    quantity: '',
    notes: '',
    isOptional: false,
  };
}

export function RecipeBuilder({ initialSteps, onChange }: RecipeBuilderProps) {
  const [steps, setSteps] = useState<RecipeStep[]>(
    initialSteps && initialSteps.length > 0
      ? initialSteps
      : [createEmptyStep('hook'), createEmptyStep('bead'), createEmptyStep('thread')]
  );
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const updateSteps = useCallback(
    (newSteps: RecipeStep[]) => {
      setSteps(newSteps);
      onChange(newSteps);
    },
    [onChange]
  );

  const updateStep = (idx: number, patch: Partial<RecipeStep>) => {
    const newSteps = [...steps];
    newSteps[idx] = { ...newSteps[idx], ...patch };
    updateSteps(newSteps);
  };

  const addStep = (role: RecipeRole = 'body') => {
    updateSteps([...steps, createEmptyStep(role)]);
  };

  const removeStep = (idx: number) => {
    updateSteps(steps.filter((_, i) => i !== idx));
  };

  const moveStep = (from: number, to: number) => {
    if (to < 0 || to >= steps.length) return;
    const newSteps = [...steps];
    const [moved] = newSteps.splice(from, 1);
    newSteps.splice(to, 0, moved);
    updateSteps(newSteps);
  };

  const handleDragStart = (idx: number) => {
    setDragIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      moveStep(dragIdx, idx);
      setDragIdx(idx);
    }
  };

  const handleDragEnd = () => {
    setDragIdx(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#F0F6FC] uppercase tracking-wide">Recipe Steps</h3>
        <span className="text-xs text-[#6E7681]">{steps.length} steps</span>
      </div>

      {steps.map((step, idx) => {
        const roleDef = ROLES.find((r) => r.value === step.role);
        return (
          <div
            key={step.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            className={`bg-[#161B22] border rounded-lg p-4 transition-colors ${
              dragIdx === idx ? 'border-[#E8923A] opacity-60' : 'border-[#21262D]'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Drag handle */}
              <div className="pt-2 cursor-grab active:cursor-grabbing text-[#6E7681] hover:text-[#A8B2BD]">
                <GripVertical className="w-4 h-4" />
              </div>

              <div className="flex-1 space-y-3">
                {/* Role + material */}
                <div className="flex gap-3">
                  <div className="w-40 shrink-0">
                    <label className="text-[10px] text-[#6E7681] uppercase tracking-wide mb-1 block">Role</label>
                    <div className="relative">
                      <select
                        value={step.role}
                        onChange={(e) => updateStep(idx, { role: e.target.value as RecipeRole })}
                        className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] appearance-none cursor-pointer"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E7681] pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="text-[10px] text-[#6E7681] uppercase tracking-wide mb-1 block">Material</label>
                    <MaterialAutocomplete
                      category={roleDef?.defaultCategory}
                      value={step.material}
                      freeText={step.materialName}
                      onSelect={(mat, freeText) => {
                        updateStep(idx, {
                          material: mat,
                          materialName: freeText || mat?.name || '',
                        });
                      }}
                      placeholder={`Search ${step.role}s...`}
                    />
                  </div>
                </div>

                {/* Size, color, quantity row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-[#6E7681] uppercase tracking-wide mb-1 block">Size</label>
                    {step.material?.sizes && step.material.sizes.length > 0 ? (
                      <select
                        value={step.sizeChoice}
                        onChange={(e) => updateStep(idx, { sizeChoice: e.target.value })}
                        className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] appearance-none"
                      >
                        <option value="">Select size</option>
                        {step.material.sizes.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={step.sizeChoice}
                        onChange={(e) => updateStep(idx, { sizeChoice: e.target.value })}
                        placeholder="e.g. #16"
                        className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] outline-none"
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] text-[#6E7681] uppercase tracking-wide mb-1 block">Color</label>
                    {step.material?.colors && step.material.colors.length > 0 ? (
                      <select
                        value={step.colorChoice}
                        onChange={(e) => updateStep(idx, { colorChoice: e.target.value })}
                        className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] appearance-none"
                      >
                        <option value="">Select color</option>
                        {step.material.colors.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={step.colorChoice}
                        onChange={(e) => updateStep(idx, { colorChoice: e.target.value })}
                        placeholder="e.g. olive"
                        className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] outline-none"
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] text-[#6E7681] uppercase tracking-wide mb-1 block">Qty</label>
                    <input
                      type="text"
                      value={step.quantity}
                      onChange={(e) => updateStep(idx, { quantity: e.target.value })}
                      placeholder="e.g. 1, pinch"
                      className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <input
                  type="text"
                  value={step.notes}
                  onChange={(e) => updateStep(idx, { notes: e.target.value })}
                  placeholder="Notes (e.g. tie in at 60% mark, dub sparse)"
                  className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] outline-none"
                />

                {/* Optional toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={step.isOptional}
                    onChange={(e) => updateStep(idx, { isOptional: e.target.checked })}
                    className="rounded border-[#21262D] bg-[#0D1117] text-[#E8923A]"
                  />
                  <span className="text-xs text-[#6E7681]">Optional step</span>
                </label>
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeStep(idx)}
                className="pt-2 text-[#6E7681] hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Add step */}
      <button
        type="button"
        onClick={() => addStep()}
        className="w-full border border-dashed border-[#21262D] rounded-lg py-3 text-sm text-[#6E7681] hover:text-[#E8923A] hover:border-[#E8923A] transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Step
      </button>
    </div>
  );
}
