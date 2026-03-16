"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SITE_NAME } from "@/lib/constants";
import OAuthButtons from "@/components/ui/OAuthButtons";

function validateUsernameFormat(u: string): string | null {
  if (!u) return null;
  if (u.length < 3) return "At least 3 characters";
  if (u.length > 30) return "Max 30 characters";
  if (!/^[a-z0-9_]+$/.test(u)) return "Letters, numbers, and underscores only";
  return null;
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced username availability check
  useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean) { setUsernameStatus("idle"); setUsernameMessage(""); return; }
    const formatError = validateUsernameFormat(clean);
    if (formatError) { setUsernameStatus("invalid"); setUsernameMessage(formatError); return; }

    setUsernameStatus("checking");
    setUsernameMessage("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("username", clean)
          .maybeSingle();
        if (data) {
          setUsernameStatus("taken");
          setUsernameMessage(`@${clean} is already taken`);
        } else {
          setUsernameStatus("available");
          setUsernameMessage(`@${clean} is available`);
        }
      } catch {
        setUsernameStatus("idle");
      }
    }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username]);

  const canSubmit =
    email.trim() !== "" &&
    password.length >= 8 &&
    username.trim() !== "" &&
    usernameStatus === "available" &&
    !loading;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    const supabase = createClient();
    const clean = username.trim().toLowerCase();

    // Double-check availability before submitting
    const { data: existing } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("username", clean)
      .maybeSingle();
    if (existing) {
      setError(`@${clean} was just taken. Choose a different username.`);
      setLoading(false);
      return;
    }

    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (signupError || !authData.user) {
      setError(signupError?.message ?? "Signup failed");
      setLoading(false);
      return;
    }

    // Insert profile row with username
    const displayName = email.split("@")[0];
    await supabase.from("profiles").upsert(
      { user_id: authData.user.id, username: clean, display_name: displayName },
      { onConflict: "user_id" }
    );

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md text-center">
          <div className="bg-[#161B22] rounded-xl shadow-md p-8">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-3">Check Your Email</h2>
            <p className="text-[#8B949E]">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
            </p>
            <p className="mt-3 text-sm text-[#8B949E]">
              Your username will be <span className="text-[#E8923A] font-medium">@{username.trim().toLowerCase()}</span>
            </p>
            <Link href="/" className="mt-6 inline-block px-6 py-3 bg-[#E8923A] text-white font-medium rounded-lg hover:bg-[#0D1117] transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const usernameBorder =
    usernameStatus === "available" ? "border-green-500 focus:ring-green-500 focus:border-green-500" :
    usernameStatus === "taken" || usernameStatus === "invalid" ? "border-red-500 focus:ring-red-500 focus:border-red-500" :
    "border-[#21262D] focus:ring-[#E8923A] focus:border-[#E8923A]";

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-heading text-3xl font-bold text-[#E8923A]">{SITE_NAME}</Link>
          <p className="mt-2 text-[#8B949E]">Create a free account to save favorites and log your sessions.</p>
        </div>

        <div className="bg-[#161B22] rounded-xl shadow-md p-8 space-y-5">
          {/* OAuth — fastest path for new users */}
          <OAuthButtons redirectTo="/journal" />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#21262D]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#161B22] px-3 text-[#484F58] tracking-wider">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Username — first so people pick their identity early */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#F0F6FC] mb-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E] select-none">@</span>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                  className={`w-full pl-8 pr-10 py-3 rounded-lg border bg-[#0D1117] text-[#F0F6FC] outline-none transition-colors ${usernameBorder}`}
                  placeholder="your_handle"
                  autoComplete="username"
                  maxLength={30}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                  {usernameStatus === "checking" && <span className="text-[#8B949E]">…</span>}
                  {usernameStatus === "available" && <span className="text-green-400">✓</span>}
                  {(usernameStatus === "taken" || usernameStatus === "invalid") && <span className="text-red-400">✗</span>}
                </span>
              </div>
              {usernameMessage && (
                <p className={`mt-1 text-xs ${usernameStatus === "available" ? "text-green-400" : "text-red-400"}`}>
                  {usernameMessage}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#F0F6FC] mb-1">Email</label>
              <input
                id="email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#21262D] bg-[#0D1117] focus:ring-2 focus:ring-[#E8923A] focus:border-[#E8923A] text-[#F0F6FC] outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#F0F6FC] mb-1">Password</label>
              <input
                id="password" type="password" required minLength={8} value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#21262D] bg-[#0D1117] focus:ring-2 focus:ring-[#E8923A] focus:border-[#E8923A] text-[#F0F6FC] outline-none"
                placeholder="At least 8 characters"
              />
            </div>

            {error && <p className="text-sm text-red-400 bg-red-950/40 px-4 py-2 rounded-lg border border-red-900">{error}</p>}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 bg-[#E8923A] text-white font-semibold rounded-lg hover:bg-[#cf7d30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-[#8B949E]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#E8923A] font-medium hover:text-[#cf7d30]">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
