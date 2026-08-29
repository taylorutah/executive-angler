"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X, Loader2, Fish, Thermometer, Droplets, Cloud,
  Calendar, MapPin, Feather, Lock, Globe, ExternalLink,
} from "@/icons";
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
  broadcast_presence: boolean | null;
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
        className="ea-modal-overlay z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="ea-modal max-w-3xl max-h-[90vh] overflow-y-auto p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 bg-[var(--surface)] border-b border-[var(--border)] px-5 py-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {owner?.avatar_url ? (
                <Image
                  src={owner.avatar_url}
                  alt={owner.display_name || "User"}
                  width={36}
                  height={36}
                  className="rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                  <span className="font-display text-sm font-semibold text-[var(--accent)]">
                    {(owner?.display_name || owner?.username || "?")[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-1)] truncate">
                  {session?.river_name || session?.location || "Session"}
                </p>
                <p className="text-xs text-[var(--text-2)] truncate flex items-center gap-2">
                  {owner ? (
                    <span>{owner.display_name || "—"}{owner.username ? ` · @${owner.username}` : ""}</span>
                  ) : (
                    <span>{sessionId.slice(0, 8)}</span>
                  )}
                  {session?.date && (
                    <span className="inline-flex items-center gap-1 text-[var(--text-3)]">
                      <Calendar className="h-3 w-3" /> {formatDate(session.date)}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors duration-150 ease-standard shrink-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {loading && (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-[var(--accent)] animate-spin" />
            </div>
          )}

          {error && !loading && (
            <div className="p-6">
              <div className="px-3 py-2 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-[var(--radius-md)] text-sm text-[var(--danger)]">
                {error}
              </div>
            </div>
          )}

          {!loading && !error && session && (
            <div className="p-5 space-y-5">
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <StatTile
                  icon={<Fish className="h-4 w-4 text-[var(--accent)]" />}
                  label="Fish"
                  value={session.total_fish != null ? String(session.total_fish) : "—"}
                />
                <StatTile
                  icon={<Thermometer className="h-4 w-4 text-[var(--accent)]" />}
                  label="Water Temp"
                  value={session.water_temp_f != null ? `${session.water_temp_f}°F` : "—"}
                />
                <StatTile
                  icon={<Droplets className="h-4 w-4 text-[var(--accent)]" />}
                  label="Clarity"
                  value={session.water_clarity || "—"}
                />
                <StatTile
                  icon={<Fish className="h-4 w-4 text-[var(--success)]" />}
                  label="Biggest"
                  value={biggestCatch != null ? `${biggestCatch.toFixed(1)}"` : "—"}
                />
              </div>

              {/* Meta line */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-2)]">
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
                  {session.broadcast_presence ? (
                    <><Globe className="h-3 w-3" /> Public</>
                  ) : (
                    <><Lock className="h-3 w-3" /> Private</>
                  )}
                </span>
              </div>

              {/* Tags */}
              {session.tags && session.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {session.tags.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-soft)] text-[var(--accent)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Notes */}
              {session.notes && (
                <Block title="Notes">
                  <p className="text-sm text-[var(--text-1)] whitespace-pre-wrap">{session.notes}</p>
                </Block>
              )}

              {/* Rig notes */}
              {session.flies_notes && (
                <Block title="Rig notes">
                  <p className="text-sm text-[var(--text-1)] whitespace-pre-wrap">{session.flies_notes}</p>
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
                        className="relative h-24 w-24 shrink-0 rounded-[var(--radius-md)] overflow-hidden border border-[var(--border)] hover:border-[var(--accent)]/40 transition-colors duration-150 ease-standard"
                      >
                        <Image
                          src={p.url}
                          alt={p.caption || "Session photo"}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </button>
                    ))}
                  </div>
                </Block>
              )}

              {/* Catches */}
              {catches.length > 0 && (
                <Block title={`Catches (${catches.length})`}>
                  <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)]">
                    <table className="ea-table">
                      <thead>
                        <tr>
                          <th>Species</th>
                          <th>Length</th>
                          <th>Fly</th>
                          <th>Time</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catches.map((c) => (
                          <tr key={c.id}>
                            <td className="text-[var(--text-1)]">{c.species || "—"}</td>
                            <td className="text-[var(--text-2)] num">
                              {c.length_inches != null ? `${c.length_inches}"` : "—"}
                            </td>
                            <td className="text-[var(--text-2)]">
                              {c.fly_pattern?.name || c.fly_name || "—"}
                            </td>
                            <td className="text-[var(--text-3)] num">
                              {c.time ? formatTime(c.time) : "—"}
                            </td>
                            <td className="text-[var(--text-2)] max-w-[200px] truncate">
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
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--radius-md)] text-xs bg-[var(--paper-deep)] border border-[var(--border)] text-[var(--text-1)]"
                      >
                        <Feather className="h-3 w-3 text-[var(--accent)]" />
                        {r.position ? `#${r.position} ` : ""}{r.fly_name || "—"}
                      </span>
                    ))}
                  </div>
                </Block>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-3)]">
                <span className="num">id: {session.id.slice(0, 8)}…</span>
                <Link
                  href={`/journal/${session.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
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
    <div className="bg-[var(--paper-deep)] border border-[var(--border)] rounded-[var(--radius-md)] p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="ea-stat-label">{label}</span>
      </div>
      <p className="text-lg font-semibold text-[var(--text-1)] num">{value}</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="ea-overline mb-2">{title}</h3>
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
