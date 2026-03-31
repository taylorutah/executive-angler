import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Plus, Feather } from 'lucide-react'
import { FlyBoxTabs } from '@/components/flies/FlyBoxTabs'

const CATEGORY_TO_TYPE: Record<string, string> = {
  dry: "Dry Fly",
  nymph: "Nymph",
  streamer: "Streamer",
  emerger: "Emerger",
  wet: "Wet Fly",
  terrestrial: "Terrestrial",
  egg: "Egg",
  midge: "Midge",
};

const TYPE_ORDER = ["Nymph", "Dry Fly", "Streamer", "Wet Fly", "Emerger", "Terrestrial", "Egg", "Midge", "Other"];

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

interface FlyPattern {
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
}

interface CanonicalFly {
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

interface UserFlyBoxEntry {
  id: string;
  canonical_fly_id: string;
  preferred_sizes?: string[] | null;
  personal_notes?: string | null;
  is_favorite?: boolean;
  is_tie_next?: boolean;
  times_used?: number;
  canonical_fly: CanonicalFly;
}

export default async function FlyBoxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch all three in parallel
  const [patternsResult, flyBoxResult, canonicalResult] = await Promise.all([
    supabase
      .from('fly_patterns')
      .select('*')
      .eq('user_id', user.id)
      .order('name'),
    supabase
      .from('user_fly_box')
      .select(`
        id,
        canonical_fly_id,
        preferred_sizes,
        personal_notes,
        is_favorite,
        is_tie_next,
        times_used,
        canonical_fly:canonical_flies(id, slug, name, category, tagline, sizes, colors, bead_options, hook_styles, hero_image_url)
      `)
      .eq('user_id', user.id)
      .order('added_at', { ascending: false }),
    supabase
      .from('canonical_flies')
      .select('name, slug'),
  ]);

  // Build a lowercase name set for fast lookup
  const canonicalNames = new Set(
    (canonicalResult.data || []).map(f => f.name.toLowerCase().trim())
  );

  const personalFlies = (patternsResult.data || []) as FlyPattern[];
  const libraryEntries = (flyBoxResult.data || []) as unknown as UserFlyBoxEntry[];

  // Unified card type for rendering
  type UnifiedFly =
    | { source: 'personal'; fly: FlyPattern }
    | { source: 'library'; entry: UserFlyBoxEntry };

  // Convert library entries to unified cards
  const libraryCards: UnifiedFly[] = libraryEntries
    .filter(e => e.canonical_fly)
    .map(e => ({ source: 'library', entry: e }));

  const personalCards: UnifiedFly[] = personalFlies.map(f => ({ source: 'personal', fly: f }));

  // Group all cards by type
  const grouped: Record<string, UnifiedFly[]> = {};
  for (const card of [...libraryCards, ...personalCards]) {
    let type: string;
    if (card.source === 'library') {
      type = CATEGORY_TO_TYPE[card.entry.canonical_fly.category] || "Other";
    } else {
      type = card.fly.type || "Other";
    }
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(card);
  }

  const totalCount = personalFlies.length + libraryEntries.length;
  const favCount = libraryEntries.filter(e => e.is_favorite).length
    + personalFlies.filter(f => (f as unknown as { is_favorite?: boolean }).is_favorite).length;
  const tieNextCount = libraryEntries.filter(e => e.is_tie_next).length
    + personalFlies.filter(f => (f as unknown as { is_tie_next?: boolean }).is_tie_next).length;

  const sortedTypes = [
    ...TYPE_ORDER.filter(t => grouped[t]?.length),
    ...Object.keys(grouped).filter(t => !TYPE_ORDER.includes(t) && grouped[t]?.length),
  ];

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/journal" className="flex items-center gap-1.5 text-sm text-[#6E7681] hover:text-[#E8923A] transition-colors mb-2">
              ← Journal
            </Link>
            <h1 className="font-heading text-2xl font-bold text-[#F0F6FC]">My Fly Box</h1>
            <p className="text-sm text-[#6E7681] mt-0.5">{totalCount} pattern{totalCount !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/journal/flies/new"
            className="flex items-center gap-1.5 rounded-xl bg-[#E8923A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#F0A65A] transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> Add Pattern
          </Link>
        </div>

        {totalCount === 0 ? (
          <div className="text-center py-20">
            <Feather className="h-12 w-12 mx-auto text-[#6E7681] mb-4" />
            <p className="text-[#A8B2BD] mb-2">Your fly box is empty</p>
            <p className="text-sm text-[#6E7681] mb-6">Add patterns manually or browse the <Link href="/flies" className="text-[#E8923A] hover:underline">Fly Library</Link></p>
            <Link href="/journal/flies/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#E8923A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#F0A65A]">
              <Plus className="h-4 w-4" /> Add Your First Pattern
            </Link>
          </div>
        ) : (
          <FlyBoxTabs favCount={favCount} tieNextCount={tieNextCount}>
            {(activeTab) => (
          <div className="space-y-10">
            {sortedTypes.map(type => {
              // Filter cards based on active tab
              const filteredCards = grouped[type].filter(card => {
                if (activeTab === 'all') return true;
                if (activeTab === 'favorites') {
                  if (card.source === 'library') return card.entry.is_favorite;
                  return (card.fly as unknown as { is_favorite?: boolean }).is_favorite;
                }
                if (activeTab === 'tie-next') {
                  if (card.source === 'library') return card.entry.is_tie_next;
                  return (card.fly as unknown as { is_tie_next?: boolean }).is_tie_next;
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
                          {canonicalNames.has(fly.name.toLowerCase().trim()) ? (
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
            )}
          </FlyBoxTabs>
        )}
      </div>
    </div>
  );
}
