"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";

interface Props {
  redirectTo?: string;
}

/** Willow type actions — not full-width social slabs. */
export default function OAuthButtons({ redirectTo = "/" }: Props) {
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signInWith(provider: "google" | "apple") {
    setLoading(provider);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      console.error(`[OAUTH ERROR] ${provider}:`, error.message);
      setError(
        error.message.includes("missing OAuth secret")
          ? `${provider === "apple" ? "Apple" : "Google"} Sign-In is not yet available. Use email instead.`
          : error.message,
      );
      setLoading(null);
    }
  }

  const action =
    "ea-focus-ring inline-flex items-center bg-[var(--accent-soft)] px-3.5 py-2 font-ui text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--accent)] disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {error && (
        <p className="basis-full text-sm text-[var(--danger)]">{error}</p>
      )}
      <button
        type="button"
        onClick={() => signInWith("google")}
        disabled={!!loading}
        className={`${FOCUS_VISIBLE} ${action}`}
      >
        {loading === "google" ? "Google…" : "Google"}
      </button>
      <span aria-hidden className="font-ui text-[12px] text-[var(--text-3)]">
        ·
      </span>
      <button
        type="button"
        onClick={() => signInWith("apple")}
        disabled={!!loading}
        className={`${FOCUS_VISIBLE} ${action}`}
      >
        {loading === "apple" ? "Apple…" : "Apple"}
      </button>
    </div>
  );
}
