"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Scatter, ScatterChart, ZAxis, ComposedChart,
} from "recharts";
import { Fish } from "@/icons";
import { useAuth } from "@/lib/auth-context";
import { fetchOnce } from "./fetch-once";
import { CARD, COPPER_700, GRAPHITE, RULE, SLATE } from "@/lib/palette";

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
  const { user, isLoading: authLoading } = useAuth();
  const [flowReadings, setFlowReadings] = useState<DailyReading[]>([]);
  const [catchPoints, setCatchPoints] = useState<CatchPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Owner-scoped insights — never requested without a session.
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    async function load() {
      try {
        const insightsRes = await fetchOnce(`/api/insights/river-conditions?riverId=${riverId}`);
        if (!insightsRes.ok) return;
        const insightsData = await insightsRes.json();
        setCatchPoints(insightsData.catches || []);

        // Fetch 12-month flow history
        const params = siteId ? `?siteId=${siteId}` : "";
        const flowRes = await fetchOnce(`/api/river-history/${riverId}${params}`);
        if (flowRes.ok) {
          const flowData = await flowRes.json();
          setFlowReadings(flowData.readings || []);
        }
      } catch {
        // Silent — this panel is additive to the public flow chart above it.
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [riverId, siteId, user, authLoading]);

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

  if (!user) return null;

  if (loading) return null;

  // No catch data yet
  if (catchPoints.length === 0) return null;

  // No flow readings to overlay
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
    <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center gap-3 mb-4">
        <Fish className="h-5 w-5 text-[var(--accent)]" />
        <h3 className="text-sm font-semibold text-[var(--text-1)]">Your Catches vs. Flow</h3>
      </div>

      {/* Correlation stats */}
      {correlationStats && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[var(--paper-deep)] rounded-[var(--radius-md)] p-3 text-center">
            <p className="num text-lg font-semibold text-[var(--text-1)]">{correlationStats.totalSessions}</p>
            <p className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--text-3)]">Sessions</p>
          </div>
          <div className="bg-[var(--paper-deep)] rounded-[var(--radius-md)] p-3 text-center">
            <p className="num text-lg font-semibold text-[var(--text-1)]">
              {correlationStats.sweetSpotMin}–{correlationStats.sweetSpotMax}
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--text-3)]">Sweet Spot (cfs)</p>
          </div>
          <div className="bg-[var(--paper-deep)] rounded-[var(--radius-md)] p-3 text-center">
            <p className="num text-lg font-semibold text-[var(--text-1)]">
              {correlationStats.bestDayFish} fish
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--text-3)]">
              Best @ {correlationStats.bestDayFlow} cfs
            </p>
          </div>
        </div>
      )}

      {/* Chart with catch markers */}
      <div className="h-56 w-full">
        {/* Resolved height (not min) so Recharts cannot compute 0 on first paint.
            Seed a real width — `-1` still collapses the container. */}
        <ResponsiveContainer
          width="100%"
          height={224}
          initialDimension={{ width: 640, height: 224 }}
        >
          <ComposedChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="flowGradientPersonal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COPPER_700} stopOpacity={0.2} />
                <stop offset="95%" stopColor={COPPER_700} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={formatMonth}
              tick={{ fontSize: 10, fill: SLATE }}
              axisLine={{ stroke: RULE }}
              tickLine={false}
              interval={Math.floor(chartData.length / 6)}
            />
            <YAxis
              yAxisId="flow"
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
              tick={{ fontSize: 10, fill: SLATE }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <YAxis
              yAxisId="fish"
              orientation="right"
              tick={{ fontSize: 10, fill: SLATE }}
              axisLine={false}
              tickLine={false}
              width={30}
              hide
            />
            <Tooltip
              contentStyle={{
                backgroundColor: CARD,
                border: `1px solid ${RULE}`,
                borderRadius: "6px",
                fontSize: "12px",
                color: GRAPHITE,
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
              stroke={COPPER_700}
              strokeWidth={1.5}
              fill="url(#flowGradientPersonal)"
              dot={false}
            />
            {/* Catch markers as scatter points on the flow line */}
            <Scatter
              yAxisId="flow"
              dataKey="discharge"
              data={chartData.filter((d) => d.fishCount)}
              fill={COPPER_700}
              shape={(props: { cx?: number; cy?: number; payload?: { fishCount: number } }) => {
                const { cx = 0, cy = 0, payload } = props;
                const size = Math.min(12, 4 + (payload?.fishCount || 0));
                return (
                  <g>
                    <circle cx={cx} cy={cy} r={size} fill={COPPER_700} fillOpacity={0.3} stroke={COPPER_700} strokeWidth={1.5} />
                    <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill={CARD} fontWeight={600}>
                      {payload?.fishCount}
                    </text>
                  </g>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-[var(--text-3)] mt-2 text-center">
        Bubbles = your sessions · Size = fish count · Flow data: USGS NWIS
      </p>
    </div>
  );
}
