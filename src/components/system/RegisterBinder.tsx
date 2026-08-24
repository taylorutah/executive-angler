"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { registerForPath } from "@/lib/register";

/** Keeps <html data-register> in sync after client navigations. */
export default function RegisterBinder() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    document.documentElement.setAttribute("data-register", registerForPath(pathname));
    document.documentElement.classList.remove("light-mode");
    try {
      localStorage.removeItem("ea-theme");
    } catch {
      /* private mode */
    }
  }, [pathname]);

  return null;
}
