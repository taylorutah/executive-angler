'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package, Search, Plus, Trash2, ChevronDown, ChevronUp,
  Sparkles, AlertCircle, Check, X, Loader2, Wrench, Layers,
  ArrowRight,
} from 'lucide-react';
import type { TyingMaterial, UserMaterialInventory, MaterialCategory } from '@/types/materials';

// ─── Types ───────────────────────────────────────────────────────

interface MatchResult {
  fly_pattern_id?: string;
  canonical_fly_id?: string;
  fly_name: string;
  fly_type?: string;
  fly_image?: string;
  fly_slug?: string;
  total_ingredients: number;
  matched_ingredients: number;
  missing_ingredients: { role: string; material_name: string; is_optional: boolean }[];
  match_percentage: number;
}

type Tab = 'inventory' | 'whatCanITie' | 'browse';

const CATEGORIES: MaterialCategory[] = [
  'hook', 'bead', 'thread', 'dubbing', 'feather', 'flash',
  'foam', 'wire', 'chenille', 'body', 'tail', 'wing',
  'ribbing', 'synthetic', 'rubber', 'eye', 'resin', 'marker',
];

const CATEGORY_LABELS: Record<string, string> = {
  hook: 'Hooks', bead: 'Beads', thread: 'Thread', dubbing: 'Dubbing',
  feather: 'Feathers', flash: 'Flash', foam: 'Foam', wire: 'Wire',
  chenille: 'Chenille', body: 'Body', tail: 'Tails', wing: 'Wings',
  ribbing: 'Ribbing', synthetic: 'Synthetics', rubber: 'Rubber',
  eye: 'Eyes', resin: 'Resins', marker: 'Markers',
};

// ─── Main Component ──────────────────────────────────────────────

export default function WorkbenchClient() {
  const [tab, setTab] = useState<Tab>('inventory');
  const [inventory, setInventory] = useState<UserMaterialInventory[]>([]);
  const [invLoading, setInvLoading] = useState(true);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);

  // Browse state
  const [browseMaterials, setBrowseMaterials] = useState<TyingMaterial[]>([]);
  const [browseCategory, setBrowseCategory] = useState<string>('');
  const [browseSearch, setBrowseSearch] = useState('');
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseTotal, setBrowseTotal] = useState(0);

  // Add to inventory modal
  const [addingMaterial, setAddingMaterial] = useState<TyingMaterial | null>(null);
  const [addColor, setAddColor] = useState('');
  const [addSize, setAddSize] = useState('');
  const [addQty, setAddQty] = useState('');

  // ─── Fetch Inventory ─────────────────────────────────────────
  const fetchInventory = useCallback(async () => {
    setInvLoading(true);
    try {
      const res = await fetch('/api/materials/inventory');
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory || []);
      }
    } catch { /* ignore */ }
    setInvLoading(false);
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  // ─── Fetch What Can I Tie ────────────────────────────────────
  const fetchMatches = async () => {
    setMatchesLoading(true);
    setMatchesError(null);
    try {
      const res = await fetch('/api/materials/what-can-i-tie');
      if (res.status === 403) {
        setMatchesError('Premium feature — upgrade to unlock');
      } else if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      } else {
        setMatchesError('Failed to load matches');
      }
    } catch {
      setMatchesError('Network error');
    }
    setMatchesLoading(false);
  };

  // ─── Browse Materials ────────────────────────────────────────
  const fetchBrowse = useCallback(async (cat: string, search: string) => {
    setBrowseLoading(true);
    const params = new URLSearchParams({ limit: '50' });
    if (cat) params.set('category', cat);
    try {
      const res = await fetch(`/api/materials?${params}`);
      if (res.ok) {
        const data = await res.json();
        let mats = data.materials || [];
        if (search) {
          const q = search.toLowerCase();
          mats = mats.filter((m: TyingMaterial) =>
            m.name.toLowerCase().includes(q) ||
            (m.brand && m.brand.toLowerCase().includes(q))
          );
        }
        setBrowseMaterials(mats);
        setBrowseTotal(data.total || 0);
      }
    } catch { /* ignore */ }
    setBrowseLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'browse') fetchBrowse(browseCategory, browseSearch);
  }, [tab, browseCategory, fetchBrowse]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tab === 'whatCanITie') fetchMatches();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Add to Inventory ────────────────────────────────────────
  const addToInventory = async (material: TyingMaterial) => {
    try {
      const res = await fetch('/api/materials/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_id: material.id,
          color_owned: addColor || null,
          size_owned: addSize || null,
          quantity: addQty || null,
        }),
      });
      if (res.ok) {
        setAddingMaterial(null);
        setAddColor('');
        setAddSize('');
        setAddQty('');
        fetchInventory();
      }
    } catch { /* ignore */ }
  };

  // ─── Remove from Inventory ───────────────────────────────────
  const removeFromInventory = async (id: string) => {
    try {
      await fetch(`/api/materials/inventory?id=${id}`, { method: 'DELETE' });
      setInventory(prev => prev.filter(i => i.id !== id));
    } catch { /* ignore */ }
  };

  // ─── Grouped Inventory ───────────────────────────────────────
  const groupedInventory = inventory.reduce<Record<string, UserMaterialInventory[]>>((acc, item) => {
    const cat = item.material?.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const ownedMaterialIds = new Set(inventory.map(i => i.material_id));

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-text-muted text-sm mb-1">
                <Link href="/journal/flies" className="hover:text-accent">Fly Box</Link>
                <span>/</span>
                <span>Tying Workbench</span>
              </div>
              <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text-primary">
                Tying Workbench
              </h1>
            </div>
            <div className="text-right">
              <span className="font-mono text-2xl text-accent font-semibold">{inventory.length}</span>
              <span className="text-text-muted text-sm ml-1">materials</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {([
              { id: 'inventory' as Tab, label: 'My Inventory', icon: Package },
              { id: 'whatCanITie' as Tab, label: 'What Can I Tie?', icon: Sparkles },
              { id: 'browse' as Tab, label: 'Browse Materials', icon: Search },
            ]).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === id
                    ? 'bg-accent text-bg'
                    : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-raised'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ─── Inventory Tab ──────────────────────────────────── */}
        {tab === 'inventory' && (
          <div>
            {invLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-accent" />
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-20">
                <Package size={48} className="mx-auto mb-4 text-text-muted" />
                <h2 className="font-[family-name:var(--font-heading)] text-xl mb-2">No materials yet</h2>
                <p className="text-text-secondary mb-6">
                  Browse the materials catalog and add what you own to your inventory.
                </p>
                <button
                  onClick={() => setTab('browse')}
                  className="bg-accent text-bg px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90"
                >
                  Browse Materials
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {CATEGORIES.filter(cat => groupedInventory[cat]?.length).map(cat => (
                  <InventoryGroup
                    key={cat}
                    category={cat}
                    label={CATEGORY_LABELS[cat] || cat}
                    items={groupedInventory[cat]}
                    onRemove={removeFromInventory}
                  />
                ))}
                {groupedInventory['other'] && (
                  <InventoryGroup
                    category="other"
                    label="Other"
                    items={groupedInventory['other']}
                    onRemove={removeFromInventory}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── What Can I Tie Tab ─────────────────────────────── */}
        {tab === 'whatCanITie' && (
          <div>
            {matchesLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-accent" />
              </div>
            ) : matchesError ? (
              <div className="text-center py-20">
                <AlertCircle size={48} className="mx-auto mb-4 text-danger" />
                <p className="text-text-secondary">{matchesError}</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-20">
                <Wrench size={48} className="mx-auto mb-4 text-text-muted" />
                <h2 className="font-[family-name:var(--font-heading)] text-xl mb-2">No matches yet</h2>
                <p className="text-text-secondary mb-6">
                  Add materials to your inventory, then check back to see what you can tie.
                </p>
                <button
                  onClick={() => setTab('inventory')}
                  className="bg-accent text-bg px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90"
                >
                  Manage Inventory
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-text-secondary text-sm mb-4">
                  Based on your <span className="text-accent font-mono">{inventory.length}</span> materials:
                </p>
                {matches.map((m, i) => (
                  <MatchCard key={i} match={m} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Browse Materials Tab ───────────────────────────── */}
        {tab === 'browse' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={browseSearch}
                  onChange={e => setBrowseSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') fetchBrowse(browseCategory, browseSearch); }}
                  className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
              </div>
              <select
                value={browseCategory}
                onChange={e => setBrowseCategory(e.target.value)}
                className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
                ))}
              </select>
              <button
                onClick={() => fetchBrowse(browseCategory, browseSearch)}
                className="bg-accent text-bg px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
              >
                Search
              </button>
            </div>

            {browseLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-accent" />
              </div>
            ) : (
              <>
                <p className="text-text-muted text-sm mb-4">
                  Showing {browseMaterials.length} of {browseTotal} materials
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {browseMaterials.map(material => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      isOwned={ownedMaterialIds.has(material.id)}
                      onAdd={() => {
                        setAddingMaterial(material);
                        setAddColor('');
                        setAddSize('');
                        setAddQty('');
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ─── Add to Inventory Modal ─────────────────────────────── */}
      {addingMaterial && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-[family-name:var(--font-heading)] text-lg">Add to Inventory</h3>
              <button onClick={() => setAddingMaterial(null)} className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>

            <p className="text-text-secondary text-sm mb-1">{addingMaterial.brand}</p>
            <p className="text-text-primary font-medium mb-4">{addingMaterial.name}</p>

            <div className="space-y-3">
              {addingMaterial.colors && addingMaterial.colors.length > 0 && (
                <div>
                  <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Color</label>
                  <select
                    value={addColor}
                    onChange={e => setAddColor(e.target.value)}
                    className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
                  >
                    <option value="">Any / Not specified</option>
                    {addingMaterial.colors.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
              {addingMaterial.sizes && addingMaterial.sizes.length > 0 && (
                <div>
                  <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Size</label>
                  <select
                    value={addSize}
                    onChange={e => setAddSize(e.target.value)}
                    className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
                  >
                    <option value="">Any / Not specified</option>
                    {addingMaterial.sizes.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Quantity (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 1 spool, 3 packs"
                  value={addQty}
                  onChange={e => setAddQty(e.target.value)}
                  className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setAddingMaterial(null)}
                className="flex-1 bg-surface-raised text-text-secondary px-4 py-2 rounded-lg text-sm hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={() => addToInventory(addingMaterial)}
                className="flex-1 bg-accent text-bg px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
              >
                Add to Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function InventoryGroup({
  category,
  label,
  items,
  onRemove,
}: {
  category: string;
  label: string;
  items: UserMaterialInventory[];
  onRemove: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-raised transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-accent" />
          <span className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
            {label}
          </span>
          <span className="text-text-muted text-xs font-mono">({items.length})</span>
        </div>
        {collapsed ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronUp size={16} className="text-text-muted" />}
      </button>
      {!collapsed && (
        <div className="divide-y divide-border">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-sm font-medium truncate">
                  {item.material?.name || 'Unknown'}
                </p>
                <div className="flex gap-3 text-text-muted text-xs mt-0.5">
                  {item.material?.brand && <span>{item.material.brand}</span>}
                  {item.color_owned && <span className="text-signal">{item.color_owned}</span>}
                  {item.size_owned && <span>Size {item.size_owned}</span>}
                  {item.quantity && <span>Qty: {item.quantity}</span>}
                </div>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="text-text-muted hover:text-danger p-1 ml-2"
                title="Remove from inventory"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchCard({ match }: { match: MatchResult }) {
  const [expanded, setExpanded] = useState(false);
  const isPerfect = match.match_percentage === 100;

  return (
    <div className={`bg-surface rounded-xl border overflow-hidden ${
      isPerfect ? 'border-success' : 'border-border'
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-surface-raised transition-colors"
      >
        {match.fly_image && (
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-raised flex-shrink-0">
            <Image src={match.fly_image} alt={match.fly_name} width={40} height={40} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-text-primary text-sm font-medium truncate">{match.fly_name}</p>
          {match.fly_type && (
            <p className="text-text-muted text-xs capitalize">{match.fly_type}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className={`font-mono text-lg font-semibold ${
            isPerfect ? 'text-success' : match.match_percentage >= 75 ? 'text-accent' : 'text-text-muted'
          }`}>
            {match.match_percentage}%
          </div>
          {isPerfect && <Check size={16} className="text-success" />}
          {expanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
        </div>
      </button>
      {expanded && match.missing_ingredients.length > 0 && (
        <div className="px-4 pb-3 border-t border-border pt-3">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Missing:</p>
          <div className="space-y-1">
            {match.missing_ingredients.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <X size={12} className="text-danger flex-shrink-0" />
                <span className="text-text-secondary">
                  <span className="text-text-muted capitalize">{m.role}:</span> {m.material_name}
                </span>
              </div>
            ))}
          </div>
          {match.fly_slug && (
            <Link
              href={`/flies/${match.fly_slug}`}
              className="flex items-center gap-1 text-signal text-xs mt-3 hover:underline"
            >
              View pattern <ArrowRight size={12} />
            </Link>
          )}
        </div>
      )}
      {expanded && match.missing_ingredients.length === 0 && match.fly_slug && (
        <div className="px-4 pb-3 border-t border-border pt-3">
          <Link
            href={`/flies/${match.fly_slug}`}
            className="flex items-center gap-1 text-signal text-xs hover:underline"
          >
            View pattern & tying steps <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
}

function MaterialCard({
  material,
  isOwned,
  onAdd,
}: {
  material: TyingMaterial;
  isOwned: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-medium truncate">{material.name}</p>
        <div className="flex gap-2 mt-1">
          {material.brand && (
            <span className="text-text-muted text-xs">{material.brand}</span>
          )}
          <span className="text-xs text-signal capitalize">{material.category}</span>
        </div>
        {material.colors && material.colors.length > 0 && (
          <p className="text-text-muted text-xs mt-1 truncate">
            {material.colors.slice(0, 4).join(', ')}{material.colors.length > 4 ? ` +${material.colors.length - 4}` : ''}
          </p>
        )}
      </div>
      {isOwned ? (
        <span className="flex items-center gap-1 text-success text-xs font-medium ml-2">
          <Check size={12} /> Owned
        </span>
      ) : (
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-accent text-xs font-medium ml-2 hover:underline"
        >
          <Plus size={12} /> Add
        </button>
      )}
    </div>
  );
}
