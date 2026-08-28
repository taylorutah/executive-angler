// Dev index — links every mockup slot so you can eyeball them in a browser
// before the Playwright capture run.

import Link from "next/link";
import { COPPER_700 } from "@/lib/palette";

const SLOTS = [
  { id: "01-home",     title: "Every Fish. Every Fly. Every River.", source: "Home / Dashboard" },
  { id: "02-session",  title: "Relive the Day",                        source: "Session Detail" },
  { id: "03-flybox",   title: "Build Your Fly Box",                    source: "Fly Box" },
  { id: "04-river",    title: "Read the Water",                        source: "River Detail" },
  { id: "05-insights", title: "Patterns You Can't See",                source: "Insights (Pro)" },
  { id: "06-legacy",   title: "Your Legacy Starts Here",               source: "Me / Legacy" },
];

export default function MockupsIndex() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0D1117",
        color: "#F0F6FC",
        padding: "60px 80px",
      }}
    >
      <h1 style={{ fontSize: 44, marginBottom: 12 }}>App Store Mockup Stages</h1>
      <p style={{ color: "#A8B2BD", fontSize: 18, marginBottom: 40 }}>
        Each slot renders at 1320×2868 (iPhone 16/17 Pro Max native). The Playwright
        capture script snaps the #mockup-stage element from each page.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {SLOTS.map((s) => (
          <Link
            key={s.id}
            href={`/mockups/${s.id}`}
            style={{
              padding: 24,
              backgroundColor: "#161B22",
              border: "1px solid #21262D",
              borderRadius: 16,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <div style={{ color: COPPER_700, fontSize: 14, letterSpacing: 1, marginBottom: 8 }}>
              {s.id.toUpperCase()}
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>{s.title}</div>
            <div style={{ color: "#A8B2BD", fontSize: 15 }}>{s.source}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
