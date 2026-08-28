"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { POST_LOGIN_PATH } from "@/lib/auth-paths";

const fieldClass =
  "w-full rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-card)] px-4 py-3 font-ui text-[15px] text-[var(--ink)] placeholder:text-[var(--slate)] outline-none focus:border-[var(--action)]";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

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

  return (
    <div className="bg-[var(--paper)]">
      <div className="desk-sheet">
        <div className="desk-form">
          {success ? (
            <div className="space-y-4">
              <h1
                className="font-heading text-[32px] font-semibold leading-[36px] text-[var(--ink)]"
                style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
              >
                Password updated
              </h1>
              <p className="desk-dek-ui">
                Your password has been reset. Taking you to the desk…
              </p>
            </div>
          ) : !sessionReady ? (
            <div className="space-y-4">
              <h1
                className="font-heading text-[32px] font-semibold leading-[36px] text-[var(--ink)]"
                style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
              >
                Verifying your link
              </h1>
              <p className="desk-dek-ui">Please wait while we verify your reset token.</p>
              <p className="font-ui text-[13px] text-[var(--graphite)]">
                If this takes too long,{" "}
                <Link
                  href="/forgot-password"
                  className="hover-copper text-[var(--copper)] underline underline-offset-4"
                >
                  request a new link
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <h1
                className="font-heading text-[32px] font-semibold leading-[36px] text-[var(--ink)] sm:text-[48px] sm:leading-[56px]"
                style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
              >
                Set a new password
              </h1>
              <p className="desk-dek-ui mt-3">Choose a strong password for your account.</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="password" className="mb-1.5 block font-ui text-sm text-[var(--ink)]">
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={fieldClass}
                    placeholder="Min. 8 characters"
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="confirm" className="mb-1.5 block font-ui text-sm text-[var(--ink)]">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={fieldClass}
                    placeholder="Re-enter your password"
                  />
                </div>
                {error ? (
                  <p className="border border-[var(--border-rule)] bg-[var(--vellum)] px-4 py-2 font-ui text-sm text-[var(--ink)]">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--action)] py-3 font-ui text-[14px] font-semibold text-[var(--on-action)] hover:bg-[var(--action-hover)] disabled:cursor-not-allowed"
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
