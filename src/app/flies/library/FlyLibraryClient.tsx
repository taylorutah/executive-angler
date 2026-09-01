"use client";

import { useEffect, useMemo, useState } from "react";
import GazetteFliesIndex from "@/components/gazette/GazetteFliesIndex";
import { useAuth } from "@/lib/auth-context";
import type { CardData } from "@/types/list-config";

interface FlyLibraryClientProps {
  items: CardData[];
}

interface TieMatch {
  canonical_fly_id?: string;
  match_percentage: number;
}

export default function FlyLibraryClient({ items }: FlyLibraryClientProps) {
  const { user } = useAuth();
  const [tieableIds, setTieableIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setTieableIds(new Set());
      return;
    }
    let cancelled = false;
    fetch("/api/materials/what-can-i-tie")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { matches?: TieMatch[] } | null) => {
        if (cancelled || !data?.matches) return;
        const ids = new Set<string>();
        for (const row of data.matches) {
          if (row.match_percentage >= 100 && row.canonical_fly_id) {
            ids.add(row.canonical_fly_id);
          }
        }
        setTieableIds(ids);
      })
      .catch(() => {
        /* inventory is optional */
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const liveValues = useMemo(() => {
    const out: Record<string, Record<string, string>> = {};
    for (const item of items) {
      const id = item.actionSlot?.canonicalFlyId;
      out[item.href] = { canTie: id && tieableIds.has(id) ? "1" : "0" };
    }
    return out;
  }, [items, tieableIds]);

  return <GazetteFliesIndex items={items} liveValues={liveValues} />;
}
