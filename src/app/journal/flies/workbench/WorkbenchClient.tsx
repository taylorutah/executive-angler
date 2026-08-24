'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package, Search, Plus, Trash2, ChevronDown, ChevronUp,
  Sparkles, AlertCircle, Check, X, Loader2, Wrench, Layers,
  ArrowRight, Target,
} from 'lucide-react';
import type { TyingMaterial, UserMaterialInventory, MaterialCategory } from '@/types/materials';
import HelpHint from '@/components/ui/HelpHint';
import TipCard from '@/components/ui/TipCard';
import { SubmitMaterialForm } from '@/components/flies/SubmitMaterialForm';
import { QuickVariantModal } from '@/components/flies/QuickVariantModal';
import { Button } from '@/components/ui/Button';

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

type Tab = 'pickFly' | 'inventory' | 'whatCanITie' | 'browse';

interface FlyBrowseItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  hero_image_url?: string;
  tagline?: string;
  ingredient_count: number;
  required_count: number;
  owned_required_count: number;
  coverage_percentage: number;
}

interface FlyRequirementIngredient {
  id: string;
  role: string;
  material_id?: string;
  material_name?: string;
  material?: { id: string; name: string; brand?: string; category?: string; colors?: string[]; sizes?: string[] };
  is_optional: boolean;
  quantity?: string;
  color_choice?: string;
  size_choice?: string;
  owned: boolean;
}

interface FlyRequirementsResponse {
  fly: { id: string; slug: string; name: string; category: string; hero_image_url?: string; tagline?: string };
  ingredients: FlyRequirementIngredient[];
  summary: { total: number; required: number; owned_required: number; coverage_percentage: number };
  is_authenticated: boolean;
}

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

/** "hot_spot" → "Hot Spot", "ribbing" → "Ribbing", "wingcase" → "Wingcase". */
function formatRoleLabel(role: string | null | undefined): string {
  if (!role) return "Material";
  return role
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// ─── Main Component ──────────────────────────────────────────────

export default function WorkbenchClient({
  embedded = false,
  viewerIsAdmin = false,
}: { embedded?: boolean; viewerIsAdmin?: boolean } = {}) {
  const [tab, setTab] = useState<Tab>('pickFly');
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
  const [browsePage, setBrowsePage] = useState(0);
  const BROWSE_PAGE_SIZE = 50;

  // Pick-a-Fly state
  const [flyList, setFlyList] = useState<FlyBrowseItem[]>([]);
  const [flyListLoading, setFlyListLoading] = useState(false);
  const [flyQuery, setFlyQuery] = useState('');
  const [flyCategory, setFlyCategory] = useState('');
  const [expandedFlySlug, setExpandedFlySlug] = useState<string | null>(null);
  const [flyRequirements, setFlyRequirements] = useState<Record<string, FlyRequirementsResponse>>({});
  const [flyReqLoading, setFlyReqLoading] = useState<string | null>(null);

  // Add to inventory modal
  const [addingMaterial, setAddingMaterial] = useState<TyingMaterial | null>(null);
  const [addColor, setAddColor] = useState('');
  const [addQty, setAddQty] = useState(''); // for materials without sizes
  const [sizeRows, setSizeRows] = useState<Record<string, { checked: boolean; quantity: string; existingId?: string }>>({});
  const [savingInventory, setSavingInventory] = useState(false);

  // Submit-new-material modal (workbench inline)
  const [showSubmitMaterial, setShowSubmitMaterial] = useState(false);
  const [submitInitialCategory, setSubmitInitialCategory] = useState<MaterialCategory | undefined>(undefined);

  // Quick-variant modal (own new color/size, extend arrays on own pending, or clone).
  // RLS ensures the only pending materials we see are ones we submitted, so
  // isOwnPending is just material.is_verified === false.
  const [variantMaterial, setVariantMaterial] = useState<TyingMaterial | null>(null);

  // Toast / banner feedback (replaces silent error catches)
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  // ─── Fetch Inventory ─────────────────────────────────────────
  const fetchInventory = useCallback(async () => {
    setInvLoading(true);
    try {
      const res = await fetch('/api/materials/inventory');
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory || []);
      } else if (res.status !== 401) {
        const data = await res.json().catch(() => ({}));
        setToast({ kind: 'error', message: data.error || `Failed to load inventory (${res.status})` });
      }
    } catch (err) {
      setToast({ kind: 'error', message: err instanceof Error ? err.message : 'Network error loading inventory' });
    }
    setInvLoading(false);
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  // ─── Fetch What Can I Tie ────────────────────────────────────
  const fetchMatches = async () => {
    setMatchesLoading(true);
    setMatchesError(null);
    try {
      const res = await fetch('/api/materials/what-can-i-tie');
      if (res.ok) {
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
  const fetchBrowse = useCallback(async (cat: string, search: string, page: number) => {
    setBrowseLoading(true);
    const offset = page * BROWSE_PAGE_SIZE;
    const params = new URLSearchParams({
      limit: String(BROWSE_PAGE_SIZE),
      offset: String(offset),
    });
    if (cat) params.set('category', cat);
    if (search.trim()) params.set('q', search.trim());
    try {
      const res = await fetch(`/api/materials?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBrowseMaterials(data.materials || []);
        setBrowseTotal(data.total || 0);
      } else {
        const data = await res.json().catch(() => ({}));
        setToast({ kind: 'error', message: data.error || `Search failed (${res.status})` });
      }
    } catch (err) {
      setToast({ kind: 'error', message: err instanceof Error ? err.message : 'Network error' });
    }
    setBrowseLoading(false);
  }, []);

  // Initial / category / page load — fires immediately
  useEffect(() => {
    if (tab === 'browse') fetchBrowse(browseCategory, browseSearch, browsePage);
  }, [tab, browseCategory, browsePage, fetchBrowse]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time search: debounce keystrokes, reset to page 0
  useEffect(() => {
    if (tab !== 'browse') return;
    const t = setTimeout(() => {
      setBrowsePage(0);
      fetchBrowse(browseCategory, browseSearch, 0);
    }, 200);
    return () => clearTimeout(t);
  }, [browseSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tab === 'whatCanITie') fetchMatches();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Fetch Fly List (Pick a Pattern) ─────────────────────────
  const fetchFlyList = useCallback(async (q: string, cat: string) => {
    setFlyListLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cat) params.set('category', cat);
    try {
      const res = await fetch(`/api/materials/browse-flies?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFlyList(data.flies || []);
      } else {
        const data = await res.json().catch(() => ({}));
        setToast({ kind: 'error', message: data.error || `Failed to load patterns (${res.status})` });
      }
    } catch (err) {
      setToast({ kind: 'error', message: err instanceof Error ? err.message : 'Network error loading patterns' });
    }
    setFlyListLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'pickFly') fetchFlyList(flyQuery, flyCategory);
  }, [tab, flyCategory, fetchFlyList]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time pattern search: debounce keystrokes
  useEffect(() => {
    if (tab !== 'pickFly') return;
    const t = setTimeout(() => fetchFlyList(flyQuery, flyCategory), 200);
    return () => clearTimeout(t);
  }, [flyQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Fetch Fly Requirements (on expand) ──────────────────────
  const fetchFlyRequirements = useCallback(async (slug: string) => {
    if (flyRequirements[slug]) return;
    setFlyReqLoading(slug);
    try {
      const res = await fetch(`/api/materials/fly-requirements?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data: FlyRequirementsResponse = await res.json();
        setFlyRequirements(prev => ({ ...prev, [slug]: data }));
      } else {
        const data = await res.json().catch(() => ({}));
        setToast({ kind: 'error', message: data.error || `Failed to load fly requirements (${res.status})` });
      }
    } catch (err) {
      setToast({ kind: 'error', message: err instanceof Error ? err.message : 'Network error' });
    }
    setFlyReqLoading(null);
  }, [flyRequirements]);

  const toggleFlyExpanded = (slug: string) => {
    if (expandedFlySlug === slug) {
      setExpandedFlySlug(null);
    } else {
      setExpandedFlySlug(slug);
      fetchFlyRequirements(slug);
    }
  };

  // After adding a material, refresh the expanded fly's owned flags + the list coverage
  const refreshFlyAfterAdd = async () => {
    if (expandedFlySlug) {
      setFlyRequirements(prev => {
        const next = { ...prev };
        delete next[expandedFlySlug];
        return next;
      });
      await fetchFlyRequirements(expandedFlySlug);
    }
    fetchFlyList(flyQuery, flyCategory);
  };

  // ─── Build per-size rows for a given material+color ────────
  const buildSizeRows = useCallback((material: TyingMaterial, color: string, preselectedSize?: string) => {
    const rows: Record<string, { checked: boolean; quantity: string; existingId?: string }> = {};
    const sizes = material.sizes || [];
    for (const size of sizes) {
      const existing = inventory.find(
        i => i.material_id === material.id
          && i.size_owned === size
          && (i.color_owned || '') === color
      );
      rows[size] = {
        checked: !!existing || preselectedSize === size,
        quantity: existing?.quantity || '',
        existingId: existing?.id,
      };
    }
    return rows;
  }, [inventory]);

  // ─── Open Inventory Modal ───────────────────────────────────
  const openInventoryModal = useCallback((material: TyingMaterial, opts?: { preselectedSize?: string }) => {
    // Default the color picker to whatever color the user already owns this material in (if any)
    const existingColor = inventory.find(i => i.material_id === material.id)?.color_owned || '';
    setAddingMaterial(material);
    setAddColor(existingColor);

    if (material.sizes && material.sizes.length > 0) {
      setSizeRows(buildSizeRows(material, existingColor, opts?.preselectedSize));
      setAddQty('');
    } else {
      setSizeRows({});
      // Pre-populate quantity from existing single-row record, if any
      const existing = inventory.find(
        i => i.material_id === material.id
          && (i.color_owned || '') === existingColor
          && !i.size_owned
      );
      setAddQty(existing?.quantity || '');
    }
  }, [inventory, buildSizeRows]);

  // When color changes inside the modal, re-derive size rows for that color
  const handleColorChange = (color: string) => {
    setAddColor(color);
    if (!addingMaterial) return;
    if (addingMaterial.sizes && addingMaterial.sizes.length > 0) {
      setSizeRows(buildSizeRows(addingMaterial, color));
    } else {
      const existing = inventory.find(
        i => i.material_id === addingMaterial.id
          && (i.color_owned || '') === color
          && !i.size_owned
      );
      setAddQty(existing?.quantity || '');
    }
  };

  // ─── Save Inventory Changes (batched) ──────────────────────
  const saveInventoryChanges = async () => {
    if (!addingMaterial) return;
    setSavingInventory(true);
    const colorVal = addColor || null;
    const isSized = !!(addingMaterial.sizes && addingMaterial.sizes.length > 0);

    try {
      const ops: Promise<Response>[] = [];

      if (isSized) {
        for (const [size, row] of Object.entries(sizeRows)) {
          if (row.checked) {
            ops.push(fetch('/api/materials/inventory', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                material_id: addingMaterial.id,
                color_owned: colorVal,
                size_owned: size,
                quantity: row.quantity || null,
              }),
            }));
          } else if (row.existingId) {
            ops.push(fetch(`/api/materials/inventory?id=${row.existingId}`, { method: 'DELETE' }));
          }
        }
      } else {
        ops.push(fetch('/api/materials/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            material_id: addingMaterial.id,
            color_owned: colorVal,
            size_owned: null,
            quantity: addQty || null,
          }),
        }));
      }

      const results = await Promise.all(ops);
      const failures = results.filter(r => !r.ok);
      if (failures.length) {
        const first = failures[0];
        const data = await first.json().catch(() => ({}));
        setToast({
          kind: 'error',
          message: `Inventory save failed (${failures.length}/${results.length}): ${data.error || `HTTP ${first.status}`}`,
        });
        setSavingInventory(false);
        return;
      }

      setAddingMaterial(null);
      setAddColor('');
      setAddQty('');
      setSizeRows({});
      await fetchInventory();
      if (tab === 'pickFly') refreshFlyAfterAdd();
      setToast({ kind: 'success', message: 'Inventory updated.' });
    } catch (err) {
      setToast({ kind: 'error', message: err instanceof Error ? err.message : 'Failed to save inventory' });
    }

    setSavingInventory(false);
  };

  // ─── Remove from Inventory ───────────────────────────────────
  const removeFromInventory = async (id: string) => {
    try {
      const res = await fetch(`/api/materials/inventory?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setToast({ kind: 'error', message: data.error || `Remove failed (${res.status})` });
        return;
      }
      setInventory(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      setToast({ kind: 'error', message: err instanceof Error ? err.message : 'Failed to remove' });
    }
  };

  // ─── Grouped Inventory ───────────────────────────────────────
  const groupedInventory = inventory.reduce<Record<string, UserMaterialInventory[]>>((acc, item) => {
    const cat = item.material?.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Count of distinct (color+size) entries per material — surfaces "Owned · 3 sizes" in the catalog
  const ownedCountByMaterial = useMemo(() => {
    const m: Record<string, number> = {};
    for (const item of inventory) m[item.material_id] = (m[item.material_id] || 0) + 1;
    return m;
  }, [inventory]);

  const Wrapper = embedded ? 'div' : 'div';
  const wrapperClass = embedded ? '' : 'min-h-screen bg-bg text-text-primary';
  const headerClass = embedded ? '' : 'border-b border-border';
  const headerInnerClass = embedded ? 'pb-2' : 'max-w-7xl mx-auto px-4 lg:px-6 py-4';

  return (
    <Wrapper className={wrapperClass}>
      {/* Header */}
      <div className={headerClass}>
        <div className={headerInnerClass}>
          {!embedded && (
            <div className="flex items-end justify-between border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">
                  <Link href="/journal/flies" className="hover:text-accent">Fly Box</Link>
                  <span>/</span>
                  <span>Tying Workbench</span>
                </div>
                <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text-primary leading-tight">
                  Tying Workbench
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="font-mono text-xl text-accent font-semibold tabular-nums">{inventory.length}</span>
                  <span className="text-text-muted text-[11px] uppercase tracking-widest ml-1">materials</span>
                </div>
                <Button href="/journal/flies/new" variant="solid" size="md" icon={Plus}>
                  New Fly
                </Button>
              </div>
            </div>
          )}

          {/* Tabs — horizontal scroll on mobile, wrap on desktop */}
          <div
            role="tablist"
            aria-label="Workbench mode"
            className="mt-4 -mx-4 sm:mx-0 px-4 sm:px-0 flex items-center gap-1.5 overflow-x-auto sm:flex-wrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {([
              { id: 'pickFly' as Tab, label: 'Pick a Pattern', icon: Target, hint: 'Start from a fly you want to tie — we’ll show every material needed and flag what you already own vs. still need to pick up. No inventory required to begin.' },
              { id: 'inventory' as Tab, label: 'My Inventory', icon: Package, hint: 'Track what you own at the vise. Optional — add materials whenever you want, not required before tying your first fly.' },
              { id: 'whatCanITie' as Tab, label: 'What Can I Tie?', icon: Sparkles, hint: 'Reverse lookup (Pro): crosses your inventory against every fly recipe and ranks them by % of materials you already have.' },
              { id: 'browse' as Tab, label: 'Browse Materials', icon: Search, hint: 'Search the 500+ material catalog. One click adds it to your inventory.' },
            ]).map(({ id, label, icon: Icon, hint }) => (
              <div key={id} className="flex shrink-0 items-center">
                <button
                  onClick={() => setTab(id)}
                  role="tab"
                  aria-selected={tab === id}
                  className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-[12px] font-semibold uppercase tracking-wide whitespace-nowrap transition-colors ${
                    tab === id
                      ? 'bg-accent text-bg'
                      : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-raised'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
                <span className="hidden sm:inline-flex">
                  <HelpHint label={`About: ${label}`} className="ml-0.5">
                    {hint}
                  </HelpHint>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
        <div className="mb-4">
          <TipCard storageKey="workbench-intro-v2" title="Two ways to start — no inventory required">
            <p><span className="text-[var(--text-primary)] font-semibold">Start with a fly →</span> Open <em>Pick a Pattern</em>, choose what you want to tie, and we’ll list every material you need. Owned items show a green check; missing ones get a one-tap <em>Add</em>.</p>
            <p><span className="text-[var(--text-primary)] font-semibold">Or start with your box →</span> Drop what you already own into <em>My Inventory</em>, then flip to <em>What Can I Tie?</em> to see recipes ranked by the % of materials you have.</p>
            <p className="text-[var(--text-meta)]">Add materials as you go — the Workbench works either direction.</p>
          </TipCard>
        </div>

        {/* ─── Pick a Pattern Tab ─────────────────────────────── */}
        {tab === 'pickFly' && (
          <div>
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 sm:gap-3 mb-6">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search patterns (Perdigon, Pheasant Tail...)"
                  value={flyQuery}
                  onChange={e => setFlyQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') fetchFlyList(flyQuery, flyCategory); }}
                  className="w-full h-9 bg-surface border border-border rounded-md pl-9 pr-3 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2 sm:contents">
                <select
                  value={flyCategory}
                  onChange={e => setFlyCategory(e.target.value)}
                  className="h-9 bg-surface border border-border rounded-md px-2.5 text-[13px] text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="">All Types</option>
                  <option value="nymph">Nymph</option>
                  <option value="dry">Dry Fly</option>
                  <option value="streamer">Streamer</option>
                  <option value="wet">Wet Fly</option>
                  <option value="emerger">Emerger</option>
                  <option value="terrestrial">Terrestrial</option>
                </select>
                <Button onClick={() => fetchFlyList(flyQuery, flyCategory)} variant="solid" size="md">
                  Search
                </Button>
              </div>
            </div>

            {flyListLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-accent" />
              </div>
            ) : flyList.length === 0 ? (
              <div className="text-center py-16">
                <Target size={48} className="mx-auto mb-4 text-text-muted" />
                <p className="text-text-secondary">No patterns match that search.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-text-muted text-sm mb-1">
                  Pick a fly to see the material list — green checks mean you already own it, orange pluses add it to your inventory.
                </p>
                {flyList.map(fly => (
                  <PickFlyCard
                    key={fly.id}
                    fly={fly}
                    expanded={expandedFlySlug === fly.slug}
                    loading={flyReqLoading === fly.slug}
                    requirements={flyRequirements[fly.slug]}
                    onToggle={() => toggleFlyExpanded(fly.slug)}
                    onAddMaterial={(material, size) => openInventoryModal(material, { preselectedSize: size })}
                    viewerIsAdmin={viewerIsAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Inventory Tab ──────────────────────────────────── */}
        {tab === 'inventory' && (
          <div>
            {invLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-accent" />
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-16 max-w-md mx-auto">
                <Package size={48} className="mx-auto mb-4 text-text-muted" />
                <h2 className="font-[family-name:var(--font-heading)] text-xl mb-2">No materials tracked yet</h2>
                <p className="text-text-secondary mb-6">
                  You don’t need an inventory to start — pick a fly and add materials as you go. Or browse the catalog and log what you already own.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={() => setTab('pickFly')} variant="solid" size="md" icon={Target}>
                    Pick a Pattern to Tie
                  </Button>
                  <Button onClick={() => setTab('browse')} variant="outline" size="md" icon={Search}>
                    Browse Materials
                  </Button>
                </div>
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
                    onAddVariant={(material) => setVariantMaterial(material)}
                  />
                ))}
                {groupedInventory['other'] && (
                  <InventoryGroup
                    category="other"
                    label="Other"
                    items={groupedInventory['other']}
                    onRemove={removeFromInventory}
                    onAddVariant={(material) => setVariantMaterial(material)}
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
              <div className="text-center py-16 max-w-md mx-auto">
                <Wrench size={48} className="mx-auto mb-4 text-text-muted" />
                <h2 className="font-[family-name:var(--font-heading)] text-xl mb-2">No matches yet</h2>
                <p className="text-text-secondary mb-6">
                  This tab ranks recipes once you’ve logged some materials. Don’t want to build an inventory first? Start from a pattern instead — the Workbench will tell you what you need.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={() => setTab('pickFly')} variant="solid" size="md" icon={Target}>
                    Pick a Pattern
                  </Button>
                  <Button onClick={() => setTab('inventory')} variant="outline" size="md" icon={Package}>
                    Manage Inventory
                  </Button>
                </div>
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
                  placeholder="Search by name, brand, type..."
                  value={browseSearch}
                  onChange={e => setBrowseSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { setBrowsePage(0); fetchBrowse(browseCategory, browseSearch, 0); } }}
                  className="w-full h-9 bg-surface border border-border rounded-md pl-9 pr-3 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
              </div>
              <select
                value={browseCategory}
                onChange={e => { setBrowsePage(0); setBrowseCategory(e.target.value); }}
                className="h-9 bg-surface border border-border rounded-md px-2.5 text-[13px] text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
                ))}
              </select>
              <Button
                onClick={() => { setBrowsePage(0); fetchBrowse(browseCategory, browseSearch, 0); }}
                variant="solid"
                size="md"
               
              >
                Search
              </Button>
              <Button
                onClick={() => {
                  setSubmitInitialCategory((browseCategory as MaterialCategory) || undefined);
                  setShowSubmitMaterial(true);
                }}
                variant="outline"
                size="md"
                icon={Plus}
               
                title="Add a material that's missing from the catalog"
              >
                New Material
              </Button>
            </div>

            {browseLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-accent" />
              </div>
            ) : (
              <>
                <p className="text-text-muted text-sm mb-4">
                  {browseTotal === 0
                    ? 'No materials found'
                    : `Showing ${browsePage * BROWSE_PAGE_SIZE + 1}–${browsePage * BROWSE_PAGE_SIZE + browseMaterials.length} of ${browseTotal} materials`}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {browseMaterials.map(material => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      ownedCount={ownedCountByMaterial[material.id] || 0}
                      onOpen={() => openInventoryModal(material)}
                      onVariant={() => setVariantMaterial(material)}
                      isPending={material.is_verified === false}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {browseTotal > BROWSE_PAGE_SIZE && (() => {
                  const totalPages = Math.ceil(browseTotal / BROWSE_PAGE_SIZE);
                  const currentPage = browsePage;
                  const goTo = (p: number) => {
                    setBrowsePage(p);
                    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                  };
                  // Build a compact page list with ellipses
                  const pages: (number | '…')[] = [];
                  const push = (p: number | '…') => { if (pages[pages.length - 1] !== p) pages.push(p); };
                  push(0);
                  for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    if (i > 0 && i < totalPages - 1) {
                      if (i > 1 && pages[pages.length - 1] !== '…' && pages[pages.length - 1] !== 0) push('…');
                      else if (i > 1 && pages[pages.length - 1] === 0) push('…');
                      push(i);
                    }
                  }
                  if (totalPages > 1) {
                    if (pages[pages.length - 1] !== totalPages - 2 && pages[pages.length - 1] !== '…' && totalPages - 1 - (pages[pages.length - 1] as number) > 1) push('…');
                    push(totalPages - 1);
                  }

                  return (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                      <button
                        onClick={() => goTo(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="px-3 py-1.5 rounded-lg border border-border bg-surface text-sm text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent"
                      >
                        Previous
                      </button>
                      {pages.map((p, i) => (
                        p === '…' ? (
                          <span key={`e-${i}`} className="px-2 text-text-muted text-sm">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => goTo(p)}
                            aria-current={p === currentPage ? 'page' : undefined}
                            className={`min-w-[36px] px-3 py-1.5 rounded-lg border text-sm ${
                              p === currentPage
                                ? 'bg-accent text-bg border-accent font-medium'
                                : 'bg-surface text-text-primary border-border hover:border-accent'
                            }`}
                          >
                            {p + 1}
                          </button>
                        )
                      ))}
                      <button
                        onClick={() => goTo(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="px-3 py-1.5 rounded-lg border border-border bg-surface text-sm text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent"
                      >
                        Next
                      </button>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>

      {/* ─── Add to Inventory Modal ─────────────────────────────── */}
      {addingMaterial && (() => {
        const isSized = !!(addingMaterial.sizes && addingMaterial.sizes.length > 0);
        const checkedCount = isSized
          ? Object.values(sizeRows).filter(r => r.checked).length
          : 0;
        return (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-md border border-border p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-[family-name:var(--font-heading)] text-lg">
                  {isSized ? 'Inventory by Size' : 'Add to Inventory'}
                </h3>
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
                      onChange={e => handleColorChange(e.target.value)}
                      className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
                    >
                      <option value="">Any / Not specified</option>
                      {addingMaterial.colors.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                {isSized ? (
                  <div>
                    <label className="text-text-muted text-xs uppercase tracking-wider block mb-2">
                      Sizes you have on hand
                    </label>
                    <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
                      {addingMaterial.sizes!.map(size => {
                        const row = sizeRows[size] || { checked: false, quantity: '' };
                        return (
                          <div key={size} className="flex items-center gap-3 px-3 py-2 bg-surface-raised">
                            <label className="flex items-center gap-2 cursor-pointer min-w-[70px]">
                              <input
                                type="checkbox"
                                checked={row.checked}
                                onChange={e => setSizeRows(prev => ({
                                  ...prev,
                                  [size]: { ...prev[size], checked: e.target.checked, quantity: prev[size]?.quantity || '' },
                                }))}
                                className="accent-accent w-4 h-4"
                              />
                              <span className="text-text-primary text-sm font-mono">Size {size}</span>
                            </label>
                            <input
                              type="text"
                              placeholder="qty (e.g. 1 pack)"
                              value={row.quantity}
                              disabled={!row.checked}
                              onChange={e => setSizeRows(prev => ({
                                ...prev,
                                [size]: { ...prev[size], checked: prev[size]?.checked ?? true, quantity: e.target.value },
                              }))}
                              className="flex-1 bg-surface border border-border rounded px-2 py-1 text-sm text-text-primary placeholder:text-text-muted disabled:opacity-40"
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-text-muted text-[11px] mt-2">
                      Tick each size you stock and (optionally) jot quantity. Leave unchecked to remove it.
                    </p>
                  </div>
                ) : (
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
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setAddingMaterial(null)}
                  disabled={savingInventory}
                  className="flex-1 bg-surface-raised text-text-secondary px-4 py-2 rounded-lg text-sm hover:text-text-primary disabled:opacity-50"
                >
                  Cancel
                </button>
                <Button
                  onClick={saveInventoryChanges}
                  disabled={savingInventory}
                  loading={savingInventory}
                  variant="solid"
                  size="md"
                 
                  fullWidth
                  className="flex-1"
                >
                  {isSized
                    ? (checkedCount === 0 ? 'Save (clear all)' : `Save ${checkedCount} size${checkedCount === 1 ? '' : 's'}`)
                    : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── Quick Variant Modal ────────────────────────────────── */}
      {variantMaterial && (
        <QuickVariantModal
          material={variantMaterial}
          isOwnPending={variantMaterial.is_verified === false}
          onClose={() => setVariantMaterial(null)}
          onSaved={(msg) => {
            setVariantMaterial(null);
            setToast({ kind: 'success', message: msg });
            fetchInventory();
            fetchBrowse(browseCategory, browseSearch, browsePage);
          }}
        />
      )}

      {/* ─── Submit New Material Modal ──────────────────────────── */}
      {showSubmitMaterial && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-md border border-border p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-[family-name:var(--font-heading)] text-lg">Add New Material</h3>
              <button onClick={() => setShowSubmitMaterial(false)} className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>
            <p className="text-text-muted text-xs mb-4">
              It&apos;s available to you immediately. We&apos;ll review and promote good submissions to the public catalog.
            </p>
            <SubmitMaterialForm
              initialCategory={submitInitialCategory}
              onSuccess={() => {
                setShowSubmitMaterial(false);
                setToast({ kind: 'success', message: 'Material added — it&apos;s in your catalog now.' });
                setBrowsePage(0);
                fetchBrowse(browseCategory, browseSearch, 0);
              }}
              onCancel={() => setShowSubmitMaterial(false)}
            />
          </div>
        </div>
      )}

      {/* ─── Toast / banner ─────────────────────────────────────── */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 z-[60] max-w-sm px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
            toast.kind === 'success'
              ? 'bg-[#0d2d1f] border-[var(--state-positive)] text-[#7EE2A8]'
              : 'bg-[#2d0d0d] border-[var(--state-negative)] text-[#FFA8A8]'
          }`}
        >
          <div className="flex items-start gap-2">
            {toast.kind === 'success'
              ? <Check size={16} className="mt-0.5 flex-shrink-0" />
              : <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </Wrapper>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function InventoryGroup({
  category,
  label,
  items,
  onRemove,
  onAddVariant,
}: {
  category: string;
  label: string;
  items: UserMaterialInventory[];
  onRemove: (id: string) => void;
  onAddVariant?: (material: TyingMaterial) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // Group by material_id so "UTC 70 — 5 colors" shows once, not 5 times.
  const byMaterial = items.reduce<Record<string, { material?: TyingMaterial; rows: UserMaterialInventory[] }>>(
    (acc, item) => {
      const key = item.material_id;
      if (!acc[key]) acc[key] = { material: item.material, rows: [] };
      acc[key].rows.push(item);
      return acc;
    },
    {},
  );
  const groups = Object.values(byMaterial);

  return (
    <div className="bg-surface rounded-md border border-border overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-raised transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-accent" />
          <span className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
            {label}
          </span>
          <span className="text-text-muted text-xs font-mono">
            ({groups.length} {groups.length === 1 ? 'product' : 'products'} · {items.length} {items.length === 1 ? 'variant' : 'variants'})
          </span>
        </div>
        {collapsed ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronUp size={16} className="text-text-muted" />}
      </button>
      {!collapsed && (
        <div className="divide-y divide-border">
          {groups.map(({ material, rows }) => (
            <div key={rows[0].material_id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium truncate">
                    {material?.name || 'Unknown'}
                  </p>
                  {material?.brand && (
                    <p className="text-text-muted text-xs">{material.brand}</p>
                  )}
                </div>
                {material && onAddVariant && (
                  <button
                    onClick={() => onAddVariant(material)}
                    className="text-text-muted hover:text-accent text-[11px] flex items-center gap-1 flex-shrink-0"
                    title="Add another color/size to your inventory"
                  >
                    <Plus size={10} /> Variant
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {rows.map(row => {
                  const chipText = [row.color_owned, row.size_owned ? `Size ${row.size_owned}` : null]
                    .filter(Boolean).join(' · ') || (row.quantity ? `Qty: ${row.quantity}` : '—');
                  return (
                    <span
                      key={row.id}
                      className="inline-flex items-center gap-1 bg-surface-raised border border-border rounded px-2 py-0.5 text-[11px] text-text-secondary"
                    >
                      {row.color_owned && <span className="text-signal">{row.color_owned}</span>}
                      {row.size_owned && <span className="font-mono">Size {row.size_owned}</span>}
                      {!row.color_owned && !row.size_owned && row.quantity && <span>{row.quantity}</span>}
                      {!row.color_owned && !row.size_owned && !row.quantity && <span>{chipText}</span>}
                      <button
                        onClick={() => onRemove(row.id)}
                        className="text-text-muted hover:text-danger ml-0.5"
                        title="Remove this variant"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  );
                })}
              </div>
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
    <div className={`bg-surface rounded-md border overflow-hidden ${
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
                  <span className="text-text-muted">{formatRoleLabel(m.role)}:</span> {m.material_name}
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

function PickFlyCard({
  fly,
  expanded,
  loading,
  requirements,
  onToggle,
  onAddMaterial,
  viewerIsAdmin = false,
}: {
  fly: FlyBrowseItem;
  expanded: boolean;
  loading: boolean;
  requirements?: FlyRequirementsResponse;
  onToggle: () => void;
  onAddMaterial: (material: TyingMaterial, size?: string) => void;
  viewerIsAdmin?: boolean;
}) {
  const pct = fly.coverage_percentage;
  const pctColor = pct === 100 ? 'text-success' : pct >= 50 ? 'text-accent' : 'text-text-muted';

  return (
    <div className="bg-surface rounded-md border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-surface-raised transition-colors"
      >
        {fly.hero_image_url && (
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-raised flex-shrink-0">
            <Image src={fly.hero_image_url} alt={fly.name} width={48} height={48} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-text-primary text-sm font-medium truncate">{fly.name}</p>
          <p className="text-text-muted text-xs capitalize">
            {fly.category} · {fly.required_count} material{fly.required_count === 1 ? '' : 's'} needed
          </p>
        </div>
        <div className="flex items-center gap-3">
          {fly.required_count > 0 && (
            <div className={`font-mono text-sm font-semibold ${pctColor}`}>
              {fly.owned_required_count}/{fly.required_count}
            </div>
          )}
          {expanded
            ? <ChevronUp size={14} className="text-text-muted" />
            : <ChevronDown size={14} className="text-text-muted" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={18} className="animate-spin text-accent" />
            </div>
          ) : !requirements ? (
            <p className="text-text-muted text-xs py-4">Unable to load materials.</p>
          ) : requirements.ingredients.length === 0 ? (
            <p className="text-text-muted text-xs py-4">No structured recipe yet for this pattern — open the fly page for the full write-up.</p>
          ) : (
            <>
              <p className="text-text-muted text-[11px] uppercase tracking-wider mb-2">Materials</p>
              <div className="space-y-1.5">
                {requirements.ingredients.map(ing => (
                  <div key={ing.id} className="flex items-center gap-2 text-sm">
                    {ing.owned ? (
                      <Check size={14} className="text-success flex-shrink-0" />
                    ) : (
                      <div className="w-[14px] h-[14px] rounded-full border border-border flex-shrink-0" />
                    )}
                    <span className="text-text-muted text-xs w-20 flex-shrink-0">{formatRoleLabel(ing.role)}</span>
                    <span className="text-text-primary flex-1 truncate">
                      {ing.material?.name || ing.material_name || '—'}
                      {ing.is_optional && <span className="text-text-muted text-xs ml-1">(optional)</span>}
                    </span>
                    {!ing.owned && ing.material && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddMaterial(ing.material as TyingMaterial, ing.size_choice);
                        }}
                        className="flex items-center gap-1 text-accent text-xs font-medium hover:underline flex-shrink-0"
                      >
                        <Plus size={12} /> Add
                      </button>
                    )}
                    {!ing.owned && !ing.material && (
                      <span className="text-text-muted text-[11px] flex-shrink-0">free-text</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-4 pt-3 border-t border-border">
                <Link
                  href={`/flies/${requirements.fly.slug}`}
                  className="flex items-center gap-1 text-signal text-xs hover:underline"
                >
                  View pattern & tying steps <ArrowRight size={12} />
                </Link>
                {viewerIsAdmin ? (
                  <Link
                    href={`/admin/flies/${requirements.fly.slug}/edit?from=${encodeURIComponent("/flies?tab=workbench")}`}
                    className="flex items-center gap-1 text-accent text-xs font-medium hover:underline ml-auto"
                  >
                    Edit canonical recipe <ArrowRight size={12} />
                  </Link>
                ) : (
                  <Link
                    href={`/flies/${requirements.fly.slug}`}
                    className="flex items-center gap-1 text-accent text-xs font-medium hover:underline ml-auto"
                  >
                    Start tying this <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MaterialCard({
  material,
  ownedCount,
  onOpen,
  onVariant,
  isPending = false,
}: {
  material: TyingMaterial;
  ownedCount: number;
  onOpen: () => void;
  onVariant?: () => void;
  isPending?: boolean;
}) {
  const isOwned = ownedCount > 0;
  const hasSizes = !!(material.sizes && material.sizes.length > 0);
  return (
    <div className={`bg-surface rounded-md border p-3 flex flex-col ${isPending ? 'border-[var(--action)]/40' : 'border-border'}`}>
      <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-text-primary text-sm font-medium truncate">{material.name}</p>
          {isPending && (
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--action)]/15 text-[var(--action)] font-semibold flex-shrink-0">
              Pending
            </span>
          )}
        </div>
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
      <button
        onClick={onOpen}
        className={`flex items-center gap-1 text-xs font-medium ml-2 hover:underline whitespace-nowrap ${
          isOwned ? 'text-success' : 'text-accent'
        }`}
        title={isOwned ? 'Manage sizes' : 'Add to inventory'}
      >
        {isOwned ? (
          <>
            <Check size={12} />
            Owned{hasSizes ? ` · ${ownedCount} ${ownedCount === 1 ? 'size' : 'sizes'}` : ''}
          </>
        ) : (
          <>
            <Plus size={12} /> Add
          </>
        )}
      </button>
      </div>
      {onVariant && (
        <button
          onClick={onVariant}
          className="text-text-muted hover:text-accent text-[11px] mt-2 self-start flex items-center gap-1"
          title="Add a new color, size, or clone this material"
        >
          <Plus size={10} /> Variant
        </button>
      )}
    </div>
  );
}
