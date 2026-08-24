/**
 * Bucket existing species labels so a filter can ask "trout" or "salmon"
 * without inventing which fish live where. Unknown labels keep their
 * slug and do not gain a family we did not read off the string.
 */
export function speciesTokens(names: string[]): string[] {
  const tokens = new Set<string>();
  for (const name of names ?? []) {
    const n = name.trim().toLowerCase();
    if (!n) continue;
    tokens.add(n.replace(/\s+/g, "-"));

    if (n.includes("steelhead")) tokens.add("steelhead");
    if (n.includes("salmon")) tokens.add("salmon");
    if (n.includes("grayling")) tokens.add("grayling");
    if (n.includes("char") || n.includes("dolly varden")) tokens.add("char");
    if (
      n.includes("bonefish") ||
      n.includes("permit") ||
      n.includes("tarpon") ||
      n.includes("redfish") ||
      n.includes("snook") ||
      n.includes("barracuda")
    ) {
      tokens.add("saltwater");
    }
    if (
      n.includes("bass") ||
      n.includes("pike") ||
      n.includes("muskellunge") ||
      n.includes("muskie")
    ) {
      tokens.add("warmwater");
    }
    if (n.includes("trout") && !n.includes("sea trout")) tokens.add("trout");
    if (n.includes("cutthroat")) tokens.add("cutthroat");
    if (n.includes("rainbow")) tokens.add("rainbow");
    if (n.includes("brown")) tokens.add("brown");
    if (n.includes("brook")) tokens.add("brook");
  }
  return [...tokens];
}

export const SPECIES_FILTER_OPTIONS = [
  { value: "trout", label: "Trout" },
  { value: "cutthroat", label: "Cutthroat" },
  { value: "salmon", label: "Salmon" },
  { value: "steelhead", label: "Steelhead" },
  { value: "char", label: "Char" },
  { value: "grayling", label: "Grayling" },
  { value: "saltwater", label: "Saltwater" },
  { value: "warmwater", label: "Warmwater" },
] as const;
