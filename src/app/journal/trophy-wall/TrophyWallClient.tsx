'use client';

import { Trophy, Fish, Target, MapPin, Calendar, Star, Ruler } from 'lucide-react';
import Image from 'next/image';

interface CatchRecord {
  id: string;
  session_id: string;
  species?: string;
  length_inches?: number;
  fly_name?: string;
  fly_size?: string;
  fish_image_url?: string;
  time_caught?: string;
  created_at: string;
}

interface SessionRecord {
  id: string;
  date: string;
  river_name?: string;
  total_fish?: number;
  title?: string;
}

interface TrophyWallClientProps {
  catches: CatchRecord[];
  sessions: SessionRecord[];
}

export default function TrophyWallClient({ catches, sessions }: TrophyWallClientProps) {
  const sessionMap = new Map(sessions.map((s) => [s.id, s]));

  // Overall biggest fish
  const biggestOverall = catches[0]; // already sorted by length desc
  const biggestSession = biggestOverall ? sessionMap.get(biggestOverall.session_id) : null;

  // Biggest fish per species
  const biggestBySpecies = new Map<string, CatchRecord>();
  catches.forEach((c) => {
    if (!c.species) return;
    if (!biggestBySpecies.has(c.species) || (c.length_inches || 0) > (biggestBySpecies.get(c.species)!.length_inches || 0)) {
      biggestBySpecies.set(c.species, c);
    }
  });

  // Biggest fish per river
  const biggestByRiver = new Map<string, { catch: CatchRecord; session: SessionRecord }>();
  catches.forEach((c) => {
    const session = sessionMap.get(c.session_id);
    if (!session?.river_name) return;
    const existing = biggestByRiver.get(session.river_name);
    if (!existing || (c.length_inches || 0) > (existing.catch.length_inches || 0)) {
      biggestByRiver.set(session.river_name, { catch: c, session });
    }
  });

  // Top sessions by fish count
  const topSessions = [...sessions]
    .filter((s) => (s.total_fish || 0) > 0)
    .sort((a, b) => (b.total_fish || 0) - (a.total_fish || 0))
    .slice(0, 5);

  // Most species in single session
  const speciesBySession = new Map<string, Set<string>>();
  catches.forEach((c) => {
    if (!c.species) return;
    if (!speciesBySession.has(c.session_id)) speciesBySession.set(c.session_id, new Set());
    speciesBySession.get(c.session_id)!.add(c.species);
  });
  let mostSpeciesSessionData: { session: SessionRecord; count: number } | null = null;
  speciesBySession.forEach((species, sessionId) => {
    const session = sessionMap.get(sessionId);
    if (session && (!mostSpeciesSessionData || species.size > mostSpeciesSessionData.count)) {
      mostSpeciesSessionData = { session, count: species.size };
    }
  });
  const mostSpeciesSession = mostSpeciesSessionData as { session: SessionRecord; count: number } | null;

  if (catches.length === 0 && sessions.length === 0) {
    return (
      <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-12 text-center">
        <Trophy className="w-12 h-12 mx-auto mb-4 text-slate-600" />
        <h3 className="font-heading text-xl text-cream mb-2">No trophies yet</h3>
        <p className="text-slate-400">Log sessions and catches with measurements to build your trophy wall!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero trophy — biggest fish overall */}
      {biggestOverall && (
        <div className="bg-gradient-to-br from-[#FFD700]/10 via-[#E8923A]/5 to-[#0D1117] border border-[#FFD700]/30 rounded-xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-[#FFD700]" />
            <h2 className="font-heading text-2xl text-[#FFD700]">Personal Best</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {biggestOverall.fish_image_url && (
              <div className="w-full md:w-64 h-48 relative rounded-lg overflow-hidden border border-[#21262D]">
                <Image
                  src={biggestOverall.fish_image_url}
                  alt="Personal best catch"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 256px"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="text-5xl font-bold font-mono text-cream mb-2">
                {biggestOverall.length_inches}&quot;
              </div>
              {biggestOverall.species && (
                <div className="text-lg text-[#E8923A] font-medium mb-3">{biggestOverall.species}</div>
              )}
              <div className="space-y-1.5 text-sm text-[#A8B2BD]">
                {biggestSession?.river_name && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#6E7681]" />
                    {biggestSession.river_name}
                  </div>
                )}
                {biggestSession?.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#6E7681]" />
                    {new Date(biggestSession.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                )}
                {biggestOverall.fly_name && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#6E7681]" />
                    {biggestOverall.fly_name}
                    {biggestOverall.fly_size && <span className="text-[#6E7681]">#{biggestOverall.fly_size}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biggest by species */}
        {biggestBySpecies.size > 0 && (
          <div className="bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#21262D] flex items-center gap-2">
              <Fish className="w-5 h-5 text-[#00B4D8]" />
              <h3 className="font-heading text-lg text-cream">Biggest by Species</h3>
            </div>
            <div className="divide-y divide-[#21262D]">
              {Array.from(biggestBySpecies.entries())
                .sort((a, b) => (b[1].length_inches || 0) - (a[1].length_inches || 0))
                .map(([species, c]) => {
                  const session = sessionMap.get(c.session_id);
                  return (
                    <div key={species} className="px-5 py-3 flex items-center gap-4">
                      {c.fish_image_url ? (
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-[#21262D] shrink-0">
                          <Image src={c.fish_image_url} alt={species} fill className="object-cover" sizes="48px" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#0D1117] border border-[#21262D] flex items-center justify-center shrink-0">
                          <Fish className="w-5 h-5 text-[#6E7681]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-cream">{species}</div>
                        <div className="text-xs text-[#6E7681]">
                          {session?.river_name && <span>{session.river_name} — </span>}
                          {c.fly_name && <span>{c.fly_name}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xl font-bold font-mono text-[#E8923A]">{c.length_inches}&quot;</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Biggest by river */}
        {biggestByRiver.size > 0 && (
          <div className="bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#21262D] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#E8923A]" />
              <h3 className="font-heading text-lg text-cream">Biggest by River</h3>
            </div>
            <div className="divide-y divide-[#21262D]">
              {Array.from(biggestByRiver.entries())
                .sort((a, b) => (b[1].catch.length_inches || 0) - (a[1].catch.length_inches || 0))
                .map(([river, { catch: c }]) => (
                  <div key={river} className="px-5 py-3 flex items-center gap-4">
                    {c.fish_image_url ? (
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-[#21262D] shrink-0">
                        <Image src={c.fish_image_url} alt={river} fill className="object-cover" sizes="48px" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#0D1117] border border-[#21262D] flex items-center justify-center shrink-0">
                        <Ruler className="w-5 h-5 text-[#6E7681]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-cream">{river}</div>
                      <div className="text-xs text-[#6E7681]">
                        {c.species && <span>{c.species} — </span>}
                        {c.fly_name && <span>{c.fly_name}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold font-mono text-[#00B4D8]">{c.length_inches}&quot;</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Top sessions + most species */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top sessions by fish count */}
        {topSessions.length > 0 && (
          <div className="bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#21262D] flex items-center gap-2">
              <Target className="w-5 h-5 text-[#FFD700]" />
              <h3 className="font-heading text-lg text-cream">Best Sessions</h3>
            </div>
            <div className="divide-y divide-[#21262D]">
              {topSessions.map((s, i) => (
                <div key={s.id} className="px-5 py-3 flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    i === 0 ? 'bg-[#FFD700]/10 text-[#FFD700]' : 'bg-[#21262D] text-[#6E7681]'
                  }`}>
                    <span className="text-sm font-bold">#{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-cream">{s.title || s.river_name || 'Session'}</div>
                    <div className="text-xs text-[#6E7681]">
                      {s.river_name && <span>{s.river_name} — </span>}
                      {new Date(s.date + 'T00:00:00').toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold font-mono text-[#FFD700]">{s.total_fish}</div>
                    <div className="text-[10px] text-[#6E7681]">fish</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most species in one session */}
        {mostSpeciesSession && (
          <div className="bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#21262D] flex items-center gap-2">
              <Fish className="w-5 h-5 text-[#00B4D8]" />
              <h3 className="font-heading text-lg text-cream">Most Species in One Session</h3>
            </div>
            <div className="p-5">
              <div className="text-4xl font-bold font-mono text-[#00B4D8] mb-2">{mostSpeciesSession.count} species</div>
              <div className="text-sm text-cream">{mostSpeciesSession.session.title || mostSpeciesSession.session.river_name || 'Session'}</div>
              <div className="text-xs text-[#6E7681] mt-1">
                {mostSpeciesSession.session.river_name && <span>{mostSpeciesSession.session.river_name} — </span>}
                {new Date(mostSpeciesSession.session.date + 'T00:00:00').toLocaleDateString()}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {Array.from(speciesBySession.get(mostSpeciesSession.session.id) || []).map((sp) => (
                  <span key={sp} className="px-2 py-0.5 text-xs rounded-full bg-[#00B4D8]/10 text-[#00B4D8] border border-[#00B4D8]/20">
                    {sp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
