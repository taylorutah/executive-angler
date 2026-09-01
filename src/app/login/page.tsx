"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import OAuthButtons from "@/components/ui/OAuthButtons";
import TurnstileWidget from "@/components/ui/TurnstileWidget";
import { Button } from "@/components/ui/Button";
import { POST_LOGIN_PATH, safeInternalPath } from "@/lib/auth-paths";

const TURNSTILE_SITE_KEY = "0x4AAAAAAACzmkL0lBFlfTsxp";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  // See signup/page.tsx for the fail-open rationale.
  const [captchaResolved, setCaptchaResolved] = useState(false);
  const searchParams = useSearchParams();
  // `next` is the canonical name (matches auth/callback); `redirect` kept as
  // a legacy fallback so existing links don't break.
  const redirect =
    safeInternalPath(searchParams.get("next")) ??
    safeInternalPath(searchParams.get("redirect")) ??
    POST_LOGIN_PATH;
  const authError = searchParams.get("error");

  // Show OAuth callback errors
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
    <div className="desk-sheet bg-[var(--paper)] px-4 pb-6 pt-4">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-[var(--ink)]">Sign in</h1>
          <p className="ea-dek mt-2">Keep a journal. The water will not keep it for you.</p>
        </div>

        <div className="ea-card space-y-5">
          {/* OAuth error from callback */}
          {authErrorMessage && (
            <p className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 px-4 py-3 rounded-[var(--radius-md)] border border-[var(--danger)]/30 text-center">
              {authErrorMessage}
            </p>
          )}

          {/* OAuth */}
          <OAuthButtons redirectTo={redirect} />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="ea-overline bg-[var(--surface)] px-3">or</span>
            </div>
          </div>

          {/* Email/password */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="ea-label">Email</label>
              <input
                id="email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ea-input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="ea-label mb-0">Password</label>
                <Link href="/forgot-password" className="text-xs text-[var(--accent)] hover:underline">Forgot password?</Link>
              </div>
              <input
                id="password" type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ea-input"
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
            {error && <p className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 px-4 py-3 rounded-[var(--radius-md)] border border-[var(--danger)]/30">{error}</p>}
            <Button
              type="submit"
              disabled={loading || !captchaResolved}
              variant="pill"
              size="lg"
              fullWidth
              loading={loading}

            >
              {loading ? "Signing in…" : "Sign In with Email"}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-2)]">
            Don&apos;t have an account?{" "}
            <Link
              href={redirect !== POST_LOGIN_PATH ? `/signup?next=${encodeURIComponent(redirect)}` : "/signup"}
              className="text-[var(--accent)] font-medium hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-[var(--paper)] px-4 py-10"><div className="animate-pulse text-[var(--accent)]">Loading…</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
