"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Runs `reset` during render whenever the route changes, so an open menu or
 * overlay never survives a navigation.
 */
export function useRouteChangeReset(reset: () => void) {
  const pathname = usePathname();
  const [seen, setSeen] = useState(pathname);
  if (seen !== pathname) {
    setSeen(pathname);
    reset();
  }
  return pathname;
}
