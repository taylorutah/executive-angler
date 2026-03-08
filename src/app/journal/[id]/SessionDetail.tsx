"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Pencil, Fish, Thermometer, Droplets, Wind, X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { parseLocalDate } from "@/lib/date";

interface Catch {
  id: string;
  species?: string;
  length_inches?: string;
  quantities?: number;
  fly_position?: string;
  fly_size?: string;
  bead_size?: string;
  time_caught?: string;
  fish_image_url?: string;
  fish_location_image_url?: string;
  fly_image_url?: string;
  fly_pattern?: { name?: string; type?: string } | null;
}

interface FlyPattern {
  id: string;
  name: string;
  type?: string;
  image_url?: string;
}

interface Session {
  id: string;
  title?: string;
  river_name?: string;
  location?: string;
  date: string;
  weather?: string;
  water_temp_f?: string;
  water_clarity?: string;
  notes?: string;
  flies_notes?: string;
  trip_tags?: string[];
  tags?: string[];
}

interface Props {
  session: Session;
  catches: Catch[];
  flies: FlyPattern[];
}

// ---- Mini Lightbox ----
function FishLightbox({ catches, initialIndex, onClose }: { catches: Catch[]; initialIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(initialIndex);
  const c = catches[idx];
  const allImages = catches
    .flatMap((c) => [c.fish_image_url, c.fish_location_image_url].filter(Boolean))
    .filter(Boolean) as string[];

  const goNext = useCallback(() => setIdx((p) => (p + 1) % catches.length), [catches.length]);
  const goPrev = useCallback(() => setIdx((p) => (p - 1 + catches.length) % catches.length), [catches.length]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handler);
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose, goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
        <X className="h-5 w-5" />
      </button>
      {catches.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20">
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
      <div className="max-w-2xl w-full mx-16" onClick={(e) => e.stopPropagation()}>
        {c.fish_image_url ? (
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
            <Image src={c.fish_image_url} alt={c.species || "Fish"} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] rounded-xl bg-slate-800 flex items-center justify-center">
            <Fish className="h-16 w-16 text-slate-600" />
          </div>
        )}
        <div className="mt-4 text-center">
          <p className="text-white text-lg font-semibold">{c.species || "Unknown"}{c.length_inches ? ` · ${c.length_inches}"` : ""}</p>
          <div className="mt-1 flex items-center justify-center gap-3 text-sm text-white/60">
            {c.fly_pattern?.name && <span>{c.fly_pattern.name}</span>}
            {c.fly_position && <span>· {c.fly_position}</span>}
            {c.fly_size && <span>· Size {c.fly_size}</span>}
            {c.time_caught && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.time_caught}</span>}
          </div>
        </div>
        {catches.length > 1 && (
          <p className="text-center text-white/40 text-xs mt-3">{idx + 1} / {catches.length}</p>
        )}
      </div>
    </div>
  );
}

// ---- Main Component ----
export default function SessionDetail({ session, catches, flies }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const totalFish = catches.reduce((s, c) => s + (c.quantities || 1), 0);
  const tags = session.trip_tags || session.tags || [];
  const formattedDate = parseLocalDate(session.date).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });

  // Collect unique flies used in catches + stand-alone fly patterns
  const usedFliesFromCatches = catches
    .filter(c => c.fly_pattern?.name)
    .map(c => ({ name: c.fly_pattern!.name!, image: c.fly_image_url }));
  const uniqueFlies = Array.from(new Map(usedFliesFromCatches.map(f => [f.name, f])).values());

  return (
    <>
      {lightboxIdx !== null && catches.length > 0 && (
        <FishLightbox catches={catches} initialIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}

      <div className="min-h-screen bg-[#f8f7f4]">
        {/* Top bar */}
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 flex items-center justify-between h-14">
            <Link href="/journal" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-forest transition-colors">
              <ArrowLeft className="h-4 w-4" /> Journal
            </Link>
            <Link href={`/journal/${session.id}/edit`}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-forest hover:text-forest transition-colors">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
          {/* Title + Date */}
          <div className="mb-4">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {session.title || session.river_name || "Fishing Session"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {formattedDate}{session.location ? ` · ${session.location}` : ""}
              {session.river_name && session.river_name !== session.title ? ` · ${session.river_name}` : ""}
            </p>
          </div>

          {/* Stats bar — Strava style */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Fish className="h-3.5 w-3.5" /> Fish Caught
              </div>
              <p className="text-2xl font-bold text-slate-900">{totalFish}</p>
            </div>
            {session.water_temp_f && (
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <Thermometer className="h-3.5 w-3.5" /> Water Temp
                </div>
                <p className="text-2xl font-bold text-slate-900">{session.water_temp_f}</p>
              </div>
            )}
            {session.water_clarity && (
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <Droplets className="h-3.5 w-3.5" /> Clarity
                </div>
                <p className="text-xl font-bold text-slate-900">{session.water_clarity}</p>
              </div>
            )}
            {session.weather && (
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <Wind className="h-3.5 w-3.5" /> Weather
                </div>
                <p className="text-xl font-bold text-slate-900 truncate">{session.weather}</p>
              </div>
            )}
          </div>

          {/* Main 2-col layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* LEFT: Notes + Catches */}
            <div className="lg:col-span-2 space-y-5">

              {/* Notes — prominent, at top */}
              {session.notes && (
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Session Notes</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{session.notes}</p>
                </div>
              )}

              {/* Rig notes */}
              {session.flies_notes && (
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Rig Setup</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{session.flies_notes}</p>
                </div>
              )}

              {/* Fish Grid */}
              {catches.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                    Fish Caught <span className="text-forest font-bold">({totalFish})</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {catches.map((c, i) => (
                      <button
                        key={c.id}
                        onClick={() => setLightboxIdx(i)}
                        className="group relative rounded-lg overflow-hidden bg-slate-100 aspect-square hover:ring-2 hover:ring-forest transition-all"
                      >
                        {c.fish_image_url ? (
                          <Image src={c.fish_image_url} alt={c.species || "Fish"} fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                            <Fish className="h-8 w-8 text-slate-300" />
                            <span className="text-xs text-slate-400">{c.species || "Fish"}</span>
                          </div>
                        )}
                        {/* Overlay label */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                          <p className="text-white text-xs font-semibold leading-tight truncate">{c.species || "Unknown"}</p>
                          {c.length_inches && <p className="text-white/70 text-[10px]">{c.length_inches}"</p>}
                        </div>
                        {/* Qty badge */}
                        {(c.quantities || 1) > 1 && (
                          <div className="absolute top-1.5 right-1.5 bg-forest text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {c.quantities}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Tap any fish to expand</p>
                </div>
              )}
            </div>

            {/* RIGHT: Flies + Tags */}
            <div className="space-y-5">

              {/* Flies used */}
              {(uniqueFlies.length > 0 || flies.length > 0) && (
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Flies Used</p>
                  <div className="space-y-2">
                    {(uniqueFlies.length > 0 ? uniqueFlies : flies.slice(0, 4)).map((fly, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {('image' in fly ? fly.image : (fly as FlyPattern).image_url) ? (
                          <div className="relative h-10 w-10 rounded-md overflow-hidden flex-shrink-0 bg-slate-100">
                            <Image
                              src={('image' in fly ? fly.image : (fly as FlyPattern).image_url) as string}
                              alt={fly.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-amber-50 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">🪰</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-800 truncate">{fly.name}</p>
                          {'type' in fly && fly.type && <p className="text-[10px] text-slate-400">{fly.type}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Per-catch fly detail */}
              {catches.some(c => c.fly_size || c.fly_position || c.bead_size) && (
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Catch Detail</p>
                  <div className="space-y-2">
                    {catches.map((c, i) => (
                      <div key={c.id} className="flex items-start gap-2 text-xs">
                        <span className="text-slate-400 font-mono mt-0.5">#{i + 1}</span>
                        <div className="min-w-0">
                          <span className="font-medium text-slate-700">{c.species || "Fish"}</span>
                          {c.length_inches && <span className="text-slate-400"> {c.length_inches}"</span>}
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {c.fly_position && <span className="bg-forest/10 text-forest rounded px-1.5 py-0.5 text-[10px] font-medium">{c.fly_position}</span>}
                            {c.fly_size && <span className="bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 text-[10px]">Sz {c.fly_size}</span>}
                            {c.bead_size && <span className="bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 text-[10px]">{c.bead_size}</span>}
                            {c.time_caught && <span className="bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 text-[10px]">{c.time_caught}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span key={tag} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
