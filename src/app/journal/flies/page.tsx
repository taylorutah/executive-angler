import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Plus, Feather } from 'lucide-react'

const TYPE_ORDER = ["Nymph", "Dry Fly", "Streamer", "Wet Fly", "Emerger", "Terrestrial", "Egg", "Other"];
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
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-24 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/journal" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-forest transition-colors mb-2">
              ← Journal
            </Link>
            <h1 className="font-heading text-2xl font-bold text-slate-900">My Fly Box</h1>
            <p className="text-sm text-slate-400 mt-0.5">{flies.length} pattern{flies.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/journal/flies/new"
            className="flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-dark transition-colors shadow-sm">
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
            <Feather className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">Your fly box is empty</p>
            <Link href="/journal/flies/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-dark">
              <Plus className="h-4 w-4" /> Add Your First Pattern
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {sortedTypes.map(type => (
              <section key={type}>
                {/* Section header */}
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                  <span className="text-lg">{TYPE_ICONS[type] || "🪰"}</span>
                  <h2 className="font-heading text-base font-bold text-slate-800">{type}</h2>
                  <span className="text-xs text-slate-400 ml-1">{grouped[type].length}</span>
                </div>

                {/* Fly grid — smaller cards */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {grouped[type].map(fly => (
                    <Link key={fly.id} href={`/journal/flies/${fly.id}/edit`}
                      className="group bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md hover:border-forest/30 transition-all">
                      {/* Image — smaller square */}
                      <div className="relative aspect-square bg-slate-50 overflow-hidden">
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
                        <p className="text-xs font-semibold text-slate-900 leading-tight truncate">{fly.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {fly.bead_size && (
                            <span className="text-[10px] text-slate-400 truncate">{fly.bead_size}</span>
                          )}
                          {Array.isArray(fly.size) && fly.size.length > 0 && (
                            <span className="text-[10px] text-slate-400">#{fly.size.slice(0,2).join(", #")}</span>
                          )}
                          {typeof fly.size === "string" && fly.size && (
                            <span className="text-[10px] text-slate-400">{fly.size}</span>
                          )}
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
