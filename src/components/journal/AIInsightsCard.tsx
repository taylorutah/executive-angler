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
    border: "border-[var(--accent)]/30",
    bg: "bg-[var(--accent)]/10",
    label: "Pattern",
    icon: <TrendingUp className="h-4 w-4 text-[var(--accent)]" />,
  },
  recommendation: {
    border: "border-[var(--warning)]/30",
    bg: "bg-[var(--warning)]/10",
    label: "Recommendation",
    icon: <Lightbulb className="h-4 w-4 text-[var(--warning)]" />,
  },
  achievement: {
    border: "border-[var(--success)]/30",
    bg: "bg-[var(--success)]/10",
    label: "Achievement",
    icon: <Trophy className="h-4 w-4 text-[var(--success)]" />,
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
    <div className="ea-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--accent)]" />
          <h2 className="font-display text-base font-semibold text-[var(--text-1)]">Fishing Insights</h2>
        </div>
        {generated && !loading && (
          <button
            onClick={generate}
            className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors"
            title="Regenerate insights"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content states */}
      {loading ? (
        <div className="flex items-center gap-3 py-8 justify-center">
          <Loader2 className="h-5 w-5 text-[var(--accent)] animate-spin" />
          <span className="text-sm text-[var(--text-2)]">
            Analyzing your fishing data...
          </span>
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <p className="text-sm text-[var(--danger)] mb-3">{error}</p>
          <button
            onClick={generate}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : message ? (
        <div className="text-center py-6">
          <p className="text-sm text-[var(--text-2)]">{message}</p>
        </div>
      ) : insights.length > 0 ? (
        <div className="space-y-3">
          {insights.map((item, i) => {
            const config = typeConfig[item.type] || typeConfig.pattern;
            return (
              <div
                key={i}
                className={`rounded-[var(--radius-md)] border ${config.border} ${config.bg} p-4`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-[var(--text-1)]">
                        {item.title}
                      </h3>
                      <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-3)] bg-[var(--paper-deep)] px-2 py-0.5 rounded-[var(--radius-pill)]">
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-2)] leading-relaxed">
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
          <p className="text-sm text-[var(--text-3)] mb-4">
            Claude analyzes your sessions, catches, and conditions to find patterns and
            deliver personalized coaching.
          </p>
          <button
            onClick={generate}
            className="ea-btn ea-btn-primary"
          >
            <Sparkles className="h-4 w-4" />
            Generate Insights
          </button>
        </div>
      )}
    </div>
  );
}
