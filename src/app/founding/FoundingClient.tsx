"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Crown,
  Check,
  Waves,
  Brain,
  Bug,
  Cloud,
  BarChart3,
  CalendarRange,
  Wrench,
  Lock,
  FileText,
  Camera,
  Clock,
  Leaf,
  Sparkles,
} from "lucide-react";

/**
 * FoundingClient — the client half of /founding.
 *
 * One job: convert a cold social-traffic visitor into a $150 lifetime purchase.
 * Everything else (navigation, cross-links, upsells) is intentionally absent.
 *
 * UX decisions worth calling out:
 *   • Single primary CTA, repeated at top and bottom. No plan picker — this
 *     isn't a comparison page, it's a one-decision page.
 *   • Scarcity counter reads from server-rendered props (ISR every 60s). Not
 *     a live websocket — that would be expensive for a dozen mobile Safari
 *     sessions a day, and 60s is plenty to convey "it's filling up."
 *   • Founder badge state preempts the whole CTA flow if the user has
 *     already claimed. Prevents the confusing "buy again" path.
 *   • Sold-out state is a dead end — no upsell to monthly. A sold-out
 *     founder's intent is "I missed it," not "sell me something else."
 */

interface Props {
  isLoggedIn: boolean;
  isPremium: boolean;
  isFounder: boolean;
  seatNumber: number | null;
  foundingSeats: { total: number; sold: number; remaining: number };
}

const FOUNDING_PRICE = 150;

const INCLUDED = [
  { icon: Waves, label: "Live river conditions", desc: "USGS flow, gauge height, water temp — refreshed every 15 min" },
  { icon: Brain, label: "AI journal insights", desc: "Personalized patterns from your own fishing data" },
  { icon: Bug, label: "Hatch reports", desc: "What's hatching now across every river you fish" },
  { icon: Cloud, label: "Conditions match", desc: "Know when your ideal conditions are lining up" },
  { icon: BarChart3, label: "Advanced analytics", desc: "Fly effectiveness, time-of-day trends, size curves" },
  { icon: CalendarRange, label: "Year vs year comparisons", desc: "Compare whole seasons side-by-side" },
  { icon: Wrench, label: "Fly Tying Workbench", desc: "Structured recipe builder, 500+ materials, PDF export" },
  { icon: Leaf, label: "Unlimited fly patterns", desc: "No 10-pattern cap. Build your whole box." },
  { icon: Clock, label: "Unlimited session history", desc: "Every session you'll ever log, kept forever" },
  { icon: Camera, label: "Multi-photo catches", desc: "As many photos per catch as you want" },
  { icon: Lock, label: "Private sessions", desc: "Keep certain waters off the public feed" },
  { icon: FileText, label: "Data export", desc: "CSV + PDF trip reports, on demand" },
];

const FAQ = [
  {
    q: "Is this really lifetime, or does it expire?",
    a: "Truly lifetime. One payment of $150, and Pro is yours as long as Executive Angler exists. No renewals, no upsells, no price hikes you'll get grandfathered out of.",
  },
  {
    q: "Does it work on iOS and Android?",
    a: "Yes. Your Pro access is tied to your account, not the platform. Sign in on the iOS app, the Android app, or the web — Pro unlocks everywhere automatically.",
  },
  {
    q: "I'm already on the monthly or annual plan. What happens?",
    a: "Buy the Founding seat and we'll refund or stop billing your existing subscription. Reach out after purchase and we'll sort it in a day.",
  },
  {
    q: "Why only 50?",
    a: "Because this is a thank-you to the first people willing to bet on the product, not a growth lever. When it's gone, it's gone — the regular $4.99/mo and $29.99/yr plans stay.",
  },
  {
    q: "What if I don't love it?",
    a: "Email within 14 days and you get a full refund, no questions. Your seat goes back into the pool.",
  },
  {
    q: "Is this only available on the web?",
    a: "Yes — purchase happens here on the website. Once you're a Founder, Pro unlocks across every platform you sign in on.",
  },
];

export default function FoundingClient({
  isLoggedIn,
  isPremium,
  isFounder,
  seatNumber,
  foundingSeats,
}: Props) {
  const [loading, setLoading] = useState(false);
  const soldOut = foundingSeats.remaining <= 0;
  const percentSold = Math.min(100, (foundingSeats.sold / foundingSeats.total) * 100);

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      // Preserve the page they came from so they land back on /founding
      // post-signup. Without this they'd get dumped on /account and lose
      // the scarcity momentum that drove them to the page.
      window.location.href = "/signup?redirect=/founding";
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/founding", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === "sold_out") {
        alert(data.message || "All 50 founding seats have been claimed.");
        // Hard reload so the page re-renders with the sold-out state
        window.location.reload();
      } else if (data.error === "already_founder") {
        alert(data.message || "You're already a founding member.");
      } else {
        alert(`Checkout error: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Founding checkout error:", err);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Founder state: short-circuit everything. They already bought. ──
  if (isFounder) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl border border-[#E8923A]/40 bg-gradient-to-br from-[#E8923A]/15 via-[#E8923A]/5 to-transparent">
          <Crown className="h-12 w-12 text-[#E8923A] mx-auto mb-4" />
          <h1 className="font-serif text-3xl text-[#F0F6FC] mb-2">
            You&apos;re Founder{seatNumber ? ` #${seatNumber}` : ""}
          </h1>
          <p className="text-sm text-[#A8B2BD] mb-6">
            Lifetime Pro unlocked across web, iOS, and Android. Thank you for being
            in the first 50.
          </p>
          <Link
            href="/journal"
            className="inline-block px-6 py-3 rounded-lg bg-[#E8923A] text-[#0D1117] font-bold hover:bg-[#D4751F] transition-colors"
          >
            Open Your Journal
          </Link>
        </div>
      </div>
    );
  }

  const ctaLabel = soldOut
    ? "Sold Out"
    : loading
    ? "Loading…"
    : isLoggedIn
    ? `Claim Seat — $${FOUNDING_PRICE}`
    : `Sign Up & Claim — $${FOUNDING_PRICE}`;

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#F0F6FC]">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-[#21262D]">
        {/* Copper glow, upper-left */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8923A]/20 via-[#E8923A]/5 to-transparent" />
        {/* Teal accent, lower-right */}
        <div className="absolute inset-0 bg-gradient-to-tl from-[#00B4D8]/10 via-transparent to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8923A]/10 border border-[#E8923A]/30 mb-8">
            <Crown className="h-3.5 w-3.5 text-[#E8923A]" />
            <span className="text-xs font-bold text-[#E8923A] tracking-widest uppercase">
              Founding 50 · Limited
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl leading-tight mb-6">
            50 anglers.
            <br />
            Lifetime Pro.
            <br />
            <span className="text-[#E8923A]">${FOUNDING_PRICE}.</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#A8B2BD] max-w-2xl mx-auto mb-10">
            One payment. Every Pro feature on iOS, Android, and web — forever. No
            renewals, no upsells. Fifty spots. That&apos;s it.
          </p>

          {/* Scarcity */}
          <div className="max-w-sm mx-auto mb-8">
            <div className="h-2 rounded-full bg-[#21262D] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E8923A] to-[#D4751F] transition-all"
                style={{ width: `${percentSold}%` }}
              />
            </div>
            <div className="mt-3 text-sm font-mono">
              {soldOut ? (
                <span className="text-red-400 font-semibold">
                  All 50 seats claimed
                </span>
              ) : (
                <>
                  <span className="text-[#F0F6FC] font-bold">
                    {foundingSeats.remaining}
                  </span>
                  <span className="text-[#6E7681]">
                    {" "}
                    of {foundingSeats.total} seats left
                  </span>
                </>
              )}
            </div>
          </div>

          {/* CTA */}
          {isPremium && !isFounder ? (
            <div className="max-w-md mx-auto p-4 rounded-lg bg-[#161B22] border border-[#21262D]">
              <p className="text-sm text-[#A8B2BD] mb-3">
                You already have Pro via a subscription. Want to convert to a
                lifetime Founder seat?
              </p>
              <button
                onClick={handleCheckout}
                disabled={loading || soldOut}
                className="w-full py-3 rounded-lg bg-[#E8923A] text-[#0D1117] font-bold hover:bg-[#D4751F] transition-colors disabled:opacity-50"
              >
                {ctaLabel}
              </button>
              <p className="text-[11px] text-[#6E7681] mt-2">
                We&apos;ll refund or cancel your existing subscription after
                purchase.
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={handleCheckout}
                disabled={loading || soldOut}
                className="px-8 py-4 rounded-lg bg-[#E8923A] text-[#0D1117] font-bold text-lg hover:bg-[#D4751F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#E8923A]/20"
              >
                {ctaLabel}
              </button>
              <p className="text-xs text-[#6E7681] mt-4">
                One-time payment · No renewals · 14-day refund window
              </p>
            </>
          )}
        </div>
      </section>

      {/* ── THE STORY ── */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="inline-flex items-center gap-2 mb-5">
          <Sparkles className="h-4 w-4 text-[#E8923A]" />
          <span className="text-xs font-bold text-[#E8923A] tracking-widest uppercase">
            Why 50
          </span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl mb-6">
          A small thank-you, not a growth hack.
        </h2>

        <div className="space-y-5 text-[#A8B2BD] leading-relaxed">
          <p>
            I built Executive Angler because the tools I wanted didn&apos;t exist —
            a journal that respects your time, flow data that matches what you
            caught, a fly workbench that doesn&apos;t feel like a spreadsheet. Most
            fishing apps are social networks with a log tacked on. This one is the
            other way around.
          </p>
          <p>
            Founding 50 exists for the people willing to pay for the product
            before it has 10,000 reviews or a glossy ad campaign. Fifty lifetime
            seats, $150 each. When they&apos;re gone, the doors close on this deal
            for good — the standard $4.99/mo and $29.99/yr plans stay up
            forever.
          </p>
          <p>
            You&apos;re not buying early access. Every feature listed below is
            live today, on every platform. You&apos;re buying the lifetime of
            every feature we ship after, at a price that will look absurd when we
            raise prices later.
          </p>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section className="bg-[#0B0E13] border-y border-[#21262D]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl mb-3">
              Everything unlocked. Forever.
            </h2>
            <p className="text-[#A8B2BD]">
              Every Pro feature we&apos;ve built — and every one we ship next.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
            {INCLUDED.map((f) => (
              <div key={f.label} className="flex gap-3">
                <div className="shrink-0 mt-0.5">
                  <div className="h-8 w-8 rounded-lg bg-[#E8923A]/10 border border-[#E8923A]/20 flex items-center justify-center">
                    <f.icon className="h-4 w-4 text-[#E8923A]" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#F0F6FC] mb-0.5">
                    {f.label}
                  </div>
                  <p className="text-xs text-[#6E7681] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CROSS-PLATFORM REASSURANCE ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-2xl border border-[#21262D] bg-[#161B22] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="shrink-0 h-12 w-12 rounded-xl bg-[#00B4D8]/10 border border-[#00B4D8]/20 flex items-center justify-center">
            <Check className="h-6 w-6 text-[#00B4D8]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-xl mb-1">
              One account. iOS, Android, and web.
            </h3>
            <p className="text-sm text-[#A8B2BD]">
              Your Founder status lives on your account, not the platform. Sign
              in on any device and Pro unlocks automatically — no extra app
              purchases, no reinstalls.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <h2 className="font-serif text-3xl sm:text-4xl text-center mb-12">
          Questions
        </h2>
        <div className="space-y-6">
          {FAQ.map((item) => (
            <div
              key={item.q}
              className="rounded-xl border border-[#21262D] bg-[#161B22] p-5 sm:p-6"
            >
              <h3 className="text-base font-semibold text-[#F0F6FC] mb-2">
                {item.q}
              </h3>
              <p className="text-sm text-[#A8B2BD] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="border-t border-[#21262D] bg-gradient-to-b from-transparent to-[#E8923A]/5">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <Crown className="h-10 w-10 text-[#E8923A] mx-auto mb-5" />
          <h2 className="font-serif text-3xl sm:text-4xl mb-4">
            {soldOut ? "All 50 seats are gone." : "Claim your seat."}
          </h2>
          <p className="text-[#A8B2BD] mb-8 max-w-md mx-auto">
            {soldOut ? (
              <>
                The Founding 50 have been claimed. Pro is still available monthly
                or annually at the regular rate.
              </>
            ) : (
              <>
                <span className="font-mono text-[#F0F6FC] font-bold">
                  {foundingSeats.remaining}
                </span>{" "}
                of {foundingSeats.total} left. One payment of ${FOUNDING_PRICE}.
                Pro forever.
              </>
            )}
          </p>
          {soldOut ? (
            <Link
              href="/pricing"
              className="inline-block px-8 py-3 rounded-lg bg-[#161B22] border border-[#21262D] text-[#F0F6FC] font-semibold hover:border-[#E8923A] transition-colors"
            >
              See Standard Plans
            </Link>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="px-8 py-4 rounded-lg bg-[#E8923A] text-[#0D1117] font-bold text-lg hover:bg-[#D4751F] transition-colors disabled:opacity-50 shadow-lg shadow-[#E8923A]/20"
            >
              {ctaLabel}
            </button>
          )}
          <p className="text-xs text-[#6E7681] mt-6">
            Secure checkout via Stripe · 14-day refund · Cancel any existing
            subscription after purchase
          </p>
        </div>
      </section>
    </div>
  );
}
