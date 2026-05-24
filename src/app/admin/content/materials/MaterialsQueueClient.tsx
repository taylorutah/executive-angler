'use client';

import { useState } from 'react';
import { Check, X, Loader2, Edit2, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PendingMaterial {
  id: string;
  slug: string;
  name: string;
  brand?: string | null;
  category: string;
  subcategory?: string | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  material_type?: string | null;
  weight?: string | null;
  finish?: string | null;
  description?: string | null;
  submitter_email?: string | null;
  created_at: string;
}

interface Props {
  pending: PendingMaterial[];
}

export default function MaterialsQueueClient({ pending: initial }: Props) {
  const [items, setItems] = useState<PendingMaterial[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<PendingMaterial>>>({});
  const [error, setError] = useState<string | null>(null);

  const updateEdit = (id: string, patch: Partial<PendingMaterial>) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const promote = async (id: string) => {
    setBusy(id);
    setError(null);
    try {
      const patch = { ...(edits[id] || {}), is_verified: true };
      const res = await fetch(`/api/admin/materials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setItems(prev => prev.filter(i => i.id !== id));
      setEdits(prev => { const next = { ...prev }; delete next[id]; return next; });
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Promote failed');
    } finally {
      setBusy(null);
    }
  };

  const reject = async (id: string) => {
    if (!confirm('Delete this submission permanently?')) return;
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/materials/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-[#F0F6FC] mb-2">
        Materials Review Queue
      </h1>
      <p className="text-[#A8B2BD] text-sm mb-6">
        {items.length} pending submission{items.length === 1 ? '' : 's'}. Edit any field, then Promote to add to the public catalog.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-[#DA3633]/30 bg-[#DA3633]/10 text-[#FFA8A8] text-sm">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 text-[#6E7681]">
          <p>No pending submissions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const e = edits[item.id] || {};
            const merged = { ...item, ...e };
            const isEditing = editing === item.id;
            const isBusy = busy === item.id;

            return (
              <div key={item.id} className="bg-[#161B22] border border-[#21262D] rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={merged.name || ''}
                        onChange={ev => updateEdit(item.id, { name: ev.target.value })}
                        className="w-full bg-[#0D1117] border border-[#21262D] rounded px-2 py-1 text-[#F0F6FC] text-sm font-semibold"
                      />
                    ) : (
                      <p className="text-[#F0F6FC] font-semibold">{merged.name}</p>
                    )}
                    <p className="text-[#A8B2BD] text-xs mt-1">
                      Submitted by {item.submitter_email || 'unknown'} · {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditing(isEditing ? null : item.id)}
                      className="p-1.5 rounded border border-[#21262D] text-[#A8B2BD] hover:text-[#F0F6FC]"
                      title={isEditing ? 'Done editing' : 'Edit fields'}
                    >
                      {isEditing ? <Save size={14} /> : <Edit2 size={14} />}
                    </button>
                    <button
                      onClick={() => reject(item.id)}
                      disabled={isBusy}
                      className="p-1.5 rounded border border-[#DA3633]/30 text-[#FFA8A8] hover:bg-[#DA3633]/10 disabled:opacity-50"
                      title="Reject (delete)"
                    >
                      <X size={14} />
                    </button>
                    <Button
                      onClick={() => promote(item.id)}
                      disabled={isBusy}
                      variant="brand"
                      size="sm"
                      icon={Check}
                      loading={isBusy}
                    >
                      Promote
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <Field
                    label="Brand"
                    value={merged.brand || ''}
                    editing={isEditing}
                    onChange={v => updateEdit(item.id, { brand: v })}
                  />
                  <Field
                    label="Category"
                    value={merged.category}
                    editing={isEditing}
                    onChange={v => updateEdit(item.id, { category: v })}
                  />
                  <Field
                    label="Subcategory"
                    value={merged.subcategory || ''}
                    editing={isEditing}
                    onChange={v => updateEdit(item.id, { subcategory: v })}
                  />
                  <Field
                    label="Material type"
                    value={merged.material_type || ''}
                    editing={isEditing}
                    onChange={v => updateEdit(item.id, { material_type: v })}
                  />
                </div>

                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <ArrayField
                    label="Sizes"
                    value={merged.sizes || []}
                    editing={isEditing}
                    onChange={v => updateEdit(item.id, { sizes: v })}
                  />
                  <ArrayField
                    label="Colors"
                    value={merged.colors || []}
                    editing={isEditing}
                    onChange={v => updateEdit(item.id, { colors: v })}
                  />
                </div>

                {(merged.description || isEditing) && (
                  <div className="mt-2">
                    <label className="block text-[10px] uppercase tracking-wider text-[#6E7681] mb-1">Description</label>
                    {isEditing ? (
                      <textarea
                        value={merged.description || ''}
                        onChange={ev => updateEdit(item.id, { description: ev.target.value })}
                        rows={2}
                        className="w-full bg-[#0D1117] border border-[#21262D] rounded px-2 py-1 text-[#F0F6FC] text-xs"
                      />
                    ) : (
                      <p className="text-[#A8B2BD] text-xs">{merged.description}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, editing, onChange }: { label: string; value: string; editing: boolean; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-[#6E7681] mb-0.5">{label}</label>
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-[#0D1117] border border-[#21262D] rounded px-2 py-1 text-[#F0F6FC] text-xs"
        />
      ) : (
        <p className="text-[#F0F6FC]">{value || '—'}</p>
      )}
    </div>
  );
}

function ArrayField({ label, value, editing, onChange }: { label: string; value: string[]; editing: boolean; onChange: (v: string[]) => void }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-[#6E7681] mb-0.5">{label}</label>
      {editing ? (
        <input
          type="text"
          value={value.join(', ')}
          onChange={e => onChange(e.target.value.split(',').map(v => v.trim()).filter(Boolean))}
          placeholder="comma, separated"
          className="w-full bg-[#0D1117] border border-[#21262D] rounded px-2 py-1 text-[#F0F6FC] text-xs"
        />
      ) : (
        <p className="text-[#F0F6FC]">{value.length ? value.join(', ') : '—'}</p>
      )}
    </div>
  );
}
