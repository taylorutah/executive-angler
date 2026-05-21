"use client";
/**
 * CommandPalette — Cmd+K (Ctrl+K) global launcher.
 *
 * Reuses the existing /api/search-index endpoint (already feeds /search)
 * so the palette mirrors the same data source. Adds a few quick actions
 * at the top — "New fly pattern", "New session", "Open workspace" — so
 * the palette is also a navigation hub, not just a search box.
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  MapPin,
  Compass,
  Fish,
  Home,
  Users,
  Store,
  BookOpen,
  Bug,
  Plus,
  Layers,
  ChevronRight,
} from "lucide-react";

interface SearchResult {
  type:
    | "destination"
    | "river"
    | "species"
    | "lodge"
    | "guide"
    | "fly-shop"
    | "article"
    | "fly";
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  href: string;
  keywords?: string;
}

const TYPE_META: Record<
  SearchResult["type"],
  { label: string; Icon: typeof MapPin }
> = {
  destination: { label: "Destination", Icon: MapPin },
  river: { label: "River", Icon: Compass },
  species: { label: "Species", Icon: Fish },
  lodge: { label: "Lodge", Icon: Home },
  guide: { label: "Guide", Icon: Users },
  "fly-shop": { label: "Fly Shop", Icon: Store },
  article: { label: "Article", Icon: BookOpen },
  fly: { label: "Fly Pattern", Icon: Bug },
};

const QUICK_ACTIONS: { id: string; label: string; href: string; Icon: typeof Plus }[] = [
  { id: "new-fly", label: "New fly pattern", href: "/journal/flies/new", Icon: Plus },
  { id: "new-session", label: "Log a session", href: "/journal/new", Icon: Plus },
  { id: "open-workspace", label: "Open Flies Workspace", href: "/flies/workspace", Icon: Layers },
  { id: "open-library", label: "Browse fly library", href: "/flies/library", Icon: BookOpen },
  { id: "open-rivers", label: "Browse rivers", href: "/rivers", Icon: Compass },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchResult[]>([]);

  // Lazy-load the search index the first time the palette opens.
  useEffect(() => {
    if (!open || index.length > 0) return;
    fetch("/api/search-index")
      .then((r) => r.json())
      .then((data: SearchResult[]) => setIndex(data))
      .catch(() => {});
  }, [open, index.length]);

  // Global hotkey: ⌘K / Ctrl+K toggles the palette. Skip when the user is
  // typing in a text input or contenteditable region.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTextField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        // Even inside an input the user often wants the palette — Linear
        // and Raycast both override this; match that expectation.
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape" && open && !isTextField) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Filter results client-side. cmdk does its own fuzzy ranking under the
  // hood; we just pre-narrow obvious mismatches so a 5000-item index
  // doesn't drown the matcher.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 30); // Show some recent-ish defaults
    return index
      .filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q) ||
          r.keywords?.toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [index, query]);

  const byType = useMemo(() => {
    const groups = new Map<SearchResult["type"], SearchResult[]>();
    for (const r of filtered) {
      const arr = groups.get(r.type) ?? [];
      arr.push(r);
      groups.set(r.type, arr);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function go(href: string) {
    close();
    router.push(href);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global search"
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[15vh]"
      shouldFilter={false}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden
      />
      {/* Panel */}
      <div className="relative w-full max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2.5">
          <Search className="h-4 w-4 text-[var(--color-text-muted)]" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search flies, rivers, sessions, anything…"
            className="flex-1 bg-transparent border-0 outline-none text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
          />
          <kbd className="hidden sm:inline rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-text-muted)]">
            esc
          </kbd>
        </div>
        <Command.List className="max-h-[60vh] overflow-y-auto p-1.5">
          <Command.Empty className="py-8 text-center text-sm text-[var(--color-text-muted)]">
            {index.length === 0 ? "Loading…" : "No matches."}
          </Command.Empty>

          {/* Quick actions surface first when the query is short. */}
          {query.length < 3 && (
            <Command.Group heading="Actions">
              {QUICK_ACTIONS.map((a) => (
                <Command.Item
                  key={a.id}
                  value={`action ${a.label}`}
                  onSelect={() => go(a.href)}
                  className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm cursor-pointer text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)] aria-selected:bg-[var(--color-bg)] aria-selected:text-[var(--color-text-primary)]"
                >
                  <a.Icon className="h-4 w-4 text-[#E8923A]" />
                  <span className="flex-1">{a.label}</span>
                  <ChevronRight className="h-3 w-3 opacity-40" />
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {byType.map(([type, items]) => {
            const meta = TYPE_META[type];
            return (
              <Command.Group key={type} heading={meta.label + "s"}>
                {items.slice(0, 8).map((r) => (
                  <Command.Item
                    key={r.href + r.slug}
                    value={`${meta.label} ${r.title} ${r.subtitle} ${r.keywords ?? ""}`}
                    onSelect={() => go(r.href)}
                    className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm cursor-pointer text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)] aria-selected:bg-[var(--color-bg)] aria-selected:text-[var(--color-text-primary)]"
                  >
                    <meta.Icon className="h-4 w-4 text-[var(--color-text-muted)]" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-[var(--color-text-primary)]">
                        {r.title}
                      </p>
                      {r.subtitle && (
                        <p className="truncate text-xs text-[var(--color-text-muted)]">
                          {r.subtitle}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-3 w-3 opacity-40" />
                  </Command.Item>
                ))}
              </Command.Group>
            );
          })}
        </Command.List>
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)]/50 px-3 py-1.5 flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
          <span>
            <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1 py-0.5 font-mono">↑↓</kbd>{" "}
            navigate ·{" "}
            <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1 py-0.5 font-mono">↵</kbd>{" "}
            open
          </span>
          <span>
            <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1 py-0.5 font-mono">⌘K</kbd>{" "}
            anywhere
          </span>
        </div>
      </div>
    </Command.Dialog>
  );
}
