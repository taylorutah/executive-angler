"use client";

import Link from "next/link";
import Image from "next/image";
import { Fish, MapPin, Droplets, Thermometer, Cloud, Heart, MessageCircle, Lock, Feather, Package } from "@/icons";
import { parseLocalDate } from "@/lib/date";

interface Catch {
  id?: string;
  species?: string;
  length_inches?: string;
  quantities?: number;
  fish_image_url?: string;
  fly_pattern?: { name?: string } | null;
}

interface GearPiece {
  name?: string;
  maker?: string;
}

interface GearSnapshot {
  rod?: GearPiece;
  reel?: GearPiece;
  line?: GearPiece;
  leader?: GearPiece;
  tippet?: GearPiece;
}

interface FishingSession {
  id: string;
  title?: string;
  river_name?: string;
  location?: string;
  date: string;
  created_at?: string;
  start_time?: string;
  total_fish?: number;
  water_temp_f?: string;
  water_clarity?: string;
  weather?: string;
  notes?: string;
  trip_tags?: string[];
  tags?: string[];
  catches?: Catch[];
  latitude?: number;
  longitude?: number;
  route_points?: number[][];
  // privacy column dropped 2026-05-04. Field replaced by broadcast_presence
  // (boolean — true means the session appears on the presence feed).
  broadcast_presence?: boolean;
  is_demo?: boolean;
  gear_snapshot?: GearSnapshot;
}

interface Props {
  session: FishingSession;
  catches?: Catch[];
  feedDisplay?: "collage" | "map";
  kudosCount?: number;
  commentCount?: number;
}

export function SessionCard({ session, catches: catchesProp, feedDisplay = "collage", kudosCount = 0, commentCount = 0 }: Props) {
  const parsedDate = parseLocalDate(session.date);
  const formattedDate = parsedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  const catches = catchesProp || session.catches || [];
  const totalFish = session.total_fish ?? catches.reduce((s, c) => s + (c.quantities || 1), 0);
  const photoCatches = catches.filter((c) => Boolean(c.fish_image_url));
  const topFlies = (() => {
    const map = new Map<string, number>();
    for (const c of catches) {
      const name = (c as { fly_name?: string | null }).fly_name?.trim()
        || c.fly_pattern?.name?.trim();
      if (!name) continue;
      map.set(name, (map.get(name) || 0) + (c.quantities ?? 1));
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
  })();
  const tags = session.trip_tags || session.tags || [];
  const title = session.river_name || session.title || "Fishing Session";

  const startTime = (() => {
    const raw = session.created_at || session.start_time;
    if (!raw) return null;
    try {
      return new Date(raw).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } catch { return null; }
  })();

  const hasPhotos = feedDisplay === "collage" && photoCatches.length > 0;
  const hasConditions = session.water_temp_f || session.water_clarity || session.weather;

  const speciesAgg = (() => {
    const map = new Map<string, { species: string; count: number; maxLength: number | null }>();
    for (const c of catches) {
      if (!c.species) continue;
      const key = c.species;
      const qty = c.quantities ?? 1;
      const lenNum = c.length_inches != null ? parseFloat(String(c.length_inches)) : NaN;
      const existing = map.get(key);
      if (existing) {
        existing.count += qty;
        if (!isNaN(lenNum)) {
          existing.maxLength = existing.maxLength == null ? lenNum : Math.max(existing.maxLength, lenNum);
        }
      } else {
        map.set(key, { species: key, count: qty, maxLength: isNaN(lenNum) ? null : lenNum });
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return (b.maxLength ?? 0) - (a.maxLength ?? 0);
    });
  })();
  const speciesRows = speciesAgg.slice(0, 4);
  const overflowCount = speciesAgg.length - speciesRows.length;

  const gearLine = (() => {
    const snap = session.gear_snapshot;
    if (!snap) return null;
    const parts: string[] = [];
    if (snap.rod?.name) parts.push(snap.rod.name);
    if (snap.reel?.name) parts.push(snap.reel.name);
    if (snap.line?.name) parts.push(snap.line.name);
    return parts.length ? parts.join(" · ") : null;
  })();

  const visiblePhotos = photoCatches.slice(0, 3);
  const hiddenPhotoCount = photoCatches.length - visiblePhotos.length;

  return (
    <Link href={`/journal/${session.id}`} className="block group rounded-card">
      <article className="ea-card card-hover h-full">

        {/* Date overline + state badges */}
        <div className="flex items-baseline justify-between gap-3">
          <p className="ea-overline">{formattedDate}</p>
          <div className="flex items-center gap-2 shrink-0">
            {session.is_demo && (
              <span
                title="Sample session — delete anytime from the edit screen"
                className="ea-badge"
              >
                Sample
              </span>
            )}
            {/* Lock icon when this session is NOT broadcast to the feed.
                Default state (broadcast_presence undefined or false) is
                "private" per the 2026-05-04 privacy overhaul. */}
            {session.broadcast_presence !== true && !session.is_demo && (
              <Lock size={14} className="text-[var(--text-3)]" aria-label="Private session" />
            )}
          </div>
        </div>

        {/* Water / location name */}
        <h3 className="mt-1 font-display text-xl font-semibold text-[var(--text-1)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
          {title}
        </h3>

        {/* Location · start time · fish count */}
        {(session.location || startTime || totalFish > 0) && (
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--text-2)]">
            {session.location && (
              <span className="flex items-center gap-1 min-w-0">
                <MapPin size={14} className="shrink-0 text-[var(--text-3)]" />
                <span className="truncate">{session.location}</span>
              </span>
            )}
            {session.location && (startTime || totalFish > 0) && <span aria-hidden className="text-[var(--text-3)]">·</span>}
            {startTime && <span className="num">{startTime}</span>}
            {startTime && totalFish > 0 && <span aria-hidden className="text-[var(--text-3)]">·</span>}
            {totalFish > 0 && (
              <span className="flex items-center gap-1 font-medium text-[var(--text-1)]">
                <Fish size={14} className="text-[var(--text-2)]" />
                <span className="num">{totalFish} fish</span>
              </span>
            )}
          </div>
        )}

        {/* Conditions + flies — one chip row, one chip language */}
        {(hasConditions || topFlies.length > 0 || (topFlies.length === 0 && tags.length > 0)) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {session.water_temp_f && (
              <span className="ea-chip"><Thermometer size={14} /><span className="num">{session.water_temp_f}</span></span>
            )}
            {session.water_clarity && (
              <span className="ea-chip"><Droplets size={14} />{session.water_clarity}</span>
            )}
            {session.weather && (
              <span className="ea-chip"><Cloud size={14} />{session.weather}</span>
            )}
            {topFlies.map(({ name, count }) => (
              <span key={name} className="ea-chip">
                <Feather size={14} />{name}{count > 1 ? <span className="num">&nbsp;×&nbsp;{count}</span> : null}
              </span>
            ))}
            {topFlies.length === 0 && tags.slice(0, 3).map((tag) => (
              <span key={tag} className="ea-chip">{tag}</span>
            ))}
          </div>
        )}

        {/* Notes excerpt */}
        {session.notes && (
          <p className="mt-3 text-sm text-[var(--text-2)] line-clamp-2">{session.notes}</p>
        )}

        {/* Gear — rod, reel, line as one truncated line */}
        {gearLine && (
          <p className="mt-2 flex items-center gap-1 text-xs text-[var(--text-3)]">
            <Package size={14} className="shrink-0" />
            <span className="truncate">{gearLine}</span>
          </p>
        )}

        {/* Catch summary — one line when there are no photos to show */}
        {!hasPhotos && speciesRows.length > 0 && (
          <p className="mt-2 flex items-center gap-1 text-xs text-[var(--text-2)]">
            <Fish size={14} className="shrink-0 text-[var(--text-3)]" />
            <span className="truncate num">
              {speciesRows.map((row) =>
                `${row.species} ×${row.count}${row.maxLength != null ? (row.count > 1 ? `, max ${row.maxLength}″` : `, ${row.maxLength}″`) : ""}`
              ).join(" · ")}
              {overflowCount > 0 ? ` · +${overflowCount} more` : ""}
            </span>
          </p>
        )}

        {/* Photo thumbs — 4:3, graded, up to three with a count chip */}
        {hasPhotos && (
          <div className={`mt-3 grid gap-1 ${
            visiblePhotos.length === 1 ? "grid-cols-1" :
            visiblePhotos.length === 2 ? "grid-cols-2" :
            "grid-cols-3"
          }`}>
            {visiblePhotos.map((c, i) => (
              <div key={c.id ?? i} className="relative overflow-hidden rounded-surface">
                <Image
                  src={c.fish_image_url as string}
                  alt={`${c.species ? `${c.species} ` : "Fish "}caught on ${title}`}
                  width={400}
                  height={300}
                  className="ea-photo ea-photo-card w-full h-auto"
                  sizes="(max-width: 640px) 92vw, 560px"
                />
                {i === visiblePhotos.length - 1 && hiddenPhotoCount > 0 && (
                  <span className="absolute bottom-2 right-2 rounded-instrument bg-[var(--ink)] px-2 py-1 text-xs font-medium text-[var(--paper)] num">
                    +{hiddenPhotoCount}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Kudos + comments */}
        {(kudosCount > 0 || commentCount > 0) && (
          <div className="mt-3 flex items-center gap-4 border-t border-[var(--border)] pt-3">
            {kudosCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-[var(--text-2)]">
                <Heart size={14} filled className="text-[var(--danger)]" />
                <span className="num">{kudosCount}</span>
              </span>
            )}
            {commentCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-[var(--text-2)]">
                <MessageCircle size={14} />
                <span className="num">{commentCount}</span>
              </span>
            )}
          </div>
        )}

      </article>
    </Link>
  );
}
