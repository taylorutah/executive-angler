"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check, Sparkles, Crown,
  BarChart3, Trophy, Award, Waves, Target, CalendarRange, Flame, Wrench, Gift,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  isLoggedIn: boolean;
  isPremium: boolean;
  subscriptionSource?: "apple" | "google" | "stripe" | "promo" | null;
  subscriptionExpiresAt?: string | null;
  foundersWindow?: boolean;
  foundersFreeEndIso?: string;
}

const MONTHLY_PRICE = 2.99;
const ANNUAL_PRICE = 19.99;
const ANNUAL_MONTHLY = (ANNUAL_PRICE / 12).toFixed(2);
const SAVINGS_PCT = Math.round(((MONTHLY_PRICE * 12 - ANNUAL_PRICE) / (MONTHLY_PRICE * 12)) * 100);

const PRO_FEATURES = [
  { icon: BarChart3, label: "Personal Insights Dashboard", desc: "Your best flies, times, weather, rivers, and species — computed from your sessions only." },
  { icon: Waves, label: "Best Window Calculator", desc: "Your catch history overlaid on live USGS flow — know when to fish." },
  { icon: Target, label: "Per-River Scorecard", desc: "Your sessions, top fly, best section, best month, gear — for every river you log." },
  { icon: Trophy, label: "Trophy Wall+", desc: "Biggest per species, per river, top 5 sessions, most-species day." },
  { icon: CalendarRange, label: "Year-over-Year", desc: "\"Last April: 12 fish. This April: 18.\" Seasonal overlays on your own data." },
  { icon: Flame, label: "Streak Stats", desc: "Current and longest fishing streaks. Habit-forming." },
  { icon: Wrench, label: "Gear Stats", desc: "\"Your Sage has caught 3x more than your Winston.\" — for your eyes only." },
  { icon: Award, label: "Personal Bests Badges", desc: "Per-river progression markers from your own logs (private to you)." },
  { icon: Crown, label: "Pro Badge", desc: "A small, tasteful marker on your profile." },
  { icon: Sparkles, label: "Early Access", desc: "New features for Pro first." },
];

const FREE_FEATURES = [
  "Log unlimited sessions and catches (private by default)",
  "Unlimited fly box + photos per catch",
  "Full Fly Tying Workbench + \"What Can I Tie?\" matcher",
  "500+ materials database + community submissions",
  "200+ rivers with live USGS flow + hatch charts",
  "Full directory: lodges, guides, fly shops, destinations, species, articles",
  "Recent Fly Choices on every river page (community fly pulse, no fish counts)",
  "Optional presence broadcast on the feed (river + weather only)",
  "Basic personal stats, calendar view, trophy wall highlight",
];

export default function PricingClient({
  isLoggedIn,
  isPremium,
  subscriptionSource = null,
  subscriptionExpiresAt = null,
  foundersWindow = false,
  foundersFreeEndIso,
}: Props) {
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");
  const [isLoading, setIsLoading] = useState(false);

  const isPromoPremium = isPremium && subscriptionSource === "promo";
  const promoExpiryLabel = subscriptionExpiresAt
    ? new Date(subscriptionExpiresAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const foundersEndLabel = foundersFreeEndIso
    ? new Date(foundersFreeEndIso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // During the founders window every authenticated user has Pro via the
  // gate, but only "real" subscribers have a subscriptionSource. Distinguish
  // the two so we don't show "You're a Pro" copy to gate-Pro users.
  const isFoundersGiftedPro =
    foundersWindow && isPremium && !subscriptionSource;

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      window.location.href = "/signup?redirect=/pricing";
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout response:", res.status, data);
        alert(`Checkout error: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Checkout fetch error:", err);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePortal = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#E8923A]/5 via-transparent to-transparent" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8923A]/10 border border-[#E8923A]/20 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#E8923A]" />
            <span className="text-xs font-semibold text-[#E8923A] tracking-wide">
              {foundersWindow ? "FOUNDERS' FREE LAUNCH YEAR" : "EXECUTIVE ANGLER PRO"}
            </span>
          </div>
          {foundersWindow && foundersEndLabel ? (
            <>
              <h1 className="font-serif text-4xl sm:text-5xl text-[#F0F6FC] mb-4">
                Pro is free until {foundersEndLabel}.
              </h1>
              <p className="text-lg text-[#A8B2BD] max-w-2xl mx-auto mb-3">
                Every Pro feature unlocked for every signed-in angler, no card required.
                Your private intelligence layer — never crowdsourced from other anglers.
              </p>
              <p className="text-sm text-[#6E7681] max-w-2xl mx-auto">
                Pricing returns to $2.99/mo or $19.99/yr on {foundersEndLabel}. We&apos;ll give you 30 days&apos; notice.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-serif text-4xl sm:text-5xl text-[#F0F6FC] mb-4">
                See <em>your</em> patterns. $2.99.
              </h1>
              <p className="text-lg text-[#A8B2BD] max-w-2xl mx-auto mb-3">
                Every session you log makes Pro sharper for you specifically. Your private intelligence layer — never crowdsourced from other anglers.
              </p>
              <p className="text-sm text-[#6E7681] max-w-2xl mx-auto">
                We never publish locations or fish counts. Pro deepens your own journal — it doesn&apos;t harvest anyone else&apos;s.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {isFoundersGiftedPro && foundersEndLabel ? (
          <div className="max-w-2xl mx-auto text-center mb-12">
            <div className="p-8 bg-[#161B22] rounded-2xl border border-[#E8923A]/30">
              <Crown className="h-10 w-10 text-[#E8923A] mx-auto mb-4" />
              <h2 className="font-serif text-2xl text-[#F0F6FC] mb-2">
                Founders&apos; Free Pro is active
              </h2>
              <p className="text-sm text-[#A8B2BD] mb-2">
                Every Pro feature is unlocked for you, free, until {foundersEndLabel}.
              </p>
              <p className="text-xs text-[#6E7681] mb-6">
                No subscription required. Pricing returns on {foundersEndLabel} — we&apos;ll send a heads-up 30 days before.
              </p>
              <Button
                onClick={handleCheckout}
                disabled={isLoading}
                loading={isLoading}
                variant="outline"
                size="md"
              >
                {isLoading ? "Loading..." : "Lock in pricing now"}
              </Button>
              <p className="mt-3 text-[11px] text-[#6E7681]">
                Pre-subscribe to keep Pro after the launch year ends. Cancel anytime.
              </p>
            </div>
          </div>
        ) : isPremium && !isPromoPremium ? (
          <div className="max-w-md mx-auto text-center mb-16">
            <div className="p-8 bg-[#161B22] rounded-2xl border border-[#E8923A]/30">
              <Crown className="h-10 w-10 text-[#E8923A] mx-auto mb-4" />
              <h2 className="font-serif text-2xl text-[#F0F6FC] mb-2">You&apos;re a Pro</h2>
              <p className="text-sm text-[#A8B2BD] mb-6">
                You have full access to every Pro feature.
              </p>
              {subscriptionSource === "stripe" && (
                <Button
                  onClick={handlePortal}
                  disabled={isLoading}
                  loading={isLoading}
                  variant="outline"
                  size="lg"
                  fullWidth

                >
                  {isLoading ? "Loading..." : "Manage Subscription"}
                </Button>
              )}
              {(subscriptionSource === "apple" || subscriptionSource === "google") && (
                <p className="text-xs text-[#6E7681]">
                  Manage your subscription in the {subscriptionSource === "apple" ? "App Store" : "Google Play Store"}.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto mb-12">
            {isPromoPremium && promoExpiryLabel && (
              <div className="mb-8 rounded-2xl border border-[#E8923A]/40 bg-gradient-to-br from-[#E8923A]/10 via-[#E8923A]/5 to-transparent p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-[#E8923A] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg text-[#F0F6FC] mb-1">
                      Promo Pro active — expires {promoExpiryLabel}
                    </h3>
                    <p className="text-sm text-[#A8B2BD]">
                      Lock in paid access so you don&apos;t lose your scorecard, insights,
                      or the best-window calculator when the promo ends. Your journal
                      data stays yours either way.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <button
                onClick={() => setPlan("monthly")}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  plan === "monthly"
                    ? "bg-[#E8923A]/15 text-[#E8923A] border border-[#E8923A]"
                    : "bg-[#161B22] text-[#A8B2BD] border border-[#21262D] hover:border-[#A8B2BD]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPlan("annual")}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${
                  plan === "annual"
                    ? "bg-[#E8923A]/15 text-[#E8923A] border border-[#E8923A]"
                    : "bg-[#161B22] text-[#A8B2BD] border border-[#21262D] hover:border-[#A8B2BD]"
                }`}
              >
                Annual
                <span className="absolute -top-2.5 -right-2 text-[9px] font-bold bg-[#2EA44F] text-white px-1.5 py-0.5 rounded-full">
                  -{SAVINGS_PCT}%
                </span>
              </button>
            </div>

            {/* Two columns */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Free */}
              <div className="p-6 bg-[#161B22] rounded-2xl border border-[#21262D]">
                <h3 className="text-sm font-bold text-[#A8B2BD] tracking-wider uppercase mb-1">Free</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-mono text-4xl font-bold text-[#F0F6FC]">$0</span>
                </div>
                <p className="text-xs text-[#6E7681] mb-6">Generous. Forever.</p>

                <ul className="space-y-3 mb-6">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-[#2EA44F] shrink-0 mt-0.5" />
                      <span className="text-sm text-[#A8B2BD]">{f}</span>
                    </li>
                  ))}
                </ul>

                {!isLoggedIn && (
                  <Button href="/signup" variant="outline" size="lg" fullWidth>
                    Get Started
                  </Button>
                )}
              </div>

              {/* Pro */}
              <div className="p-6 bg-[#161B22] rounded-2xl border-2 border-[#E8923A]/50 relative">
                <div className="absolute -top-3 left-6">
                  <span className="text-[10px] font-bold tracking-wider bg-[#E8923A] text-[#0D1117] px-3 py-1 rounded-full uppercase">
                    {foundersWindow ? "Free During Launch Year" : "Your Private Layer"}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#E8923A] tracking-wider uppercase mb-1">Pro</h3>
                {foundersWindow ? (
                  <>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="font-mono text-4xl font-bold text-[#F0F6FC]">$0</span>
                      <span className="text-sm text-[#A8B2BD]">/mo</span>
                    </div>
                    <p className="text-xs text-[#6E7681] mb-6">
                      Free for every angler{foundersEndLabel ? ` until ${foundersEndLabel}` : ""}. After:
                      ${MONTHLY_PRICE}/mo or ${ANNUAL_PRICE}/yr.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="font-mono text-4xl font-bold text-[#F0F6FC]">
                        ${plan === "annual" ? ANNUAL_MONTHLY : MONTHLY_PRICE}
                      </span>
                      <span className="text-sm text-[#A8B2BD]">/mo</span>
                    </div>
                    <p className="text-xs text-[#6E7681] mb-6">
                      {plan === "annual"
                        ? `$${ANNUAL_PRICE}/year — billed annually`
                        : `$${MONTHLY_PRICE}/month — billed monthly`}
                    </p>
                  </>
                )}

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#2EA44F] shrink-0 mt-0.5" />
                    <span className="text-sm text-[#F0F6FC] font-medium">Everything in Free, plus:</span>
                  </li>
                  {PRO_FEATURES.map((f) => (
                    <li key={f.label} className="flex items-start gap-2.5">
                      <f.icon className="h-4 w-4 text-[#E8923A] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-sm text-[#F0F6FC]">{f.label}</div>
                        <p className="text-[11px] text-[#6E7681] leading-snug">{f.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  loading={isLoading}
                  variant="solid"
                  size="lg"
                  fullWidth

                >
                  {isLoading
                    ? "Loading..."
                    : foundersWindow
                      ? (isLoggedIn ? "Lock in pricing" : "Sign Up — Pro Free")
                      : (isLoggedIn ? "Subscribe Now" : "Sign Up & Subscribe")}
                </Button>
                {foundersWindow && (
                  <p className="mt-3 text-[11px] text-[#6E7681] text-center">
                    No charge during the launch year. Pre-subscribe only if you want to lock in pricing for after.
                  </p>
                )}
              </div>
            </div>

            {/* Trust footer */}
            <div className="mt-8 rounded-2xl border border-[#21262D] bg-[#161B22]/60 p-5 text-center">
              <p className="text-xs text-[#A8B2BD] leading-relaxed">
                <span className="text-[#F0F6FC] font-semibold">30-day money-back guarantee.</span>{" "}
                Cancel anytime. Annual members get a renewal reminder 30 days before we charge again.
                Same price on iOS and web — your subscription works everywhere.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-[#6E7681]">
                <Link href="/refund-policy" className="hover:text-[#E8923A] transition-colors">
                  Refund Policy
                </Link>
                <span>•</span>
                <span>
                  Licensed guide? <Link href="/for-guides" className="underline hover:text-[#E8923A]">Get Pro free, forever.</Link>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Gift CTA */}
        <div className="max-w-md mx-auto text-center mt-12">
          <Link
            href="/gift"
            className="inline-flex items-center gap-2 text-sm text-[#A8B2BD] hover:text-[#E8923A] transition-colors"
          >
            <Gift className="h-4 w-4 text-[#E8923A]" />
            <span>
              {foundersWindow && foundersEndLabel
                ? `Gift a friend a paid year of Pro starting ${foundersEndLabel} — $19.99`
                : "Gift a year of Pro to a fishing buddy — $19.99"}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
