/**
 * Parse a YYYY-MM-DD date string as LOCAL midnight (not UTC).
 * Using `new Date("2023-08-23")` parses as UTC midnight, which shifts
 * to Aug 22 in Mountain Time. This fixes that globally.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  // If it already has a time component, parse normally
  if (dateStr.includes("T") || dateStr.includes(" ")) {
    return new Date(dateStr);
  }
  // YYYY-MM-DD — append local noon to avoid any timezone offset issues
  return new Date(dateStr + "T12:00:00");
}

export function formatDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
): string {
  return parseLocalDate(dateStr).toLocaleDateString("en-US", options);
}
