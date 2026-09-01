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
    "ea-focus-ring font-ui text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--accent)] disabled:opacity-50";

  return (
    <p className="font-ui text-[12px] uppercase tracking-[0.12em] text-[var(--ink)]">
      {error && (
        <span className="mb-2 block normal-case tracking-normal text-[var(--danger)]">{error}</span>
      )}
      <button
        type="button"
        onClick={() => signInWith("google")}
        disabled={!!loading}
        className={`${FOCUS_VISIBLE} ${action}`}
      >
        {loading === "google" ? "Google…" : "Google"}
      </button>
      <span aria-hidden> · </span>
      <button
        type="button"
        onClick={() => signInWith("apple")}
        disabled={!!loading}
        className={`${FOCUS_VISIBLE} ${action}`}
      >
        {loading === "apple" ? "Apple…" : "Apple"}
      </button>
    </p>
  );
}
