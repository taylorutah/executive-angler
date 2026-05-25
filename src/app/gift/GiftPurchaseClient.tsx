"use client";

import { useState } from "react";
import Link from "next/link";
import { Gift, Loader2, Sparkles } from "lucide-react";

interface Props {
  isLoggedIn: boolean;
  purchaserName: string | null;
  foundersWindow?: boolean;
  foundersFreeEndIso?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function GiftPurchaseClient({ isLoggedIn, purchaserName, foundersWindow = false, foundersFreeEndIso }: Props) {
  const foundersEndLabel = foundersFreeEndIso
    ? new Date(foundersFreeEndIso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientMessage, setRecipientMessage] = useState("");
  const [fromName, setFromName] = useState(purchaserName ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = EMAIL_RE.test(recipientEmail.trim());
  const canSubmit = emailValid && !isLoading;

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      window.location.href = `/signup?redirect=${encodeURIComponent("/gift")}`;
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: recipientEmail.trim(),
          recipientMessage: recipientMessage.trim(),
          purchaserName: fromName.trim(),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Checkout failed");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-16 pb-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8923A]/10 border border-[#E8923A]/20 mb-6">
            <Gift className="h-3.5 w-3.5 text-[#E8923A]" />
            <span className="text-xs font-semibold text-[#E8923A] tracking-wide">
              GIFT PRO
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F0F6FC] mb-3">
            Give a year of Pro.
          </h1>
          {foundersWindow && foundersEndLabel ? (
            <p className="text-sm text-[#A8B2BD] max-w-md mx-auto">
              $19.99 &mdash; a full paid year of Executive Angler Pro for a fishing
              buddy. Every angler has Pro free until {foundersEndLabel}, so they
              can sit on the claim link until then — their paid year starts the
              day they redeem.
            </p>
          ) : (
            <p className="text-sm text-[#A8B2BD] max-w-md mx-auto">
              $19.99 &mdash; a full year of Executive Angler Pro for a fishing buddy.
              They&apos;ll get an email with a link to claim it.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-[#21262D] bg-[#161B22] p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#A8B2BD] tracking-wider uppercase mb-2">
              Recipient Email
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="buddy@example.com"
              className="w-full rounded-lg bg-[#0D1117] border border-[#21262D] px-3 py-2.5 text-sm text-[#F0F6FC] placeholder:text-[#6E7681] focus:border-[#E8923A] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A8B2BD] tracking-wider uppercase mb-2">
              From (optional)
            </label>
            <input
              type="text"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Your name"
              maxLength={80}
              className="w-full rounded-lg bg-[#0D1117] border border-[#21262D] px-3 py-2.5 text-sm text-[#F0F6FC] placeholder:text-[#6E7681] focus:border-[#E8923A] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A8B2BD] tracking-wider uppercase mb-2">
              Message (optional)
            </label>
            <textarea
              value={recipientMessage}
              onChange={(e) => setRecipientMessage(e.target.value)}
              placeholder="Happy birthday — go catch something big."
              rows={3}
              maxLength={500}
              className="w-full rounded-lg bg-[#0D1117] border border-[#21262D] px-3 py-2.5 text-sm text-[#F0F6FC] placeholder:text-[#6E7681] focus:border-[#E8923A] focus:outline-none transition-colors resize-none"
            />
            <p className="mt-1 text-[11px] text-[#6E7681]">
              {recipientMessage.length}/500
            </p>
          </div>

          <div className="rounded-lg border border-[#21262D] bg-[#0D1117] p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#A8B2BD] mb-0.5">Total today</p>
              <p className="font-mono text-2xl font-bold text-[#F0F6FC]">$19.99</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#6E7681]">1 year of Pro</p>
              <p className="text-[11px] text-[#6E7681]">One-time payment</p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-[#F85149]/40 bg-[#F85149]/10 p-3 text-sm text-[#F85149]">
              {error}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={!canSubmit}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#E8923A] py-3.5 text-[#0D1117] text-sm font-bold hover:bg-[#D4751F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </>
            ) : isLoggedIn ? (
              <>
                <Sparkles className="h-4 w-4" />
                Gift Pro &mdash; $19.99
              </>
            ) : (
              "Sign up to send gift"
            )}
          </button>

          <p className="text-center text-[11px] text-[#6E7681]">
            The recipient gets an email with a unique claim link. They don&apos;t need
            an account yet &mdash; sign-up is free and the gift adds Pro on top.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/pricing"
            className="text-xs text-[#6E7681] hover:text-[#A8B2BD] transition-colors"
          >
            &larr; Back to pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
