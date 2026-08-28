"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, CheckCircle, Eye, EyeOff } from "@/icons";
import { POST_LOGIN_PATH } from "@/lib/auth-paths";

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

    setTimeout(() => {
      router.push(POST_LOGIN_PATH);
    }, 3000);
  }

  // Strength indicator
  const getStrength = (pw: string): { label: string; color: string; width: string } => {
    if (pw.length === 0) return { label: "", color: "", width: "w-0" };
    if (pw.length < 6) return { label: "Weak", color: "bg-[var(--state-negative)]", width: "w-1/4" };
    if (pw.length < 8) return { label: "Fair", color: "bg-[var(--action)]", width: "w-2/4" };
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const score = [hasUpper, hasNumber, hasSpecial, pw.length >= 12].filter(Boolean).length;
    if (score >= 3) return { label: "Strong", color: "bg-green-500", width: "w-full" };
    return { label: "Good", color: "bg-[var(--signal-live)]", width: "w-3/4" };
  };

  const strength = getStrength(password);

  return (
    <div className="bg-[var(--paper)]">
      <div className="desk-sheet">
        <div className="desk-form">
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-green-500" />
              </div>
              <h1 className="font-heading text-[32px] font-semibold leading-[36px] text-[var(--text-primary)]">Password updated</h1>
              <p className="text-sm text-[var(--text-body)]">
                Your password has been reset successfully. Redirecting to your dashboard…
              </p>
              <div className="flex justify-center">
                <div className="h-1 w-24 bg-[var(--border-rule)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--action)] animate-[grow_3s_ease-in-out]" style={{ animation: "grow 3s ease-in-out forwards" }} />
                </div>
              </div>
            </div>
          ) : !sessionReady ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-[var(--action)]/10 flex items-center justify-center">
                <Lock className="h-7 w-7 text-[var(--action)] animate-pulse" />
              </div>
              <h1 className="font-heading text-[32px] font-semibold leading-[36px] text-[var(--text-primary)]">Verifying your link</h1>
              <p className="text-sm text-[var(--text-body)]">
                Please wait while we verify your reset token.
              </p>
              <p className="text-xs text-[var(--text-meta)]">
                If this takes too long,{" "}
                <Link href="/forgot-password" className="text-[var(--action)] hover:underline">
                  request a new link
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-[var(--action)]/10 flex items-center justify-center mb-4">
                  <Lock className="h-7 w-7 text-[var(--action)]" />
                </div>
                <h1 className="font-heading text-[32px] font-semibold leading-[36px] text-[var(--text-primary)]">Set a new password</h1>
                <p className="text-sm text-[var(--text-body)] mt-1">
                  Choose a strong password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--border-rule)] bg-[var(--surface-page)] focus:ring-2 focus:ring-[var(--action)] focus:border-[var(--action)] text-[var(--text-primary)] placeholder-[#6E7681]"
                      placeholder="Min. 8 characters"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-meta)] hover:text-[var(--text-body)] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 bg-[var(--border-rule)] rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`} />
                      </div>
                      <p className="text-xs text-[var(--text-meta)]">{strength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border bg-[var(--surface-page)] focus:ring-2 focus:ring-[var(--action)] focus:border-[var(--action)] text-[var(--text-primary)] placeholder-[#6E7681] ${
                      confirmPassword.length > 0 && confirmPassword !== password
                        ? "border-[var(--state-negative)]"
                        : confirmPassword.length > 0 && confirmPassword === password
                        ? "border-green-500"
                        : "border-[var(--border-rule)]"
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
                  <p className="text-sm text-[var(--state-negative)] bg-[var(--state-negative)]/10 px-4 py-2.5 rounded-lg">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-[2px] bg-[var(--action)] py-3 font-ui text-[14px] font-semibold text-[var(--on-action)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Updating…" : "Update password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
