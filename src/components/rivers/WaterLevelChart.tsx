"use client";

import { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";

interface DailyReading {
  date: string;
  discharge: number;
}

interface Props {
  riverId: string;
  siteId?: string;
}

function formatMonth(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short" });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function WaterLevelChart({ riverId, siteId }: Props) {
  const [readings, setReadings] = useState<DailyReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const params = siteId ? `?siteId=${siteId}` : "";
        const res = await fetch(`/api/river-history/${riverId}${params}`);
        if (!res.ok) {
          setError("No historical data available");
          return;
        }
        const data = await res.json();
        setReadings(data.readings || []);
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [riverId, siteId]);

  const stats = useMemo(() => {
    if (readings.length === 0) return null;

    const values = readings.map(r => r.discharge);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
    const current = values[values.length - 1];
    const weekAgo = values.length > 7 ? values[values.length - 8] : values[0];
    const trend = current - weekAgo;
    const percentOfAvg = avg > 0 ? Math.round((current / avg) * 100) : 0;

    let level: "Low" | "Normal" | "High" | "Very High";
    if (percentOfAvg < 60) level = "Low";
    else if (percentOfAvg < 140) level = "Normal";
    else if (percentOfAvg < 200) level = "High";
    else level = "Very High";

    return { min, max, avg, current, trend, percentOfAvg, level };
  }, [readings]);

  // Downsample to ~90 points for performance
  const chartData = useMemo(() => {
    if (readings.length <= 90) return readings;
    const step = Math.ceil(readings.length / 90);
    return readings.filter((_, i) => i % step === 0 || i === readings.length - 1);
  }, [readings]);

  if (loading) {
    return (
      <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-4">
        <div className="flex items-center gap-2 text-[#6E7681]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading water levels…</span>
        </div>
      </div>
    );
  }

  if (error || !stats || readings.length < 7) {
    return null; // Silently hide if no data
  }

  const levelColors: Record<string, string> = {
    Low: "#3B82F6",
    Normal: "#22C55E",
    High: "#F59E0B",
    "Very High": "#EF4444",
  };

  return (
    <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#F0F6FC]">12-Month Water Level</h3>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              color: levelColors[stats.level],
              backgroundColor: `${levelColors[stats.level]}15`,
            }}
          >
            {stats.level}
          </span>
        </div>
      </div>

      {/* Current stats row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div>
          <p className="text-lg font-bold text-[#E8923A] leading-none">
            {stats.current.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#6E7681] mt-0.5">Current cfs</p>
        </div>
        <div>
          <p className="text-lg font-bold text-[#F0F6FC] leading-none">
            {stats.avg.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#6E7681] mt-0.5">12mo Avg</p>
        </div>
        <div>
          <p className="text-lg font-bold text-[#3B82F6] leading-none">
            {stats.min.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#6E7681] mt-0.5">12mo Low</p>
        </div>
        <div>
          <p className="text-lg font-bold text-[#EF4444] leading-none">
            {stats.max.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#6E7681] mt-0.5">12mo High</p>
        </div>
      </div>

      {/* 7-day trend */}
      <div className="flex items-center gap-1.5 mb-3">
        {stats.trend > 0 ? (
          <TrendingUp className="h-3.5 w-3.5 text-green-400" />
        ) : stats.trend < 0 ? (
          <TrendingDown className="h-3.5 w-3.5 text-red-400" />
        ) : (
          <Minus className="h-3.5 w-3.5 text-[#6E7681]" />
        )}
        <span className={`text-xs font-medium ${stats.trend > 0 ? "text-green-400" : stats.trend < 0 ? "text-red-400" : "text-[#6E7681]"}`}>
          {stats.trend > 0 ? "+" : ""}{stats.trend.toLocaleString()} cfs vs 7 days ago
        </span>
        <span className="text-xs text-[#6E7681] ml-1">
          ({stats.percentOfAvg}% of avg)
        </span>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E8923A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E8923A" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={formatMonth}
              tick={{ fontSize: 10, fill: "#6E7681" }}
              axisLine={{ stroke: "#21262D" }}
              tickLine={false}
              interval={Math.floor(chartData.length / 6)}
            />
            <YAxis
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
              tick={{ fontSize: 10, fill: "#6E7681" }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0D1117",
                border: "1px solid #21262D",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#F0F6FC",
              }}
              labelFormatter={(label: any) => formatDate(String(label))}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${Number(value).toLocaleString()} cfs`, "Flow"]}
            />
            <ReferenceLine
              y={stats.avg}
              stroke="#6E7681"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <Area
              type="monotone"
              dataKey="discharge"
              stroke="#E8923A"
              strokeWidth={1.5}
              fill="url(#flowGradient)"
              dot={false}
              activeDot={{ r: 3, fill: "#E8923A", stroke: "#0D1117", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] text-[#6E7681] mt-2 text-center">
        Dashed line = 12-month average · Source: USGS NWIS
      </p>
    </div>
  );
}
