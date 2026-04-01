"use client";

import { useState } from "react";
import {
  Sparkles,
  Lock,
  Loader2,
  RefreshCw,
  TrendingUp,
  Lightbulb,
  Trophy,
} from "lucide-react";
import Link from "next/link";

interface AIInsight {
  title: string;
  insight: string;
  type: "pattern" | "recommendation" | "achievement";
}

const typeConfig: Record<
  string,
  { border: string; bg: string; label: string; icon: React.ReactNode }
> = {
  pattern: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    label: "Pattern",
    icon: <TrendingUp className="h-4 w-4 text-blue-400" />,
  },
  recommendation: {
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    label: "Recommendation",
    icon: <Lightbulb className="h-4 w-4 text-purple-400" />,
  },
  achievement: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    label: "Achievement",
    icon: <Trophy className="h-4 w-4 text-amber-400" />,
  },
};

export default function AIInsightsCard({ isPremium }: { isPremium: boolean }) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/journal/ai-insights", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate insights");
        return;
      }

      if (data.message) {
        setMessage(data.message);
        setInsights([]);
      } else {
        setInsights(data.insights || []);
      }
      setGenerated(true);
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // Locked state for non-premium users
  if (!isPremium) {
    return (
      <div className="bg-[#161B22] rounded-2xl border border-[#21262D] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-[#E8923A]" />
          <h2 className="text-base font-bold text-[#F0F6FC]">AI Fishing Coach</h2>
          <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
            PRO
          </span>
        </div>

        <div className="flex flex-col items-center text-center py-6">
          <Lock className="h-10 w-10 text-[#6E7681] mb-3" />
          <p className="text-sm text-[#A8B2BD] mb-4 max-w-xs">
            Unlock AI-powered fishing insights that analyze your patterns, identify what
            flies and conditions work best, and recommend how to catch more fish.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-[#E8923A] text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:bg-[#d4822e] transition-colors"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#161B22] to-[#1a1f2a] rounded-2xl border border-[#E8923A]/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#E8923A]" />
          <h2 className="text-base font-bold text-[#F0F6FC]">AI Fishing Coach</h2>
          <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
            PRO
          </span>
        </div>
        {generated && !loading && (
          <button
            onClick={generate}
            className="text-[#6E7681] hover:text-[#F0F6FC] transition-colors"
            title="Regenerate insights"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content states */}
      {loading ? (
        <div className="flex items-center gap-3 py-8 justify-center">
          <Loader2 className="h-5 w-5 text-[#E8923A] animate-spin" />
          <span className="text-sm text-[#A8B2BD]">
            Analyzing your fishing data...
          </span>
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button
            onClick={generate}
            className="text-xs text-[#E8923A] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : message ? (
        <div className="text-center py-6">
          <p className="text-sm text-[#A8B2BD]">{message}</p>
        </div>
      ) : insights.length > 0 ? (
        <div className="space-y-3">
          {insights.map((item, i) => {
            const config = typeConfig[item.type] || typeConfig.pattern;
            return (
              <div
                key={i}
                className={`rounded-xl border ${config.border} ${config.bg} p-4`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-[#F0F6FC]">
                        {item.title}
                      </h3>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-[#6E7681] bg-[#0D1117] px-2 py-0.5 rounded-full">
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-[#A8B2BD] leading-relaxed">
                      {item.insight}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Initial state — show generate button */
        <div className="text-center py-4">
          <p className="text-sm text-[#6E7681] mb-4">
            Claude analyzes your sessions, catches, and conditions to find patterns and
            deliver personalized coaching.
          </p>
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 bg-[#E8923A] hover:bg-[#d4822e] text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Generate Insights
          </button>
        </div>
      )}
    </div>
  );
}
