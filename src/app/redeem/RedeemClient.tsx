"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Gift, CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";
import { APP_STORE_URL } from "@/lib/constants";

interface Availability {
  total: number;
  remaining: number;
  redeemed: number;
}

interface Props {
  code: string;
  isLoggedIn: boolean;
  isPremium: boolean;
  initialAvailability: Availability | null;
}

type RedeemError =
  | "invalid_code"
  | "already_redeemed"
  | "already_premium"
  | "sold_out"
  | "not_authenticated"
  | "network";

type ViewState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; premiumUntil: string }
  | { kind: "error"; error: RedeemError; premiumUntil?: string };

// Client-side open-redirect guard — only ever navigate to same-origin paths.
function safeNext(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return "/redeem";
  return path;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

declare global {
  interface Window {
    // GA4 is loaded via next/script in layout.tsx; may be undefined during first paint.
    gtag?: (...args: unknown[]) => void;
  }
}

export default function RedeemClient({
  code: initialCode,
  isLoggedIn,
  isPremium,
  initialAvailability,
}: Props) {
  const [code, setCode] = useState(initialCode);
  const [availability, setAvailability] = useState<Availability | null>(initialAvailability);
  const [view, setView] = useState<ViewState>({ kind: "idle" });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextPath = useMemo(
    () => safeNext(`/redeem?code=${encodeURIComponent(initialCode)}`),
    [initialCode]
  );

  const refreshAvailability = useCallback(async (c: string) => {
    try {
      const res = await fetch(`/api/promo/status?code=${encodeURIComponent(c)}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as Availability & { code: string };
      setAvailability({
        total: data.total,
        remaining: data.remaining,
        redeemed: data.redeemed,
      });
    } catch {
      // Silent — keep last known availability
    }
  }, []);

  // Poll availability every 30s while idle so the counter stays live.
  useEffect(() => {
    if (view.kind !== "idle") return;
    if (!isLoggedIn) return; // Not much point polling for anon users
    pollRef.current = setInterval(() => refreshAvailability(code), 30_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [view.kind, isLoggedIn, code, refreshAvailability]);

  const handleRedeem = async () => {
    setView({ kind: "submitting" });
    try {
      const res = await fetch("/api/promo/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setView({ kind: "success", premiumUntil: data.premium_until });
        if (typeof window !== "undefined" && typeof window.gtag === "function") {
          window.gtag("event", "promo_redeem", {
            code: code.trim().toUpperCase(),
            campaign_source: "reddit",
            premium_until: data.premium_until,
          });
        }
        // Refresh the counter to reflect the new redeemed state
        refreshAvailability(code);
        return;
      }

      const err = (data.error as RedeemError) || "network";
      setView({
        kind: "error",
        error: err,
        premiumUntil: typeof data.premium_until === "string" ? data.premium_until : undefined,
      });
      // On sold_out / already_redeemed, the counter may have shifted; refresh.
      if (err === "sold_out" || err === "already_redeemed") {
        refreshAvailability(code);
      }
    } catch {
      setView({ kind: "error", error: "network" });
    }
  };

  const resetToIdle = () => setView({ kind: "idle" });

  const remaining = availability?.remaining ?? 0;
  const total = availability?.total ?? 0;
  const soldOut = availability !== null && remaining <= 0;

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#F0F6FC]">
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E8923A]/10 border border-[#E8923A]/30 rounded-full text-xs font-medium text-[#E8923A] tracking-wider uppercase mb-6">
            <Gift className="w-3.5 h-3.5" />
            Reddit Launch Offer
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">
            30 Days of Pro
            <span className="block text-[#E8923A] mt-1">On the House</span>
          </h1>
          <p className="text-[#A8B2BD] text-lg max-w-md mx-auto">
            No credit card. No auto-charge. Just 30 days of every Pro feature,
            on us.
          </p>
        </div>

        {/* Availability counter */}
        {availability && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-[#A8B2BD]">
                {soldOut ? (
                  <span className="text-red-400 font-medium">All seats claimed</span>
                ) : (
                  <>
                    <span className="text-[#F0F6FC] font-semibold">
                      {remaining}
                    </span>{" "}
                    of {total} left
                  </>
                )}
              </span>
              <span className="text-[#6E7681] text-xs font-mono">
                {availability.redeemed} redeemed
              </span>
            </div>
            <div className="h-1.5 bg-[#161B22] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E8923A] to-[#00B4D8] transition-all duration-500"
                style={{
                  width:
                    total === 0
                      ? "0%"
                      : `${Math.min(100, (availability.redeemed / total) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Main card */}
        <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-6 sm:p-8 shadow-xl">
          {/* Code input */}
          <label
            htmlFor="promo-code"
            className="block text-xs font-medium text-[#6E7681] uppercase tracking-wider mb-2"
          >
            Promo Code
          </label>
          <input
            id="promo-code"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (view.kind === "error") resetToIdle();
            }}
            disabled={
              view.kind === "submitting" ||
              view.kind === "success" ||
              !isLoggedIn ||
              isPremium
            }
            className="w-full px-4 py-4 rounded-lg border border-[#21262D] bg-[#0D1117] focus:ring-2 focus:ring-[#E8923A] focus:border-[#E8923A] text-[#F0F6FC] outline-none font-mono text-lg tracking-widest text-center disabled:opacity-50"
            placeholder="REDDIT30"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={64}
          />

          {/* State-dependent action area */}
          <div className="mt-6">
            {!isLoggedIn && (
              <div className="space-y-3">
                <p className="text-sm text-[#A8B2BD] text-center mb-4">
                  Sign in or create a free account to claim.
                </p>
                <Link
                  href={`/signup?next=${encodeURIComponent(nextPath)}`}
                  className="block w-full py-3 text-center bg-[#E8923A] text-white font-semibold rounded-lg hover:bg-[#cf7d30] transition-colors"
                >
                  Create Free Account
                </Link>
                <Link
                  href={`/login?next=${encodeURIComponent(nextPath)}`}
                  className="block w-full py-3 text-center bg-[#161B22] border border-[#21262D] text-[#F0F6FC] font-medium rounded-lg hover:bg-[#1F2937] transition-colors"
                >
                  I Already Have an Account
                </Link>
              </div>
            )}

            {isLoggedIn && isPremium && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-[#00B4D8] mb-3">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">You already have Pro</span>
                </div>
                <p className="text-sm text-[#A8B2BD] mb-6">
                  Share the code with a fishing buddy — they&apos;ll thank you.
                </p>
                <Link
                  href="/journal"
                  className="inline-block px-6 py-3 bg-[#E8923A] text-white font-medium rounded-lg hover:bg-[#cf7d30] transition-colors"
                >
                  Back to Journal
                </Link>
              </div>
            )}

            {isLoggedIn && !isPremium && view.kind === "idle" && (
              <button
                onClick={handleRedeem}
                disabled={soldOut || !code.trim()}
                className="w-full py-4 bg-[#E8923A] text-white font-bold text-lg rounded-lg hover:bg-[#cf7d30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {soldOut ? "All Seats Claimed" : "Claim 30 Days Free"}
              </button>
            )}

            {view.kind === "submitting" && (
              <button
                disabled
                className="w-full py-4 bg-[#E8923A] text-white font-bold text-lg rounded-lg flex items-center justify-center gap-2 opacity-70"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                Claiming…
              </button>
            )}

            {view.kind === "success" && (
              <div className="text-center">
                <CheckCircle2 className="w-16 h-16 text-[#00B4D8] mx-auto mb-4" />
                <h2 className="font-heading text-2xl font-bold mb-2">
                  Pro unlocked
                </h2>
                <p className="text-[#A8B2BD] mb-6">
                  Your Executive Angler Pro access is active until{" "}
                  <span className="text-[#F0F6FC] font-semibold">
                    {formatDate(view.premiumUntil)}
                  </span>
                  .
                </p>
                <div className="space-y-3">
                  <Link
                    href="/journal"
                    className="block w-full py-3 text-center bg-[#E8923A] text-white font-semibold rounded-lg hover:bg-[#cf7d30] transition-colors"
                  >
                    Open Your Journal
                  </Link>
                  <a
                    href={APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 text-center bg-[#161B22] border border-[#21262D] text-[#F0F6FC] font-medium rounded-lg hover:bg-[#1F2937] transition-colors"
                  >
                    Get the iOS App
                  </a>
                </div>
              </div>
            )}

            {view.kind === "error" && (
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <ErrorCopy error={view.error} premiumUntil={view.premiumUntil} />
                <button
                  onClick={resetToIdle}
                  className="mt-6 px-5 py-2 bg-[#161B22] border border-[#21262D] text-[#F0F6FC] font-medium rounded-lg hover:bg-[#1F2937] transition-colors"
                >
                  Try another code
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer fine print */}
        <p className="mt-8 text-center text-xs text-[#6E7681] max-w-md mx-auto">
          30 days of full Pro access. Access expires automatically — nothing to
          cancel, no card required. One redemption per account.
        </p>
      </div>
    </div>
  );
}

function ErrorCopy({
  error,
  premiumUntil,
}: {
  error: RedeemError;
  premiumUntil?: string;
}) {
  switch (error) {
    case "sold_out":
      return (
        <>
          <h2 className="font-heading text-2xl font-bold mb-2">
            All seats claimed
          </h2>
          <p className="text-[#A8B2BD]">
            This drop is gone — we&apos;ll post the next one on Reddit and
            Instagram. Follow along so you don&apos;t miss it.
          </p>
        </>
      );
    case "already_redeemed":
      return (
        <>
          <h2 className="font-heading text-2xl font-bold mb-2">
            Already redeemed
          </h2>
          <p className="text-[#A8B2BD]">
            You&apos;ve claimed this code. Your Pro access runs until{" "}
            <span className="text-[#F0F6FC] font-semibold">
              {premiumUntil ? formatDate(premiumUntil) : "your existing expiry"}
            </span>
            .
          </p>
        </>
      );
    case "already_premium":
      return (
        <>
          <h2 className="font-heading text-2xl font-bold mb-2">
            You already have Pro
          </h2>
          <p className="text-[#A8B2BD]">
            Looks like you&apos;ve got an active subscription or founding-member
            seat. Share the code with a fishing buddy instead.
          </p>
        </>
      );
    case "invalid_code":
      return (
        <>
          <h2 className="font-heading text-2xl font-bold mb-2">
            That code didn&apos;t work
          </h2>
          <p className="text-[#A8B2BD]">
            Double-check for typos, or make sure the campaign is still live.
          </p>
        </>
      );
    case "not_authenticated":
      return (
        <>
          <h2 className="font-heading text-2xl font-bold mb-2">Please sign in</h2>
          <p className="text-[#A8B2BD]">
            Your session expired. Sign in again to finish redeeming.
          </p>
        </>
      );
    case "network":
    default:
      return (
        <>
          <h2 className="font-heading text-2xl font-bold mb-2">
            Something went sideways
          </h2>
          <p className="text-[#A8B2BD]">
            A network or server hiccup — give it another shot in a moment.
          </p>
        </>
      );
  }
}
