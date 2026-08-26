"use client";

import { useEffect, useState } from "react";
import { X } from "@/icons";
import { APP_STORE_URL } from "@/lib/constants";

const BANNER_HEIGHT = 56; // px
const DISMISSED_KEY = "ea_app_banner_dismissed";

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  // Detect iPhone/iPad — covers iOS Safari, Chrome, Firefox on iOS
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandaloneApp(): boolean {
  // Already running as installed PWA or native app webview
  return typeof window !== "undefined" &&
    (("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true) ||
      window.matchMedia("(display-mode: standalone)").matches);
}

export default function AppBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIOS() || isStandaloneApp()) return;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;
    setVisible(true);
    document.documentElement.style.setProperty("--app-banner-height", `${BANNER_HEIGHT}px`);
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
    document.documentElement.style.removeProperty("--app-banner-height");
  }

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] flex items-center gap-3 px-3 border-b border-[var(--border-rule)]"
      style={{ height: BANNER_HEIGHT, background: "#0D1117" }}
    >
      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss app banner"
        className="flex-shrink-0 p-1 text-[var(--text-meta)] hover:text-[var(--text-body)] transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      {/* App icon — actual iOS app icon */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/apple-touch-icon.png"
        alt="Executive Angler"
        width={36}
        height={36}
        className="flex-shrink-0 rounded-[9px]"
      />

      {/* App info */}
      <div className="flex-1 min-w-0">
        <p className="text-[var(--text-primary)] text-[13px] font-semibold leading-tight truncate">Executive Angler</p>
        <p className="text-[var(--text-meta)] text-[11px] leading-tight truncate font-['IBM_Plex_Mono']">
          Free · Fly Fishing Intelligence
        </p>
      </div>

      {/* GET button */}
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={dismiss}
        className="flex-shrink-0 px-4 py-1.5 bg-[var(--action)] text-white text-[13px] font-bold rounded-full hover:bg-[#d17d28] transition-colors tracking-wide"
      >
        GET
      </a>
    </div>
  );
}
