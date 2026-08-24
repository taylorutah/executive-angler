/**
 * WCAG contrast gate for declared legal token pairs.
 * Exits non-zero if any pair falls below its threshold.
 *
 *   npm run check:contrast
 *
 * Thresholds: 4.5:1 for running text, 3:1 for large text / non-text
 * boundaries (declared per pair).
 */

const PAIRS: Array<{
  fg: string;
  bg: string;
  fgHex: string;
  bgHex: string;
  min: number;
  role: string;
}> = [
  // Daylight text
  { fg: "ink", bg: "paper", fgHex: "#141814", bgHex: "#FAF6F0", min: 4.5, role: "heading text" },
  { fg: "graphite", bg: "paper", fgHex: "#3E4649", bgHex: "#FAF6F0", min: 4.5, role: "body text" },
  { fg: "slate", bg: "paper", fgHex: "#6C7679", bgHex: "#FAF6F0", min: 3, role: "labels only (large / non-text)" },
  { fg: "copper-700", bg: "paper", fgHex: "#A85C18", bgHex: "#FAF6F0", min: 4.5, role: "action on light" },
  { fg: "white", bg: "copper-700", fgHex: "#FFFFFF", bgHex: "#A85C18", min: 4.5, role: "on-action" },
  { fg: "teal-700", bg: "paper", fgHex: "#0E7C93", bgHex: "#FAF6F0", min: 4.5, role: "live data on light" },
  { fg: "rise-700", bg: "paper", fgHex: "#1F7A3D", bgHex: "#FAF6F0", min: 4.5, role: "positive on light" },
  { fg: "cut-700", bg: "paper", fgHex: "#B3261E", bgHex: "#FAF6F0", min: 4.5, role: "negative on light" },
  { fg: "ink", bg: "card", fgHex: "#141814", bgHex: "#FFFFFF", min: 4.5, role: "heading on card" },
  { fg: "graphite", bg: "vellum", fgHex: "#3E4649", bgHex: "#F2EDE4", min: 4.5, role: "body on raised" },

  // Dusk text
  { fg: "chalk", bg: "riverbed", fgHex: "#EEF2F1", bgHex: "#0B1112", min: 4.5, role: "heading on dusk" },
  { fg: "fog", bg: "riverbed", fgHex: "#8B979A", bgHex: "#0B1112", min: 4.5, role: "meta on dusk" },
  { fg: "copper-400", bg: "riverbed", fgHex: "#E8923A", bgHex: "#0B1112", min: 4.5, role: "action on dusk" },
  { fg: "teal-300", bg: "riverbed", fgHex: "#22C1DE", bgHex: "#0B1112", min: 4.5, role: "live data on dusk" },
  { fg: "rise-400", bg: "riverbed", fgHex: "#3FB863", bgHex: "#0B1112", min: 4.5, role: "positive on dusk" },
  { fg: "cut-400", bg: "riverbed", fgHex: "#F87171", bgHex: "#0B1112", min: 4.5, role: "negative on dusk" },
  { fg: "chalk", bg: "shelf", fgHex: "#EEF2F1", bgHex: "#1C2629", min: 4.5, role: "heading on raised dusk" },
  { fg: "riverbed", bg: "copper-400", fgHex: "#0B1112", bgHex: "#E8923A", min: 4.5, role: "on-action dusk" },
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function channel(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function main() {
  let failed = 0;
  console.log("token pair                          ratio   min    result  role");
  for (const p of PAIRS) {
    const ratio = contrastRatio(p.fgHex, p.bgHex);
    const ok = ratio + 1e-9 >= p.min;
    if (!ok) failed += 1;
    const label = `${p.fg} on ${p.bg}`.padEnd(34);
    console.log(
      `${label} ${ratio.toFixed(2).padStart(5)}:1  ${p.min.toFixed(1)}  ${ok ? "PASS" : "FAIL"}  ${p.role}`,
    );
  }
  if (failed > 0) {
    console.error(`\n${failed} pair(s) below threshold`);
    process.exit(1);
  }
  console.log(`\n${PAIRS.length} pairs OK`);
}

main();
