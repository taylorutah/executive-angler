"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import EntityListView from "@/components/ui/EntityListView";
import { useAuth } from "@/lib/auth-context";
import { flyListConfig } from "@/lib/list-configs";
import type { CardData } from "@/types/list-config";

interface FlyLibraryClientProps {
  items: CardData[];
}

interface TieMatch {
  canonical_fly_id?: string;
  match_percentage: number;
}

export default function FlyLibraryClient({ items }: FlyLibraryClientProps) {
  const { user, isLoading } = useAuth();
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

  return (
    <EntityListView
      items={items}
      config={flyListConfig}
      storageKey="flies"
      liveValues={liveValues}
      showOptionalFilters={!isLoading && Boolean(user)}
      toolbarExtra={
        !user ? (
          <p className="text-[13px] text-[var(--text-2)]">
            <Link
              href="/login?redirect=/flies/library"
              className="text-[var(--accent)] underline-offset-4 hover:underline"
            >
              Sign in
            </Link>{" "}
            to filter by what you can tie from your materials.
          </p>
        ) : null
      }
    />
  );
}
