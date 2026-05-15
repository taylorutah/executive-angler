"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X, Loader2, Fish, Thermometer, Droplets, Cloud,
  Calendar, MapPin, Feather, Lock, Globe, ExternalLink,
} from "lucide-react";
import PhotoLightbox from "@/components/ui/PhotoLightbox";

interface Session {
  id: string;
  user_id: string;
  date: string | null;
  river_id: string | null;
  river_name: string | null;
  location: string | null;
  section: string | null;
  weather: string | null;
  water_temp_f: number | null;
  water_clarity: string | null;
  total_fish: number | null;
  notes: string | null;
  flies_notes: string | null;
  tags: string[] | null;
  is_private: boolean | null;
  created_at: string | null;
}

interface Catch {
  id: string;
  species: string | null;
  length_inches: number | null;
  fly_name: string | null;
  fly_pattern?: { name: string; type?: string; image_url?: string } | null;
  time: string | null;
  notes: string | null;
}

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  created_at: string | null;
}

interface Rig {
  id: string;
  position: number | null;
  fly_pattern_id: string | null;
  fly_name: string | null;
}

interface Owner {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface SessionDetailData {
  session: Session;
  catches: Catch[];
  photos: Photo[];
  rigs: Rig[];
  owner: Owner | null;
}

interface Props {
  sessionId: string;
  onClose: () => void;
}

export default function AdminSessionDetailModal({ sessionId, onClose }: Props) {
  const [data, setData] = useState<SessionDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    fetch(`/api/admin/sessions/${sessionId}`)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setError(j.error || "Failed to load session");
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Network error");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [sessionId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && lightboxIndex === null) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, lightboxIndex]);

  const session = data?.session;
  const catches = data?.catches ?? [];
  const photos = data?.photos ?? [];
  const rigs = data?.rigs ?? [];
  const owner = data?.owner;

  const biggestCatch = catches
    .map((c) => c.length_inches)
    .filter((n): n is number => n != null && n > 0)
    .reduce<number | null>((max, n) => (max == null || n > max ? n : max), null);

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="bg-[#161B22] border border-[#21262D] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 bg-[#161B22] border-b border-[#21262D] px-5 py-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {owner?.avatar_url ? (
                <Image
                  src={owner.avatar_url}
                  alt={owner.display_name || "User"}
                  width={36}
                  height={36}
                  className="rounded-full object-cover shrink-0"
                  unoptimized
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#E8923A]/15 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-[#E8923A]">
                    {(owner?.display_name || owner?.username || "?")[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#F0F6FC] truncate">
                  {session?.river_name || session?.location || "Session"}
                </p>
                <p className="text-xs text-[#A8B2BD] truncate flex items-center gap-2">
                  {owner ? (
                    <span>{owner.display_name || "—"}{owner.username ? ` · @${owner.username}` : ""}</span>
                  ) : (
                    <span>{sessionId.slice(0, 8)}</span>
                  )}
                  {session?.date && (
                    <span className="inline-flex items-center gap-1 text-[#6E7681]">
                      <Calendar className="h-3 w-3" /> {formatDate(session.date)}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#6E7681] hover:text-[#F0F6FC] shrink-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {loading && (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-[#E8923A] animate-spin" />
            </div>
          )}

          {error && !loading && (
            <div className="p-6">
              <div className="px-3 py-2 bg-red-950/30 border border-red-800 rounded-lg text-sm text-red-400">
                {error}
              </div>
            </div>
          )}

          {!loading && !error && session && (
            <div className="p-5 space-y-5">
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <StatTile
                  icon={<Fish className="h-4 w-4 text-[#0BA5C7]" />}
                  label="Fish"
                  value={session.total_fish != null ? String(session.total_fish) : "—"}
                />
                <StatTile
                  icon={<Thermometer className="h-4 w-4 text-[#E8923A]" />}
                  label="Water Temp"
                  value={session.water_temp_f != null ? `${session.water_temp_f}°F` : "—"}
                />
                <StatTile
                  icon={<Droplets className="h-4 w-4 text-[#0BA5C7]" />}
                  label="Clarity"
                  value={session.water_clarity || "—"}
                />
                <StatTile
                  icon={<Fish className="h-4 w-4 text-green-400" />}
                  label="Biggest"
                  value={biggestCatch != null ? `${biggestCatch.toFixed(1)}"` : "—"}
                />
              </div>

              {/* Meta line */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#A8B2BD]">
                {session.weather && (
                  <span className="inline-flex items-center gap-1">
                    <Cloud className="h-3 w-3" /> {session.weather}
                  </span>
                )}
                {session.section && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {session.section}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  {session.is_private ? (
                    <><Lock className="h-3 w-3" /> Private</>
                  ) : (
                    <><Globe className="h-3 w-3" /> Public</>
                  )}
                </span>
              </div>

              {/* Tags */}
              {session.tags && session.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {session.tags.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8923A]/15 text-[#E8923A]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Notes */}
              {session.notes && (
                <Block title="Notes">
                  <p className="text-sm text-[#F0F6FC] whitespace-pre-wrap">{session.notes}</p>
                </Block>
              )}

              {/* Rig notes */}
              {session.flies_notes && (
                <Block title="Rig notes">
                  <p className="text-sm text-[#F0F6FC] whitespace-pre-wrap">{session.flies_notes}</p>
                </Block>
              )}

              {/* Photos */}
              {photos.length > 0 && (
                <Block title={`Photos (${photos.length})`}>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {photos.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => setLightboxIndex(i)}
                        className="relative h-24 w-24 shrink-0 rounded-lg overflow-hidden border border-[#21262D] hover:border-[#E8923A] transition-colors"
                      >
                        <Image
                          src={p.url}
                          alt={p.caption || "Session photo"}
                          fill
                          className="object-cover"
                          sizes="96px"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                </Block>
              )}

              {/* Catches */}
              {catches.length > 0 && (
                <Block title={`Catches (${catches.length})`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-[#6E7681] uppercase text-[10px] tracking-wider border-b border-[#21262D]">
                          <th className="py-2 pr-3">Species</th>
                          <th className="py-2 pr-3">Length</th>
                          <th className="py-2 pr-3">Fly</th>
                          <th className="py-2 pr-3">Time</th>
                          <th className="py-2 pr-3">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catches.map((c) => (
                          <tr key={c.id} className="border-b border-[#21262D]/50 last:border-0">
                            <td className="py-2 pr-3 text-[#F0F6FC]">{c.species || "—"}</td>
                            <td className="py-2 pr-3 text-[#A8B2BD] font-mono">
                              {c.length_inches != null ? `${c.length_inches}"` : "—"}
                            </td>
                            <td className="py-2 pr-3 text-[#A8B2BD]">
                              {c.fly_pattern?.name || c.fly_name || "—"}
                            </td>
                            <td className="py-2 pr-3 text-[#6E7681] font-mono">
                              {c.time ? formatTime(c.time) : "—"}
                            </td>
                            <td className="py-2 pr-3 text-[#A8B2BD] max-w-[200px] truncate">
                              {c.notes || ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Block>
              )}

              {/* Rigs */}
              {rigs.length > 0 && (
                <Block title="Flies on rig">
                  <div className="flex flex-wrap gap-1.5">
                    {rigs.map((r) => (
                      <span
                        key={r.id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] bg-[#0D1117] border border-[#21262D] text-[#F0F6FC]"
                      >
                        <Feather className="h-3 w-3 text-[#0BA5C7]" />
                        {r.position ? `#${r.position} ` : ""}{r.fly_name || "—"}
                      </span>
                    ))}
                  </div>
                </Block>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-[#21262D] flex items-center justify-between text-xs text-[#6E7681]">
                <span className="font-mono">id: {session.id.slice(0, 8)}…</span>
                <Link
                  href={`/journal/${session.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[#E8923A] hover:underline"
                >
                  Open in /journal <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {lightboxIndex !== null && photos.length > 0 && (
        <PhotoLightbox
          photos={photos.map((p) => ({
            photoUrl: p.url,
            caption: p.caption ?? undefined,
            submitterName: owner?.display_name || owner?.username || "—",
            submittedAt: p.created_at ?? new Date().toISOString(),
          }))}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[#0D1117] border border-[#21262D] rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-[#6E7681] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-[#F0F6FC] font-mono">{value}</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] font-bold text-[#A8B2BD] uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(d: string) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
