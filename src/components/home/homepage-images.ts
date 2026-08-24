/**
 * Homepage photograph identity.
 *
 * A source is the decoded `next/image` URL (or the raw `src` for unoptimized
 * `<img>`). The light/dark logo pair is allowed to repeat; every other
 * photograph on `/` must appear once.
 */
import { normalizeImageUrl } from "@/lib/media/image-url";

export const LOGO_PAIR = [
  "/images/logo-horizontal-white.svg",
  "/images/logo-horizontal-forest.svg",
] as const;

const LOGO_SET = new Set<string>(LOGO_PAIR);

export function isLogoSrc(src: string): boolean {
  const path = stripOrigin(src);
  return LOGO_SET.has(path) || [...LOGO_SET].some((logo) => path.endsWith(logo));
}

/** Pull the underlying asset URL out of a next/image optimizer `src`. */
export function canonicalImgSrc(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) return null;
  try {
    const url = new URL(trimmed, "https://www.executiveangler.com");
    if (url.pathname.includes("/_next/image")) {
      const inner = url.searchParams.get("url");
      if (!inner) return null;
      return canonicalImgSrc(inner);
    }
    if (url.pathname.startsWith("/_next/static")) return null;
    if (/\.(js|css|map)$/.test(url.pathname)) return null;
    const local =
      url.hostname === "www.executiveangler.com" ||
      url.hostname === "executiveangler.com" ||
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1";
    if (local) return url.pathname;
    url.search = "";
    url.hash = "";
    return url.href;
  } catch {
    const path = trimmed.split("?")[0];
    return path || null;
  }
}

export function collectCanonicalSources(rawSrcs: string[]): string[] {
  const out: string[] = [];
  for (const raw of rawSrcs) {
    const src = canonicalImgSrc(raw);
    if (src) out.push(src);
  }
  return out;
}

export type DuplicateReport = {
  ok: boolean;
  sources: string[];
  contentSources: string[];
  duplicates: string[];
};

export function reportDuplicateImages(rawSrcs: string[]): DuplicateReport {
  const sources = collectCanonicalSources(rawSrcs);
  const contentSources = sources.filter((src) => !isLogoSrc(src));
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const src of contentSources) {
    if (seen.has(src)) {
      if (!duplicates.includes(src)) duplicates.push(src);
    } else {
      seen.add(src);
    }
  }
  return {
    ok: duplicates.length === 0 && new Set(contentSources).size === contentSources.length,
    sources,
    contentSources,
    duplicates,
  };
}

/** Claim a URL so later homepage bands cannot reuse the photograph. */
export function claimImageUrl(
  url: string | null | undefined,
  used: Set<string>,
): string | undefined {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return undefined;
  if (used.has(normalized)) return undefined;
  used.add(normalized);
  return normalized;
}

export function imageAvailable(
  url: string | null | undefined,
  used: Set<string>,
): boolean {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return false;
  return !used.has(normalized);
}

function stripOrigin(src: string): string {
  try {
    const url = new URL(src, "https://www.executiveangler.com");
    return url.pathname;
  } catch {
    return src.split("?")[0];
  }
}
