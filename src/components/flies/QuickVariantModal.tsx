'use client';

import { useState } from 'react';
import { Plus, X, AlertCircle, Check, Copy, Package } from "@/icons";
import type { TyingMaterial } from '@/types/materials';
import { Button } from '@/components/ui/Button';

interface Props {
  material: TyingMaterial;
  /** True when material is the user's own pending submission — they can extend its arrays. */
  isOwnPending: boolean;
  onClose: () => void;
  /** Called after a successful save — caller should refresh inventory + browse list. */
  onSaved: (msg: string) => void;
}

type Mode = 'own' | 'extend' | 'clone';

export function QuickVariantModal({ material, isOwnPending, onClose, onSaved }: Props) {
  // Default mode: "own a new color/size" (fastest, doesn't touch the catalog).
  const [mode, setMode] = useState<Mode>('own');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState('');
  // Clone-mode state
  const [cloneName, setCloneName] = useState(material.name);
  const [cloneBrand, setCloneBrand] = useState(material.brand || '');
  const [cloneSubcategory, setCloneSubcategory] = useState(material.subcategory || '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    setStatus('saving');
    setErrorMsg('');

    try {
      if (mode === 'own') {
        if (!color && !size && !quantity) {
          setErrorMsg('Add a color, size, or quantity to save.');
          setStatus('error');
          return;
        }
        const res = await fetch('/api/materials/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            material_id: material.id,
            color_owned: color.trim() || null,
            size_owned: size.trim() || null,
            quantity: quantity.trim() || null,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        onSaved(`Added ${color || size || 'variant'} to your inventory.`);
      } else if (mode === 'extend') {
        if (!color && !size) {
          setErrorMsg('Add a color or size to extend.');
          setStatus('error');
          return;
        }
        const res = await fetch(`/api/materials/${material.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            add_color: color.trim() || undefined,
            add_size: size.trim() || undefined,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        onSaved(`Added ${color || size} to ${material.name}.`);
      } else {
        // Clone — submit a new material pre-populated from this one
        if (!cloneName.trim()) {
          setErrorMsg('Name is required.');
          setStatus('error');
          return;
        }
        const res = await fetch('/api/materials?add_to_inventory=true', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cloneName.trim(),
            brand: cloneBrand.trim() || undefined,
            category: material.category,
            subcategory: cloneSubcategory.trim() || undefined,
            sizes: size.trim() ? [size.trim()] : material.sizes,
            colors: color.trim() ? [color.trim()] : material.colors,
            material_type: material.material_type,
            weight: material.weight,
            finish: material.finish,
            inventory_color: color.trim() || undefined,
            inventory_size: size.trim() || undefined,
            inventory_quantity: quantity.trim() || undefined,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        onSaved(`Cloned as "${cloneName.trim()}".`);
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Save failed');
    }
  };

  return (
    <div className="ea-modal-overlay z-50 flex items-center justify-center p-4">
      <div className="ea-modal max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-semibold text-[var(--text-1)]">Add Variant</h3>
          <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="text-[var(--text-2)] text-xs mb-1">{material.brand}</p>
        <p className="text-[var(--text-1)] font-medium mb-4">{material.name}</p>

        {/* Mode toggle */}
        <div className="ea-segmented w-full mb-4">
          <button
            onClick={() => setMode('own')}
            aria-pressed={mode === 'own'}
            className="ea-segment flex-1"
          >
            <Package size={14} aria-hidden /> I own one
          </button>
          {isOwnPending && (
            <button
              onClick={() => setMode('extend')}
              aria-pressed={mode === 'extend'}
              className="ea-segment flex-1"
            >
              <Plus size={14} aria-hidden /> Extend product
            </button>
          )}
          <button
            onClick={() => setMode('clone')}
            aria-pressed={mode === 'clone'}
            className="ea-segment flex-1"
          >
            <Copy size={14} aria-hidden /> Clone as new
          </button>
        </div>

        <p className="ea-field-helper mb-3">
          {mode === 'own' && 'Adds a color/size to your personal inventory only — no catalog change.'}
          {mode === 'extend' && 'Adds a color or size to this material&apos;s catalog entry. Only available for your pending submissions.'}
          {mode === 'clone' && 'Creates a new material pre-filled from this one. Used when you have a separate SKU.'}
        </p>

        {/* Clone-only fields */}
        {mode === 'clone' && (
          <div className="space-y-3 mb-3 pb-3 border-b border-[var(--border)]">
            <div>
              <label className="ea-label">Name</label>
              <input
                type="text"
                value={cloneName}
                onChange={e => setCloneName(e.target.value)}
                className="ea-input"
              />
            </div>
            <div>
              <label className="ea-label">Brand</label>
              <input
                type="text"
                value={cloneBrand}
                onChange={e => setCloneBrand(e.target.value)}
                className="ea-input"
              />
            </div>
            <div>
              <label className="ea-label">Subcategory</label>
              <input
                type="text"
                value={cloneSubcategory}
                onChange={e => setCloneSubcategory(e.target.value)}
                className="ea-input"
              />
            </div>
          </div>
        )}

        {/* Common color + size inputs */}
        <div className="space-y-3">
          <div>
            <label className="ea-label">
              Color {material.colors && material.colors.length > 0 && (
                <span className="text-[var(--text-3)] font-normal">
                  {' '}(existing: {material.colors.slice(0, 5).join(', ')}{material.colors.length > 5 ? '…' : ''})
                </span>
              )}
            </label>
            <input
              type="text"
              value={color}
              onChange={e => setColor(e.target.value)}
              placeholder="e.g. olive, fluorescent pink"
              className="ea-input"
            />
          </div>
          <div>
            <label className="ea-label">
              Size {material.sizes && material.sizes.length > 0 && (
                <span className="text-[var(--text-3)] font-normal">
                  {' '}(existing: {material.sizes.slice(0, 5).join(', ')}{material.sizes.length > 5 ? '…' : ''})
                </span>
              )}
            </label>
            <input
              type="text"
              value={size}
              onChange={e => setSize(e.target.value)}
              placeholder="e.g. 18, 2.5mm, large"
              className="ea-input"
            />
          </div>
          {mode !== 'extend' && (
            <div>
              <label className="ea-label">Quantity (optional)</label>
              <input
                type="text"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="e.g. 1 spool, 2 packs"
                className="ea-input"
              />
            </div>
          )}
        </div>

        {status === 'error' && (
          <div className="flex items-start gap-2 mt-3 rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-2">
            <AlertCircle className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--danger)]">{errorMsg}</p>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={status === 'saving'}
            className="ea-btn ea-btn-secondary flex-1"
          >
            Cancel
          </button>
          <Button
            onClick={handleSave}
            disabled={status === 'saving'}
            loading={status === 'saving'}
            variant="solid"
            size="md"
            icon={status !== 'saving' ? Check : undefined}
           
            className="flex-1"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
