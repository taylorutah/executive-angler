"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Scatter, ScatterChart, ZAxis, ComposedChart,
} from "recharts";
import { Fish, Loader2, Lock } from "lucide-react";
import Link from "next/link";

interface CatchPoint {
  date: string;
  flow_cfs: number | null;
  water_temp_f: number | null;
  fish_count: number;
  biggest_fish: number | null;
  top_fly: string | null;
  species: string[];
  weather: string | null;
}

interface DailyReading {
  date: string;
  discharge: number;
}

interface Props {
  riverId: string;
  siteId?: string;
}

export default function PersonalFlowOverlay({ riverId, siteId }: Props) {
  const [flowReadings, setFlowReadings] = useState<DailyReading[]>([]);
  const [catchPoints, setCatchPoints] = useState<CatchPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<"loading" | "none" | "free" | "premium">("loading");

  useEffect(() => {
    async function load() {
      try {
        // Fetch personal catch correlation data
        const insightsRes = await fetch(`/api/insights/river-conditions?riverId=${riverId}`);
        if (insightsRes.status === 401) {
          setAuthState("none");
          return;
        }
        if (insightsRes.status === 403) {
          setAuthState("free");
          return;
        }
        if (!insightsRes.ok) {
          setError("Could not load personal data");
          return;
        }
        setAuthState("premium");
        const insightsData = await insightsRes.json();
        setCatchPoints(insightsData.catches || []);

        // Fetch 12-month flow history
        const params = siteId ? `?siteId=${siteId}` : "";
        const flowRes = await fetch(`/api/river-history/${riverId}${params}`);
        if (flowRes.ok) {
          const flowData = await flowRes.json();
          setFlowReadings(flowData.readings || []);
        }
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [riverId, siteId]);

  // Merge flow + catch data
  const chartData = useMemo(() => {
    if (flowReadings.length === 0) return [];

    const catchByDate = new Map(catchPoints.map((c) => [c.date, c]));

    // Downsample flow to ~120 points but always include catch dates
    const catchDates = new Set(catchPoints.map((c) => c.date));
    const step = Math.max(1, Math.ceil(flowReadings.length / 120));

    return flowReadings
      .filter((r, i) => i % step === 0 || i === flowReadings.length - 1 || catchDates.has(r.date))
      .map((r) => {
        const c = catchByDate.get(r.date);
        return {
          date: r.date,
          discharge: r.discharge,
          fishCount: c?.fish_count || null,
          topFly: c?.top_fly || null,
          biggest: c?.biggest_fish || null,
          species: c?.species?.join(", ") || null,
          weather: c?.weather || null,
        };
      });
  }, [flowReadings, catchPoints]);

  // Stats about catch-to-flow correlation
  const correlationStats = useMemo(() => {
    const withFlow = catchPoints.filter((c) => c.flow_cfs !== null);
    if (withFlow.length < 2) return null;

    const flows = withFlow.map((c) => c.flow_cfs!);
    const sortedByFish = [...withFlow].sort((a, b) => b.fish_count - a.fish_count);
    const topHalf = sortedByFish.slice(0, Math.ceil(sortedByFish.length / 2));
    const topFlows = topHalf.map((c) => c.flow_cfs!);

    return {
      totalSessions: catchPoints.length,
      sessionsWithFlow: withFlow.length,
      flowMin: Math.min(...flows),
      flowMax: Math.max(...flows),
      sweetSpotMin: Math.min(...topFlows),
      sweetSpotMax: Math.max(...topFlows),
      bestDayFlow: sortedByFish[0]?.flow_cfs,
      bestDayFish: sortedByFish[0]?.fish_count,
      bestDayDate: sortedByFish[0]?.date,
    };
  }, [catchPoints]);

  if (loading) {
    return (
      <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6">
        <div className="flex items-center gap-2 text-[#6E7681]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading personal flow data...</span>
        </div>
      </div>
    );
  }

  // Not logged in
  if (authState === "none") return null;

  // Free user — teaser
  if (authState === "free") {
    return (
      <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6">
        <div className="flex items-center gap-3 mb-3">
          <Fish className="h-5 w-5 text-[#E8923A]" />
          <h3 className="text-sm font-bold text-[#F0F6FC]">Your Catches vs. Flow</h3>
          <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">PRO</span>
        </div>
        <div className="flex items-center gap-2 text-[#6E7681] text-sm">
          <Lock className="h-4 w-4" />
          <span>See your catch data overlaid on USGS flow charts.</span>
        </div>
        <Link href="/account" className="text-xs text-[#E8923A] hover:underline mt-2 inline-block">
          Upgrade to Pro →
        </Link>
      </div>
    );
  }

  // Premium but no data
  if (catchPoints.length === 0) return null;

  // Premium but no flow readings to overlay
  if (flowReadings.length < 7) return null;

  function formatMonth(dateStr: string) {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short" });
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5">
      <div className="flex items-center gap-3 mb-4">
        <Fish className="h-5 w-5 text-[#E8923A]" />
        <h3 className="text-sm font-bold text-[#F0F6FC]">Your Catches vs. Flow</h3>
        <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">PRO</span>
      </div>

      {/* Correlation stats */}
      {correlationStats && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[#0D1117] rounded-lg p-3 text-center">
            <p className="text-lg font-bold font-mono text-[#E8923A]">{correlationStats.totalSessions}</p>
            <p className="text-[10px] text-[#6E7681]">Sessions</p>
          </div>
          <div className="bg-[#0D1117] rounded-lg p-3 text-center">
            <p className="text-lg font-bold font-mono text-[#00B4D8]">
              {correlationStats.sweetSpotMin}–{correlationStats.sweetSpotMax}
            </p>
            <p className="text-[10px] text-[#6E7681]">Sweet Spot (cfs)</p>
          </div>
          <div className="bg-[#0D1117] rounded-lg p-3 text-center">
            <p className="text-lg font-bold font-mono text-green-400">
              {correlationStats.bestDayFish} fish
            </p>
            <p className="text-[10px] text-[#6E7681]">
              Best @ {correlationStats.bestDayFlow} cfs
            </p>
          </div>
        </div>
      )}

      {/* Chart with catch markers */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="flowGradientPersonal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E8923A" stopOpacity={0.2} />
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
              yAxisId="flow"
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
              tick={{ fontSize: 10, fill: "#6E7681" }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <YAxis
              yAxisId="fish"
              orientation="right"
              tick={{ fontSize: 10, fill: "#00B4D8" }}
              axisLine={false}
              tickLine={false}
              width={30}
              hide
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0D1117",
                border: "1px solid #21262D",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#F0F6FC",
              }}
              labelFormatter={(label) => formatDate(String(label))}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => {
                if (name === "discharge") return [`${Number(value).toLocaleString()} cfs`, "Flow"];
                if (name === "fishCount" && value) return [`${value} fish`, "Catches"];
                return [value, name];
              }}
            />
            {/* Flow area */}
            <Area
              yAxisId="flow"
              type="monotone"
              dataKey="discharge"
              stroke="#E8923A"
              strokeWidth={1.5}
              fill="url(#flowGradientPersonal)"
              dot={false}
            />
            {/* Catch markers as scatter points on the flow line */}
            <Scatter
              yAxisId="flow"
              dataKey="discharge"
              data={chartData.filter((d) => d.fishCount)}
              fill="#00B4D8"
              shape={(props: { cx?: number; cy?: number; payload?: { fishCount: number } }) => {
                const { cx = 0, cy = 0, payload } = props;
                const size = Math.min(12, 4 + (payload?.fishCount || 0));
                return (
                  <g>
                    <circle cx={cx} cy={cy} r={size} fill="#00B4D8" fillOpacity={0.3} stroke="#00B4D8" strokeWidth={1.5} />
                    <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="#F0F6FC" fontWeight="bold">
                      {payload?.fishCount}
                    </text>
                  </g>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] text-[#6E7681] mt-2 text-center">
        Bubbles = your sessions · Size = fish count · Flow data: USGS NWIS
      </p>
    </div>
  );
}
