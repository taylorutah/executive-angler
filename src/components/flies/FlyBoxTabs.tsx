'use client';

import { useState, useCallback } from 'react';
import { Heart, ListChecks, Layers, Check, Loader2, Plus, CreditCard, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import HelpHint from '@/components/ui/HelpHint';
import FlyCardModal from '@/components/flies/FlyCardModal';
import { ownerPatternPermalink } from '@/lib/flies/permalink';
import {
  resolveFlyForViewer,
  type Personalizations,
} from '@/lib/flies/resolveFlyForViewer';
import type { CanonicalFly } from '@/types/entities';

type Tab = 'all' | 'favorites' | 'tie-next';

const TYPE_ICONS: Record<string, string> = {
  "Nymph": "\uD83E\uDE9D",
  "Dry Fly": "\uD83E\uDD8B",
  "Streamer": "\uD83D\uDC1F",
  "Wet Fly": "\uD83D\uDCA7",
  "Emerger": "\uD83C\uDF0A",
  "Terrestrial": "\uD83E\uDD97",
  "Egg": "\uD83D\uDFE0",
  "Midge": "\uD83E\uDD9F",
  "Other": "\uD83E\uDEB0",
};

/** Normalize array fields from DB */
function parseArrayField(val: unknown): string {
  if (!val) return "";
  if (Array.isArray(val)) return val.filter(Boolean).join(", ");
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.filter(Boolean).join(", ");
      } catch { /* fall through */ }
    }
    return trimmed;
  }
  return String(val);
}

export interface SerializedFlyPattern {
  id: string;
  name: string;
  type?: string;
  size?: string | string[];
  hook?: string;
  bead_size?: string;
  bead_color?: string;
  fly_color?: string;
  image_url?: string;
  tags?: string[];
  description?: string;
  is_favorite?: boolean;
  is_tie_next?: boolean;
  parent_canonical_id?: string;
  promoted_to_canonical_id?: string | null;
  promoted_canonical_slug?: string | null;
  /** Pattern slug (per owner) — needed for /anglers/[username]/flies/[slug]. */
  slug?: string | null;
}

export interface SerializedCanonicalFly {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline?: string;
  sizes?: string[];
  colors?: string[];
  bead_options?: string[];
  hook_styles?: string[];
  hero_image_url?: string;
  materials_list?: { material: string; description?: string }[];
}

export interface SerializedFlyBoxEntry {
  id: string;
  canonical_fly_id: string;
  preferred_sizes?: string[] | null;
  personal_notes?: string | null;
  custom_image_url?: string | null;
  custom_name?: string | null;
  personalizations?: Record<string, Record<string, string | undefined> | undefined> | null;
  is_favorite?: boolean;
  is_tie_next?: boolean;
  times_used?: number;
  canonical_fly: SerializedCanonicalFly;
}

type UnifiedFly =
  | { source: 'personal'; fly: SerializedFlyPattern }
  | { source: 'library'; entry: SerializedFlyBoxEntry };

interface FlyBoxTabsProps {
  favCount: number;
  tieNextCount: number;
  sortedTypes: string[];
  grouped: Record<string, UnifiedFly[]>;
  canonicalNames: string[];
  /** Viewer's username — threads to ownerPatternPermalink so personal fly
   *  cards link to /anglers/[username]/flies/[slug] instead of the edit form. */
  viewerUsername?: string | null;
  /** Personal-pattern delete request — parent owns the dialog. */
  onDeletePersonal?: (input: { id: string; name: string }) => void;
  /** Library entry delete request — parent owns the dialog. The viewer's
   *  user_fly_box row id is passed; parent decides whether to unlink the
   *  whole canonical group or just this row. */
  onDeleteLibraryEntry?: (input: { entryId: string; name: string }) => void;
}

// Compact favorite toggle (icon-only, fixed width on the left of the footer).
function FavoriteToggle({
  card,
  onToggle,
}: {
  card: UnifiedFly;
  onToggle: (card: UnifiedFly) => void;
}) {
  const isFav = card.source === 'library' ? card.entry.is_favorite : card.fly.is_favorite;
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(card); }}
      title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
      aria-label={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
      aria-pressed={isFav}
      className={`flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
        isFav
          ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
          : 'text-[#6E7681] hover:text-red-400 hover:bg-[#21262D]'
      }`}
    >
      <Heart className={`h-4 w-4 ${isFav ? 'fill-red-400' : ''}`} />
    </button>
  );
}

// Tie Next toggle pill — fills remaining footer width, never wraps.
function TieNextToggle({
  card,
  onToggle,
}: {
  card: UnifiedFly;
  onToggle: (card: UnifiedFly) => void;
}) {
  const isTie = card.source === 'library' ? card.entry.is_tie_next : card.fly.is_tie_next;
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(card); }}
      title={isTie ? 'Remove from Tie Next queue' : 'Add to Tie Next queue'}
      aria-pressed={isTie}
      className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1 h-7 px-2 rounded-md text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
        isTie
          ? 'bg-[#E8923A] text-white hover:bg-[#F0A65A] shadow-sm shadow-[#E8923A]/30'
          : 'bg-[#21262D] text-[#A8B2BD] hover:bg-[#E8923A]/15 hover:text-[#E8923A]'
      }`}
    >
      {isTie ? <Check className="h-3 w-3 flex-shrink-0" /> : <ListChecks className="h-3 w-3 flex-shrink-0" />}
      <span className="truncate">{isTie ? 'Queued' : 'Tie Next'}</span>
    </button>
  );
}

// Subtle "In Library" indicator overlaid on the image — informational only.
function InLibraryBadge() {
  return (
    <div
      className="absolute bottom-1.5 left-1.5 z-10 inline-flex items-center gap-1 rounded-full bg-black/55 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/95 ring-1 ring-white/15 shadow-sm shadow-black/30"
      title="This pattern matches one in the library"
    >
      <Check className="h-2.5 w-2.5" />
      <span>In Library</span>
    </div>
  );
}

// Submit-to-library CTA on the image — clickable, never nests anchors.
function SubmitBadge({ flyId }: { flyId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/contribute/fly_pattern?from_fly_box=${flyId}`);
      }}
      title="Submit this pattern to the library"
      className="absolute bottom-1.5 left-1.5 z-10 inline-flex items-center gap-1 rounded-full bg-[#E8923A] hover:bg-[#F0A65A] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm shadow-black/30 ring-1 ring-white/20 transition-colors"
    >
      <Plus className="h-2.5 w-2.5" />
      <span>Submit</span>
    </button>
  );
}

// Corner ribbon overlaid on the card photo when queued — the strongest
// at-a-glance signal in a dense card grid.
function TieNextRibbon() {
  return (
    <div className="absolute top-1.5 right-1.5 z-10 inline-flex items-center gap-1 rounded-full bg-[#E8923A] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-md shadow-black/30 ring-1 ring-white/30">
      <ListChecks className="h-2.5 w-2.5" />
      <span>Tie Next</span>
    </div>
  );
}

// Completion button for tie-next cards — mark as tied (clears from queue).
function TieNextDone({
  card,
  onComplete,
  loading,
}: {
  card: UnifiedFly;
  onComplete: (card: UnifiedFly) => void;
  loading: boolean;
}) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onComplete(card); }}
      title="Mark as tied"
      disabled={loading}
      className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 h-7 px-2 rounded-md bg-green-500/10 text-green-400 hover:bg-green-500/20 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 flex-shrink-0 animate-spin" />
      ) : (
        <Check className="h-3 w-3 flex-shrink-0" />
      )}
      <span className="truncate">Done</span>
    </button>
  );
}

export function FlyBoxTabs({ favCount: initialFavCount, tieNextCount: initialTieNextCount, sortedTypes, grouped: initialGrouped, canonicalNames, viewerUsername, onDeletePersonal, onDeleteLibraryEntry }: FlyBoxTabsProps) {
  const [tab, setTab] = useState<Tab>('all');
  const [grouped, setGrouped] = useState(initialGrouped);
  const [favCount, setFavCount] = useState(initialFavCount);
  const [tieNextCount, setTieNextCount] = useState(initialTieNextCount);
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());
  const [cardOpen, setCardOpen] = useState<UnifiedFly | null>(null);

  const canonicalNameSet = new Set(canonicalNames);

  const getCardId = (card: UnifiedFly) =>
    card.source === 'library' ? card.entry.id : card.fly.id;

  const toggleFavorite = useCallback(async (card: UnifiedFly) => {
    const currentFav = card.source === 'library' ? card.entry.is_favorite : card.fly.is_favorite;
    const newFav = !currentFav;

    // Optimistic update
    setGrouped(prev => {
      const next = { ...prev };
      for (const type of Object.keys(next)) {
        next[type] = next[type].map(c => {
          if (getCardId(c) !== getCardId(card)) return c;
          if (c.source === 'library') return { ...c, entry: { ...c.entry, is_favorite: newFav } };
          return { ...c, fly: { ...c.fly, is_favorite: newFav } };
        });
      }
      return next;
    });
    setFavCount(prev => newFav ? prev + 1 : prev - 1);

    // API call
    const body = card.source === 'library'
      ? { flyBoxId: card.entry.id, favorite: newFav }
      : { flyPatternId: card.fly.id, favorite: newFav };

    try {
      const res = await fetch('/api/fishing/fly-favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        // Revert on failure
        setGrouped(prev => {
          const next = { ...prev };
          for (const type of Object.keys(next)) {
            next[type] = next[type].map(c => {
              if (getCardId(c) !== getCardId(card)) return c;
              if (c.source === 'library') return { ...c, entry: { ...c.entry, is_favorite: currentFav } };
              return { ...c, fly: { ...c.fly, is_favorite: currentFav } };
            });
          }
          return next;
        });
        setFavCount(prev => newFav ? prev - 1 : prev + 1);
      }
    } catch {
      // Revert
      setGrouped(prev => {
        const next = { ...prev };
        for (const type of Object.keys(next)) {
          next[type] = next[type].map(c => {
            if (getCardId(c) !== getCardId(card)) return c;
            if (c.source === 'library') return { ...c, entry: { ...c.entry, is_favorite: currentFav } };
            return { ...c, fly: { ...c.fly, is_favorite: currentFav } };
          });
        }
        return next;
      });
      setFavCount(prev => newFav ? prev - 1 : prev + 1);
    }
  }, []);

  const toggleTieNext = useCallback(async (card: UnifiedFly) => {
    const currentTie = card.source === 'library' ? card.entry.is_tie_next : card.fly.is_tie_next;
    const newTie = !currentTie;

    // Optimistic update
    setGrouped(prev => {
      const next = { ...prev };
      for (const type of Object.keys(next)) {
        next[type] = next[type].map(c => {
          if (getCardId(c) !== getCardId(card)) return c;
          if (c.source === 'library') return { ...c, entry: { ...c.entry, is_tie_next: newTie } };
          return { ...c, fly: { ...c.fly, is_tie_next: newTie } };
        });
      }
      return next;
    });
    setTieNextCount(prev => newTie ? prev + 1 : prev - 1);

    // API call
    if (newTie) {
      const body = card.source === 'library'
        ? { flyBoxId: card.entry.id }
        : { flyPatternId: card.fly.id };

      try {
        const res = await fetch('/api/fishing/tie-next', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
      } catch {
        // Revert
        setGrouped(prev => {
          const next = { ...prev };
          for (const type of Object.keys(next)) {
            next[type] = next[type].map(c => {
              if (getCardId(c) !== getCardId(card)) return c;
              if (c.source === 'library') return { ...c, entry: { ...c.entry, is_tie_next: currentTie } };
              return { ...c, fly: { ...c.fly, is_tie_next: currentTie } };
            });
          }
          return next;
        });
        setTieNextCount(prev => newTie ? prev - 1 : prev + 1);
      }
    } else {
      const param = card.source === 'library'
        ? `flyBoxId=${card.entry.id}`
        : `flyPatternId=${card.fly.id}`;

      try {
        const res = await fetch(`/api/fishing/tie-next?${param}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
      } catch {
        // Revert
        setGrouped(prev => {
          const next = { ...prev };
          for (const type of Object.keys(next)) {
            next[type] = next[type].map(c => {
              if (getCardId(c) !== getCardId(card)) return c;
              if (c.source === 'library') return { ...c, entry: { ...c.entry, is_tie_next: currentTie } };
              return { ...c, fly: { ...c.fly, is_tie_next: currentTie } };
            });
          }
          return next;
        });
        setTieNextCount(prev => newTie ? prev - 1 : prev + 1);
      }
    }
  }, []);

  const completeTieNext = useCallback(async (card: UnifiedFly) => {
    const id = getCardId(card);
    setCompletingIds(prev => new Set(prev).add(id));

    const param = card.source === 'library'
      ? `flyBoxId=${card.entry.id}`
      : `flyPatternId=${card.fly.id}`;

    try {
      const res = await fetch(`/api/fishing/tie-next?${param}`, { method: 'DELETE' });
      if (res.ok) {
        // Remove tie-next flag optimistically
        setGrouped(prev => {
          const next = { ...prev };
          for (const type of Object.keys(next)) {
            next[type] = next[type].map(c => {
              if (getCardId(c) !== id) return c;
              if (c.source === 'library') return { ...c, entry: { ...c.entry, is_tie_next: false } };
              return { ...c, fly: { ...c.fly, is_tie_next: false } };
            });
          }
          return next;
        });
        setTieNextCount(prev => Math.max(0, prev - 1));
      }
    } catch {
      // silently fail
    } finally {
      setCompletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'all', label: 'My Box', icon: <Layers className="h-3.5 w-3.5" /> },
    { key: 'favorites', label: 'Favorites', icon: <Heart className="h-3.5 w-3.5" />, count: favCount },
    { key: 'tie-next', label: 'Tie Next', icon: <ListChecks className="h-3.5 w-3.5" />, count: tieNextCount },
  ];

  // Check if any flies match the current filter
  const hasVisibleCards = sortedTypes.some(type =>
    (grouped[type] || []).some(card => {
      if (tab === 'all') return true;
      if (tab === 'favorites') {
        return card.source === 'library' ? card.entry.is_favorite : card.fly.is_favorite;
      }
      if (tab === 'tie-next') {
        return card.source === 'library' ? card.entry.is_tie_next : card.fly.is_tie_next;
      }
      return true;
    })
  );

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter fly box"
        className="grid grid-cols-3 items-center gap-1 mb-3 bg-[#161B22] border border-[#21262D] rounded-lg p-1"
      >
        {tabs.map((t) => (
          <div key={t.key} className="flex items-center justify-center">
            <button
              onClick={() => setTab(t.key)}
              role="tab"
              aria-selected={tab === t.key}
              className={`flex w-full items-center justify-center gap-1.5 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.key
                  ? 'bg-[#E8923A] text-white'
                  : 'text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#0D1117]'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-xs rounded-full px-1.5 ${tab === t.key ? 'bg-white/20' : 'bg-[#21262D]'}`}>
                  {t.count}
                </span>
              )}
            </button>
            {t.key === 'tie-next' ? (
              <span className="hidden sm:inline-flex">
                <HelpHint label="About Tie Next" className="ml-0.5">
                  <p>A quick list of patterns queued for the vise.</p>
                  <p className="text-[#6E7681]">
                    For drag-and-drop planning (Want → Vise → Done), open the full board:{' '}
                    <Link href="/my-flies?tab=tie-next" className="text-[#00B4D8] hover:underline">
                      Tie Next board
                    </Link>
                    .
                  </p>
                </HelpHint>
              </span>
            ) : null}
            {t.key === 'favorites' ? (
              <span className="hidden sm:inline-flex">
                <HelpHint label="About Favorites" className="ml-0.5">
                  <p>Flies you&apos;ve starred for quick access. Tap the heart on any card to save.</p>
                </HelpHint>
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#6E7681]">
        <span className="inline-flex items-center gap-1">
          <Heart className="h-3 w-3" /> tap to favorite
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#21262D] text-[9px] font-semibold uppercase tracking-wider text-[#A8B2BD]">
            <ListChecks className="h-2.5 w-2.5" /> Tie Next
          </span>
          tap to queue for the vise
        </span>
        {tab === 'tie-next' ? (
          <span className="inline-flex items-center gap-1">
            <Check className="h-3 w-3" /> mark as tied (removes from queue)
          </span>
        ) : null}
      </div>

      {!hasVisibleCards && (
        <div className="text-center py-16">
          {tab === 'favorites' && (
            <>
              <Heart className="h-10 w-10 mx-auto text-[#6E7681] mb-3" />
              <p className="text-[#A8B2BD] mb-1">No favorite flies yet</p>
              <p className="text-sm text-[#6E7681]">Tap the heart icon on any fly to save it here</p>
            </>
          )}
          {tab === 'tie-next' && (
            <>
              <ListChecks className="h-10 w-10 mx-auto text-[#6E7681] mb-3" />
              <p className="text-[#A8B2BD] mb-1">Your tying queue is empty</p>
              <p className="text-sm text-[#6E7681] mb-4 max-w-md mx-auto">
                Tap the <ListChecks className="inline h-3.5 w-3.5" /> icon on any fly card — here, in the{' '}
                <Link href="/flies" className="text-[#00B4D8] hover:underline">Library</Link>, or in the{' '}
                <Link href="/my-flies?tab=workbench" className="text-[#00B4D8] hover:underline">Workbench</Link>.
              </p>
              <Link
                href="/my-flies?tab=tie-next"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#21262D] bg-[#0D1117] px-4 py-2 text-xs font-medium text-[#A8B2BD] hover:text-[#F0F6FC] hover:border-[#E8923A]/40"
              >
                Open full Tie Next board →
              </Link>
            </>
          )}
        </div>
      )}

      <div className="space-y-10">
        {sortedTypes.map(type => {
          const filteredCards = (grouped[type] || []).filter(card => {
            if (tab === 'all') return true;
            if (tab === 'favorites') {
              if (card.source === 'library') return card.entry.is_favorite;
              return card.fly.is_favorite;
            }
            if (tab === 'tie-next') {
              if (card.source === 'library') return card.entry.is_tie_next;
              return card.fly.is_tie_next;
            }
            return true;
          });
          if (filteredCards.length === 0) return null;
          return (
            <section key={type}>
              <div className="flex items-center gap-2 mb-3 pb-1.5 border-b border-[#21262D]">
                <span className="text-base">{TYPE_ICONS[type] || "\uD83E\uDEB0"}</span>
                <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#F0F6FC]">{type}</h2>
                <span className="text-[11px] font-[var(--font-mono)] tabular-nums text-[#6E7681] ml-1">{filteredCards.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredCards.map(card => {
                  if (card.source === 'library') {
                    const cf = card.entry.canonical_fly;
                    const queued = !!card.entry.is_tie_next;
                    const detailHref = `/flies/${cf.slug}`;
                    // Prefer the user's personal photo + custom name when set \u2014
                    // makes My Flies feel like "your" library rather than a
                    // generic catalog.
                    const displayImage = card.entry.custom_image_url || cf.hero_image_url;
                    const displayName = card.entry.custom_name || cf.name;
                    const hasPersonalisation =
                      !!card.entry.custom_image_url ||
                      !!card.entry.custom_name ||
                      (card.entry.preferred_sizes?.length ?? 0) > 0 ||
                      Object.keys((card.entry.personalizations ?? {}) as Record<string, unknown>).length > 0;
                    return (
                      <div
                        key={card.entry.id}
                        className={`group flex flex-col bg-[#161B22] rounded-xl border overflow-hidden transition-all ${
                          queued
                            ? 'border-[#E8923A]/60 shadow-md shadow-[#E8923A]/10 hover:border-[#E8923A]'
                            : 'border-[#21262D] hover:shadow-md hover:border-[#E8923A]/30'
                        }`}
                      >
                        <div className="relative aspect-square bg-white overflow-hidden">
                          <Link href={detailHref} className="block w-full h-full">
                            {displayImage ? (
                              <img
                                src={displayImage}
                                alt={displayName}
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-[#0D1117]">
                                <span className="text-3xl">{TYPE_ICONS[type] || "\uD83E\uDEB0"}</span>
                              </div>
                            )}
                          </Link>
                          {queued && <TieNextRibbon />}
                          {hasPersonalisation && (
                            <span className="absolute top-1.5 left-1.5 z-10 inline-flex items-center gap-0.5 rounded-full bg-[#E8923A] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#0D1117] shadow-sm shadow-black/30">
                              Yours
                            </span>
                          )}
                        </div>
                        <Link href={detailHref} className="block px-2.5 pt-2 pb-1.5">
                          <p className="text-[13px] font-semibold text-[#F0F6FC] leading-tight truncate">{displayName}</p>
                          {cf.sizes && cf.sizes.length > 0 && (
                            <p className="text-[10px] font-[var(--font-mono)] tabular-nums text-[#6E7681] mt-0.5 truncate">
                              <span className="text-[#A8B2BD]">Sizes</span> &middot; {(card.entry.preferred_sizes?.length ? card.entry.preferred_sizes : cf.sizes).slice(0, 4).join(", ")}
                            </p>
                          )}
                        </Link>
                        <div className="mt-auto px-2 pb-2 pt-1 flex items-center gap-1.5 border-t border-[#21262D]/60">
                          <FavoriteToggle card={card} onToggle={toggleFavorite} />
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCardOpen(card); }}
                            title="Open recipe card"
                            aria-label="Open recipe card"
                            className="flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md text-[#6E7681] hover:text-[#E8923A] hover:bg-[#E8923A]/10 transition-colors"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                          </button>
                          {tab === 'tie-next' ? (
                            <TieNextDone
                              card={card}
                              onComplete={completeTieNext}
                              loading={completingIds.has(card.entry.id)}
                            />
                          ) : (
                            <TieNextToggle card={card} onToggle={toggleTieNext} />
                          )}
                          {onDeleteLibraryEntry && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDeleteLibraryEntry({ entryId: card.entry.id, name: displayName });
                              }}
                              title="Remove from your fly box (canonical stays in the library)"
                              aria-label="Remove from your fly box"
                              className="ml-auto flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md text-[#6E7681] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Personal fly
                  const fly = card.fly;
                  const queued = !!fly.is_tie_next;
                  const inLibrary = canonicalNameSet.has(fly.name.toLowerCase().trim());
                  const detailHref = ownerPatternPermalink({
                    id: fly.id,
                    slug: fly.slug ?? null,
                    ownerUsername: viewerUsername ?? null,
                    promoted_to_canonical_id: fly.promoted_to_canonical_id ?? null,
                    promotedCanonicalSlug: fly.promoted_canonical_slug ?? null,
                  });
                  const bead = parseArrayField(fly.bead_size);
                  const sizes = parseArrayField(fly.size);
                  return (
                    <div
                      key={fly.id}
                      className={`group flex flex-col bg-[#161B22] rounded-xl border overflow-hidden transition-all ${
                        queued
                          ? 'border-[#E8923A]/60 shadow-md shadow-[#E8923A]/10 hover:border-[#E8923A]'
                          : 'border-[#21262D] hover:shadow-md hover:border-[#E8923A]/30'
                      }`}
                    >
                      <div className="relative aspect-square bg-[#0D1117] overflow-hidden">
                        <Link href={detailHref} className="block w-full h-full">
                          {fly.image_url ? (
                            <Image
                              src={fly.image_url}
                              alt={fly.name}
                              fill
                              className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                              sizes="(min-width: 1280px) 200px, (min-width: 768px) 25vw, 50vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-3xl">{TYPE_ICONS[fly.type || "Other"] || "\uD83E\uDEB0"}</span>
                            </div>
                          )}
                        </Link>
                        {queued && <TieNextRibbon />}
                        {inLibrary ? <InLibraryBadge /> : <SubmitBadge flyId={fly.id} />}
                      </div>
                      <Link href={detailHref} className="block px-2.5 pt-2 pb-1.5">
                        <p className="text-[13px] font-semibold text-[#F0F6FC] leading-tight truncate">{fly.name}</p>
                        {(bead || sizes) && (
                          <p className="text-[10px] font-[var(--font-mono)] tabular-nums text-[#6E7681] mt-0.5 truncate">
                            {sizes && (
                              <>
                                <span className="text-[#A8B2BD]">Sizes</span> &middot; {sizes}
                              </>
                            )}
                            {sizes && bead ? <span className="px-1 text-[#30363D]">&middot;</span> : null}
                            {bead && (
                              <>
                                <span className="text-[#A8B2BD]">Bead</span> &middot; {bead}
                              </>
                            )}
                          </p>
                        )}
                      </Link>
                      <div className="mt-auto px-2 pb-2 pt-1 flex items-center gap-1.5 border-t border-[#21262D]/60">
                        <FavoriteToggle card={card} onToggle={toggleFavorite} />
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCardOpen(card); }}
                          title="Open recipe card"
                          aria-label="Open recipe card"
                          className="flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md text-[#6E7681] hover:text-[#E8923A] hover:bg-[#E8923A]/10 transition-colors"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                        </button>
                        {tab === 'tie-next' ? (
                          <TieNextDone
                            card={card}
                            onComplete={completeTieNext}
                            loading={completingIds.has(fly.id)}
                          />
                        ) : (
                          <TieNextToggle card={card} onToggle={toggleTieNext} />
                        )}
                        {onDeletePersonal && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onDeletePersonal({ id: fly.id, name: fly.name });
                            }}
                            title="Delete this pattern (and its variants)"
                            aria-label="Delete this pattern"
                            className="ml-auto flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md text-[#6E7681] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {cardOpen && (
        <FlyCardModal
          open={true}
          onClose={() => setCardOpen(null)}
          fly={buildFlyForCardFromUnified(cardOpen)}
          imageUrl={getCardImage(cardOpen)}
          username={null}
        />
      )}
    </div>
  );
}

function getCardImage(card: UnifiedFly): string | null {
  if (card.source === 'library') {
    return card.entry.custom_image_url || card.entry.canonical_fly.hero_image_url || null;
  }
  return card.fly.image_url ?? null;
}

/**
 * Map a UnifiedFly into the FlyCardModal's expected shape. For library entries
 * we run the canonical+personalisation through resolveFlyForViewer so the card
 * reflects the user's overrides; for personal patterns we copy fields directly.
 */
function buildFlyForCardFromUnified(card: UnifiedFly): {
  id: string;
  name: string;
  type: string;
  size: string;
  hook?: string;
  bead_size?: string;
  bead_color?: string;
  body_color?: string;
  body_material?: string;
  tail_color?: string;
  thorax_color?: string;
  collar_color?: string;
  rib_material?: string;
  wing_material?: string;
  fly_color?: string;
  materials?: string;
  description?: string;
  tags?: string;
  image_url?: string | null;
} {
  if (card.source === 'personal') {
    const f = card.fly;
    return {
      id: f.id,
      name: f.name,
      type: f.type ?? '',
      size: parseArrayField(f.size),
      hook: f.hook,
      bead_size: f.bead_size,
      bead_color: f.bead_color,
      fly_color: f.fly_color,
      materials: f.description,
      description: f.description,
      tags: Array.isArray(f.tags) ? f.tags.join(', ') : '',
      image_url: f.image_url ?? null,
    };
  }

  // Library — resolve through the merge layer so Yours overrides apply.
  const entry = card.entry;
  const cf = entry.canonical_fly;
  const canonicalShape: CanonicalFly = {
    id: cf.id,
    slug: cf.slug,
    name: cf.name,
    category: cf.category as CanonicalFly['category'],
    description: cf.tagline ?? '',
    imitates: [],
    effectiveSpecies: [],
    waterTypes: [],
    sizes: cf.sizes ?? [],
    colors: cf.colors ?? [],
    beadOptions: cf.bead_options ?? [],
    hookStyles: cf.hook_styles ?? [],
    heroImageUrl: cf.hero_image_url ?? undefined,
    galleryUrls: [],
    relatedFlyIds: [],
    relatedRiverIds: [],
    relatedDestinationIds: [],
    flyShopIds: [],
    materialsList: cf.materials_list?.map((m) => ({
      material: m.material,
      description: m.description ?? '',
    })),
    featured: false,
    isHeroPattern: false,
  };

  const resolved = resolveFlyForViewer({
    canonical: canonicalShape,
    flyBox: {
      id: entry.id,
      personalizations: (entry.personalizations as Personalizations | null) ?? null,
      preferred_sizes: entry.preferred_sizes ?? null,
      personal_notes: entry.personal_notes ?? null,
      custom_image_url: entry.custom_image_url ?? null,
      custom_name: entry.custom_name ?? null,
      is_favorite: entry.is_favorite ?? null,
      is_tie_next: entry.is_tie_next ?? null,
    },
    viewMode: 'yours',
  });

  const slotMap: Record<string, string> = {};
  for (const r of resolved.recipe) {
    if (r.text) slotMap[r.slot] = r.text;
  }

  return {
    id: cf.id,
    name: resolved.displayName.value,
    type: cf.category,
    size: (entry.preferred_sizes?.length ? entry.preferred_sizes : cf.sizes ?? []).join(', '),
    hook: slotMap.hook,
    bead_size: slotMap.bead,
    body_color: slotMap.body,
    tail_color: slotMap.tail,
    thorax_color: slotMap.thorax,
    collar_color: slotMap.collar,
    rib_material: slotMap.rib,
    wing_material: slotMap.wing,
    materials: resolved.recipe.filter((r) => r.text).map((r) => `${r.label}: ${r.text}`).join('\n'),
    description: resolved.personalNotes || cf.tagline,
    image_url: resolved.heroImageUrl.value ?? null,
  };
}
