"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft, Sparkles, TrendingUp, TrendingDown,
  Thermometer, Cloud, Droplets, Timer, MapPin, Bug
} from "lucide-react";

interface Session {
  id: string;
  date: string;
  river_name: string | null;
  total_fish: number | null;
  weather: string | null;
  water_temp_f: number | null;
  water_clarity: string | null;
  section: string | null;
  weather_temp_f: number | null;
  weather_condition: string | null;
  weather_wind_mph: number | null;
  weather_humidity: number | null;
}

interface Catch {
  id: string;
  session_id: string;
  species: string | null;
  length_inches: number | null;
  fly_pattern_id: string | null;
  fly_size: string | null;
  fly_position: string | null;
  time_caught: string | null;
  quantities: number | null;
  flyName: string | null;
  flyType: string | null;
}

interface Insight {
  icon: React.ReactNode;
  title: string;
  body: string;
  type: "pattern" | "recommendation" | "trend" | "achievement";
}

export default function InsightsClient({
  sessions,
  catches,
}: {
  sessions: Session[];
  catches: Catch[];
}) {
  const insights = useMemo(() => {
    const results: Insight[] = [];
    if (sessions.length < 3) return results;

    // 1. Best water temperature range
    const sessionsWithTemp = sessions.filter(s => s.water_temp_f != null && (s.total_fish || 0) > 0);
    if (sessionsWithTemp.length >= 3) {
      const tempBuckets: Record<string, { total: number; count: number }> = {};
      sessionsWithTemp.forEach(s => {
        const temp = s.water_temp_f!;
        const bucket = `${Math.floor(temp / 5) * 5}-${Math.floor(temp / 5) * 5 + 5}`;
        if (!tempBuckets[bucket]) tempBuckets[bucket] = { total: 0, count: 0 };
        tempBuckets[bucket].total += s.total_fish || 0;
        tempBuckets[bucket].count++;
      });
      const bestBucket = Object.entries(tempBuckets)
        .map(([range, data]) => ({ range, avg: data.total / data.count }))
        .sort((a, b) => b.avg - a.avg)[0];
      if (bestBucket) {
        results.push({
          icon: <Thermometer className="h-5 w-5 text-red-400" />,
          title: "Sweet Spot Temperature",
          body: `Your best catch rate is when water temp is ${bestBucket.range}°F — averaging ${bestBucket.avg.toFixed(1)} fish per session. Plan trips when water temps hit this range.`,
          type: "pattern",
        });
      }
    }

    // 2. Best time of day
    const catchesWithTime = catches.filter(c => c.time_caught);
    if (catchesWithTime.length >= 5) {
      const hourBuckets: Record<string, number> = { Morning: 0, Midday: 0, Afternoon: 0, Evening: 0 };
      catchesWithTime.forEach(c => {
        const time = c.time_caught!;
        const match = time.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
        if (!match) return;
        let hour = parseInt(match[1]);
        if (match[3]?.toUpperCase() === "PM" && hour !== 12) hour += 12;
        if (match[3]?.toUpperCase() === "AM" && hour === 12) hour = 0;
        if (hour < 11) hourBuckets.Morning += (c.quantities || 1);
        else if (hour < 14) hourBuckets.Midday += (c.quantities || 1);
        else if (hour < 17) hourBuckets.Afternoon += (c.quantities || 1);
        else hourBuckets.Evening += (c.quantities || 1);
      });
      const bestTime = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0];
      if (bestTime && bestTime[1] > 0) {
        const total = Object.values(hourBuckets).reduce((s, v) => s + v, 0);
        const pct = Math.round((bestTime[1] / total) * 100);
        results.push({
          icon: <Timer className="h-5 w-5 text-amber-400" />,
          title: "Peak Fishing Time",
          body: `${pct}% of your catches come during the ${bestTime[0].toLowerCase()} — that's your golden window. ${bestTime[0] === "Morning" ? "Keep getting out early!" : bestTime[0] === "Evening" ? "Evening hatches are your bread and butter." : "You're a prime-time angler."}`,
          type: "pattern",
        });
      }
    }

    // 3. Hot streak / cold streak
    const sortedSessions = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
    if (sortedSessions.length >= 5) {
      let maxStreak = 0;
      let currentStreak = 0;
      sortedSessions.forEach(s => {
        if ((s.total_fish || 0) >= 5) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      });
      if (maxStreak >= 3) {
        results.push({
          icon: <TrendingUp className="h-5 w-5 text-green-400" />,
          title: "Hot Streak Record",
          body: `Your longest hot streak was ${maxStreak} consecutive sessions with 5+ fish. When you're dialed in, you stay dialed in.`,
          type: "achievement",
        });
      }
    }

    // 4. Best river
    const riverStats: Record<string, { sessions: number; fish: number }> = {};
    sessions.forEach(s => {
      const r = s.river_name || "Unknown";
      if (!riverStats[r]) riverStats[r] = { sessions: 0, fish: 0 };
      riverStats[r].sessions++;
      riverStats[r].fish += s.total_fish || 0;
    });
    const rivers = Object.entries(riverStats).filter(([, d]) => d.sessions >= 2);
    if (rivers.length >= 2) {
      const bestRiver = rivers.sort((a, b) => (b[1].fish / b[1].sessions) - (a[1].fish / a[1].sessions))[0];
      const avgAll = sessions.reduce((s, ses) => s + (ses.total_fish || 0), 0) / sessions.length;
      const riverAvg = bestRiver[1].fish / bestRiver[1].sessions;
      if (riverAvg > avgAll) {
        results.push({
          icon: <MapPin className="h-5 w-5 text-blue-400" />,
          title: "Your Home Water",
          body: `${bestRiver[0]} is your most productive river — ${riverAvg.toFixed(1)} fish/session vs your overall average of ${avgAll.toFixed(1)}. You clearly know this water well.`,
          type: "pattern",
        });
      }
    }

    // 5. Fly pattern insights
    const flyStats: Record<string, { count: number; type: string | null }> = {};
    catches.forEach(c => {
      if (c.flyName) {
        if (!flyStats[c.flyName]) flyStats[c.flyName] = { count: 0, type: c.flyType };
        flyStats[c.flyName].count += c.quantities || 1;
      }
    });
    const topFlies = Object.entries(flyStats).sort((a, b) => b[1].count - a[1].count);
    if (topFlies.length >= 3) {
      const top3 = topFlies.slice(0, 3);
      const typeMap: Record<string, number> = {};
      catches.forEach(c => { if (c.flyType) typeMap[c.flyType] = (typeMap[c.flyType] || 0) + (c.quantities || 1); });
      const topType = Object.entries(typeMap).sort((a, b) => b[1] - a[1])[0];
      results.push({
        icon: <Bug className="h-5 w-5 text-purple-400" />,
        title: "Fly Intelligence",
        body: `Your top 3 flies — ${top3.map(f => f[0]).join(", ")} — account for ${Math.round((top3.reduce((s, f) => s + f[1].count, 0) / catches.reduce((s, c) => s + (c.quantities || 1), 0)) * 100)}% of your catches.${topType ? ` Overall, ${topType[0]} flies are your most productive type.` : ""}`,
        type: "recommendation",
      });
    }

    // 6. Weather pattern
    const sessionsWithWeather = sessions.filter(s => s.weather_condition && (s.total_fish || 0) > 0);
    if (sessionsWithWeather.length >= 5) {
      const weatherBuckets: Record<string, { total: number; count: number }> = {};
      sessionsWithWeather.forEach(s => {
        const condition = s.weather_condition!.toLowerCase().includes("cloud") ? "Cloudy"
          : s.weather_condition!.toLowerCase().includes("rain") ? "Rain"
          : s.weather_condition!.toLowerCase().includes("sun") || s.weather_condition!.toLowerCase().includes("clear") ? "Sunny"
          : "Other";
        if (!weatherBuckets[condition]) weatherBuckets[condition] = { total: 0, count: 0 };
        weatherBuckets[condition].total += s.total_fish || 0;
        weatherBuckets[condition].count++;
      });
      const bestWeather = Object.entries(weatherBuckets)
        .filter(([k]) => k !== "Other")
        .map(([condition, data]) => ({ condition, avg: data.total / data.count }))
        .sort((a, b) => b.avg - a.avg)[0];
      if (bestWeather) {
        results.push({
          icon: <Cloud className="h-5 w-5 text-sky-400" />,
          title: "Weather Advantage",
          body: `You catch the most fish on ${bestWeather.condition.toLowerCase()} days — ${bestWeather.avg.toFixed(1)} per session. ${bestWeather.condition === "Cloudy" ? "Overcast skies = more surface activity." : bestWeather.condition === "Rain" ? "Rain activates feeding behavior — keep fishing!" : "Bright conditions don't slow you down."}`,
          type: "pattern",
        });
      }
    }

    // 7. Water clarity insight
    const sessionsWithClarity = sessions.filter(s => s.water_clarity && (s.total_fish || 0) > 0);
    if (sessionsWithClarity.length >= 4) {
      const clarityBuckets: Record<string, { total: number; count: number }> = {};
      sessionsWithClarity.forEach(s => {
        const clarity = s.water_clarity!;
        if (!clarityBuckets[clarity]) clarityBuckets[clarity] = { total: 0, count: 0 };
        clarityBuckets[clarity].total += s.total_fish || 0;
        clarityBuckets[clarity].count++;
      });
      const bestClarity = Object.entries(clarityBuckets)
        .map(([clarity, data]) => ({ clarity, avg: data.total / data.count }))
        .sort((a, b) => b.avg - a.avg)[0];
      if (bestClarity) {
        results.push({
          icon: <Droplets className="h-5 w-5 text-cyan-400" />,
          title: "Clarity Sweet Spot",
          body: `${bestClarity.clarity} water conditions produce your best results — ${bestClarity.avg.toFixed(1)} fish per session. Adjust your fly selection accordingly when water conditions change.`,
          type: "recommendation",
        });
      }
    }

    // 8. Trend — improving or declining?
    if (sortedSessions.length >= 6) {
      const half = Math.floor(sortedSessions.length / 2);
      const firstHalf = sortedSessions.slice(0, half);
      const secondHalf = sortedSessions.slice(half);
      const firstAvg = firstHalf.reduce((s, ses) => s + (ses.total_fish || 0), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, ses) => s + (ses.total_fish || 0), 0) / secondHalf.length;
      const change = ((secondAvg - firstAvg) / firstAvg) * 100;
      if (Math.abs(change) >= 10) {
        results.push({
          icon: change > 0 ? <TrendingUp className="h-5 w-5 text-green-400" /> : <TrendingDown className="h-5 w-5 text-red-400" />,
          title: change > 0 ? "Trending Up" : "Room to Improve",
          body: change > 0
            ? `Your recent sessions average ${secondAvg.toFixed(1)} fish vs ${firstAvg.toFixed(1)} earlier — a ${Math.round(change)}% improvement. Your skills are clearly progressing.`
            : `Your recent average is ${secondAvg.toFixed(1)} fish vs ${firstAvg.toFixed(1)} earlier. Try mixing up your approach — different flies, times, or sections might help.`,
          type: "trend",
        });
      }
    }

    return results;
  }, [sessions, catches]);

  const typeColors: Record<string, string> = {
    pattern: "border-blue-500/20 bg-blue-500/5",
    recommendation: "border-purple-500/20 bg-purple-500/5",
    trend: "border-green-500/20 bg-green-500/5",
    achievement: "border-amber-500/20 bg-amber-500/5",
  };

  const typeLabels: Record<string, string> = {
    pattern: "Pattern",
    recommendation: "Recommendation",
    trend: "Trend",
    achievement: "Achievement",
  };

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#E8923A]" />
            <h1 className="font-serif text-2xl text-[#F0F6FC]">AI Insights</h1>
          </div>
        </div>

        <p className="text-sm text-[#A8B2BD] mb-8">
          Personalized analysis based on {sessions.length} sessions and {catches.length} catches.
        </p>

        {insights.length === 0 ? (
          <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-12 text-center">
            <Sparkles className="h-12 w-12 text-[#6E7681] mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[#F0F6FC] mb-2">Not enough data yet</h2>
            <p className="text-sm text-[#A8B2BD]">
              Log at least 3 sessions with catch details to unlock AI-powered insights.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`rounded-xl border p-5 ${typeColors[insight.type]}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">{insight.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-[#F0F6FC]">{insight.title}</h3>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-[#6E7681] bg-[#0D1117] px-2 py-0.5 rounded-full">
                        {typeLabels[insight.type]}
                      </span>
                    </div>
                    <p className="text-sm text-[#A8B2BD] leading-relaxed">{insight.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
