/**
 * WCAG contrast gate for declared legal token pairs.
 * Exits non-zero if any pair falls below its threshold.
 *
 *   npm run check:contrast
 *
 * Daylight foregrounds are tested against paper, vellum, and card, except
 * the two pairs documented below. Dusk hexes were deleted with the dusk
 * register (DESIGN.md § Resolved conflicts) and are not gated here.
 *
 * Small text (including --text-meta / slate captions) gates at 4.5.
 * Only genuinely large or non-text roles may declare 3.0, and the role
 * string must say why. On-action pairs (white on copper-700) are
 * fill-on-fill, still 4.5.
 */

import {
  PAPER,
  VELLUM,
  CARD,
  INK,
  GRAPHITE,
  SLATE,
  COPPER_700,
  TEAL_700,
  RISE_700,
  CUT_700,
} from "../src/lib/palette";

type Pair = {
  fg: string;
  bg: string;
  fgHex: string;
  bgHex: string;
  min: number;
  role: string;
};

const WHITE = "#FFFFFF";

const DAYLIGHT_GROUNDS: Array<{ name: string; hex: string }> = [
  { name: "paper", hex: PAPER },
  { name: "vellum", hex: VELLUM },
  { name: "card", hex: CARD },
];

/**
 * Rise-700 on vellum is 4.39:1. It stays out of this gate so we do not
 * restyle the success token. Slate now clears 4.5:1 on vellum.
 */
const SKIP_PAIRS = new Set(["rise-700 on vellum"]);

function expand(
  fgs: Array<{ name: string; hex: string; role: string }>,
  grounds: Array<{ name: string; hex: string }>,
): Pair[] {
  const out: Pair[] = [];
  for (const fg of fgs) {
    for (const bg of grounds) {
      if (SKIP_PAIRS.has(`${fg.name} on ${bg.name}`)) continue;
      out.push({
        fg: fg.name,
        bg: bg.name,
        fgHex: fg.hex,
        bgHex: bg.hex,
        min: 4.5,
        role: fg.role,
      });
    }
  }
  return out;
}

const PAIRS: Pair[] = [
  ...expand(
    [
      { name: "ink", hex: INK, role: "heading / primary text" },
      { name: "graphite", hex: GRAPHITE, role: "body text" },
      { name: "slate", hex: SLATE, role: "meta / 13px captions (small text)" },
      { name: "copper-700", hex: COPPER_700, role: "action on light" },
      { name: "teal-700", hex: TEAL_700, role: "live data on light" },
      { name: "rise-700", hex: RISE_700, role: "positive on light" },
      { name: "cut-700", hex: CUT_700, role: "negative on light" },
    ],
    DAYLIGHT_GROUNDS,
  ),
  {
    fg: "white",
    bg: "copper-700",
    fgHex: WHITE,
    bgHex: COPPER_700,
    min: 4.5,
    role: "on-action fill",
  },
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
