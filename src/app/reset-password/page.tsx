"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SITE_NAME } from "@/lib/constants";
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
    if (pw.length < 6) return { label: "Weak", color: "bg-[var(--danger)]", width: "w-1/4" };
    if (pw.length < 8) return { label: "Fair", color: "bg-[var(--accent)]", width: "w-2/4" };
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const score = [hasUpper, hasNumber, hasSpecial, pw.length >= 12].filter(Boolean).length;
    if (score >= 3) return { label: "Strong", color: "bg-[var(--success)]", width: "w-full" };
    return { label: "Good", color: "bg-[var(--accent)]", width: "w-3/4" };
  };

  const strength = getStrength(password);

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl font-semibold text-[var(--accent)]">
            {SITE_NAME}
          </Link>
        </div>

        <div className="ea-card">
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-[var(--radius-card)] bg-[var(--success)]/10 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-[var(--success)]" />
              </div>
              <h1 className="font-display text-2xl font-semibold text-[var(--text-1)]">Password updated</h1>
              <p className="text-sm text-[var(--text-2)]">
                Your password has been reset successfully. Redirecting to your dashboard…
              </p>
              <div className="flex justify-center">
                <div className="h-1 w-24 bg-[var(--paper-deep)] rounded-[var(--radius-sm)] overflow-hidden">
                  <div className="h-full w-full bg-[var(--accent)]" />
                </div>
              </div>
            </div>
          ) : !sessionReady ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-[var(--radius-card)] bg-[var(--accent-soft)] flex items-center justify-center">
                <Lock className="h-7 w-7 text-[var(--accent)] animate-pulse" />
              </div>
              <h1 className="font-display text-2xl font-semibold text-[var(--text-1)]">Verifying your link…</h1>
              <p className="text-sm text-[var(--text-2)]">
                Please wait while we verify your reset token.
              </p>
              <p className="text-xs text-[var(--text-3)]">
                If this takes too long,{" "}
                <Link href="/forgot-password" className="text-[var(--accent)] hover:underline">
                  request a new link
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-[var(--radius-card)] bg-[var(--accent-soft)] flex items-center justify-center mb-4">
                  <Lock className="h-7 w-7 text-[var(--accent)]" />
                </div>
                <h1 className="font-display text-2xl font-semibold text-[var(--text-1)]">Set new password</h1>
                <p className="text-sm text-[var(--text-2)] mt-1">
                  Choose a strong password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="ea-label">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="ea-input pr-12"
                      placeholder="Min. 8 characters"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors duration-150 ease-standard"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 bg-[var(--paper-deep)] rounded-[var(--radius-sm)] overflow-hidden">
                        <div className={`h-full ${strength.color} ${strength.width} transition-all duration-200 ease-standard rounded-[var(--radius-sm)]`} />
                      </div>
                      <p className="text-xs text-[var(--text-3)]">{strength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm" className="ea-label">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`ea-input ${
                      confirmPassword.length > 0 && confirmPassword !== password
                        ? "border-[var(--danger)]"
                        : confirmPassword.length > 0 && confirmPassword === password
                        ? "border-[var(--success)]"
                        : ""
                    }`}
                    placeholder="Re-enter your password"
                  />
                  {confirmPassword.length > 0 && confirmPassword === password && (
                    <p className="ea-field-helper text-[var(--success)] flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Passwords match
                    </p>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 px-4 py-3 rounded-[var(--radius-md)] border border-[var(--danger)]/30">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || password.length < 8 || password !== confirmPassword}
                  className="ea-btn ea-btn-primary ea-btn-lg w-full"
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
