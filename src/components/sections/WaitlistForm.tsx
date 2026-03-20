"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

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
      <div className="bg-[#161B22] border border-[#3FB950]/30 rounded-2xl p-6 text-center">
        <CheckCircle className="h-10 w-10 text-[#3FB950] mx-auto mb-3" strokeWidth={1.5} />
        <h3 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-xl mb-1">
          You&apos;re on the list.
        </h3>
        <p className="text-[#8B949E] text-sm">
          We&apos;ll email you when closed beta opens. Get your rod ready.
        </p>
        {count > 0 && (
          <p className="font-['IBM_Plex_Mono'] text-[#484F58] text-xs mt-3">
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
            className="flex-1 bg-[#161B22] border border-[#30363D] rounded-xl px-4 py-3.5 text-[#F0F6FC] placeholder-[#8B949E] text-sm focus:outline-none focus:border-[#E8923A] focus:ring-2 focus:ring-[#E8923A]/30 transition-colors font-['DM_Sans']"
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 bg-[#161B22] border border-[#30363D] rounded-xl px-4 py-3.5 text-[#F0F6FC] placeholder-[#8B949E] text-sm focus:outline-none focus:border-[#E8923A] focus:ring-2 focus:ring-[#E8923A]/30 transition-colors font-['DM_Sans']"
          />
        </div>

        <button
          type="submit"
          disabled={state === "loading"}
          className="w-full flex items-center justify-center gap-2 px-7 py-4 bg-[#E8923A] text-white font-bold rounded-xl hover:bg-[#f09d47] active:bg-[#d17d28] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-[0_0_30px_rgba(232,146,58,0.35)] hover:shadow-[0_0_40px_rgba(232,146,58,0.5)] text-base tracking-wide"
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
        <p className="font-['IBM_Plex_Mono'] text-[#484F58] text-xs mt-4 text-center">
          {count.toLocaleString()} anglers already on the list
        </p>
      )}
    </div>
  );
}
