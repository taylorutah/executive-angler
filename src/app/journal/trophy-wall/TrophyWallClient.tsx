'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy, Fish, Target, MapPin, Calendar, Star, Ruler, Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface CatchRecord {
  id: string;
  session_id: string;
  species?: string;
  length_inches?: number;
  fly_name?: string;
  fly_size?: string;
  fish_image_url?: string;
  fish_image_urls?: string[];
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

interface PhotoEntry {
  url: string;
  catchRecord: CatchRecord;
  session?: SessionRecord;
}

interface TrophyWallClientProps {
  catches: CatchRecord[];
  sessions: SessionRecord[];
  photoCatches: CatchRecord[];
}

/* ---------- Lightbox ---------- */
function PhotoLightbox({ photos, initialIndex, onClose }: {
  photos: PhotoEntry[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const entry = photos[idx];
  const goNext = useCallback(() => setIdx(p => (p + 1) % photos.length), [photos.length]);
  const goPrev = useCallback(() => setIdx(p => (p - 1 + photos.length) % photos.length), [photos.length]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', h);
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose, goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10">
        <X className="h-5 w-5" />
      </button>
      {photos.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); goPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={e => { e.stopPropagation(); goNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10">
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
      <div className="max-w-2xl w-full mx-16" onClick={e => e.stopPropagation()}>
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
          <Image src={entry.url} alt={entry.catchRecord.species || 'Catch photo'} fill className="object-cover" sizes="(max-width: 768px) 100vw, 672px" />
        </div>
        <div className="mt-4 text-center">
          <p className="text-white text-xl font-semibold">
            {entry.catchRecord.species || 'Unknown'}
            {entry.catchRecord.length_inches ? ` \u00b7 ${entry.catchRecord.length_inches}"` : ''}
          </p>
          <div className="flex items-center justify-center gap-3 mt-1 text-sm text-white/60 flex-wrap">
            {entry.session?.river_name && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{entry.session.river_name}</span>}
            {entry.catchRecord.fly_name && <span>{entry.catchRecord.fly_name}{entry.catchRecord.fly_size ? ` #${entry.catchRecord.fly_size}` : ''}</span>}
            {entry.session?.date && (
              <span>{new Date(entry.session.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            )}
          </div>
          <p className="text-white/30 text-xs mt-2">{idx + 1} / {photos.length}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main component ---------- */
export default function TrophyWallClient({ catches, sessions, photoCatches }: TrophyWallClientProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

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

  // Build gallery photos from photoCatches
  const galleryPhotos: PhotoEntry[] = [];
  const seenUrls = new Set<string>();
  photoCatches.forEach((c) => {
    const session = sessionMap.get(c.session_id);
    const urls = c.fish_image_urls && c.fish_image_urls.length > 0
      ? c.fish_image_urls
      : c.fish_image_url
        ? [c.fish_image_url]
        : [];
    urls.forEach((url) => {
      if (url && !seenUrls.has(url)) {
        seenUrls.add(url);
        galleryPhotos.push({ url, catchRecord: c, session });
      }
    });
  });

  // Summary stats
  const totalSpecies = new Set(catches.map(c => c.species).filter(Boolean)).size;
  const totalRivers = new Set(sessions.map(s => s.river_name).filter(Boolean)).size;
  const totalMeasured = catches.length;

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
      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-4 text-center">
          <div className="text-3xl font-bold font-mono text-[#E8923A]">{totalMeasured}</div>
          <div className="text-xs text-[#6E7681] mt-1">Measured Fish</div>
        </div>
        <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-4 text-center">
          <div className="text-3xl font-bold font-mono text-[#00B4D8]">{totalSpecies}</div>
          <div className="text-xs text-[#6E7681] mt-1">Species</div>
        </div>
        <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-4 text-center">
          <div className="text-3xl font-bold font-mono text-[#FFD700]">{totalRivers}</div>
          <div className="text-xs text-[#6E7681] mt-1">Rivers</div>
        </div>
      </div>

      {/* Hero trophy -- biggest fish overall */}
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
              <h3 className="font-heading text-lg text-cream">Personal Records by Species</h3>
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
                          {session?.river_name && <span>{session.river_name}</span>}
                          {session?.river_name && c.fly_name && <span> &mdash; </span>}
                          {c.fly_name && <span>{c.fly_name}</span>}
                        </div>
                        {session?.date && (
                          <div className="text-xs text-[#6E7681] mt-0.5">
                            {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        )}
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
              <h3 className="font-heading text-lg text-cream">River Records</h3>
            </div>
            <div className="divide-y divide-[#21262D]">
              {Array.from(biggestByRiver.entries())
                .sort((a, b) => (b[1].catch.length_inches || 0) - (a[1].catch.length_inches || 0))
                .map(([river, { catch: c, session }]) => (
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
                        {c.species && <span>{c.species}</span>}
                        {c.species && c.fly_name && <span> &mdash; </span>}
                        {c.fly_name && <span>{c.fly_name}</span>}
                      </div>
                      {session?.date && (
                        <div className="text-xs text-[#6E7681] mt-0.5">
                          {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
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
                      {s.river_name && <span>{s.river_name} &mdash; </span>}
                      {new Date(s.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                {mostSpeciesSession.session.river_name && <span>{mostSpeciesSession.session.river_name} &mdash; </span>}
                {new Date(mostSpeciesSession.session.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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

      {/* Photo Gallery */}
      {galleryPhotos.length > 0 && (
        <div className="bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#21262D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#E8923A]" />
              <h3 className="font-heading text-lg text-cream">Trophy Gallery</h3>
            </div>
            <span className="text-xs text-[#6E7681]">{galleryPhotos.length} photo{galleryPhotos.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {galleryPhotos.map((photo, i) => (
                <button
                  key={`${photo.catchRecord.id}-${photo.url}`}
                  onClick={() => setLightboxIdx(i)}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-[#21262D] hover:border-[#E8923A]/50 transition-colors"
                >
                  <Image
                    src={photo.url}
                    alt={photo.catchRecord.species || 'Catch photo'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-xs font-medium text-white truncate">
                      {photo.catchRecord.species || 'Unknown'}
                      {photo.catchRecord.length_inches ? ` \u00b7 ${photo.catchRecord.length_inches}"` : ''}
                    </div>
                    {photo.session?.river_name && (
                      <div className="text-[10px] text-white/60 truncate">{photo.session.river_name}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && galleryPhotos.length > 0 && (
        <PhotoLightbox
          photos={galleryPhotos}
          initialIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </div>
  );
}
