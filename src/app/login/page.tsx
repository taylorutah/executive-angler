"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SITE_NAME } from "@/lib/constants";
import OAuthButtons from "@/components/ui/OAuthButtons";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
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
          <p className="mt-2 text-[#8B949E]">Sign in to your account.</p>
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
              <span className="bg-[#161B22] px-3 text-[#484F58] tracking-wider">or</span>
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
            {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-[#E8923A] text-white font-semibold rounded-lg hover:bg-[#0D1117] transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign In with Email"}
            </button>
          </form>

          <p className="text-center text-sm text-[#8B949E]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#E8923A] font-medium hover:text-[#E8923A]">Create one</Link>
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
