'use client';

import { useState, useCallback } from 'react';
import { Heart, ListChecks, Layers, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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

// Toggle button for favorite/tie-next actions on a card. Heart stays as a
// compact icon; Tie Next is a labeled pill so its toggled state is obvious.
function CardActions({
  card,
  onToggleFavorite,
  onToggleTieNext,
}: {
  card: UnifiedFly;
  onToggleFavorite: (card: UnifiedFly) => void;
  onToggleTieNext: (card: UnifiedFly) => void;
}) {
  const isFav = card.source === 'library' ? card.entry.is_favorite : card.fly.is_favorite;
  const isTie = card.source === 'library' ? card.entry.is_tie_next : card.fly.is_tie_next;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(card); }}
        title={isFav ? "Remove from Favorites" : "Add to Favorites"}
        className={`p-1 rounded transition-colors ${
          isFav
            ? 'text-red-400 hover:text-red-300'
            : 'text-[#6E7681] hover:text-red-400'
        }`}
      >
        <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-red-400' : ''}`} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleTieNext(card); }}
        title={isTie ? "Remove from Tie Next queue" : "Add to Tie Next queue"}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-colors ${
          isTie
            ? 'bg-[#E8923A] text-white hover:bg-[#F0A65A] shadow-sm shadow-[#E8923A]/30'
            : 'bg-[#21262D] text-[#A8B2BD] hover:bg-[#E8923A]/15 hover:text-[#E8923A]'
        }`}
      >
        {isTie ? <Check className="h-3 w-3" /> : <ListChecks className="h-3 w-3" />}
        <span>{isTie ? 'Queued' : 'Tie Next'}</span>
      </button>
    </div>
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

// Completion checkbox for tie-next cards
function TieNextCheckbox({
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
      className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-400 hover:bg-green-500/20 text-[10px] font-semibold transition-colors"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Check className="h-3 w-3" />
      )}
      Done
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
      <div className="flex items-center gap-1 mb-3 bg-[#161B22] border border-[#21262D] rounded-lg p-1">
        {tabs.map((t) => (
          <div key={t.key} className="flex items-center">
            <button
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-[#E8923A] text-white'
                  : 'text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#0D1117]'
              }`}
            >
              {t.icon}
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-xs rounded-full px-1.5 ${tab === t.key ? 'bg-white/20' : 'bg-[#21262D]'}`}>
                  {t.count}
                </span>
              )}
            </button>
            {t.key === 'tie-next' ? (
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
            ) : null}
            {t.key === 'favorites' ? (
              <HelpHint label="About Favorites" className="ml-0.5">
                <p>Flies you&apos;ve starred for quick access. Tap the heart on any card to save.</p>
              </HelpHint>
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {filteredCards.map(card => {
                  if (card.source === 'library') {
                    const cf = card.entry.canonical_fly;
                    const queued = !!card.entry.is_tie_next;
                    return (
                      <div key={card.entry.id} className={`group flex flex-col bg-[#161B22] rounded-xl border overflow-hidden transition-all ${
                        queued
                          ? 'border-[#E8923A]/60 shadow-md shadow-[#E8923A]/10 hover:border-[#E8923A]'
                          : 'border-[#21262D] hover:shadow-md hover:border-[#E8923A]/30'
                      }`}>
                        <Link href={`/flies/${cf.slug}`}>
                          <div className="relative aspect-square bg-white overflow-hidden">
                            {queued && <TieNextRibbon />}
                            {cf.hero_image_url ? (
                              <img
                                src={cf.hero_image_url}
                                alt={cf.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-[#0D1117]">
                                <span className="text-3xl">{TYPE_ICONS[type] || "\uD83E\uDEB0"}</span>
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-semibold text-[#F0F6FC] leading-tight truncate">{cf.name}</p>
                            {cf.sizes && cf.sizes.length > 0 && (
                              <p className="text-[10px] text-[#6E7681] mt-0.5">
                                <span className="text-[#A8B2BD]">Sizes:</span> {cf.sizes.slice(0, 3).join(", ")}
                              </p>
                            )}
                          </div>
                        </Link>
                        <div className="mt-auto px-2 pb-2 flex items-center justify-between">
                          <CardActions card={card} onToggleFavorite={toggleFavorite} onToggleTieNext={toggleTieNext} />
                          {tab === 'tie-next' && (
                            <TieNextCheckbox card={card} onComplete={completeTieNext} loading={completingIds.has(card.entry.id)} />
                          )}
                          {tab !== 'tie-next' && (
                            <Link
                              href={`/flies/${cf.slug}`}
                              className="flex items-center justify-center gap-1 py-1 px-2 rounded-md bg-[#21262D] text-[10px] font-semibold text-[#A8B2BD] hover:bg-[#2D333B] transition-colors"
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Personal fly
                  const fly = card.fly;
                  const queued = !!fly.is_tie_next;
                  return (
                    <div key={fly.id} className={`group flex flex-col bg-[#161B22] rounded-xl border overflow-hidden transition-all ${
                      queued
                        ? 'border-[#E8923A]/60 shadow-md shadow-[#E8923A]/10 hover:border-[#E8923A]'
                        : 'border-[#21262D] hover:shadow-md hover:border-[#E8923A]/30'
                    }`}>
                      <Link href={`/journal/flies/${fly.id}/edit`}>
                        <div className="relative aspect-square bg-[#0D1117] overflow-hidden">
                          {queued && <TieNextRibbon />}
                          {fly.image_url ? (
                            <Image
                              src={fly.image_url}
                              alt={fly.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                              sizes="140px"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-3xl">{TYPE_ICONS[fly.type || "Other"] || "\uD83E\uDEB0"}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-semibold text-[#F0F6FC] leading-tight truncate">{fly.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(() => {
                              const bead = parseArrayField(fly.bead_size);
                              return bead ? (
                                <span className="text-[10px] text-[#6E7681] truncate"><span className="text-[#A8B2BD]">Bead:</span> {bead}</span>
                              ) : null;
                            })()}
                            {(() => {
                              const sizes = parseArrayField(fly.size);
                              return sizes ? (
                                <span className="text-[10px] text-[#6E7681]"><span className="text-[#A8B2BD]">Size:</span> {sizes}</span>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </Link>
                      <div className="mt-auto px-2 pb-2 flex items-center justify-between">
                        <CardActions card={card} onToggleFavorite={toggleFavorite} onToggleTieNext={toggleTieNext} />
                        {tab === 'tie-next' && (
                          <TieNextCheckbox card={card} onComplete={completeTieNext} loading={completingIds.has(fly.id)} />
                        )}
                        {tab !== 'tie-next' && (
                          canonicalNameSet.has(fly.name.toLowerCase().trim()) ? (
                            <span className="flex items-center gap-1 py-1 px-2 rounded-md bg-[#21262D] text-[10px] font-semibold text-[#6E7681]">
                              In Library
                            </span>
                          ) : (
                            <Link
                              href={`/contribute/fly_pattern?from_fly_box=${fly.id}`}
                              className="flex items-center gap-1 py-1 px-2 rounded-md bg-[#E8923A]/10 text-[10px] font-semibold text-[#E8923A] hover:bg-[#E8923A]/20 transition-colors"
                            >
                              Submit
                            </Link>
                          )
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
