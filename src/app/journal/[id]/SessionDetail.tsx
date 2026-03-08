"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Pencil, Fish, X, ChevronLeft, ChevronRight,
  Cloud, MapPin, Clock, Check, RotateCcw
} from "lucide-react";
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

function FishLightbox({ catches, initialIndex, onClose }: {
  catches: Catch[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const c = catches[idx];
  const goNext = useCallback(() => setIdx(p => (p + 1) % catches.length), [catches.length]);
  const goPrev = useCallback(() => setIdx(p => (p - 1 + catches.length) % catches.length), [catches.length]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", h);
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose, goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"><X className="h-5 w-5" /></button>
      {catches.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); goPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={e => { e.stopPropagation(); goNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronRight className="h-5 w-5" /></button>
        </>
      )}
      <div className="max-w-2xl w-full mx-16" onClick={e => e.stopPropagation()}>
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
          <p className="text-white text-xl font-semibold">{c.species || "Unknown"}{c.length_inches ? ` · ${c.length_inches}"` : ""}</p>
          <div className="flex items-center justify-center gap-3 mt-1 text-sm text-white/60 flex-wrap">
            {c.fly_pattern?.name && <span>🪰 {c.fly_pattern.name}</span>}
            {c.fly_position && <span>· {c.fly_position}</span>}
            {c.fly_size && <span>· Size {c.fly_size}</span>}
            {c.bead_size && <span>· {c.bead_size} bead</span>}
            {c.time_caught && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.time_caught}</span>}
          </div>
        </div>
        {catches.length > 1 && <p className="text-center text-white/30 text-xs mt-3">{idx + 1} / {catches.length}</p>}
      </div>
    </div>
  );
}

export default function SessionDetail({ session, catches, flies }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Inline notes editing
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(session.notes || "");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  async function saveNotes() {
    if (notesValue === session.notes) { setEditingNotes(false); return; }
    setNotesSaving(true);
    await fetch(`/api/fishing/session?id=${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notesValue }),
    });
    setNotesSaving(false);
    setEditingNotes(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  }

  const totalFish = catches.reduce((s, c) => s + (c.quantities || 1), 0);
  const tags = session.trip_tags || session.tags || [];
  const fishPhotos = catches.filter(c => c.fish_image_url);

  const formattedDate = parseLocalDate(session.date).toLocaleDateString("en-US", {
    hour: "numeric", minute: "2-digit", weekday: undefined,
    month: "long", day: "numeric", year: "numeric",
  });

  // Unique flies used
  const usedFlies = Array.from(
    new Map(
      catches.filter(c => c.fly_pattern?.name)
        .map(c => [c.fly_pattern!.name!, { name: c.fly_pattern!.name!, image: c.fly_image_url }])
    ).values()
  );

  const biggestFish = catches.reduce((best, c) => {
    const len = parseFloat(c.length_inches || "0");
    return len > (best || 0) ? len : best;
  }, 0);

  return (
    <>
      {lightboxIdx !== null && (
        <FishLightbox catches={catches.filter(c => c.fish_image_url || true)} initialIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}

      <div className="min-h-screen bg-[#f8f7f4]">

        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 pt-24">

          {/* Breadcrumb + top actions */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/journal" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-forest transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Journal
            </Link>
            <div className="flex items-center gap-2">
              {notesSaved && <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Saved</span>}
              <Link href={`/journal/${session.id}/edit`}
                className="flex items-center gap-1.5 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest-dark transition-colors shadow-sm">
                <Pencil className="h-4 w-4" /> Edit Session
              </Link>
            </div>
          </div>

          {/* ---- STRAVA-STYLE HEADER CARD ---- */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 sm:p-6 mb-5">
            <div className="flex flex-col sm:flex-row sm:gap-8">

              {/* LEFT: title + meta + notes */}
              <div className="flex-1 min-w-0 mb-5 sm:mb-0">
                <p className="text-xs text-slate-400 mb-1">
                  {formattedDate}
                  {session.location && <> · <MapPin className="h-3 w-3 inline -mt-0.5" /> {session.river_name ? `${session.river_name}, ` : ""}{session.location}</>}
                  {!session.location && session.river_name && <> · {session.river_name}</>}
                </p>

                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-3">
                  {session.title || session.river_name || "Fishing Session"}
                </h1>

                {/* Inline-editable notes */}
                <div className="mb-3 max-w-lg group/notes relative">
                  {editingNotes ? (
                    <div>
                      <textarea
                        autoFocus
                        rows={4}
                        value={notesValue}
                        onChange={e => setNotesValue(e.target.value)}
                        onKeyDown={e => { if (e.key === "Escape") { setNotesValue(session.notes || ""); setEditingNotes(false); } }}
                        className="w-full text-sm text-slate-700 leading-relaxed rounded-lg border border-forest/40 bg-white px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-forest"
                      />
                      <div className="flex items-center gap-2 mt-1.5">
                        <button onClick={saveNotes} disabled={notesSaving}
                          className="flex items-center gap-1 text-xs font-semibold text-white bg-forest rounded-lg px-3 py-1.5 hover:bg-forest-dark disabled:opacity-60">
                          <Check className="h-3 w-3" /> {notesSaving ? "Saving…" : "Save"}
                        </button>
                        <button onClick={() => { setNotesValue(session.notes || ""); setEditingNotes(false); }}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
                          <RotateCcw className="h-3 w-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : notesValue ? (
                    <div
                      onClick={() => setEditingNotes(true)}
                      className="cursor-text rounded-lg border border-transparent hover:border-forest/30 hover:bg-forest/5 px-2 py-1.5 -mx-2 transition-colors group/notesblock"
                      title="Click to edit notes"
                    >
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {notesValue}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 opacity-0 group-hover/notesblock:opacity-100 transition-opacity flex items-center gap-1">
                        <Pencil className="h-3 w-3" /> Click to edit
                      </p>
                    </div>
                  ) : (
                    <button onClick={() => setEditingNotes(true)}
                      className="w-full text-left rounded-lg border border-dashed border-slate-300 hover:border-forest/50 hover:bg-forest/5 px-3 py-2.5 transition-colors">
                      <span className="text-sm text-slate-400 hover:text-forest flex items-center gap-1.5">
                        <Pencil className="h-3.5 w-3.5" /> Add session notes…
                      </span>
                    </button>
                  )}
                </div>

                {session.flies_notes && (
                  <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 max-w-md">
                    <span className="font-medium text-slate-600">Rig: </span>{session.flies_notes}
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tags.map(t => (
                      <span key={t} className="text-[11px] bg-forest/8 text-forest border border-forest/15 rounded-full px-2.5 py-0.5">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: Strava-style big stats */}
              <div className="sm:w-72 flex-shrink-0">
                {/* 4 big stats */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900 leading-none">{totalFish}</p>
                    <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide">Fish Caught</p>
                  </div>
                  {session.water_temp_f && (
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900 leading-none">{session.water_temp_f}</p>
                      <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide">Water Temp</p>
                    </div>
                  )}
                  {biggestFish > 0 && (
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900 leading-none">{biggestFish}&quot;</p>
                      <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide">Biggest Fish</p>
                    </div>
                  )}
                  {session.water_clarity && (
                    <div>
                      <p className="text-xl font-bold text-slate-900 leading-none">{session.water_clarity}</p>
                      <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide">Clarity</p>
                    </div>
                  )}
                </div>

                {/* Weather row — like Strava's weather section */}
                {session.weather && (
                  <div className="border-t border-slate-100 pt-3 flex items-center gap-2 text-sm text-slate-600">
                    <Cloud className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span>{session.weather}</span>
                  </div>
                )}

                {/* Flies used — compact */}
                {usedFlies.length > 0 && (
                  <div className="border-t border-slate-100 pt-3 mt-3">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Flies Used</p>
                    <div className="flex flex-wrap gap-1.5">
                      {usedFlies.map(f => (
                        <span key={f.name} className="flex items-center gap-1 text-xs bg-amber-50 text-amber-800 border border-amber-100 rounded-full px-2.5 py-1">
                          🪰 {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ---- FISH PHOTO STRIP (if photos exist) ---- */}
          {fishPhotos.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 p-4 mb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Photos</p>
                <p className="text-xs text-slate-400">{fishPhotos.length} {fishPhotos.length === 1 ? "photo" : "photos"} · tap to expand</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {catches.map((c, i) => c.fish_image_url && (
                  <button key={c.id} onClick={() => setLightboxIdx(i)}
                    className="relative flex-shrink-0 h-28 w-28 rounded-lg overflow-hidden group hover:ring-2 hover:ring-forest transition-all">
                    <Image src={c.fish_image_url} alt={c.species || "Fish"} fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1">
                      <p className="text-white text-[10px] font-medium truncate">{c.species || "Fish"}</p>
                      {c.length_inches && <p className="text-white/70 text-[9px]">{c.length_inches}&quot;</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ---- CATCHES TABLE (like Strava Segments) ---- */}
          {catches.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden mb-5">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Fish Caught</h2>
                <span className="text-xs text-slate-400">{totalFish} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {fishPhotos.length > 0 && <th className="w-10 py-2 px-3"></th>}
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Species</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Length</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Fly</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Position</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Size</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catches.map((c, i) => (
                      <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                        {fishPhotos.length > 0 && (
                          <td className="py-2 px-3">
                            {c.fish_image_url ? (
                              <button onClick={() => setLightboxIdx(i)} className="block">
                                <div className="relative h-8 w-8 rounded overflow-hidden">
                                  <Image src={c.fish_image_url} alt="" fill className="object-cover" />
                                </div>
                              </button>
                            ) : <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center"><Fish className="h-4 w-4 text-slate-300" /></div>}
                          </td>
                        )}
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {c.species || "—"}
                          {(c.quantities || 1) > 1 && <span className="ml-1 text-xs text-slate-400">×{c.quantities}</span>}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{c.length_inches ? `${c.length_inches}"` : "—"}</td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-[120px] truncate">{c.fly_pattern?.name || "—"}</td>
                        <td className="py-2.5 px-3">
                          {c.fly_position ? (
                            <span className="text-xs bg-forest/10 text-forest rounded px-1.5 py-0.5 font-medium">{c.fly_position}</span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-xs">{c.fly_size || "—"}</td>
                        <td className="py-2.5 px-3 text-slate-500 text-xs">{c.time_caught || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---- FLY PATTERNS (standalone, small cards) ---- */}
          {flies.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 p-4 mb-5">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Fly Box</h2>
              <div className="flex flex-wrap gap-3">
                {flies.map(fly => (
                  <div key={fly.id} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                    {fly.image_url ? (
                      <div className="relative h-8 w-8 rounded overflow-hidden flex-shrink-0">
                        <Image src={fly.image_url} alt={fly.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <span className="text-base flex-shrink-0">🪰</span>
                    )}
                    <div>
                      <p className="text-xs font-medium text-slate-800">{fly.name}</p>
                      {fly.type && <p className="text-[10px] text-slate-400">{fly.type}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
