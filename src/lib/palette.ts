/**
 * Primitive brand hexes. Keep in lockstep with `src/app/globals.css`.
 * Use CSS variables (`var(--action)`, `var(--action-hover)`) in the
 * document; import these only where a resolved hex is required
 * (Mapbox, OG images, Recharts fallbacks, global-error).
 */

/**
 * Values follow DESIGN.md (warm paper + river green). Names are kept so
 * existing importers (Mapbox, OG, Recharts, styleguide) migrate untouched.
 */
export const PAPER = "#FAF9F5";
export const VELLUM = "#F2EFE8";
export const CARD = "#FFFFFF";
export const RULE = "#E4E0D6";
/** --ink — dark bands (footer, closing CTA); near-black green */
export const INK = "#131815";
/** --text-2 — body text */
export const GRAPHITE = "#525B55";
/** --text-3 — sparse metadata/overlines only (see DESIGN.md contrast note) */
export const SLATE = "#969E97";

export const RIVERBED = "#0B1112";
export const POOL = "#131B1D";
export const SHELF = "#1C2629";
export const CHALK = "#EEF2F1";
export const FOG = "#8B979A";

/** Daylight action = --accent, deep river green */
export const COPPER_700 = "#1E4D3B";
/** Dusk register action — retained until the register is ruled on */
export const COPPER_400 = "#E97C48";
/** Daylight action-hover = --accent-hover */
export const COPPER_HOVER_700 = "#16382B";
/** Dusk action-hover */
export const COPPER_HOVER_400 = "#FE9A77";

/** Live-data signal = --accent in daylight */
export const TEAL_700 = "#1E4D3B";
/** Dusk live-data signal */
export const TEAL_300 = "#00BCC5";

export const RISE_700 = "#2E7D4F";
export const RISE_400 = "#3FB863";
export const CUT_700 = "#A63A2E";
export const CUT_400 = "#F87171";
