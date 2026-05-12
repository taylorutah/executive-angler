"use client";

import Link from "next/link";
import Image from "next/image";
import { Fish, MapPin, Droplets, Thermometer, Cloud, Heart, MessageCircle, Lock } from "lucide-react";
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

// Accent border colors — rotates by river name for visual variety
const ACCENT_COLORS = [
  "border-[#E8923A]",
  "border-[#0BA5C7]",
  "border-[#E8923A]",
  "border-[#0BA5C7]",
  "border-[#6E7681]",
  "border-[#E8923A]",
  "border-[#0BA5C7]",
  "border-[#6E7681]",
];

function accentColor(name?: string) {
  if (!name) return ACCENT_COLORS[0];
  const idx = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % ACCENT_COLORS.length;
  return ACCENT_COLORS[idx];
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function SessionCard({ session, catches: catchesProp, feedDisplay = "collage", kudosCount = 0, commentCount = 0 }: Props) {
  const parsedDate = parseLocalDate(session.date);
  const formattedDate = parsedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const month = MONTHS[parsedDate.getMonth()];
  const day = parsedDate.getDate();
  const year = parsedDate.getFullYear();

  const catches = catchesProp || session.catches || [];
  const totalFish = session.total_fish ?? catches.reduce((s, c) => s + (c.quantities || 1), 0);
  const fishPhotos = catches.map(c => c.fish_image_url).filter(Boolean).slice(0, 4) as string[];
  const topFlies = Array.from(
    new Map(catches.filter(c => c.fly_pattern?.name).map(c => [c.fly_pattern!.name!, c.fly_pattern!.name!])).values()
  ).slice(0, 3);
  const tags = session.trip_tags || session.tags || [];
  const title = session.river_name || session.title || "Fishing Session";

  const startTime = (() => {
    const raw = session.created_at || session.start_time;
    if (!raw) return null;
    try {
      return new Date(raw).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } catch { return null; }
  })();

  const hasPhotos = feedDisplay === "collage" && fishPhotos.length > 0;
  const hasConditions = session.water_temp_f || session.water_clarity || session.weather;
  const accent = accentColor(session.river_name);

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

  return (
    <Link href={`/journal/${session.id}`} className="block group">
      <article className={`bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden hover:shadow-md hover:border-[#E8923A]/30 transition-all duration-200 border-l-4 ${accent}`}>

        {/* Always-present layout: date column on left + content on right + optional map thumb */}
        <div className="flex gap-0">

          {/* Date stamp — always visible */}
          <div className="flex flex-col items-center justify-start pt-4 px-3 min-w-[52px]">
            <span className="text-[10px] font-bold text-[#A8B2BD] uppercase tracking-wider font-['IBM_Plex_Mono']">{month}</span>
            <span className="text-2xl font-bold text-[#F0F6FC] leading-none font-['IBM_Plex_Mono']">{day}</span>
            <span className="text-[10px] text-[#A8B2BD] mt-0.5 font-['IBM_Plex_Mono']">{year}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 p-4 pl-3 border-l border-[#21262D]">

            {/* Title + fish badge */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-[#F0F6FC] text-sm leading-snug group-hover:text-[#E8923A] transition-colors line-clamp-1">
                {title}
              </h3>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {session.is_demo && (
                  <span
                    title="Sample session — delete anytime from the edit screen"
                    className="text-[9px] font-bold tracking-wider bg-[#0BA5C7]/15 text-[#0BA5C7] border border-[#0BA5C7]/30 rounded-full px-1.5 py-0.5 uppercase"
                  >
                    Sample
                  </span>
                )}
                {/* Lock icon when this session is NOT broadcast to the feed.
                    Default state (broadcast_presence undefined or false) is
                    "private" per the 2026-05-04 privacy overhaul. */}
                {session.broadcast_presence !== true && !session.is_demo && (
                  <Lock className="h-3 w-3 text-[#6E7681]" />
                )}
                {totalFish > 0 && (
                  <span className="flex items-center gap-1 bg-[#E8923A]/15 text-[#E8923A] rounded-full px-2 py-0.5 text-xs font-semibold font-['IBM_Plex_Mono']">
                    <Fish className="h-3 w-3" />{totalFish}
                  </span>
                )}
              </div>
            </div>

            {/* Location + time */}
            <div className="flex items-center gap-2 text-[11px] text-[#A8B2BD] mb-2 flex-wrap">
              {session.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{session.location}</span>
                </span>
              )}
              {startTime && (
                <span className="font-['IBM_Plex_Mono'] text-[#A8B2BD]">{startTime}</span>
              )}
            </div>

            {/* Date row */}
            <p className="text-[11px] text-[#A8B2BD] mb-2">{formattedDate}</p>

            {/* Notes excerpt */}
            {session.notes && (
              <p className="text-[12px] text-[#A8B2BD] leading-relaxed line-clamp-2 mb-2">{session.notes}</p>
            )}

            {/* Conditions */}
            {hasConditions && (
              <div className="flex flex-wrap gap-2 text-[11px] text-[#A8B2BD] mb-2">
                {session.water_temp_f && <span className="flex items-center gap-0.5 font-['IBM_Plex_Mono']"><Thermometer className="h-3 w-3" />{session.water_temp_f}</span>}
                {session.water_clarity && <span className="flex items-center gap-0.5"><Droplets className="h-3 w-3" />{session.water_clarity}</span>}
                {session.weather && <span className="flex items-center gap-0.5"><Cloud className="h-3 w-3" />{session.weather}</span>}
              </div>
            )}

            {/* Flies */}
            {topFlies.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {topFlies.map(name => (
                  <span key={name} className="text-[10px] bg-[#E8923A]/10 text-[#E8923A] border border-[#E8923A]/20 rounded-full px-2 py-0.5">🪰 {name}</span>
                ))}
              </div>
            )}

            {/* Tags fallback */}
            {topFlies.length === 0 && tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] bg-[#1F2937] text-[#A8B2BD] rounded-full px-2 py-0.5">{tag}</span>
                ))}
              </div>
            )}

            {/* Gear strip — compact one-liner showing rod + reel */}
            {(() => {
              const snap = session.gear_snapshot;
              if (!snap) return null;
              const parts: string[] = [];
              if (snap.rod?.name) parts.push(snap.rod.name);
              if (snap.reel?.name) parts.push(snap.reel.name);
              if (snap.line?.name) parts.push(snap.line.name);
              if (!parts.length) return null;
              return (
                <div className="flex items-center gap-1.5 mb-2 text-[10px] text-[#6E7681]">
                  <span className="text-[#A8B2BD]/50">⚙</span>
                  <span className="truncate">{parts.join(" · ")}</span>
                </div>
              );
            })()}

            {/* Catch summary — Strava-style mini splits table grouped by species.
                Constrained width so the table feels deliberate on wide cards
                instead of stretching the row across half a screen. */}
            {!hasPhotos && speciesRows.length > 0 && (
              <div className="mb-2 mt-2.5 border-t border-[#21262D]/60 pt-2.5">
                <div className="max-w-[340px] space-y-1.5">
                  {speciesRows.map(row => (
                    <div
                      key={row.species}
                      className="grid grid-cols-[1fr_auto_auto] items-baseline gap-x-5 text-[12px] tabular-nums"
                    >
                      <span className="truncate font-medium text-[#F0F6FC]">{row.species}</span>
                      <span className="font-['IBM_Plex_Mono'] font-bold text-[#F0F6FC] text-right min-w-[2ch]">
                        {row.count}
                      </span>
                      <span className="font-['IBM_Plex_Mono'] font-semibold text-[#F0F6FC] text-right whitespace-nowrap min-w-[5ch]">
                        {row.maxLength == null ? (
                          <span className="font-normal text-[#6E7681]">—</span>
                        ) : (
                          <>
                            {row.count > 1 && (
                              <span className="mr-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.08em] text-[#6E7681]">
                                max
                              </span>
                            )}
                            {row.maxLength}″
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                  {overflowCount > 0 && (
                    <div className="pt-0.5 text-[10px] text-[#6E7681]">+{overflowCount} more species</div>
                  )}
                </div>
              </div>
            )}

            {/* Photo collage — BELOW title/description */}
            {hasPhotos && (
              <div className={`grid gap-0.5 h-36 overflow-hidden rounded-lg mt-1 ${
                fishPhotos.length === 1 ? "grid-cols-1" :
                fishPhotos.length === 2 ? "grid-cols-2" :
                fishPhotos.length === 3 ? "grid-cols-3" :
                "grid-cols-2 grid-rows-2"
              }`}>
                {fishPhotos.map((url, i) => (
                  <div key={i} className="relative overflow-hidden">
                    <Image src={url} alt="Fish" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="200px" />
                  </div>
                ))}
              </div>
            )}

            {/* Social engagement — kudos + comments */}
            {(kudosCount > 0 || commentCount > 0) && (
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-[#21262D]">
                {kudosCount > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-[#A8B2BD]">
                    <Heart className="h-3 w-3 text-[#DA3633]" fill="#DA3633" />{kudosCount}
                  </span>
                )}
                {commentCount > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-[#A8B2BD]">
                    <MessageCircle className="h-3 w-3" />{commentCount}
                  </span>
                )}
              </div>
            )}

          </div>
        </div>
      </article>
    </Link>
  );
}
