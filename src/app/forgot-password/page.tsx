"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SITE_NAME } from "@/lib/constants";
import { ArrowLeft, Mail, CheckCircle } from "@/icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl font-semibold text-[var(--accent)]">
            {SITE_NAME}
          </Link>
        </div>

        <div className="ea-card">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-[var(--radius-card)] bg-[var(--accent-soft)] flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-[var(--accent)]" />
              </div>
              <h1 className="font-display text-2xl font-semibold text-[var(--text-1)]">Check your email</h1>
              <p className="text-sm text-[var(--text-2)] leading-relaxed">
                We sent a password reset link to{" "}
                <span className="text-[var(--text-1)] font-medium">{email}</span>.
                Click the link in the email to reset your password.
              </p>
              <p className="text-xs text-[var(--text-3)]">
                Didn&apos;t receive it? Check your spam folder, or{" "}
                <button
                  onClick={() => { setSent(false); setError(""); }}
                  className="text-[var(--accent)] hover:underline"
                >
                  try again
                </button>
                .
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors duration-150 ease-standard mt-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-[var(--radius-card)] bg-[var(--accent-soft)] flex items-center justify-center mb-4">
                  <Mail className="h-7 w-7 text-[var(--accent)]" />
                </div>
                <h1 className="font-display text-2xl font-semibold text-[var(--text-1)]">Reset your password</h1>
                <p className="text-sm text-[var(--text-2)] mt-1">
                  Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="ea-label">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="ea-input"
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>

                {error && (
                  <p className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 px-4 py-3 rounded-[var(--radius-md)] border border-[var(--danger)]/30">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="ea-btn ea-btn-primary ea-btn-lg w-full"
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors duration-150 ease-standard"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
