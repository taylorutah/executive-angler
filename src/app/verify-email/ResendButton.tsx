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
      <p className="text-sm text-green-400 bg-green-950/30 border border-green-900 rounded-lg px-4 py-3">
        Sent — check your inbox.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={resend}
        disabled={state === "sending"}
        className="w-full py-3 bg-[var(--action)] text-white font-semibold rounded-lg hover:bg-[#cf7d30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === "sending" ? "Sending…" : "Resend confirmation email"}
      </button>
      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
