"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SITE_NAME } from "@/lib/constants";
import { Lock, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase auto-exchanges the token from the email link for a session
  useEffect(() => {
    const supabase = createClient();
    // Listen for auth state change (PASSWORD_RECOVERY event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

    // Also check if we already have a session (user clicked link and session is established)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect to dashboard after a moment
    setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
  }

  // Strength indicator
  const getStrength = (pw: string): { label: string; color: string; width: string } => {
    if (pw.length === 0) return { label: "", color: "", width: "w-0" };
    if (pw.length < 6) return { label: "Weak", color: "bg-[#DA3633]", width: "w-1/4" };
    if (pw.length < 8) return { label: "Fair", color: "bg-[#E8923A]", width: "w-2/4" };
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const score = [hasUpper, hasNumber, hasSpecial, pw.length >= 12].filter(Boolean).length;
    if (score >= 3) return { label: "Strong", color: "bg-green-500", width: "w-full" };
    return { label: "Good", color: "bg-[#0BA5C7]", width: "w-3/4" };
  };

  const strength = getStrength(password);

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-heading text-3xl font-bold text-[#E8923A]">
            {SITE_NAME}
          </Link>
        </div>

        <div className="bg-[#161B22] rounded-xl shadow-md p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-[#F0F6FC]">Password updated</h1>
              <p className="text-sm text-[#8B949E]">
                Your password has been reset successfully. Redirecting to your dashboard…
              </p>
              <div className="flex justify-center">
                <div className="h-1 w-24 bg-[#21262D] rounded-full overflow-hidden">
                  <div className="h-full bg-[#E8923A] animate-[grow_3s_ease-in-out]" style={{ animation: "grow 3s ease-in-out forwards" }} />
                </div>
              </div>
            </div>
          ) : !sessionReady ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-[#E8923A]/10 flex items-center justify-center">
                <Lock className="h-7 w-7 text-[#E8923A] animate-pulse" />
              </div>
              <h1 className="text-xl font-bold text-[#F0F6FC]">Verifying your link…</h1>
              <p className="text-sm text-[#8B949E]">
                Please wait while we verify your reset token.
              </p>
              <p className="text-xs text-[#484F58]">
                If this takes too long,{" "}
                <Link href="/forgot-password" className="text-[#E8923A] hover:underline">
                  request a new link
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-[#E8923A]/10 flex items-center justify-center mb-4">
                  <Lock className="h-7 w-7 text-[#E8923A]" />
                </div>
                <h1 className="text-xl font-bold text-[#F0F6FC]">Set new password</h1>
                <p className="text-sm text-[#8B949E] mt-1">
                  Choose a strong password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#F0F6FC] mb-1">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-[#21262D] bg-[#0D1117] focus:ring-2 focus:ring-[#E8923A] focus:border-[#E8923A] text-[#F0F6FC] placeholder-[#484F58]"
                      placeholder="Min. 8 characters"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484F58] hover:text-[#8B949E] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 bg-[#21262D] rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`} />
                      </div>
                      <p className="text-xs text-[#484F58]">{strength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium text-[#F0F6FC] mb-1">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border bg-[#0D1117] focus:ring-2 focus:ring-[#E8923A] focus:border-[#E8923A] text-[#F0F6FC] placeholder-[#484F58] ${
                      confirmPassword.length > 0 && confirmPassword !== password
                        ? "border-[#DA3633]"
                        : confirmPassword.length > 0 && confirmPassword === password
                        ? "border-green-500"
                        : "border-[#21262D]"
                    }`}
                    placeholder="Re-enter your password"
                  />
                  {confirmPassword.length > 0 && confirmPassword === password && (
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Passwords match
                    </p>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-[#DA3633] bg-[#DA3633]/10 px-4 py-2.5 rounded-lg">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || password.length < 8 || password !== confirmPassword}
                  className="w-full py-3 bg-[#E8923A] text-white font-semibold rounded-lg hover:bg-[#d17d28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
