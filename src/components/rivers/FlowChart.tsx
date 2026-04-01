"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Loader2, Droplets, ChevronDown } from "lucide-react";

/* ── Types ─────────────────────────────────────────────── */

interface FlowPoint {
  datetime: string;
  value: number;
  unit: string;
}

interface SessionMarker {
  date: string;
  fishCount: number;
  topFly: string | null;
  species: string[];
  x: number;
  y: number;
  flow: number;
}

interface GaugeOption {
  site_id: string;
  name: string;
  section: string;
}

interface Props {
  usgsGaugeId: string | null; // JSON array string or single site ID or null
  riverName: string;
  riverId: string;
}

/* ── Helpers ───────────────────────────────────────────── */

function parseGauges(raw: string | null): GaugeOption[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed) as GaugeOption[];
    } catch {
      return [];
    }
  }
  return [{ site_id: trimmed, name: "Main Gauge", section: "Main" }];
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function downsample(points: FlowPoint[], maxPoints: number): FlowPoint[] {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  const result: FlowPoint[] = [];
  for (let i = 0; i < points.length; i++) {
    if (i % step === 0 || i === points.length - 1) {
      result.push(points[i]);
    }
  }
  return result;
}

/* ── SVG Chart Constants ───────────────────────────────── */

const CHART_WIDTH = 800;
const CHART_HEIGHT = 260;
const PADDING = { top: 20, right: 16, bottom: 36, left: 56 };
const PLOT_W = CHART_WIDTH - PADDING.left - PADDING.right;
const PLOT_H = CHART_HEIGHT - PADDING.top - PADDING.bottom;

/* ── Component ─────────────────────────────────────────── */

export default function FlowChart({ usgsGaugeId, riverName, riverId }: Props) {
  const gauges = useMemo(() => parseGauges(usgsGaugeId), [usgsGaugeId]);

  const [activeSiteId, setActiveSiteId] = useState(gauges[0]?.site_id || "");
  const [flowData, setFlowData] = useState<FlowPoint[]>([]);
  const [sessions, setSessions] = useState<SessionMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredSession, setHoveredSession] = useState<SessionMarker | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // No gauges linked
  if (gauges.length === 0) {
    return (
      <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6">
        <div className="flex items-center gap-3 mb-2">
          <Droplets className="h-5 w-5 text-[#6E7681]" />
          <h3 className="text-sm font-bold text-[#F0F6FC]">
            River Flow — {riverName}
          </h3>
        </div>
        <p className="text-sm text-[#6E7681]">
          No USGS gauge linked to this river.
        </p>
      </div>
    );
  }

  /* eslint-disable react-hooks/rules-of-hooks */

  // Fetch flow data when gauge changes
  useEffect(() => {
    if (!activeSiteId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(
          `/api/rivers/flow?siteId=${activeSiteId}&days=30`
        );
        if (!res.ok) {
          setError("Unable to load flow data");
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setFlowData(data.discharge || []);
          setSiteName(data.siteName || "");
        }
      } catch {
        if (!cancelled) setError("Failed to fetch flow data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeSiteId]);

  // Fetch user sessions on this river (auth-aware)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/insights/river-conditions?riverId=${riverId}`
        );
        if (res.status === 401) {
          // Not logged in — just skip session overlay
          setIsAuthenticated(false);
          return;
        }
        if (res.status === 403) {
          // Free user — still show chart without overlay
          setIsAuthenticated(true);
          return;
        }
        if (!res.ok) return;

        setIsAuthenticated(true);
        const data = await res.json();
        const catches: SessionMarker[] = (data.catches || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c: any) => ({
            date: c.date,
            fishCount: c.fish_count || 0,
            topFly: c.top_fly || null,
            species: c.species || [],
          })
        );
        if (!cancelled) setSessions(catches);
      } catch {
        // Silently skip
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [riverId]);

  // Downsample for rendering
  const chartPoints = useMemo(() => downsample(flowData, 300), [flowData]);

  // Compute scales
  const { minVal, maxVal, xScale, yScale, yTicks, xTicks } = useMemo(() => {
    if (chartPoints.length === 0) {
      return {
        minVal: 0,
        maxVal: 100,
        xScale: () => 0,
        yScale: () => 0,
        yTicks: [],
        xTicks: [],
      };
    }

    const values = chartPoints.map((p) => p.value);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const padding = (rawMax - rawMin) * 0.1 || 10;
    const mn = Math.max(0, rawMin - padding);
    const mx = rawMax + padding;

    const timestamps = chartPoints.map((p) => new Date(p.datetime).getTime());
    const tMin = Math.min(...timestamps);
    const tMax = Math.max(...timestamps);
    const tRange = tMax - tMin || 1;

    const xs = (datetime: string) => {
      const t = new Date(datetime).getTime();
      return PADDING.left + ((t - tMin) / tRange) * PLOT_W;
    };
    const ys = (val: number) => {
      return PADDING.top + PLOT_H - ((val - mn) / (mx - mn || 1)) * PLOT_H;
    };

    // Y axis ticks (5 ticks)
    const yTickCount = 5;
    const yTickStep = (mx - mn) / (yTickCount - 1);
    const yt = Array.from({ length: yTickCount }, (_, i) =>
      Math.round(mn + i * yTickStep)
    );

    // X axis ticks — pick ~6 evenly spaced dates
    const xTickCount = 6;
    const xTickStep = Math.floor(chartPoints.length / (xTickCount - 1)) || 1;
    const xt: string[] = [];
    for (let i = 0; i < chartPoints.length; i += xTickStep) {
      xt.push(chartPoints[i].datetime);
    }
    if (xt[xt.length - 1] !== chartPoints[chartPoints.length - 1].datetime) {
      xt.push(chartPoints[chartPoints.length - 1].datetime);
    }

    return {
      minVal: mn,
      maxVal: mx,
      xScale: xs,
      yScale: ys,
      yTicks: yt,
      xTicks: xt,
    };
  }, [chartPoints]);

  // Build SVG path
  const linePath = useMemo(() => {
    if (chartPoints.length === 0) return "";
    return chartPoints
      .map((p, i) => {
        const x = xScale(p.datetime);
        const y = yScale(p.value);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }, [chartPoints, xScale, yScale]);

  // Area path (fill under the line)
  const areaPath = useMemo(() => {
    if (chartPoints.length === 0) return "";
    const baseline = PADDING.top + PLOT_H;
    const firstX = xScale(chartPoints[0].datetime);
    const lastX = xScale(chartPoints[chartPoints.length - 1].datetime);
    return `${linePath} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
  }, [chartPoints, linePath, xScale]);

  // Map sessions to x positions on the chart timeframe
  const sessionMarkers = useMemo(() => {
    if (sessions.length === 0 || chartPoints.length === 0) return [];
    const timestamps = chartPoints.map((p) => new Date(p.datetime).getTime());
    const tMin = Math.min(...timestamps);
    const tMax = Math.max(...timestamps);

    return sessions
      .filter((s) => {
        const t = new Date(s.date + "T12:00:00").getTime();
        return t >= tMin && t <= tMax;
      })
      .map((s) => {
        const t = new Date(s.date + "T12:00:00").getTime();
        const x =
          PADDING.left + ((t - tMin) / (tMax - tMin || 1)) * PLOT_W;

        // Find nearest flow value for y position
        let nearestFlow = chartPoints[0].value;
        let nearestDist = Infinity;
        for (const p of chartPoints) {
          const pTime = new Date(p.datetime).getTime();
          const dist = Math.abs(pTime - t);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestFlow = p.value;
          }
        }

        return {
          ...s,
          x,
          y: yScale(nearestFlow),
          flow: nearestFlow,
        };
      });
  }, [sessions, chartPoints, yScale]);

  // Mean flow for reference line
  const meanFlow = useMemo(() => {
    if (chartPoints.length === 0) return 0;
    const sum = chartPoints.reduce((s, p) => s + p.value, 0);
    return Math.round(sum / chartPoints.length);
  }, [chartPoints]);

  // Hover handler
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (chartPoints.length === 0 || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX =
        ((e.clientX - rect.left) / rect.width) * CHART_WIDTH;

      if (
        mouseX < PADDING.left ||
        mouseX > CHART_WIDTH - PADDING.right
      ) {
        setHoveredIndex(null);
        return;
      }

      // Find nearest point
      let closest = 0;
      let closestDist = Infinity;
      for (let i = 0; i < chartPoints.length; i++) {
        const px = xScale(chartPoints[i].datetime);
        const dist = Math.abs(px - mouseX);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      }
      setHoveredIndex(closest);
    },
    [chartPoints, xScale]
  );

  /* eslint-enable react-hooks/rules-of-hooks */

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6">
        <div className="flex items-center gap-2 text-[#6E7681]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading 30-day flow data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || chartPoints.length === 0) {
    return (
      <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6">
        <div className="flex items-center gap-3 mb-2">
          <Droplets className="h-5 w-5 text-[#6E7681]" />
          <h3 className="text-sm font-bold text-[#F0F6FC]">
            River Flow — {riverName}
          </h3>
        </div>
        <p className="text-sm text-[#6E7681]">
          {error || "No flow data available for this gauge."}
        </p>
      </div>
    );
  }

  const currentFlow = chartPoints[chartPoints.length - 1];
  const activeGauge = gauges.find((g) => g.site_id === activeSiteId);

  return (
    <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Droplets className="h-5 w-5 text-[#00B4D8]" />
          <h3 className="text-sm font-bold text-[#F0F6FC]">
            30-Day Flow
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#6E7681]">
          <span className="font-mono text-[#E8923A] font-bold">
            {currentFlow.value.toLocaleString()} cfs
          </span>
          <span>now</span>
        </div>
      </div>

      {/* Gauge selector (if multiple gauges) */}
      {gauges.length > 1 && (
        <div className="relative mb-4">
          <button
            onClick={() => setSelectorOpen(!selectorOpen)}
            className="flex items-center gap-2 text-xs text-[#A8B2BD] bg-[#0D1117] rounded-lg px-3 py-2 border border-[#21262D] hover:border-[#E8923A]/40 transition-colors w-full"
          >
            <span className="truncate">
              {activeGauge?.section || activeGauge?.name || activeSiteId}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform ${selectorOpen ? "rotate-180" : ""}`}
            />
          </button>
          {selectorOpen && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-[#0D1117] border border-[#21262D] rounded-lg shadow-xl overflow-hidden">
              {gauges.map((g) => (
                <button
                  key={g.site_id}
                  onClick={() => {
                    setActiveSiteId(g.site_id);
                    setSelectorOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-xs transition-colors ${
                    g.site_id === activeSiteId
                      ? "text-[#E8923A] bg-[#E8923A]/5"
                      : "text-[#A8B2BD] hover:bg-[#161B22]"
                  }`}
                >
                  <span className="font-medium">{g.section}</span>
                  <span className="text-[#6E7681] ml-2">{g.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SVG Chart */}
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full h-auto"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            setHoveredIndex(null);
            setHoveredSession(null);
          }}
        >
          <defs>
            <linearGradient id="flowAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00B4D8" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#00B4D8" stopOpacity={0.01} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick) => (
            <line
              key={tick}
              x1={PADDING.left}
              y1={yScale(tick)}
              x2={CHART_WIDTH - PADDING.right}
              y2={yScale(tick)}
              stroke="#21262D"
              strokeWidth={0.5}
            />
          ))}

          {/* Y axis labels */}
          {yTicks.map((tick) => (
            <text
              key={`label-${tick}`}
              x={PADDING.left - 8}
              y={yScale(tick) + 3}
              textAnchor="end"
              fontSize={10}
              fill="#6E7681"
              fontFamily="monospace"
            >
              {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick}
            </text>
          ))}

          {/* X axis labels */}
          {xTicks.map((dt) => (
            <text
              key={dt}
              x={xScale(dt)}
              y={CHART_HEIGHT - 6}
              textAnchor="middle"
              fontSize={10}
              fill="#6E7681"
            >
              {formatShortDate(dt)}
            </text>
          ))}

          {/* Mean reference line */}
          <line
            x1={PADDING.left}
            y1={yScale(meanFlow)}
            x2={CHART_WIDTH - PADDING.right}
            y2={yScale(meanFlow)}
            stroke="#6E7681"
            strokeWidth={0.75}
            strokeDasharray="4 4"
          />
          <text
            x={CHART_WIDTH - PADDING.right + 4}
            y={yScale(meanFlow) + 3}
            fontSize={8}
            fill="#6E7681"
          >
            avg
          </text>

          {/* Area fill */}
          <path d={areaPath} fill="url(#flowAreaGrad)" />

          {/* Flow line */}
          <path
            d={linePath}
            fill="none"
            stroke="#00B4D8"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />

          {/* Session markers */}
          {sessionMarkers.map((sm, i) => (
            <g
              key={`session-${i}`}
              onMouseEnter={() => setHoveredSession(sm)}
              onMouseLeave={() => setHoveredSession(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Vertical line from marker to x-axis */}
              <line
                x1={sm.x}
                y1={sm.y}
                x2={sm.x}
                y2={PADDING.top + PLOT_H}
                stroke="#E8923A"
                strokeWidth={0.75}
                strokeDasharray="2 2"
                opacity={0.5}
              />
              {/* Outer glow */}
              <circle
                cx={sm.x}
                cy={sm.y}
                r={Math.min(14, 6 + sm.fishCount)}
                fill="#E8923A"
                fillOpacity={0.15}
                stroke="#E8923A"
                strokeWidth={1.5}
              />
              {/* Inner dot */}
              <circle
                cx={sm.x}
                cy={sm.y}
                r={4}
                fill="#E8923A"
              />
              {/* Fish count label */}
              {sm.fishCount > 0 && (
                <text
                  x={sm.x}
                  y={sm.y - Math.min(14, 6 + sm.fishCount) - 5}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="bold"
                  fill="#E8923A"
                >
                  {sm.fishCount}
                </text>
              )}
            </g>
          ))}

          {/* Hover crosshair */}
          {hoveredIndex !== null && chartPoints[hoveredIndex] && (
            <>
              <line
                x1={xScale(chartPoints[hoveredIndex].datetime)}
                y1={PADDING.top}
                x2={xScale(chartPoints[hoveredIndex].datetime)}
                y2={PADDING.top + PLOT_H}
                stroke="#F0F6FC"
                strokeWidth={0.5}
                strokeDasharray="2 2"
                opacity={0.4}
              />
              <circle
                cx={xScale(chartPoints[hoveredIndex].datetime)}
                cy={yScale(chartPoints[hoveredIndex].value)}
                r={4}
                fill="#00B4D8"
                stroke="#0D1117"
                strokeWidth={2}
              />
            </>
          )}
        </svg>

        {/* Hover tooltip */}
        {hoveredIndex !== null && chartPoints[hoveredIndex] && (
          <div
            className="absolute pointer-events-none bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-xs shadow-lg z-10"
            style={{
              left: `${(xScale(chartPoints[hoveredIndex].datetime) / CHART_WIDTH) * 100}%`,
              top: `${(yScale(chartPoints[hoveredIndex].value) / CHART_HEIGHT) * 100 - 14}%`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="text-[#F0F6FC] font-mono font-bold">
              {chartPoints[hoveredIndex].value.toLocaleString()} cfs
            </p>
            <p className="text-[#6E7681]">
              {formatFullDate(chartPoints[hoveredIndex].datetime)}
            </p>
          </div>
        )}

        {/* Session hover tooltip */}
        {hoveredSession && (
          <div
            className="absolute pointer-events-none bg-[#0D1117] border border-[#E8923A]/30 rounded-lg px-3 py-2 text-xs shadow-lg z-20"
            style={{
              left: `${(hoveredSession.x / CHART_WIDTH) * 100}%`,
              top: `${(hoveredSession.y / CHART_HEIGHT) * 100 - 20}%`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="text-[#E8923A] font-bold">
              {hoveredSession.fishCount} fish caught
            </p>
            <p className="text-[#F0F6FC]">
              {formatShortDate(hoveredSession.date + "T12:00:00")}
            </p>
            {hoveredSession.topFly && (
              <p className="text-[#6E7681]">Fly: {hoveredSession.topFly}</p>
            )}
            {hoveredSession.species.length > 0 && (
              <p className="text-[#6E7681]">
                {hoveredSession.species.join(", ")}
              </p>
            )}
            <p className="text-[#6E7681] font-mono">
              {hoveredSession.flow.toLocaleString()} cfs
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-[10px] text-[#6E7681]">
          {sessionMarkers.length > 0 && (
            <span className="text-[#E8923A]">
              {sessionMarkers.length} session{sessionMarkers.length !== 1 ? "s" : ""} overlaid
              {" · "}
            </span>
          )}
          Dashed line = 30-day avg ({meanFlow.toLocaleString()} cfs) · Source: USGS NWIS
        </p>
        {siteName && (
          <p className="text-[10px] text-[#6E7681] truncate max-w-[200px]">
            {siteName}
          </p>
        )}
      </div>
    </div>
  );
}
