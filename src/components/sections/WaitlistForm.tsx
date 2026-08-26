"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "@/icons";

type State = "idle" | "loading" | "success" | "error";

export default function WaitlistForm({ initialCount = 0 }: { initialCount?: number }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [count, setCount] = useState(initialCount);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Try again.");
        setState("error");
        return;
      }

      setState("success");
      if (!data.already_joined) {
        setCount((c) => c + 1);
      }
    } catch {
      setErrorMsg("Network error. Check your connection and try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="bg-[var(--surface-raised)] border border-[#3FB950]/30 rounded-2xl p-6 text-center">
        <CheckCircle className="h-10 w-10 text-[#3FB950] mx-auto mb-3" strokeWidth={1.5} />
        <h3 className="text-[var(--text-primary)] font-heading text-xl mb-1">
          You&apos;re on the list.
        </h3>
        <p className="text-[var(--text-body)] text-sm">
          We&apos;ll email you when closed beta opens. Get your rod ready.
        </p>
        {count > 0 && (
          <p className="font-['IBM_Plex_Mono'] text-[var(--text-meta)] text-xs mt-3">
            {count.toLocaleString()} anglers ahead of the hatch
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="First name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-[var(--surface-raised)] border border-[var(--border-strong)] rounded-xl px-4 py-3.5 text-[var(--text-primary)] placeholder-[#A8B2BD] text-sm focus:outline-none focus:border-[var(--action)] focus:ring-2 focus:ring-[var(--action)]/30 transition-colors font-['DM_Sans']"
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 bg-[var(--surface-raised)] border border-[var(--border-strong)] rounded-xl px-4 py-3.5 text-[var(--text-primary)] placeholder-[#A8B2BD] text-sm focus:outline-none focus:border-[var(--action)] focus:ring-2 focus:ring-[var(--action)]/30 transition-colors font-['DM_Sans']"
          />
        </div>

        <button
          type="submit"
          disabled={state === "loading"}
          className="w-full flex items-center justify-center gap-2 px-7 py-4 bg-[var(--action)] text-[var(--on-action)] font-bold rounded-surface hover:bg-[var(--action-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-[var(--elev-1)] text-base tracking-wide"
        >
          {state === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining...
            </>
          ) : (
            "Join the Waitlist \u2192"
          )}
        </button>

        {state === "error" && (
          <p className="font-['IBM_Plex_Mono'] text-[#F85149] text-xs text-center">
            {errorMsg}
          </p>
        )}
      </form>

      {count > 0 && (
        <p className="font-['IBM_Plex_Mono'] text-[var(--text-meta)] text-xs mt-4 text-center">
          {count.toLocaleString()} anglers already on the list
        </p>
      )}
    </div>
  );
}
