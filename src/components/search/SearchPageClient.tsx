"use client";

/**
 * Lane N — /search, the Water Desk's finding tool.
 *
 * Registers: Daylight throughout, no exceptions. The rest of the site keeps
 * live data (river flow, gauge readouts) in a Dusk inset even on light pages
 * — see ConditionsRail — but a search result is a pointer to a page, not an
 * instrument reading. Switching registers mid-row would tell a stranger this
 * is a workbench when it is a lookup. `SearchResultRow`'s live-flow chip
 * renders in Daylight tokens (teal-700, already AA on vellum/card) instead
 * of borrowing `.register-dusk`.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import {
  GROUP_ORDER,
  rankSearch,
  type SearchDocument,
  type SearchType,
} from "@/lib/search";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";
import SearchEmptyState from "./SearchEmptyState";
import SearchField from "./SearchField";
import SearchResultGroup from "./SearchResultGroup";
import SearchTypeChips from "./SearchTypeChips";
import {
  currentMonthName,
  EXAMPLE_QUERIES,
  isSearchType,
  monthMatches,
  MOST_READ_RIVER_SLUGS,
  PAGE_GROUP_CAP,
  TYPE_LABELS,
} from "./meta";

const NARROW_CAP = 200;

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const initialQuery = searchParams.get("q") ?? "";
  const typeFromUrl = searchParams.get("type");
  const typeParam: SearchType | "all" = isSearchType(typeFromUrl) ? typeFromUrl : "all";
  const [query, setQuery] = useState(initialQuery);
  const [index, setIndex] = useState<SearchDocument[]>([]);
  const [flows, setFlows] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/search-index")
      .then((r) => r.json())
      .then((data: SearchDocument[]) => setIndex(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const emptyQuery = !query.trim();

  const allRanked = useMemo(
    () => rankSearch(query, index, { cap: PAGE_GROUP_CAP }),
    [query, index],
  );

  const ranked = useMemo(
    () =>
      typeParam === "all"
        ? allRanked
        : rankSearch(query, index, { type: typeParam, cap: NARROW_CAP }),
    [allRanked, query, index, typeParam],
  );

  const typeCounts = useMemo(() => {
    const counts: Partial<Record<SearchType, number>> = {};
    for (const g of allRanked.groups) counts[g.type] = g.total;
    return counts;
  }, [allRanked]);

  const resultHrefs = useMemo(
    () => ranked.groups.flatMap((g) => g.items.map((i) => i.doc.href)),
    [ranked],
  );
  const [active, setActive] = useState(0);

  const mostRead = useMemo(() => {
    const rivers = index.filter((d) => d.type === "river");
    const picked = MOST_READ_RIVER_SLUGS.map((slug) =>
      rivers.find((d) => d.slug === slug),
    ).filter((d): d is SearchDocument => Boolean(d));
    if (picked.length >= 3) return picked.slice(0, 3);
    const extras = rivers.filter((d) => d.featured && !picked.some((p) => p.slug === d.slug));
    return [...picked, ...extras].slice(0, 3);
  }, [index]);

  useEffect(() => {
    setActive(0);
  }, [query, typeParam]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const inField =
        t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      const inSearchBox = t?.id === "search-q";
      if (!resultHrefs.length) return;
      if (e.key === "j" || e.key === "ArrowDown") {
        if (inField && e.key === "j") return;
        e.preventDefault();
        setActive((i) => Math.min(i + 1, resultHrefs.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        if (inField && e.key === "k") return;
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && (!inField || inSearchBox)) {
        const href = resultHrefs[active];
        if (href) {
          e.preventDefault();
          router.push(href);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resultHrefs, active, router]);

  useEffect(() => {
    const rankedSites =
      ranked.groups
        .find((g) => g.type === "river")
        ?.items.map((i) => i.doc.usgsGaugeId)
        .filter((id): id is string => Boolean(id)) ?? [];
    const featuredSites = mostRead
      .map((d) => d.usgsGaugeId)
      .filter((id): id is string => Boolean(id));
    const sites = [...new Set(rankedSites.length > 0 ? rankedSites : featuredSites)].slice(
      0,
      8,
    );
    if (!sites.length) {
      setFlows({});
      return;
    }
    const ac = new AbortController();
    fetch(`/api/search/flow?sites=${sites.join(",")}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((data: Record<string, number>) => {
        if (!ac.signal.aborted) setFlows(data);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
      });
    return () => ac.abort();
  }, [ranked, mostRead]);

  const updateUrl = useCallback(
    (q: string, type: string) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (type && type !== "all") params.set("type", type);
      router.replace(`/search${params.toString() ? `?${params}` : ""}`, { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    const timeout = setTimeout(() => updateUrl(query, typeParam), 300);
    return () => clearTimeout(timeout);
  }, [query, typeParam, updateUrl]);

  const catalogLine = index.length
    ? `Search ${index.length} rivers, flies, hatches, places, field notes, species, lodges, guides, and fly shops.`
    : "Search rivers, flies, hatches, places, field notes, species, lodges, guides, and fly shops.";

  const hatchingNow = useMemo(() => {
    const month = currentMonthName();
    return index
      .filter((d) => d.type === "hatch" && d.months?.some((m) => monthMatches(m, month)))
      .slice(0, 3);
  }, [index]);

  const alsoMatching = useMemo(() => {
    if (typeParam === "all") return [];
    return allRanked.groups.filter((g) => g.type !== typeParam && g.total > 0);
  }, [allRanked, typeParam]);

  function setType(next: SearchType | "all") {
    updateUrl(query, next);
  }

  return (
    <>
      <h1 className="sr-only">Search</h1>

      <SearchField
        inputRef={inputRef}
        value={query}
        onChange={setQuery}
        onClear={() => setQuery("")}
      />

      <div className="mt-5 mb-8">
        <SearchTypeChips
          selected={typeParam}
          onSelect={setType}
          counts={emptyQuery ? undefined : typeCounts}
        />
      </div>

      {emptyQuery && (
        <SearchEmptyState
          catalogLine={catalogLine}
          mostRead={mostRead}
          hatchingNow={hatchingNow}
          flows={flows}
          onExample={setQuery}
        />
      )}

      {!emptyQuery && ranked.total === 0 && (
        <div className="py-10">
          <p className="font-heading text-[22px] font-semibold text-[var(--text-primary)]">
            Nothing matched
          </p>
          <p className="mt-2 text-[15px] text-[var(--text-body)]">
            No rivers, flies, hatches, places, or field notes for that.
          </p>
          {ranked.suggestion && (
            <p className="mt-3 text-[14px] text-[var(--text-body)]">
              Did you mean{" "}
              <button
                type="button"
                className={`ea-focus-ring ${FOCUS_VISIBLE} text-[var(--text-primary)] underline decoration-[var(--border-rule)] underline-offset-4 hover:decoration-[var(--action)]`}
                onClick={() => setQuery(ranked.suggestion!.title)}
              >
                {ranked.suggestion.title}
              </button>
              ?
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuery(q)}
                className={`ea-focus-ring ${FOCUS_VISIBLE} border border-[var(--border-rule)] bg-[var(--surface-card)] px-3 py-1.5 text-[13px] text-[var(--text-primary)] hover:border-[var(--border-strong)]`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {!emptyQuery && ranked.total > 0 && typeParam !== "all" && alsoMatching.length > 0 && (
        <p className="mb-6 text-[13px] text-[var(--text-body)]">
          Narrowed to {TYPE_LABELS[typeParam].toLowerCase()}. Also{" "}
          {alsoMatching.map((g, i) => (
            <span key={g.type}>
              {i > 0 ? ", " : ""}
              <button
                type="button"
                onClick={() => setType(g.type)}
                className={`ea-focus-ring ${FOCUS_VISIBLE} text-[var(--text-primary)] underline decoration-[var(--border-rule)] underline-offset-4 hover:decoration-[var(--action)]`}
              >
                {g.total} {TYPE_LABELS[g.type].toLowerCase()}
              </button>
            </span>
          ))}
          .
        </p>
      )}

      {!emptyQuery &&
        ranked.groups.map((group) => (
          <div key={group.type} className="mb-10">
            <SearchResultGroup
              group={group}
              flows={flows}
              activeHref={resultHrefs[active]}
              narrowed={typeParam !== "all"}
              onSeeAll={() => setType(group.type)}
            />
          </div>
        ))}
    </>
  );
}

/**
 * Suspense fallback for the instant the client hooks up. A static echo of
 * the real field + chips, not a spinner — the finding tool should look
 * ready, not loading. No paywall, no pulse; Daylight only, same as the page
 * it stands in for.
 */
export function SearchPageFallback() {
  return (
    <>
      <span className="sr-only" role="status">
        Loading search
      </span>
      <div aria-hidden className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-body)]"
        />
        <div className="w-full border border-[var(--border-rule)] bg-[var(--surface-card)] py-4 pl-12 pr-4 text-[18px] text-[var(--text-body)]">
          Search a river, a fly, a hatch, a place.
        </div>
      </div>
      <div aria-hidden className="mt-5 mb-8 flex flex-wrap gap-2">
        {["All", ...GROUP_ORDER.map((t) => TYPE_LABELS[t])].map((label) => (
          <span
            key={label}
            className="border border-[var(--border-rule)] bg-[var(--surface-card)] px-3 py-1.5 text-[13px] text-[var(--text-body)]"
          >
            {label}
          </span>
        ))}
      </div>
    </>
  );
}
