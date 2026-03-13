"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

type State = "idle" | "loading" | "success" | "error";

export default function WaitlistSection({ initialCount = 0 }: { initialCount?: number }) {
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

  return (
    <section className="relative bg-[#0D1117] py-24 overflow-hidden">
      {/* Atmospheric glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#E8923A] opacity-[0.07] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-[#00B4D8] opacity-[0.05] blur-[100px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8923A] animate-pulse" />
          <span className="font-['IBM_Plex_Mono'] text-[#E8923A] text-xs uppercase tracking-[0.2em]">
            Closed Beta · Coming to App Store
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] font-normal leading-[1.05] mb-4" style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}>
          Be first on the water.
        </h2>

        {/* Subheadline */}
        <p className="text-[#8B949E] text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Executive Angler is heading to the App Store. Join the waitlist and we&apos;ll reach out the moment closed beta opens — spots are limited.
        </p>

        {state === "success" ? (
          /* Success state */
          <div className="bg-[#161B22] border border-[#3FB950]/30 rounded-2xl p-8 text-center">
            <CheckCircle className="h-12 w-12 text-[#3FB950] mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-2xl mb-2">
              You&apos;re on the list.
            </h3>
            <p className="text-[#8B949E] text-sm">
              We&apos;ll email you when closed beta opens. Get your rod ready.
            </p>
            {count > 0 && (
              <p className="font-['IBM_Plex_Mono'] text-[#484F58] text-xs mt-4">
                {count.toLocaleString()} anglers ahead of the hatch
              </p>
            )}
          </div>
        ) : (
          /* Form */
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
                  Joining…
                </>
              ) : (
                "Join the Waitlist →"
              )}
            </button>

            {state === "error" && (
              <p className="font-['IBM_Plex_Mono'] text-[#F85149] text-xs text-center">
                {errorMsg}
              </p>
            )}
          </form>
        )}

        {/* Social proof counter */}
        {count > 0 && state !== "success" && (
          <p className="font-['IBM_Plex_Mono'] text-[#484F58] text-xs mt-5">
            {count.toLocaleString()} anglers already on the list
          </p>
        )}

        <p className="font-['IBM_Plex_Mono'] text-[#484F58] text-xs mt-4">
          No spam. One email when beta opens. That&apos;s it.
        </p>
      </div>
    </section>
  );
}
