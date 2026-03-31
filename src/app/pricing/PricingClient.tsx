"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check, X, Sparkles, BarChart3, Clock, Leaf, Camera,
  Wrench, Lock, FileText, Brain, Waves, Bug, Cloud,
  CalendarRange, Crown, Zap
} from "lucide-react";

interface Props {
  isLoggedIn: boolean;
  isPremium: boolean;
}

const MONTHLY_PRICE = 4.99;
const ANNUAL_PRICE = 29.99;
const ANNUAL_MONTHLY = (ANNUAL_PRICE / 12).toFixed(2);
const SAVINGS_PCT = Math.round(((MONTHLY_PRICE * 12 - ANNUAL_PRICE) / (MONTHLY_PRICE * 12)) * 100);

const FEATURES = [
  { icon: Waves, label: "Live river conditions", desc: "USGS flow, gage height, water temp — updated every 15 min", free: false, pro: true },
  { icon: Clock, label: "Full session history", desc: "Free: 90 days. Pro: unlimited all-time access", free: "90 days", pro: "Unlimited" },
  { icon: BarChart3, label: "Advanced analytics", desc: "Catch trends, fly effectiveness, time-of-day, size trends", free: false, pro: true },
  { icon: Brain, label: "AI insights", desc: "Personalized recommendations from your fishing data", free: false, pro: true },
  { icon: Bug, label: "Hatch reports", desc: "What's hatching now across your rivers", free: false, pro: true },
  { icon: Cloud, label: "Conditions match", desc: "Know when your ideal conditions are happening", free: false, pro: true },
  { icon: CalendarRange, label: "Year vs year", desc: "Compare seasons side by side", free: false, pro: true },
  { icon: Leaf, label: "Fly patterns", desc: "Free: 10 patterns. Pro: unlimited", free: "10", pro: "Unlimited" },
  { icon: Camera, label: "Multi-photo catches", desc: "Add multiple photos to each catch", free: "1 photo", pro: "Unlimited" },
  { icon: Wrench, label: "Gear tracking", desc: "Track rods, reels, lines, and leader builds", free: false, pro: true },
  { icon: Lock, label: "Private sessions", desc: "Keep sessions visible only to you", free: false, pro: true },
  { icon: FileText, label: "Data export", desc: "CSV & PDF trip reports", free: false, pro: true },
];

const FREE_FEATURES = [
  "Log sessions & catches",
  "Photo uploads",
  "Explore rivers & destinations",
  "Fly library access",
  "Community feed",
  "Follow anglers",
  "Achievements & badges",
  "Basic stats",
];

export default function PricingClient({ isLoggedIn, isPremium }: Props) {
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");
  const [isLoading, setIsLoading] = useState(false);

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
      }
    } catch {
      alert("Something went wrong. Please try again.");
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
            <span className="text-xs font-semibold text-[#E8923A] tracking-wide">EXECUTIVE ANGLER PRO</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#F0F6FC] mb-4">
            Fish smarter, not harder
          </h1>
          <p className="text-lg text-[#A8B2BD] max-w-2xl mx-auto">
            Unlock analytics, insights, and tools that turn your fishing data into an unfair advantage.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {isPremium ? (
          /* Already premium */
          <div className="max-w-md mx-auto text-center mb-16">
            <div className="p-8 bg-[#161B22] rounded-2xl border border-[#E8923A]/30">
              <Crown className="h-10 w-10 text-[#E8923A] mx-auto mb-4" />
              <h2 className="font-serif text-2xl text-[#F0F6FC] mb-2">You&apos;re a Pro</h2>
              <p className="text-sm text-[#A8B2BD] mb-6">
                You have full access to all Executive Angler features.
              </p>
              <button
                onClick={handlePortal}
                disabled={isLoading}
                className="w-full py-3 rounded-lg bg-[#161B22] border border-[#21262D] text-[#F0F6FC] font-medium hover:border-[#E8923A] transition-colors disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Manage Subscription"}
              </button>
            </div>
          </div>
        ) : (
          /* Plan selector + CTA */
          <div className="max-w-3xl mx-auto mb-16">
            {/* Toggle */}
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

            {/* Cards: Free vs Pro side-by-side */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Free */}
              <div className="p-6 bg-[#161B22] rounded-2xl border border-[#21262D]">
                <h3 className="text-sm font-bold text-[#A8B2BD] tracking-wider uppercase mb-1">Free</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-mono text-4xl font-bold text-[#F0F6FC]">$0</span>
                </div>
                <p className="text-xs text-[#6E7681] mb-6">Forever free</p>

                <ul className="space-y-3 mb-6">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-[#2EA44F] shrink-0" />
                      <span className="text-sm text-[#A8B2BD]">{f}</span>
                    </li>
                  ))}
                </ul>

                {!isLoggedIn && (
                  <Link
                    href="/signup"
                    className="block w-full py-3 rounded-lg bg-[#161B22] border border-[#21262D] text-center text-[#F0F6FC] font-medium hover:border-[#A8B2BD] transition-colors"
                  >
                    Get Started
                  </Link>
                )}
              </div>

              {/* Pro */}
              <div className="p-6 bg-[#161B22] rounded-2xl border-2 border-[#E8923A]/50 relative">
                <div className="absolute -top-3 left-6">
                  <span className="text-[10px] font-bold tracking-wider bg-[#E8923A] text-[#0D1117] px-3 py-1 rounded-full uppercase">
                    Best Value
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#E8923A] tracking-wider uppercase mb-1">Pro</h3>
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

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#2EA44F] shrink-0" />
                    <span className="text-sm text-[#F0F6FC] font-medium">Everything in Free, plus:</span>
                  </li>
                  {FEATURES.filter(f => f.pro === true || typeof f.pro === "string").map((f) => (
                    <li key={f.label} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-[#E8923A] shrink-0" />
                      <span className="text-sm text-[#A8B2BD]">{f.label}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-[#E8923A] text-[#0D1117] font-bold hover:bg-[#D4751F] transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : isLoggedIn ? "Subscribe Now" : "Sign Up & Subscribe"}
                </button>

                <p className="text-[10px] text-[#6E7681] text-center mt-3">
                  Cancel anytime. 7-day free trial included.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Feature comparison table */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-2xl text-[#F0F6FC] text-center mb-8">Full Feature Comparison</h2>

          <div className="bg-[#161B22] rounded-2xl border border-[#21262D] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr,80px,80px] sm:grid-cols-[1fr,100px,100px] px-4 sm:px-6 py-3 border-b border-[#21262D] bg-[#0D1117]/50">
              <span className="text-[10px] font-bold text-[#6E7681] tracking-wider uppercase">Feature</span>
              <span className="text-[10px] font-bold text-[#6E7681] tracking-wider uppercase text-center">Free</span>
              <span className="text-[10px] font-bold text-[#E8923A] tracking-wider uppercase text-center">Pro</span>
            </div>

            {/* Free tier basics */}
            {FREE_FEATURES.map((f, i) => (
              <div key={f} className={`grid grid-cols-[1fr,80px,80px] sm:grid-cols-[1fr,100px,100px] px-4 sm:px-6 py-3 ${i > 0 ? "border-t border-[#21262D]/50" : ""}`}>
                <span className="text-sm text-[#A8B2BD]">{f}</span>
                <div className="flex justify-center"><Check className="h-4 w-4 text-[#2EA44F]" /></div>
                <div className="flex justify-center"><Check className="h-4 w-4 text-[#E8923A]" /></div>
              </div>
            ))}

            {/* Divider */}
            <div className="h-px bg-[#21262D]" />

            {/* Pro features */}
            {FEATURES.map((f) => (
              <div key={f.label} className="grid grid-cols-[1fr,80px,80px] sm:grid-cols-[1fr,100px,100px] px-4 sm:px-6 py-3 border-t border-[#21262D]/50">
                <div className="flex items-center gap-2.5">
                  <f.icon className="h-4 w-4 text-[#6E7681] shrink-0 hidden sm:block" />
                  <div>
                    <span className="text-sm text-[#F0F6FC]">{f.label}</span>
                    <p className="text-[11px] text-[#6E7681] mt-0.5 hidden sm:block">{f.desc}</p>
                  </div>
                </div>
                <div className="flex justify-center items-center">
                  {f.free === false ? (
                    <X className="h-4 w-4 text-[#6E7681]/40" />
                  ) : (
                    <span className="text-xs text-[#A8B2BD] font-mono">{f.free}</span>
                  )}
                </div>
                <div className="flex justify-center items-center">
                  {f.pro === true ? (
                    <Check className="h-4 w-4 text-[#E8923A]" />
                  ) : (
                    <span className="text-xs text-[#E8923A] font-mono font-semibold">{f.pro}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        {!isPremium && (
          <div className="max-w-md mx-auto text-center mt-16">
            <Zap className="h-8 w-8 text-[#E8923A] mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-[#F0F6FC] mb-2">Ready to level up?</h2>
            <p className="text-sm text-[#A8B2BD] mb-6">
              Same price on iOS, Android, and web. Your subscription works everywhere.
            </p>
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="px-8 py-3 rounded-lg bg-[#E8923A] text-[#0D1117] font-bold hover:bg-[#D4751F] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Loading..." : `Start Pro — $${plan === "annual" ? ANNUAL_PRICE + "/yr" : MONTHLY_PRICE + "/mo"}`}
            </button>
          </div>
        )}

        {/* Platform note */}
        <p className="text-center text-[11px] text-[#6E7681] mt-12 max-w-md mx-auto">
          Already subscribed via the iOS or Android app? Your Pro access syncs automatically.
          Just sign in with the same account.
        </p>
      </div>
    </div>
  );
}
