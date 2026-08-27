"use client";

import { useLayoutEffect, type ReactNode } from "react";

/** Removes a server-rendered browse fallback before paint once the client list mounts. */
export default function DismissBrowseFallback({
  fallbackId,
  children,
}: {
  fallbackId: string;
  children: ReactNode;
}) {
  useLayoutEffect(() => {
    document.getElementById(fallbackId)?.remove();
  }, [fallbackId]);

  return children;
}
