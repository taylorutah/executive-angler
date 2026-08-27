"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { LearnRiver } from "./types";

function haversineMiles(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 3958.8;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

type Status = "idle" | "asking" | "located" | "denied";

export default function NearRivers({ rivers }: { rivers: LearnRiver[] }) {
  const [origin, setOrigin] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [status, setStatus] = useState<Status>("idle");

  const ranked = useMemo(() => {
    if (!origin) return rivers.map((r) => ({ river: r, miles: null as number | null }));
    return [...rivers]
      .map((r) => ({
        river: r,
        miles:
          r.latitude && r.longitude ? haversineMiles(origin, r) : Number.POSITIVE_INFINITY,
      }))
      .sort((a, b) => (a.miles ?? Infinity) - (b.miles ?? Infinity));
  }, [rivers, origin]);

  function locate() {
    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }
    setStatus("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setStatus("located");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  }

  if (rivers.length === 0) {
    return (
      <p className="text-[15px] text-[var(--text-body)]">
        No beginner-marked rivers came back from the catalog. That is a data gap — not a
        reason to invent names.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[15px] leading-relaxed text-[var(--text-body)]">
          {status === "located"
            ? "Closest first, from the rivers the catalog marks beginner."
            : "Every river below is marked beginner in the catalog. Use your location to put the nearest ones first."}
        </p>
        <Button
          type="button"
          variant={status === "located" ? "ghost" : "solid"}
          size="sm"
          onClick={locate}
          loading={status === "asking"}
          disabled={status === "asking"}
        >
          {status === "located" ? "Located" : "Use my location"}
        </Button>
      </div>
      {status === "denied" && (
        <p className="mt-2 text-[13px] text-[var(--text-body)]">
          Location stayed on the device. The list is still the beginner catalog, unordered
          by distance.
        </p>
      )}

      <ol className="mt-8 divide-y divide-[var(--border-rule)] border-y border-[var(--border-rule)]">
        {ranked.map(({ river, miles }, i) => (
          <li key={river.id}>
            <Link
              href={`/rivers/${river.slug}`}
              className="ea-focus-ring group flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <span className="num w-8 shrink-0 text-right text-[12px] text-[var(--text-body)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-heading text-[18px] font-semibold text-[var(--text-primary)] underline decoration-transparent underline-offset-4 group-hover:text-[var(--action)] group-hover:decoration-[var(--action)]">
                  {river.name}
                </span>
                <span className="mt-1 block text-[13px] text-[var(--text-body)]">
                  {[
                    river.place,
                    river.flowType,
                    river.wadingType === "both" ? "wade or float" : river.wadingType,
                    miles != null && Number.isFinite(miles)
                      ? `${Math.round(miles)} mi`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                {river.excerpt && (
                  <span className="mt-2 block text-[15px] leading-relaxed text-[var(--text-body)]">
                    {river.excerpt}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
