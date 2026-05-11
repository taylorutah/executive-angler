import type { MaterialSlot } from "@/types/fly-v2";

export type BeadMaterial = "tungsten" | "brass" | "glass" | "none";

export interface ParsedBeadSpec {
  material?: BeadMaterial;
  weight_mm?: number;
  color?: string;
}

const MATERIAL_KEYWORDS: Record<BeadMaterial, RegExp> = {
  tungsten: /\btungsten\b/i,
  brass: /\bbrass\b/i,
  glass: /\bglass\b/i,
  none: /\bnone\b/i,
};

// Order matters — longest/most-specific first so "black nickel" wins over "black".
const COLOR_KEYWORDS = [
  "black nickel",
  "matte black",
  "metallic pink",
  "olive metallic",
  "fluorescent chartreuse",
  "fluorescent red",
  "fluorescent pink",
  "fluorescent orange",
  "hot orange",
  "hot pink",
  "light pink",
  "copper",
  "gold",
  "silver",
  "bronze",
  "nickel",
  "black",
  "white",
  "olive",
  "chartreuse",
  "pink",
  "orange",
  "red",
  "purple",
  "blue",
  "green",
];

export function parseBeadSpec(text: string | null | undefined): ParsedBeadSpec {
  if (!text) return {};
  const out: ParsedBeadSpec = {};

  for (const [mat, re] of Object.entries(MATERIAL_KEYWORDS) as [BeadMaterial, RegExp][]) {
    if (re.test(text)) {
      out.material = mat;
      break;
    }
  }

  const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*mm/i);
  if (weightMatch) {
    const n = parseFloat(weightMatch[1]);
    if (Number.isFinite(n)) out.weight_mm = n;
  }

  const lower = text.toLowerCase();
  for (const color of COLOR_KEYWORDS) {
    if (lower.includes(color)) {
      out.color = color;
      break;
    }
  }

  return out;
}

export function parseBeadFromBaseMaterials(
  baseMaterials: MaterialSlot[] | null | undefined,
): ParsedBeadSpec {
  if (!baseMaterials || baseMaterials.length === 0) return {};
  const beadSlot = baseMaterials.find((m) => m.slot?.toLowerCase() === "bead");
  return parseBeadSpec(beadSlot?.material);
}
