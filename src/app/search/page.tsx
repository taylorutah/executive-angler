"use client";

import { Suspense, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  MapPin,
  Fish,
  Home,
  BookOpen,
  Users,
  Store,
  Compass,
  Bug,
  Feather,
} from "lucide-react";
import FlyBoxAddButton from "@/components/flies/FlyBoxAddButton";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import {
  rankSearch,
  GROUP_ORDER,
  type SearchDocument,
  type SearchType,
} from "@/lib/search";

const TYPE_META: Record<
  SearchType,
  { label: string; icon: React.ElementType; color: string }
> = {
  river: { label: "Rivers", icon: Compass, color: "bg-blue-100 text-blue-700" },
  fly: { label: "Flies", icon: Bug, color: "bg-yellow-100 text-yellow-700" },
  hatch: { label: "Hatches", icon: Feather, color: "bg-lime-100 text-lime-800" },
  destination: { label: "Destinations", icon: MapPin, color: "bg-emerald-100 text-emerald-700" },
  article: { label: "Articles", icon: BookOpen, color: "bg-orange-100 text-orange-700" },
  species: { label: "Species", icon: Fish, color: "bg-amber-100 text-amber-700" },
  lodge: { label: "Lodges", icon: Home, color: "bg-purple-100 text-purple-700" },
  guide: { label: "Guides", icon: Users, color: "bg-rose-100 text-rose-700" },
  "fly-shop": { label: "Fly Shops", icon: Store, color: "bg-cyan-100 text-cyan-700" },
};

const EXAMPLE_QUERIES = [
  "Madison River",
  "Pheasant Tail",
  "PMD hatch",
  "New Zealand",
  "brown trout",
  "when to fish a streamer",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const initialQuery = searchParams.get("q") ?? "";
  const typeParam = (searchParams.get("type") as SearchType | "all" | null) ?? "all";
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

  const ranked = useMemo(
    () => rankSearch(query, index, { type: typeParam }),
    [query, index, typeParam],
  );

  const resultHrefs = useMemo(
    () => ranked.groups.flatMap((g) => g.items.map((i) => i.doc.href)),
    [ranked],
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [query, typeParam]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const inField =
        t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (!resultHrefs.length) return;
      if (e.key === "j" || e.key === "ArrowDown") {
        if (inField && e.key === "j") return;
        e.preventDefault();
        setActive((i) => Math.min(i + 1, resultHrefs.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        if (inField && e.key === "k") return;
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && !inField) {
        const href = resultHrefs[active];
        if (href) router.push(href);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resultHrefs, active, router]);

  useEffect(() => {
    const sites = ranked.groups
      .find((g) => g.type === "river")
      ?.items.map((i) => i.doc.usgsGaugeId)
      .filter((id): id is string => Boolean(id))
      .slice(0, 8);
    if (!sites?.length) return;
    fetch(`/api/search/flow?sites=${sites.join(",")}`)
      .then((r) => r.json())
      .then((data: Record<string, number>) => setFlows(data))
      .catch(() => {});
  }, [ranked]);

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
    ? `Search ${index.length} rivers, flies, hatches, destinations, articles, species, lodges, guides, and fly shops.`
    : "Search rivers, flies, hatches, destinations, articles, species, lodges, guides, and fly shops.";

  const featuredRivers = useMemo(
    () => index.filter((d) => d.type === "river" && d.featured).slice(0, 3),
    [index],
  );

  const hatchingNow = useMemo(() => {
    const month = MONTHS[new Date().getMonth()];
    return index
      .filter((d) => d.type === "hatch" && d.months?.some((m) => m.toLowerCase().startsWith(month.slice(0, 3).toLowerCase()) || m === month))
      .slice(0, 4);
  }, [index]);

  function setType(next: SearchType | "all") {
    updateUrl(query, next);
  }

  const emptyQuery = !query.trim();

  return (
    <>
      <h1 className="font-heading text-4xl font-bold text-[#E8923A] mb-8">Search</h1>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6E7681]" />
        <input
          ref={inputRef}
          id="search-q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rivers, flies, hatches, destinations…"
          autoFocus
          className="w-full rounded-xl border border-[#21262D] bg-[#161B22] pl-12 pr-12 py-4 text-lg text-[#F0F6FC] placeholder:text-[#6E7681] focus:border-[#E8923A] focus:ring-2 focus:ring-[#E8923A]/20 outline-none transition-colors shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6E7681] hover:text-[#A8B2BD]"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          type="button"
          onClick={() => setType("all")}
          className={`px-3 py-1 rounded-full text-sm font-medium border ${
            typeParam === "all"
              ? "bg-[#E8923A] text-[#0D1117] border-[#E8923A]"
              : "border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/50"
          }`}
        >
          All
        </button>
        {GROUP_ORDER.map((type) => {
          const meta = TYPE_META[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => setType(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                typeParam === type
                  ? "bg-[#E8923A] text-[#0D1117] border-[#E8923A]"
                  : "border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/50"
              }`}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      {emptyQuery && (
        <div className="space-y-10">
          <p className="text-[#A8B2BD]">{catalogLine}</p>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A] mb-3">
              Try
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuery(q)}
                  className="px-3 py-1.5 rounded-full text-sm bg-[#161B22] border border-[#21262D] text-[#F0F6FC] hover:border-[#E8923A]/60"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          {featuredRivers.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A] mb-3">
                Featured rivers
              </p>
              <div className="space-y-2">
                {featuredRivers.map((item) => (
                  <ResultRow key={item.href} item={item} cfs={item.usgsGaugeId ? flows[item.usgsGaugeId] : undefined} />
                ))}
              </div>
            </div>
          )}
          {hatchingNow.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A] mb-3">
                Hatching now
              </p>
              <div className="space-y-2">
                {hatchingNow.map((item) => (
                  <ResultRow key={item.href} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!emptyQuery && ranked.total === 0 && (
        <div className="py-12">
          <p className="text-lg text-[#A8B2BD]">
            No matches in rivers, flies, hatches, destinations, articles, species, lodges,
            guides, or fly shops for &quot;{query}&quot;.
          </p>
          {ranked.suggestion && (
            <p className="text-sm text-[#6E7681] mt-3">
              Did you mean{" "}
              <button
                type="button"
                className="text-[#E8923A] hover:underline font-medium"
                onClick={() => setQuery(ranked.suggestion!.title)}
              >
                {ranked.suggestion.title}
              </button>
              ?
            </p>
          )}
        </div>
      )}

      {!emptyQuery &&
        ranked.groups.map((group) => {
          const meta = TYPE_META[group.type];
          const Icon = meta.icon;
          return (
            <div key={group.type} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${meta.color}`}
                >
                  <Icon className="h-4 w-4" />
                  {meta.label}
                </span>
                <span className="text-sm text-[#6E7681]">
                  {group.total} result{group.total !== 1 ? "s" : ""}
                </span>
                {group.total > group.items.length && (
                  <button
                    type="button"
                    onClick={() => setType(group.type)}
                    className="ml-auto text-sm text-[#E8923A] hover:underline"
                  >
                    See all {group.total}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {group.items.map(({ doc }) => (
                  <ResultRow
                    key={doc.href}
                    item={doc}
                    cfs={doc.usgsGaugeId ? flows[doc.usgsGaugeId] : undefined}
                    exactFly={group.type === "fly" && group.items[0]?.doc.slug === doc.slug}
                    active={doc.href === resultHrefs[active]}
                  />
                ))}
              </div>
            </div>
          );
        })}
    </>
  );
}

function ResultRow({
  item,
  cfs,
  exactFly,
  active,
}: {
  item: SearchDocument;
  cfs?: number;
  exactFly?: boolean;
  active?: boolean;
}) {
  const subtitle = [
    item.subtitle,
    cfs != null ? `${Math.round(cfs).toLocaleString()} cfs` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg hover:bg-[#0D1117] transition-colors group ${
        active ? "bg-[#0D1117] ring-1 ring-[#E8923A]/40" : ""
      }`}
    >
      <Link href={item.href} className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#1F2937]">
          <SafeEntityImage
            src={item.imageUrl}
            alt={item.title}
            title={item.title}
            meta={item.subtitle}
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="min-w-0">
          <p
            className={`font-medium text-[#F0F6FC] group-hover:text-[#E8923A] truncate ${
              exactFly ? "text-[#E8923A]" : ""
            }`}
          >
            {item.title}
          </p>
          <p className="text-sm text-[#A8B2BD] truncate">{subtitle}</p>
        </div>
      </Link>
      {item.type === "fly" && item.id && (
        <FlyBoxAddButton
          fly={{ id: item.id, slug: item.slug, name: item.title }}
          variant="pill"
          stopPropagation
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="pt-8 pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-[#6E7681] mx-auto mb-4 animate-pulse" />
              <p className="text-lg text-[#A8B2BD]">Loading search...</p>
            </div>
          }
        >
          <SearchContent />
        </Suspense>
      </div>
    </div>
  );
}
