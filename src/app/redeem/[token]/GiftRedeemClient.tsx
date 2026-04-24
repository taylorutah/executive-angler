"use client";

import { useState } from "react";
import Link from "next/link";
import { Gift, CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";

interface GiftInfo {
  purchaserDisplayName: string | null;
  purchaserEmail: string | null;
  recipientMessage: string | null;
  redeemedAt: string | null;
  createdAt: string;
}

interface Props {
  token: string;
  gift: GiftInfo | null;
  isLoggedIn: boolean;
}

type RedeemStatus =
  | "ok"
  | "invalid_token"
  | "already_redeemed"
  | "own_gift";

type ViewState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; premiumUntil: string }
  | { kind: "error"; status: RedeemStatus | "network" };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function GiftRedeemClient({ token, gift, isLoggedIn }: Props) {
  const [view, setView] = useState<ViewState>({ kind: "idle" });

  const redirectPath = `/redeem/${encodeURIComponent(token)}`;

  if (!gift) {
    return (
      <Shell>
        <div className="text-center">
          <XCircle className="h-10 w-10 text-[#F85149] mx-auto mb-4" />
          <h1 className="font-serif text-2xl text-[#F0F6FC] mb-2">
            This gift link isn&apos;t valid
          </h1>
          <p className="text-sm text-[#A8B2BD] mb-6">
            The link may have been mistyped, or the gift may have been withdrawn. If a
            friend sent you this, ask them to forward the original email.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-[#E8923A] text-sm font-semibold hover:underline"
          >
            See Pro pricing
          </Link>
        </div>
      </Shell>
    );
  }

  const fromLabel =
    gift.purchaserDisplayName ||
    (gift.purchaserEmail ? gift.purchaserEmail.split("@")[0] : "A fellow angler");

  if (gift.redeemedAt) {
    return (
      <Shell>
        <div className="text-center">
          <CheckCircle2 className="h-10 w-10 text-[#2EA44F] mx-auto mb-4" />
          <h1 className="font-serif text-2xl text-[#F0F6FC] mb-2">Gift already claimed</h1>
          <p className="text-sm text-[#A8B2BD] mb-6">
            This gift was redeemed on {formatDate(gift.redeemedAt)}. Each gift link works
            once.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-lg bg-[#E8923A] px-4 py-2.5 text-[#0D1117] text-sm font-bold hover:bg-[#D4751F] transition-colors"
          >
            Subscribe to Pro
          </Link>
        </div>
      </Shell>
    );
  }

  if (view.kind === "success") {
    return (
      <Shell>
        <div className="text-center">
          <Sparkles className="h-10 w-10 text-[#E8923A] mx-auto mb-4" />
          <h1 className="font-serif text-2xl text-[#F0F6FC] mb-2">
            Pro unlocked.
          </h1>
          <p className="text-sm text-[#A8B2BD] mb-6">
            Your Executive Angler Pro runs through{" "}
            <strong className="text-[#F0F6FC]">{formatDate(view.premiumUntil)}</strong>.
            Go log a session and stack your first insight.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/journal"
              className="w-full rounded-lg bg-[#E8923A] py-3 text-[#0D1117] text-sm font-bold hover:bg-[#D4751F] transition-colors"
            >
              Open your journal
            </Link>
            <Link
              href="/journal/insights"
              className="w-full rounded-lg border border-[#21262D] py-3 text-[#F0F6FC] text-sm font-medium hover:border-[#E8923A] transition-colors"
            >
              See your insights
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const handleRedeem = async () => {
    if (!isLoggedIn) {
      window.location.href = `/signup?redirect=${encodeURIComponent(redirectPath)}`;
      return;
    }
    setView({ kind: "submitting" });
    try {
      const res = await fetch("/api/gift/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.status === "ok" && data.premiumUntil) {
        setView({ kind: "success", premiumUntil: data.premiumUntil });
      } else {
        setView({ kind: "error", status: (data.status as RedeemStatus) ?? "invalid_token" });
      }
    } catch {
      setView({ kind: "error", status: "network" });
    }
  };

  return (
    <Shell>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8923A]/10 border border-[#E8923A]/20 mb-6">
          <Gift className="h-3.5 w-3.5 text-[#E8923A]" />
          <span className="text-xs font-semibold text-[#E8923A] tracking-wide">
            YOU&apos;VE BEEN GIFTED PRO
          </span>
        </div>
        <h1 className="font-serif text-3xl text-[#F0F6FC] mb-2">
          A year of Pro, from {fromLabel}.
        </h1>
        <p className="text-sm text-[#A8B2BD]">
          Claim your gift to unlock the full analytics layer.
        </p>
      </div>

      {gift.recipientMessage && (
        <div className="mb-6 rounded-xl border border-[#E8923A]/30 bg-[#E8923A]/5 p-5">
          <p className="text-sm text-[#F0F6FC] italic">&ldquo;{gift.recipientMessage}&rdquo;</p>
          <p className="mt-2 text-xs text-[#6E7681]">— {fromLabel}</p>
        </div>
      )}

      <ul className="mb-6 space-y-2 text-sm text-[#A8B2BD]">
        {[
          "Insights Dashboard — your best flies, times, weather, rivers",
          "Awards & Badges — per-river progression",
          "Best Window Calculator on live USGS flow",
          "Trophy Wall+, Year-over-Year, Streak + Gear stats",
        ].map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-[#2EA44F] shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {view.kind === "error" && (
        <div className="mb-4 rounded-lg border border-[#F85149]/40 bg-[#F85149]/10 p-3 text-sm text-[#F85149]">
          {view.status === "already_redeemed" && "This gift has already been claimed."}
          {view.status === "invalid_token" && "This gift link isn't valid anymore."}
          {view.status === "own_gift" && "You can't redeem a gift you purchased yourself."}
          {view.status === "network" && "Network hiccup — try again?"}
        </div>
      )}

      <button
        onClick={handleRedeem}
        disabled={view.kind === "submitting"}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#E8923A] py-3.5 text-[#0D1117] text-sm font-bold hover:bg-[#D4751F] transition-colors disabled:opacity-50"
      >
        {view.kind === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Claiming…
          </>
        ) : isLoggedIn ? (
          "Claim my gift"
        ) : (
          "Sign up & claim my gift"
        )}
      </button>

      <p className="mt-4 text-center text-xs text-[#6E7681]">
        Free account, no credit card. Your year of Pro starts the moment you claim.
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="rounded-2xl border border-[#21262D] bg-[#161B22] p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
