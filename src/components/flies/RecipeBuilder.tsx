'use client';

import { useState, useEffect, useCallback } from 'react';
import { MaterialAutocomplete } from './MaterialAutocomplete';
import type { TyingMaterial, RecipeRole } from '@/types/materials';
import { Plus, GripVertical, Trash2, ChevronDown } from 'lucide-react';
import {
  ROLE_FIELDS,
  RECIPE_ROLES,
  getRoleFields,
  detailLabel,
} from '@/lib/flies/role-field-config';
import { composeBeadName } from '@/lib/flies/legacy-recipe-adapter';

const BEAD_MATERIALS = ['none', 'tungsten', 'brass', 'copper', 'glass'] as const;
const BEAD_SHAPES = ['standard', 'slotted', 'countersunk', 'inverted', 'off-center'] as const;
const COMMON_BEAD_SIZES_MM = ['2.0', '2.4', '2.8', '3.2', '3.5', '3.8', '4.0', '4.6'];
const COMMON_BEAD_COLORS = [
  'copper',
  'gold',
  'black nickel',
  'silver',
  'white',
  'fl. orange',
  'fl. pink',
  'matte black',
];

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

/**
 * Shared inline cell renderers for the bead row — Material, Color, Size (mm),
 * Shape. Used by both desktop (table) and mobile (stacked) layouts so we don't
 * drift. Always 4 inputs; no MaterialAutocomplete on the bead row.
 */
interface BeadCellProps {
  step: RecipeStep;
  onChange: (patch: Partial<RecipeStep>) => void;
  cellInput: string;
  cellSelect: string;
}

function BeadMaterialSelect({ step, onChange, cellSelect }: BeadCellProps) {
  return (
    <div className="relative">
      <select
        value={step.materialTypeChoice}
        onChange={(e) => onChange({ materialTypeChoice: e.target.value })}
        className={cellSelect}
        aria-label="Bead material"
      >
        <option value="">material…</option>
        {BEAD_MATERIALS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#6E7681] pointer-events-none" />
    </div>
  );
}

function BeadShapeSelect({ step, onChange, cellSelect }: BeadCellProps) {
  return (
    <div className="relative">
      <select
        value={step.finishChoice}
        onChange={(e) => onChange({ finishChoice: e.target.value })}
        className={cellSelect}
        aria-label="Bead shape"
      >
        <option value="">shape…</option>
        {BEAD_SHAPES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#6E7681] pointer-events-none" />
    </div>
  );
}

function BeadSizeInput({ step, onChange, cellInput }: BeadCellProps) {
  return (
    <>
      <input
        type="text"
        inputMode="decimal"
        list="bead-sizes-mm-rb"
        value={step.sizeChoice}
        onChange={(e) => onChange({ sizeChoice: e.target.value })}
        placeholder="3.2"
        className={cellInput}
        aria-label="Bead size mm"
      />
      <datalist id="bead-sizes-mm-rb">
        {COMMON_BEAD_SIZES_MM.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </>
  );
}

function BeadColorInput({ step, onChange, cellInput }: BeadCellProps) {
  return (
    <>
      <input
        type="text"
        list="bead-colors-rb"
        value={step.colorChoice}
        onChange={(e) => onChange({ colorChoice: e.target.value })}
        placeholder="copper"
        className={cellInput}
        aria-label="Bead color"
      />
      <datalist id="bead-colors-rb">
        {COMMON_BEAD_COLORS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </>
  );
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
  'w-full h-7 bg-[#0D1117] border border-[#30363D] rounded px-2 text-[12px] text-[#F0F6FC] placeholder-[#6E7681] outline-none focus:border-[#E8923A] transition-colors';
const cellSelect = `${cellInput} appearance-none cursor-pointer pr-5`;

// Fixed Salesforce-style grid: drag(20) | #(28) | role(110) | material(1.4fr) | size(90) | color(110) | detail(110) | notes(1fr) | opt(28) | del(24)
// Static classes — Tailwind JIT requires literal strings (no template interpolation).
const ROW_GRID =
  'hidden md:grid md:items-center md:gap-1 md:px-2 md:py-1 md:grid-cols-[20px_28px_110px_minmax(0,1.4fr)_90px_110px_110px_minmax(0,1fr)_28px_24px]';

export function RecipeBuilder({ initialSteps, onChange }: RecipeBuilderProps) {
  const [steps, setSteps] = useState<RecipeStep[]>(
    initialSteps && initialSteps.length > 0
      ? initialSteps
      : [createEmptyStep('hook'), createEmptyStep('bead'), createEmptyStep('thread')]
  );
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Re-hydrate when the parent passes fresh initialSteps after async load
  // (Edit page loads ingredients after mount). We only swap if the incoming
  // array reference changes AND has content — preserves user edits in flight.
  useEffect(() => {
    if (initialSteps && initialSteps.length > 0) {
      setSteps(initialSteps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSteps]);

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

  const renderSize = (idx: number, step: RecipeStep) => {
    const cfg = getRoleFields(step.role);
    if (!cfg.showSize) return <span className="text-[#484F58] text-[12px] text-center">—</span>;
    const options = step.material?.sizes ?? [];
    const listId = options.length > 0 ? `sizes-${step.id}` : undefined;
    return (
      <>
        <input
          type="text"
          list={listId}
          value={step.sizeChoice}
          onChange={(e) => updateStep(idx, { sizeChoice: e.target.value })}
          placeholder={cfg.placeholders?.size ?? ''}
          className={cellInput}
        />
        {listId && (
          <datalist id={listId}>
            {options.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        )}
      </>
    );
  };

  const renderColor = (idx: number, step: RecipeStep) => {
    const cfg = getRoleFields(step.role);
    if (!cfg.showColor) return <span className="text-[#484F58] text-[12px] text-center">—</span>;
    const options = step.material?.colors ?? [];
    const listId = options.length > 0 ? `colors-${step.id}` : undefined;
    return (
      <>
        <input
          type="text"
          list={listId}
          value={step.colorChoice}
          onChange={(e) => updateStep(idx, { colorChoice: e.target.value })}
          placeholder={cfg.placeholders?.color ?? ''}
          className={cellInput}
        />
        {listId && (
          <datalist id={listId}>
            {options.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        )}
      </>
    );
  };

  const renderDetail = (idx: number, step: RecipeStep) => {
    const cfg = getRoleFields(step.role);
    if (!cfg.detail) return <span className="text-[#484F58] text-[12px] text-center">—</span>;
    const placeholder = cfg.placeholders?.detail ?? '';
    switch (cfg.detail) {
      case 'weight':
        return (
          <input
            type="text"
            value={step.weightChoice || step.material?.weight || ''}
            onChange={(e) => updateStep(idx, { weightChoice: e.target.value })}
            placeholder={placeholder}
            className={cellInput}
          />
        );
      case 'materialType':
        return (
          <input
            type="text"
            value={step.materialTypeChoice || step.material?.material_type || ''}
            onChange={(e) => updateStep(idx, { materialTypeChoice: e.target.value })}
            placeholder={placeholder}
            className={cellInput}
          />
        );
      case 'finish':
        return (
          <input
            type="text"
            value={step.finishChoice || step.material?.finish || ''}
            onChange={(e) => updateStep(idx, { finishChoice: e.target.value })}
            placeholder={placeholder}
            className={cellInput}
          />
        );
      case 'quantity':
        return (
          <input
            type="text"
            value={step.quantity}
            onChange={(e) => updateStep(idx, { quantity: e.target.value })}
            placeholder={placeholder}
            className={cellInput}
          />
        );
      case 'length':
        return (
          <input
            type="text"
            value={step.sizeChoice}
            onChange={(e) => updateStep(idx, { sizeChoice: e.target.value })}
            placeholder={placeholder}
            className={cellInput}
          />
        );
    }
  };

  return (
    <div className="bg-[#161B22]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[#30363D] bg-[#0D1117] px-2 py-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E7681]">
          {steps.length} {steps.length === 1 ? 'step' : 'steps'}
        </span>
        <button
          type="button"
          onClick={() => addStep()}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A8B2BD] hover:text-[#E8923A] transition-colors uppercase tracking-wide"
        >
          <Plus className="w-3 h-3" /> Add Step
        </button>
      </div>

      {/* Header row — real column labels */}
      <div className={`${ROW_GRID} border-b border-[#30363D] bg-[#0D1117] text-[10px] font-bold uppercase tracking-widest text-[#6E7681]`}>
        <span />
        <span className="text-center">#</span>
        <span>Role</span>
        <span>Material / Brand</span>
        <span>Size</span>
        <span>Color</span>
        <span>Detail / Shape</span>
        <span>Notes</span>
        <span className="text-center" title="Optional">Opt</span>
        <span />
      </div>

      {/* Rows */}
      {steps.map((step, idx) => {
        const cfg = getRoleFields(step.role);
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
            {/* Desktop dense row */}
            <div className={ROW_GRID}>
              {/* Drag */}
              <button
                type="button"
                className="cursor-grab active:cursor-grabbing text-[#484F58] hover:text-[#A8B2BD]"
                aria-label="Drag to reorder"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>

              {/* Step number */}
              <span className="text-[11px] font-mono tabular-nums text-[#6E7681] text-center">
                {idx + 1}
              </span>

              {/* Role select */}
              <div className="relative">
                <select
                  value={step.role}
                  onChange={(e) => handleRoleChange(idx, e.target.value as RecipeRole)}
                  className={`${cellSelect} font-medium`}
                >
                  {RECIPE_ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_FIELDS[r].label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#6E7681] pointer-events-none" />
              </div>

              {/* Material picker — bead row uses simplified Material dropdown
                  in this slot, no autocomplete; subsequent columns show
                  Color, Size (mm), Shape. */}
              {step.role === 'bead' ? (
                <BeadMaterialSelect
                  step={step}
                  onChange={(patch) => {
                    const next = { ...step, ...patch };
                    updateStep(idx, {
                      ...patch,
                      materialName: composeBeadName(next),
                      material: null,
                    });
                  }}
                  cellInput={cellInput}
                  cellSelect={cellSelect}
                />
              ) : (
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
              )}

              {/* Size column — bead uses dedicated mm input */}
              {step.role === 'bead' ? (
                <BeadSizeInput
                  step={step}
                  onChange={(patch) => {
                    const next = { ...step, ...patch };
                    updateStep(idx, {
                      ...patch,
                      materialName: composeBeadName(next),
                    });
                  }}
                  cellInput={cellInput}
                  cellSelect={cellSelect}
                />
              ) : (
                <div>{renderSize(idx, step)}</div>
              )}

              {/* Color column — bead uses dedicated color datalist */}
              {step.role === 'bead' ? (
                <BeadColorInput
                  step={step}
                  onChange={(patch) => {
                    const next = { ...step, ...patch };
                    updateStep(idx, {
                      ...patch,
                      materialName: composeBeadName(next),
                    });
                  }}
                  cellInput={cellInput}
                  cellSelect={cellSelect}
                />
              ) : (
                <div>{renderColor(idx, step)}</div>
              )}

              {/* Detail column — bead uses Shape dropdown */}
              {step.role === 'bead' ? (
                <BeadShapeSelect
                  step={step}
                  onChange={(patch) => {
                    const next = { ...step, ...patch };
                    updateStep(idx, {
                      ...patch,
                      materialName: composeBeadName(next),
                    });
                  }}
                  cellInput={cellInput}
                  cellSelect={cellSelect}
                />
              ) : (
                <div title={detailLabel(cfg.detail)}>{renderDetail(idx, step)}</div>
              )}

              {/* Notes (always inline visible) */}
              <input
                type="text"
                value={step.notes}
                onChange={(e) => updateStep(idx, { notes: e.target.value })}
                placeholder="notes…"
                className={cellInput}
              />

              {/* Optional toggle (inline) */}
              <label className="flex justify-center cursor-pointer" title="Optional step">
                <input
                  type="checkbox"
                  checked={step.isOptional}
                  onChange={(e) => updateStep(idx, { isOptional: e.target.checked })}
                  className="rounded border-[#30363D] bg-[#0D1117] text-[#E8923A] h-3.5 w-3.5"
                />
              </label>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeStep(idx)}
                className="flex justify-center text-[#484F58] hover:text-red-400 transition-colors"
                aria-label="Delete step"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile stacked layout */}
            <div className="md:hidden p-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tabular-nums text-[#6E7681]">
                  {idx + 1}
                </span>
                <div className="relative flex-1">
                  <select
                    value={step.role}
                    onChange={(e) => handleRoleChange(idx, e.target.value as RecipeRole)}
                    className={`${cellSelect} font-medium`}
                  >
                    {RECIPE_ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_FIELDS[r].label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#6E7681] pointer-events-none" />
                </div>
                <button
                  type="button"
                  onClick={() => removeStep(idx)}
                  className="text-[#484F58] hover:text-red-400 transition-colors"
                  aria-label="Delete step"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {step.role === 'bead' ? (
                <>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6E7681] block mb-0.5">Material</label>
                      <BeadMaterialSelect
                        step={step}
                        onChange={(patch) => {
                          const next = { ...step, ...patch };
                          updateStep(idx, { ...patch, materialName: composeBeadName(next), material: null });
                        }}
                        cellInput={cellInput}
                        cellSelect={cellSelect}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6E7681] block mb-0.5">Shape</label>
                      <BeadShapeSelect
                        step={step}
                        onChange={(patch) => {
                          const next = { ...step, ...patch };
                          updateStep(idx, { ...patch, materialName: composeBeadName(next) });
                        }}
                        cellInput={cellInput}
                        cellSelect={cellSelect}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6E7681] block mb-0.5">Size (mm)</label>
                      <BeadSizeInput
                        step={step}
                        onChange={(patch) => {
                          const next = { ...step, ...patch };
                          updateStep(idx, { ...patch, materialName: composeBeadName(next) });
                        }}
                        cellInput={cellInput}
                        cellSelect={cellSelect}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6E7681] block mb-0.5">Color</label>
                      <BeadColorInput
                        step={step}
                        onChange={(patch) => {
                          const next = { ...step, ...patch };
                          updateStep(idx, { ...patch, materialName: composeBeadName(next) });
                        }}
                        cellInput={cellInput}
                        cellSelect={cellSelect}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
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
                  <div className="grid grid-cols-3 gap-1.5">
                    {cfg.showSize && (
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#6E7681] block mb-0.5">Size</label>
                        {renderSize(idx, step)}
                      </div>
                    )}
                    {cfg.showColor && (
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#6E7681] block mb-0.5">Color</label>
                        {renderColor(idx, step)}
                      </div>
                    )}
                    {cfg.detail && (
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#6E7681] block mb-0.5">{detailLabel(cfg.detail)}</label>
                        {renderDetail(idx, step)}
                      </div>
                    )}
                  </div>
                </>
              )}
              <input
                type="text"
                value={step.notes}
                onChange={(e) => updateStep(idx, { notes: e.target.value })}
                placeholder="Notes (e.g. tie in at 60% mark)"
                className={cellInput}
              />
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
          </div>
        );
      })}
    </div>
  );
}
