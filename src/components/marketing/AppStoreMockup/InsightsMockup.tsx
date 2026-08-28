// Slot 05 — InsightsView.
// Headline: "Patterns You Can't See"

import ScreenShell, { Colors as C } from "./ScreenShell";
import { Sparkles, Clock, Leaf, Droplets, TrendingUp } from "@/icons";

type Insight = {
  icon: typeof Sparkles;
  tag: string;
  title: string;
  body: string;
  stat: string;
  statLabel: string;
};

const INSIGHTS: Insight[] = [
  {
    icon: Clock,
    tag: "Time of Day",
    title: "You crush fish between 9 and 11 AM.",
    body: "Your catch rate is 2.4× higher in the late morning. Overcast days double the effect.",
    stat: "63%",
    statLabel: "OF YTD CATCHES",
  },
  {
    icon: Leaf,
    tag: "Fly Pattern",
    title: "RS2 on the Green outfishes everything 3 to 1.",
    body: "17 catches on #18 RS2 this season. Your next best is #16 Pheasant Tail at 6.",
    stat: "17 → 6",
    statLabel: "VS. NEXT-BEST",
  },
  {
    icon: Droplets,
    tag: "Flow Window",
    title: "Sweet spot: 280–380 cfs on the Middle Provo.",
    body: "You've landed 74% of your Provo fish inside this window. Current flow: 342 cfs.",
    stat: "342",
    statLabel: "CFS TODAY",
  },
];

export default function InsightsMockup() {
  return (
    <ScreenShell activeTab="home" glow="both">
      <div style={{ padding: "60px 60px 0 60px" }}>
        {/* Header */}
        <div className="flex items-start justify-between" style={{ marginBottom: 34 }}>
          <div>
            <div className="flex items-center" style={{ gap: 14, marginBottom: 16 }}>
              <Sparkles width={38} height={38} color={C.copper} />
              <span
                className="font-['IBM_Plex_Mono'] uppercase"
                style={{ color: C.copper, fontSize: 22, letterSpacing: "0.22em", fontWeight: 600 }}
              >
                Insights · Pro
              </span>
            </div>
            <h1
              className="font-heading"
              style={{ fontSize: 104, color: C.chalk, lineHeight: 1, letterSpacing: "-0.01em" }}
            >
              Patterns
            </h1>
            <p
              className="font-['IBM_Plex_Mono']"
              style={{ fontSize: 26, color: C.slateDim, marginTop: 18, letterSpacing: "0.04em" }}
            >
              Reading 18 sessions · 47 catches
            </p>
          </div>
        </div>

        {/* Hero prediction card */}
        <div
          className="rounded-3xl relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #1b2a3a 0%, #0f1822 100%)",
            border: `1px solid ${C.border}`,
            padding: "40px 44px",
            marginBottom: 34,
          }}
        >
          <div
            className="absolute pointer-events-none"
            style={{
              top: -120,
              right: -120,
              width: 420,
              height: 420,
              background: "radial-gradient(circle, rgba(11,165,199,0.28), transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div className="relative">
            <div
              className="font-['IBM_Plex_Mono'] uppercase"
              style={{ color: C.teal, fontSize: 22, letterSpacing: "0.22em", fontWeight: 600 }}
            >
              Tomorrow's Forecast
            </div>
            <div
              className="font-heading"
              style={{ color: C.chalk, fontSize: 58, lineHeight: 1.1, marginTop: 18, letterSpacing: "-0.01em" }}
            >
              Green River A-Section will fish hot.
            </div>
            <div
              style={{ color: C.slate, fontSize: 26, marginTop: 18, lineHeight: 1.4 }}
            >
              Overcast · SW 5–8 mph · flow holding at 1,200 cfs. Every one of these variables is
              inside your top quartile.
            </div>
            <div className="flex items-center" style={{ marginTop: 28, gap: 28 }}>
              <div>
                <div
                  className="font-['IBM_Plex_Mono']"
                  style={{ color: C.teal, fontSize: 68, fontWeight: 600, lineHeight: 1 }}
                >
                  92
                </div>
                <div
                  className="font-['IBM_Plex_Mono'] uppercase"
                  style={{ color: C.slateDim, fontSize: 18, letterSpacing: "0.18em", marginTop: 6 }}
                >
                  Confidence
                </div>
              </div>
              <div style={{ width: 1, height: 72, backgroundColor: C.border }} />
              <div>
                <div
                  className="font-['IBM_Plex_Mono']"
                  style={{ color: C.chalk, fontSize: 40, fontWeight: 500, lineHeight: 1 }}
                >
                  9–11 AM
                </div>
                <div
                  className="font-['IBM_Plex_Mono'] uppercase"
                  style={{ color: C.slateDim, fontSize: 18, letterSpacing: "0.18em", marginTop: 10 }}
                >
                  Best Window
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section label */}
        <div
          className="font-['IBM_Plex_Mono'] uppercase flex items-center"
          style={{
            color: C.copper,
            fontSize: 24,
            letterSpacing: "0.2em",
            fontWeight: 600,
            marginBottom: 22,
            gap: 14,
          }}
        >
          <TrendingUp width={28} height={28} color={C.copper} />
          What We Learned This Month
        </div>

        {/* Insight cards */}
        <div className="flex flex-col" style={{ gap: 20 }}>
          {INSIGHTS.map(({ icon: Icon, tag, title, body, stat, statLabel }) => (
            <div
              key={title}
              className="rounded-3xl"
              style={{
                backgroundColor: C.bgMid,
                border: `1px solid ${C.border}`,
                padding: "30px 36px",
              }}
            >
              <div className="flex items-start" style={{ gap: 22 }}>
                <div
                  className="rounded-2xl flex items-center justify-center"
                  style={{ width: 76, height: 76, backgroundColor: "rgba(232,146,58,0.12)", flexShrink: 0 }}
                >
                  <Icon width={40} height={40} color={C.copper} />
                </div>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <div
                    className="font-['IBM_Plex_Mono'] uppercase"
                    style={{ color: C.teal, fontSize: 18, letterSpacing: "0.2em", fontWeight: 600 }}
                  >
                    {tag}
                  </div>
                  <div
                    className="font-heading"
                    style={{ color: C.chalk, fontSize: 36, lineHeight: 1.15, marginTop: 10, letterSpacing: "-0.005em" }}
                  >
                    {title}
                  </div>
                  <div style={{ color: C.slate, fontSize: 22, marginTop: 12, lineHeight: 1.4 }}>
                    {body}
                  </div>
                </div>
              </div>
              <div
                className="flex items-baseline"
                style={{
                  borderTop: `1px solid ${C.border}`,
                  marginTop: 24,
                  paddingTop: 20,
                  gap: 14,
                }}
              >
                <span
                  className="font-['IBM_Plex_Mono']"
                  style={{ color: C.copper, fontSize: 56, fontWeight: 600, lineHeight: 1 }}
                >
                  {stat}
                </span>
                <span
                  className="font-['IBM_Plex_Mono'] uppercase"
                  style={{ color: C.slateDim, fontSize: 18, letterSpacing: "0.18em" }}
                >
                  {statLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}
