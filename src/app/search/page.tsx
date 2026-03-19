"use client";

import { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X, MapPin, Fish, Home, BookOpen, Users, Store, Compass } from "lucide-react";


interface SearchResult {
  type: "destination" | "river" | "species" | "lodge" | "guide" | "fly-shop" | "article";
  slug: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  href: string;
  keywords?: string;
}

const CATEGORY_META: Record<
  SearchResult["type"],
  { label: string; icon: React.ElementType; color: string }
> = {
  destination: { label: "Destinations", icon: MapPin, color: "bg-emerald-100 text-emerald-700" },
  river: { label: "Rivers", icon: Compass, color: "bg-blue-100 text-blue-700" },
  species: { label: "Species", icon: Fish, color: "bg-amber-100 text-amber-700" },
  lodge: { label: "Lodges", icon: Home, color: "bg-purple-100 text-purple-700" },
  guide: { label: "Guides", icon: Users, color: "bg-rose-100 text-rose-700" },
  "fly-shop": { label: "Fly Shops", icon: Store, color: "bg-cyan-100 text-cyan-700" },
  article: { label: "Articles", icon: BookOpen, color: "bg-orange-100 text-orange-700" },
};



function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [index, setIndex] = useState<SearchResult[]>([]);

  useEffect(() => {
    fetch("/api/search-index")
      .then((r) => r.json())
      .then((data: SearchResult[]) => setIndex(data))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const scored = index
      .map((item) => {
        const titleLower = item.title.toLowerCase();
        const subtitleLower = item.subtitle.toLowerCase();
        const keywordsLower = (item.keywords ?? "").toLowerCase();
        let score = 0;
        for (const t of terms) {
          if (titleLower.includes(t)) score += 3;
          else if (subtitleLower.includes(t)) score += 2;
          else if (keywordsLower.includes(t)) score += 1;
        }
        return { item, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.map((r) => r.item);
  }, [query, index]);

  const grouped = useMemo(() => {
    const groups: Partial<Record<SearchResult["type"], SearchResult[]>> = {};
    for (const r of filtered) {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type]!.push(r);
    }
    return groups;
  }, [filtered]);

  const updateUrl = useCallback(
    (q: string) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      router.replace(`/search${params.toString() ? `?${params}` : ""}`, {
        scroll: false,
      });
    },
    [router]
  );

  useEffect(() => {
    const timeout = setTimeout(() => updateUrl(query), 300);
    return () => clearTimeout(timeout);
  }, [query, updateUrl]);

  return (
    <>
      <h1 className="font-heading text-4xl font-bold text-[#E8923A] mb-8">
        Search
      </h1>

      {/* Search input */}
      <div className="relative mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#484F58]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search destinations, rivers, species, lodges, guides, articles..."
          autoFocus
          className="w-full rounded-xl border border-[#21262D] bg-[#161B22] pl-12 pr-12 py-4 text-lg text-[#F0F6FC] placeholder:text-[#484F58] focus:border-[#E8923A] focus:ring-2 focus:ring-[#E8923A]/20 outline-none transition-colors shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#484F58] hover:text-[#8B949E]"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <div className="absolute right-14 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs text-[#484F58]">
          <kbd className="px-1.5 py-0.5 rounded bg-[#1F2937] border border-[#21262D] font-mono">
            ⌘
          </kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-[#1F2937] border border-[#21262D] font-mono">
            K
          </kbd>
        </div>
      </div>

      {/* Results */}
      {query.trim() && filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-[#484F58] mx-auto mb-4" />
          <p className="text-lg text-[#8B949E]">
            No results found for &quot;{query}&quot;
          </p>
          <p className="text-sm text-[#484F58] mt-2">
            Try a different search term or browse our categories above.
          </p>
        </div>
      )}

      {!query.trim() && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-[#484F58] mx-auto mb-4" />
          <p className="text-lg text-[#8B949E]">
            Search across {index.length} destinations, rivers, species, lodges,
            guides, fly shops, and articles.
          </p>
        </div>
      )}

      {Object.entries(grouped).map(([type, items]) => {
        const meta = CATEGORY_META[type as SearchResult["type"]];
        const Icon = meta.icon;
        return (
          <div key={type} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${meta.color}`}
              >
                <Icon className="h-4 w-4" />
                {meta.label}
              </span>
              <span className="text-sm text-[#484F58]">
                {items!.length} result{items!.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-2">
              {items!.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#0D1117] transition-colors group"
                >
                  {item.imageUrl && (
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#1F2937]">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-[#F0F6FC] group-hover:text-[#E8923A] truncate">
                      {item.title}
                    </p>
                    <p className="text-sm text-[#8B949E] truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {query.trim() && filtered.length > 0 && (
        <p className="text-center text-sm text-[#484F58] mt-8">
          Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""}{" "}
          for &quot;{query}&quot;
        </p>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-[#484F58] mx-auto mb-4 animate-pulse" />
              <p className="text-lg text-[#8B949E]">Loading search...</p>
            </div>
          }
        >
          <SearchContent />
        </Suspense>
      </div>
    </div>
  );
}
