"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import OAuthButtons from "@/components/ui/OAuthButtons";
import TurnstileWidget from "@/components/ui/TurnstileWidget";
import { Button } from "@/components/ui/Button";

const TURNSTILE_SITE_KEY = "0x4AAAAAAACzmkL0lBFlfTsxp";

const fieldClass =
  "w-full rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-card)] px-4 py-3 font-ui text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-meta)] outline-none focus:border-[var(--action)]";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

interface Props {
  next: string | null;
}

export default function SignupForm({ next }: Props) {
  const router = useRouter();
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
        setUsernameMessage(`${clean} is available`);
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
    if (!canSubmit) {
      if (!fullName.trim()) setError("Enter your name.");
      else if (!email.trim()) setError("Enter your email.");
      else if (password.length < 8) setError("Password must be at least 8 characters.");
      else if (username.trim() !== "" && usernameStatus === "checking") {
        setError("Checking that username…");
      } else if (username.trim() !== "" && usernameStatus !== "available") {
        setError(usernameMessage || "Choose a different username.");
      } else if (!captchaResolved) {
        setError("Wait a moment for verification, then try again.");
      }
      return;
    }
    setError("");
    setLoading(true);
    const supabase = createClient();
    const name = fullName.trim();
    const cleanUsername = username.trim().toLowerCase();

    const emailRedirectTo = next
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : `${window.location.origin}/auth/callback`;

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

    if (cleanUsername && usernameStatus === "available") {
      await supabase.from("profiles").upsert(
        { user_id: authData.user.id, display_name: name, username: cleanUsername },
        { onConflict: "user_id" },
      );
    } else {
      await supabase.from("profiles").upsert(
        { user_id: authData.user.id, display_name: name },
        { onConflict: "user_id" },
      );
    }

    if (next) {
      router.push(postSignupRedirect);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  const usernameBorder =
    usernameStatus === "available"
      ? "border-[var(--state-positive)]"
      : usernameStatus === "taken" || usernameStatus === "invalid"
        ? "border-[var(--state-negative)]"
        : "border-[var(--border-rule)]";

  const usernameMessageColor =
    usernameStatus === "available"
      ? "text-[var(--state-positive)]"
      : usernameStatus === "taken" || usernameStatus === "invalid"
        ? "text-[var(--state-negative)]"
        : "text-[var(--text-meta)]";

  if (success) {
    const firstName = fullName.trim().split(" ")[0];
    return (
      <div className="mt-8 space-y-5">
        <h2 className="font-heading text-2xl font-semibold text-[var(--text-primary)]">
          Welcome, {firstName}
        </h2>
        <p className="font-ui text-[15px] text-[var(--text-body)]">
          Your account is ready. Start logging sessions, exploring rivers, and building your fly box.
        </p>
        <Button href="/journal" variant="solid" size="lg" fullWidth>
          Go to your journal
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      <OAuthButtons redirectTo={postSignupRedirect} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border-rule)]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[var(--paper)] px-3 font-ui tracking-wider text-[var(--text-meta)]">
            or
          </span>
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block font-ui text-sm text-[var(--text-primary)]">
            Your name
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
                  .split(/\s+/)
                  .join("_")
                  .replace(/[^a-z0-9_]/g, "")
                  .slice(0, 20);
                setUsername(suggested);
                triggerUsernameCheck(suggested);
              }
            }}
            className={fieldClass}
            placeholder="John Smith"
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="username" className="mb-1.5 block font-ui text-sm text-[var(--text-primary)]">
            Username{" "}
            <span className="font-normal text-[var(--text-meta)]">· optional</span>
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsernameEdited(true);
              setUsername(e.target.value);
              triggerUsernameCheck(e.target.value);
            }}
            className={`${fieldClass} ${usernameBorder}`}
            placeholder="yourhandle"
            autoComplete="username"
            autoCapitalize="none"
          />
          <p className={`mt-1 font-ui text-xs ${usernameMessageColor}`}>
            {usernameMessage || "Skip to use your name publicly, or set a handle like john_smith"}
          </p>
        </div>

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
          <label htmlFor="password" className="mb-1.5 block font-ui text-sm text-[var(--text-primary)]">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
            placeholder="At least 8 characters"
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

        <Button type="submit" disabled={loading} variant="solid" size="lg" fullWidth loading={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="font-ui text-sm text-[var(--text-body)]">
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="hover-copper text-[var(--action)] underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
