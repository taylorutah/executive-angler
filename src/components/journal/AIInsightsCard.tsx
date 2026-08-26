"use client";

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  TrendingUp,
  Lightbulb,
  Trophy,
} from "@/icons";

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

export default function AIInsightsCard() {
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

  return (
    <div className="bg-gradient-to-br from-[var(--surface-raised)] to-[#1a1f2a] rounded-2xl border border-[var(--action)]/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--action)]" />
          <h2 className="text-base font-bold text-[var(--text-primary)]">Fishing Insights</h2>
        </div>
        {generated && !loading && (
          <button
            onClick={generate}
            className="text-[var(--text-meta)] hover:text-[var(--text-primary)] transition-colors"
            title="Regenerate insights"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content states */}
      {loading ? (
        <div className="flex items-center gap-3 py-8 justify-center">
          <Loader2 className="h-5 w-5 text-[var(--action)] animate-spin" />
          <span className="text-sm text-[var(--text-body)]">
            Analyzing your fishing data...
          </span>
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button
            onClick={generate}
            className="text-xs text-[var(--action)] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : message ? (
        <div className="text-center py-6">
          <p className="text-sm text-[var(--text-body)]">{message}</p>
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
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        {item.title}
                      </h3>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-meta)] bg-[var(--surface-page)] px-2 py-0.5 rounded-full">
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-body)] leading-relaxed">
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
          <p className="text-sm text-[var(--text-meta)] mb-4">
            Claude analyzes your sessions, catches, and conditions to find patterns and
            deliver personalized coaching.
          </p>
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 bg-[var(--action)] hover:bg-[#d4822e] text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Generate Insights
          </button>
        </div>
      )}
    </div>
  );
}
