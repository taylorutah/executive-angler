"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import OAuthButtons from "@/components/ui/OAuthButtons";
import TurnstileWidget from "@/components/ui/TurnstileWidget";
import { Button } from "@/components/ui/Button";
import { POST_LOGIN_PATH } from "@/lib/auth-paths";

const TURNSTILE_SITE_KEY = "0x4AAAAAAACzmkL0lBFlfTsxp";

const fieldClass =
  "w-full rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-card)] px-4 py-3 font-ui text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-meta)] outline-none focus:border-[var(--action)]";

interface Props {
  redirect: string;
  authError: string | null;
}

export default function LoginForm({ redirect, authError }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResolved, setCaptchaResolved] = useState(false);

  const authErrorMessage =
    authError === "auth_failed" || authError === "auth_callback_failed"
      ? "Sign-in failed. Please try again."
      : null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    window.location.href = redirect;
  }

  return (
    <div className="mt-8 space-y-5">
      {authErrorMessage && (
        <p className="border border-[var(--border-rule)] bg-[var(--surface-raised)] px-4 py-2 text-center font-ui text-sm text-[var(--text-primary)]">
          {authErrorMessage}
        </p>
      )}

      <OAuthButtons redirectTo={redirect} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border-rule)]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[var(--surface-page)] px-3 font-ui tracking-wider text-[var(--text-meta)]">
            or
          </span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block font-ui text-sm text-[var(--text-primary)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="font-ui text-sm text-[var(--text-primary)]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="hover-copper text-xs text-[var(--action)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
            placeholder="Your password"
          />
        </div>
        <TurnstileWidget
          siteKey={TURNSTILE_SITE_KEY}
          onToken={setCaptchaToken}
          onAvailabilityChange={(available) => {
            setCaptchaResolved(true);
            if (!available) setCaptchaToken("");
          }}
        />
        {error && (
          <p className="border border-[var(--border-rule)] bg-[var(--surface-raised)] px-4 py-2 font-ui text-sm text-[var(--text-primary)]">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={loading || !captchaResolved}
          variant="solid"
          size="lg"
          fullWidth
          loading={loading}
        >
          {loading ? "Signing in…" : "Sign In with Email"}
        </Button>
      </form>

      <p className="font-ui text-sm text-[var(--text-body)]">
        Don&apos;t have an account?{" "}
        <Link
          href={redirect !== POST_LOGIN_PATH ? `/signup?next=${encodeURIComponent(redirect)}` : "/signup"}
          className="hover-copper text-[var(--action)] hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
