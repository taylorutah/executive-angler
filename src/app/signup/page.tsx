"use client";

import { Suspense, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import OAuthButtons from "@/components/ui/OAuthButtons";
import TurnstileWidget from "@/components/ui/TurnstileWidget";
import { Button } from "@/components/ui/Button";
import { CheckCircle } from "@/icons";
import { safeInternalPath } from "@/lib/auth-paths";

const TURNSTILE_SITE_KEY = "0x4AAAAAAACzmkL0lBFlfTsxp";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeInternalPath(searchParams.get("next"));
  const postSignupRedirect = next || "/journal";

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  // Turnstile "fail-open" signal: true when the widget has produced a token
  // OR enough time has passed that we've decided verification is unavailable
  // (network block, flaky script, etc). Either way, unlock the submit button
  // so legitimate users aren't stuck. Supabase still validates server-side.
  const [captchaResolved, setCaptchaResolved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function triggerUsernameCheck(value: string) {
    const clean = value.trim().toLowerCase();
    if (!clean || clean.length < 3) {
      setUsernameStatus(clean.length === 0 ? "idle" : "invalid");
      setUsernameMessage(clean.length === 0 ? "" : "At least 3 characters");
      return;
    }
    const formatError = /^[a-z0-9_]+$/.test(clean) ? null : "Letters, numbers, and underscores only";
    if (formatError) {
      setUsernameStatus("invalid");
      setUsernameMessage(formatError);
      return;
    }

    setUsernameStatus("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("username", clean)
        .maybeSingle();
      if (data) {
        setUsernameStatus("taken");
        setUsernameMessage(`${clean} is already taken — try a different one`);
      } else {
        setUsernameStatus("available");
        setUsernameMessage(`${clean} is available ✓`);
      }
    }, 600);
  }

  const canSubmit =
    fullName.trim() !== "" &&
    email.trim() !== "" &&
    password.length >= 8 &&
    captchaResolved &&
    (username.trim() === "" || usernameStatus === "available") &&
    !loading;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    const supabase = createClient();
    const name = fullName.trim();
    const cleanUsername = username.trim().toLowerCase();

    // Thread `next` through email confirmation: Supabase will append `code` to
    // emailRedirectTo, so the query string we set is preserved.
    const emailRedirectTo = next
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : `${window.location.origin}/auth/callback`;

    // Server-side preflight: rate-limit per IP, verify Turnstile fail-closed,
    // block disposable email domains, reject Gmail dot-trick collisions.
    // Only if this returns ok do we let Supabase create the account.
    try {
      const preflight = await fetch("/api/auth/preflight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, captchaToken }),
      });
      if (!preflight.ok) {
        const data = (await preflight.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Signup blocked. Please try again.");
        setLoading(false);
        return;
      }
    } catch {
      setError("Could not reach the signup service. Try again in a moment.");
      setLoading(false);
      return;
    }

    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        captchaToken,
        data: { display_name: name },
      },
    });
    if (signupError || !authData.user) {
      setError(signupError?.message ?? "Signup failed");
      setLoading(false);
      return;
    }

    // Upsert profiles — include username only if provided and available
    if (cleanUsername && usernameStatus === "available") {
      await supabase.from("profiles").upsert(
        { user_id: authData.user.id, display_name: name, username: cleanUsername },
        { onConflict: "user_id" }
      );
    } else {
      await supabase.from("profiles").upsert(
        { user_id: authData.user.id, display_name: name },
        { onConflict: "user_id" }
      );
    }

    // If the user was mid-flow on another page (e.g. /redeem?code=REDDIT30),
    // jump them straight back rather than showing the generic welcome card.
    if (next) {
      router.push(postSignupRedirect);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  const usernameBorder =
    usernameStatus === "available"
      ? "border-[var(--success)]"
      : usernameStatus === "taken" || usernameStatus === "invalid"
      ? "border-[var(--danger)]"
      : "";

  const usernameMessageColor =
    usernameStatus === "available"
      ? "text-[var(--success)]"
      : usernameStatus === "taken" || usernameStatus === "invalid"
      ? "text-[var(--danger)]"
      : "text-[var(--text-3)]";

  if (success) {
    const firstName = fullName.trim().split(" ")[0];
    return (
      <div className="bg-[var(--paper)] px-4 py-10">
        <div className="w-full max-w-md text-center">
          <div className="ea-card">
            <div className="mx-auto w-14 h-14 rounded-[var(--radius-card)] bg-[var(--accent-soft)] flex items-center justify-center mb-4">
              <CheckCircle className="h-7 w-7 text-[var(--accent)]" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-[var(--text-1)] mb-3">
              Welcome, {firstName}!
            </h2>
            <p className="text-[var(--text-2)]">
              Your account is ready. Start logging sessions, exploring rivers, and building your fly box.
            </p>
            <div className="mt-6">
              <Button href="/journal" variant="pill" size="lg">
                Go to Your Journal
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="desk-sheet bg-[var(--paper)] px-4 pb-16 pt-4">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-[var(--ink)]">
            Create account
          </h1>
          <p className="ea-dek mt-2">
            Keep a journal. It costs nothing.
          </p>
        </div>

        <div className="ea-card space-y-5">
          {/* OAuth — fastest path for new users */}
          <OAuthButtons redirectTo={postSignupRedirect} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="ea-overline bg-[var(--surface)] px-3">
                or sign up with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full name — primary identity */}
            <div>
              <label htmlFor="fullName" className="ea-label">
                Your Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (!usernameEdited) {
                    const suggested = e.target.value
                      .trim()
                      .toLowerCase()
                      .split(/\s+/).join("_")
                      .replace(/[^a-z0-9_]/g, "")
                      .slice(0, 20);
                    setUsername(suggested);
                    triggerUsernameCheck(suggested);
                  }
                }}
                className="ea-input"
                placeholder="John Smith"
                autoComplete="name"
              />
            </div>

            {/* Username — optional, auto-suggested from name */}
            <div>
              <label htmlFor="username" className="ea-label">
                Username{" "}
                <span className="text-[var(--text-3)] font-normal">· optional</span>
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsernameEdited(true);
                    setUsername(e.target.value);
                    triggerUsernameCheck(e.target.value);
                  }}
                  className={`ea-input ${usernameBorder} pr-10`}
                  placeholder="yourhandle"
                  autoComplete="username"
                  autoCapitalize="none"
                />
                {/* Status indicator */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === "checking" && (
                    <svg className="animate-spin h-4 w-4 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {usernameStatus === "available" && (
                    <svg className="h-4 w-4 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {(usernameStatus === "taken" || usernameStatus === "invalid") && (
                    <svg className="h-4 w-4 text-[var(--danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
              <p className={`ea-field-helper ${usernameMessageColor}`}>
                {usernameMessage || "Skip to use your name publicly, or set a handle like john_smith"}
              </p>
            </div>

            <div>
              <label htmlFor="email" className="ea-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ea-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="ea-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ea-input"
                placeholder="At least 8 characters"
              />
            </div>

            <TurnstileWidget
              siteKey={TURNSTILE_SITE_KEY}
              onToken={setCaptchaToken}
              onAvailabilityChange={(available) => {
                // Unlock submit as soon as we have EITHER a real token
                // (available=true) OR the fail-open timer fires
                // (called with false after the timeout expires).
                setCaptchaResolved(true);
                if (!available) setCaptchaToken("");
              }}
            />

            {error && (
              <p className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 px-4 py-3 rounded-[var(--radius-md)] border border-[var(--danger)]/30">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={!canSubmit}
              variant="pill"
              size="lg"
              fullWidth
              loading={loading}

            >
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-2)]">
            Already have an account?{" "}
            <Link
              href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
              className="text-[var(--accent)] font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[var(--paper)] px-4 py-10">
          <div className="animate-pulse text-[var(--accent)]">Loading…</div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
