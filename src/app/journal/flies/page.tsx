import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Plus, Feather } from 'lucide-react'

const TYPE_ORDER = ["Nymph", "Dry Fly", "Streamer", "Wet Fly", "Emerger", "Terrestrial", "Egg", "Other"];

/** Normalize array fields from DB — handles real arrays, JSON strings, and plain strings */
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
const TYPE_ICONS: Record<string, string> = {
  "Nymph": "🪝",
  "Dry Fly": "🦋",
  "Streamer": "🐟",
  "Wet Fly": "💧",
  "Emerger": "🌊",
  "Terrestrial": "🦗",
  "Egg": "🟠",
  "Other": "🪰",
};

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

export default async function FlyBoxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: patterns, error } = await supabase
    .from('fly_patterns')
    .select('*')
    .eq('user_id', user.id)
    .order('name');

  const flies = (patterns || []) as FlyPattern[];

  // Group by type
  const grouped: Record<string, FlyPattern[]> = {};
  for (const fly of flies) {
    const type = fly.type || "Other";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(fly);
  }

  // Sort groups by TYPE_ORDER
  const sortedTypes = [
    ...TYPE_ORDER.filter(t => grouped[t]?.length),
    ...Object.keys(grouped).filter(t => !TYPE_ORDER.includes(t) && grouped[t]?.length),
  ];

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-24 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/journal" className="flex items-center gap-1.5 text-sm text-[#484F58] hover:text-[#E8923A] transition-colors mb-2">
              ← Journal
            </Link>
            <h1 className="font-heading text-2xl font-bold text-[#F0F6FC]">My Fly Box</h1>
            <p className="text-sm text-[#484F58] mt-0.5">{flies.length} pattern{flies.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/journal/flies/new"
            className="flex items-center gap-1.5 rounded-xl bg-[#E8923A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0D1117] transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> Add Pattern
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            Error loading patterns: {error.message}
          </div>
        )}

        {flies.length === 0 ? (
          <div className="text-center py-20">
            <Feather className="h-12 w-12 mx-auto text-[#484F58] mb-4" />
            <p className="text-[#8B949E] mb-4">Your fly box is empty</p>
            <Link href="/journal/flies/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#E8923A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0D1117]">
              <Plus className="h-4 w-4" /> Add Your First Pattern
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {sortedTypes.map(type => (
              <section key={type}>
                {/* Section header */}
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#21262D]">
                  <span className="text-lg">{TYPE_ICONS[type] || "🪰"}</span>
                  <h2 className="font-heading text-base font-bold text-[#F0F6FC]">{type}</h2>
                  <span className="text-xs text-[#484F58] ml-1">{grouped[type].length}</span>
                </div>

                {/* Fly grid — smaller cards */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {grouped[type].map(fly => (
                    <Link key={fly.id} href={`/journal/flies/${fly.id}/edit`}
                      className="group bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden hover:shadow-md hover:border-[#E8923A]/30 transition-all">
                      {/* Image — smaller square */}
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
                      {/* Info */}
                      <div className="p-2">
                        <p className="text-xs font-semibold text-[#F0F6FC] leading-tight truncate">{fly.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(() => {
                            const bead = parseArrayField(fly.bead_size);
                            return bead ? (
                              <span className="text-[10px] text-[#484F58] truncate"><span className="text-[#8B949E]">Bead:</span> {bead}</span>
                            ) : null;
                          })()}
                          {(() => {
                            const sizes = parseArrayField(fly.size);
                            return sizes ? (
                              <span className="text-[10px] text-[#484F58]"><span className="text-[#8B949E]">Size:</span> {sizes}</span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
