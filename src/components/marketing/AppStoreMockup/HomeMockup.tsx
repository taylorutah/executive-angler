// Slot 01 — HomeView / Dashboard.
// Headline: "Every Fish. Every Fly. Every River."

import ScreenShell, { Colors as C } from "./ScreenShell";
import {
  BarChart3, Lightbulb, Bug, Droplets, Split, Share2,
  Medal, Leaf, Mountain, Wrench, Play
} from "@/icons";

const STATS = [
  { label: "FISH YTD", value: "47" },
  { label: "SESSIONS", value: "18" },
  { label: "PB", value: '22"' },
];

const SESSIONS = [
  {
    river: "Green River",
    location: "UTAH",
    time: "Today · 7:42 AM",
    fish: "14",
    duration: "3h 12m",
    best: '18"',
    tags: ["54°F", "#18 RS2", "1,240 cfs"],
  },
  {
    river: "Madison River",
    location: "MONTANA",
    time: "Mar 15 · 2:10 PM",
    fish: "9",
    duration: "2h 48m",
    best: '16"',
    tags: ["52°F", "PMD #16", "1,450 cfs"],
  },
];

const ACTIONS: { icon: typeof BarChart3; label: string }[] = [
  { icon: BarChart3, label: "Analytics" },
  { icon: Lightbulb, label: "Insights" },
  { icon: Bug, label: "Hatch" },
  { icon: Droplets, label: "Rivers" },
  { icon: Split, label: "Year vs Year" },
  { icon: Medal, label: "Badges" },
  { icon: Leaf, label: "Fly Box" },
  { icon: Mountain, label: "My Rivers" },
  { icon: Wrench, label: "Gear" },
  { icon: Share2, label: "Export" },
];

export default function HomeMockup() {
  return (
    <ScreenShell activeTab="home">
      <div style={{ padding: "60px 60px 0 60px" }}>
        {/* Header */}
        <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
          <div>
            <h1
              className="font-heading"
              style={{ fontSize: 104, color: C.chalk, lineHeight: 1, letterSpacing: "-0.01em" }}
            >
              Home
            </h1>
            <p
              className="font-['IBM_Plex_Mono'] uppercase"
              style={{
                fontSize: 26,
                color: C.slateDim,
                letterSpacing: "0.18em",
                marginTop: 18,
              }}
            >
              Good morning, Taylor
            </p>
          </div>
          <div
            className="rounded-full flex items-center justify-center font-bold"
            style={{
              width: 104,
              height: 104,
              background: `linear-gradient(135deg, ${C.copper}, #d17d28)`,
              color: "#fff",
              fontSize: 42,
            }}
          >
            T
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="rounded-3xl flex items-center justify-between"
          style={{
            backgroundColor: C.bgMid,
            border: `1px solid ${C.border}`,
            padding: "40px 48px",
            marginBottom: 48,
          }}
        >
          {STATS.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <div>
                <div
                  className="font-['IBM_Plex_Mono']"
                  style={{ color: C.copper, fontSize: 96, lineHeight: 1, fontWeight: 600 }}
                >
                  {s.value}
                </div>
                <div
                  className="font-['IBM_Plex_Mono'] uppercase"
                  style={{
                    color: C.slateDim,
                    fontSize: 22,
                    letterSpacing: "0.15em",
                    marginTop: 12,
                  }}
                >
                  {s.label}
                </div>
              </div>
              {i < STATS.length - 1 && (
                <div
                  style={{
                    width: 1,
                    height: 96,
                    backgroundColor: C.border,
                    marginLeft: 56,
                    marginRight: 56,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Recent sessions label */}
        <div className="flex items-center justify-between" style={{ marginBottom: 22 }}>
          <span
            className="font-['IBM_Plex_Mono'] uppercase"
            style={{
              color: C.copper,
              fontSize: 24,
              letterSpacing: "0.2em",
              fontWeight: 600,
            }}
          >
            Recent Sessions
          </span>
          <span
            className="font-['IBM_Plex_Mono']"
            style={{ color: C.teal, fontSize: 24 }}
          >
            View all
          </span>
        </div>

        {/* Session cards */}
        <div className="flex flex-col" style={{ gap: 24 }}>
          {SESSIONS.map((s) => (
            <div
              key={s.river}
              className="rounded-3xl"
              style={{
                backgroundColor: C.bgMid,
                border: `1px solid ${C.border}`,
                padding: 32,
              }}
            >
              <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
                <div>
                  <h3
                    className="font-heading"
                    style={{ fontSize: 54, color: C.chalk, lineHeight: 1 }}
                  >
                    {s.river}
                  </h3>
                  <p
                    className="font-['IBM_Plex_Mono']"
                    style={{ color: C.slateDim, fontSize: 22, marginTop: 12 }}
                  >
                    {s.time}
                  </p>
                </div>
                <span
                  className="font-['IBM_Plex_Mono']"
                  style={{ color: C.slateDim, fontSize: 22, letterSpacing: 2 }}
                >
                  {s.location}
                </span>
              </div>

              <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
                <SessionStat value={s.fish} label="FISH" color={C.copper} />
                <SessionStat value={s.duration} label="TIME" color={C.chalk} />
                <SessionStat value={s.best} label="BEST" color={C.chalk} />
              </div>

              <div className="flex flex-wrap" style={{ gap: 10 }}>
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="font-['IBM_Plex_Mono']"
                    style={{
                      fontSize: 22,
                      color: C.teal,
                      backgroundColor: "rgba(11,165,199,0.10)",
                      border: "1px solid rgba(11,165,199,0.22)",
                      borderRadius: 999,
                      padding: "8px 18px",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions grid */}
        <div
          className="grid grid-cols-5"
          style={{ gap: 14, marginTop: 42 }}
        >
          {ACTIONS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-2xl flex flex-col items-center justify-center"
              style={{
                backgroundColor: C.bgMid,
                border: `1px solid ${C.border}`,
                padding: "22px 6px",
                gap: 10,
                minHeight: 140,
              }}
            >
              <Icon width={44} height={44} color={C.copper} />
              <span
                style={{
                  color: C.chalk,
                  fontSize: 18,
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Start Session FAB */}
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            backgroundColor: C.copper,
            marginTop: 42,
            height: 140,
            boxShadow: "0 16px 40px rgba(232,146,58,0.28)",
            gap: 20,
          }}
        >
          <div
            className="rounded-full flex items-center justify-center"
            style={{ width: 60, height: 60, border: `3px solid ${C.bg}` }}
          >
            <Play width={32} height={32} fill={C.bg} stroke={C.bg} />
          </div>
          <span
            style={{ color: C.bg, fontSize: 44, fontWeight: 700, letterSpacing: "-0.01em" }}
          >
            Start Session
          </span>
        </div>
      </div>
    </ScreenShell>
  );
}

function SessionStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div>
      <div
        className="font-['IBM_Plex_Mono']"
        style={{ color, fontSize: 62, lineHeight: 1, fontWeight: 500 }}
      >
        {value}
      </div>
      <div
        className="font-['IBM_Plex_Mono'] uppercase"
        style={{ color: C.slateDim, fontSize: 20, letterSpacing: "0.15em", marginTop: 10 }}
      >
        {label}
      </div>
    </div>
  );
}
