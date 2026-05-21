"use client";
/**
 * WorkspaceClient — Phase 1 shell.
 *
 * Renders the unified workspace data as a grid of cards. Two pieces of UI:
 *   1. A *virtual view rail* on desktop (and a chip strip on mobile) so the
 *      user can switch between All / Created by me / Favorites / Tie next /
 *      In a box / Need to restock.
 *   2. A grid of fly cards. The card design mirrors PatternsHub so users
 *      transitioning between hubs see the same shape.
 *
 * Phase 2 layers in filter pills, sort menu, view switcher, URL state for
 * everything, and the saved-views CRUD UI.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Star,
  Wrench,
  Boxes as BoxesIcon,
  Layers,
  Heart,
  Plus,
} from "lucide-react";
import type { WorkspaceRow } from "@/lib/flies/workspace-shared";
import { VIRTUAL_VIEWS } from "@/lib/flies/workspace-shared";

interface Props {
  rows: WorkspaceRow[];
  activeViewId: string;
  viewerUserId: string;
  viewerUsername: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  nymph: "Nymph",
  dry: "Dry Fly",
  streamer: "Streamer",
  emerger: "Emerger",
  wet: "Wet Fly",
  terrestrial: "Terrestrial",
  egg: "Egg",
  midge: "Midge",
  other: "Other",
};

export default function WorkspaceClient({
  rows,
  activeViewId,
  viewerUsername,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams?.get("search") ?? "");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.fly.name.toLowerCase().includes(q));
  }, [rows, search]);

  function setView(viewId: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (viewId === "all") params.delete("view");
    else params.set("view", viewId);
    const qs = params.toString();
    router.replace(qs ? `/flies/workspace?${qs}` : "/flies/workspace", {
      scroll: false,
    });
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-20">
        {/* Header */}
        <header className="mb-5 sm:mb-6">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            Flies
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            <span className="font-[var(--font-mono)] tabular-nums">
              {rows.length}
            </span>{" "}
            patterns in your collection
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href="/flies/library"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[#E8923A]/40 transition-colors"
            >
              Browse Library
            </Link>
            <Link
              href="/journal/flies/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0A65A] transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> New Pattern
            </Link>
          </div>
        </header>

        {/* Persistent sub-nav. Boxes stays equally prominent here. */}
        <FliesSubNav active="workspace" />

        {/* View chips. On desktop these become a left rail in Phase 2; for
            Phase 1 we render them horizontally for simplicity. */}
        <div
          role="tablist"
          aria-label="Workspace view"
          className="mb-4 -mx-4 sm:mx-0 px-4 sm:px-0 flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 min-w-max">
            {VIRTUAL_VIEWS.map((v) => (
              <button
                key={v.id}
                role="tab"
                aria-selected={activeViewId === v.id}
                onClick={() => setView(v.id)}
                className={[
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  activeViewId === v.id
                    ? "bg-[#E8923A] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]",
                ].join(" ")}
              >
                <ViewIcon viewId={v.id} />
                {v.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar — Phase 2 adds full filter bar. */}
        <div className="mb-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your flies…"
            className="w-full max-w-md rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[#E8923A]/40"
          />
        </div>

        {/* Grid of fly cards. */}
        {filtered.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] py-12 text-center">
            {activeViewId === "created-by-me"
              ? "You haven't created any flies yet. Clone a canonical pattern or start a new one."
              : activeViewId === "favorites"
                ? "No favorited flies yet."
                : activeViewId === "tie-next"
                  ? "Your tie-next queue is empty."
                  : activeViewId === "in-a-box"
                    ? "Add a fly to a box to see it here."
                    : activeViewId === "restock"
                      ? "Inventory looks healthy — nothing to restock."
                      : rows.length === 0
                        ? "Your collection is empty. Browse the library and tap “+ Add to my box.”"
                        : "No matches. Adjust your search."}
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((r) => {
              const flyStatus = (r.fly as { status?: string | null }).status ?? null;
              const isPrivateRoute =
                r.is_custom &&
                (flyStatus === "private" || flyStatus === "pending");
              const href =
                isPrivateRoute && viewerUsername
                  ? `/anglers/${viewerUsername}/flies/${r.fly.slug}`
                  : `/flies/${r.fly.slug}`;
              return (
                <li key={r.fly.id}>
                  <Link
                    href={href}
                    className="block h-full rounded-lg border border-[var(--color-border)] hover:border-[#E8923A]/60 hover:bg-[#E8923A]/5 transition-colors px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-[var(--color-surface)]">
                        {r.fly.hero_image_url ? (
                          <Image
                            src={r.fly.hero_image_url}
                            alt={r.fly.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="font-medium truncate text-[var(--color-text-primary)]">
                            {r.fly.name}
                          </p>
                          {r.is_custom && (
                            <span
                              className="inline-flex items-center gap-1 rounded-md border border-[#00B4D8]/40 bg-[#00B4D8]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#0BA5C7] flex-shrink-0"
                              title={
                                flyStatus === "pending"
                                  ? "Submitted for review"
                                  : flyStatus === "approved"
                                    ? "Your fly, now in the canonical library"
                                    : "Created by you"
                              }
                            >
                              <Sparkles className="h-3 w-3" />
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">
                          {CATEGORY_LABELS[(r.fly.category as string) ?? ""] ??
                            r.fly.category ??
                            "Fly"}
                          {r.versions.length > 0
                            ? ` · ${r.versions.length} version${r.versions.length === 1 ? "" : "s"}`
                            : " · No versions yet"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
                      <Stat label="In box" value={r.in_box_count} />
                      <Stat label="Target" value={r.target_total} />
                      <Stat
                        label="Δ"
                        value={r.deficit}
                        warn={r.deficit > 0}
                      />
                      {r.tie_next_count > 0 && (
                        <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-[#E8923A]/40 bg-[#E8923A]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#E8923A]">
                          <Wrench className="h-3 w-3" /> {r.tie_next_count}
                        </span>
                      )}
                      {r.favorite_any && (
                        <Heart
                          className="h-3.5 w-3.5 text-rose-500"
                          fill="currentColor"
                        />
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function ViewIcon({ viewId }: { viewId: string }) {
  switch (viewId) {
    case "created-by-me":
      return <Sparkles className="h-3.5 w-3.5" />;
    case "favorites":
      return <Star className="h-3.5 w-3.5" />;
    case "tie-next":
      return <Wrench className="h-3.5 w-3.5" />;
    case "in-a-box":
      return <BoxesIcon className="h-3.5 w-3.5" />;
    case "restock":
      return <Heart className="h-3.5 w-3.5" />;
    default:
      return <Layers className="h-3.5 w-3.5" />;
  }
}

function Stat({
  label,
  value,
  warn,
}: {
  label: string;
  value: number;
  warn?: boolean;
}) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
      <span
        className={`font-[var(--font-mono)] tabular-nums ${
          warn ? "text-[#E8923A] font-semibold" : ""
        }`}
      >
        {value}
      </span>
    </span>
  );
}

/**
 * Persistent flies sub-nav. Renders above the workspace contents on every
 * `/flies/*` route so Boxes / Workbench / Tie Next / Shared stay one click
 * away regardless of where the user is.
 *
 * Phase 1: only rendered inside the workspace shell to validate the layout.
 * Phase 6 promotes this into a shared layout file consumed by the rest of
 * the /flies routes.
 */
function FliesSubNav({
  active,
}: {
  active: "workspace" | "boxes" | "workbench" | "tie-next" | "shared";
}) {
  const items: { key: typeof active; label: string; href: string }[] = [
    { key: "workspace", label: "Workspace", href: "/flies/workspace" },
    { key: "boxes", label: "Boxes", href: "/flies?tab=boxes" },
    { key: "workbench", label: "Workbench", href: "/flies?tab=workbench" },
    { key: "tie-next", label: "Tie Next", href: "/flies?tab=tie-next" },
    { key: "shared", label: "Shared", href: "/flies?tab=shared" },
  ];
  return (
    <nav
      aria-label="Flies sections"
      className="mb-5 -mx-4 sm:mx-0 px-4 sm:px-0 flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 min-w-max">
        {items.map((it) => (
          <Link
            key={it.key}
            href={it.href}
            className={[
              "rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              active === it.key
                ? "bg-[var(--color-bg)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
            ].join(" ")}
          >
            {it.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
