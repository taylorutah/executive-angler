'use client';

import { useState } from 'react';
import { Plus, X, AlertCircle, Check, Copy, Package } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl border border-border p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-[family-name:var(--font-heading)] text-lg">Add Variant</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        <p className="text-text-secondary text-xs mb-1">{material.brand}</p>
        <p className="text-text-primary font-medium mb-4">{material.name}</p>

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-surface-raised rounded-lg mb-4 text-xs">
          <button
            onClick={() => setMode('own')}
            className={`flex-1 px-2 py-1.5 rounded flex items-center justify-center gap-1 ${
              mode === 'own' ? 'bg-accent text-bg font-semibold' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Package size={12} /> I own one
          </button>
          {isOwnPending && (
            <button
              onClick={() => setMode('extend')}
              className={`flex-1 px-2 py-1.5 rounded flex items-center justify-center gap-1 ${
                mode === 'extend' ? 'bg-accent text-bg font-semibold' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Plus size={12} /> Extend product
            </button>
          )}
          <button
            onClick={() => setMode('clone')}
            className={`flex-1 px-2 py-1.5 rounded flex items-center justify-center gap-1 ${
              mode === 'clone' ? 'bg-accent text-bg font-semibold' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Copy size={12} /> Clone as new
          </button>
        </div>

        <p className="text-text-muted text-[11px] mb-3">
          {mode === 'own' && 'Adds a color/size to your personal inventory only — no catalog change.'}
          {mode === 'extend' && 'Adds a color or size to this material&apos;s catalog entry. Only available for your pending submissions.'}
          {mode === 'clone' && 'Creates a new material pre-filled from this one. Used when you have a separate SKU.'}
        </p>

        {/* Clone-only fields */}
        {mode === 'clone' && (
          <div className="space-y-3 mb-3 pb-3 border-b border-border">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-1">Name</label>
              <input
                type="text"
                value={cloneName}
                onChange={e => setCloneName(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-1">Brand</label>
              <input
                type="text"
                value={cloneBrand}
                onChange={e => setCloneBrand(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-1">Subcategory</label>
              <input
                type="text"
                value={cloneSubcategory}
                onChange={e => setCloneSubcategory(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
              />
            </div>
          </div>
        )}

        {/* Common color + size inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-1">
              Color {material.colors && material.colors.length > 0 && (
                <span className="text-text-muted normal-case tracking-normal">
                  {' '}(existing: {material.colors.slice(0, 5).join(', ')}{material.colors.length > 5 ? '…' : ''})
                </span>
              )}
            </label>
            <input
              type="text"
              value={color}
              onChange={e => setColor(e.target.value)}
              placeholder="e.g. olive, fluorescent pink"
              className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-1">
              Size {material.sizes && material.sizes.length > 0 && (
                <span className="text-text-muted normal-case tracking-normal">
                  {' '}(existing: {material.sizes.slice(0, 5).join(', ')}{material.sizes.length > 5 ? '…' : ''})
                </span>
              )}
            </label>
            <input
              type="text"
              value={size}
              onChange={e => setSize(e.target.value)}
              placeholder="e.g. 18, 2.5mm, large"
              className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
            />
          </div>
          {mode !== 'extend' && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-1">Quantity (optional)</label>
              <input
                type="text"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="e.g. 1 spool, 2 packs"
                className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
              />
            </div>
          )}
        </div>

        {status === 'error' && (
          <div className="flex items-start gap-2 mt-3 rounded-lg border border-[#DA3633]/30 bg-[#DA3633]/10 p-2">
            <AlertCircle className="w-4 h-4 text-[#DA3633] shrink-0 mt-0.5" />
            <p className="text-xs text-[#DA3633]">{errorMsg}</p>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={status === 'saving'}
            className="flex-1 bg-surface-raised text-text-secondary px-4 py-2 rounded-lg text-sm hover:text-text-primary disabled:opacity-50"
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
