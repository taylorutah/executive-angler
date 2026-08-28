"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

const fieldClass =
  "w-full rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-card)] px-4 py-3 font-ui text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-meta)] outline-none focus:border-[var(--action)]";

export default function ForgotPasswordForm() {
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

  if (sent) {
    return (
      <div className="mt-8 space-y-5">
        <h2 className="font-heading text-2xl font-semibold text-[var(--text-primary)]">
          Check your email
        </h2>
        <p className="font-ui text-[15px] text-[var(--text-body)]">
          We sent a password reset link to{" "}
          <span className="font-medium text-[var(--text-primary)]">{email}</span>.
          Click the link in the email to reset your password.
        </p>
        <p className="font-ui text-sm text-[var(--text-meta)]">
          Didn&apos;t receive it? Check your spam folder, or{" "}
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setError("");
            }}
            className="hover-copper text-[var(--action)] underline underline-offset-4"
          >
            try again
          </button>
          .
        </p>
        <Link
          href="/login"
          className="hover-copper inline-block font-ui text-sm text-[var(--action)] underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
          autoFocus
        />
      </div>

      {error && (
        <p className="border border-[var(--border-rule)] bg-[var(--surface-raised)] px-4 py-2 font-ui text-sm text-[var(--text-primary)]">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} variant="solid" size="lg" fullWidth loading={loading}>
        {loading ? "Sending…" : "Send reset link"}
      </Button>

      <p className="font-ui text-sm text-[var(--text-body)]">
        <Link href="/login" className="hover-copper text-[var(--action)] underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
