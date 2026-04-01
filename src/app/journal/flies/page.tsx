import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Feather } from 'lucide-react'
import { FlyBoxTabs } from '@/components/flies/FlyBoxTabs'
import type { SerializedFlyPattern, SerializedFlyBoxEntry } from '@/components/flies/FlyBoxTabs'

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

type UnifiedFly =
  | { source: 'personal'; fly: SerializedFlyPattern }
  | { source: 'library'; entry: SerializedFlyBoxEntry };

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

  // Build a lowercase name array for the client component
  const canonicalNames = (canonicalResult.data || []).map(f => f.name.toLowerCase().trim());

  const personalFlies = (patternsResult.data || []) as SerializedFlyPattern[];
  const libraryEntries = (flyBoxResult.data || []) as unknown as SerializedFlyBoxEntry[];

  // Convert library entries to unified cards
  const libraryCards: UnifiedFly[] = libraryEntries
    .filter(e => e.canonical_fly)
    .map(e => ({ source: 'library' as const, entry: e }));

  const personalCards: UnifiedFly[] = personalFlies.map(f => ({ source: 'personal' as const, fly: f }));

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
    + personalFlies.filter(f => f.is_favorite).length;
  const tieNextCount = libraryEntries.filter(e => e.is_tie_next).length
    + personalFlies.filter(f => f.is_tie_next).length;

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
          <FlyBoxTabs
            favCount={favCount}
            tieNextCount={tieNextCount}
            sortedTypes={sortedTypes}
            grouped={grouped}
            canonicalNames={canonicalNames}
          />
        )}
      </div>
    </div>
  );
}
