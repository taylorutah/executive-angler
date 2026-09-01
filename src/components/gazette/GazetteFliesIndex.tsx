"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DeskFlyIndex from "@/components/desk/DeskFlyIndex";
import { haystackMatchesQuery, itemMatchesFilters } from "@/lib/browse/match";
import { flyListConfig } from "@/lib/list-configs";
import type { CardData } from "@/types/list-config";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  ...(flyListConfig.filters.find((f) => f.key === "category")?.options ?? []),
];

interface Props {
  items: CardData[];
  liveValues?: Record<string, Record<string, string>>;
}

/** /flies/library chrome at the scale of /rivers: underline search, text filters. */
export default function GazetteFliesIndex({ items, liveValues }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const category = searchParams.get("f") || "all";

  const setCategory = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("f");
    else params.set("f", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    const active: Record<string, string> = category === "all" ? {} : { category };
    return items.filter((item) => {
      if (words.length > 0) {
        const hay = `${item.title} ${item.subtitle ?? ""} ${item.meta ?? ""}`.toLowerCase();
        if (!haystackMatchesQuery(hay, words)) return false;
      }
      const values = {
        ...(item._filterValues ?? {}),
        ...(liveValues?.[item.href] ?? {}),
      };
      return itemMatchesFilters(values, active, flyListConfig.filters);
    });
  }, [items, query, category, liveValues]);

  return (
    <div>
      <label className="mt-2 block max-w-xl">
        <span className="sr-only">Search flies</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search flies"
          className="ea-search-underline"
        />
      </label>
      <div className="mt-5 flex flex-nowrap gap-x-3 overflow-x-auto font-ui text-[12px] uppercase tracking-[0.12em] text-[var(--text-3)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((f, i) => (
          <span key={f.value} className="inline-flex items-center gap-x-3">
            {i > 0 ? <span aria-hidden>·</span> : null}
            <button
              type="button"
              onClick={() => setCategory(f.value)}
              className={
                f.value === category
                  ? "text-[var(--ink)] underline decoration-[var(--ink)] underline-offset-4"
                  : "hover:text-[var(--ink)]"
              }
            >
              {f.label}
            </button>
          </span>
        ))}
      </div>
      <p className="mt-4 font-ui text-[12px] uppercase tracking-[0.12em] text-[var(--text-3)]">
        <span className="num">{filtered.length}</span>
        {filtered.length === 1 ? " result" : " results"}
      </p>
      <div className="mt-8">
        <DeskFlyIndex items={filtered} />
      </div>
    </div>
  );
}
