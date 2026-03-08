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

// River-themed accent colors — rotates by river name for consistency
const RIVER_COLORS = [
  "from-teal-600 to-emerald-700",
  "from-forest to-green-800",
  "from-slate-600 to-slate-800",
  "from-blue-700 to-teal-700",
  "from-emerald-600 to-green-700",
];

function riverColor(name?: string) {
  if (!name) return RIVER_COLORS[0];
  const idx = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % RIVER_COLORS.length;
  return RIVER_COLORS[idx];
}

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
  const title = session.title || session.river_name || "Fishing Session";
  const hasPhotos = feedDisplay === "collage" && fishPhotos.length > 0;
  const hasConditions = session.water_temp_f || session.water_clarity || session.weather;

  return (
    <Link href={`/journal/${session.id}`} className="block group">
      <article className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md hover:border-slate-200 transition-all duration-200">

        {/* Top visual — photo collage or gradient river banner */}
        {hasPhotos ? (
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
        ) : (
          <div className={`relative h-16 bg-gradient-to-r ${riverColor(session.river_name)} overflow-hidden`}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div className="absolute inset-0 flex items-center px-4">
              <span className="text-white font-heading font-bold text-lg leading-tight opacity-90 line-clamp-1">
                {session.river_name || "Fishing Session"}
              </span>
              {totalFish > 0 && (
                <span className="ml-auto flex items-center gap-1 bg-white/20 text-white text-xs font-semibold rounded-full px-2.5 py-1">
                  <Fish className="h-3 w-3" /> {totalFish}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Card body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-forest transition-colors line-clamp-1">
                {title}
              </h3>
              <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[11px] text-slate-400">
                <span>{formattedDate}</span>
                {session.location && (
                  <span className="flex items-center gap-0.5 truncate">
                    <MapPin className="h-3 w-3 flex-shrink-0" />{session.location}
                  </span>
                )}
              </div>
            </div>
            {hasPhotos && totalFish > 0 && (
              <span className="flex-shrink-0 flex items-center gap-1 bg-forest/10 text-forest rounded-full px-2 py-0.5 text-xs font-semibold">
                <Fish className="h-3 w-3" />{totalFish}
              </span>
            )}
          </div>

          {/* Notes excerpt */}
          {session.notes && (
            <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 mb-2">{session.notes}</p>
          )}

          {/* Conditions row */}
          {hasConditions && (
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 mb-2">
              {session.water_temp_f && <span className="flex items-center gap-0.5"><Thermometer className="h-3 w-3" />{session.water_temp_f}</span>}
              {session.water_clarity && <span className="flex items-center gap-0.5"><Droplets className="h-3 w-3" />{session.water_clarity}</span>}
              {session.weather && <span className="flex items-center gap-0.5"><Cloud className="h-3 w-3" />{session.weather}</span>}
            </div>
          )}

          {/* Flies */}
          {topFlies.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {topFlies.map(name => (
                <span key={name} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-2 py-0.5">🪰 {name}</span>
              ))}
            </div>
          )}

          {/* Tags (only if no flies) */}
          {topFlies.length === 0 && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
