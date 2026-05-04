"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Wrench, Heart, X, Feather } from "lucide-react";

export interface MyFliesItem {
  key: string;
  flyBoxId?: string;
  flyPatternId?: string;
  name: string;
  imageUrl?: string | null;
  size?: string | null;
  category?: string | null;
  status?: "wanted" | "at_vise" | "done" | null;
  href: string;
}

interface Props {
  tieNext: MyFliesItem[];
  favorites: MyFliesItem[];
}

export default function MyFliesWidget({ tieNext: initialTieNext, favorites: initialFavorites }: Props) {
  const [tab, setTab] = useState<"tie-next" | "favorites">("tie-next");
  const [tieNext, setTieNext] = useState(initialTieNext);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [, startTransition] = useTransition();

  async function cycleStatus(item: MyFliesItem) {
    const next: MyFliesItem["status"] = item.status === "wanted" ? "at_vise" : item.status === "at_vise" ? "done" : "wanted";
    setTieNext((cur) =>
      next === "done"
        ? cur.filter((x) => x.key !== item.key)
        : cur.map((x) => (x.key === item.key ? { ...x, status: next } : x))
    );
    startTransition(async () => {
      await fetch("/api/fishing/tie-next", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flyBoxId: item.flyBoxId,
          flyPatternId: item.flyPatternId,
          status: next,
        }),
      });
    });
  }

  async function removeFromTieNext(item: MyFliesItem) {
    setTieNext((cur) => cur.filter((x) => x.key !== item.key));
    startTransition(async () => {
      const params = new URLSearchParams();
      if (item.flyBoxId) params.set("flyBoxId", item.flyBoxId);
      if (item.flyPatternId) params.set("flyPatternId", item.flyPatternId);
      await fetch(`/api/fishing/tie-next?${params.toString()}`, { method: "DELETE" });
    });
  }

  async function removeFavorite(item: MyFliesItem) {
    setFavorites((cur) => cur.filter((x) => x.key !== item.key));
    startTransition(async () => {
      await fetch("/api/fishing/fly-favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flyBoxId: item.flyBoxId,
          flyPatternId: item.flyPatternId,
          favorite: false,
        }),
      });
    });
  }

  const items = tab === "tie-next" ? tieNext : favorites;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Feather className="h-4 w-4 text-[#E8923A]" />
          <h2 className="font-serif text-lg text-[#F0F6FC]">My Flies</h2>
        </div>
        <Link
          href="/my-flies?tab=workbench"
          className="text-xs text-[#A8B2BD] hover:text-[#E8923A] transition-colors flex items-center gap-1"
        >
          <Wrench className="h-3 w-3" /> Workbench
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 bg-[#0D1117] p-1 rounded-lg border border-[#21262D]">
        <button
          onClick={() => setTab("tie-next")}
          className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
            tab === "tie-next"
              ? "bg-[#161B22] text-[#F0F6FC] border border-[#21262D]"
              : "text-[#A8B2BD] hover:text-[#F0F6FC]"
          }`}
        >
          Tie Next {tieNext.length > 0 && <span className="text-[10px] text-[#6E7681]">({tieNext.length})</span>}
        </button>
        <button
          onClick={() => setTab("favorites")}
          className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
            tab === "favorites"
              ? "bg-[#161B22] text-[#F0F6FC] border border-[#21262D]"
              : "text-[#A8B2BD] hover:text-[#F0F6FC]"
          }`}
        >
          Favorites {favorites.length > 0 && <span className="text-[10px] text-[#6E7681]">({favorites.length})</span>}
        </button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div className="space-y-1.5">
          {items.slice(0, 8).map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-2.5 p-2 bg-[#161B22] rounded-lg border border-[#21262D] hover:border-[#E8923A]/40 transition-colors group"
            >
              <Link href={item.href} className="flex items-center gap-2.5 flex-1 min-w-0">
                {/* Thumbnail */}
                <div className="h-9 w-9 rounded-md overflow-hidden bg-[#0D1117] border border-[#21262D] flex items-center justify-center flex-shrink-0">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={36}
                      height={36}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Feather className="h-4 w-4 text-[#6E7681]" />
                  )}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#F0F6FC] truncate group-hover:text-[#E8923A] transition-colors">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-[#6E7681]">
                    {item.category && <span className="capitalize">{item.category}</span>}
                    {item.size && <span className="font-['IBM_Plex_Mono']">#{item.size.replace(/^#/, "")}</span>}
                  </div>
                </div>
              </Link>

              {/* Right-side actions */}
              {tab === "tie-next" ? (
                <>
                  <button
                    onClick={() => cycleStatus(item)}
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors ${
                      item.status === "at_vise"
                        ? "bg-[#E8923A]/15 text-[#E8923A] hover:bg-[#E8923A]/25"
                        : "bg-[#0BA5C7]/15 text-[#0BA5C7] hover:bg-[#0BA5C7]/25"
                    }`}
                    title={item.status === "at_vise" ? "Mark done" : "Move to At Vise"}
                  >
                    {item.status === "at_vise" ? "At Vise" : "Wanted"}
                  </button>
                  <button
                    onClick={() => removeFromTieNext(item)}
                    className="p-1 text-[#6E7681] hover:text-[#F0F6FC] transition-colors"
                    title="Remove from Tie Next"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => removeFavorite(item)}
                  className="p-1 text-[#E8923A] hover:text-[#F0F6FC] transition-colors"
                  title="Remove from favorites"
                >
                  <Heart className="h-3.5 w-3.5 fill-current" />
                </button>
              )}
            </div>
          ))}
          {items.length > 8 && (
            <Link
              href={tab === "tie-next" ? "/my-flies?tab=tie-next" : "/my-flies?tab=box"}
              className="block text-center text-[11px] text-[#A8B2BD] hover:text-[#E8923A] py-2 transition-colors"
            >
              View all {items.length} →
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

function EmptyState({ tab }: { tab: "tie-next" | "favorites" }) {
  if (tab === "tie-next") {
    return (
      <div className="bg-[#161B22] rounded-lg border border-[#21262D] border-dashed p-5 text-center">
        <Wrench className="h-7 w-7 text-[#6E7681] mx-auto mb-2" />
        <p className="text-xs text-[#A8B2BD] mb-3">No flies queued to tie.</p>
        <Link
          href="/my-flies?tab=box"
          className="text-[11px] text-[#E8923A] hover:underline"
        >
          Browse your fly box →
        </Link>
      </div>
    );
  }
  return (
    <div className="bg-[#161B22] rounded-lg border border-[#21262D] border-dashed p-5 text-center">
      <Heart className="h-7 w-7 text-[#6E7681] mx-auto mb-2" />
      <p className="text-xs text-[#A8B2BD] mb-3">No favorite flies yet.</p>
      <Link
        href="/flies"
        className="text-[11px] text-[#E8923A] hover:underline"
      >
        Explore the fly library →
      </Link>
    </div>
  );
}
