/**
 * Destination browse helpers. Season is read off `bestMonths` only.
 * Trip length is a travel-distance planning bucket from country/state
 * already on the record — not a recommended itinerary.
 */

const SEASON_MONTHS: Record<string, readonly string[]> = {
  spring: ["march", "mar", "april", "apr", "may"],
  summer: ["june", "jun", "july", "jul", "august", "aug"],
  fall: ["september", "sep", "sept", "october", "oct", "november", "nov"],
  winter: ["december", "dec", "january", "jan", "february", "feb"],
};

export type PlaceSeason = "spring" | "summer" | "fall" | "winter";
export type TripLength = "weekend" | "week" | "longer";

export function seasonsFromBestMonths(bestMonths: string[]): PlaceSeason[] {
  const set = new Set<PlaceSeason>();
  for (const month of bestMonths ?? []) {
    const key = month.trim().toLowerCase();
    if (!key) continue;
    (Object.entries(SEASON_MONTHS) as [PlaceSeason, readonly string[]][]).forEach(
      ([season, aliases]) => {
        if (aliases.includes(key)) set.add(season);
      },
    );
  }
  return [...set];
}

export function tripLengthFromPlace(place: {
  country: string;
  state?: string;
}): TripLength {
  const country = (place.country ?? "").trim();
  const state = (place.state ?? "").trim();
  const lower48 =
    country === "United States" &&
    state.length > 0 &&
    state !== "Alaska" &&
    state !== "Hawaii";
  if (lower48) return "weekend";
  if (country === "United States" || country === "Canada") return "week";
  return "longer";
}
