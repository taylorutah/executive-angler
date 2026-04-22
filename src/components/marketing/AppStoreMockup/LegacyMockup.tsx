// Slot 06 — Me / Legacy View.
// Headline: "Your Legacy Starts Here"

import ScreenShell, { Colors as C } from "./ScreenShell";
import { Trophy, Ruler, Fish, Calendar, ArrowUpRight, Mountain } from "lucide-react";

type Metric = {
  icon: typeof Trophy;
  value: string;
  label: string;
  delta: string;
  deltaUp: boolean;
};

const METRICS: Metric[] = [
  { icon: Fish,    value: "247",  label: "CAREER FISH",   delta: "+47 YTD",  deltaUp: true },
  { icon: Calendar,value: "92",   label: "SESSIONS",      delta: "+18 YTD",  deltaUp: true },
  { icon: Ruler,   value: '22.5"',label: "PERSONAL BEST", delta: "New",      deltaUp: true },
  { icon: Mountain,value: "14",   label: "RIVERS FISHED", delta: "+3 YTD",   deltaUp: true },
];

const PBS = [
  { species: "Rainbow Trout", length: '22.5"', river: "Green River · A Section",  date: "Apr 21, 2026" },
  { species: "Brown Trout",   length: '19.0"', river: "Provo River · Middle",     date: "Oct 08, 2025" },
  { species: "Cutthroat",     length: '17.5"', river: "Strawberry River",         date: "Jul 14, 2025" },
  { species: "Brook Trout",   length: '14.0"', river: "Smith & Morehouse",        date: "Sep 02, 2025" },
];

export default function LegacyMockup() {
  return (
    <ScreenShell activeTab="me" glow="copper">
      <div style={{ padding: "60px 60px 0 60px" }}>
        {/* Hero identity */}
        <div className="flex flex-col items-center" style={{ marginBottom: 38 }}>
          <div
            className="rounded-full flex items-center justify-center font-bold relative"
            style={{
              width: 180,
              height: 180,
              background: `linear-gradient(135deg, ${C.copper}, #d17d28)`,
              color: "#fff",
              fontSize: 72,
              boxShadow: "0 16px 48px rgba(232,146,58,0.35)",
            }}
          >
            T
            <div
              className="absolute rounded-full flex items-center justify-center"
              style={{
                bottom: -6,
                right: -6,
                width: 64,
                height: 64,
                backgroundColor: C.bg,
                border: `4px solid ${C.bg}`,
              }}
            >
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: C.teal,
                }}
              >
                <Trophy width={30} height={30} color="#0D1117" strokeWidth={2.2} />
              </div>
            </div>
          </div>
          <h1
            className="font-['DM_Serif_Display']"
            style={{ fontSize: 80, color: C.chalk, lineHeight: 1, marginTop: 28, letterSpacing: "-0.01em" }}
          >
            Taylor Warnick
          </h1>
          <div
            className="font-['IBM_Plex_Mono'] uppercase"
            style={{ color: C.copper, fontSize: 22, letterSpacing: "0.22em", marginTop: 14, fontWeight: 600 }}
          >
            Pro · Angler Since 2019
          </div>
        </div>

        {/* 2×2 metric grid */}
        <div className="grid grid-cols-2" style={{ gap: 16, marginBottom: 34 }}>
          {METRICS.map(({ icon: Icon, value, label, delta, deltaUp }) => (
            <div
              key={label}
              className="rounded-3xl"
              style={{
                backgroundColor: C.bgMid,
                border: `1px solid ${C.border}`,
                padding: "30px 32px",
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 22 }}>
                <Icon width={36} height={36} color={C.copper} strokeWidth={1.6} />
                <div
                  className="rounded-full flex items-center"
                  style={{
                    backgroundColor: deltaUp ? "rgba(57,212,123,0.14)" : "rgba(239,68,68,0.14)",
                    padding: "6px 14px",
                    gap: 6,
                  }}
                >
                  <ArrowUpRight
                    width={16}
                    height={16}
                    color={deltaUp ? "#39D47B" : "#EF4444"}
                    strokeWidth={2.4}
                  />
                  <span
                    className="font-['IBM_Plex_Mono']"
                    style={{
                      fontSize: 18,
                      color: deltaUp ? "#39D47B" : "#EF4444",
                      fontWeight: 600,
                    }}
                  >
                    {delta}
                  </span>
                </div>
              </div>
              <div
                className="font-['IBM_Plex_Mono']"
                style={{ color: C.chalk, fontSize: 76, lineHeight: 1, fontWeight: 600 }}
              >
                {value}
              </div>
              <div
                className="font-['IBM_Plex_Mono'] uppercase"
                style={{ color: C.slateDim, fontSize: 20, letterSpacing: "0.18em", marginTop: 14 }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* YTD progression sparkline */}
        <div
          className="rounded-3xl"
          style={{
            backgroundColor: C.bgMid,
            border: `1px solid ${C.border}`,
            padding: "30px 36px",
            marginBottom: 34,
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <span
              className="font-['IBM_Plex_Mono'] uppercase"
              style={{ color: C.copper, fontSize: 22, letterSpacing: "0.22em", fontWeight: 600 }}
            >
              YTD Catches
            </span>
            <div className="flex items-baseline" style={{ gap: 10 }}>
              <span
                className="font-['IBM_Plex_Mono']"
                style={{ color: C.chalk, fontSize: 44, fontWeight: 600, lineHeight: 1 }}
              >
                47
              </span>
              <span
                className="font-['IBM_Plex_Mono']"
                style={{ color: "#39D47B", fontSize: 20, fontWeight: 600 }}
              >
                +23%
              </span>
            </div>
          </div>
          <svg width="100%" height="160" viewBox="0 0 1100 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id="legacyfill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.copper} stopOpacity="0.35" />
                <stop offset="100%" stopColor={C.copper} stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Bars */}
            {[
              { x: 40,  h: 50  },
              { x: 130, h: 80  },
              { x: 220, h: 70  },
              { x: 310, h: 110 },
              { x: 400, h: 95  },
              { x: 490, h: 125 },
              { x: 580, h: 100 },
              { x: 670, h: 140 },
              { x: 760, h: 120 },
              { x: 850, h: 130 },
              { x: 940, h: 80  },
              { x: 1030,h: 60  },
            ].map((b, i) => (
              <rect
                key={i}
                x={b.x}
                y={140 - b.h}
                width={48}
                height={b.h}
                rx={6}
                fill={i === 7 ? C.copper : "rgba(232,146,58,0.35)"}
              />
            ))}
            {/* Month labels */}
            <g fill={C.slateDim} fontFamily="IBM Plex Mono" fontSize="18">
              {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m, i) => (
                <text key={m + i} x={40 + i * 90 + 24} y={158} textAnchor="middle">{m}</text>
              ))}
            </g>
          </svg>
        </div>

        {/* Personal bests */}
        <div
          className="font-['IBM_Plex_Mono'] uppercase"
          style={{
            color: C.copper,
            fontSize: 24,
            letterSpacing: "0.2em",
            fontWeight: 600,
            marginBottom: 22,
          }}
        >
          Personal Bests
        </div>

        <div className="flex flex-col" style={{ gap: 14 }}>
          {PBS.map((p, i) => (
            <div
              key={p.species}
              className="rounded-2xl flex items-center"
              style={{
                backgroundColor: C.bgMid,
                border: `1px solid ${C.border}`,
                padding: "22px 28px",
                gap: 22,
              }}
            >
              <div
                className="rounded-full flex items-center justify-center font-['IBM_Plex_Mono']"
                style={{
                  width: 58,
                  height: 58,
                  backgroundColor: i === 0 ? C.copper : "#232a36",
                  color: i === 0 ? "#0D1117" : C.slate,
                  fontSize: 26,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div style={{ color: C.chalk, fontSize: 30, fontWeight: 600 }}>
                  {p.species}
                </div>
                <div
                  className="font-['IBM_Plex_Mono']"
                  style={{ color: C.slateDim, fontSize: 20, marginTop: 4 }}
                >
                  {p.river} · {p.date}
                </div>
              </div>
              <div
                className="font-['IBM_Plex_Mono']"
                style={{ color: C.copper, fontSize: 40, fontWeight: 600, flexShrink: 0 }}
              >
                {p.length}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}
