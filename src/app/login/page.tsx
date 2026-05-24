"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SITE_NAME } from "@/lib/constants";
import OAuthButtons from "@/components/ui/OAuthButtons";
import TurnstileWidget from "@/components/ui/TurnstileWidget";
import { Button } from "@/components/ui/Button";

const TURNSTILE_SITE_KEY = "0x4AAAAAAACzmkL0lBFlfTsxp";

// Prevents open-redirect: only allow same-origin path redirects.
function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  // See signup/page.tsx for the fail-open rationale.
  const [captchaResolved, setCaptchaResolved] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  // `next` is the canonical name (matches auth/callback); `redirect` kept as
  // a legacy fallback so existing links don't break.
  const redirect =
    safeNext(searchParams.get("next")) ??
    safeNext(searchParams.get("redirect")) ??
    "/dashboard";
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
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-heading text-3xl font-bold text-[#E8923A]">
            {SITE_NAME}
          </Link>
          <p className="mt-2 text-[#A8B2BD]">Sign in to your account.</p>
        </div>

        <div className="bg-[#161B22] rounded-xl shadow-md p-8 space-y-5">
          {/* OAuth error from callback */}
          {authErrorMessage && (
            <p className="text-sm text-red-400 bg-red-950/40 px-4 py-2 rounded-lg border border-red-900 text-center">
              {authErrorMessage}
            </p>
          )}

          {/* OAuth */}
          <OAuthButtons redirectTo={redirect} />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#21262D]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#161B22] px-3 text-[#6E7681] tracking-wider">or</span>
            </div>
          </div>

          {/* Email/password */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#F0F6FC] mb-1">Email</label>
              <input
                id="email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#21262D] focus:ring-2 focus:ring-[#E8923A] focus:border-[#E8923A] text-[#F0F6FC]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-[#F0F6FC]">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#E8923A] hover:text-[#F0F6FC] transition-colors">Forgot password?</Link>
              </div>
              <input
                id="password" type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#21262D] focus:ring-2 focus:ring-[#E8923A] focus:border-[#E8923A] text-[#F0F6FC]"
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
            {error && <p className="text-sm text-red-400 bg-red-950/40 px-4 py-2 rounded-lg border border-red-900">{error}</p>}
            <Button
              type="submit"
              disabled={loading || !captchaResolved}
              variant="solid"
              size="lg"
              fullWidth
              loading={loading}
              noUpper
            >
              {loading ? "Signing in…" : "Sign In with Email"}
            </Button>
          </form>

          <p className="text-center text-sm text-[#A8B2BD]">
            Don&apos;t have an account?{" "}
            <Link
              href={redirect !== "/dashboard" ? `/signup?next=${encodeURIComponent(redirect)}` : "/signup"}
              className="text-[#E8923A] font-medium hover:text-[#E8923A]"
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
    <Suspense fallback={<div className="min-h-screen bg-[#0D1117] flex items-center justify-center"><div className="animate-pulse text-[#E8923A]">Loading…</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
