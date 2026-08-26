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
    <div className="min-h-screen bg-[var(--surface-page)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-heading text-3xl font-bold text-[var(--action)]">
            {SITE_NAME}
          </Link>
        </div>

        <div className="bg-[var(--surface-raised)] rounded-xl shadow-md p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-[var(--action)]/10 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-[var(--action)]" />
              </div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Check your email</h1>
              <p className="text-sm text-[var(--text-body)] leading-relaxed">
                We sent a password reset link to{" "}
                <span className="text-[var(--text-primary)] font-medium">{email}</span>.
                Click the link in the email to reset your password.
              </p>
              <p className="text-xs text-[var(--text-meta)]">
                Didn&apos;t receive it? Check your spam folder, or{" "}
                <button
                  onClick={() => { setSent(false); setError(""); }}
                  className="text-[var(--action)] hover:underline"
                >
                  try again
                </button>
                .
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--text-body)] hover:text-[var(--text-primary)] transition-colors mt-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-[var(--action)]/10 flex items-center justify-center mb-4">
                  <Mail className="h-7 w-7 text-[var(--action)]" />
                </div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Reset your password</h1>
                <p className="text-sm text-[var(--text-body)] mt-1">
                  Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-rule)] bg-[var(--surface-page)] focus:ring-2 focus:ring-[var(--action)] focus:border-[var(--action)] text-[var(--text-primary)] placeholder-[#6E7681]"
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>

                {error && (
                  <p className="text-sm text-[var(--state-negative)] bg-[var(--state-negative)]/10 px-4 py-2.5 rounded-lg">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[var(--action)] text-white font-semibold rounded-lg hover:bg-[#d17d28] transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--text-body)] hover:text-[var(--text-primary)] transition-colors"
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
