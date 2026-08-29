"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResendButton({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function resend() {
    if (!email) return;
    setState("sending");
    setError("");
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (resendError) {
      setState("error");
      setError(resendError.message);
      return;
    }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <p className="text-sm text-[var(--success)] bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-[var(--radius-md)] px-4 py-3">
        Sent — check your inbox.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={resend}
        disabled={state === "sending"}
        className="ea-btn ea-btn-primary ea-btn-lg w-full"
      >
        {state === "sending" ? "Sending…" : "Resend confirmation email"}
      </button>
      {error && (
        <p className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-[var(--radius-md)] px-4 py-3">
          {error}
        </p>
      )}
    </div>
  );
}
