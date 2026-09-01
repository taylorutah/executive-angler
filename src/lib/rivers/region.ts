const WEST = new Set([
  "Alaska",
  "Arizona",
  "California",
  "Colorado",
  "Idaho",
  "Montana",
  "Nevada",
  "New Mexico",
  "Oregon",
  "Utah",
  "Washington",
  "Wyoming",
]);

class RiverRegion {
  static of(state: string | undefined): "west" | "east" | "" {
    if (!state) return "";
    return WEST.has(state) ? "west" : "east";
  }
}

export { RiverRegion };
