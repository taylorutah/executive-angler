"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Cloudflare Turnstile invisible/managed CAPTCHA widget.
 * Renders the challenge and calls onToken with the verification token.
 *
 * Usage:
 *   <TurnstileWidget siteKey="0x4AAA..." onToken={setToken} />
 */

interface Props {
  siteKey: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
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
          theme?: "dark" | "light" | "auto";
          size?: "normal" | "compact" | "flexible";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export default function TurnstileWidget({ siteKey, onToken, onExpire }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoadedRef = useRef(false);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onToken,
      "expired-callback": onExpire || (() => onToken("")),
      theme: "dark",
      size: "flexible",
    });
  }, [siteKey, onToken, onExpire]);

  useEffect(() => {
    // Load Turnstile script if not already loaded
    if (!scriptLoadedRef.current && !document.querySelector('script[src*="turnstile"]')) {
      scriptLoadedRef.current = true;
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => renderWidget();
      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    } else {
      // Script is loading, wait for it
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          renderWidget();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [renderWidget]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="mt-2" />;
}
