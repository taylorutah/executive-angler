/**
 * Variant label suggestion logic.
 *
 * When an angler has multiple variants of the same canonical fly, they need a
 * short label to tell them apart in the chip strip. We auto-suggest a label
 * from the most-distinguishing axes the user has set (color first, then size,
 * then bead size). They can override with a custom label.
 *
 * Examples:
 *   { preferredColors: ["olive"], preferredSizes: ["18"], personalizations: { bead: { size: "2.0mm" } } }
 *     → "Olive 18 · 2.0mm"
 *   { preferredSizes: ["16"], personalizations: { body: { color: "black" } } }
 *     → "Black 16"
 *   {} → ""
 */

type Personalizations = Record<string, Record<string, string | undefined> | undefined>;

interface SuggestArgs {
  preferredColors?: string[] | null;
  preferredSizes?: string[] | null;
  personalizations?: Personalizations | null;
}

export function suggestVariantLabel(args: SuggestArgs): string {
  const personalizations = args.personalizations ?? {};

  const color =
    pickFirstNonEmpty(args.preferredColors) ??
    personalizations.body?.color ??
    personalizations.body?.material ??
    personalizations.thread?.color;

  const sizesArr = (args.preferredSizes ?? []).filter((s) => !!s && s.trim());
  const size = sizesArr.length > 0 ? sizesArr.join(",") : undefined;

  const beadSize = personalizations.bead?.size;

  return [color, size, beadSize]
    .filter((part): part is string => !!part && part.trim().length > 0)
    .map(toTitleCaseFirstWord)
    .join(" · ");
}

/**
 * Pick the label to render — user override beats suggestion.
 */
export function resolveVariantLabel(args: SuggestArgs & { variantLabel?: string | null }): string {
  if (args.variantLabel && args.variantLabel.trim()) return args.variantLabel.trim();
  return suggestVariantLabel(args);
}

function pickFirstNonEmpty(arr: string[] | null | undefined): string | undefined {
  if (!arr) return undefined;
  for (const x of arr) {
    if (x && x.trim()) return x.trim();
  }
  return undefined;
}

/**
 * "olive" → "Olive". Leaves later words alone so "tungsten slotted (heavy)"
 * stays readable.
 */
function toTitleCaseFirstWord(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
