/**
 * Primitive brand hexes. Keep in lockstep with `src/app/globals.css`.
 * Use CSS variables (`var(--accent)`, `var(--accent-hover)`) in the
 * document; import these only where a resolved hex is required
 * (Mapbox, OG images, Recharts fallbacks, global-error).
 *
 * Daylight is the only register — the dusk theme and its resolved hexes
 * (riverbed/pool/shelf/chalk/fog, copper-400, teal-300, rise/cut-400)
 * are deleted machinery (DESIGN.md § Resolved conflicts).
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
/** --text-3 — metadata/overlines. #616863 clears 4.5:1 on paper and paper-deep. */
export const SLATE = "#616863";

/** Daylight action = --accent, deep river green */
export const COPPER_700 = "#1E4D3B";
/** Daylight action-hover = --accent-hover */
export const COPPER_HOVER_700 = "#16382B";

/** Live-data signal = --accent */
export const TEAL_700 = "#1E4D3B";

export const RISE_700 = "#2E7D4F";
export const CUT_700 = "#A63A2E";
