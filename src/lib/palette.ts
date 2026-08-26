/**
 * Primitive brand hexes. Keep in lockstep with `src/app/globals.css`.
 * Use CSS variables (`var(--action)`, `var(--action-hover)`) in the
 * document; import these only where a resolved hex is required
 * (Mapbox, OG images, Recharts fallbacks, global-error).
 */

export const PAPER = "#FAF6F0";
export const VELLUM = "#F2EDE4";
export const CARD = "#FFFFFF";
export const RULE = "#E2DACD";
/** oklch(0.26 0.02 50) — warm brown-black, same family as paper */
export const INK = "#2C211B";
/** oklch(0.40 0.016 50) — body; sRGB rounds to hue ~48 */
export const GRAPHITE = "#4F4540";
/** oklch(0.51 0.014 50) — meta; sRGB rounds to hue ~51 */
export const SLATE = "#6D645F";

export const RIVERBED = "#0B1112";
export const POOL = "#131B1D";
export const SHELF = "#1C2629";
export const CHALK = "#EEF2F1";
export const FOG = "#8B979A";

/** oklch(0.53 0.16 40) — action on light */
export const COPPER_700 = "#B4410D";
/** oklch(0.700 0.150 45) — action on dusk; hue 40 at L 0.74 reads salmon */
export const COPPER_400 = "#E97C48";
/**
 * Daylight action-hover. Target oklch(0.47 0.16 40) clips in sRGB;
 * this is the max-chroma in-gamut neighbour at hue 40: oklch(0.47 0.148 40).
 */
export const COPPER_HOVER_700 = "#9B3300";
/** Dusk action-hover — oklch(0.782 0.13 40), same family as copper-400 */
export const COPPER_HOVER_400 = "#FE9A77";

/** oklch(0.479 0.080 196) — same family as teal-300 (hue 201), not 216 */
export const TEAL_700 = "#086B6C";
/** Target oklch(0.72 0.13 200); sRGB rounds to this hex */
export const TEAL_300 = "#00BCC5";

export const RISE_700 = "#1F7A3D";
export const RISE_400 = "#3FB863";
export const CUT_700 = "#B3261E";
export const CUT_400 = "#F87171";
