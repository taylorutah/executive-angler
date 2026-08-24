"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Options = {
  open: boolean;
  containerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  /** Control to focus when the overlay closes. Defaults to whatever was focused before. */
  returnFocusTo?: RefObject<HTMLElement | null>;
};

/**
 * Escape-to-close, body scroll lock, and a Tab focus trap for the mobile
 * search overlay and the mobile nav sheet.
 */
export function useModalChrome({ open, containerRef, onClose, returnFocusTo }: Options) {
  useEffect(() => {
    if (!open) return;

    const container = containerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const returnTarget = returnFocusTo?.current ?? previouslyFocused;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(container?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement,
      );

    const raf = requestAnimationFrame(() => {
      const preferred =
        container?.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0];
      preferred?.focus();
    });

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = active ? container?.contains(active) : false;
      if (e.shiftKey && (!inside || active === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || active === last)) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      returnTarget?.focus?.();
    };
  }, [open, containerRef, onClose, returnFocusTo]);
}
