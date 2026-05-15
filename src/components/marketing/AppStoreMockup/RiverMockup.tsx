// Slot 04 — RiverDetailView.
// Headline: "Read the Water"

import ScreenShell, { Colors as C } from "./ScreenShell";
import { ChevronLeft, Star, Droplets, Thermometer, Wind, MapPin } from "lucide-react";

export default function RiverMockup() {
  return (
    <ScreenShell activeTab="rivers" glow="teal">
      <div style={{ padding: "40px 60px 0 60px" }}>
        {/* Nav row */}
        <div className="flex items-center justify-between" style={{ marginBottom: 32 }}>
          <button
            className="rounded-full flex items-center justify-center"
            style={{ width: 80, height: 80, backgroundColor: C.bgMid, border: `1px solid ${C.border}` }}
          >
            <ChevronLeft width={38} height={38} color={C.chalk} strokeWidth={2.25} />
          </button>
          <span
            className="font-['IBM_Plex_Mono'] uppercase"
            style={{ color: C.slateDim, fontSize: 22, letterSpacing: "0.2em" }}
          >
            Utah · Tailwater
          </span>
          <button
            className="rounded-full flex items-center justify-center"
            style={{ width: 80, height: 80, backgroundColor: C.bgMid, border: `1px solid ${C.border}` }}
          >
            <Star width={32} height={32} color={C.copper} fill={C.copper} />
          </button>
        </div>

        {/* Compact hero — 140pt aesthetic */}
        <h1
          className="font-heading"
          style={{ fontSize: 96, color: C.chalk, lineHeight: 1, letterSpacing: "-0.01em" }}
        >
          Provo River
        </h1>
        <div
          className="flex items-center"
          style={{ marginTop: 14, gap: 12 }}
        >
          <MapPin width={24} height={24} color={C.slateDim} strokeWidth={1.8} />
          <span
            className="font-['IBM_Plex_Mono']"
            style={{ color: C.slateDim, fontSize: 24, letterSpacing: "0.08em" }}
          >
            Middle Provo · Heber Valley
          </span>
        </div>

        {/* Fishability card — Strava / Lululemon language */}
        <div
          className="rounded-3xl"
          style={{
            marginTop: 34,
            backgroundColor: C.bgMid,
            border: `1px solid ${C.border}`,
            padding: "40px 44px",
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 30 }}>
            <span
              className="font-['IBM_Plex_Mono'] uppercase"
              style={{ color: C.slateDim, fontSize: 22, letterSpacing: "0.22em" }}
            >
              Fishability
            </span>
            <div
              className="rounded-full flex items-center"
              style={{
                backgroundColor: "rgba(57,212,123,0.14)",
                border: "1px solid rgba(57,212,123,0.4)",
                padding: "8px 18px",
                gap: 10,
              }}
            >
              <div className="rounded-full" style={{ width: 12, height: 12, backgroundColor: "#39D47B" }} />
              <span
                className="font-['IBM_Plex_Mono'] uppercase"
                style={{ color: "#39D47B", fontSize: 20, letterSpacing: "0.15em", fontWeight: 600 }}
              >
                Prime
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <StatBlock icon={Droplets} value="342" unit="cfs" label="Flow" tint="teal" />
            <Divider />
            <StatBlock icon={Thermometer} value="52" unit="°F" label="Water" tint="teal" />
            <Divider />
            <StatBlock icon={Wind} value="6" unit="mph" label="Wind SW" tint="teal" />
          </div>

          {/* Sparkline flow chart */}
          <div style={{ marginTop: 36 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <span
                className="font-['IBM_Plex_Mono'] uppercase"
                style={{ color: C.slateDim, fontSize: 20, letterSpacing: "0.2em" }}
              >
                Flow · 30 Day
              </span>
              <div className="flex" style={{ gap: 8 }}>
                {["7D", "30D", "6M", "1Y"].map((t, i) => (
                  <span
                    key={t}
                    className="font-['IBM_Plex_Mono']"
                    style={{
                      fontSize: 18,
                      color: i === 1 ? C.chalk : C.slateDim,
                      backgroundColor: i === 1 ? C.border : "transparent",
                      padding: "6px 14px",
                      borderRadius: 999,
                      fontWeight: i === 1 ? 600 : 400,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <svg width="100%" height="140" viewBox="0 0 1100 140" preserveAspectRatio="none">
              <defs>
                <linearGradient id="flowfill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.teal} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={C.teal} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 92 L60 84 L120 88 L180 70 L240 76 L300 52 L360 60 L420 46 L480 58 L540 44 L600 50 L660 38 L720 54 L780 62 L840 50 L900 56 L960 48 L1020 62 L1100 54 L1100 140 L0 140 Z"
                fill="url(#flowfill)"
              />
              <path
                d="M0 92 L60 84 L120 88 L180 70 L240 76 L300 52 L360 60 L420 46 L480 58 L540 44 L600 50 L660 38 L720 54 L780 62 L840 50 L900 56 L960 48 L1020 62 L1100 54"
                stroke={C.teal}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="1100" cy="54" r="9" fill={C.teal} />
              <circle cx="1100" cy="54" r="4" fill="#0D1117" />
            </svg>
          </div>
        </div>

        {/* Community Intel */}
        <div
          className="rounded-3xl"
          style={{
            marginTop: 22,
            backgroundColor: C.bgMid,
            border: `1px solid ${C.border}`,
            padding: "30px 36px",
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 22 }}>
            <span
              className="font-['IBM_Plex_Mono'] uppercase"
              style={{ color: C.copper, fontSize: 22, letterSpacing: "0.22em", fontWeight: 600 }}
            >
              Community Intel
            </span>
            <span
              className="font-['IBM_Plex_Mono']"
              style={{ color: C.slateDim, fontSize: 20 }}
            >
              7D · 24 anglers
            </span>
          </div>
          <div className="flex flex-col" style={{ gap: 14 }}>
            {[
              { rank: 1, name: "#18 RS2 Emerger", detail: "42 catches · midges rising", copper: true },
              { rank: 2, name: "#16 Pheasant Tail", detail: "31 catches · midday drift" },
              { rank: 3, name: "#14 Parachute Adams", detail: "22 catches · evening surface" },
            ].map((w) => (
              <div key={w.rank} className="flex items-center" style={{ gap: 20 }}>
                <div
                  className="font-['IBM_Plex_Mono']"
                  style={{
                    color: w.copper ? C.copper : C.slateDim,
                    fontSize: 36,
                    fontWeight: 600,
                    width: 44,
                  }}
                >
                  {w.rank}
                </div>
                <div className="flex-1">
                  <div style={{ color: C.chalk, fontSize: 28, fontWeight: 600 }}>{w.name}</div>
                  <div
                    className="font-['IBM_Plex_Mono']"
                    style={{ color: C.slateDim, fontSize: 20, marginTop: 4 }}
                  >
                    {w.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hatch chart strip */}
        <div
          className="rounded-3xl"
          style={{
            marginTop: 22,
            backgroundColor: C.bgMid,
            border: `1px solid ${C.border}`,
            padding: "30px 36px",
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <span
              className="font-['IBM_Plex_Mono'] uppercase"
              style={{ color: C.copper, fontSize: 22, letterSpacing: "0.22em", fontWeight: 600 }}
            >
              Active Hatch · April
            </span>
          </div>
          <div className="flex flex-col" style={{ gap: 16 }}>
            {[
              { name: "Blue Winged Olive", pct: 0.82 },
              { name: "Midges (Chironomids)", pct: 0.68 },
              { name: "Caddis (Mother's Day)", pct: 0.31 },
            ].map((h) => (
              <div key={h.name}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <span style={{ color: C.chalk, fontSize: 24 }}>{h.name}</span>
                  <span
                    className="font-['IBM_Plex_Mono']"
                    style={{ color: C.slateDim, fontSize: 20 }}
                  >
                    {Math.round(h.pct * 100)}%
                  </span>
                </div>
                <div
                  className="rounded-full"
                  style={{ width: "100%", height: 10, backgroundColor: C.border, overflow: "hidden" }}
                >
                  <div
                    className="rounded-full"
                    style={{ width: `${h.pct * 100}%`, height: 10, backgroundColor: C.teal }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

function StatBlock({
  icon: Icon,
  value,
  unit,
  label,
}: {
  icon: typeof Droplets;
  value: string;
  unit: string;
  label: string;
  tint?: "teal" | "copper";
}) {
  return (
    <div style={{ flex: 1 }}>
      <Icon width={34} height={34} color={C.teal} strokeWidth={1.6} />
      <div className="flex items-baseline" style={{ gap: 8, marginTop: 14 }}>
        <span
          className="font-['IBM_Plex_Mono']"
          style={{ color: C.chalk, fontSize: 68, lineHeight: 1, fontWeight: 600 }}
        >
          {value}
        </span>
        <span
          className="font-['IBM_Plex_Mono']"
          style={{ color: C.slateDim, fontSize: 24 }}
        >
          {unit}
        </span>
      </div>
      <div
        className="font-['IBM_Plex_Mono'] uppercase"
        style={{ color: C.slateDim, fontSize: 18, letterSpacing: "0.18em", marginTop: 10 }}
      >
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: 1,
        height: 100,
        backgroundColor: C.border,
        marginLeft: 10,
        marginRight: 10,
      }}
    />
  );
}
