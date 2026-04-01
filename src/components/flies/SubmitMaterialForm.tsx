'use client';

import { useState } from 'react';
import type { MaterialCategory } from '@/types/materials';
import { Plus, Check, AlertCircle, Loader2 } from 'lucide-react';

const CATEGORIES: { value: MaterialCategory; label: string }[] = [
  { value: 'hook', label: 'Hook' },
  { value: 'bead', label: 'Bead' },
  { value: 'thread', label: 'Thread' },
  { value: 'dubbing', label: 'Dubbing' },
  { value: 'feather', label: 'Feather' },
  { value: 'flash', label: 'Flash' },
  { value: 'foam', label: 'Foam' },
  { value: 'wire', label: 'Wire' },
  { value: 'resin', label: 'Resin' },
  { value: 'marker', label: 'Marker' },
  { value: 'rubber', label: 'Rubber Legs' },
  { value: 'synthetic', label: 'Synthetic' },
  { value: 'tail', label: 'Tail' },
  { value: 'wing', label: 'Wing' },
  { value: 'ribbing', label: 'Ribbing' },
  { value: 'chenille', label: 'Chenille' },
  { value: 'body', label: 'Body Material' },
  { value: 'eye', label: 'Eye' },
];

interface SubmitMaterialFormProps {
  /** Pre-fill name field (e.g. from the search query that found no results) */
  initialName?: string;
  /** Pre-fill category */
  initialCategory?: MaterialCategory;
  /** Called after successful submission */
  onSuccess?: () => void;
  /** Called to close/dismiss the form */
  onCancel?: () => void;
}

export function SubmitMaterialForm({
  initialName = '',
  initialCategory,
  onSuccess,
  onCancel,
}: SubmitMaterialFormProps) {
  const [name, setName] = useState(initialName);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<MaterialCategory | ''>(initialCategory || '');
  const [subcategory, setSubcategory] = useState('');
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');
  const [description, setDescription] = useState('');

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category) return;

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/materials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          brand: brand.trim() || undefined,
          category,
          subcategory: subcategory.trim() || undefined,
          sizes: sizes.trim() ? sizes.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
          colors: colors.trim() ? colors.split(',').map((c) => c.trim()).filter(Boolean) : undefined,
          description: description.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setStatus('success');
      onSuccess?.();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit material');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-lg border border-[#2EA44F]/30 bg-[#2EA44F]/10 p-4 text-center">
        <Check className="w-6 h-6 text-[#2EA44F] mx-auto mb-2" />
        <p className="text-sm text-[#F0F6FC] font-medium">Material submitted for review</p>
        <p className="text-xs text-[#A8B2BD] mt-1">It will appear in search once approved.</p>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-3 text-xs text-[#E8923A] hover:underline"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Name (required) */}
      <div>
        <label className="block text-xs font-medium text-[#A8B2BD] mb-1">
          Material Name <span className="text-[#DA3633]">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Semperfli Nano Silk 18/0"
          required
          className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:border-[#E8923A] focus:outline-none"
        />
      </div>

      {/* Brand */}
      <div>
        <label className="block text-xs font-medium text-[#A8B2BD] mb-1">Brand</label>
        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="e.g. Semperfli, Hareline, TMC"
          className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:border-[#E8923A] focus:outline-none"
        />
      </div>

      {/* Category (required) */}
      <div>
        <label className="block text-xs font-medium text-[#A8B2BD] mb-1">
          Category <span className="text-[#DA3633]">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as MaterialCategory)}
          required
          className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] focus:border-[#E8923A] focus:outline-none"
        >
          <option value="">Select category...</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Subcategory */}
      <div>
        <label className="block text-xs font-medium text-[#A8B2BD] mb-1">Subcategory</label>
        <input
          type="text"
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          placeholder="e.g. dry fly hook, CDC, marabou"
          className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:border-[#E8923A] focus:outline-none"
        />
      </div>

      {/* Sizes (comma-separated) */}
      <div>
        <label className="block text-xs font-medium text-[#A8B2BD] mb-1">
          Sizes <span className="text-xs text-[#6E7681]">(comma-separated)</span>
        </label>
        <input
          type="text"
          value={sizes}
          onChange={(e) => setSizes(e.target.value)}
          placeholder="e.g. 12, 14, 16, 18, 20"
          className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:border-[#E8923A] focus:outline-none"
        />
      </div>

      {/* Colors (comma-separated) */}
      <div>
        <label className="block text-xs font-medium text-[#A8B2BD] mb-1">
          Colors <span className="text-xs text-[#6E7681]">(comma-separated)</span>
        </label>
        <input
          type="text"
          value={colors}
          onChange={(e) => setColors(e.target.value)}
          placeholder="e.g. olive, tan, black, brown"
          className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:border-[#E8923A] focus:outline-none"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-[#A8B2BD] mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the material..."
          rows={2}
          className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:border-[#E8923A] focus:outline-none resize-none"
        />
      </div>

      {/* Error */}
      {status === 'error' && (
        <div className="flex items-start gap-2 rounded-lg border border-[#DA3633]/30 bg-[#DA3633]/10 p-3">
          <AlertCircle className="w-4 h-4 text-[#DA3633] shrink-0 mt-0.5" />
          <p className="text-xs text-[#DA3633]">{errorMsg}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={status === 'submitting' || !name.trim() || !category}
          className="flex items-center gap-1.5 bg-[#E8923A] hover:bg-[#d17d28] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {status === 'submitting' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Submit Material
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-[#A8B2BD] hover:text-[#F0F6FC] px-3 py-2 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
