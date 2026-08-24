"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { EXPLORE_ITEMS, FOCUS_VISIBLE, isSectionActive } from "./links";
import { useRouteChangeReset } from "./useRouteChangeReset";

/**
 * The only dropdown in the bar. It holds the utility routes that would
 * otherwise crowd the four nouns.
 */
export default function ExploreMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useRouteChangeReset(() => setOpen(false));

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>("a") ?? []);
      if (!items.length) return;
      const current = items.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      const next =
        e.key === "ArrowDown"
          ? items[(current + 1 + items.length) % items.length]
          : items[(current - 1 + items.length) % items.length];
      next?.focus();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className={`ea-focus-ring ${FOCUS_VISIBLE} inline-flex h-9 items-center gap-1 rounded-md px-2.5 text-[15px] text-[var(--text-body)] transition-colors duration-[120ms] ease-out hover:text-[var(--text-primary)]`}
      >
        Explore
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div
          ref={listRef}
          role="menu"
          aria-label="Explore"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] py-1 shadow-xl"
        >
          {EXPLORE_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              aria-current={isSectionActive(pathname, item.section) ? "page" : undefined}
              className={`ea-focus-ring ${FOCUS_VISIBLE} block px-4 py-2.5 text-[14px] text-[var(--text-body)] transition-colors duration-[120ms] ease-out hover:bg-[var(--surface-page)] hover:text-[var(--text-primary)] aria-[current=page]:text-[var(--text-primary)]`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
