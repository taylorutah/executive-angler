'use client';

import { useState, useCallback } from 'react';
import { Heart, ListChecks, Layers, Check, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import HelpHint from '@/components/ui/HelpHint';

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
}

export interface SerializedFlyBoxEntry {
  id: string;
  canonical_fly_id: string;
  preferred_sizes?: string[] | null;
  personal_notes?: string | null;
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

export function FlyBoxTabs({ favCount: initialFavCount, tieNextCount: initialTieNextCount, sortedTypes, grouped: initialGrouped, canonicalNames }: FlyBoxTabsProps) {
  const [tab, setTab] = useState<Tab>('all');
  const [grouped, setGrouped] = useState(initialGrouped);
  const [favCount, setFavCount] = useState(initialFavCount);
  const [tieNextCount, setTieNextCount] = useState(initialTieNextCount);
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());

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
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#21262D]">
                <span className="text-lg">{TYPE_ICONS[type] || "\uD83E\uDEB0"}</span>
                <h2 className="font-heading text-base font-bold text-[#F0F6FC]">{type}</h2>
                <span className="text-xs text-[#6E7681] ml-1">{filteredCards.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredCards.map(card => {
                  if (card.source === 'library') {
                    const cf = card.entry.canonical_fly;
                    const queued = !!card.entry.is_tie_next;
                    const detailHref = `/flies/${cf.slug}`;
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
                            {cf.hero_image_url ? (
                              <img
                                src={cf.hero_image_url}
                                alt={cf.name}
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-[#0D1117]">
                                <span className="text-3xl">{TYPE_ICONS[type] || "\uD83E\uDEB0"}</span>
                              </div>
                            )}
                          </Link>
                          {queued && <TieNextRibbon />}
                        </div>
                        <Link href={detailHref} className="block px-2.5 pt-2 pb-1.5">
                          <p className="text-[13px] font-semibold text-[#F0F6FC] leading-tight truncate">{cf.name}</p>
                          {cf.sizes && cf.sizes.length > 0 && (
                            <p className="text-[10px] text-[#6E7681] mt-0.5 truncate">
                              <span className="text-[#A8B2BD]">Sizes</span> &middot; {cf.sizes.slice(0, 4).join(", ")}
                            </p>
                          )}
                        </Link>
                        <div className="mt-auto px-2 pb-2 pt-1 flex items-center gap-1.5 border-t border-[#21262D]/60">
                          <FavoriteToggle card={card} onToggle={toggleFavorite} />
                          {tab === 'tie-next' ? (
                            <TieNextDone
                              card={card}
                              onComplete={completeTieNext}
                              loading={completingIds.has(card.entry.id)}
                            />
                          ) : (
                            <TieNextToggle card={card} onToggle={toggleTieNext} />
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Personal fly
                  const fly = card.fly;
                  const queued = !!fly.is_tie_next;
                  const inLibrary = canonicalNameSet.has(fly.name.toLowerCase().trim());
                  const detailHref = `/journal/flies/${fly.id}/edit`;
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
                          <p className="text-[10px] text-[#6E7681] mt-0.5 truncate">
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
                        {tab === 'tie-next' ? (
                          <TieNextDone
                            card={card}
                            onComplete={completeTieNext}
                            loading={completingIds.has(fly.id)}
                          />
                        ) : (
                          <TieNextToggle card={card} onToggle={toggleTieNext} />
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
    </div>
  );
}
