"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EntityCard from "@/components/ui/EntityCard";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

export interface PlaceRiverCard {
  id: string;
  slug: string;
  name: string;
  heroImageUrl?: string;
  primarySpecies: string[];
  flowType: string;
  difficulty: string;
  wadingType: string;
}

interface PlaceRiverGridProps {
  rivers: PlaceRiverCard[];
}

function sessionMatchesRiver(
  session: { river_id: string | null; river_name: string | null },
  river: PlaceRiverCard,
): boolean {
  if (
    session.river_id &&
    (session.river_id === river.id || session.river_id === river.slug)
  ) {
    return true;
  }
  if (
    session.river_name &&
    session.river_name.trim().toLowerCase() === river.name.trim().toLowerCase()
  ) {
    return true;
  }
  return false;
}

export default function PlaceRiverGrid({ rivers }: PlaceRiverGridProps) {
  const { user, isLoading } = useAuth();
  const [fishedIds, setFishedIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user || rivers.length === 0) {
      setFishedIds(new Set());
      setReady(false);
      return;
    }

    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("fishing_sessions")
      .select("river_id, river_name")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setReady(false);
          return;
        }
        const next = new Set<string>();
        for (const river of rivers) {
          if (data.some((row) => sessionMatchesRiver(row, river))) {
            next.add(river.id);
          }
        }
        setFishedIds(next);
        setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoading, user, rivers]);

  const fishedCount = fishedIds.size;
  const total = rivers.length;

  // Public HTML must never contain another angler's fished set, so this
  // client-only fetch only ever resolves after hydration for the signed-in
  // owner. Everyone else — including the pre-hydration paint — gets the
  // designed sign-in line below, never a blank gap and never a spinner.
  const showFishedLine = ready && user;

  return (
    <div>
      {showFishedLine ? (
        <p className="mb-6 text-sm text-[var(--text-body)]">
          You&apos;ve fished{" "}
          <span className="num text-[var(--text-primary)]">{fishedCount}</span> of
          these <span className="num text-[var(--text-primary)]">{total}</span>{" "}
          rivers.
        </p>
      ) : (
        <p className="mb-6 text-sm text-[var(--text-body)]">
          <Link
            href="/login"
            className="font-semibold text-[var(--text-primary)] underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--action)] hover:decoration-[var(--action)]"
          >
            Sign in
          </Link>{" "}
          to mark which of these you&apos;ve fished. Free — every feature on
          Executive Angler costs nothing.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rivers.map((river) => {
          const fished = ready && fishedIds.has(river.id);
          return (
            <div
              key={river.id}
              className={`relative ${fished ? "ring-2 ring-[var(--action)]" : ""}`}
            >
              <EntityCard
                href={`/rivers/${river.slug}`}
                imageUrl={river.heroImageUrl}
                imageAlt={river.name}
                title={river.name}
                subtitle={(river.primarySpecies || []).join(", ")}
                meta={`${river.flowType} · ${river.difficulty}`}
                badges={[river.wadingType]}
              />
              {fished ? (
                <span className="absolute top-3 right-3 z-10 bg-[var(--action)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--on-action)]">
                  Fished
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
