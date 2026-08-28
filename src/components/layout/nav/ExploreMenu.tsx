"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown } from "@/icons";
import {
  FOCUS_VISIBLE,
  MEGA_MENU_COLUMNS,
  MENU_TILES,
  MOTION_SAFE,
  isSectionActive,
  type MenuTileKey,
} from "./links";
import { useRouteChangeReset } from "./useRouteChangeReset";

/** Hover-intent tolerances: open quickly, close slowly enough to cross diagonally. */
const OPEN_DELAY_MS = 120;
const CLOSE_DELAY_MS = 220;

const TILE_KEYS = Object.keys(MENU_TILES) as MenuTileKey[];

/**
 * The directory mega menu (client ruling 2026-08-28). A solid full-width
 * panel under the bar: link columns left, a photo tile right that
 * crossfades to the image mapped to the hovered or focused link.
 *
 * Disclosure pattern, not role="menu": the panel is a nav region of
 * ordinary tabbable links, so the trigger carries aria-expanded and
 * aria-controls and deliberately omits aria-haspopup. Hover opens it with
 * intent tolerance; keyboard focus on the trigger opens it; ESC closes and
 * returns focus; Tab walks every link and leaving the region closes it.
 * Below 768px it never renders — the sheet carries the directory instead.
 */
export default function ExploreMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [tile, setTile] = useState<MenuTileKey>("default");
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  /** Distinguishes mouse-click focus (click toggles) from keyboard focus (opens). */
  const focusFromPointer = useRef(false);
  /** Set before programmatically refocusing the trigger on ESC. */
  const suppressFocusOpen = useRef(false);

  useRouteChangeReset(() => {
    setOpen(false);
    setTile("default");
  });

  useEffect(
    () => () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
    },
    [],
  );

  function clearTimers() {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  }

  function scheduleOpen() {
    window.clearTimeout(closeTimer.current);
    openTimer.current = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
  }

  function scheduleClose() {
    window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(close, CLOSE_DELAY_MS);
  }

  function openNow() {
    clearTimers();
    setOpen(true);
  }

  function close() {
    clearTimers();
    setOpen(false);
    setTile("default");
  }

  // ESC closes and returns focus to the trigger; arrows cycle the links.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        suppressFocusOpen.current = true;
        close();
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const items = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>("a[href]") ?? [],
      );
      if (!items.length) return;
      const current = items.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      const next =
        e.key === "ArrowDown"
          ? items[(current + 1 + items.length) % items.length]
          : items[(current - 1 + items.length) % items.length];
      next?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Pointer press anywhere outside the region closes (hover path already
  // covers pointer users; this catches clicks while keyboard-opened).
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // Keyboard: tabbing past the last link (or back before the trigger) closes.
  // relatedTarget null means the press went somewhere unfocusable (or a Safari
  // link click) — leave the panel mounted so the click can land; the pointer
  // listener above owns that close.
  function onBlurCapture(e: React.FocusEvent) {
    if (!open) return;
    const next = e.relatedTarget as Node | null;
    if (!next) return;
    if (wrapRef.current?.contains(next)) return;
    close();
  }

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
      onBlurCapture={onBlurCapture}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="explore-directory"
        onPointerDown={() => {
          focusFromPointer.current = true;
        }}
        onFocus={() => {
          if (focusFromPointer.current) {
            // A mouse click focuses first; the click handler owns the toggle.
            focusFromPointer.current = false;
            return;
          }
          if (suppressFocusOpen.current) {
            suppressFocusOpen.current = false;
            return;
          }
          openNow();
        }}
        onClick={() => {
          focusFromPointer.current = false;
          if (open) close();
          else openNow();
        }}
        className={`ea-focus-ring ${FOCUS_VISIBLE} ${MOTION_SAFE} inline-flex h-8 items-center gap-1 rounded-md px-3 text-[14px] font-medium text-[var(--text-2)] transition-colors duration-150 ease-standard hover:text-[var(--text-1)]`}
      >
        Explore
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-150 ease-standard ${MOTION_SAFE} ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <nav
          ref={panelRef}
          id="explore-directory"
          aria-label="Directory"
          className="fixed inset-x-0 top-[var(--header-h)] z-40 border-b border-[var(--border)] bg-[var(--paper)] shadow-[var(--shadow-float)]"
        >
          <div className="mx-auto grid max-w-[var(--container)] grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid grid-cols-3 gap-8">
              {MEGA_MENU_COLUMNS.map((column) => (
                <div key={column.title}>
                  <p className="ea-overline mb-3">{column.title}</p>
                  <ul className="space-y-1">
                    {column.links.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={
                            isSectionActive(pathname, item.section) ? "page" : undefined
                          }
                          onMouseEnter={() => setTile(item.tile)}
                          onFocus={() => setTile(item.tile)}
                          className={`ea-focus-ring ${FOCUS_VISIBLE} ${MOTION_SAFE} -mx-3 block rounded-md px-3 py-2 transition-colors duration-150 ease-standard hover:bg-[var(--paper-deep)]`}
                        >
                          <span
                            className={`block text-[14px] font-medium ${
                              isSectionActive(pathname, item.section)
                                ? "text-[var(--accent)]"
                                : "text-[var(--text-1)]"
                            }`}
                          >
                            {item.label}
                          </span>
                          <span className="mt-1 block text-[13px] text-[var(--text-3)]">
                            {item.descriptor}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Crossfade tile: decorative mirror of the hovered link. */}
            <div
              aria-hidden="true"
              className="relative hidden aspect-[4/3] self-start overflow-hidden rounded-md bg-[var(--paper-deep)] lg:block"
            >
              {TILE_KEYS.map((key) => (
                <Image
                  key={key}
                  src={MENU_TILES[key]}
                  alt=""
                  fill
                  sizes="360px"
                  className={`ea-photo transition-opacity duration-200 ease-standard ${
                    tile === key ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
