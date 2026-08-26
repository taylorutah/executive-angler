'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy, Fish, Target, MapPin, Calendar, Star, Ruler, Camera, X, ChevronLeft, ChevronRight } from "@/icons";
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
            {entry.catchRecord.fly_name && <span>{entry.catchRecord.fly_name}{entry.catchRecord.fly_size ? ` #${String(entry.catchRecord.fly_size).replace(/^#/, "")}` : ''}</span>}
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
  // Runner-up — useful filler for the hero's right side when the #1 has no photo
  const runnerUp = catches[1];
  const runnerUpSession = runnerUp ? sessionMap.get(runnerUp.session_id) : null;

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
      <div className="bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-lg p-12 text-center">
        <Trophy className="w-12 h-12 mx-auto mb-4 text-slate-600" />
        <h3 className="font-heading text-xl text-cream mb-2">No trophies yet</h3>
        <p className="text-slate-400">Log sessions and catches with measurements to build your trophy wall!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bezel stat line — quiet totals under the page header */}
      <div className="font-mono text-[12px] text-[var(--text-meta)] flex flex-wrap items-baseline gap-x-3 -mt-2">
        <span><span className="text-[var(--action)] font-semibold">{totalMeasured}</span> measured fish</span>
        <span className="text-[#3a4150]">·</span>
        <span><span className="text-[#7BD9C2] font-semibold">{totalSpecies}</span> species</span>
        <span className="text-[#3a4150]">·</span>
        <span><span className="text-[var(--signal-live)] font-semibold">{totalRivers}</span> rivers</span>
      </div>

      {/* Hero trophy — the one thing this page is about. Tighter padding, no big title row. */}
      {biggestOverall && (
        <div className="relative bg-gradient-to-br from-[#FFD700]/10 via-[var(--action)]/[0.04] to-[var(--surface-page)] border border-[#FFD700]/30 rounded-xl p-5 md:p-6 overflow-hidden">
          <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#FFD700]">
            <Trophy className="w-3 h-3" /> Personal best
          </span>
          <div className="flex flex-col md:flex-row gap-5 items-stretch">
            {biggestOverall.fish_image_url && (
              <div className="w-full md:w-52 h-40 relative rounded-lg overflow-hidden border border-[var(--border-rule)] shrink-0">
                <Image
                  src={biggestOverall.fish_image_url}
                  alt="Personal best catch"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 208px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-3">
                <div className="font-mono text-[44px] leading-none font-bold text-[var(--text-primary)] tabular-nums">
                  {biggestOverall.length_inches}&quot;
                </div>
                {biggestOverall.species && (
                  <div className="font-heading text-[18px] text-[var(--action)] tracking-[-0.005em]">
                    {biggestOverall.species}
                  </div>
                )}
              </div>
              <div className="mt-3 font-mono text-[12px] text-[var(--text-body)] flex flex-wrap items-baseline gap-x-2 gap-y-1">
                {biggestSession?.river_name && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[var(--text-meta)]" />
                    {biggestSession.river_name}
                  </span>
                )}
                {biggestSession?.date && (
                  <>
                    {biggestSession?.river_name && <span className="text-[#3a4150]">·</span>}
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[var(--text-meta)]" />
                      {new Date(biggestSession.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </>
                )}
                {biggestOverall.fly_name && (
                  <>
                    <span className="text-[#3a4150]">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3 h-3 text-[var(--text-meta)]" />
                      <span className="text-[#C4B5FD]">{biggestOverall.fly_name}</span>
                      {biggestOverall.fly_size && <span className="text-[var(--text-meta)]"> #{String(biggestOverall.fly_size).replace(/^#/, "")}</span>}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Runner-up — fills the otherwise-empty right side when there's no PB photo */}
            {!biggestOverall.fish_image_url && runnerUp && (
              <div className="relative md:w-60 md:border-l md:border-[#FFD700]/25 md:pl-6 pt-3 md:pt-0 border-t md:border-t-0 border-[#FFD700]/20 bg-[var(--surface-page)]/40 md:bg-transparent rounded-md md:rounded-none p-3 md:p-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-body)] mb-2">
                  Runner-up
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="font-mono text-[28px] leading-none font-bold text-[var(--text-primary)] tabular-nums">
                    {runnerUp.length_inches}&quot;
                  </div>
                  {runnerUp.species && (
                    <div className="font-heading text-[15px] text-[var(--action)] tracking-[-0.005em]">
                      {runnerUp.species}
                    </div>
                  )}
                </div>
                <div className="mt-2 font-mono text-[11px] text-[var(--text-body)] flex flex-wrap items-baseline gap-x-2">
                  {runnerUpSession?.river_name && (
                    <span className="text-[var(--text-body)]">{runnerUpSession.river_name}</span>
                  )}
                  {runnerUpSession?.date && (
                    <>
                      {runnerUpSession?.river_name && <span className="text-[#3a4150]">·</span>}
                      <span className="text-[var(--text-meta)]">
                        {new Date(runnerUpSession.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biggest by species */}
        {biggestBySpecies.size > 0 && (
          <div className="bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-rule)] flex items-center gap-2">
              <Fish className="w-5 h-5 text-[var(--signal-live)]" />
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
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-[var(--border-rule)] shrink-0">
                          <Image src={c.fish_image_url} alt={species} fill className="object-cover" sizes="48px" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[var(--surface-page)] border border-[var(--border-rule)] flex items-center justify-center shrink-0">
                          <Fish className="w-5 h-5 text-[var(--text-meta)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-cream">{species}</div>
                        <div className="text-xs text-[var(--text-meta)]">
                          {session?.river_name && <span>{session.river_name}</span>}
                          {session?.river_name && c.fly_name && <span> &mdash; </span>}
                          {c.fly_name && <span>{c.fly_name}</span>}
                        </div>
                        {session?.date && (
                          <div className="text-xs text-[var(--text-meta)] mt-0.5">
                            {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xl font-bold font-mono text-[var(--action)]">{c.length_inches}&quot;</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Biggest by river */}
        {biggestByRiver.size > 0 && (
          <div className="bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-rule)] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--action)]" />
              <h3 className="font-heading text-lg text-cream">River Records</h3>
            </div>
            <div className="divide-y divide-[#21262D]">
              {Array.from(biggestByRiver.entries())
                .sort((a, b) => (b[1].catch.length_inches || 0) - (a[1].catch.length_inches || 0))
                .map(([river, { catch: c, session }]) => (
                  <div key={river} className="px-5 py-3 flex items-center gap-4">
                    {c.fish_image_url ? (
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-[var(--border-rule)] shrink-0">
                        <Image src={c.fish_image_url} alt={river} fill className="object-cover" sizes="48px" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[var(--surface-page)] border border-[var(--border-rule)] flex items-center justify-center shrink-0">
                        <Ruler className="w-5 h-5 text-[var(--text-meta)]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-cream">{river}</div>
                      <div className="text-xs text-[var(--text-meta)]">
                        {c.species && <span>{c.species}</span>}
                        {c.species && c.fly_name && <span> &mdash; </span>}
                        {c.fly_name && <span>{c.fly_name}</span>}
                      </div>
                      {session?.date && (
                        <div className="text-xs text-[var(--text-meta)] mt-0.5">
                          {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold font-mono text-[var(--signal-live)]">{c.length_inches}&quot;</div>
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
          <div className="bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-rule)] flex items-center gap-2">
              <Target className="w-5 h-5 text-[#FFD700]" />
              <h3 className="font-heading text-lg text-cream">Best Sessions</h3>
            </div>
            <div className="divide-y divide-[#21262D]">
              {topSessions.map((s, i) => (
                <div key={s.id} className="px-5 py-3 flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    i === 0 ? 'bg-[#FFD700]/10 text-[#FFD700]' : 'bg-[var(--border-rule)] text-[var(--text-meta)]'
                  }`}>
                    <span className="text-sm font-bold">#{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-cream">{s.title || s.river_name || 'Session'}</div>
                    <div className="text-xs text-[var(--text-meta)]">
                      {s.river_name && <span>{s.river_name} &mdash; </span>}
                      {new Date(s.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold font-mono text-[#FFD700]">{s.total_fish}</div>
                    <div className="text-[10px] text-[var(--text-meta)]">fish</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most species in one session */}
        {mostSpeciesSession && (
          <div className="bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-rule)] flex items-center gap-2">
              <Fish className="w-5 h-5 text-[var(--signal-live)]" />
              <h3 className="font-heading text-lg text-cream">Most Species in One Session</h3>
            </div>
            <div className="p-5">
              <div className="text-4xl font-bold font-mono text-[var(--signal-live)] mb-2">{mostSpeciesSession.count} species</div>
              <div className="text-sm text-cream">{mostSpeciesSession.session.title || mostSpeciesSession.session.river_name || 'Session'}</div>
              <div className="text-xs text-[var(--text-meta)] mt-1">
                {mostSpeciesSession.session.river_name && <span>{mostSpeciesSession.session.river_name} &mdash; </span>}
                {new Date(mostSpeciesSession.session.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {Array.from(speciesBySession.get(mostSpeciesSession.session.id) || []).map((sp) => (
                  <span key={sp} className="px-2 py-0.5 text-xs rounded-full bg-[var(--signal-live)]/10 text-[var(--signal-live)] border border-[var(--signal-live)]/20">
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
        <div className="bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-rule)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-[var(--action)]" />
              <h3 className="font-heading text-lg text-cream">Trophy Gallery</h3>
            </div>
            <span className="text-xs text-[var(--text-meta)]">{galleryPhotos.length} photo{galleryPhotos.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {galleryPhotos.map((photo, i) => (
                <button
                  key={`${photo.catchRecord.id}-${photo.url}`}
                  onClick={() => setLightboxIdx(i)}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-[var(--border-rule)] hover:border-[var(--action)]/50 transition-colors"
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
