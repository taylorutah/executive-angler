"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "@/icons";
import { FOCUS_VISIBLE, MOTION_SAFE, SEARCH_PLACEHOLDER, searchHref } from "./links";
import { useModalChrome } from "./useModalChrome";
import { useRouteChangeReset } from "./useRouteChangeReset";

/**
 * Search lives in the bar, never behind an icon. Desktop gets a real 280px
 * input; mobile gets a labelled pill that opens a full-screen field.
 */
export default function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [overlayQuery, setOverlayQuery] = useState("");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const pillRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const pathname = useRouteChangeReset(() => setOverlayOpen(false));

  useModalChrome({
    open: overlayOpen,
    containerRef: overlayRef,
    onClose: () => setOverlayOpen(false),
    returnFocusTo: pillRef,
  });

  function submit(value: string) {
    router.push(searchHref(value));
  }

  // /search owns the canonical #search-q field. A second bar here stacks.
  if (pathname === "/search") {
    return null;
  }

  return (
    <>
      {/* Desktop — always-visible field */}
      <form
        role="search"
        className="hidden lg:block"
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
      >
        <label htmlFor="search-q" className="sr-only">
          Search Executive Angler
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-3)]"
            aria-hidden
          />
          <input
            id="search-q"
            type="search"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={SEARCH_PLACEHOLDER}
            aria-label="Search Executive Angler"
            className={`ea-focus-ring ${FOCUS_VISIBLE} ${MOTION_SAFE} h-8 w-[280px] rounded-md border border-[var(--border)] bg-[var(--surface)] pl-8 ${query ? "pr-8" : "pr-3"} text-[14px] text-[var(--text-1)] placeholder:text-[var(--text-3)] outline-none`}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className={`ea-focus-ring ${FOCUS_VISIBLE} absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-[var(--text-3)] hover:text-[var(--text-1)]`}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </form>

      {/* Mobile — pill that opens the full-screen field */}
      <button
        ref={pillRef}
        type="button"
        onClick={() => {
          setOverlayQuery(query);
          setOverlayOpen(true);
        }}
        className={`ea-focus-ring ${FOCUS_VISIBLE} lg:hidden inline-flex h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] font-medium text-[var(--text-2)]`}
      >
        <Search className="h-4 w-4" aria-hidden />
        Search
      </button>

      {overlayOpen && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          className="lg:hidden fixed inset-0 z-[60] flex flex-col bg-[var(--surface-page)]"
        >
          <div className="flex h-[var(--header-h)] items-center justify-between border-b border-[var(--border-rule)] px-4">
            <p className="ea-overline">
              Search
            </p>
            <button
              type="button"
              onClick={() => setOverlayOpen(false)}
              aria-label="Close search"
              className={`ea-focus-ring ${FOCUS_VISIBLE} -mr-2 flex h-11 w-11 items-center justify-center rounded-md text-[var(--text-body)]`}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <form
            role="search"
            className="px-4 pt-6"
            onSubmit={(e) => {
              e.preventDefault();
              setOverlayOpen(false);
              submit(overlayQuery);
            }}
          >
            <label htmlFor="mobile-search-q" className="sr-only">
              Search Executive Angler
            </label>
            <div className="relative">
              <input
                id="mobile-search-q"
                data-autofocus
                type="search"
                name="q"
                value={overlayQuery}
                onChange={(e) => setOverlayQuery(e.target.value)}
                placeholder={SEARCH_PLACEHOLDER}
                className={`ea-focus-ring ${FOCUS_VISIBLE} w-full border-b border-[var(--border-rule)] bg-transparent pb-3 ${overlayQuery ? "pr-12" : ""} text-2xl text-[var(--text-primary)] placeholder:text-[var(--text-meta)] outline-none`}
              />
              {overlayQuery ? (
                <button
                  type="button"
                  onClick={() => setOverlayQuery("")}
                  aria-label="Clear search"
                  className={`ea-focus-ring ${FOCUS_VISIBLE} absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-sm text-[var(--text-meta)] hover:text-[var(--text-primary)]`}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
            </div>
            <p className="mt-4 text-[13px] text-[var(--text-meta)]">
              Press enter to see every match.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
