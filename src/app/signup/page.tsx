"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SITE_NAME } from "@/lib/constants";
import OAuthButtons from "@/components/ui/OAuthButtons";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); return; }
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
            <Link href="/" className="mt-6 inline-block px-6 py-3 bg-[#E8923A] text-white font-medium rounded-lg hover:bg-[#E8923A]-dark transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              <label htmlFor="password" className="block text-sm font-medium text-[#F0F6FC] mb-1">Password</label>
              <input
                id="password" type="password" required minLength={8} value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#21262D] focus:ring-2 focus:ring-[#E8923A] focus:border-[#E8923A] text-[#F0F6FC]"
                placeholder="At least 8 characters"
              />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-[#E8923A] text-white font-semibold rounded-lg hover:bg-[#E8923A]-dark transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-[#8B949E]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#E8923A] font-medium hover:text-[#E8923A]">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
