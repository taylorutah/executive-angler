"use client";

import Link from "next/link";
import { FishingSession, SessionRig } from "@/types/fishing-log";
import { FishIcon } from "lucide-react";
import Image from "next/image";

interface SessionCardProps {
  session: FishingSession;
  rigs?: SessionRig[];
  photoUrl?: string;
}

export function SessionCard({ session, rigs, photoUrl }: SessionCardProps) {
  // Format date
  const date = new Date(session.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Get top 2 flies from rigs
  const topFlies = rigs?.slice(0, 2).map((rig) => {
    const name = rig.fly_pattern?.name || rig.fly_name || "Unknown";
    const size = rig.fly_pattern?.size ? ` #${rig.fly_pattern.size}` : "";
    return `${name}${size}`;
  });

  // Build metadata line
  const metadata: string[] = [];
  if (session.river_name) {
    // Extract location from tags if available
    const locationTag = session.tags?.find((tag) =>
      tag.toLowerCase().includes("walk-in") ||
      tag.toLowerCase().includes("below") ||
      tag.toLowerCase().includes("above")
    );
    if (locationTag) {
      metadata.push(locationTag);
    }
  }
  metadata.push(formattedDate);
  if (session.water_temp_f !== undefined && session.water_temp_f !== null) {
    metadata.push(`${session.water_temp_f}°F`);
  }

  return (
    <Link
      href={`/journal/${session.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Line 1: River name */}
          <h3 className="font-heading text-lg font-semibold text-forest-dark truncate">
            {session.river_name || "Unknown River"}
          </h3>

          {/* Line 2: Metadata */}
          <p className="mt-1 text-sm text-slate-600">
            {metadata.join(" · ")}
          </p>

          {/* Line 3: Flies */}
          {topFlies && topFlies.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {topFlies.map((fly, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-forest/10 px-2 py-1 text-xs font-medium text-forest"
                >
                  {fly}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right side: fish count + photo */}
        <div className="flex flex-col items-end gap-2">
          {session.total_fish > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-river px-3 py-1 text-sm font-semibold text-white">
              <FishIcon className="h-4 w-4" />
              <span>{session.total_fish}</span>
            </div>
          )}
          {photoUrl && (
            <div className="relative h-14 w-14 overflow-hidden rounded-md">
              <Image
                src={photoUrl}
                alt="Session photo"
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
