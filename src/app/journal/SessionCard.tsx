"use client";

import Link from "next/link";
import Image from "next/image";
import { Fish, MapPin, Droplets, Thermometer, Cloud } from "lucide-react";
import { parseLocalDate } from "@/lib/date";

interface Catch {
  id?: string;
  species?: string;
  length_inches?: string;
  quantities?: number;
  fish_image_url?: string;
  fly_pattern?: { name?: string } | null;
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
}

interface Props {
  session: FishingSession;
  catches?: Catch[];
  feedDisplay?: "collage" | "map";
}

// Accent border colors — rotates by river name for visual variety
const ACCENT_COLORS = [
  "border-[#E8923A]",
  "border-[#00B4D8]",
  "border-[#E8923A]",
  "border-[#00B4D8]",
  "border-[#484F58]",
  "border-[#E8923A]",
  "border-[#00B4D8]",
  "border-[#484F58]",
];

function accentColor(name?: string) {
  if (!name) return ACCENT_COLORS[0];
  const idx = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % ACCENT_COLORS.length;
  return ACCENT_COLORS[idx];
}

// Month abbreviations for the date stamp
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function SessionCard({ session, catches: catchesProp, feedDisplay = "collage" }: Props) {
  const date = parseLocalDate(session.date);
  const formattedDate = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  const catches = catchesProp || session.catches || [];
  const totalFish = session.total_fish ?? catches.reduce((s, c) => s + (c.quantities || 1), 0);
  const fishPhotos = catches.map(c => c.fish_image_url).filter(Boolean).slice(0, 4) as string[];
  const topFlies = Array.from(
    new Map(catches.filter(c => c.fly_pattern?.name).map(c => [c.fly_pattern!.name!, c.fly_pattern!.name!])).values()
  ).slice(0, 3);
  const tags = session.trip_tags || session.tags || [];
  const title = session.river_name || session.title || "Fishing Session";

  // Format start time if available
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
  const parsedDate = parseLocalDate(session.date);
  const month = MONTHS[parsedDate.getMonth()];
  const day = parsedDate.getDate();
  const year = parsedDate.getFullYear();

  return (
    <Link href={`/journal/${session.id}`} className="block group">
      <article className="bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden hover:shadow-md hover:border-[#E8923A]/30 transition-all duration-200">

        {/* Photo collage (when available) */}
        {hasPhotos && (
          <div className={`grid gap-0.5 h-40 overflow-hidden ${
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

        {/* Card body */}
        <div className={`flex gap-0 ${!hasPhotos ? "border-l-4 " + accent : ""} rounded-b-xl`}>

          {/* Date stamp column (no-photo only) */}
          {!hasPhotos && (
            <div className="flex flex-col items-center justify-start pt-4 px-3 min-w-[52px]">
              <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider font-['IBM_Plex_Mono']">{month}</span>
              <span className="text-2xl font-bold text-[#F0F6FC] leading-none font-['IBM_Plex_Mono']">{day}</span>
              <span className="text-[10px] text-[#8B949E] mt-0.5 font-['IBM_Plex_Mono']">{year}</span>
            </div>
          )}

          <div className={`flex-1 min-w-0 p-4 ${!hasPhotos ? "pl-3 border-l border-[#21262D]" : ""}`}>
            {/* Title + fish badge */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-[#F0F6FC] text-sm leading-snug group-hover:text-[#E8923A] transition-colors line-clamp-1">
                {title}
              </h3>
              {totalFish > 0 && (
                <span className="flex-shrink-0 flex items-center gap-1 bg-[#E8923A]/15 text-[#E8923A] rounded-full px-2 py-0.5 text-xs font-semibold font-['IBM_Plex_Mono']">
                  <Fish className="h-3 w-3" />{totalFish}
                </span>
              )}
            </div>

            {/* Location + time */}
            <div className="flex items-center gap-2 text-[11px] text-[#8B949E] mb-2 flex-wrap">
              {session.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{session.location}</span>
                </span>
              )}
              {startTime && (
                <span className="font-['IBM_Plex_Mono'] text-[#484F58]">{startTime}</span>
              )}
            </div>

            {/* Date row (photo cards) */}
            {hasPhotos && (
              <p className="text-[11px] text-[#8B949E] mb-2">{formattedDate}</p>
            )}

            {/* Notes excerpt */}
            {session.notes && (
              <p className="text-[12px] text-[#8B949E] leading-relaxed line-clamp-2 mb-2">{session.notes}</p>
            )}

            {/* Conditions */}
            {hasConditions && (
              <div className="flex flex-wrap gap-2 text-[11px] text-[#8B949E] mb-2">
                {session.water_temp_f && <span className="flex items-center gap-0.5 font-['IBM_Plex_Mono']"><Thermometer className="h-3 w-3" />{session.water_temp_f}</span>}
                {session.water_clarity && <span className="flex items-center gap-0.5"><Droplets className="h-3 w-3" />{session.water_clarity}</span>}
                {session.weather && <span className="flex items-center gap-0.5"><Cloud className="h-3 w-3" />{session.weather}</span>}
              </div>
            )}

            {/* Flies */}
            {topFlies.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {topFlies.map(name => (
                  <span key={name} className="text-[10px] bg-[#E8923A]/10 text-[#E8923A] border border-[#E8923A]/20 rounded-full px-2 py-0.5">🪰 {name}</span>
                ))}
              </div>
            )}

            {/* Tags fallback */}
            {topFlies.length === 0 && tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] bg-[#1F2937] text-[#8B949E] rounded-full px-2 py-0.5">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
