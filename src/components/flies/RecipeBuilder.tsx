'use client';

import { useState, useCallback } from 'react';
import { MaterialAutocomplete } from './MaterialAutocomplete';
import type { TyingMaterial, RecipeRole } from '@/types/materials';
import { Plus, GripVertical, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import {
  ROLE_FIELDS,
  RECIPE_ROLES,
  getRoleFields,
  getFieldLabel,
  type RoleField,
} from '@/lib/flies/role-field-config';

export interface RecipeStep {
  id: string;
  role: RecipeRole;
  material: TyingMaterial | null;
  materialName: string;
  colorChoice: string;
  sizeChoice: string;
  quantity: string;
  weightChoice: string;
  materialTypeChoice: string;
  finishChoice: string;
  notes: string;
  isOptional: boolean;
}

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
    quantity: ROLE_FIELDS[role]?.quantityDefault ?? '',
    weightChoice: '',
    materialTypeChoice: '',
    finishChoice: '',
    notes: '',
    isOptional: false,
  };
}

const cellInput =
  'w-full h-8 bg-[#0D1117] border border-[#30363D] rounded-md px-2 text-[13px] text-[#F0F6FC] placeholder-[#6E7681] outline-none focus:border-[#E8923A] transition-colors';
const cellSelect = `${cellInput} appearance-none cursor-pointer pr-6`;

export function RecipeBuilder({ initialSteps, onChange }: RecipeBuilderProps) {
  const [steps, setSteps] = useState<RecipeStep[]>(
    initialSteps && initialSteps.length > 0
      ? initialSteps
      : [createEmptyStep('hook'), createEmptyStep('bead'), createEmptyStep('thread')]
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
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

  const handleRoleChange = (idx: number, role: RecipeRole) => {
    const cfg = getRoleFields(role);
    updateStep(idx, {
      role,
      material: null,
      materialName: '',
      colorChoice: '',
      sizeChoice: '',
      weightChoice: '',
      materialTypeChoice: '',
      finishChoice: '',
      quantity: cfg.quantityDefault ?? '',
    });
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

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      moveStep(dragIdx, idx);
      setDragIdx(idx);
    }
  };
  const handleDragEnd = () => setDragIdx(null);

  const renderField = (idx: number, step: RecipeStep, field: RoleField) => {
    const cfg = getRoleFields(step.role);
    const placeholder = cfg.placeholders?.[field];
    switch (field) {
      case 'size': {
        const options = step.material?.sizes ?? [];
        return options.length > 0 ? (
          <select
            value={step.sizeChoice}
            onChange={(e) => updateStep(idx, { sizeChoice: e.target.value })}
            className={cellSelect}
          >
            <option value="">—</option>
            {options.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={step.sizeChoice}
            onChange={(e) => updateStep(idx, { sizeChoice: e.target.value })}
            placeholder={placeholder ?? ''}
            className={cellInput}
          />
        );
      }
      case 'color': {
        const options = step.material?.colors ?? [];
        return options.length > 0 ? (
          <select
            value={step.colorChoice}
            onChange={(e) => updateStep(idx, { colorChoice: e.target.value })}
            className={cellSelect}
          >
            <option value="">—</option>
            {options.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={step.colorChoice}
            onChange={(e) => updateStep(idx, { colorChoice: e.target.value })}
            placeholder={placeholder ?? ''}
            className={cellInput}
          />
        );
      }
      case 'quantity':
        return (
          <input
            type="text"
            value={step.quantity}
            onChange={(e) => updateStep(idx, { quantity: e.target.value })}
            placeholder={placeholder ?? '1'}
            className={cellInput}
          />
        );
      case 'weight':
        return (
          <input
            type="text"
            value={step.weightChoice}
            onChange={(e) => updateStep(idx, { weightChoice: e.target.value })}
            placeholder={placeholder ?? ''}
            className={cellInput}
          />
        );
      case 'materialType':
        return (
          <input
            type="text"
            value={step.materialTypeChoice}
            onChange={(e) => updateStep(idx, { materialTypeChoice: e.target.value })}
            placeholder={placeholder ?? ''}
            className={cellInput}
          />
        );
      case 'finish':
        return (
          <input
            type="text"
            value={step.finishChoice}
            onChange={(e) => updateStep(idx, { finishChoice: e.target.value })}
            placeholder={placeholder ?? ''}
            className={cellInput}
          />
        );
      case 'length':
        return (
          <input
            type="text"
            value={step.sizeChoice}
            onChange={(e) => updateStep(idx, { sizeChoice: e.target.value })}
            placeholder={placeholder ?? ''}
            className={cellInput}
          />
        );
    }
  };

  return (
    <div className="border border-[#30363D] rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[#30363D] bg-[#0D1117] px-2 py-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E7681]">
          {steps.length} {steps.length === 1 ? 'step' : 'steps'}
        </span>
        <button
          type="button"
          onClick={() => addStep()}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#A8B2BD] hover:text-[#E8923A] transition-colors"
        >
          <Plus className="w-3 h-3" /> Add step
        </button>
      </div>

      {/* Header row */}
      <div className="hidden md:grid grid-cols-[20px_120px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_20px_20px] items-center gap-1 border-b border-[#30363D] bg-[#161B22] px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#6E7681]">
        <span />
        <span>Role</span>
        <span>Material</span>
        <span>Field 1</span>
        <span>Field 2</span>
        <span>Field 3</span>
        <span />
        <span />
      </div>

      {steps.map((step, idx) => {
        const cfg = getRoleFields(step.role);
        const isOpen = !!expanded[step.id];
        const fieldsToShow = cfg.fields.slice(0, 3);
        return (
          <div
            key={step.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            className={`border-b border-[#21262D] last:border-b-0 ${
              dragIdx === idx
                ? 'opacity-60 bg-[rgba(232,146,58,0.08)]'
                : idx % 2 === 1
                ? 'bg-[#0D1117]'
                : 'bg-[#161B22]'
            } hover:bg-[rgba(232,146,58,0.05)] transition-colors`}
          >
            {/* Compact row (desktop grid, mobile stacked) */}
            <div className="grid md:grid-cols-[20px_120px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_20px_20px] items-center gap-1 px-2 py-1.5 grid-cols-[20px_1fr_20px]">
              {/* Drag handle */}
              <button
                type="button"
                className="cursor-grab active:cursor-grabbing text-[#484F58] hover:text-[#A8B2BD]"
                aria-label="Drag to reorder"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>

              {/* Role */}
              <div className="relative md:col-auto col-span-1">
                <select
                  value={step.role}
                  onChange={(e) => handleRoleChange(idx, e.target.value as RecipeRole)}
                  className={`${cellSelect} font-medium`}
                >
                  {RECIPE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_FIELDS[r].label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#6E7681] pointer-events-none" />
              </div>

              {/* Material picker */}
              <div className="md:col-auto col-span-3">
                <MaterialAutocomplete
                  category={cfg.materialCategory}
                  value={step.material}
                  freeText={step.materialName}
                  onSelect={(mat, freeText) => {
                    updateStep(idx, {
                      material: mat,
                      materialName: freeText || mat?.name || '',
                    });
                  }}
                  placeholder={`Search ${cfg.label.toLowerCase()}…`}
                  compact
                />
              </div>

              {/* Schema-driven fields (3 max in row; rest only via expanded) */}
              {[0, 1, 2].map((slot) => {
                const field = fieldsToShow[slot];
                return (
                  <div key={slot} className="md:col-auto hidden md:block">
                    {field ? renderField(idx, step, field) : null}
                  </div>
                );
              })}

              {/* Expand toggle */}
              <button
                type="button"
                onClick={() =>
                  setExpanded((e) => ({ ...e, [step.id]: !e[step.id] }))
                }
                className="text-[#484F58] hover:text-[#E8923A] transition-colors"
                aria-label={isOpen ? 'Collapse step' : 'Expand step'}
              >
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeStep(idx)}
                className="text-[#484F58] hover:text-red-400 transition-colors"
                aria-label="Delete step"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile: render fields under header in a stack */}
            <div className="md:hidden px-2 pb-2 space-y-1.5">
              {cfg.fields.map((field) => (
                <div key={field}>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6E7681] block mb-0.5">
                    {getFieldLabel(field)}
                  </label>
                  {renderField(idx, step, field)}
                </div>
              ))}
            </div>

            {/* Expanded inline panel */}
            {isOpen && (
              <div className="border-t border-[#21262D] bg-[#0D1117] px-3 py-2 space-y-2">
                {/* Any extra fields beyond the 3 visible in row */}
                {cfg.fields.length > 3 && (
                  <div className="hidden md:grid grid-cols-3 gap-2">
                    {cfg.fields.slice(3).map((field) => (
                      <div key={field}>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#6E7681] block mb-0.5">
                          {getFieldLabel(field)}
                        </label>
                        {renderField(idx, step, field)}
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6E7681] block mb-0.5">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={step.notes}
                    onChange={(e) => updateStep(idx, { notes: e.target.value })}
                    placeholder="tie in at 60% mark, dub sparse…"
                    className={cellInput}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={step.isOptional}
                    onChange={(e) => updateStep(idx, { isOptional: e.target.checked })}
                    className="rounded border-[#30363D] bg-[#0D1117] text-[#E8923A] h-3.5 w-3.5"
                  />
                  <span className="text-[11px] text-[#A8B2BD]">Optional step</span>
                </label>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
