// Slot 02 — SessionDetailView.
// Headline: "Relive the Day"

import ScreenShell, { Colors as C } from "./ScreenShell";
import { ChevronLeft, Share2, Cloud, Fish } from "@/icons";

const CATCHES = [
  { species: "Rainbow Trout", length: '22.5"', fly: "Eggstasy Yellow #14", time: "10:08 AM" },
  { species: "Rainbow Trout", length: '18.5"', fly: "Perdigon #16", time: "9:14 AM" },
  { species: "Brown Trout", length: '16.0"', fly: "Stimulator #14", time: "9:42 AM" },
  { species: "Cutthroat", length: '14.0"', fly: "Hares Ear #16", time: "11:20 AM" },
];

export default function SessionMockup() {
  return (
    <ScreenShell activeTab="journal" glow="teal">
      <div style={{ padding: "40px 60px 0 60px" }}>
        {/* Nav row */}
        <div className="flex items-center justify-between" style={{ marginBottom: 36 }}>
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
            Session · 5.6 mi
          </span>
          <button
            className="rounded-full flex items-center justify-center"
            style={{ width: 80, height: 80, backgroundColor: C.bgMid, border: `1px solid ${C.border}` }}
          >
            <Share2 width={32} height={32} color={C.copper} strokeWidth={2} />
          </button>
        </div>

        {/* Session title */}
        <h1
          className="font-heading"
          style={{ fontSize: 96, color: C.chalk, lineHeight: 1.05, letterSpacing: "-0.01em" }}
        >
          Green River
        </h1>
        <p
          className="font-['IBM_Plex_Mono']"
          style={{ color: C.slateDim, fontSize: 26, marginTop: 14, letterSpacing: "0.08em" }}
        >
          A Section · Tuesday, April 21
        </p>

        {/* Map card */}
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{
            marginTop: 36,
            height: 680,
            background: "linear-gradient(145deg, #1d3a3f 0%, #0e1f22 70%, #0a1418 100%)",
            border: `1px solid ${C.border}`,
          }}
        >
          {/* River curve */}
          <svg width="1200" height="680" viewBox="0 0 1200 680" style={{ position: "absolute", inset: 0 }}>
            {/* Distant hills */}
            <path
              d="M0 420 L180 320 L340 360 L520 290 L720 350 L920 280 L1120 330 L1200 300 L1200 680 L0 680 Z"
              fill="#0e1a1f"
              opacity="0.7"
            />
            {/* River water */}
            <path
              d="M0 520 Q200 490 400 530 T800 510 T1200 520 L1200 680 L0 680 Z"
              fill="#0a1a22"
            />
            {/* Water highlights */}
            <path d="M40 530 Q240 510 440 540 T840 525 T1200 540" stroke="rgba(11,165,199,0.4)" strokeWidth="3" fill="none" />
            <path d="M0 560 Q200 545 400 570 T800 555 T1200 575" stroke="rgba(11,165,199,0.25)" strokeWidth="2" fill="none" />
            {/* GPS track */}
            <path
              d="M 160 580 C 280 420, 480 560, 620 380 S 960 260, 1080 180"
              stroke={C.copper}
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="0"
            />
            {/* Start pin */}
            <circle cx="160" cy="580" r="20" fill={C.teal} stroke="#0D1117" strokeWidth="6" />
            {/* End pin */}
            <circle cx="1080" cy="180" r="20" fill={C.copper} stroke="#0D1117" strokeWidth="6" />
            {/* Catch pins */}
            {[[420, 480], [620, 380], [820, 280], [940, 230]].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="18" fill={C.copper} />
                <circle cx={x} cy={y} r="18" fill="none" stroke={C.chalk} strokeWidth="3" />
              </g>
            ))}
          </svg>
        </div>

        {/* Stats row */}
        <div
          className="rounded-3xl flex items-center justify-between"
          style={{
            marginTop: 28,
            padding: "34px 50px",
            backgroundColor: C.bgMid,
            border: `1px solid ${C.border}`,
          }}
        >
          {[
            { label: "DURATION", value: "4:12" },
            { label: "CATCHES", value: "8" },
            { label: "DISTANCE", value: "1.3mi" },
          ].map((s, i, arr) => (
            <div key={s.label} className="flex items-center">
              <div>
                <div
                  className="font-['IBM_Plex_Mono']"
                  style={{ color: C.copper, fontSize: 72, lineHeight: 1, fontWeight: 600 }}
                >
                  {s.value}
                </div>
                <div
                  className="font-['IBM_Plex_Mono'] uppercase"
                  style={{ color: C.slateDim, fontSize: 20, letterSpacing: "0.15em", marginTop: 10 }}
                >
                  {s.label}
                </div>
              </div>
              {i < arr.length - 1 && (
                <div
                  style={{
                    width: 1,
                    height: 72,
                    backgroundColor: C.border,
                    marginLeft: 44,
                    marginRight: 44,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Weather + conditions strip */}
        <div className="flex" style={{ gap: 16, marginTop: 20 }}>
          <div
            className="rounded-2xl flex items-center"
            style={{
              flex: 1,
              backgroundColor: C.bgMid,
              border: `1px solid ${C.border}`,
              padding: "20px 26px",
              gap: 18,
            }}
          >
            <Cloud width={44} height={44} color={C.teal} strokeWidth={1.6} />
            <div className="flex-1">
              <div
                className="font-['IBM_Plex_Mono']"
                style={{ color: C.chalk, fontSize: 34, fontWeight: 500 }}
              >
                62°F
              </div>
              <div style={{ color: C.slateDim, fontSize: 20, marginTop: 4 }}>
                Overcast · SW 6 mph
              </div>
            </div>
          </div>
          <div
            className="rounded-2xl flex items-center"
            style={{
              flex: 1,
              backgroundColor: C.bgMid,
              border: `1px solid ${C.border}`,
              padding: "20px 26px",
              gap: 18,
            }}
          >
            <div
              className="rounded-full"
              style={{ width: 14, height: 14, backgroundColor: "#39D47B", marginLeft: 4 }}
            />
            <div className="flex-1">
              <div
                className="font-['IBM_Plex_Mono']"
                style={{ color: C.chalk, fontSize: 34, fontWeight: 500 }}
              >
                342 cfs
              </div>
              <div style={{ color: C.slateDim, fontSize: 20, marginTop: 4 }}>
                Normal flow · 52°F water
              </div>
            </div>
          </div>
        </div>

        {/* Catches header */}
        <div
          className="font-['IBM_Plex_Mono'] uppercase"
          style={{
            color: C.copper,
            fontSize: 24,
            letterSpacing: "0.2em",
            fontWeight: 600,
            marginTop: 44,
            marginBottom: 22,
          }}
        >
          Catches (8)
        </div>

        {/* Catch list */}
        <div className="flex flex-col" style={{ gap: 14 }}>
          {CATCHES.map((c) => (
            <div
              key={c.time}
              className="rounded-2xl flex items-center"
              style={{
                backgroundColor: C.bgMid,
                border: `1px solid ${C.border}`,
                padding: "22px 28px",
                gap: 24,
              }}
            >
              <div
                className="rounded-full flex items-center justify-center"
                style={{ width: 74, height: 74, backgroundColor: "#232a36" }}
              >
                <Fish width={38} height={38} color={C.copper} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div style={{ color: C.chalk, fontSize: 32, fontWeight: 600 }}>{c.species}</div>
                <div
                  className="font-['IBM_Plex_Mono']"
                  style={{ color: C.slateDim, fontSize: 22, marginTop: 4 }}
                >
                  {c.fly}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  className="font-['IBM_Plex_Mono']"
                  style={{ color: C.copper, fontSize: 36, fontWeight: 600 }}
                >
                  {c.length}
                </div>
                <div
                  className="font-['IBM_Plex_Mono']"
                  style={{ color: C.slateDim, fontSize: 20, marginTop: 4 }}
                >
                  {c.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}
