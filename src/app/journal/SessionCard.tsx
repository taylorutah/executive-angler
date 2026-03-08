"use client";

import Link from "next/link";
import Image from "next/image";
import { FishIcon, MapPin, Thermometer, Droplets } from "lucide-react";
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

export function SessionCard({ session, catches: catchesProp, feedDisplay = "collage" }: Props) {
  const date = parseLocalDate(session.date);
  const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });

  const catches = catchesProp || session.catches || [];
  const totalFish = session.total_fish ?? catches.reduce((s, c) => s + (c.quantities || 1), 0);
  const fishPhotos = catches.map(c => c.fish_image_url).filter(Boolean).slice(0, 4) as string[];
  const topFlies = Array.from(
    new Map(
      catches.filter(c => c.fly_pattern?.name).map(c => [c.fly_pattern!.name!, c.fly_pattern!.name!])
    ).values()
  ).slice(0, 2);
  const tags = session.trip_tags || session.tags || [];

  return (
    <Link href={`/journal/${session.id}`} className="block group">
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md hover:border-slate-200 transition-all duration-200">

        {/* Photo collage or placeholder */}
        {feedDisplay === "collage" && fishPhotos.length > 0 ? (
          <div className={`grid gap-0.5 ${fishPhotos.length === 1 ? "grid-cols-1" : fishPhotos.length === 2 ? "grid-cols-2" : fishPhotos.length === 3 ? "grid-cols-3" : "grid-cols-2 grid-rows-2"} h-36 overflow-hidden`}>
            {fishPhotos.map((url, i) => (
              <div key={i} className="relative overflow-hidden">
                <Image src={url} alt="Fish" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="200px" />
              </div>
            ))}
          </div>
        ) : feedDisplay === "collage" && totalFish > 0 ? (
          <div className="h-20 bg-gradient-to-br from-forest/5 to-forest/10 flex items-center justify-center gap-2">
            <FishIcon className="h-6 w-6 text-forest/30" />
            <span className="text-sm text-forest/40 font-medium">{totalFish} fish</span>
          </div>
        ) : null}

        <div className="p-3">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm leading-tight truncate group-hover:text-forest transition-colors">
                {session.title || session.river_name || "Fishing Session"}
              </h3>
              <div className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-400">
                <span>{dayOfWeek}, {formattedDate}</span>
                {session.location && (
                  <>
                    <span>·</span>
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{session.location}</span>
                  </>
                )}
              </div>
            </div>
            {/* Fish count badge */}
            {totalFish > 0 && (
              <div className="flex-shrink-0 flex items-center gap-1 bg-forest/10 text-forest rounded-full px-2 py-0.5">
                <FishIcon className="h-3 w-3" />
                <span className="text-xs font-semibold">{totalFish}</span>
              </div>
            )}
          </div>

          {/* Conditions row */}
          {(session.water_temp_f || session.water_clarity || session.weather) && (
            <div className="flex flex-wrap gap-2 mb-2 text-[11px] text-slate-500">
              {session.water_temp_f && (
                <span className="flex items-center gap-0.5">
                  <Thermometer className="h-3 w-3" />{session.water_temp_f}
                </span>
              )}
              {session.water_clarity && (
                <span className="flex items-center gap-0.5">
                  <Droplets className="h-3 w-3" />{session.water_clarity}
                </span>
              )}
              {session.weather && <span>☁ {session.weather}</span>}
            </div>
          )}

          {/* Flies highlight */}
          {topFlies.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {topFlies.map(name => (
                <span key={name} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-2 py-0.5">
                  🪰 {name}
                </span>
              ))}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
