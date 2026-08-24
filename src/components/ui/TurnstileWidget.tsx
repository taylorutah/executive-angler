"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cloudflare Turnstile CAPTCHA widget — resilient build.
 *
 * - Loads the Turnstile script manually (next/script with afterInteractive
 *   has been flaky under Turbopack dev; this direct append is deterministic).
 * - Renders explicitly once the script is ready; retries on script-load
 *   failures (e.g. slow networks, flaky third-party DNS).
 * - Fail-open: if no token after `failOpenAfterMs`, signals parent via
 *   `onAvailabilityChange(false)` so callers can unlock the submit button
 *   rather than trapping legitimate users behind a broken CAPTCHA.
 */

interface Props {
  siteKey: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
  /**
   * Called with `true` once the widget has a token, `false` if the widget
   * never produces one within `failOpenAfterMs`. Callers can use this to
   * enable "submit anyway" fallbacks.
   */
  onAvailabilityChange?: (available: boolean) => void;
  /** ms to wait before declaring the widget broken. Default 6000. */
  failOpenAfterMs?: number;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "dark" | "light" | "auto";
          size?: "normal" | "compact" | "flexible";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export default function TurnstileWidget({
  siteKey,
  onToken,
  onExpire,
  onAvailabilityChange,
  failOpenAfterMs = 6000,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [failedOpen, setFailedOpen] = useState(false);

  // Load the Turnstile script manually. next/script under Turbopack dev
  // has been flaky (emits only a preload link in some cases), so we inject
  // the <script> tag directly to guarantee a deterministic load.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.turnstile) {
      setScriptReady(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="${TURNSTILE_SRC.split("?")[0]}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => setScriptReady(true));
      if (window.turnstile) setScriptReady(true);
      return;
    }
    const s = document.createElement("script");
    s.src = TURNSTILE_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => setScriptReady(true);
    s.onerror = () => {
      // Content blockers (uBlock, 1Blocker) and some iOS Safari Private
      // Browsing sessions outright block challenges.cloudflare.com. Flip to
      // fail-open immediately so the user isn't forced to stare at a dead
      // widget for 6 seconds.
      console.warn("[TurnstileWidget] script load failed");
      setFailedOpen(true);
    };
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!scriptReady || !containerRef.current) return;
    if (widgetIdRef.current) return;
    if (!window.turnstile) return;

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          setHasToken(true);
          onToken(token);
        },
        "expired-callback": () => {
          setHasToken(false);
          onToken("");
          onExpire?.();
        },
        "error-callback": () => {
          setHasToken(false);
          onToken("");
        },
        theme: "dark",
        size: "flexible",
      });
    } catch (err) {
      console.warn("[TurnstileWidget] render failed:", err);
    }
  }, [scriptReady, siteKey, onToken, onExpire]);

  // Notify parent when token state changes.
  useEffect(() => {
    onAvailabilityChange?.(hasToken);
  }, [hasToken, onAvailabilityChange]);

  // Fail-open timer: if no token after N ms, signal parent to unblock.
  useEffect(() => {
    if (hasToken || failedOpen) return;
    const t = setTimeout(() => {
      setFailedOpen(true);
      onAvailabilityChange?.(false);
    }, failOpenAfterMs);
    return () => clearTimeout(t);
  }, [hasToken, failedOpen, failOpenAfterMs, onAvailabilityChange]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="mt-2" />
      {failedOpen && !hasToken && (
        <p className="mt-2 text-xs text-[var(--text-meta)]">
          Having trouble with verification? You can still submit — we&apos;ll
          verify on the server.
        </p>
      )}
    </>
  );
}
