"use client";

import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FOCUS_VISIBLE } from "./links";

export const MAIN_CONTENT_ID = "main-content";

function ensureMainId() {
  const existing = document.getElementById(MAIN_CONTENT_ID);
  if (existing instanceof HTMLElement) return existing;
  const main = document.querySelector("main");
  if (main instanceof HTMLElement) {
    if (!main.id) main.id = MAIN_CONTENT_ID;
    return main;
  }
  return null;
}

function skipToMain(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  const main = ensureMainId();
  if (!main) return;
  if (!main.hasAttribute("tabindex")) main.tabIndex = -1;
  main.focus({ preventScroll: false });
  main.scrollIntoView({ block: "start" });
}

/**
 * First tab stop on every page. Header.tsx cannot take this (Lane E owns it),
 * so we portal in front of the React root. Visible only on focus.
 *
 * Lane E should still mount this as the first child of <header> and put
 * id="main-content" on <main> — see docs/decisions/p4-u2-cross-lane.md.
 */
export default function SkipLink() {
  const [mount, setMount] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    ensureMainId();
    const host = document.createElement("div");
    host.setAttribute("data-ea-skip-host", "");
    document.body.prepend(host);
    setMount(host);
    return () => {
      host.remove();
    };
  }, []);

  if (!mount) return null;

  return createPortal(
    <a
      href={`#${MAIN_CONTENT_ID}`}
      onClick={skipToMain}
      className={`ea-skip-link ea-focus-ring ${FOCUS_VISIBLE} sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-[var(--surface-page)] focus:px-3 focus:py-2 focus:text-[14px] focus:font-medium focus:text-[var(--text-primary)] focus:shadow-lg`}
    >
      Skip to content
    </a>,
    mount,
  );
}
