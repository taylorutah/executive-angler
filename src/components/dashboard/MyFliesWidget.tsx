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
  /** Composed line like "size 18 · tungsten · 2.4mm · need 2 for My Kill Box +2". */
  subtitle?: string | null;
  /** True when this row came from listDerivedTieNextShortages — no manual actions. */
  isDerived?: boolean;
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
          <Feather className="h-4 w-4 text-[var(--action)]" />
          <h2 className="font-serif text-lg text-[var(--text-primary)]">My Flies</h2>
        </div>
        <Link
          href="/my-flies?tab=workbench"
          className="text-xs text-[var(--text-body)] hover:text-[var(--action)] transition-colors flex items-center gap-1"
        >
          <Wrench className="h-3 w-3" /> Workbench
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 bg-[var(--surface-page)] p-1 rounded-lg border border-[var(--border-rule)]">
        <button
          onClick={() => setTab("tie-next")}
          className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
            tab === "tie-next"
              ? "bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-rule)]"
              : "text-[var(--text-body)] hover:text-[var(--text-primary)]"
          }`}
        >
          Tie Next {tieNext.length > 0 && <span className="text-[10px] text-[var(--text-meta)]">({tieNext.length})</span>}
        </button>
        <button
          onClick={() => setTab("favorites")}
          className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
            tab === "favorites"
              ? "bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-rule)]"
              : "text-[var(--text-body)] hover:text-[var(--text-primary)]"
          }`}
        >
          Favorites {favorites.length > 0 && <span className="text-[10px] text-[var(--text-meta)]">({favorites.length})</span>}
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
              className="flex items-center gap-2.5 p-2 bg-[var(--surface-raised)] rounded-lg border border-[var(--border-rule)] hover:border-[var(--action)]/40 transition-colors group"
            >
              <Link href={item.href} className="flex items-center gap-2.5 flex-1 min-w-0">
                {/* Thumbnail */}
                <div className="h-9 w-9 rounded-md overflow-hidden bg-[var(--surface-page)] border border-[var(--border-rule)] flex items-center justify-center flex-shrink-0">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={36}
                      height={36}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Feather className="h-4 w-4 text-[var(--text-meta)]" />
                  )}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--action)] transition-colors">
                    {item.name}
                  </p>
                  {item.isDerived && item.subtitle ? (
                    <p className="text-[10px] text-[var(--text-meta)] truncate">{item.subtitle}</p>
                  ) : (
                    <div className="flex items-center gap-2 text-[10px] text-[var(--text-meta)]">
                      {item.category && <span className="capitalize">{item.category}</span>}
                      {item.size && <span className="font-['IBM_Plex_Mono']">#{item.size.replace(/^#/, "")}</span>}
                    </div>
                  )}
                </div>
              </Link>

              {/* Right-side actions */}
              {tab === "tie-next" ? (
                item.isDerived ? (
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[var(--signal-live)]/10 text-[var(--signal-live)]/80 border border-[var(--signal-live)]/20"
                    title="Auto-derived from a stock or fly-box shortage. Resolves when you tie or stock up."
                  >
                    Auto
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => cycleStatus(item)}
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors ${
                        item.status === "at_vise"
                          ? "bg-[var(--action)]/15 text-[var(--action)] hover:bg-[var(--action)]/25"
                          : "bg-[var(--signal-live)]/15 text-[var(--signal-live)] hover:bg-[var(--signal-live)]/25"
                      }`}
                      title={item.status === "at_vise" ? "Mark done" : "Move to At Vise"}
                    >
                      {item.status === "at_vise" ? "At Vise" : "Wanted"}
                    </button>
                    <button
                      onClick={() => removeFromTieNext(item)}
                      className="p-1 text-[var(--text-meta)] hover:text-[var(--text-primary)] transition-colors"
                      title="Remove from Tie Next"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                )
              ) : (
                <button
                  onClick={() => removeFavorite(item)}
                  className="p-1 text-[var(--action)] hover:text-[var(--text-primary)] transition-colors"
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
              className="block text-center text-[11px] text-[var(--text-body)] hover:text-[var(--action)] py-2 transition-colors"
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
      <div className="bg-[var(--surface-raised)] rounded-lg border border-[var(--border-rule)] border-dashed p-5 text-center">
        <Wrench className="h-7 w-7 text-[var(--text-meta)] mx-auto mb-2" />
        <p className="text-xs text-[var(--text-body)] mb-3">No flies queued to tie.</p>
        <Link
          href="/my-flies?tab=box"
          className="text-[11px] text-[var(--action)] hover:underline"
        >
          Browse your fly box →
        </Link>
      </div>
    );
  }
  return (
    <div className="bg-[var(--surface-raised)] rounded-lg border border-[var(--border-rule)] border-dashed p-5 text-center">
      <Heart className="h-7 w-7 text-[var(--text-meta)] mx-auto mb-2" />
      <p className="text-xs text-[var(--text-body)] mb-3">No favorite flies yet.</p>
      <Link
        href="/flies"
        className="text-[11px] text-[var(--action)] hover:underline"
      >
        Explore the fly library →
      </Link>
    </div>
  );
}
