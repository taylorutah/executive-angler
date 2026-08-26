// Slot 03 — FlyBoxView.
// Headline: "Build Your Fly Box"

import ScreenShell, { Colors as C } from "./ScreenShell";
import { Plus, Search, Filter } from "@/icons";
import { COPPER_400 } from "@/lib/palette";

type Fly = {
  name: string;
  sizes: string;
  count: number;
  color: string;
  notes: string;
};

const NYMPHS: Fly[] = [
  { name: "Pheasant Tail", sizes: "#14, #16, #18", count: 24, color: "#8B5A2B", notes: "Go-to dropper, Green River" },
  { name: "Perdigon", sizes: "#16, #18", count: 18, color: "#C9A227", notes: "Heavy, gets down fast" },
  { name: "Frenchie", sizes: "#14, #16", count: 14, color: "#D97D3B", notes: "Hot collar, murky water" },
  { name: "RS2 Emerger", sizes: "#18, #20, #22", count: 32, color: "#6B7280", notes: "Midge hatches, tailwaters" },
];

const DRIES: Fly[] = [
  { name: "Elk Hair Caddis", sizes: "#12, #14, #16", count: 16, color: "#A67C52", notes: "Evening riffles" },
  { name: "Parachute Adams", sizes: "#14, #16, #18", count: 22, color: "#4B5563", notes: "All-purpose mayfly" },
  { name: "Stimulator", sizes: "#10, #12, #14", count: 9, color: COPPER_400, notes: "Hopper-dropper rig" },
];

export default function FlyBoxMockup() {
  return (
    <ScreenShell activeTab="flies" glow="copper">
      <div style={{ padding: "50px 60px 0 60px" }}>
        {/* Header */}
        <div className="flex items-start justify-between" style={{ marginBottom: 22 }}>
          <div>
            <h1
              className="font-heading"
              style={{ fontSize: 104, color: C.chalk, lineHeight: 1, letterSpacing: "-0.01em" }}
            >
              Fly Box
            </h1>
            <p
              className="font-['IBM_Plex_Mono'] uppercase"
              style={{ fontSize: 24, color: C.slateDim, letterSpacing: "0.18em", marginTop: 18 }}
            >
              135 Flies · 12 Patterns
            </p>
          </div>
          <div className="flex items-center" style={{ gap: 14 }}>
            <button
              className="rounded-full flex items-center justify-center"
              style={{ width: 90, height: 90, backgroundColor: C.bgMid, border: `1px solid ${C.border}` }}
            >
              <Search width={36} height={36} color={C.chalk} strokeWidth={2} />
            </button>
            <button
              className="rounded-full flex items-center justify-center"
              style={{ width: 90, height: 90, backgroundColor: C.copper }}
            >
              <Plus width={42} height={42} color="#0D1117" strokeWidth={2.4} />
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center" style={{ gap: 12, marginTop: 18, marginBottom: 30 }}>
          <div
            className="rounded-full flex items-center"
            style={{
              backgroundColor: C.copper,
              padding: "14px 26px",
              gap: 10,
            }}
          >
            <Filter width={22} height={22} color="#0D1117" strokeWidth={2.4} />
            <span style={{ color: "#0D1117", fontSize: 22, fontWeight: 600 }}>All</span>
          </div>
          {["Nymphs", "Dries", "Streamers", "Midges"].map((t) => (
            <div
              key={t}
              className="rounded-full"
              style={{
                border: `1px solid ${C.border}`,
                padding: "14px 24px",
                color: C.slate,
                fontSize: 22,
              }}
            >
              {t}
            </div>
          ))}
        </div>

        {/* Hero stat card */}
        <div
          className="rounded-3xl"
          style={{
            backgroundColor: C.bgMid,
            border: `1px solid ${C.border}`,
            padding: "30px 40px",
            marginBottom: 34,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div
                className="font-['IBM_Plex_Mono'] uppercase"
                style={{ color: C.slateDim, fontSize: 20, letterSpacing: "0.2em" }}
              >
                Most Productive
              </div>
              <div
                className="font-heading"
                style={{ color: C.chalk, fontSize: 52, marginTop: 8, lineHeight: 1 }}
              >
                RS2 Emerger
              </div>
              <div
                className="font-['IBM_Plex_Mono']"
                style={{ color: C.slateDim, fontSize: 22, marginTop: 12 }}
              >
                17 catches · 6 rivers · 2026
              </div>
            </div>
            <div className="text-right">
              <div
                className="font-['IBM_Plex_Mono']"
                style={{ color: C.copper, fontSize: 84, lineHeight: 1, fontWeight: 600 }}
              >
                17
              </div>
              <div
                className="font-['IBM_Plex_Mono'] uppercase"
                style={{ color: C.slateDim, fontSize: 18, letterSpacing: "0.15em", marginTop: 8 }}
              >
                Catches
              </div>
            </div>
          </div>
        </div>

        {/* Nymphs section */}
        <SectionLabel label="Nymphs" count={NYMPHS.length} />
        <div className="flex flex-col" style={{ gap: 14 }}>
          {NYMPHS.map((f) => (
            <FlyRow key={f.name} fly={f} />
          ))}
        </div>

        {/* Dries section */}
        <div style={{ marginTop: 36 }}>
          <SectionLabel label="Dry Flies" count={DRIES.length} />
        </div>
        <div className="flex flex-col" style={{ gap: 14 }}>
          {DRIES.map((f) => (
            <FlyRow key={f.name} fly={f} />
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}

function SectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ marginBottom: 18 }}
    >
      <span
        className="font-['IBM_Plex_Mono'] uppercase"
        style={{ color: C.copper, fontSize: 24, letterSpacing: "0.2em", fontWeight: 600 }}
      >
        {label}
      </span>
      <span
        className="font-['IBM_Plex_Mono']"
        style={{ color: C.slateDim, fontSize: 22 }}
      >
        {count} patterns
      </span>
    </div>
  );
}

function FlyRow({ fly }: { fly: Fly }) {
  return (
    <div
      className="rounded-2xl flex items-center"
      style={{
        backgroundColor: C.bgMid,
        border: `1px solid ${C.border}`,
        padding: "22px 26px",
        gap: 22,
      }}
    >
      {/* Fly "thumb" — colored disk with hook-shaped silhouette */}
      <div
        className="rounded-2xl flex items-center justify-center relative overflow-hidden"
        style={{ width: 96, height: 96, backgroundColor: "#1c222c", flexShrink: 0 }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80">
          <ellipse cx="40" cy="42" rx="26" ry="12" fill={fly.color} opacity="0.9" />
          <ellipse cx="40" cy="42" rx="26" ry="12" fill="none" stroke={fly.color} strokeWidth="1" />
          <path
            d="M62 40 Q72 40 72 52 Q72 62 60 62"
            stroke="#9ca3af"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <line x1="18" y1="38" x2="10" y2="26" stroke="#d4d4d4" strokeWidth="2" opacity="0.7" />
          <line x1="22" y1="36" x2="16" y2="22" stroke="#d4d4d4" strokeWidth="2" opacity="0.5" />
        </svg>
      </div>
      <div className="flex-1" style={{ minWidth: 0 }}>
        <div style={{ color: C.chalk, fontSize: 32, fontWeight: 600, lineHeight: 1.15 }}>
          {fly.name}
        </div>
        <div
          className="font-['IBM_Plex_Mono']"
          style={{ color: C.teal, fontSize: 22, marginTop: 6 }}
        >
          {fly.sizes}
        </div>
        <div style={{ color: C.slateDim, fontSize: 20, marginTop: 4 }}>
          {fly.notes}
        </div>
      </div>
      <div className="text-right" style={{ flexShrink: 0 }}>
        <div
          className="font-['IBM_Plex_Mono']"
          style={{ color: C.copper, fontSize: 42, lineHeight: 1, fontWeight: 600 }}
        >
          {fly.count}
        </div>
        <div
          className="font-['IBM_Plex_Mono'] uppercase"
          style={{ color: C.slateDim, fontSize: 18, letterSpacing: "0.15em", marginTop: 6 }}
        >
          In Box
        </div>
      </div>
    </div>
  );
}
