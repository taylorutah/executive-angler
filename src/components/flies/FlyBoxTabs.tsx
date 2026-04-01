'use client';

import { useState } from 'react';
import { Heart, ListChecks, Layers } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type Tab = 'all' | 'favorites' | 'tie-next';

const TYPE_ICONS: Record<string, string> = {
  "Nymph": "🪝",
  "Dry Fly": "🦋",
  "Streamer": "🐟",
  "Wet Fly": "💧",
  "Emerger": "🌊",
  "Terrestrial": "🦗",
  "Egg": "🟠",
  "Midge": "🦟",
  "Other": "🪰",
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

export function FlyBoxTabs({ favCount, tieNextCount, sortedTypes, grouped, canonicalNames }: FlyBoxTabsProps) {
  const [tab, setTab] = useState<Tab>('all');

  const canonicalNameSet = new Set(canonicalNames);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'all', label: 'My Box', icon: <Layers className="h-3.5 w-3.5" /> },
    { key: 'favorites', label: 'Favorites', icon: <Heart className="h-3.5 w-3.5" />, count: favCount },
    { key: 'tie-next', label: 'Tie Next', icon: <ListChecks className="h-3.5 w-3.5" />, count: tieNextCount },
  ];

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-[#161B22] border border-[#21262D] rounded-lg p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
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
        ))}
      </div>

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
                <span className="text-lg">{TYPE_ICONS[type] || "🪰"}</span>
                <h2 className="font-heading text-base font-bold text-[#F0F6FC]">{type}</h2>
                <span className="text-xs text-[#6E7681] ml-1">{filteredCards.length}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {filteredCards.map(card => {
                  if (card.source === 'library') {
                    const cf = card.entry.canonical_fly;
                    return (
                      <div key={card.entry.id} className="group flex flex-col bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden hover:shadow-md hover:border-[#E8923A]/30 transition-all">
                        <Link href={`/flies/${cf.slug}`}>
                          <div className="relative aspect-square bg-white overflow-hidden">
                            {cf.hero_image_url ? (
                              <img
                                src={cf.hero_image_url}
                                alt={cf.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-[#0D1117]">
                                <span className="text-3xl">{TYPE_ICONS[type] || "🪰"}</span>
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
                        <div className="mt-auto px-2 pb-2">
                          <Link
                            href={`/flies/${cf.slug}`}
                            className="flex items-center justify-center gap-1 w-full py-1 rounded-md bg-[#21262D] text-[10px] font-semibold text-[#A8B2BD] hover:bg-[#2D333B] transition-colors"
                          >
                            View Pattern →
                          </Link>
                        </div>
                      </div>
                    );
                  }

                  // Personal fly
                  const fly = card.fly;
                  return (
                    <div key={fly.id} className="group flex flex-col bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden hover:shadow-md hover:border-[#E8923A]/30 transition-all">
                      <Link href={`/journal/flies/${fly.id}/edit`}>
                        <div className="relative aspect-square bg-[#0D1117] overflow-hidden">
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
                              <span className="text-3xl">{TYPE_ICONS[fly.type || "Other"] || "🪰"}</span>
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
                      <div className="mt-auto px-2 pb-2">
                        {canonicalNameSet.has(fly.name.toLowerCase().trim()) ? (
                          <span className="flex items-center justify-center gap-1 w-full py-1 rounded-md bg-[#21262D] text-[10px] font-semibold text-[#6E7681]">
                            ✓ In Fly Library
                          </span>
                        ) : (
                          <Link
                            href={`/contribute/fly_pattern?from_fly_box=${fly.id}`}
                            className="flex items-center justify-center gap-1 w-full py-1 rounded-md bg-[#E8923A]/10 text-[10px] font-semibold text-[#E8923A] hover:bg-[#E8923A]/20 transition-colors"
                          >
                            🪰 Submit to Library
                          </Link>
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
