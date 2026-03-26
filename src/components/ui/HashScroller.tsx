"use client";

import { useEffect } from "react";

/**
 * Client component that scrolls to the URL hash target on mount.
 * Next.js App Router doesn't auto-scroll to hash anchors on page load.
 */
export default function HashScroller() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    // Small delay to let the page hydrate and render
    const timeout = setTimeout(() => {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
