/** A row without a readable licence does not publish. */
export function mayPublish(input: {
  licence?: string | null;
  storagePath?: string | null;
  status?: string | null;
}): boolean {
  const licence = input.licence?.trim() ?? "";
  const path = input.storagePath?.trim() ?? "";
  if (!licence) return false;
  if (!path) return false;
  if (input.status === "flagged" || input.status === "unpublished") return false;
  return true;
}

export function publishStatus(input: {
  licence?: string | null;
  storagePath?: string | null;
}): "published" | "flagged" | "pending" {
  const licence = input.licence?.trim() ?? "";
  if (!licence) return "flagged";
  if (!input.storagePath?.trim()) return "pending";
  return "published";
}

export type LicenceKind = "unsplash" | "cc-by" | "cc-by-sa" | "pd" | "unknown";

/**
 * Classify a Commons / Unsplash licence string. Share-alike is checked
 * before plain BY so "CC BY-SA 4.0" is not treated as attribution-only.
 * NC / ND / unreadable strings stay unknown — do not migrate those.
 */
export function classifyLicence(licence: string | null | undefined): LicenceKind {
  const s = (licence ?? "").trim().toLowerCase();
  if (!s) return "unknown";
  if (s.includes("unsplash")) return "unsplash";
  if (
    s.includes("public domain") ||
    s.includes("cc0") ||
    s === "pd" ||
    s.includes("pdm") ||
    s.includes("no known copyright")
  ) {
    return "pd";
  }
  if (s.includes("by-nc") || s.includes("by nc") || s.includes("by-nd") || s.includes("by nd")) {
    return "unknown";
  }
  if (
    s.includes("by-sa") ||
    s.includes("by sa") ||
    s.includes("share alike") ||
    s.includes("sharealike")
  ) {
    return "cc-by-sa";
  }
  if (s.includes("cc by") || s.includes("cc-by") || s.startsWith("by ")) return "cc-by";
  return "unknown";
}

/** Credit must appear wherever we show the work. PD is courtesy, not required. */
export function attributionRequired(kind: LicenceKind): boolean {
  return kind === "cc-by" || kind === "cc-by-sa" || kind === "unsplash";
}

/** One-line credit for the hero chip. CC strings keep the licence name. */
export function formatAttribution(input: {
  creditName?: string | null;
  licence?: string | null;
}): string {
  const name = input.creditName?.trim() ?? "";
  const licence = input.licence?.trim() ?? "";
  const kind = classifyLicence(licence);
  if (kind === "pd") {
    return name ? `${name} (public domain)` : "Public domain";
  }
  if (kind === "unsplash") {
    return name && name.toLowerCase() !== "unsplash" ? `${name} / Unsplash` : "Unsplash";
  }
  if (kind === "cc-by" || kind === "cc-by-sa") {
    const short = licence.replace(/^Creative Commons\s+/i, "");
    return name ? `${name} · ${short}` : short;
  }
  if (name && licence) return `${name} · ${licence}`;
  return name || licence;
}

/**
 * One href for the existing credit chip. CC rows link the licence text;
 * Unsplash / PD link the author or source page.
 */
export function attributionHref(input: {
  creditUrl?: string | null;
  licenceUrl?: string | null;
  licence?: string | null;
}): string | undefined {
  const kind = classifyLicence(input.licence);
  const licenceUrl = input.licenceUrl?.trim() || undefined;
  const creditUrl = input.creditUrl?.trim() || undefined;
  if ((kind === "cc-by" || kind === "cc-by-sa") && licenceUrl) return licenceUrl;
  return creditUrl || licenceUrl;
}
